import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Tool types and costs
const TOOL_CREDITS: Record<string, number> = {
  roadmap: 5,
  prd: 10,
  pitch_deck: 15,
  persona: 5,
  competitive_analysis: 10,
};

/**
 * Check if user has enough credits for a tool
 */
export const hasEnough = query({
  args: {
    clerkId: v.string(),
    toolType: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return false;
    }

    const cost = TOOL_CREDITS[args.toolType] ?? 0;
    return user.credits >= cost;
  },
});

/**
 * Deduct credits for using a tool (with transaction logging)
 */
export const deduct = mutation({
  args: {
    clerkId: v.string(),
    toolType: v.string(),
    generationId: v.optional(v.id("generations")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return { success: false, newBalance: 0, error: "User not found" };
    }

    const cost = TOOL_CREDITS[args.toolType] ?? 0;

    if (user.credits < cost) {
      return { success: false, newBalance: user.credits, error: "Insufficient credits" };
    }

    const newBalance = user.credits - cost;

    // Update user credits
    await ctx.db.patch(user._id, { credits: newBalance });

    // Record transaction
    await ctx.db.insert("creditTransactions", {
      userId: user._id,
      amount: -cost,
      type: "usage",
      toolType: args.toolType,
      generationId: args.generationId,
      description: `Used ${args.toolType} tool`,
    });

    return { success: true, newBalance };
  },
});

/**
 * Add credits to user account (with transaction logging)
 */
export const add = mutation({
  args: {
    clerkId: v.string(),
    amount: v.number(),
    type: v.union(
      v.literal("purchase"),
      v.literal("usage"),
      v.literal("bonus"),
      v.literal("refund"),
      v.literal("signup")
    ),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return { success: false, newBalance: 0, error: "User not found" };
    }

    const newBalance = user.credits + args.amount;

    // Update user credits
    await ctx.db.patch(user._id, { credits: newBalance });

    // Record transaction
    await ctx.db.insert("creditTransactions", {
      userId: user._id,
      amount: args.amount,
      type: args.type,
      description: args.description,
    });

    return { success: true, newBalance };
  },
});

/**
 * Get user's transaction history
 */
export const getTransactionHistory = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return [];
    }

    const limit = args.limit ?? 50;

    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    return transactions;
  },
});

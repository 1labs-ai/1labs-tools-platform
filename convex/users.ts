import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const INITIAL_CREDITS = 25;

/**
 * Get or create user profile by Clerk ID
 */
export const getOrCreateByClerkId = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to find existing user
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      return existing;
    }

    // Create new user with initial credits
    const userId = await ctx.db.insert("userProfiles", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      credits: INITIAL_CREDITS,
      plan: "free",
    });

    // Record signup bonus transaction
    await ctx.db.insert("creditTransactions", {
      userId,
      amount: INITIAL_CREDITS,
      type: "signup",
      description: "Welcome bonus credits",
    });

    return await ctx.db.get(userId);
  },
});

/**
 * Get user profile by Clerk ID
 */
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

/**
 * Get user's credit balance
 */
export const getCredits = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user?.credits ?? 0;
  },
});

/**
 * Update user's credits directly (use credits.add/deduct for tracked changes)
 */
export const updateCredits = mutation({
  args: {
    clerkId: v.string(),
    credits: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { credits: args.credits });
    return { success: true, newBalance: args.credits };
  },
});

/**
 * Update user's plan
 */
export const updatePlan = mutation({
  args: {
    clerkId: v.string(),
    plan: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("unlimited")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { plan: args.plan });
    return { success: true };
  },
});

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Save a generation
 */
export const save = mutation({
  args: {
    clerkId: v.string(),
    toolType: v.union(
      v.literal("roadmap"),
      v.literal("prd"),
      v.literal("pitch_deck"),
      v.literal("persona"),
      v.literal("competitive_analysis"),
      v.literal("user_stories"),
      v.literal("meeting_notes"),
      v.literal("release_notes"),
      v.literal("faq_generator"),
      v.literal("tech_spec"),
      v.literal("gtm")
    ),
    title: v.optional(v.string()),
    input: v.any(),
    output: v.any(),
    creditsUsed: v.number(),
  },
  handler: async (ctx, args) => {
    // Get user profile
    const user = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Insert generation
    const generationId = await ctx.db.insert("generations", {
      userId: user._id,
      toolType: args.toolType,
      title: args.title,
      input: args.input,
      output: args.output,
      creditsUsed: args.creditsUsed,
    });

    return { id: generationId };
  },
});

/**
 * List user's generations (with optional tool type filter)
 */
export const list = query({
  args: {
    clerkId: v.string(),
    toolType: v.optional(
      v.union(
        v.literal("roadmap"),
        v.literal("prd"),
        v.literal("pitch_deck"),
        v.literal("persona"),
        v.literal("competitive_analysis"),
        v.literal("user_stories"),
        v.literal("meeting_notes"),
        v.literal("release_notes"),
        v.literal("faq_generator")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get user profile
    const user = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return [];
    }

    const limit = args.limit ?? 50;

    // Get generations for this user
    let generations = await ctx.db
      .query("generations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    // Filter by tool type if specified
    if (args.toolType) {
      generations = generations.filter((g) => g.toolType === args.toolType);
    }

    return generations;
  },
});

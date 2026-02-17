import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles linked to Clerk
  userProfiles: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    credits: v.number(),
    plan: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("unlimited")
    ),
  }).index("by_clerk_id", ["clerkId"]),

  // Credit transactions for history
  creditTransactions: defineTable({
    userId: v.id("userProfiles"),
    amount: v.number(),
    type: v.union(
      v.literal("purchase"),
      v.literal("usage"),
      v.literal("bonus"),
      v.literal("refund"),
      v.literal("signup")
    ),
    description: v.optional(v.string()),
    toolType: v.optional(v.string()),
    generationId: v.optional(v.id("generations")),
  }).index("by_user", ["userId"]),

  // AI generations saved
  generations: defineTable({
    userId: v.id("userProfiles"),
    toolType: v.union(
      v.literal("roadmap"),
      v.literal("prd"),
      v.literal("pitch_deck"),
      v.literal("persona"),
      v.literal("competitive_analysis")
    ),
    title: v.optional(v.string()),
    input: v.any(),
    output: v.any(),
    creditsUsed: v.number(),
  }).index("by_user", ["userId"]),

  // API keys for programmatic access
  apiKeys: defineTable({
    userId: v.id("userProfiles"),
    name: v.string(),
    keyPrefix: v.string(),
    keyHash: v.string(),
    lastUsedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]).index("by_key_hash", ["keyHash"]),
});

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new API key for a user
 * Note: The actual key generation and hashing happens client-side in lib/api-keys.ts
 */
export const create = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    keyPrefix: v.string(),
    keyHash: v.string(),
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

    // Insert API key
    const keyId = await ctx.db.insert("apiKeys", {
      userId: user._id,
      name: args.name.trim(),
      keyPrefix: args.keyPrefix,
      keyHash: args.keyHash,
    });

    const key = await ctx.db.get(keyId);
    return key;
  },
});

/**
 * List all API keys for a user (without the full key)
 */
export const list = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Get user profile
    const user = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return [];
    }

    // Get all non-revoked API keys
    const keys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Filter out revoked keys
    return keys.filter((key) => !key.revokedAt);
  },
});

/**
 * Revoke (soft delete) an API key
 */
export const revoke = mutation({
  args: {
    clerkId: v.string(),
    keyId: v.id("apiKeys"),
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

    // Get the API key
    const key = await ctx.db.get(args.keyId);

    if (!key) {
      throw new Error("API key not found");
    }

    // Verify ownership
    if (key.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Revoke the key
    await ctx.db.patch(args.keyId, { revokedAt: Date.now() });

    return { success: true };
  },
});

/**
 * Validate an API key by its hash and return user info
 */
export const validateByHash = query({
  args: { keyHash: v.string() },
  handler: async (ctx, args) => {
    // Find key by hash
    const key = await ctx.db
      .query("apiKeys")
      .withIndex("by_key_hash", (q) => q.eq("keyHash", args.keyHash))
      .unique();

    if (!key || key.revokedAt) {
      return { valid: false };
    }

    // Get the user
    const user = await ctx.db.get(key.userId);

    if (!user) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: key.userId,
      clerkId: user.clerkId,
      keyId: key._id,
      keyName: key.name,
    };
  },
});

/**
 * Update the last used timestamp for an API key
 */
export const updateLastUsed = mutation({
  args: { keyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    const key = await ctx.db.get(args.keyId);

    if (!key) {
      return { success: false };
    }

    await ctx.db.patch(args.keyId, { lastUsedAt: Date.now() });

    return { success: true };
  },
});

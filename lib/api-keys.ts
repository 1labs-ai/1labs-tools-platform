import * as crypto from "crypto";
import { convex, isConvexConfigured } from "./convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// API Key Types
export interface ApiKey {
  _id: Id<"apiKeys">;
  _creationTime: number;
  userId: Id<"userProfiles">;
  name: string;
  keyPrefix: string;
  keyHash: string;
  lastUsedAt?: number;
  revokedAt?: number;
}

export interface ApiKeyCreateResult {
  apiKey: ApiKey;
  fullKey: string; // Only returned once at creation
}

/**
 * Generate a new API key with the 1labs_ prefix
 * Format: 1labs_<64 hex characters>
 */
export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(32);
  return `1labs_${randomBytes.toString("hex")}`;
}

/**
 * Extract the prefix from an API key (first 12 chars)
 * e.g., "1labs_abc123..." returns "1labs_abc1..."
 */
export function extractKeyPrefix(fullKey: string): string {
  const prefix = fullKey.substring(0, 12);
  return `${prefix}...`;
}

/**
 * Hash an API key using SHA-256 for secure storage
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Validate an API key format (does not check database)
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  // Must start with 1labs_ and have at least 32 chars total
  return /^1labs_[a-f0-9]{64}$/.test(apiKey);
}

/**
 * Create a new API key for a user
 */
export async function createApiKey(
  clerkId: string,
  name: string
): Promise<{ apiKey: string; keyData: Partial<ApiKey> } | { error: string }> {
  if (!isConvexConfigured()) {
    const fullKey = generateApiKey();
    const keyPrefix = extractKeyPrefix(fullKey);
    return {
      apiKey: fullKey,
      keyData: {
        _id: "mock-key-id" as Id<"apiKeys">,
        _creationTime: Date.now(),
        name,
        keyPrefix,
      },
    };
  }

  try {
    const fullKey = generateApiKey();
    const keyPrefix = extractKeyPrefix(fullKey);
    const keyHash = hashApiKey(fullKey);

    const keyRecord = await convex.mutation(api.apiKeys.create, {
      clerkId,
      name,
      keyPrefix,
      keyHash,
    });

    return {
      apiKey: fullKey,
      keyData: keyRecord as Partial<ApiKey>,
    };
  } catch (error) {
    return { error: `Failed to create API key: ${(error as Error).message}` };
  }
}

/**
 * List all API keys for a user (without the full key)
 */
export async function listApiKeys(clerkId: string): Promise<Partial<ApiKey>[]> {
  if (!isConvexConfigured()) {
    return [];
  }

  return await convex.query(api.apiKeys.list, { clerkId });
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(
  clerkId: string,
  keyId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isConvexConfigured()) {
    return { success: true };
  }

  try {
    await convex.mutation(api.apiKeys.revoke, {
      clerkId,
      keyId: keyId as Id<"apiKeys">,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Validate an API key and return user info
 */
export async function validateApiKey(apiKey: string): Promise<{
  valid: boolean;
  userId?: string;
  clerkId?: string;
  keyId?: string;
  keyName?: string;
}> {
  if (!isConvexConfigured()) {
    return { valid: false };
  }

  if (!isValidApiKeyFormat(apiKey)) {
    return { valid: false };
  }

  const keyHash = hashApiKey(apiKey);

  const result = await convex.query(api.apiKeys.validateByHash, { keyHash });

  if (!result.valid) {
    return { valid: false };
  }

  // Update last_used_at (fire and forget)
  if (result.keyId) {
    convex.mutation(api.apiKeys.updateLastUsed, { keyId: result.keyId }).catch(() => {
      // Ignore errors from updating last used
    });
  }

  return {
    valid: true,
    userId: result.userId?.toString(),
    clerkId: result.clerkId,
    keyId: result.keyId?.toString(),
    keyName: result.keyName,
  };
}

/**
 * Get API key by ID (for the owner only)
 * Note: In Convex, we'd need to add this query if needed.
 * For now, use list and filter.
 */
export async function getApiKeyById(
  clerkId: string,
  keyId: string
): Promise<ApiKey | null> {
  if (!isConvexConfigured()) {
    return null;
  }

  const keys = await listApiKeys(clerkId);
  const key = keys.find((k) => k._id?.toString() === keyId);
  return (key as ApiKey) || null;
}

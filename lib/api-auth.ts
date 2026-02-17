import { hashApiKey, isValidApiKeyFormat } from "./api-keys";
import { convex, isConvexConfigured } from "./convex";
import { api } from "@/convex/_generated/api";

export interface ApiKeyValidation {
  valid: boolean;
  userId?: string;
  clerkId?: string;
  keyId?: string;
  error?: string;
}

/**
 * Validate an API key from the Authorization header
 */
export async function validateApiKey(authHeader: string | null): Promise<ApiKeyValidation> {
  if (!authHeader) {
    return { valid: false, error: "Missing Authorization header" };
  }

  // Extract Bearer token
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return { valid: false, error: "Invalid Authorization format. Use: Bearer <api_key>" };
  }

  const apiKey = match[1];

  // Check format
  if (!apiKey.startsWith("1labs_")) {
    return { valid: false, error: "Invalid API key format" };
  }

  // Mock mode for development
  if (!isConvexConfigured()) {
    return {
      valid: true,
      userId: "mock-user-id",
      clerkId: "mock-clerk-id",
      keyId: "mock-key-id",
    };
  }

  // Validate full format
  if (!isValidApiKeyFormat(apiKey)) {
    return { valid: false, error: "Invalid API key format" };
  }

  const keyHash = hashApiKey(apiKey);

  // Validate against database
  const result = await convex.query(api.apiKeys.validateByHash, { keyHash });

  if (!result.valid) {
    return { valid: false, error: "Invalid API key" };
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
  };
}

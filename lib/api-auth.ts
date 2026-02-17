import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import { createHash, randomBytes } from 'crypto';

export interface ApiKey {
  id: string;
  user_id: string;
  clerk_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

export interface ApiKeyValidation {
  valid: boolean;
  userId?: string;
  clerkId?: string;
  keyId?: string;
  error?: string;
}

/**
 * Hash an API key for storage
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Generate a new API key
 */
export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = `1labs_${randomBytes(32).toString('hex')}`;
  const prefix = key.slice(0, 12);
  const hash = hashApiKey(key);
  return { key, prefix, hash };
}

/**
 * Validate an API key from the Authorization header
 */
export async function validateApiKey(authHeader: string | null): Promise<ApiKeyValidation> {
  if (!authHeader) {
    return { valid: false, error: 'Missing Authorization header' };
  }

  // Extract Bearer token
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return { valid: false, error: 'Invalid Authorization format. Use: Bearer <api_key>' };
  }

  const apiKey = match[1];

  // Check format
  if (!apiKey.startsWith('1labs_')) {
    return { valid: false, error: 'Invalid API key format' };
  }

  // Mock mode for development
  if (!isSupabaseConfigured()) {
    return {
      valid: true,
      userId: 'mock-user-id',
      clerkId: 'mock-clerk-id',
      keyId: 'mock-key-id',
    };
  }

  const keyHash = hashApiKey(apiKey);

  // Look up the API key
  const { data: keyRecord, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, user_id, clerk_id, revoked_at')
    .eq('key_hash', keyHash)
    .single();

  if (error || !keyRecord) {
    return { valid: false, error: 'Invalid API key' };
  }

  if (keyRecord.revoked_at) {
    return { valid: false, error: 'API key has been revoked' };
  }

  // Update last_used_at
  await supabaseAdmin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyRecord.id);

  return {
    valid: true,
    userId: keyRecord.user_id,
    clerkId: keyRecord.clerk_id,
    keyId: keyRecord.id,
  };
}

/**
 * Create a new API key for a user
 */
export async function createApiKey(
  clerkId: string,
  name: string
): Promise<{ apiKey: string; keyData: Partial<ApiKey> } | { error: string }> {
  if (!isSupabaseConfigured()) {
    const { key, prefix } = generateApiKey();
    return {
      apiKey: key,
      keyData: {
        id: 'mock-key-id',
        clerk_id: clerkId,
        name,
        key_prefix: prefix,
        created_at: new Date().toISOString(),
      },
    };
  }

  // Get user profile
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (!profile) {
    return { error: 'User not found' };
  }

  const { key, prefix, hash } = generateApiKey();

  const { data: keyRecord, error } = await supabaseAdmin
    .from('api_keys')
    .insert({
      user_id: (profile as { id: string }).id,
      clerk_id: clerkId,
      name,
      key_hash: hash,
      key_prefix: prefix,
    })
    .select('id, clerk_id, name, key_prefix, created_at')
    .single();

  if (error) {
    return { error: `Failed to create API key: ${error.message}` };
  }

  return {
    apiKey: key,
    keyData: keyRecord as Partial<ApiKey>,
  };
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(
  clerkId: string,
  keyId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const { error } = await supabaseAdmin
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', keyId)
    .eq('clerk_id', clerkId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * List user's API keys (without sensitive data)
 */
export async function listApiKeys(clerkId: string): Promise<Partial<ApiKey>[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data } = await supabaseAdmin
    .from('api_keys')
    .select('id, name, key_prefix, last_used_at, created_at, revoked_at')
    .eq('clerk_id', clerkId)
    .is('revoked_at', null)
    .order('created_at', { ascending: false });

  return (data ?? []) as Partial<ApiKey>[];
}

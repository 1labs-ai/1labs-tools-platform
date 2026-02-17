import * as crypto from 'crypto';
import { supabaseAdmin, isSupabaseConfigured } from './supabase';

// API Key Types
export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export interface ApiKeyCreateResult {
  apiKey: ApiKey;
  fullKey: string; // Only returned once at creation
}

/**
 * Generate a new API key with the 1lab_sk_ prefix
 * Format: 1lab_sk_<32 random characters>
 */
export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(24);
  const randomString = randomBytes.toString('base64url');
  return `1lab_sk_${randomString}`;
}

/**
 * Extract the prefix from an API key (first 12 chars after the prefix)
 * e.g., "1lab_sk_abc123..." returns "1lab_sk_abc1..."
 */
export function extractKeyPrefix(fullKey: string): string {
  // Take the prefix + first 8 chars of the random part
  const prefix = fullKey.substring(0, 16);
  return `${prefix}...`;
}

/**
 * Hash an API key using SHA-256 for secure storage
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Validate an API key format (does not check database)
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  // Must start with 1lab_sk_ and have at least 32 chars total
  return /^1lab_sk_[A-Za-z0-9_-]{24,}$/.test(apiKey);
}

/**
 * Create a new API key for a user
 */
export async function createApiKey(
  userId: string, 
  name: string
): Promise<ApiKeyCreateResult> {
  if (!isSupabaseConfigured()) {
    throw new Error('Database not configured');
  }

  const fullKey = generateApiKey();
  const keyHash = hashApiKey(fullKey);
  const keyPrefix = extractKeyPrefix(fullKey);

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .insert({
      user_id: userId,
      name: name.trim(),
      key_prefix: keyPrefix,
      key_hash: keyHash,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating API key:', error);
    throw new Error('Failed to create API key');
  }

  return {
    apiKey: data as ApiKey,
    fullKey, // Return full key only once
  };
}

/**
 * List all API keys for a user (without the full key)
 */
export async function listApiKeys(userId: string): Promise<ApiKey[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Database not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .is('revoked_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing API keys:', error);
    throw new Error('Failed to list API keys');
  }

  return data as ApiKey[];
}

/**
 * Revoke (soft delete) an API key
 */
export async function revokeApiKey(
  userId: string, 
  keyId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    throw new Error('Database not configured');
  }

  const { error } = await supabaseAdmin
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', keyId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error revoking API key:', error);
    throw new Error('Failed to revoke API key');
  }

  return true;
}

/**
 * Validate an API key and return the associated user info
 * Updates last_used_at timestamp
 */
export async function validateApiKey(apiKey: string): Promise<{
  valid: boolean;
  userId?: string;
  keyId?: string;
  keyName?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { valid: false };
  }

  if (!isValidApiKeyFormat(apiKey)) {
    return { valid: false };
  }

  const keyHash = hashApiKey(apiKey);

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, user_id, name')
    .eq('key_hash', keyHash)
    .is('revoked_at', null)
    .single();

  if (error || !data) {
    return { valid: false };
  }

  // Update last_used_at
  await supabaseAdmin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id);

  return {
    valid: true,
    userId: data.user_id,
    keyId: data.id,
    keyName: data.name,
  };
}

/**
 * Get API key by ID (for the owner only)
 */
export async function getApiKeyById(
  userId: string, 
  keyId: string
): Promise<ApiKey | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('*')
    .eq('id', keyId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as ApiKey;
}

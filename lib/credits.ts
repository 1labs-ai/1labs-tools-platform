import { supabaseAdmin, isSupabaseConfigured } from './supabase';

// Tool types
export type ToolType = 'roadmap' | 'prd' | 'pitch_deck' | 'persona' | 'competitive_analysis';
export type TransactionType = 'purchase' | 'usage' | 'bonus' | 'refund' | 'signup';

// User profile interface
export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string | null;
  name: string | null;
  credits: number;
  plan: 'free' | 'starter' | 'pro' | 'unlimited';
  created_at: string;
  updated_at: string;
}

// Credit costs per tool
export const TOOL_CREDITS: Record<ToolType, number> = {
  roadmap: 5,
  prd: 10,
  pitch_deck: 15,
  persona: 5,
  competitive_analysis: 10,
};

// Initial credits for new users
export const INITIAL_CREDITS = 25;

/**
 * Get or create user profile by Clerk ID
 */
export async function getOrCreateUserProfile(
  clerkId: string, 
  email?: string, 
  name?: string
): Promise<UserProfile> {
  // If Supabase is not configured, return mock data
  if (!isSupabaseConfigured()) {
    return {
      id: 'mock-id',
      clerk_id: clerkId,
      email: email || null,
      name: name || null,
      credits: INITIAL_CREDITS,
      plan: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Try to get existing profile
  const { data: existingProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (existingProfile) {
    return existingProfile as UserProfile;
  }

  // Create new profile with initial credits
  const { data: newProfile, error } = await supabaseAdmin
    .from('user_profiles')
    .insert({
      clerk_id: clerkId,
      email,
      name,
      credits: INITIAL_CREDITS,
      plan: 'free',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user profile: ${error.message}`);
  }

  // Record the signup bonus transaction
  await supabaseAdmin.from('credit_transactions').insert({
    user_id: (newProfile as UserProfile).id,
    amount: INITIAL_CREDITS,
    type: 'signup',
    description: 'Welcome bonus credits',
  });

  return newProfile as UserProfile;
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(clerkId: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    return INITIAL_CREDITS;
  }

  const { data } = await supabaseAdmin
    .from('user_profiles')
    .select('credits')
    .eq('clerk_id', clerkId)
    .single();

  return (data as { credits: number } | null)?.credits ?? 0;
}

/**
 * Check if user has enough credits for a tool
 */
export async function hasEnoughCredits(clerkId: string, toolType: ToolType): Promise<boolean> {
  const credits = await getUserCredits(clerkId);
  return credits >= TOOL_CREDITS[toolType];
}

/**
 * Deduct credits for using a tool
 */
export async function deductCredits(
  clerkId: string,
  toolType: ToolType,
  generationId?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true, newBalance: INITIAL_CREDITS - TOOL_CREDITS[toolType] };
  }

  const cost = TOOL_CREDITS[toolType];
  
  // Get current profile
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id, credits')
    .eq('clerk_id', clerkId)
    .single();

  const typedProfile = profile as { id: string; credits: number } | null;

  if (!typedProfile) {
    return { success: false, newBalance: 0, error: 'User not found' };
  }

  if (typedProfile.credits < cost) {
    return { success: false, newBalance: typedProfile.credits, error: 'Insufficient credits' };
  }

  const newBalance = typedProfile.credits - cost;

  // Update credits
  const { error: updateError } = await supabaseAdmin
    .from('user_profiles')
    .update({ credits: newBalance, updated_at: new Date().toISOString() })
    .eq('clerk_id', clerkId);

  if (updateError) {
    return { success: false, newBalance: typedProfile.credits, error: updateError.message };
  }

  // Record transaction
  await supabaseAdmin.from('credit_transactions').insert({
    user_id: typedProfile.id,
    amount: -cost,
    type: 'usage',
    tool_type: toolType,
    generation_id: generationId,
    description: `Used ${toolType} tool`,
  });

  return { success: true, newBalance };
}

/**
 * Add credits to user account
 */
export async function addCredits(
  clerkId: string,
  amount: number,
  type: TransactionType,
  description?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true, newBalance: INITIAL_CREDITS + amount };
  }

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id, credits')
    .eq('clerk_id', clerkId)
    .single();

  const typedProfile = profile as { id: string; credits: number } | null;

  if (!typedProfile) {
    return { success: false, newBalance: 0, error: 'User not found' };
  }

  const newBalance = typedProfile.credits + amount;

  const { error: updateError } = await supabaseAdmin
    .from('user_profiles')
    .update({ credits: newBalance, updated_at: new Date().toISOString() })
    .eq('clerk_id', clerkId);

  if (updateError) {
    return { success: false, newBalance: typedProfile.credits, error: updateError.message };
  }

  // Record transaction
  await supabaseAdmin.from('credit_transactions').insert({
    user_id: typedProfile.id,
    amount,
    type,
    description,
  });

  return { success: true, newBalance };
}

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(clerkId: string, limit = 50) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (!profile) return [];

  const { data } = await supabaseAdmin
    .from('credit_transactions')
    .select('*')
    .eq('user_id', (profile as { id: string }).id)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data ?? [];
}

/**
 * Get user's generation history
 */
export async function getGenerationHistory(clerkId: string, limit = 50, toolType?: ToolType) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (!profile) return [];

  let query = supabaseAdmin
    .from('generations')
    .select('*')
    .eq('user_id', (profile as { id: string }).id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (toolType) {
    query = query.eq('tool_type', toolType);
  }

  const { data } = await query;
  return data ?? [];
}

/**
 * Save a generation
 */
export async function saveGeneration(
  clerkId: string,
  toolType: ToolType,
  title: string | null,
  input: Record<string, unknown>,
  output: Record<string, unknown>,
  creditsUsed: number
) {
  if (!isSupabaseConfigured()) {
    return { id: 'mock-generation-id' };
  }

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (!profile) {
    throw new Error('User not found');
  }

  const { data, error } = await supabaseAdmin
    .from('generations')
    .insert({
      user_id: (profile as { id: string }).id,
      tool_type: toolType,
      title,
      input,
      output,
      credits_used: creditsUsed,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save generation: ${error.message}`);
  }

  return data;
}

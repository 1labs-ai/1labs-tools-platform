import { convex, isConvexConfigured } from "./convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Tool types
export type ToolType = "roadmap" | "pitch_deck" | "persona" | "competitive_analysis";
export type TransactionType = "purchase" | "usage" | "bonus" | "refund" | "signup";

// User profile interface (matches Convex schema)
export interface UserProfile {
  _id: Id<"userProfiles">;
  _creationTime: number;
  clerkId: string;
  email?: string;
  name?: string;
  credits: number;
  plan: "free" | "starter" | "pro" | "unlimited";
}

// Credit costs per tool
export const TOOL_CREDITS: Record<ToolType, number> = {
  roadmap: 5,
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
  // If Convex is not configured, return mock data
  if (!isConvexConfigured()) {
    return {
      _id: "mock-id" as Id<"userProfiles">,
      _creationTime: Date.now(),
      clerkId,
      email: email || undefined,
      name: name || undefined,
      credits: INITIAL_CREDITS,
      plan: "free",
    };
  }

  const profile = await convex.mutation(api.users.getOrCreateByClerkId, {
    clerkId,
    email,
    name,
  });

  return profile as UserProfile;
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(clerkId: string): Promise<number> {
  if (!isConvexConfigured()) {
    return INITIAL_CREDITS;
  }

  return await convex.query(api.users.getCredits, { clerkId });
}

/**
 * Check if user has enough credits for a tool
 */
export async function hasEnoughCredits(clerkId: string, toolType: ToolType): Promise<boolean> {
  if (!isConvexConfigured()) {
    return true;
  }

  return await convex.query(api.credits.hasEnough, { clerkId, toolType });
}

/**
 * Deduct credits for using a tool
 */
export async function deductCredits(
  clerkId: string,
  toolType: ToolType,
  generationId?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  if (!isConvexConfigured()) {
    return { success: true, newBalance: INITIAL_CREDITS - TOOL_CREDITS[toolType] };
  }

  return await convex.mutation(api.credits.deduct, {
    clerkId,
    toolType,
    generationId: generationId as Id<"generations"> | undefined,
  });
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
  if (!isConvexConfigured()) {
    return { success: true, newBalance: INITIAL_CREDITS + amount };
  }

  return await convex.mutation(api.credits.add, {
    clerkId,
    amount,
    type,
    description,
  });
}

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(clerkId: string, limit = 50) {
  if (!isConvexConfigured()) {
    return [];
  }

  return await convex.query(api.credits.getTransactionHistory, { clerkId, limit });
}

/**
 * Get user's generation history
 */
export async function getGenerationHistory(clerkId: string, limit = 50, toolType?: ToolType) {
  if (!isConvexConfigured()) {
    return [];
  }

  return await convex.query(api.generations.list, { clerkId, toolType, limit });
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
): Promise<{ id: string }> {
  if (!isConvexConfigured()) {
    return { id: "mock-generation-id" };
  }

  const result = await convex.mutation(api.generations.save, {
    clerkId,
    toolType,
    title: title || undefined,
    input,
    output,
    creditsUsed,
  });
  return { id: result.id.toString() };
}

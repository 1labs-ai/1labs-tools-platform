import { convex, isConvexConfigured } from "./convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { 
  TOOL_CREDITS, 
  AGENT_CREDITS,
  type ToolType, 
  type AgentType,
  type PlanType,
  isUnlimitedPlan,
  getToolCost,
  getAgentCost,
  LOW_CREDIT_THRESHOLD,
  isLowCredits as checkLowCredits,
} from "./billing";

// Re-export for backward compatibility
export { TOOL_CREDITS, AGENT_CREDITS, LOW_CREDIT_THRESHOLD };
export type { ToolType, AgentType, PlanType };

export type TransactionType = "purchase" | "usage" | "bonus" | "refund" | "signup";

// User profile interface (matches Convex schema)
export interface UserProfile {
  _id: Id<"userProfiles">;
  _creationTime: number;
  clerkId: string;
  email?: string;
  name?: string;
  credits: number;
  plan: PlanType;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// Transaction interface
export interface CreditTransaction {
  _id: Id<"creditTransactions">;
  _creationTime: number;
  userId: Id<"userProfiles">;
  amount: number;
  type: TransactionType;
  description?: string;
  toolType?: string;
  generationId?: Id<"generations">;
}

// Generation interface
export interface Generation {
  _id: Id<"generations">;
  _creationTime: number;
  userId: Id<"userProfiles">;
  toolType: string;
  title?: string;
  input: unknown;
  output: unknown;
  creditsUsed: number;
}

// Initial credits for new users
export const INITIAL_CREDITS = 50; // Free plan gets 50 credits

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
 * Get user's current plan
 */
export async function getUserPlan(clerkId: string): Promise<PlanType> {
  if (!isConvexConfigured()) {
    return "free";
  }

  const profile = await convex.query(api.users.getProfile, { clerkId });
  return (profile?.plan as PlanType) || "free";
}

/**
 * Check if user has enough credits for a tool
 */
export async function hasEnoughCredits(
  clerkId: string, 
  toolType: ToolType
): Promise<boolean> {
  if (!isConvexConfigured()) {
    return true;
  }

  const profile = await convex.query(api.users.getProfile, { clerkId });
  
  if (!profile) return false;
  
  // Unlimited plan always has enough
  if (isUnlimitedPlan(profile.plan as PlanType)) return true;
  
  const cost = getToolCost(toolType);
  return profile.credits >= cost;
}

/**
 * Check if user has enough credits for an agent
 */
export async function hasEnoughCreditsForAgent(
  clerkId: string, 
  agentType: AgentType
): Promise<boolean> {
  if (!isConvexConfigured()) {
    return true;
  }

  const profile = await convex.query(api.users.getProfile, { clerkId });
  
  if (!profile) return false;
  
  // Unlimited plan always has enough
  if (isUnlimitedPlan(profile.plan as PlanType)) return true;
  
  const cost = getAgentCost(agentType);
  return profile.credits >= cost;
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
    return { success: true, newBalance: INITIAL_CREDITS - getToolCost(toolType) };
  }

  return await convex.mutation(api.credits.deduct, {
    clerkId,
    toolType,
    generationId: generationId as Id<"generations"> | undefined,
  });
}

/**
 * Deduct credits for using an agent
 * Note: This calls the standard deduct mutation with agent cost
 */
export async function deductAgentCredits(
  clerkId: string,
  agentType: AgentType,
  _sessionId?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  if (!isConvexConfigured()) {
    return { success: true, newBalance: INITIAL_CREDITS - getAgentCost(agentType) };
  }

  // Use standard deduct with agent cost
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await convex.mutation(api.credits.deduct as any, {
    clerkId,
    toolType: agentType,
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
export async function getTransactionHistory(
  clerkId: string, 
  limit = 50
): Promise<CreditTransaction[]> {
  if (!isConvexConfigured()) {
    return [];
  }

  const transactions = await convex.query(api.credits.getTransactionHistory, { 
    clerkId, 
    limit 
  });
  return transactions as CreditTransaction[];
}

/**
 * Get user's generation history
 */
export async function getGenerationHistory(
  clerkId: string, 
  limit = 50, 
  toolType?: string
): Promise<Generation[]> {
  if (!isConvexConfigured()) {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generations = await convex.query(api.generations.list, { 
    clerkId, 
    toolType: toolType as any, 
    limit 
  });
  return generations as Generation[];
}

/**
 * Save a generation
 */
export async function saveGeneration(
  clerkId: string,
  toolType: string,
  title: string | null,
  input: Record<string, unknown>,
  output: Record<string, unknown>,
  creditsUsed: number
): Promise<{ id: string }> {
  if (!isConvexConfigured()) {
    return { id: "mock-generation-id" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await convex.mutation(api.generations.save, {
    clerkId,
    toolType: toolType as any,
    title: title || undefined,
    input,
    output,
    creditsUsed,
  });
  return { id: result.id.toString() };
}

/**
 * Get usage summary for a user
 */
export async function getUsageSummary(clerkId: string): Promise<{
  totalCreditsUsed: number;
  totalPurchased: number;
  generationCount: number;
  byTool: Record<string, { count: number; credits: number }>;
}> {
  if (!isConvexConfigured()) {
    return {
      totalCreditsUsed: 0,
      totalPurchased: 0,
      generationCount: 0,
      byTool: {},
    };
  }

  const transactions = await getTransactionHistory(clerkId, 1000);
  
  const summary = {
    totalCreditsUsed: 0,
    totalPurchased: 0,
    generationCount: 0,
    byTool: {} as Record<string, { count: number; credits: number }>,
  };

  for (const tx of transactions) {
    if (tx.type === "usage") {
      summary.totalCreditsUsed += Math.abs(tx.amount);
      if (tx.toolType) {
        if (!summary.byTool[tx.toolType]) {
          summary.byTool[tx.toolType] = { count: 0, credits: 0 };
        }
        summary.byTool[tx.toolType].count += 1;
        summary.byTool[tx.toolType].credits += Math.abs(tx.amount);
      }
    } else if (tx.type === "purchase" || tx.type === "bonus") {
      summary.totalPurchased += tx.amount;
    }
  }

  summary.generationCount = Object.values(summary.byTool).reduce(
    (sum, tool) => sum + tool.count, 
    0
  );

  return summary;
}

/**
 * Check if user's credits are low
 */
export async function isUserLowCredits(clerkId: string): Promise<boolean> {
  if (!isConvexConfigured()) {
    return false;
  }

  const profile = await convex.query(api.users.getProfile, { clerkId });
  if (!profile) return false;
  
  return checkLowCredits(profile.credits, profile.plan as PlanType);
}

/**
 * Get credit cost for a specific tool
 */
export function getCreditCost(toolType: string): number {
  return getToolCost(toolType);
}

/**
 * Get credit cost for a specific agent
 */
export function getAgentCreditCost(agentType: string): number {
  return getAgentCost(agentType);
}

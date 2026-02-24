/**
 * Unified Billing Configuration for 1Labs Platforms
 * 1 credit = $0.10 value
 */

// ============================================
// CREDIT PACKAGES (One-Time Purchase)
// ============================================
export const CREDIT_PACKAGES = {
  starter: {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    bonusCredits: 10, // 10% bonus
    totalCredits: 110,
    price: 900, // $9.00 in cents
    priceDisplay: '$9',
    savings: '10% bonus',
    description: 'Great for occasional use',
    type: 'one_time' as const,
  },
  growth: {
    id: 'growth',
    name: 'Growth Pack',
    credits: 500,
    bonusCredits: 110, // 22% bonus
    totalCredits: 610,
    price: 3900, // $39.00 in cents
    priceDisplay: '$39',
    savings: '22% bonus',
    description: 'Best value for power users',
    type: 'one_time' as const,
    popular: true,
  },
  scale: {
    id: 'scale',
    name: 'Scale Pack',
    credits: 2000,
    bonusCredits: 500, // 25% bonus
    totalCredits: 2500,
    price: 14900, // $149.00 in cents
    priceDisplay: '$149',
    savings: '25% bonus',
    description: 'For teams and heavy users',
    type: 'one_time' as const,
  },
} as const;

// ============================================
// SUBSCRIPTION PLANS (Monthly)
// ============================================
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    creditsPerMonth: 50,
    price: 0,
    priceDisplay: '$0',
    description: 'Perfect for trying out our tools',
    features: [
      '50 credits/month',
      'Access to all tools',
      'Community support',
    ],
    type: 'subscription' as const,
    stripePriceId: null, // No Stripe price for free
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    creditsPerMonth: 500,
    price: 2900, // $29.00/month in cents
    priceDisplay: '$29/mo',
    description: 'For power users',
    features: [
      '500 credits/month',
      'Access to all tools',
      'Priority support',
      'Credits roll over (up to 1000)',
      'Early access to new features',
    ],
    type: 'subscription' as const,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || null,
    popular: true,
  },
  team: {
    id: 'team',
    name: 'Team',
    creditsPerMonth: 2500,
    price: 9900, // $99.00/month in cents
    priceDisplay: '$99/mo',
    description: 'For teams and agencies',
    features: [
      '2,500 credits/month',
      'Access to all tools',
      'Priority support',
      'Credits roll over (up to 5000)',
      'Team collaboration (coming soon)',
      'Custom integrations',
    ],
    type: 'subscription' as const,
    stripePriceId: process.env.STRIPE_TEAM_PRICE_ID || null,
  },
  unlimited: {
    id: 'unlimited',
    name: 'Unlimited',
    creditsPerMonth: -1, // -1 = unlimited
    price: 29900, // $299.00/month in cents
    priceDisplay: '$299/mo',
    description: 'Unlimited access for enterprises',
    features: [
      'Unlimited credits',
      'Access to all tools',
      'Dedicated support',
      'Custom agent training',
      'API access',
      'SLA guarantee',
    ],
    type: 'subscription' as const,
    stripePriceId: process.env.STRIPE_UNLIMITED_PRICE_ID || null,
  },
} as const;

// ============================================
// TOOL CREDIT COSTS (5-20 credits per use)
// ============================================
export const TOOL_CREDITS = {
  // Basic tools - 5 credits
  roadmap: 5,
  persona: 5,
  user_stories: 5,
  meeting_notes: 5,
  release_notes: 5,
  faq_generator: 5,
  
  // Standard tools - 10 credits
  competitive_analysis: 10,
  prd: 10,
  
  // Premium tools - 15-20 credits
  pitch_deck: 15,
  tech_spec: 15,
  gtm: 20,
} as const;

// ============================================
// AGENT CREDIT COSTS (50-500 credits per task)
// ============================================
export const AGENT_CREDITS = {
  // Basic agents - 50 credits
  prd_agent: 50,
  roadmap_agent: 50,
  
  // Standard agents - 100 credits
  research_agent: 100,
  competitor_agent: 100,
  
  // Advanced agents - 200 credits
  pitch_agent: 200,
  tech_spec_agent: 200,
  
  // Premium agents - 500 credits
  full_product_agent: 500,
  gtm_agent: 500,
} as const;

// Hourly agent rate: 100 credits/hour
export const AGENT_HOURLY_RATE = 100;

// ============================================
// TYPE DEFINITIONS
// ============================================
export type CreditPackageId = keyof typeof CREDIT_PACKAGES;
export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;
export type ToolType = keyof typeof TOOL_CREDITS;
export type AgentType = keyof typeof AGENT_CREDITS;

export type PlanType = 'free' | 'starter' | 'pro' | 'team' | 'unlimited';

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  bonusCredits: number;
  totalCredits: number;
  price: number;
  priceDisplay: string;
  savings: string;
  description: string;
  type: 'one_time';
  popular?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  creditsPerMonth: number;
  price: number;
  priceDisplay: string;
  description: string;
  features: readonly string[];
  type: 'subscription';
  stripePriceId: string | null;
  popular?: boolean;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get credit package by ID
 */
export function getCreditPackage(packageId: string): CreditPackage | null {
  return (CREDIT_PACKAGES[packageId as CreditPackageId] as CreditPackage) || null;
}

/**
 * Get subscription plan by ID
 */
export function getSubscriptionPlan(planId: string): SubscriptionPlan | null {
  return (SUBSCRIPTION_PLANS[planId as SubscriptionPlanId] as SubscriptionPlan) || null;
}

/**
 * Get tool credit cost
 */
export function getToolCost(toolType: string): number {
  return TOOL_CREDITS[toolType as ToolType] || 5;
}

/**
 * Get agent credit cost
 */
export function getAgentCost(agentType: string): number {
  return AGENT_CREDITS[agentType as AgentType] || 50;
}

/**
 * Check if plan has unlimited credits
 */
export function isUnlimitedPlan(plan: PlanType): boolean {
  return plan === 'unlimited';
}

/**
 * Get monthly credit allocation for a plan
 */
export function getMonthlyCredits(plan: PlanType): number {
  const validPlans = ['free', 'pro', 'team', 'unlimited'] as const;
  if (!validPlans.includes(plan as typeof validPlans[number])) {
    return 50; // Default for unknown plans like 'starter'
  }
  const planConfig = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];
  return planConfig?.creditsPerMonth || 50;
}

/**
 * Calculate credit value in dollars
 */
export function creditsToDollars(credits: number): string {
  return `$${(credits * 0.10).toFixed(2)}`;
}

/**
 * Get all credit packages as array
 */
export function getAllCreditPackages(): CreditPackage[] {
  return Object.values(CREDIT_PACKAGES) as CreditPackage[];
}

/**
 * Get all subscription plans as array
 */
export function getAllSubscriptionPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS) as SubscriptionPlan[];
}

/**
 * Check if user has enough credits
 */
export function hasEnoughCredits(
  balance: number, 
  plan: PlanType, 
  cost: number
): boolean {
  if (isUnlimitedPlan(plan)) return true;
  return balance >= cost;
}

/**
 * Calculate overage cost for credits beyond plan
 */
export function calculateOverageCost(creditsUsed: number): number {
  // $0.12 per credit for overages (20% markup)
  return creditsUsed * 12; // in cents
}

/**
 * Low credit threshold (warn when below this)
 */
export const LOW_CREDIT_THRESHOLD = 20;

/**
 * Check if credits are low
 */
export function isLowCredits(balance: number, plan: PlanType): boolean {
  if (isUnlimitedPlan(plan)) return false;
  return balance <= LOW_CREDIT_THRESHOLD;
}

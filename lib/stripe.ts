import Stripe from 'stripe';

// Server-side Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  typescript: true,
});

// Credit packages configuration
export const CREDIT_PACKAGES = {
  credits_100: {
    id: 'credits_100',
    name: '100 Credits',
    credits: 100,
    price: 900, // $9.00 in cents
    priceDisplay: '$9',
    description: 'One-time purchase of 100 credits',
    type: 'one_time' as const,
  },
  credits_500: {
    id: 'credits_500',
    name: '500 Credits',
    credits: 500,
    price: 2900, // $29.00 in cents
    priceDisplay: '$29',
    description: 'One-time purchase of 500 credits',
    type: 'one_time' as const,
    popular: true,
  },
  unlimited: {
    id: 'unlimited',
    name: 'Unlimited',
    credits: -1, // -1 indicates unlimited
    price: 7900, // $79.00/month in cents
    priceDisplay: '$79/mo',
    description: 'Unlimited generations every month',
    type: 'subscription' as const,
  },
} as const;

export type CreditPackageId = keyof typeof CREDIT_PACKAGES;

// Get package by ID
export function getCreditPackage(packageId: string) {
  return CREDIT_PACKAGES[packageId as CreditPackageId] || null;
}

// Check if Stripe is configured
export function isStripeConfigured(): boolean {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  return secretKey.startsWith('sk_') && secretKey !== 'sk_test_placeholder';
}

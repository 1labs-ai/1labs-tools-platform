/**
 * Stripe Product Setup Script for 1Labs AI Tools
 * 
 * Run this script once to create all Stripe products and prices.
 * 
 * Usage:
 *   1. Set STRIPE_SECRET_KEY in your .env.local
 *   2. Run: npx tsx scripts/setup-stripe.ts
 *   3. Copy the generated price IDs to your .env.local
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

interface ProductConfig {
  name: string;
  description: string;
  metadata: Record<string, string>;
  prices: Array<{
    nickname: string;
    unitAmount: number; // in cents
    recurring?: {
      interval: 'month' | 'year';
    };
    metadata: Record<string, string>;
  }>;
}

const products: ProductConfig[] = [
  // Credit Packages (one-time)
  {
    name: '1Labs Tools - Starter Credits',
    description: '110 credits for AI tools ($9)',
    metadata: { platform: 'tools', type: 'credits', package: 'starter' },
    prices: [{
      nickname: 'Starter Credits',
      unitAmount: 900, // $9
      metadata: { credits: '110', package: 'starter' },
    }],
  },
  {
    name: '1Labs Tools - Growth Credits',
    description: '610 credits for AI tools ($39)',
    metadata: { platform: 'tools', type: 'credits', package: 'growth' },
    prices: [{
      nickname: 'Growth Credits',
      unitAmount: 3900, // $39
      metadata: { credits: '610', package: 'growth' },
    }],
  },
  {
    name: '1Labs Tools - Scale Credits',
    description: '2500 credits for AI tools ($149)',
    metadata: { platform: 'tools', type: 'credits', package: 'scale' },
    prices: [{
      nickname: 'Scale Credits',
      unitAmount: 14900, // $149
      metadata: { credits: '2500', package: 'scale' },
    }],
  },

  // Subscription Plans
  {
    name: '1Labs Tools - Pro Plan',
    description: 'Monthly subscription with 500 credits',
    metadata: { platform: 'tools', type: 'subscription', plan: 'pro' },
    prices: [{
      nickname: 'Pro Monthly',
      unitAmount: 2900, // $29
      recurring: { interval: 'month' },
      metadata: { credits: '500', plan: 'pro' },
    }],
  },
  {
    name: '1Labs Tools - Team Plan',
    description: 'Monthly subscription with 2500 credits',
    metadata: { platform: 'tools', type: 'subscription', plan: 'team' },
    prices: [{
      nickname: 'Team Monthly',
      unitAmount: 9900, // $99
      recurring: { interval: 'month' },
      metadata: { credits: '2500', plan: 'team' },
    }],
  },
  {
    name: '1Labs Tools - Unlimited Plan',
    description: 'Monthly subscription with unlimited credits',
    metadata: { platform: 'tools', type: 'subscription', plan: 'unlimited' },
    prices: [{
      nickname: 'Unlimited Monthly',
      unitAmount: 29900, // $299
      recurring: { interval: 'month' },
      metadata: { credits: '-1', plan: 'unlimited' }, // -1 = unlimited
    }],
  },
];

async function setupStripe() {
  console.log('🚀 Setting up Stripe products for 1Labs AI Tools...\n');

  const priceIds: Record<string, string> = {};

  for (const config of products) {
    console.log(`Creating product: ${config.name}...`);

    // Create product
    const product = await stripe.products.create({
      name: config.name,
      description: config.description,
      metadata: config.metadata,
    });

    console.log(`  ✓ Product created: ${product.id}`);

    // Create prices
    for (const priceConfig of config.prices) {
      const priceParams: Stripe.PriceCreateParams = {
        product: product.id,
        currency: 'usd',
        unit_amount: priceConfig.unitAmount,
        nickname: priceConfig.nickname,
        metadata: priceConfig.metadata,
      };

      if (priceConfig.recurring) {
        priceParams.recurring = priceConfig.recurring;
      }

      const price = await stripe.prices.create(priceParams);
      
      const key = config.metadata.type === 'subscription' 
        ? `STRIPE_${config.metadata.plan!.toUpperCase()}_PRICE_ID`
        : `STRIPE_${config.metadata.package!.toUpperCase()}_PRICE_ID`;
      
      priceIds[key] = price.id;
      console.log(`  ✓ Price created: ${price.id} (${priceConfig.nickname})`);
    }

    console.log('');
  }

  console.log('✅ All products created!\n');
  console.log('Add these to your .env.local:\n');
  console.log('# Stripe Price IDs (auto-generated)');
  for (const [key, value] of Object.entries(priceIds)) {
    console.log(`${key}=${value}`);
  }
}

// Run setup
setupStripe().catch(console.error);

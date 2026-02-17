import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, getCreditPackage } from '@/lib/stripe';
import { addCredits } from '@/lib/credits';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } };
        // Handle recurring subscription payments
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription?.id;
        if (subscriptionId && invoice.billing_reason === 'subscription_cycle') {
          await handleSubscriptionRenewal(subscriptionId);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const packageId = session.metadata?.packageId;
  const type = session.metadata?.type;

  if (!userId || !packageId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  const creditPackage = getCreditPackage(packageId);
  if (!creditPackage) {
    console.error('Invalid package ID:', packageId);
    return;
  }

  if (type === 'one_time') {
    // Add credits for one-time purchase
    const credits = parseInt(session.metadata?.credits || '0', 10);
    if (credits > 0) {
      const result = await addCredits(
        userId,
        credits,
        'purchase',
        `Purchased ${creditPackage.name}`
      );
      console.log(`Added ${credits} credits to user ${userId}:`, result);
    }
  } else if (type === 'subscription') {
    // Update user plan to unlimited
    await updateUserPlan(userId, 'unlimited', session.subscription as string);
    console.log(`Upgraded user ${userId} to unlimited plan`);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    // Try to find user by customer ID
    console.log('No userId in subscription metadata, subscription:', subscription.id);
    return;
  }

  if (subscription.status === 'active') {
    await updateUserPlan(userId, 'unlimited', subscription.id);
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.log('No userId in subscription metadata for cancellation');
    return;
  }

  // Downgrade user to free plan
  await updateUserPlan(userId, 'free', null);
  console.log(`Downgraded user ${userId} to free plan`);
}

async function handleSubscriptionRenewal(subscriptionId: string) {
  // For unlimited plans, we don't need to add credits
  // The plan status handles everything
  console.log('Subscription renewed:', subscriptionId);
}

async function updateUserPlan(
  clerkId: string, 
  plan: 'free' | 'starter' | 'pro' | 'unlimited',
  subscriptionId: string | null
) {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, skipping plan update');
    return;
  }

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({ 
      plan,
      stripe_subscription_id: subscriptionId,
      updated_at: new Date().toISOString(),
    })
    .eq('clerk_id', clerkId);

  if (error) {
    console.error('Failed to update user plan:', error);
  }
}

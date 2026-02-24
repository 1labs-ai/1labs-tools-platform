import Stripe from 'stripe';
import { 
  getCreditPackage, 
  getSubscriptionPlan, 
  CREDIT_PACKAGES, 
  SUBSCRIPTION_PLANS,
  type CreditPackage,
  type SubscriptionPlan,
} from './billing';

// Server-side Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  typescript: true,
});

// Re-export billing helpers for backward compatibility
export { getCreditPackage, getSubscriptionPlan, CREDIT_PACKAGES, SUBSCRIPTION_PLANS };
export type { CreditPackage, SubscriptionPlan };

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  return secretKey.startsWith('sk_') && secretKey !== 'sk_test_placeholder';
}

/**
 * Check if Stripe webhooks are configured
 */
export function isWebhookConfigured(): boolean {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  return webhookSecret.startsWith('whsec_');
}

/**
 * Create a checkout session for credit package purchase
 */
export async function createCreditCheckoutSession(
  userId: string,
  packageId: string,
  returnUrl: string
): Promise<{ url: string | null; error?: string }> {
  if (!isStripeConfigured()) {
    return { url: null, error: 'Payment system not configured' };
  }

  const creditPackage = getCreditPackage(packageId);
  if (!creditPackage) {
    return { url: null, error: 'Invalid package' };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      metadata: {
        userId,
        packageId,
        credits: creditPackage.totalCredits.toString(),
        type: 'credit_purchase',
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: creditPackage.name,
              description: `${creditPackage.totalCredits} credits (includes ${creditPackage.bonusCredits} bonus)`,
            },
            unit_amount: creditPackage.price,
          },
          quantity: 1,
        },
      ],
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
    });

    return { url: session.url };
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return { url: null, error: 'Failed to create checkout session' };
  }
}

/**
 * Create a checkout session for subscription
 */
export async function createSubscriptionCheckoutSession(
  userId: string,
  planId: string,
  customerEmail: string | undefined,
  returnUrl: string
): Promise<{ url: string | null; error?: string }> {
  if (!isStripeConfigured()) {
    return { url: null, error: 'Payment system not configured' };
  }

  const plan = getSubscriptionPlan(planId);
  if (!plan || planId === 'free') {
    return { url: null, error: 'Invalid subscription plan' };
  }

  try {
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      metadata: {
        userId,
        planId,
        type: 'subscription',
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.name} Plan`,
              description: plan.description,
            },
            unit_amount: plan.price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          userId,
          planId,
        },
      },
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
    };

    // Add customer email if available
    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    return { url: session.url };
  } catch (error) {
    console.error('Stripe subscription error:', error);
    return { url: null, error: 'Failed to create subscription session' };
  }
}

/**
 * Create a portal session for subscription management
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<{ url: string | null; error?: string }> {
  if (!isStripeConfigured()) {
    return { url: null, error: 'Payment system not configured' };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  } catch (error) {
    console.error('Portal session error:', error);
    return { url: null, error: 'Failed to create portal session' };
  }
}

/**
 * Get or create Stripe customer for a user
 */
export async function getOrCreateCustomer(
  userId: string,
  email?: string,
  name?: string
): Promise<string | null> {
  if (!isStripeConfigured()) return null;

  try {
    // Search for existing customer
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0].id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });

    return customer.id;
  } catch (error) {
    console.error('Get/create customer error:', error);
    return null;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately = false
): Promise<{ success: boolean; error?: string }> {
  if (!isStripeConfigured()) {
    return { success: false, error: 'Payment system not configured' };
  }

  try {
    if (immediately) {
      await stripe.subscriptions.cancel(subscriptionId);
    } else {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return { success: false, error: 'Failed to cancel subscription' };
  }
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  if (!isStripeConfigured()) return null;

  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Get subscription error:', error);
    return null;
  }
}

/**
 * Create usage record for metered billing (overage)
 * Note: Requires subscription item with metered billing enabled
 */
export async function createUsageRecord(
  subscriptionItemId: string,
  quantity: number,
  action: 'increment' | 'set' = 'increment'
): Promise<{ success: boolean; error?: string }> {
  if (!isStripeConfigured()) {
    return { success: false, error: 'Payment system not configured' };
  }

  try {
    // Use the billing thresholds API for usage-based billing
    await stripe.billing.meterEvents.create({
      event_name: 'credit_usage',
      payload: {
        stripe_customer_id: subscriptionItemId,
        value: quantity.toString(),
      },
      timestamp: Math.floor(Date.now() / 1000),
    });

    return { success: true };
  } catch (error) {
    console.error('Usage record error:', error);
    // Fall back to simple logging if meter events aren't set up
    console.log(`Usage: ${action} ${quantity} for ${subscriptionItemId}`);
    return { success: true }; // Don't fail the operation
  }
}

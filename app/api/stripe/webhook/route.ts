import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getCreditPackage, getSubscriptionPlan, getMonthlyCredits, type PlanType } from "@/lib/billing";
import { convex, isConvexConfigured } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`Processing Stripe webhook: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle completed checkout sessions
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const type = session.metadata?.type;

  if (!userId) {
    console.error("Missing userId in checkout session:", session.id);
    return;
  }

  if (type === "credit_purchase") {
    // Handle one-time credit purchase
    const packageId = session.metadata?.packageId;
    const credits = parseInt(session.metadata?.credits || "0", 10);

    if (!packageId || credits <= 0) {
      console.error("Invalid credit purchase metadata:", session.id);
      return;
    }

    const creditPackage = getCreditPackage(packageId);
    if (!creditPackage) {
      console.error("Invalid package ID:", packageId);
      return;
    }

    // Add credits to user account
    await addCreditsToUser(
      userId, 
      credits, 
      "purchase", 
      `Purchased ${creditPackage.name} (${credits} credits)`
    );
    
    console.log(`Added ${credits} credits to user ${userId}`);
  } else if (type === "subscription") {
    // Subscription is handled by subscription.created webhook
    console.log(`Subscription checkout completed for user ${userId}`);
  }
}

/**
 * Handle subscription created/updated
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const planId = subscription.metadata?.planId;

  if (!userId || !planId) {
    console.log("No userId/planId in subscription metadata:", subscription.id);
    return;
  }

  const plan = getSubscriptionPlan(planId);
  if (!plan) {
    console.error("Invalid plan ID:", planId);
    return;
  }

  if (subscription.status === "active") {
    // Update user plan
    await updateUserPlan(userId, planId as PlanType, subscription.id);
    
    // Add monthly credits for new subscription
    if (planId !== "unlimited") {
      const monthlyCredits = getMonthlyCredits(planId as PlanType);
      await addCreditsToUser(
        userId,
        monthlyCredits,
        "bonus",
        `Monthly ${plan.name} plan credits`
      );
    }
    
    console.log(`Activated ${planId} plan for user ${userId}`);
  } else if (subscription.status === "past_due") {
    console.log(`Subscription ${subscription.id} is past due`);
    // Could send notification to user here
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.log("No userId in subscription metadata for cancellation");
    return;
  }

  // Downgrade user to free plan
  await updateUserPlan(userId, "free", null);
  console.log(`Downgraded user ${userId} to free plan`);
}

/**
 * Handle successful invoice payment (subscription renewal)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = (invoice as any).subscription;
  const subscriptionId = typeof sub === "string" ? sub : sub?.id;

  if (!subscriptionId) return;

  // Only handle subscription cycle (renewal), not initial payment
  if (invoice.billing_reason !== "subscription_cycle") return;

  try {
    // Get subscription to find user
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;
    const planId = subscription.metadata?.planId;

    if (!userId || !planId) {
      console.log("Missing metadata in subscription:", subscriptionId);
      return;
    }

    // Add monthly credits for renewal (except unlimited)
    if (planId !== "unlimited") {
      const monthlyCredits = getMonthlyCredits(planId as PlanType);
      const plan = getSubscriptionPlan(planId);
      
      await addCreditsToUser(
        userId,
        monthlyCredits,
        "bonus",
        `Monthly ${plan?.name || planId} renewal credits`
      );
      
      console.log(`Added ${monthlyCredits} renewal credits to user ${userId}`);
    }
  } catch (error) {
    console.error("Error handling invoice payment:", error);
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = (invoice as any).subscription;
  const subscriptionId = typeof sub === "string" ? sub : sub?.id;

  if (!subscriptionId) return;

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;

    if (userId) {
      console.log(`Payment failed for user ${userId}, subscription ${subscriptionId}`);
      // Could send notification or take other action here
    }
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}

/**
 * Add credits to user account
 */
async function addCreditsToUser(
  clerkId: string,
  amount: number,
  type: "purchase" | "usage" | "bonus" | "refund" | "signup",
  description: string
) {
  if (!isConvexConfigured()) {
    console.log("Convex not configured, skipping credit addition");
    return;
  }

  try {
    await convex.mutation(api.credits.add, {
      clerkId,
      amount,
      type,
      description,
    });
  } catch (error) {
    console.error("Failed to add credits:", error);
  }
}

/**
 * Update user subscription plan
 */
async function updateUserPlan(
  clerkId: string,
  plan: PlanType,
  subscriptionId: string | null
) {
  if (!isConvexConfigured()) {
    console.log("Convex not configured, skipping plan update");
    return;
  }

  try {
    await convex.mutation(api.users.updatePlan, {
      clerkId,
      plan,
      stripeSubscriptionId: subscriptionId || undefined,
    });
  } catch (error) {
    console.error("Failed to update user plan:", error);
  }
}

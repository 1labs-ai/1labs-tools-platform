import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { 
  createCreditCheckoutSession, 
  createSubscriptionCheckoutSession,
  isStripeConfigured 
} from '@/lib/stripe';
import { getCreditPackage, getSubscriptionPlan } from '@/lib/billing';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { packageId, planId } = body;

    // Validate input - either packageId OR planId, not both
    if (!packageId && !planId) {
      return NextResponse.json(
        { error: 'Either packageId or planId is required' },
        { status: 400 }
      );
    }

    if (packageId && planId) {
      return NextResponse.json(
        { error: 'Provide either packageId or planId, not both' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/buy-credits`;

    // Handle credit package purchase
    if (packageId) {
      const creditPackage = getCreditPackage(packageId);
      
      if (!creditPackage) {
        return NextResponse.json(
          { error: 'Invalid package' },
          { status: 400 }
        );
      }

      const result = await createCreditCheckoutSession(userId, packageId, returnUrl);
      
      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({ url: result.url });
    }

    // Handle subscription checkout
    if (planId) {
      const plan = getSubscriptionPlan(planId);
      
      if (!plan) {
        return NextResponse.json(
          { error: 'Invalid plan' },
          { status: 400 }
        );
      }

      if (planId === 'free') {
        return NextResponse.json(
          { error: 'Free plan does not require payment' },
          { status: 400 }
        );
      }

      // Get user email for Stripe
      const user = await currentUser();
      const customerEmail = user?.emailAddresses?.[0]?.emailAddress;

      const result = await createSubscriptionCheckoutSession(
        userId, 
        planId, 
        customerEmail,
        returnUrl
      );
      
      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({ url: result.url });
    }

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

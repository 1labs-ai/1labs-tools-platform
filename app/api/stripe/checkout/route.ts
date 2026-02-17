import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe, getCreditPackage, isStripeConfigured } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { packageId } = await request.json();
    
    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    const creditPackage = getCreditPackage(packageId);
    
    if (!creditPackage) {
      return NextResponse.json(
        { error: 'Invalid package' },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create checkout session based on package type
    if (creditPackage.type === 'subscription') {
      // Create subscription checkout
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: undefined, // Will be collected by Stripe
        metadata: {
          userId,
          packageId,
          type: 'subscription',
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: creditPackage.name,
                description: creditPackage.description,
              },
              unit_amount: creditPackage.price,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/buy-credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/buy-credits?canceled=true`,
      });

      return NextResponse.json({ url: session.url });
    } else {
      // Create one-time payment checkout
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        metadata: {
          userId,
          packageId,
          credits: creditPackage.credits.toString(),
          type: 'one_time',
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: creditPackage.name,
                description: creditPackage.description,
              },
              unit_amount: creditPackage.price,
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/buy-credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/buy-credits?canceled=true`,
      });

      return NextResponse.json({ url: session.url });
    }
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

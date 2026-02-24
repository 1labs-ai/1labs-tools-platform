# Stripe Setup Guide for 1Labs AI Tools

This document explains how to set up Stripe for the billing system.

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...        # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_...   # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_...      # Webhook signing secret

# Optional: Pre-created Stripe Price IDs for subscriptions
# (If not set, prices are created dynamically during checkout)
STRIPE_PRO_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...
STRIPE_UNLIMITED_PRICE_ID=price_...
```

## Getting Your Stripe Keys

### 1. Secret & Publishable Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your keys:
   - **Publishable key** starts with `pk_test_` (test) or `pk_live_` (production)
   - **Secret key** starts with `sk_test_` (test) or `sk_live_` (production)

### 2. Webhook Secret

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   - Development: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) or ngrok
   - Production: `https://your-domain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)

## Testing with Stripe CLI

For local development, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret printed in the terminal
```

## Test Card Numbers

For testing, use these card numbers:

| Card Number | Description |
|------------|-------------|
| 4242 4242 4242 4242 | Succeeds |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0025 0000 3155 | Requires authentication |

Use any future expiry date and any 3-digit CVC.

## Credit Packages

The system supports these one-time purchase packages:

| Package | Credits | Bonus | Price |
|---------|---------|-------|-------|
| Starter | 100 | +10 (10%) | $9 |
| Growth | 500 | +110 (22%) | $39 |
| Scale | 2000 | +500 (25%) | $149 |

## Subscription Plans

Monthly subscription plans with recurring credits:

| Plan | Credits/Month | Price |
|------|---------------|-------|
| Free | 50 | $0 |
| Pro | 500 | $29/mo |
| Team | 2,500 | $99/mo |
| Unlimited | ∞ | $299/mo |

## Webhook Events

The webhook handler at `/api/stripe/webhook` processes these events:

1. **checkout.session.completed**
   - Credit purchases: Adds credits to user account
   - Subscriptions: Triggers plan activation

2. **customer.subscription.created/updated**
   - Updates user plan in database
   - Adds monthly credits for new subscriptions

3. **customer.subscription.deleted**
   - Downgrades user to free plan

4. **invoice.payment_succeeded**
   - For subscription renewals: Adds monthly credits

5. **invoice.payment_failed**
   - Logs failed payment (can be extended for notifications)

## Production Checklist

Before going live:

- [ ] Switch to live Stripe keys (`sk_live_`, `pk_live_`)
- [ ] Set up production webhook endpoint
- [ ] Enable required webhook events
- [ ] Test complete purchase flow
- [ ] Test subscription renewal flow
- [ ] Set up Stripe customer portal for self-service

## Customer Portal

The billing system includes a `/api/stripe/portal` endpoint that creates Stripe Billing Portal sessions. Configure the portal in Stripe Dashboard:

1. Go to **Settings** → **Billing** → **Customer portal**
2. Enable features:
   - Update payment methods
   - View billing history
   - Cancel subscriptions
3. Customize the portal appearance

## Convex Integration

The billing system stores transactions and user plans in Convex. Ensure your Convex schema includes:

- `userProfiles` table with `credits`, `plan`, `stripeCustomerId`, `stripeSubscriptionId`
- `creditTransactions` table for transaction history
- Mutations: `credits.add`, `credits.deduct`, `users.updatePlan`

## Troubleshooting

### Webhook signature verification failed
- Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
- Check that you're using the right secret for test vs live mode

### Credits not being added
- Check Convex connection (`CONVEX_URL` and `CONVEX_DEPLOY_KEY`)
- Verify the webhook is receiving events (check Stripe Dashboard → Webhooks)

### Checkout session fails
- Verify `STRIPE_SECRET_KEY` is valid
- Check browser console for errors
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly

## Support

For issues with the billing system:
- Check Stripe Dashboard logs
- Review webhook event logs
- Check Convex dashboard for mutation errors

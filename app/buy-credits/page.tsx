'use client';

import { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Credit Packages (one-time purchase)
const creditPackages = [
  {
    id: 'starter',
    name: 'Starter Pack',
    price: '$9',
    credits: 100,
    totalCredits: 110,
    bonus: '10% bonus',
    description: 'Great for occasional use',
    features: [
      '100 base credits + 10 bonus',
      'Access to all tools',
      'Credits never expire',
    ],
    highlighted: false,
  },
  {
    id: 'growth',
    name: 'Growth Pack',
    price: '$39',
    credits: 500,
    totalCredits: 610,
    bonus: '22% bonus',
    description: 'Best value for power users',
    features: [
      '500 base credits + 110 bonus',
      'Access to all tools',
      'Credits never expire',
      'Best per-credit value',
    ],
    highlighted: true,
  },
  {
    id: 'scale',
    name: 'Scale Pack',
    price: '$149',
    credits: 2000,
    totalCredits: 2500,
    bonus: '25% bonus',
    description: 'For teams and heavy users',
    features: [
      '2000 base credits + 500 bonus',
      'Access to all tools',
      'Credits never expire',
      'Maximum savings',
    ],
    highlighted: false,
  },
];

// Subscription Plans
const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    credits: 50,
    description: 'Perfect for trying out',
    features: [
      '50 credits/month',
      'Access to all tools',
      'Community support',
    ],
    highlighted: false,
    current: true, // Will be set dynamically
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/month',
    credits: 500,
    description: 'For power users',
    features: [
      '500 credits/month',
      'Priority support',
      'Credits roll over (up to 1000)',
      'Early access to new features',
    ],
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '$99',
    period: '/month',
    credits: 2500,
    description: 'For teams and agencies',
    features: [
      '2,500 credits/month',
      'Priority support',
      'Credits roll over (up to 5000)',
      'Team collaboration (coming soon)',
    ],
    highlighted: false,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$299',
    period: '/month',
    credits: -1,
    description: 'Unlimited access',
    features: [
      'Unlimited credits',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    highlighted: false,
  },
];

// Tool credit costs
const toolCosts = [
  { name: 'AI Roadmap', credits: 5 },
  { name: 'User Persona', credits: 5 },
  { name: 'User Stories', credits: 5 },
  { name: 'Meeting Notes', credits: 5 },
  { name: 'Release Notes', credits: 5 },
  { name: 'FAQ Generator', credits: 5 },
  { name: 'Competitive Analysis', credits: 10 },
  { name: 'PRD Generator', credits: 10 },
  { name: 'Pitch Deck', credits: 15 },
];

function MessageBanner() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      setMessage({
        type: 'success',
        text: 'Payment successful! Your credits have been added to your account.',
      });
    } else if (canceled === 'true') {
      setMessage({
        type: 'error',
        text: 'Payment was canceled. No charges were made.',
      });
    }
  }, [searchParams]);

  if (!message) return null;

  return (
    <div
      className={`max-w-2xl mx-auto mb-8 p-4 rounded-xl ${
        message.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-red-50 border border-red-200 text-red-700'
      }`}
    >
      <p className="text-[14px] text-center">{message.text}</p>
    </div>
  );
}

function BuyCreditsContent() {
  const { isSignedIn, isLoaded } = useUser();
  const [loading, setLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'packages' | 'subscriptions'>('packages');
  const [userPlan, setUserPlan] = useState<string>('free');
  const [userCredits, setUserCredits] = useState<number>(0);

  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/user')
        .then(res => res.json())
        .then(data => {
          setUserPlan(data.profile?.plan || 'free');
          setUserCredits(data.profile?.credits || 0);
        })
        .catch(console.error);
    }
  }, [isSignedIn]);

  const handlePurchase = async (packageId: string) => {
    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent('/buy-credits')}`;
      return;
    }

    setLoading(packageId);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent('/buy-credits')}`;
      return;
    }

    if (planId === 'free') {
      return; // Can't subscribe to free
    }

    if (planId === userPlan) {
      // Open portal for managing existing subscription
      try {
        setLoading(planId);
        const response = await fetch('/api/stripe/portal', {
          method: 'POST',
        });
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (error) {
        console.error('Portal error:', error);
      } finally {
        setLoading(null);
      }
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      alert(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#131314]">
            Get More Credits
          </h1>
          <p className="text-[#58585a] max-w-xl mx-auto text-[15px]">
            Choose credit packs for one-time purchases or subscribe for monthly credits.
          </p>
          
          {isSignedIn && (
            <div className="mt-4 inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
              <span className="text-[14px] text-purple-600">Current Balance:</span>
              <span className="text-[16px] font-bold text-purple-700">
                {userPlan === 'unlimited' ? '∞' : userCredits} credits
              </span>
              <span className="text-[12px] text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">
                {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan
              </span>
            </div>
          )}
        </div>

        {/* Success/Error Message */}
        <Suspense fallback={null}>
          <MessageBanner />
        </Suspense>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-6 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                activeTab === 'packages'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Credit Packs
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-6 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                activeTab === 'subscriptions'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly Plans
            </button>
          </div>
        </div>

        {/* Credit Packages */}
        {activeTab === 'packages' && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {creditPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-white border rounded-[24px] p-6 shadow-sm ${
                  pkg.highlighted
                    ? 'border-purple-400 ring-2 ring-purple-400/20'
                    : 'border-gray-200'
                }`}
              >
                {pkg.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] px-3 py-1 rounded-full font-medium">
                      Best Value
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[#131314]">{pkg.name}</h3>
                  <p className="text-[#58585a] text-[13px]">{pkg.description}</p>
                </div>

                <div className="mb-2">
                  <span className="text-3xl font-bold text-[#131314]">{pkg.price}</span>
                  <span className="text-[#58585a] text-[14px]"> one-time</span>
                </div>

                <div className="mb-4 flex items-center gap-2">
                  <span className="inline-block bg-purple-50 text-purple-600 text-[13px] px-3 py-1 rounded-full font-medium">
                    {pkg.totalCredits} credits
                  </span>
                  <span className="text-green-600 text-[12px] font-medium">
                    +{pkg.bonus}
                  </span>
                </div>

                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-[13px]">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-[#58585a]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading !== null}
                  className={`block w-full text-center py-2.5 rounded-xl font-medium transition-colors text-[14px] disabled:opacity-50 disabled:cursor-not-allowed ${
                    pkg.highlighted
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-[#131314]'
                  }`}
                >
                  {loading === pkg.id ? 'Processing...' : `Buy ${pkg.name}`}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Subscription Plans */}
        {activeTab === 'subscriptions' && (
          <div className="grid md:grid-cols-4 gap-5 mb-12">
            {subscriptionPlans.map((plan) => {
              const isCurrent = plan.id === userPlan;
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white border rounded-[24px] p-5 shadow-sm ${
                    plan.highlighted
                      ? 'border-purple-400 ring-2 ring-purple-400/20'
                      : isCurrent
                      ? 'border-green-400 ring-2 ring-green-400/20'
                      : 'border-gray-200'
                  }`}
                >
                  {plan.highlighted && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] px-3 py-1 rounded-full font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-green-500 text-white text-[11px] px-3 py-1 rounded-full font-medium">
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-[#131314]">{plan.name}</h3>
                    <p className="text-[#58585a] text-[12px]">{plan.description}</p>
                  </div>

                  <div className="mb-2">
                    <span className="text-2xl font-bold text-[#131314]">{plan.price}</span>
                    <span className="text-[#58585a] text-[13px]">{plan.period}</span>
                  </div>

                  <div className="mb-4">
                    <span className="inline-block bg-purple-50 text-purple-600 text-[12px] px-2.5 py-1 rounded-full font-medium">
                      {plan.credits === -1 ? 'Unlimited' : `${plan.credits}/mo`}
                    </span>
                  </div>

                  <ul className="space-y-2 mb-5">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-[12px]">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-[#58585a]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading !== null || plan.id === 'free'}
                    className={`block w-full text-center py-2 rounded-xl font-medium transition-colors text-[13px] disabled:opacity-50 disabled:cursor-not-allowed ${
                      isCurrent
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : plan.highlighted
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white'
                        : plan.id === 'free'
                        ? 'bg-gray-50 text-gray-400 cursor-default'
                        : 'bg-gray-100 hover:bg-gray-200 text-[#131314]'
                    }`}
                  >
                    {loading === plan.id 
                      ? 'Processing...' 
                      : isCurrent 
                      ? 'Manage Plan' 
                      : plan.id === 'free' 
                      ? 'Free Tier'
                      : `Subscribe to ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Credit Usage Reference */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-bold mb-4 text-center text-[#131314]">Credit Usage by Tool</h2>
          <div className="bg-white border border-gray-200 rounded-[16px] p-3 sm:p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {toolCosts.map((tool) => (
                <div key={tool.name} className="flex justify-between items-center py-2 sm:py-1 border-b sm:border-0 border-gray-100 last:border-0">
                  <span className="text-[13px] text-[#58585a]">{tool.name}</span>
                  <span className="text-[13px] font-medium text-pink-500">{tool.credits} credits</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-[11px] sm:text-[12px] text-gray-500 mt-3">
            1 credit = $0.10 value • Credits never expire for one-time purchases
          </p>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <Link
            href="/dashboard"
            className="text-[14px] text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BuyCreditsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    }>
      <BuyCreditsContent />
    </Suspense>
  );
}

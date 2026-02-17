'use client';

import { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const creditPackages = [
  {
    id: 'credits_100',
    name: '100 Credits',
    price: '$9',
    period: 'one-time',
    credits: 100,
    description: 'Great for occasional use',
    features: [
      '100 credits to use anytime',
      'Access to all tools',
      'Credits never expire',
    ],
    highlighted: false,
  },
  {
    id: 'credits_500',
    name: '500 Credits',
    price: '$29',
    period: 'one-time',
    credits: 500,
    description: 'Best value for power users',
    features: [
      '500 credits to use anytime',
      'Access to all tools',
      'Credits never expire',
      'Save 40% vs. buying 100s',
    ],
    highlighted: true,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$79',
    period: '/month',
    credits: -1,
    description: 'For heavy users and teams',
    features: [
      'Unlimited generations',
      'Access to all tools',
      'Priority support',
      'API access (coming soon)',
      'Cancel anytime',
    ],
    highlighted: false,
  },
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

  const handlePurchase = async (packageId: string) => {
    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent('/buy-credits')}`;
      return;
    }

    setLoading(packageId);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#131314]">
            Buy Credits
          </h1>
          <p className="text-[#58585a] max-w-xl mx-auto text-[15px]">
            Choose a credit package that works for you. 
            Use credits to generate roadmaps, PRDs, pitch decks, and more.
          </p>
        </div>

        {/* Success/Error Message */}
        <Suspense fallback={null}>
          <MessageBanner />
        </Suspense>

        {/* Credit Packages */}
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

              <div className="mb-4">
                <span className="text-3xl font-bold text-[#131314]">{pkg.price}</span>
                <span className="text-[#58585a] text-[14px]">{pkg.period}</span>
              </div>

              <div className="mb-6">
                <span className="inline-block bg-purple-50 text-purple-600 text-[13px] px-3 py-1 rounded-full font-medium">
                  {pkg.credits === -1 ? 'Unlimited' : `${pkg.credits} credits`}
                </span>
              </div>

              <ul className="space-y-3 mb-6">
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
                    ? 'bg-[#090221] hover:bg-[#1a1a2e] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-[#131314]'
                }`}
              >
                {loading === pkg.id ? 'Processing...' : `Buy ${pkg.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Credit Usage Reference */}
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-bold mb-4 text-center text-[#131314]">Credit Usage</h2>
          <div className="bg-white border border-gray-200 rounded-[16px] p-4 shadow-sm">
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#58585a]">AI Product Roadmap</span>
                <span className="font-medium text-[#EC4899]">5 credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#58585a]">PRD Agent</span>
                <span className="font-medium text-[#EC4899]">10 credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#58585a]">Pitch Deck Generator</span>
                <span className="font-medium text-[#EC4899]">15 credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#58585a]">User Persona Builder</span>
                <span className="font-medium text-[#EC4899]">5 credits</span>
              </div>
            </div>
          </div>
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

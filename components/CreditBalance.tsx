'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { LOW_CREDIT_THRESHOLD } from '@/lib/billing';

interface CreditBalanceProps {
  showWarning?: boolean;
  compact?: boolean;
}

interface UserData {
  credits: number;
  plan: string;
}

export function CreditBalance({ showWarning = true, compact = false }: CreditBalanceProps) {
  const { isSignedIn } = useUser();
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const result = await response.json();
        setData({
          credits: result.profile?.credits ?? 0,
          plan: result.profile?.plan ?? 'free',
        });
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      fetchCredits();
      // Refresh every 30 seconds
      const interval = setInterval(fetchCredits, 30000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn, fetchCredits]);

  if (!isSignedIn || loading) {
    return null;
  }

  if (!data) {
    return null;
  }

  const isUnlimited = data.plan === 'unlimited';
  const isLow = !isUnlimited && data.credits <= LOW_CREDIT_THRESHOLD;

  if (compact) {
    return (
      <Link
        href="/buy-credits"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
          isLow 
            ? 'bg-red-50 hover:bg-red-100' 
            : 'bg-purple-50 hover:bg-purple-100'
        }`}
      >
        <CreditIcon className={isLow ? 'text-red-500' : 'text-purple-600'} />
        <span className={`text-[13px] font-semibold ${isLow ? 'text-red-600' : 'text-purple-700'}`}>
          {isUnlimited ? '∞' : data.credits}
        </span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <Link
        href="/dashboard"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
          isLow 
            ? 'bg-red-50 hover:bg-red-100' 
            : 'bg-purple-50 hover:bg-purple-100'
        }`}
      >
        <CreditIcon className={isLow ? 'text-red-500' : 'text-purple-600'} />
        <span className={`text-[13px] font-semibold ${isLow ? 'text-red-600' : 'text-purple-700'}`}>
          {isUnlimited ? '∞' : data.credits}
        </span>
        <span className={`text-[11px] ${isLow ? 'text-red-500' : 'text-purple-500'}`}>
          credits
        </span>
      </Link>

      {/* Low credit warning tooltip */}
      {showWarning && isLow && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
          <div className="bg-red-600 text-white text-[12px] px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
            <span className="block text-center">Low credits!</span>
            <Link 
              href="/buy-credits" 
              className="block text-center text-red-100 hover:text-white underline"
            >
              Buy more →
            </Link>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}

function CreditIcon({ className }: { className?: string }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 8v8M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/**
 * Low credit warning banner (for tool pages)
 */
export function LowCreditBanner() {
  const { isSignedIn } = useUser();
  const [data, setData] = useState<UserData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/user')
        .then(res => res.json())
        .then(result => {
          setData({
            credits: result.profile?.credits ?? 0,
            plan: result.profile?.plan ?? 'free',
          });
        })
        .catch(console.error);
    }
  }, [isSignedIn]);

  if (!isSignedIn || !data || dismissed) {
    return null;
  }

  const isUnlimited = data.plan === 'unlimited';
  const isLow = !isUnlimited && data.credits <= LOW_CREDIT_THRESHOLD;

  if (!isLow) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-orange-600">
              <path d="M12 9v4M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-medium text-orange-800">
              You&apos;re running low on credits
            </p>
            <p className="text-[13px] text-orange-600">
              Only {data.credits} credits remaining. Get more to keep generating.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/buy-credits"
            className="bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Buy Credits
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-orange-400 hover:text-orange-600 p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * No credits modal (when user runs out)
 */
interface NoCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName?: string;
  creditCost?: number;
}

export function NoCreditModal({ isOpen, onClose, toolName, creditCost }: NoCreditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-red-500">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Not Enough Credits
          </h3>
          <p className="text-gray-600 text-[14px]">
            {toolName ? (
              <>You need <span className="font-semibold">{creditCost} credits</span> to use {toolName}.</>
            ) : (
              <>You&apos;ve run out of credits.</>
            )}
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/buy-credits"
            className="block w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white text-center py-3 rounded-xl font-medium transition-colors"
          >
            Buy Credits
          </Link>
          <Link
            href="/pricing"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-3 rounded-xl font-medium transition-colors"
          >
            View Plans
          </Link>
          <button
            onClick={onClose}
            className="block w-full text-gray-500 hover:text-gray-700 text-center py-2 text-[14px]"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

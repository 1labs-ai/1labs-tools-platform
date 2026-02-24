'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface Transaction {
  id: string;
  amount: number;
  type: 'purchase' | 'usage' | 'bonus' | 'refund' | 'signup';
  description?: string;
  toolType?: string;
  createdAt: number;
}

interface UsageSummary {
  totalCreditsUsed: number;
  totalPurchased: number;
  generationCount: number;
  byTool: Record<string, { count: number; credits: number }>;
}

const TOOL_LABELS: Record<string, string> = {
  roadmap: 'Roadmap',
  pitch_deck: 'Pitch Deck',
  persona: 'User Persona',
  competitive_analysis: 'Competitive Analysis',
  user_stories: 'User Stories',
  meeting_notes: 'Meeting Notes',
  release_notes: 'Release Notes',
  faq_generator: 'FAQ Generator',
  prd: 'PRD',
  tech_spec: 'Tech Spec',
  gtm: 'GTM Strategy',
};

export function UsageHistory() {
  const { isSignedIn } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [plan, setPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  useEffect(() => {
    if (isSignedIn) {
      fetchUsageHistory();
    }
  }, [isSignedIn]);

  const fetchUsageHistory = async () => {
    try {
      const response = await fetch('/api/v1/usage/history?limit=100');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data.transactions);
        setSummary(data.data.summary);
        setPlan(data.data.plan);
      }
    } catch (error) {
      console.error('Failed to fetch usage history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded w-1/4"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[24px] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Usage & History</h2>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
            </span>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`text-[14px] pb-2 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'text-purple-600 border-purple-600 font-medium'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`text-[14px] pb-2 border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'text-purple-600 border-purple-600 font-medium'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Transaction History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && summary && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-[12px] text-purple-600 mb-1">Total Used</p>
                <p className="text-2xl font-bold text-purple-700">{summary.totalCreditsUsed}</p>
                <p className="text-[11px] text-purple-500">credits</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-[12px] text-green-600 mb-1">Total Earned/Purchased</p>
                <p className="text-2xl font-bold text-green-700">{summary.totalPurchased}</p>
                <p className="text-[11px] text-green-500">credits</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-4">
                <p className="text-[12px] text-pink-600 mb-1">Generations</p>
                <p className="text-2xl font-bold text-pink-700">{summary.generationCount}</p>
                <p className="text-[11px] text-pink-500">total</p>
              </div>
            </div>

            {/* Usage by Tool */}
            {Object.keys(summary.byTool).length > 0 && (
              <div>
                <h3 className="text-[14px] font-medium text-gray-700 mb-3">Usage by Tool</h3>
                <div className="space-y-2">
                  {Object.entries(summary.byTool)
                    .sort((a, b) => b[1].credits - a[1].credits)
                    .map(([tool, data]) => (
                      <div key={tool} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ToolIcon tool={tool} />
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-gray-800">
                              {TOOL_LABELS[tool] || tool}
                            </p>
                            <p className="text-[12px] text-gray-500">{data.count} generations</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[14px] font-medium text-pink-600">{data.credits}</p>
                          <p className="text-[11px] text-gray-500">credits</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {Object.keys(summary.byTool).length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                    <path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-[14px] text-gray-600 mb-1">No usage yet</p>
                <p className="text-[13px] text-gray-500">Start using tools to see your usage breakdown</p>
                <Link 
                  href="/roadmap"
                  className="inline-block mt-4 text-[13px] text-purple-600 hover:text-purple-700 font-medium"
                >
                  Try the Roadmap Generator →
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'usage' ? 'bg-red-100' :
                      tx.type === 'purchase' ? 'bg-green-100' :
                      tx.type === 'bonus' ? 'bg-yellow-100' :
                      tx.type === 'refund' ? 'bg-blue-100' :
                      'bg-purple-100'
                    }`}>
                      <TransactionIcon type={tx.type} />
                    </div>
                    <div>
                      <p className="text-[14px] text-gray-800">
                        {tx.description || getDefaultDescription(tx)}
                      </p>
                      <p className="text-[12px] text-gray-500">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className={`text-[14px] font-medium ${
                    tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-[14px] text-gray-600">No transactions yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolIcon({ tool }: { tool: string }) {
  // Simple icon based on tool
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 002 2h2a2 2 0 002-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function TransactionIcon({ type }: { type: string }) {
  if (type === 'usage') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-red-500">
        <path d="M19 14l-7 7m0 0l-7-7m7 7V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }
  if (type === 'purchase' || type === 'bonus') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-green-500">
        <path d="M5 10l7-7m0 0l7 7m-7-7v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-purple-500">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

function getDefaultDescription(tx: Transaction): string {
  switch (tx.type) {
    case 'usage':
      return tx.toolType ? `Used ${TOOL_LABELS[tx.toolType] || tx.toolType}` : 'Tool usage';
    case 'purchase':
      return 'Credit purchase';
    case 'bonus':
      return 'Bonus credits';
    case 'refund':
      return 'Refund';
    case 'signup':
      return 'Welcome credits';
    default:
      return 'Transaction';
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
    }
    return `${hours}h ago`;
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

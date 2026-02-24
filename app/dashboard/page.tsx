"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Skeleton, DashboardStatSkeleton, GenerationItemSkeleton } from "@/components/ui/Skeleton";
import { CreditProgress } from "@/components/ui/ProgressBar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface UserData {
  profile: {
    id: string;
    credits: number;
    plan: string;
    email: string | null;
    name: string | null;
    createdAt: string;
  };
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    description: string | null;
    tool_type: string | null;
    created_at: string;
  }>;
  recentGenerations: Array<{
    id: string;
    tool_type: string;
    title: string | null;
    credits_used: number;
    created_at: string;
  }>;
}

const toolInfo: Record<string, { name: string; icon: string; href: string; gradient: string }> = {
  roadmap: { name: "Product Roadmap", icon: "📊", href: "/roadmap", gradient: "from-purple-500 to-indigo-500" },
  pitch_deck: { name: "Pitch Deck", icon: "🎯", href: "/pitch-deck", gradient: "from-pink-500 to-rose-500" },
  persona: { name: "User Persona", icon: "👤", href: "/persona", gradient: "from-cyan-500 to-blue-500" },
  user_stories: { name: "User Stories", icon: "📝", href: "/user-stories", gradient: "from-amber-500 to-orange-500" },
  competitive_analysis: { name: "Competitive Analysis", icon: "⚔️", href: "/competitive-analysis", gradient: "from-red-500 to-pink-500" },
  release_notes: { name: "Release Notes", icon: "🚀", href: "/release-notes", gradient: "from-emerald-500 to-teal-500" },
  meeting_notes: { name: "Meeting Notes", icon: "📋", href: "/meeting-notes", gradient: "from-violet-500 to-purple-500" },
  faq_generator: { name: "FAQ Generator", icon: "❓", href: "/faq-generator", gradient: "from-blue-500 to-cyan-500" },
};

const quickActions = [
  { name: "Roadmap", icon: "📊", href: "/roadmap" },
  { name: "Pitch Deck", icon: "🎯", href: "/pitch-deck" },
  { name: "Persona", icon: "👤", href: "/persona" },
  { name: "History", icon: "📜", href: "/history" },
  { name: "Buy Credits", icon: "💳", href: "/pricing" },
  { name: "API Keys", icon: "🔑", href: "/account/api-keys" },
];

export default function DashboardPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/sign-in");
    }

    if (isSignedIn) {
      fetchUserData();
    }
  }, [isLoaded, isSignedIn]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate usage stats
  const totalCreditsUsed = userData?.recentGenerations?.reduce((sum, gen) => sum + gen.credits_used, 0) ?? 0;
  const planCredits = userData?.profile.plan === 'pro' ? 500 : userData?.profile.plan === 'starter' ? 100 : 25;

  if (!isLoaded || (loading && !userData)) {
    return (
      <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Skeleton variant="text" width={150} height={32} className="mb-2" />
          <Skeleton variant="text" width={250} height={20} className="mb-8" />
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-[24px] p-6">
              <Skeleton variant="text" width={150} height={24} className="mb-6" />
              <div className="space-y-4">
                <GenerationItemSkeleton />
                <GenerationItemSkeleton />
                <GenerationItemSkeleton />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-[24px] p-6">
              <Skeleton variant="text" width={120} height={24} className="mb-6" />
              <div className="space-y-3">
                <Skeleton variant="text" height={44} />
                <Skeleton variant="text" height={44} />
                <Skeleton variant="text" height={44} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#131314] mb-1">
            {getGreeting()}, {userData?.profile.name?.split(' ')[0] || user?.firstName || 'there'}! 👋
          </h1>
          <p className="text-[#58585a] text-[15px]">
            Here&apos;s your overview and recent activity.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Credits Card - Enhanced */}
          <div className="md:col-span-2">
            <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-[24px] p-6 text-white relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full filter blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full filter blur-2xl" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-white/70 text-[14px] font-medium block mb-1">Available Credits</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold">{userData?.profile.credits ?? 0}</span>
                      <span className="text-white/70 text-lg">/ {planCredits}</span>
                    </div>
                  </div>
                  <Link 
                    href="/pricing" 
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-[13px] font-medium transition-all hover:scale-105"
                  >
                    Get More Credits →
                  </Link>
                </div>
                
                {/* Progress bar */}
                <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-white/90 rounded-full transition-all duration-500 progress-bar-animated"
                    style={{ width: `${Math.min(((userData?.profile.credits ?? 0) / planCredits) * 100, 100)}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-white/70">
                    <span className="capitalize">{userData?.profile.plan ?? 'Free'}</span> Plan
                  </span>
                  <span className="text-white/90">
                    {Math.round(((userData?.profile.credits ?? 0) / planCredits) * 100)}% remaining
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Generations */}
          <div className="bg-white border border-gray-200 rounded-[24px] p-6 hover:border-purple-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#58585a] text-[14px] font-medium">Total Generations</span>
              <span className="text-2xl">🚀</span>
            </div>
            <div className="text-4xl font-bold text-[#131314] mb-1">
              {userData?.recentGenerations?.length ?? 0}
            </div>
            <div className="text-[#58585a] text-[13px] mb-4">All time</div>
            
            {/* Mini chart placeholder */}
            <div className="flex items-end gap-1 h-12">
              {[40, 60, 45, 70, 55, 80, 65].map((h, i) => (
                <div 
                  key={i}
                  className="flex-1 bg-gradient-to-t from-purple-500 to-pink-400 rounded-t opacity-60 hover:opacity-100 transition-opacity"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[#131314] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group bg-white border border-gray-200 rounded-[16px] p-3 sm:p-4 text-center hover:border-purple-200 hover:shadow-md transition-all min-h-[80px] flex flex-col items-center justify-center"
              >
                <span className="text-xl sm:text-2xl mb-1 sm:mb-2 block group-hover:scale-110 transition-transform">{action.icon}</span>
                <span className="text-[12px] sm:text-[13px] font-medium text-[#131314] group-hover:text-purple-600 transition-colors">
                  {action.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Generations */}
          <div className="bg-white border border-gray-200 rounded-[24px] p-6 hover:border-purple-200 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#131314]">Recent Generations</h2>
              <Link href="/history" className="text-[13px] text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 group">
                View All 
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:translate-x-0.5 transition-transform">
                  <path d="M5 10L8 7L5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
            
            {userData?.recentGenerations && userData.recentGenerations.length > 0 ? (
              <div className="space-y-3">
                {userData.recentGenerations.slice(0, 5).map((gen) => {
                  const tool = toolInfo[gen.tool_type] || { name: gen.tool_type, icon: "🔧", href: "#", gradient: "from-gray-400 to-gray-500" };
                  return (
                    <Link 
                      key={gen.id} 
                      href={`/history/${gen.id}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-sm`}>
                        <span className="text-lg filter brightness-0 invert">{tool.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[14px] text-[#131314] truncate group-hover:text-purple-600 transition-colors">
                          {gen.title || tool.name}
                        </div>
                        <div className="text-[12px] text-[#58585a]">
                          {new Date(gen.created_at).toLocaleDateString()} · {gen.credits_used} credits
                        </div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400 group-hover:text-purple-500 transition-colors">
                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🚀</span>
                </div>
                <div className="text-[#131314] font-medium mb-1">No generations yet</div>
                <div className="text-[#58585a] text-[14px] mb-4">Create your first AI-powered document</div>
                <Link 
                  href="/roadmap"
                  className="inline-block bg-[#090221] text-white text-[13px] px-5 py-2.5 rounded-full hover:bg-[#1a1a2e] transition-all hover:shadow-lg"
                >
                  Create Your First →
                </Link>
              </div>
            )}
          </div>

          {/* Credit History */}
          <div className="bg-white border border-gray-200 rounded-[24px] p-6 hover:border-purple-200 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#131314]">Credit History</h2>
              <span className="text-[12px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                Last 5 transactions
              </span>
            </div>
            
            {userData?.recentTransactions && userData.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {userData.recentTransactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {tx.amount > 0 ? '↑' : '↓'}
                      </div>
                      <div>
                        <div className="text-[14px] text-[#131314] font-medium">
                          {tx.description || tx.type}
                        </div>
                        <div className="text-[12px] text-[#58585a]">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className={`text-[15px] font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[#58585a] text-[14px]">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">💳</span>
                </div>
                <div className="text-[#131314] font-medium mb-1">No transactions yet</div>
                <div>Your credit history will appear here</div>
              </div>
            )}
          </div>
        </div>

        {/* Available Tools */}
        <div className="mt-8 sm:mt-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold text-[#131314]">Available Tools</h2>
            <Link href="/" className="text-[13px] text-purple-600 hover:text-purple-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(toolInfo).slice(0, 8).map(([key, tool]) => (
              <Link
                key={key}
                href={tool.href}
                className="group bg-white border border-gray-200 rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 hover:border-purple-200 hover:shadow-md transition-all"
              >
                <div className={`w-10 sm:w-11 h-10 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-2 sm:mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                  <span className="text-lg sm:text-xl filter brightness-0 invert">{tool.icon}</span>
                </div>
                <div className="font-medium text-[13px] sm:text-[14px] text-[#131314] group-hover:text-purple-600 transition-colors leading-tight">
                  {tool.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";

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

const toolInfo: Record<string, { name: string; icon: string; href: string }> = {
  roadmap: { name: "Product Roadmap", icon: "📊", href: "/roadmap" },
  prd: { name: "PRD Agent", icon: "📝", href: "/prd" },
  pitch_deck: { name: "Pitch Deck", icon: "🎯", href: "/pitch-deck" },
  persona: { name: "User Persona", icon: "👤", href: "/persona" },
  competitive_analysis: { name: "Competitive Analysis", icon: "🔍", href: "/competitive" },
};

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser();
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

  if (!isLoaded || loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#131314]">Dashboard</h1>
          <p className="text-[#58585a] text-[15px]">
            Welcome back{userData?.profile.name ? `, ${userData.profile.name.split(' ')[0]}` : ''}! Here's your overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* Credits Card */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-[24px] p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/80 text-[14px] font-medium">Available Credits</span>
              <Link href="/pricing" className="text-[12px] bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition">
                Get More
              </Link>
            </div>
            <div className="text-4xl font-bold mb-1">{userData?.profile.credits ?? 0}</div>
            <div className="text-white/70 text-[13px]">
              Plan: <span className="capitalize">{userData?.profile.plan ?? 'Free'}</span>
            </div>
          </div>

          {/* Generations Card */}
          <div className="bg-white border border-gray-200 rounded-[24px] p-6">
            <div className="text-[#58585a] text-[14px] font-medium mb-4">Total Generations</div>
            <div className="text-4xl font-bold text-[#131314] mb-1">
              {userData?.recentGenerations.length ?? 0}
            </div>
            <div className="text-[#58585a] text-[13px]">All time</div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white border border-gray-200 rounded-[24px] p-6">
            <div className="text-[#58585a] text-[14px] font-medium mb-4">Quick Actions</div>
            <div className="flex flex-wrap gap-2">
              <Link href="/roadmap" className="text-[13px] bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition">
                📊 Roadmap
              </Link>
              <Link href="/prd" className="text-[13px] bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition">
                📝 PRD
              </Link>
              <Link href="/history" className="text-[13px] bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition">
                📜 History
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Generations */}
          <div className="bg-white border border-gray-200 rounded-[24px] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#131314]">Recent Generations</h2>
              <Link href="/history" className="text-[13px] text-purple-600 hover:text-purple-700">
                View All →
              </Link>
            </div>
            
            {userData?.recentGenerations && userData.recentGenerations.length > 0 ? (
              <div className="space-y-4">
                {userData.recentGenerations.slice(0, 5).map((gen) => {
                  const tool = toolInfo[gen.tool_type] || { name: gen.tool_type, icon: "🔧", href: "#" };
                  return (
                    <div key={gen.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-xl">{tool.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[14px] text-[#131314] truncate">
                          {gen.title || tool.name}
                        </div>
                        <div className="text-[12px] text-[#58585a]">
                          {new Date(gen.created_at).toLocaleDateString()} · {gen.credits_used} credits
                        </div>
                      </div>
                      <Link 
                        href={`/history/${gen.id}`}
                        className="text-[12px] text-gray-500 hover:text-gray-700"
                      >
                        View
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🚀</div>
                <div className="text-[#58585a] text-[14px] mb-4">No generations yet</div>
                <Link 
                  href="/roadmap"
                  className="inline-block bg-[#090221] text-white text-[13px] px-4 py-2 rounded-lg hover:bg-[#1a1a2e] transition"
                >
                  Create Your First
                </Link>
              </div>
            )}
          </div>

          {/* Credit History */}
          <div className="bg-white border border-gray-200 rounded-[24px] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#131314]">Credit History</h2>
            </div>
            
            {userData?.recentTransactions && userData.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {userData.recentTransactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="text-[14px] text-[#131314]">
                        {tx.description || tx.type}
                      </div>
                      <div className="text-[12px] text-[#58585a]">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`text-[14px] font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#58585a] text-[14px]">
                No transactions yet
              </div>
            )}
          </div>
        </div>

        {/* Available Tools */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-[#131314] mb-6">Available Tools</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries(toolInfo).map(([key, tool]) => (
              <Link
                key={key}
                href={tool.href}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-sm transition group"
              >
                <span className="text-2xl mb-2 block">{tool.icon}</span>
                <div className="font-medium text-[14px] text-[#131314] group-hover:text-purple-600 transition">
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

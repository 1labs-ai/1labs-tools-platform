"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser, UserProfile } from "@clerk/nextjs";
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

export default function AccountPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/sign-in");
    }

    if (isSignedIn) {
      fetchUserData();
    }
  }, [isLoaded, isSignedIn, fetchUserData]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-[#58585a]">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const planColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-700",
    starter: "bg-blue-100 text-blue-700",
    pro: "bg-purple-100 text-purple-700",
    unlimited: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#131314]">Account Settings</h1>
          <Link
            href="/dashboard"
            className="text-[14px] text-purple-600 hover:text-purple-700"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Credits & Plan Section */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1 text-[#131314]">Credits & Plan</h2>
              <div className="flex items-center gap-3 mt-3">
                <div className="text-4xl font-bold" style={{ color: '#EC4899' }}>
                  {userData?.profile.plan === "unlimited" ? "∞" : userData?.profile.credits ?? 0}
                </div>
                <div>
                  <div className="text-[13px] text-[#58585a]">Available credits</div>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium mt-1 ${planColors[userData?.profile.plan || "free"]}`}>
                    {(userData?.profile.plan || "free").charAt(0).toUpperCase() + (userData?.profile.plan || "free").slice(1)} Plan
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/buy-credits"
                className="bg-[#090221] hover:bg-[#1a1a2e] text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors text-center"
              >
                {userData?.profile.plan === "unlimited" ? "Manage Subscription" : "Get More Credits"}
              </Link>
              <Link
                href="/pricing"
                className="text-[13px] text-center text-purple-600 hover:text-purple-700"
              >
                View All Plans
              </Link>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1 text-[#131314]">API Keys</h2>
              <div className="text-[13px] text-[#58585a]">Manage API keys for programmatic access to 1Labs tools</div>
            </div>
            <Link
              href="/account/api-keys"
              className="bg-gray-100 hover:bg-gray-200 text-[#131314] px-4 py-2 rounded-xl text-[14px] font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Manage Keys
            </Link>
          </div>
        </div>

        {/* Recent Usage */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#131314]">Recent Usage</h2>
            <Link href="/history" className="text-[13px] text-purple-600 hover:text-purple-700">
              View All →
            </Link>
          </div>
          
          {userData?.recentTransactions && userData.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {userData.recentTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-[14px] text-[#131314]">
                      {tx.description || tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </div>
                    <div className="text-[12px] text-[#58585a]">
                      {new Date(tx.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className={`text-[14px] font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[#58585a] text-[14px] text-center py-4">
              No usage yet. Generate your first roadmap or PRD to see your history here.
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-[#131314]">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/roadmap"
              className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="text-2xl mb-2">📊</span>
              <span className="text-[13px] text-[#58585a]">Roadmap</span>
            </Link>
            <Link
              href="/pitch-deck"
              className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="text-2xl mb-2">🎯</span>
              <span className="text-[13px] text-[#58585a]">Pitch Deck</span>
            </Link>
            <Link
              href="/persona"
              className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="text-2xl mb-2">👤</span>
              <span className="text-[13px] text-[#58585a]">Persona</span>
            </Link>
            <Link
              href="/docs"
              className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="text-2xl mb-2">📚</span>
              <span className="text-[13px] text-[#58585a]">API Docs</span>
            </Link>
          </div>
        </div>

        {/* Clerk User Profile */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-[#131314]">Profile Settings</h2>
          <UserProfile 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none",
                navbar: "hidden",
                pageScrollBox: "p-0",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

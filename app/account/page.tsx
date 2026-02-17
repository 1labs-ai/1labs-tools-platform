"use client";

import { useUser, UserProfile } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function AccountPage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-[#58585a]">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-[#131314]">Account Settings</h1>

        {/* Credits Section */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-[#131314]">Credits</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold" style={{ color: '#EC4899' }}>25</div>
              <div className="text-[13px] text-[#58585a]">Available credits</div>
            </div>
            <a
              href="/pricing"
              className="bg-[#090221] hover:bg-[#1a1a2e] text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors"
            >
              Get More Credits
            </a>
          </div>
        </div>

        {/* Usage History */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-[#131314]">Recent Usage</h2>
          <div className="text-[#58585a] text-[14px]">
            No usage yet. Generate your first roadmap or PRD to see your history here.
          </div>
        </div>

        {/* Clerk User Profile */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-[#131314]">Profile</h2>
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

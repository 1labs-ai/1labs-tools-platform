"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export function Header() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-500">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="3" />
                <circle cx="6" cy="12" r="2" />
                <circle cx="18" cy="12" r="2" />
                <circle cx="12" cy="6" r="2" />
                <circle cx="12" cy="18" r="2" />
              </svg>
            </div>
            <span className="font-semibold text-lg text-gray-900">
              1Labs<span className="text-pink-500">.ai</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/roadmap" className="text-gray-600 hover:text-gray-900 transition">
              Roadmap
            </Link>
            <Link href="/prd" className="text-gray-600 hover:text-gray-900 transition">
              PRD Agent
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition">
              Pricing
            </Link>
          </nav>

          {/* Auth */}
          <div className="flex items-center space-x-3">
            {!isLoaded ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
            ) : isSignedIn ? (
              <>
                <Link 
                  href="/account" 
                  className="text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  Account
                </Link>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg transition">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-lg transition">
                    Sign Up Free
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

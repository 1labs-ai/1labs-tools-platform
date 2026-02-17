"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export function Header() {
  const { isSignedIn, isLoaded, user } = useUser();
  
  // TODO: Fetch actual credits from database
  // For now using publicMetadata or default value
  const credits = (user?.publicMetadata?.credits as number) ?? 25;

  return (
    <header 
      className="sticky top-0 z-50 border-b border-white/20"
      style={{ 
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo — 1∞ Damru Mark + Wordmark + Tools Badge */}
          <Link href="/" className="flex items-center gap-3">
            {/* Damru Icon with Purple→Pink Gradient */}
            <svg width="36" height="36" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED"/>
                  <stop offset="40%" stopColor="#EC4899"/>
                  <stop offset="100%" stopColor="#FDF2F8"/>
                </linearGradient>
                <filter id="logoGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.5" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect width="80" height="80" rx="18" fill="#0A0A0A"/>
              <g transform="translate(10, 13)" filter="url(#logoGlow)">
                <path d="M2 27 C2 12, 15 12, 30 27 C45 42, 58 42, 58 27 C58 12, 45 12, 30 27 C15 42, 2 42, 2 27 Z" fill="none" stroke="url(#logoGrad)" strokeWidth="5" strokeLinecap="round"/>
                <rect x="26" y="0" width="8" height="54" rx="4" fill="url(#logoGrad)"/>
              </g>
            </svg>
            {/* Wordmark + Badge */}
            <div className="flex items-center gap-2">
              <span className="flex items-baseline text-[19px] font-semibold tracking-tight">
                <span className="font-bold" style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>1</span>
                <span className="text-[#090221] font-semibold">Labs</span>
                <span className="font-semibold" style={{ color: '#EC4899' }}>.ai</span>
              </span>
              {/* Tools Badge */}
              <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Tools
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/roadmap" className="text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
              Roadmap
            </Link>
            <Link href="/prd" className="text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
              PRD Agent
            </Link>
            <Link href="/pricing" className="text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {!isLoaded ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
            ) : isSignedIn ? (
              <>
                {/* Credits Display */}
                <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#7C3AED" strokeWidth="2"/>
                    <path d="M12 6v12M8 10l4-4 4 4M8 14l4 4 4-4" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[13px] font-semibold text-purple-700">{credits}</span>
                  <span className="text-[11px] text-purple-500">credits</span>
                </div>
                <Link 
                  href="/account" 
                  className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors"
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
                  <button className="text-[14px] text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-lg transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-[#090221] hover:bg-[#1a1a2e] text-white text-[14px] px-4 py-2 rounded-lg transition-colors">
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

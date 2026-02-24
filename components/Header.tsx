"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { CreditBalance } from "./CreditBalance";

export function Header() {
  const { isSignedIn, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            {/* Damru Icon with Purple→Pink Gradient */}
            <svg width="32" height="32" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 sm:w-9 sm:h-9">
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
              <span className="flex items-baseline text-[17px] sm:text-[19px] font-semibold tracking-tight">
                <span className="font-bold" style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>1</span>
                <span className="text-[#090221] font-semibold">Labs</span>
                <span className="font-semibold" style={{ color: '#EC4899' }}>.ai</span>
              </span>
              {/* Tools Badge */}
              <span className="hidden sm:inline text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Tools
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/roadmap" className="text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
              Roadmap
            </Link>
            <Link href="/pitch-deck" className="text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
              Pitch Deck
            </Link>
            <Link href="/pricing" className="text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-[15px] text-gray-600 hover:text-gray-900 transition-colors">
              API Docs
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {!isLoaded ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
            ) : isSignedIn ? (
              <>
                {/* Credit Balance with real-time updates and warnings */}
                <div className="hidden sm:block">
                  <CreditBalance showWarning={true} />
                </div>
                <Link 
                  href="/dashboard" 
                  className="hidden sm:block text-[14px] text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
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
                  <button className="hidden sm:block text-[14px] text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-lg transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-[#090221] hover:bg-[#1a1a2e] text-white text-[13px] sm:text-[14px] px-3 sm:px-4 py-2 rounded-lg transition-colors">
                    Sign Up Free
                  </button>
                </SignUpButton>
              </>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1">
              <Link 
                href="/roadmap" 
                className="text-[15px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                📊 Roadmap Generator
              </Link>
              <Link 
                href="/pitch-deck" 
                className="text-[15px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                🎯 Pitch Deck
              </Link>
              <Link 
                href="/persona" 
                className="text-[15px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                👤 User Persona
              </Link>
              <Link 
                href="/pricing" 
                className="text-[15px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                💳 Pricing
              </Link>
              <Link 
                href="/docs" 
                className="text-[15px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                📄 API Docs
              </Link>
              {isSignedIn && (
                <>
                  <div className="border-t border-gray-100 my-2" />
                  <Link 
                    href="/dashboard" 
                    className="text-[15px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📋 Dashboard
                  </Link>
                  <Link 
                    href="/history" 
                    className="text-[15px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📜 History
                  </Link>
                  <div className="px-3 py-2">
                    <CreditBalance showWarning={true} />
                  </div>
                </>
              )}
              {!isSignedIn && (
                <>
                  <div className="border-t border-gray-100 my-2" />
                  <SignInButton mode="modal">
                    <button 
                      className="text-left text-[15px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-colors w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </button>
                  </SignInButton>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

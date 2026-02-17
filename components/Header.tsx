"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export function Header() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 md:px-10 max-w-[1600px] mx-auto w-full pointer-events-none">
      {/* Logo with Glassmorphic Background — 1∞ Damru Mark + Wordmark */}
      <Link 
        href="/" 
        className="pointer-events-auto flex items-center gap-2.5 font-semibold text-[19px] tracking-tight bg-white/60 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full shadow-sm"
        style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
      >
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
        {/* Wordmark with Vivid Gradient */}
        <span className="flex items-baseline">
          <span className="font-bold" style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>1</span>
          <span className="text-[#090221] font-semibold">Labs</span>
          <span className="font-semibold" style={{ color: '#EC4899' }}>.ai</span>
        </span>
      </Link>

      {/* Pill Menu */}
      <div 
        className="pointer-events-auto bg-white/60 backdrop-blur-xl pl-8 pr-1.5 py-1.5 rounded-full flex items-center gap-6 hidden md:flex shadow-sm border border-white/20"
        style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
      >
        <div className="flex items-center gap-6">
          <Link href="/roadmap" className="text-[14px] font-medium text-[#58585a] hover:text-black transition-colors">
            Roadmap
          </Link>
          <Link href="/prd" className="text-[14px] font-medium text-[#58585a] hover:text-black transition-colors">
            PRD Agent
          </Link>
          <Link href="/pricing" className="text-[14px] font-medium text-[#58585a] hover:text-black transition-colors">
            Pricing
          </Link>
        </div>
        
        {/* Auth Buttons */}
        {!isLoaded ? (
          <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse ml-2" />
        ) : isSignedIn ? (
          <div className="flex items-center gap-3 ml-2">
            <Link 
              href="/account" 
              className="text-[14px] font-medium text-[#58585a] hover:text-black transition-colors"
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
          </div>
        ) : (
          <div className="flex items-center gap-2 ml-2">
            <SignInButton mode="modal">
              <button className="text-[14px] font-medium text-[#58585a] hover:text-black px-4 py-2 transition-colors">
                Login
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-[#090221] hover:bg-[#1a1a2e] text-white text-[14px] font-medium px-4 py-2 rounded-full transition-colors">
                Book Strategy Call
              </button>
            </SignUpButton>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="pointer-events-auto md:hidden bg-white/60 backdrop-blur-xl p-2 rounded-full shadow-sm border border-white/20 text-[#131314]"
        style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" x2="20" y1="12" y2="12"/>
          <line x1="4" x2="20" y1="6" y2="6"/>
          <line x1="4" x2="20" y1="18" y2="18"/>
        </svg>
      </button>
    </header>
  );
}

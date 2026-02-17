import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <Link href="https://1labs.ai" className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <defs>
              <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED"/>
                <stop offset="40%" stopColor="#EC4899"/>
                <stop offset="100%" stopColor="#FDF2F8"/>
              </linearGradient>
            </defs>
            <rect width="80" height="80" rx="18" fill="#0A0A0A"/>
            <g transform="translate(10, 13)">
              <path d="M2 27 C2 12, 15 12, 30 27 C45 42, 58 42, 58 27 C58 12, 45 12, 30 27 C15 42, 2 42, 2 27 Z" fill="none" stroke="url(#footerLogoGrad)" strokeWidth="5" strokeLinecap="round"/>
              <rect x="26" y="0" width="8" height="54" rx="4" fill="url(#footerLogoGrad)"/>
            </g>
          </svg>
          <span className="flex items-baseline text-[15px] font-semibold">
            <span style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700 }}>1</span>
            <span className="text-[#090221]">Labs</span>
            <span style={{ color: '#EC4899' }}>.ai</span>
          </span>
        </Link>

        {/* Tagline */}
        <p className="text-[14px] text-[#58585a]">
          Ship AI Products 10× Faster
        </p>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link href="https://1labs.ai/about" className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors">
            About
          </Link>
          <Link href="https://1labs.ai/contact" className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors">
            Contact
          </Link>
          <Link href="https://1labs.ai/privacy-policy" className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors">
            Privacy
          </Link>
          <Link href="https://1labs.ai/terms" className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}

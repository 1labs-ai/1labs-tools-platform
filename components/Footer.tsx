import Link from "next/link";

const tools = [
  { name: "Product Roadmap", href: "/roadmap" },
  { name: "Pitch Deck", href: "/pitch-deck" },
  { name: "User Persona", href: "/persona" },
  { name: "User Stories", href: "/user-stories" },
  { name: "Competitive Analysis", href: "/competitive-analysis" },
  { name: "Release Notes", href: "/release-notes" },
  { name: "Meeting Notes", href: "/meeting-notes" },
  { name: "FAQ Generator", href: "/faq-generator" },
];

const resources = [
  { name: "API Documentation", href: "/docs" },
  { name: "Pricing", href: "/pricing" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "History", href: "/history" },
];

const company = [
  { name: "About 1Labs.ai", href: "https://1labs.ai/about" },
  { name: "Contact", href: "https://1labs.ai/contact" },
  { name: "Privacy Policy", href: "https://1labs.ai/privacy-policy" },
  { name: "Terms of Service", href: "https://1labs.ai/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50/50">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="https://1labs.ai" className="flex items-center gap-2.5 mb-4">
              <svg width="32" height="32" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
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
              <span className="flex items-baseline text-[17px] font-semibold">
                <span style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700 }}>1</span>
                <span className="text-[#090221]">Labs</span>
                <span style={{ color: '#EC4899' }}>.ai</span>
              </span>
            </Link>
            <p className="text-[#58585a] text-[14px] mb-4 leading-relaxed">
              Ship AI Products 10× Faster with our suite of AI-powered tools for product teams.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a 
                href="https://twitter.com/1labsai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all hover:scale-105"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="https://linkedin.com/company/1labsai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all hover:scale-105"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
                </svg>
              </a>
              <a 
                href="https://github.com/1labs-ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all hover:scale-105"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Tools Column */}
          <div>
            <h4 className="text-[13px] font-semibold text-[#131314] uppercase tracking-wider mb-4">
              AI Tools
            </h4>
            <ul className="space-y-2.5">
              {tools.slice(0, 6).map((tool) => (
                <li key={tool.href}>
                  <Link 
                    href={tool.href}
                    className="text-[14px] text-[#58585a] hover:text-[#131314] transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-[13px] font-semibold text-[#131314] uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5">
              {resources.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className="text-[14px] text-[#58585a] hover:text-[#131314] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-[13px] font-semibold text-[#131314] uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {company.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className="text-[14px] text-[#58585a] hover:text-[#131314] transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-[#58585a]">
            © {new Date().getFullYear()} 1Labs AI Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors">
              API
            </Link>
            <Link href="https://1labs.ai/privacy-policy" className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors">
              Privacy
            </Link>
            <Link href="https://1labs.ai/terms" className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

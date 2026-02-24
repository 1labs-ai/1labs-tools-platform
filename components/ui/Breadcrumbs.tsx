"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

// Auto-generate breadcrumbs from path
const pathLabels: Record<string, string> = {
  roadmap: "Product Roadmap",
  "pitch-deck": "Pitch Deck",
  persona: "User Persona",
  "user-stories": "User Stories",
  "competitive-analysis": "Competitive Analysis",
  "release-notes": "Release Notes",
  "meeting-notes": "Meeting Notes",
  "faq-generator": "FAQ Generator",
  dashboard: "Dashboard",
  pricing: "Pricing",
  docs: "API Docs",
  history: "History",
  account: "Account",
  "api-keys": "API Keys",
  "buy-credits": "Buy Credits",
};

export function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Auto-generate if no items provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => ({
      label: pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      href: index < segments.length - 1 ? `/${segments.slice(0, index + 1).join("/")}` : undefined,
    }));
  })();

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-[13px] text-[#58585a] mb-6">
      {showHome && (
        <>
          <Link 
            href="/" 
            className="hover:text-[#131314] transition-colors flex items-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Home</span>
          </Link>
          <span className="text-gray-300">/</span>
        </>
      )}
      
      {breadcrumbItems.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="hover:text-[#131314] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#131314] font-medium">{item.label}</span>
          )}
          {index < breadcrumbItems.length - 1 && (
            <span className="text-gray-300">/</span>
          )}
        </span>
      ))}
    </nav>
  );
}

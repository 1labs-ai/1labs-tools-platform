import Link from "next/link";

const tools = [
  {
    name: "AI Product Roadmap",
    description: "Generate professional product roadmaps in seconds. Just describe your product and let AI create a visual roadmap.",
    href: "/roadmap",
    icon: "📊",
    status: "live",
    credits: 5,
  },
  {
    name: "PRD Agent",
    description: "Create comprehensive Product Requirement Documents with AI. From idea to detailed specs in minutes.",
    href: "/prd",
    icon: "📝",
    status: "live",
    credits: 10,
  },
  {
    name: "Pitch Deck Generator",
    description: "Build investor-ready pitch decks with AI. Professional slides that tell your story.",
    href: "/pitch-deck",
    icon: "🎯",
    status: "coming-soon",
    credits: 15,
  },
  {
    name: "User Persona Builder",
    description: "Create detailed user personas based on your product description and target market.",
    href: "/personas",
    icon: "👤",
    status: "coming-soon",
    credits: 5,
  },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FEFCF7] border border-[#F5E6D3] rounded-full px-4 py-2 mb-6 creme-badge-shadow">
            <span className="text-[13px] font-medium text-[#58585a]">✨ Free AI Tools from</span>
            <span className="text-[13px] font-semibold" style={{ color: '#EC4899' }}>1Labs.ai</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#131314] leading-tight">
            AI Tools for{" "}
            <span className="product-os-text">Product Teams</span>
          </h1>
          <p className="text-lg text-[#58585a] mb-8 max-w-2xl mx-auto leading-relaxed">
            Free AI-powered tools to accelerate your product development. 
            Generate roadmaps, PRDs, pitch decks and more in seconds.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/roadmap"
              className="bg-[#090221] hover:bg-[#1a1a2e] text-white px-6 py-3 rounded-full font-medium transition-colors text-[15px]"
            >
              Try Roadmap Generator →
            </Link>
            <Link 
              href="/pricing"
              className="border border-gray-200 hover:border-gray-300 text-[#58585a] hover:text-[#131314] px-6 py-3 rounded-full font-medium transition-colors text-[15px]"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-10 text-center text-[#131314]">Available Tools</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.status === "live" ? tool.href : "#"}
                className={`group block p-6 bg-white border border-gray-200 rounded-[24px] shadow-sm card-hover ${
                  tool.status === "live" 
                    ? "hover:border-purple-200" 
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{tool.icon}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-400">{tool.credits} credits</span>
                    {tool.status === "coming-soon" && (
                      <span className="text-[11px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#131314] group-hover:text-purple-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-[#58585a] text-[14px] leading-relaxed">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 text-[#131314]">Start Building Faster</h2>
          <p className="text-[#58585a] mb-6 text-[15px]">
            Sign up free and get 25 credits to try all our tools. No credit card required.
          </p>
          <Link 
            href="/sign-up"
            className="inline-block bg-[#090221] hover:bg-[#1a1a2e] text-white px-8 py-3 rounded-full font-medium transition-colors text-[15px]"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}

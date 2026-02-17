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
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            AI Tools for Product Teams
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Free AI-powered tools to accelerate your product development. 
            Generate roadmaps, PRDs, pitch decks and more in seconds.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/roadmap"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Try Roadmap Generator
            </Link>
            <Link 
              href="/pricing"
              className="border border-gray-700 hover:border-gray-600 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Available Tools</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.status === "live" ? tool.href : "#"}
                className={`group block p-6 bg-gray-900 border border-gray-800 rounded-xl transition ${
                  tool.status === "live" 
                    ? "hover:border-purple-500/50 hover:bg-gray-900/80" 
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{tool.icon}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{tool.credits} credits</span>
                    {tool.status === "coming-soon" && (
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400 transition">
                  {tool.name}
                </h3>
                <p className="text-gray-400 text-sm">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-gray-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Start Building Faster</h2>
          <p className="text-gray-400 mb-6">
            Sign up free and get 25 credits to try all our tools. No credit card required.
          </p>
          <Link 
            href="/sign-up"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-medium transition"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}

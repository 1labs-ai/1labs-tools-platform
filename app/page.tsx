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
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-4">
            ✨ Free AI Tools from <span className="text-pink-500">1Labs.ai</span>
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            AI Tools for{" "}
            <span className="gradient-text">Product Teams</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Free AI-powered tools to accelerate your product development. 
            Generate roadmaps, PRDs, pitch decks and more in seconds.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/roadmap"
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Try Roadmap Generator →
            </Link>
            <Link 
              href="/pricing"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Available Tools</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.status === "live" ? tool.href : "#"}
                className={`group block p-6 bg-white border border-gray-200 rounded-2xl shadow-sm transition ${
                  tool.status === "live" 
                    ? "hover:border-pink-300 hover:shadow-md" 
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{tool.icon}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{tool.credits} credits</span>
                    {tool.status === "coming-soon" && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-pink-500 transition">
                  {tool.name}
                </h3>
                <p className="text-gray-500 text-sm">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Start Building Faster</h2>
          <p className="text-gray-600 mb-6">
            Sign up free and get 25 credits to try all our tools. No credit card required.
          </p>
          <Link 
            href="/sign-up"
            className="inline-block bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}

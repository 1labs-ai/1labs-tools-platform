import Link from "next/link";

const tools = [
  {
    name: "AI Product Roadmap",
    description: "Generate professional product roadmaps in seconds. Just describe your product and let AI create a visual roadmap.",
    href: "/roadmap",
    icon: "📊",
    status: "live",
    credits: 5,
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    name: "Pitch Deck Generator",
    description: "Build investor-ready pitch decks with AI. Professional slides that tell your story.",
    href: "/pitch-deck",
    icon: "🎯",
    status: "live",
    credits: 15,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    name: "User Persona Builder",
    description: "Create detailed user personas based on your product description and target market.",
    href: "/persona",
    icon: "👤",
    status: "live",
    credits: 5,
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    name: "User Story Generator",
    description: "Transform feature descriptions into well-formatted user stories with acceptance criteria and story points.",
    href: "/user-stories",
    icon: "📝",
    status: "live",
    credits: 5,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    name: "Competitive Analysis",
    description: "Generate comprehensive competitor analysis with feature matrices, SWOT analysis, and strategic recommendations.",
    href: "/competitive-analysis",
    icon: "⚔️",
    status: "live",
    credits: 10,
    gradient: "from-red-500 to-pink-500",
  },
  {
    name: "Release Notes Generator",
    description: "Turn commits and changes into user-friendly release notes. Get markdown, Slack, and Twitter formats.",
    href: "/release-notes",
    icon: "🚀",
    status: "live",
    credits: 5,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    name: "Meeting Notes Summarizer",
    description: "Transform meeting transcripts into structured notes with action items, decisions, and key takeaways.",
    href: "/meeting-notes",
    icon: "📋",
    status: "live",
    credits: 5,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    name: "Product FAQ Generator",
    description: "Generate comprehensive FAQs for your product. Perfect for help centers and landing pages.",
    href: "/faq-generator",
    icon: "❓",
    status: "live",
    credits: 5,
    gradient: "from-blue-500 to-cyan-500",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Sign Up Free",
    description: "Create your account in seconds. No credit card required. Get 50 credits/month on the free plan.",
    icon: "✨",
  },
  {
    step: "02",
    title: "Choose Your Tool",
    description: "Select from our suite of AI-powered tools designed for product teams.",
    icon: "🛠️",
  },
  {
    step: "03",
    title: "Describe Your Product",
    description: "Fill in a simple form about your product, features, and target audience.",
    icon: "📝",
  },
  {
    step: "04",
    title: "Get Results in Seconds",
    description: "Our AI generates professional outputs instantly. Copy, download, or export to your favorite tools.",
    icon: "⚡",
  },
];

const faqs = [
  {
    question: "How many free credits do I get?",
    answer: "Free accounts get 50 credits per month. This is enough to try out multiple tools and see the quality of our AI-generated outputs.",
  },
  {
    question: "What are credits used for?",
    answer: "Each tool requires a certain number of credits per generation. For example, a Product Roadmap uses 5 credits, while a Pitch Deck uses 15 credits due to its complexity.",
  },
  {
    question: "Can I use the outputs commercially?",
    answer: "Yes! All generated content is yours to use for any purpose - personal projects, startups, or enterprise applications.",
  },
  {
    question: "Do you offer an API?",
    answer: "Yes, all our tools are available via REST API. Check out our API documentation to integrate our AI tools into your workflow.",
  },
  {
    question: "What AI models do you use?",
    answer: "We use a combination of GPT-4 and Claude to ensure the highest quality outputs. Our prompts are fine-tuned for product management use cases.",
  },
  {
    question: "Can I request custom tools?",
    answer: "Absolutely! We're constantly adding new tools based on user feedback. Contact us with your suggestions.",
  },
];

// Social proof logos will be added when we have real partnerships
// For now showing tool count and AI model info instead

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero Section with Animated Gradient */}
      <section className="relative py-20 px-4 hero-gradient hero-grid overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-5 py-2.5 mb-8 shadow-lg shadow-purple-500/5 hover:shadow-purple-500/10 transition-shadow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[13px] font-medium text-[#58585a]">✨ Free AI Tools from</span>
            <span className="text-[13px] font-bold animated-gradient-text">1Labs.ai</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-[#131314] leading-[1.1] tracking-tight">
            AI Tools for{" "}
            <span className="animated-gradient-text">Product Teams</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#58585a] mb-10 max-w-2xl mx-auto leading-relaxed">
            Generate roadmaps, PRDs, pitch decks, and more in seconds. 
            The same tools we use to ship AI products at <span className="font-semibold text-[#131314]">10× speed</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link 
              href="/roadmap"
              className="group relative bg-[#090221] hover:bg-[#1a1a2e] text-white px-8 py-4 rounded-full font-medium transition-all text-[16px] shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center gap-2">
                Try Roadmap Generator
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1 transition-transform">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </Link>
            <Link 
              href="/pricing"
              className="border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-[#58585a] hover:text-[#131314] px-8 py-4 rounded-full font-medium transition-all text-[16px] hover:-translate-y-0.5"
            >
              View Pricing
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#131314]">{tools.length}</div>
              <div className="text-[14px] text-[#58585a]">AI Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#131314]">GPT-4</div>
              <div className="text-[14px] text-[#58585a]">AI Model</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#131314]">25</div>
              <div className="text-[14px] text-[#58585a]">Free Credits</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-8 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xl">⚡</span>
              <span className="text-[14px] font-medium">GPT-4 Powered</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xl">🔒</span>
              <span className="text-[14px] font-medium">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xl">⏱️</span>
              <span className="text-[14px] font-medium">Results in Seconds</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xl">📤</span>
              <span className="text-[14px] font-medium">Export Anywhere</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-[13px] font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
              8 AI-Powered Tools
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#131314]">
              Everything You Need to Ship Faster
            </h2>
            <p className="text-[#58585a] text-[16px] max-w-xl mx-auto">
              Professional-grade AI tools designed specifically for product managers, founders, and teams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.status === "live" ? tool.href : "#"}
                className={`group relative p-5 sm:p-6 bg-white border border-gray-200 rounded-[20px] sm:rounded-[24px] tool-card card-shine ${
                  tool.status === "live" 
                    ? "hover:border-transparent cursor-pointer" 
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                {/* Icon with gradient background on hover */}
                <div className={`w-11 sm:w-12 h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <span className="text-xl sm:text-2xl filter brightness-0 invert">{tool.icon}</span>
                </div>
                
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#131314] group-hover:text-purple-600 transition-colors leading-tight">
                    {tool.name}
                  </h3>
                </div>
                
                <p className="text-[#58585a] text-[13px] sm:text-[14px] leading-relaxed mb-3 sm:mb-4">
                  {tool.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-[12px] text-gray-400 font-medium">
                    {tool.credits} credits
                  </span>
                  <span className="text-[13px] text-purple-600 font-medium sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Try it
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 9L7 6L4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-[13px] font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#131314]">
              How It Works
            </h2>
            <p className="text-[#58585a] text-[16px] max-w-xl mx-auto">
              Get professional outputs in under 30 seconds. No complex setup required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative">
                {/* Connector line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[calc(100%-20%)] h-[2px] bg-gradient-to-r from-purple-200 to-pink-200" />
                )}
                
                <div className="relative bg-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 border border-gray-200 hover:border-purple-200 transition-colors hover:shadow-lg group">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span className="text-[11px] sm:text-[12px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="text-[16px] sm:text-[17px] font-semibold text-[#131314] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[#58585a] text-[13px] sm:text-[14px] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-[13px] font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#131314]">
              Frequently Asked Questions
            </h2>
            <p className="text-[#58585a] text-[16px]">
              Everything you need to know about our AI tools.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white border border-gray-200 rounded-[20px] overflow-hidden hover:border-purple-200 transition-colors"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-[16px] font-medium text-[#131314] list-none">
                  {faq.question}
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 20 20" 
                    fill="none" 
                    className="flex-shrink-0 ml-4 transform group-open:rotate-180 transition-transform"
                  >
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-[#58585a] text-[15px] leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-[#090221] to-[#1a1a2e] rounded-[32px] p-12 md:p-16 text-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight">
                Ready to Build Faster?
              </h2>
              <p className="text-gray-300 mb-10 text-lg max-w-xl mx-auto">
                Product teams use our AI tools to ship 10× faster. 
                Start free with 50 credits/month.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  href="/sign-up"
                  className="group bg-white hover:bg-gray-100 text-[#090221] px-8 py-4 rounded-full font-semibold transition-all text-[16px] shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                >
                  <span className="flex items-center justify-center gap-2">
                    Get Started Free
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1 transition-transform">
                      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </Link>
                <Link 
                  href="/docs"
                  className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-full font-medium transition-all text-[16px] hover:bg-white/5"
                >
                  View API Docs
                </Link>
              </div>
              <p className="mt-6 text-gray-400 text-[14px]">
                No credit card required · 50 credits/month free · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out our tools",
    credits: "25 credits one-time",
    features: [
      "Access to all tools",
      "25 free credits to start",
      "Basic support",
    ],
    cta: "Get Started",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "For individuals and small projects",
    credits: "100 credits/month",
    features: [
      "Access to all tools",
      "100 credits per month",
      "Credits roll over (up to 200)",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: "/sign-up?plan=starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For power users and teams",
    credits: "500 credits/month",
    features: [
      "Access to all tools",
      "500 credits per month",
      "Credits roll over (up to 1000)",
      "Priority support",
      "Early access to new tools",
      "API access (coming soon)",
    ],
    cta: "Start Free Trial",
    href: "/sign-up?plan=pro",
    highlighted: true,
  },
  {
    name: "Unlimited",
    price: "$79",
    period: "/month",
    description: "For heavy users and agencies",
    credits: "Unlimited",
    features: [
      "Access to all tools",
      "Unlimited generations",
      "Priority support",
      "Early access to new tools",
      "API access (coming soon)",
      "Custom integrations",
    ],
    cta: "Start Free Trial",
    href: "/sign-up?plan=unlimited",
    highlighted: false,
  },
];

const creditUsage = [
  { tool: "AI Product Roadmap", credits: 5 },
  { tool: "PRD Agent", credits: 10 },
  { tool: "Pitch Deck Generator", credits: 15 },
  { tool: "User Persona Builder", credits: 5 },
];

export default function PricingPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#131314]">
            Simple, Credit-Based Pricing
          </h1>
          <p className="text-[#58585a] max-w-2xl mx-auto text-[15px]">
            Start free with 25 credits. Upgrade when you need more. 
            No hidden fees, no surprises.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white border rounded-[24px] p-6 shadow-sm card-hover ${
                plan.highlighted 
                  ? "border-purple-400 ring-2 ring-purple-400/20" 
                  : "border-gray-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] px-3 py-1 rounded-full font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-[#131314]">{plan.name}</h3>
                <p className="text-[#58585a] text-[13px]">{plan.description}</p>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-[#131314]">{plan.price}</span>
                <span className="text-[#58585a] text-[14px]">{plan.period}</span>
              </div>

              <div className="mb-6">
                <span className="inline-block bg-purple-50 text-purple-600 text-[13px] px-3 py-1 rounded-full font-medium">
                  {plan.credits}
                </span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-[13px]">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-[#58585a]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full text-center py-2.5 rounded-xl font-medium transition-colors text-[14px] ${
                  plan.highlighted
                    ? "bg-[#090221] hover:bg-[#1a1a2e] text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-[#131314]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Credit Usage Table */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-center text-[#131314]">Credit Usage</h2>
          <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-[13px] font-medium text-[#58585a]">Tool</th>
                  <th className="text-right py-3 px-4 text-[13px] font-medium text-[#58585a]">Credits</th>
                </tr>
              </thead>
              <tbody>
                {creditUsage.map((item) => (
                  <tr key={item.tool} className="border-b border-gray-200 last:border-0">
                    <td className="py-3 px-4 text-[14px] text-[#131314]">{item.tool}</td>
                    <td className="py-3 px-4 text-right text-[14px] font-medium" style={{ color: '#EC4899' }}>{item.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="text-xl font-bold mb-6 text-center text-[#131314]">FAQ</h2>
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-medium mb-2 text-[#131314] text-[15px]">What happens when I run out of credits?</h3>
              <p className="text-[#58585a] text-[14px]">
                You can purchase more credits or upgrade your plan. Free users can always earn more credits by referring friends.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-medium mb-2 text-[#131314] text-[15px]">Do unused credits roll over?</h3>
              <p className="text-[#58585a] text-[14px]">
                Yes! Paid plans allow credits to roll over up to 2x your monthly allocation.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-medium mb-2 text-[#131314] text-[15px]">Can I cancel anytime?</h3>
              <p className="text-[#58585a] text-[14px]">
                Absolutely. Cancel anytime with no questions asked. You&apos;ll keep access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

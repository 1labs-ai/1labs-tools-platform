"use client";

import { useState, useCallback } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LoadingSpinner } from "@/components/ui/SuccessAnimation";

interface RoadmapItem {
  week: string;
  title: string;
  description: string;
  priority: "must" | "should" | "nice";
}

interface Roadmap {
  productName: string;
  vision: string;
  items: RoadmapItem[];
}

const relatedTools = [
  { name: "Pitch Deck Generator", icon: "🎯", href: "/pitch-deck", credits: 15 },
  { name: "User Persona Builder", icon: "👤", href: "/persona", credits: 5 },
  { name: "Competitive Analysis", icon: "⚔️", href: "/competitive-analysis", credits: 10 },
];

export default function RoadmapPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [formData, setFormData] = useState({
    productName: "",
    problem: "",
    targetAudience: "",
    valueProposition: "",
    preferredLLM: "",
    features: ["", "", ""],
    featurePriorities: ["must", "must", "nice"],
  });
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [creditsInfo, setCreditsInfo] = useState<{ used?: number; remaining?: number } | null>(null);
  const [insufficientCredits, setInsufficientCredits] = useState<{ required: number; remaining: number } | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handlePriorityChange = (index: number, value: string) => {
    const newPriorities = [...formData.featurePriorities];
    newPriorities[index] = value;
    setFormData({ ...formData, featurePriorities: newPriorities });
  };

  const generateRoadmap = async () => {
    if (!formData.productName.trim() || !formData.problem.trim()) {
      setError("Please fill in the required fields");
      return;
    }

    if (!isSignedIn) {
      return;
    }

    setLoading(true);
    setError("");
    setInsufficientCredits(null);

    try {
      const response = await fetch("/api/generate/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setInsufficientCredits({
            required: data.credits_required,
            remaining: data.credits_remaining,
          });
          return;
        }
        throw new Error(data.error || "Failed to generate roadmap");
      }

      setRoadmap(data.roadmap);
      setCreditsInfo({
        used: data.credits_used,
        remaining: data.credits_remaining,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch {
      setError("Failed to copy to clipboard");
    }
  }, []);

  const getMarkdown = () => {
    if (!roadmap) return "";
    return `# ${roadmap.productName}

> ${roadmap.vision}

${roadmap.items.map((item) => `## ${item.week}: ${item.title}

**Priority:** ${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Have

${item.description}`).join('\n\n---\n\n')}`;
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateAnother = () => {
    setRoadmap(null);
    setCreditsInfo(null);
    setShowSuccess(false);
    setFormData({
      productName: "",
      problem: "",
      targetAudience: "",
      valueProposition: "",
      preferredLLM: "",
      features: ["", "", ""],
      featurePriorities: ["must", "must", "nice"],
    });
  };

  const priorityColors = {
    must: "text-red-600 bg-red-50 border-red-200",
    should: "text-amber-600 bg-amber-50 border-amber-200",
    nice: "text-green-600 bg-green-50 border-green-200",
  };

  const priorityLabels = {
    must: "Must Have",
    should: "Should Have",
    nice: "Nice to Have",
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4 bg-gray-50/30">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] p-8 shadow-2xl text-center transform animate-in zoom-in-95 duration-300">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <svg className="w-20 h-20" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="4" className="success-circle"/>
                <path d="M30 50 L45 65 L70 35" fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="success-check"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#131314] mb-1">Generated Successfully!</h3>
            <p className="text-[#58585a] text-[14px]">{creditsInfo?.used} credits used</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <Breadcrumbs />

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 mb-6 shadow-sm">
            <span className="text-[13px] font-medium text-[#58585a]">✨ 5 credits per generation</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#131314]">
            AI Product{" "}
            <span className="animated-gradient-text">Roadmap Generator</span>
          </h1>
          <p className="text-[#58585a] text-[15px] leading-relaxed max-w-lg mx-auto">
            Get a complete 6-week MVP roadmap for your product in seconds.
            The same framework we use to ship MVPs at 1Labs.
          </p>
        </div>

        {/* Insufficient Credits Banner */}
        {insufficientCredits && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-[20px] p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-800 mb-1">Insufficient Credits</p>
                <p className="text-[14px] text-amber-700 mb-3">
                  You need {insufficientCredits.required} credits but only have {insufficientCredits.remaining}.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-all hover:shadow-lg"
                >
                  Buy More Credits
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 10L8 7L5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        {!roadmap && (
          <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-5">
              {/* Product Name */}
              <div className="group">
                <label className="block text-[13px] font-medium text-[#131314] mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g., AI Writing Assistant"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>

              {/* Problem */}
              <div>
                <label className="block text-[13px] font-medium text-[#131314] mb-2">
                  What problem are you solving? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  placeholder="Describe the pain point your product addresses..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-[13px] font-medium text-[#131314] mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="e.g., Content marketers at SaaS companies"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>

              {/* Value Proposition */}
              <div>
                <label className="block text-[13px] font-medium text-[#131314] mb-2">
                  Core Value Proposition
                </label>
                <input
                  type="text"
                  value={formData.valueProposition}
                  onChange={(e) => setFormData({ ...formData, valueProposition: e.target.value })}
                  placeholder="The ONE thing your product does better than anything else"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>

              {/* Preferred LLM */}
              <div>
                <label className="block text-[13px] font-medium text-[#131314] mb-2">
                  Preferred LLM (if building an AI product)
                </label>
                <select
                  value={formData.preferredLLM}
                  onChange={(e) => setFormData({ ...formData, preferredLLM: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                >
                  <option value="">Select (optional)...</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="claude">Claude</option>
                  <option value="gemini">Gemini</option>
                  <option value="llama">LLaMA</option>
                  <option value="mistral">Mistral</option>
                  <option value="not-applicable">Not an AI product</option>
                </select>
              </div>

              {/* Key Features */}
              <div>
                <label className="block text-[13px] font-medium text-[#131314] mb-2">
                  Key Features (up to 3)
                </label>
                <div className="space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={formData.features[index]}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                      />
                      <select
                        value={formData.featurePriorities[index]}
                        onChange={(e) => handlePriorityChange(index, e.target.value)}
                        className="w-28 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-[13px] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                      >
                        <option value="must">🔴 Must</option>
                        <option value="should">🟡 Should</option>
                        <option value="nice">🟢 Nice</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-red-500 flex-shrink-0">⚠️</span>
                  <span className="text-red-700 text-[14px]">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                {!isLoaded ? (
                  <button 
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-4 rounded-xl font-medium text-[15px]"
                  >
                    Loading...
                  </button>
                ) : isSignedIn ? (
                  <button
                    onClick={generateRoadmap}
                    disabled={loading}
                    className="w-full bg-[#090221] hover:bg-[#1a1a2e] disabled:bg-gray-400 text-white py-4 rounded-xl font-medium transition-all text-[15px] flex items-center justify-center gap-2 hover:shadow-lg disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Generating your roadmap...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate My Roadmap</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </>
                    )}
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button className="w-full bg-[#090221] hover:bg-[#1a1a2e] text-white py-4 rounded-xl font-medium transition-all text-[15px] hover:shadow-lg">
                      Sign In to Generate →
                    </button>
                  </SignInButton>
                )}
                {!isSignedIn && (
                  <p className="text-center text-[13px] mt-3 text-[#58585a]">
                    Sign up free and get <span className="font-semibold text-purple-600">50 credits/month</span> to try all tools
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Roadmap Output */}
        {roadmap && (
          <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Credits Used Banner */}
            {creditsInfo && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">✓</span>
                  </div>
                  <span className="text-green-700 text-[14px] font-medium">
                    Generated successfully using {creditsInfo.used} credits
                  </span>
                </div>
                <span className="text-green-600 text-[13px] font-semibold bg-green-100 px-3 py-1 rounded-full">
                  {creditsInfo.remaining} remaining
                </span>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2 text-[#131314]">{roadmap.productName}</h2>
              <p className="text-[#58585a] text-[15px] italic bg-gray-50 rounded-xl p-4 border-l-4 border-purple-500">
                &ldquo;{roadmap.vision}&rdquo;
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {roadmap.items.map((item, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-[20px] p-5 transition-all hover:shadow-md ${priorityColors[item.priority]}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-[14px] text-[#131314] bg-white px-3 py-1 rounded-lg shadow-sm">
                      {item.week}
                    </span>
                    <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${priorityColors[item.priority]}`}>
                      {priorityLabels[item.priority]}
                    </span>
                  </div>
                  <h3 className="font-bold text-[17px] mb-2 text-[#131314]">{item.title}</h3>
                  <p className="text-[#58585a] text-[14px] leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => copyToClipboard(JSON.stringify(roadmap, null, 2), 'json')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  copySuccess === 'json' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-[#58585a] hover:bg-gray-200 hover:text-[#131314]'
                }`}
              >
                {copySuccess === 'json' ? '✓ Copied!' : '📋 Copy JSON'}
              </button>
              <button
                onClick={() => copyToClipboard(getMarkdown(), 'md')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  copySuccess === 'md' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-[#58585a] hover:bg-gray-200 hover:text-[#131314]'
                }`}
              >
                {copySuccess === 'md' ? '✓ Copied!' : '📝 Copy Markdown'}
              </button>
              <button
                onClick={() => downloadFile(getMarkdown(), `${roadmap.productName.replace(/\s+/g, '-').toLowerCase()}-roadmap.md`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-gray-100 text-[#58585a] hover:bg-gray-200 hover:text-[#131314] transition-all"
              >
                ⬇️ Download .md
              </button>
              <button
                onClick={handleGenerateAnother}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all ml-auto"
              >
                🔄 Generate Another
              </button>
            </div>
          </div>
        )}

        {/* Related Tools */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-[#131314] mb-4">Related Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group bg-white border border-gray-200 rounded-[20px] p-4 sm:p-5 hover:border-purple-200 hover:shadow-md transition-all flex sm:flex-col sm:text-center items-center sm:items-stretch gap-4 sm:gap-0"
              >
                <span className="text-3xl sm:mb-2 group-hover:scale-110 transition-transform">{tool.icon}</span>
                <div className="flex-1 sm:flex-none">
                  <div className="font-medium text-[14px] text-[#131314] group-hover:text-purple-600 transition-colors sm:mb-1">
                    {tool.name}
                  </div>
                  <div className="text-[12px] text-gray-400">{tool.credits} credits</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* API Access CTA */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-[24px] p-6 text-center">
          <h3 className="font-semibold text-[#131314] mb-2">Need API Access?</h3>
          <p className="text-[#58585a] text-[14px] mb-4">
            Generate roadmaps programmatically via our REST API.
          </p>
          <Link
            href="/account/api-keys"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#131314] px-5 py-2.5 rounded-xl text-[14px] font-medium transition-all border border-gray-200 hover:shadow-md"
          >
            Get API Key
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 10L8 7L5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

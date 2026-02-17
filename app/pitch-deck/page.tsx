"use client";

import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

interface PitchSlide {
  title: string;
  content: string;
  notes: string;
}

interface PitchDeck {
  companyName: string;
  tagline: string;
  slides: PitchSlide[];
}

export default function PitchDeckPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [formData, setFormData] = useState({
    companyName: "",
    problem: "",
    solution: "",
    targetMarket: "",
    businessModel: "",
    traction: "",
    team: "",
    askAmount: "",
  });
  const [pitchDeck, setPitchDeck] = useState<PitchDeck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generatePitchDeck = async () => {
    if (!formData.companyName.trim() || !formData.problem.trim() || !formData.solution.trim()) {
      setError("Please fill in at least Company Name, Problem, and Solution");
      return;
    }

    if (!isSignedIn) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate/pitch-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate pitch deck");
      }

      const data = await response.json();
      setPitchDeck(data.pitchDeck);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(pitchDeck, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(pitchDeck, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pitchDeck?.companyName || "pitch-deck"}-pitch-deck.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FEFCF7] border border-[#F5E6D3] rounded-full px-4 py-2 mb-6 creme-badge-shadow">
            <span className="text-[13px] font-medium text-[#58585a]">✨ Free AI Tool from</span>
            <span className="text-[13px] font-semibold" style={{ color: '#EC4899' }}>1Labs.ai</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#131314]">
            AI Pitch Deck{" "}
            <span className="product-os-text">Generator</span>
          </h1>
          <p className="text-[#58585a] text-[15px] leading-relaxed max-w-lg mx-auto">
            Generate a compelling investor-ready pitch deck in seconds.
            Perfect for fundraising, competitions, and demos.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
          <div className="space-y-5">
            {/* Company Name */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g., TechFlow AI"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {/* Problem */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Problem *
              </label>
              <textarea
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                placeholder="What problem are you solving? Who has this problem?"
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Solution */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Solution *
              </label>
              <textarea
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                placeholder="How does your product solve this problem?"
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Target Market */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Target Market
              </label>
              <input
                type="text"
                value={formData.targetMarket}
                onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                placeholder="e.g., SMBs in the US, enterprise SaaS companies, developers"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {/* Business Model */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Business Model
              </label>
              <input
                type="text"
                value={formData.businessModel}
                onChange={(e) => setFormData({ ...formData, businessModel: e.target.value })}
                placeholder="e.g., SaaS subscription, usage-based, freemium"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {/* Traction */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Traction
              </label>
              <textarea
                value={formData.traction}
                onChange={(e) => setFormData({ ...formData, traction: e.target.value })}
                placeholder="Users, revenue, growth rate, notable customers, partnerships..."
                rows={2}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Team */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Team
              </label>
              <textarea
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                placeholder="Key team members and their relevant experience..."
                rows={2}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Ask Amount */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Fundraising Ask
              </label>
              <input
                type="text"
                value={formData.askAmount}
                onChange={(e) => setFormData({ ...formData, askAmount: e.target.value })}
                placeholder="e.g., $500K seed round, $2M Series A"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {error && (
              <p className="text-red-500 text-[13px]">{error}</p>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              {!isLoaded ? (
                <button 
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-3.5 rounded-xl font-medium text-[15px]"
                >
                  Loading...
                </button>
              ) : isSignedIn ? (
                <button
                  onClick={generatePitchDeck}
                  disabled={loading}
                  className="w-full bg-[#58585a] hover:bg-[#3d3d3e] disabled:bg-gray-400 text-white py-3.5 rounded-xl font-medium transition-colors text-[15px]"
                >
                  {loading ? "Generating..." : "Generate Pitch Deck → (15 credits)"}
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button className="w-full bg-[#58585a] hover:bg-[#3d3d3e] text-white py-3.5 rounded-xl font-medium transition-colors text-[15px]">
                    Generate Pitch Deck →
                  </button>
                </SignInButton>
              )}
              <p className="text-center text-[13px] mt-3" style={{ color: '#EC4899' }}>
                Sign up free to get 25 credits
              </p>
            </div>
          </div>
        </div>

        {/* Pitch Deck Output */}
        {pitchDeck && (
          <div className="mt-8 bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-[#131314]">{pitchDeck.companyName}</h2>
              <p className="text-[#58585a] text-[14px] italic">{pitchDeck.tagline}</p>
            </div>

            <div className="space-y-4">
              {pitchDeck.slides.map((slide, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span 
                      className="w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-semibold text-white"
                      style={{ backgroundColor: '#EC4899' }}
                    >
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-[#131314]">{slide.title}</h3>
                  </div>
                  <p className="text-[#58585a] text-[13px] mb-3 whitespace-pre-wrap">{slide.content}</p>
                  {slide.notes && (
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <p className="text-[12px] text-[#888]">
                        <span className="font-medium">Speaker Notes:</span> {slide.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={copyToClipboard}
                className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors"
              >
                {copied ? "✅ Copied!" : "📋 Copy JSON"}
              </button>
              <button
                onClick={downloadJSON}
                className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors"
              >
                ⬇️ Download JSON
              </button>
              <button
                onClick={() => setPitchDeck(null)}
                className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors"
              >
                🔄 Generate New
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

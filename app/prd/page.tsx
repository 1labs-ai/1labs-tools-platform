"use client";

import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

interface PRDSection {
  title: string;
  content: string;
}

interface PRD {
  title: string;
  overview: string;
  sections: PRDSection[];
}

export default function PRDPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [productIdea, setProductIdea] = useState("");
  const [prd, setPrd] = useState<PRD | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generatePRD = async () => {
    if (!productIdea.trim()) {
      setError("Please describe your product idea");
      return;
    }

    if (!isSignedIn) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate/prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIdea }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate PRD");
      }

      const data = await response.json();
      setPrd(data.prd);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            AI PRD Agent
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Generate comprehensive Product Requirement Documents from a simple idea.
            Get detailed specs, user stories, and success metrics in minutes.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <label className="block text-sm font-medium mb-2">
            Describe your product idea
          </label>
          <textarea
            value={productIdea}
            onChange={(e) => setProductIdea(e.target.value)}
            placeholder="e.g., A mobile app that helps busy professionals meal prep by generating personalized weekly meal plans, shopping lists, and cooking instructions based on dietary preferences and available time..."
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
          />
          
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              💰 10 credits per generation
            </span>
            
            {!isLoaded ? (
              <div className="bg-gray-700 text-gray-400 px-6 py-2 rounded-lg">
                Loading...
              </div>
            ) : isSignedIn ? (
              <button
                onClick={generatePRD}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Generating PRD...
                  </>
                ) : (
                  "Generate PRD"
                )}
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition">
                  Sign In to Generate
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* PRD Output */}
        {prd && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{prd.title}</h2>
              <p className="text-gray-400">{prd.overview}</p>
            </div>

            <div className="space-y-6">
              {prd.sections.map((section, index) => (
                <div key={index} className="border-t border-gray-800 pt-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">
                    {section.title}
                  </h3>
                  <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4 border-t border-gray-800 pt-6">
              <button
                onClick={() => {
                  const text = `# ${prd.title}\n\n${prd.overview}\n\n${prd.sections.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n')}`;
                  navigator.clipboard.writeText(text);
                }}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                📋 Copy as Markdown
              </button>
              <button
                onClick={() => setPrd(null)}
                className="text-sm text-gray-400 hover:text-white transition"
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

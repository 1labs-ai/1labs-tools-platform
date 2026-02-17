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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    productIdea: "",
  });
  const [prd, setPrd] = useState<PRD | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generatePRD = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Please fill in your name and email");
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
        body: JSON.stringify(formData),
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
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm text-gray-500 mb-3">
            Free Tool from <span className="text-pink-500">ProductOS</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="gradient-text">PRD</span> Agent
          </h1>
          <p className="text-gray-500">
            Turn rough ideas into structured PRDs through
            AI-powered conversation.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="space-y-5">
            {/* Name */}
            <div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
              />
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Work email"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
              />
            </div>

            {/* Company */}
            <div>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company name"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
              />
            </div>

            {/* Role */}
            <div>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Your role (optional)"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              {!isLoaded ? (
                <button 
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-medium"
                >
                  Loading...
                </button>
              ) : isSignedIn ? (
                <button
                  onClick={generatePRD}
                  disabled={loading}
                  className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition"
                >
                  {loading ? "Starting..." : "Start Building My PRD →"}
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition">
                    Start Building My PRD →
                  </button>
                </SignInButton>
              )}
              <p className="text-center text-sm text-gray-400 mt-3">
                Free forever. No credit card required.
              </p>
            </div>
          </div>
        </div>

        {/* PRD Output */}
        {prd && (
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{prd.title}</h2>
              <p className="text-gray-500">{prd.overview}</p>
            </div>

            <div className="space-y-6">
              {prd.sections.map((section, index) => (
                <div key={index} className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-pink-500 mb-3">
                    {section.title}
                  </h3>
                  <div className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4 border-t border-gray-200 pt-6">
              <button
                onClick={() => {
                  const text = `# ${prd.title}\n\n${prd.overview}\n\n${prd.sections.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n')}`;
                  navigator.clipboard.writeText(text);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                📋 Copy as Markdown
              </button>
              <button
                onClick={() => setPrd(null)}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                🔄 Start New PRD
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

interface UserPersona {
  name: string;
  demographics: {
    age: string;
    gender: string;
    location: string;
    education: string;
    income: string;
    jobTitle: string;
  };
  background: string;
  behaviors: string[];
  goals: string[];
  frustrations: string[];
  motivations: string[];
  preferredChannels: string[];
  quote: string;
  dayInLife: string;
}

export default function PersonaPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [formData, setFormData] = useState({
    productDescription: "",
    targetIndustry: "",
    userRole: "",
    painPoints: "",
    goals: "",
  });
  const [persona, setPersona] = useState<UserPersona | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generatePersona = async () => {
    if (!formData.productDescription.trim() || !formData.targetIndustry.trim() || !formData.userRole.trim()) {
      setError("Please fill in the required fields");
      return;
    }

    if (!isSignedIn) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate persona");
      }

      const data = await response.json();
      setPersona(data.persona);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (persona) {
      navigator.clipboard.writeText(JSON.stringify(persona, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadAsJSON = () => {
    if (persona) {
      const blob = new Blob([JSON.stringify(persona, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${persona.name.replace(/\s+/g, "-").toLowerCase()}-persona.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const downloadAsMarkdown = () => {
    if (persona) {
      const md = `# User Persona: ${persona.name}

> "${persona.quote}"

## Demographics
- **Age:** ${persona.demographics.age}
- **Gender:** ${persona.demographics.gender}
- **Location:** ${persona.demographics.location}
- **Education:** ${persona.demographics.education}
- **Income:** ${persona.demographics.income}
- **Job Title:** ${persona.demographics.jobTitle}

## Background
${persona.background}

## Behaviors
${persona.behaviors.map(b => `- ${b}`).join('\n')}

## Goals
${persona.goals.map(g => `- ${g}`).join('\n')}

## Frustrations
${persona.frustrations.map(f => `- ${f}`).join('\n')}

## Motivations
${persona.motivations.map(m => `- ${m}`).join('\n')}

## Preferred Channels
${persona.preferredChannels.map(c => `- ${c}`).join('\n')}

## A Day in Their Life
${persona.dayInLife}
`;
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${persona.name.replace(/\s+/g, "-").toLowerCase()}-persona.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
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
            AI User{" "}
            <span className="product-os-text">Persona Builder</span>
          </h1>
          <p className="text-[#58585a] text-[15px] leading-relaxed max-w-lg mx-auto">
            Create detailed, research-backed user personas in seconds.
            Understand your users better to build products they love.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
          <div className="space-y-5">
            {/* Product Description */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Product Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.productDescription}
                onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                placeholder="Describe your product or service. What does it do? What value does it provide?"
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Target Industry */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Target Industry <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.targetIndustry}
                onChange={(e) => setFormData({ ...formData, targetIndustry: e.target.value })}
                placeholder="e.g., SaaS, E-commerce, Healthcare, FinTech"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {/* User Role */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                User Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.userRole}
                onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
                placeholder="e.g., Marketing Manager, Software Developer, Small Business Owner"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {/* Pain Points (Optional) */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Pain Points <span className="text-[#58585a]">(optional)</span>
              </label>
              <textarea
                value={formData.painPoints}
                onChange={(e) => setFormData({ ...formData, painPoints: e.target.value })}
                placeholder="What challenges or frustrations does your target user face?"
                rows={2}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Goals (Optional) */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Goals <span className="text-[#58585a]">(optional)</span>
              </label>
              <textarea
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                placeholder="What is your target user trying to achieve?"
                rows={2}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
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
                  onClick={generatePersona}
                  disabled={loading}
                  className="w-full bg-[#58585a] hover:bg-[#3d3d3e] disabled:bg-gray-400 text-white py-3.5 rounded-xl font-medium transition-colors text-[15px]"
                >
                  {loading ? "Generating..." : "Generate User Persona → (5 credits)"}
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button className="w-full bg-[#58585a] hover:bg-[#3d3d3e] text-white py-3.5 rounded-xl font-medium transition-colors text-[15px]">
                    Generate User Persona →
                  </button>
                </SignInButton>
              )}
              <p className="text-center text-[13px] mt-3" style={{ color: '#EC4899' }}>
                Sign up free to get 25 credits
              </p>
            </div>
          </div>
        </div>

        {/* Persona Output */}
        {persona && (
          <div className="mt-8 bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
            {/* Persona Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-2xl">
                👤
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#131314]">{persona.name}</h2>
                <p className="text-[#58585a] text-[14px]">{persona.demographics.jobTitle}</p>
                <p className="text-[13px] text-[#58585a] mt-1 italic">&ldquo;{persona.quote}&rdquo;</p>
              </div>
            </div>

            {/* Demographics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-[#58585a] uppercase tracking-wide">Age</p>
                <p className="text-[14px] font-medium text-[#131314]">{persona.demographics.age}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-[#58585a] uppercase tracking-wide">Gender</p>
                <p className="text-[14px] font-medium text-[#131314]">{persona.demographics.gender}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-[#58585a] uppercase tracking-wide">Location</p>
                <p className="text-[14px] font-medium text-[#131314]">{persona.demographics.location}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-[#58585a] uppercase tracking-wide">Education</p>
                <p className="text-[14px] font-medium text-[#131314]">{persona.demographics.education}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-[#58585a] uppercase tracking-wide">Income</p>
                <p className="text-[14px] font-medium text-[#131314]">{persona.demographics.income}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-[#58585a] uppercase tracking-wide">Role</p>
                <p className="text-[14px] font-medium text-[#131314]">{persona.demographics.jobTitle}</p>
              </div>
            </div>

            {/* Background */}
            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-[#131314] uppercase tracking-wide mb-2">Background</h3>
              <p className="text-[14px] text-[#58585a] leading-relaxed">{persona.background}</p>
            </div>

            {/* Goals & Frustrations */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <h3 className="text-[13px] font-semibold text-green-700 uppercase tracking-wide mb-2">🎯 Goals</h3>
                <ul className="space-y-1.5">
                  {persona.goals.map((goal, index) => (
                    <li key={index} className="text-[13px] text-[#58585a] flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <h3 className="text-[13px] font-semibold text-red-700 uppercase tracking-wide mb-2">😤 Frustrations</h3>
                <ul className="space-y-1.5">
                  {persona.frustrations.map((frustration, index) => (
                    <li key={index} className="text-[13px] text-[#58585a] flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">✕</span>
                      {frustration}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Behaviors */}
            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-[#131314] uppercase tracking-wide mb-2">💡 Behaviors</h3>
              <div className="flex flex-wrap gap-2">
                {persona.behaviors.map((behavior, index) => (
                  <span key={index} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-[12px]">
                    {behavior}
                  </span>
                ))}
              </div>
            </div>

            {/* Motivations */}
            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-[#131314] uppercase tracking-wide mb-2">🔥 Motivations</h3>
              <ul className="space-y-1.5">
                {persona.motivations.map((motivation, index) => (
                  <li key={index} className="text-[13px] text-[#58585a] flex items-start gap-2">
                    <span style={{ color: '#EC4899' }}>→</span>
                    {motivation}
                  </li>
                ))}
              </ul>
            </div>

            {/* Preferred Channels */}
            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-[#131314] uppercase tracking-wide mb-2">📱 Preferred Channels</h3>
              <div className="flex flex-wrap gap-2">
                {persona.preferredChannels.map((channel, index) => (
                  <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-[12px]">
                    {channel}
                  </span>
                ))}
              </div>
            </div>

            {/* Day in Life */}
            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-[#131314] uppercase tracking-wide mb-2">🌅 A Day in Their Life</h3>
              <p className="text-[14px] text-[#58585a] leading-relaxed bg-gray-50 rounded-xl p-4">{persona.dayInLife}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={copyToClipboard}
                className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors"
              >
                {copied ? "✅ Copied!" : "📋 Copy JSON"}
              </button>
              <button
                onClick={downloadAsJSON}
                className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors"
              >
                💾 Download JSON
              </button>
              <button
                onClick={downloadAsMarkdown}
                className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors"
              >
                📄 Download Markdown
              </button>
              <button
                onClick={() => setPersona(null)}
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

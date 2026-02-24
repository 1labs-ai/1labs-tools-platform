"use client";

import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

interface ReleaseNotesResult {
  version: string;
  releaseDate: string;
  title: string;
  summary: string;
  highlights: string[];
  sections: {
    type: "new" | "improved" | "fixed" | "deprecated" | "security";
    title: string;
    items: {
      description: string;
      details?: string;
    }[];
  }[];
  breakingChanges: string[];
  upgradeNotes: string[];
  markdown: string;
  slack: string;
  twitter: string;
}

export default function ReleaseNotesPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [formData, setFormData] = useState({
    changes: "",
    version: "",
    productName: "",
    audience: "users",
  });
  const [result, setResult] = useState<ReleaseNotesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"formatted" | "markdown" | "slack" | "twitter">("formatted");

  const generateNotes = async () => {
    if (!formData.changes.trim()) {
      setError("Please provide changes or commits");
      return;
    }

    if (!isSignedIn) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate/release-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate release notes");
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "new": return "✨";
      case "improved": return "🚀";
      case "fixed": return "🐛";
      case "deprecated": return "⚠️";
      case "security": return "🔒";
      default: return "📝";
    }
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case "new": return "bg-green-50 border-green-200 text-green-700";
      case "improved": return "bg-blue-50 border-blue-200 text-blue-700";
      case "fixed": return "bg-orange-50 border-orange-200 text-orange-700";
      case "deprecated": return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "security": return "bg-red-50 border-red-200 text-red-700";
      default: return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#FEFCF7] border border-[#F5E6D3] rounded-full px-4 py-2 mb-6 creme-badge-shadow">
            <span className="text-[13px] font-medium text-[#58585a]">✨ Free AI Tool from</span>
            <span className="text-[13px] font-semibold" style={{ color: '#EC4899' }}>1Labs.ai</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#131314]">
            AI Release{" "}
            <span className="product-os-text">Notes Generator</span>
          </h1>
          <p className="text-[#58585a] text-[15px] leading-relaxed max-w-lg mx-auto">
            Transform your commits and changes into user-friendly release notes. 
            Get multiple formats: markdown, Slack, and Twitter-ready.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
          <div className="space-y-5">
            {/* Changes */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Changes / Commits <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.changes}
                onChange={(e) => setFormData({ ...formData, changes: e.target.value })}
                placeholder="Paste your commit messages, change log, or describe what changed. One item per line.&#10;&#10;Examples:&#10;- feat: Add dark mode support&#10;- fix: Resolve login issue on mobile&#10;- perf: Improve dashboard load time by 40%&#10;- Added export to CSV feature&#10;- Fixed bug where notifications weren't showing"
                rows={8}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Version */}
              <div>
                <label className="block text-[13px] font-medium text-[#131314] mb-2">
                  Version <span className="text-[#58585a]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g., 2.1.0"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                />
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-[13px] font-medium text-[#131314] mb-2">
                  Product Name <span className="text-[#58585a]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g., Acme App"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Audience */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Target Audience
              </label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              >
                <option value="users">End Users (non-technical)</option>
                <option value="developers">Developers (technical)</option>
                <option value="mixed">Mixed Audience</option>
              </select>
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
                  onClick={generateNotes}
                  disabled={loading}
                  className="w-full bg-[#58585a] hover:bg-[#3d3d3e] disabled:bg-gray-400 text-white py-3.5 rounded-xl font-medium transition-colors text-[15px]"
                >
                  {loading ? "Generating..." : "Generate Release Notes → (5 credits)"}
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button className="w-full bg-[#58585a] hover:bg-[#3d3d3e] text-white py-3.5 rounded-xl font-medium transition-colors text-[15px]">
                    Generate Release Notes →
                  </button>
                </SignInButton>
              )}
              <p className="text-center text-[13px] mt-3" style={{ color: '#EC4899' }}>
                Sign up free · 50 credits/month
              </p>
            </div>
          </div>
        </div>

        {/* Output */}
        {result && (
          <div className="mt-8 bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] font-mono bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {result.version}
                  </span>
                  <span className="text-[12px] text-[#58585a]">{result.releaseDate}</span>
                </div>
                <h2 className="text-2xl font-bold text-[#131314]">{result.title}</h2>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
              {(["formatted", "markdown", "slack", "twitter"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-3 rounded-lg text-[13px] font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-white text-[#131314] shadow-sm"
                      : "text-[#58585a] hover:text-[#131314]"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Formatted View */}
            {activeTab === "formatted" && (
              <div className="space-y-6">
                {/* Summary */}
                <p className="text-[14px] text-[#58585a] leading-relaxed">{result.summary}</p>

                {/* Highlights */}
                {result.highlights.length > 0 && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h3 className="text-[13px] font-semibold text-purple-700 uppercase tracking-wide mb-2">
                      ⭐ Highlights
                    </h3>
                    <ul className="space-y-1">
                      {result.highlights.map((h, i) => (
                        <li key={i} className="text-[13px] text-[#131314] flex items-start gap-2">
                          <span className="text-purple-500">•</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sections */}
                {result.sections.map((section, index) => (
                  <div key={index} className={`border rounded-xl p-4 ${getSectionColor(section.type)}`}>
                    <h3 className="text-[13px] font-semibold uppercase tracking-wide mb-2">
                      {getSectionIcon(section.type)} {section.title}
                    </h3>
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="text-[13px]">
                          <span className="text-[#131314]">{item.description}</span>
                          {item.details && (
                            <p className="text-[12px] text-[#58585a] mt-0.5">{item.details}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Breaking Changes */}
                {result.breakingChanges.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <h3 className="text-[13px] font-semibold text-red-700 uppercase tracking-wide mb-2">
                      🚨 Breaking Changes
                    </h3>
                    <ul className="space-y-1">
                      {result.breakingChanges.map((change, i) => (
                        <li key={i} className="text-[13px] text-red-800">{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Upgrade Notes */}
                {result.upgradeNotes.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="text-[13px] font-semibold text-blue-700 uppercase tracking-wide mb-2">
                      📋 Upgrade Notes
                    </h3>
                    <ul className="space-y-1">
                      {result.upgradeNotes.map((note, i) => (
                        <li key={i} className="text-[13px] text-blue-800">{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Markdown View */}
            {activeTab === "markdown" && (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(result.markdown, "markdown")}
                    className="text-[12px] text-purple-600 hover:text-purple-700"
                  >
                    {copied === "markdown" ? "✅ Copied!" : "📋 Copy"}
                  </button>
                </div>
                <pre className="bg-gray-50 rounded-xl p-4 text-[13px] overflow-x-auto whitespace-pre-wrap font-mono text-[#58585a]">
                  {result.markdown}
                </pre>
              </div>
            )}

            {/* Slack View */}
            {activeTab === "slack" && (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(result.slack, "slack")}
                    className="text-[12px] text-purple-600 hover:text-purple-700"
                  >
                    {copied === "slack" ? "✅ Copied!" : "📋 Copy"}
                  </button>
                </div>
                <pre className="bg-gray-50 rounded-xl p-4 text-[13px] overflow-x-auto whitespace-pre-wrap font-mono text-[#58585a]">
                  {result.slack}
                </pre>
              </div>
            )}

            {/* Twitter View */}
            {activeTab === "twitter" && (
              <div className="space-y-3">
                <div className="flex justify-end items-center gap-3">
                  <span className="text-[12px] text-[#58585a]">
                    {result.twitter.length}/280 characters
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.twitter, "twitter")}
                    className="text-[12px] text-purple-600 hover:text-purple-700"
                  >
                    {copied === "twitter" ? "✅ Copied!" : "📋 Copy"}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-[14px] text-[#131314]">
                  {result.twitter}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  const blob = new Blob([result.markdown], { type: "text/markdown" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `release-notes-${result.version}.md`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors"
              >
                📄 Download Markdown
              </button>
              <button
                onClick={() => setResult(null)}
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

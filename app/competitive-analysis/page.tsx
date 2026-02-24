"use client";

import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

interface Competitor {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
  targetMarket: string;
  keyFeatures: string[];
}

interface CompetitiveAnalysisResult {
  yourProduct: {
    name: string;
    positioning: string;
    uniqueValue: string;
  };
  competitors: Competitor[];
  featureMatrix: {
    feature: string;
    importance: "critical" | "high" | "medium" | "low";
    yourProduct: boolean;
    competitors: Record<string, boolean>;
  }[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  recommendations: string[];
  marketGaps: string[];
}

export default function CompetitiveAnalysisPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    competitors: "",
    industry: "",
  });
  const [result, setResult] = useState<CompetitiveAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generateAnalysis = async () => {
    if (!formData.productName.trim() || !formData.productDescription.trim() || !formData.competitors.trim()) {
      setError("Please fill in the required fields");
      return;
    }

    if (!isSignedIn) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate/competitive-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate analysis");
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadAsMarkdown = () => {
    if (result) {
      const md = `# Competitive Analysis: ${result.yourProduct.name}

## Your Product
**Positioning:** ${result.yourProduct.positioning}

**Unique Value:** ${result.yourProduct.uniqueValue}

---

## Competitors

${result.competitors.map(c => `### ${c.name}
${c.description}

**Target Market:** ${c.targetMarket}
**Pricing:** ${c.pricing}

**Strengths:**
${c.strengths.map(s => `- ${s}`).join('\n')}

**Weaknesses:**
${c.weaknesses.map(w => `- ${w}`).join('\n')}

**Key Features:**
${c.keyFeatures.map(f => `- ${f}`).join('\n')}
`).join('\n---\n\n')}

---

## Feature Comparison Matrix

| Feature | Importance | ${result.yourProduct.name} | ${result.competitors.map(c => c.name).join(' | ')} |
|---------|------------|${'-'.repeat(result.yourProduct.name.length + 2)}|${result.competitors.map(c => '-'.repeat(c.name.length + 2)).join('|')}|
${result.featureMatrix.map(f => `| ${f.feature} | ${f.importance} | ${f.yourProduct ? '✅' : '❌'} | ${result.competitors.map(c => f.competitors[c.name] ? '✅' : '❌').join(' | ')} |`).join('\n')}

---

## SWOT Analysis

### Strengths
${result.swot.strengths.map(s => `- ${s}`).join('\n')}

### Weaknesses
${result.swot.weaknesses.map(w => `- ${w}`).join('\n')}

### Opportunities
${result.swot.opportunities.map(o => `- ${o}`).join('\n')}

### Threats
${result.swot.threats.map(t => `- ${t}`).join('\n')}

---

## Market Gaps
${result.marketGaps.map(g => `- ${g}`).join('\n')}

---

## Recommendations
${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `competitive-analysis-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#FEFCF7] border border-[#F5E6D3] rounded-full px-4 py-2 mb-6 creme-badge-shadow">
            <span className="text-[13px] font-medium text-[#58585a]">✨ Free AI Tool from</span>
            <span className="text-[13px] font-semibold" style={{ color: '#EC4899' }}>1Labs.ai</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#131314]">
            AI Competitive{" "}
            <span className="product-os-text">Analysis Generator</span>
          </h1>
          <p className="text-[#58585a] text-[15px] leading-relaxed max-w-lg mx-auto">
            Generate comprehensive competitive analysis with feature matrices, 
            SWOT analysis, and strategic recommendations.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
          <div className="space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Your Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="e.g., Acme Analytics"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {/* Product Description */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Product Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.productDescription}
                onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                placeholder="Describe your product, its main features, target audience, and value proposition"
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Competitors */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Competitors <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.competitors}
                onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
                placeholder="List your competitors (one per line or comma-separated). Include brief descriptions if helpful.&#10;e.g., Mixpanel - product analytics, Amplitude - behavioral analytics"
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Industry <span className="text-[#58585a]">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., SaaS, E-commerce, FinTech, HealthTech"
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
                  onClick={generateAnalysis}
                  disabled={loading}
                  className="w-full bg-[#58585a] hover:bg-[#3d3d3e] disabled:bg-gray-400 text-white py-3.5 rounded-xl font-medium transition-colors text-[15px]"
                >
                  {loading ? "Analyzing..." : "Generate Analysis → (10 credits)"}
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button className="w-full bg-[#58585a] hover:bg-[#3d3d3e] text-white py-3.5 rounded-xl font-medium transition-colors text-[15px]">
                    Generate Analysis →
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
          <div className="mt-8 space-y-6">
            {/* Your Product */}
            <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#131314] mb-4">📊 {result.yourProduct.name}</h2>
              <div className="space-y-3">
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide mb-1">Positioning</p>
                  <p className="text-[14px] text-[#131314]">{result.yourProduct.positioning}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-[11px] font-semibold text-green-700 uppercase tracking-wide mb-1">Unique Value</p>
                  <p className="text-[14px] text-[#131314]">{result.yourProduct.uniqueValue}</p>
                </div>
              </div>
            </div>

            {/* Competitors */}
            <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#131314] mb-4">🎯 Competitor Profiles</h2>
              <div className="space-y-4">
                {result.competitors.map((competitor, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-[#131314] mb-2">{competitor.name}</h3>
                    <p className="text-[13px] text-[#58585a] mb-3">{competitor.description}</p>
                    <div className="grid md:grid-cols-2 gap-3 mb-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[11px] text-[#58585a] uppercase tracking-wide">Target Market</p>
                        <p className="text-[13px] font-medium text-[#131314]">{competitor.targetMarket}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[11px] text-[#58585a] uppercase tracking-wide">Pricing</p>
                        <p className="text-[13px] font-medium text-[#131314]">{competitor.pricing}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] font-semibold text-green-700 uppercase tracking-wide mb-1">✓ Strengths</p>
                        <ul className="text-[12px] text-[#58585a] space-y-1">
                          {competitor.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wide mb-1">✕ Weaknesses</p>
                        <ul className="text-[12px] text-[#58585a] space-y-1">
                          {competitor.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Matrix */}
            <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm overflow-x-auto">
              <h2 className="text-xl font-bold text-[#131314] mb-4">📋 Feature Comparison</h2>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 font-semibold text-[#131314]">Feature</th>
                    <th className="text-center py-2 px-3 font-semibold text-[#131314]">{result.yourProduct.name}</th>
                    {result.competitors.map((c, i) => (
                      <th key={i} className="text-center py-2 px-3 font-semibold text-[#131314]">{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.featureMatrix.map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 pr-4 text-[#58585a]">
                        {row.feature}
                        <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                          row.importance === 'critical' ? 'bg-red-100 text-red-600' :
                          row.importance === 'high' ? 'bg-orange-100 text-orange-600' :
                          row.importance === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>{row.importance}</span>
                      </td>
                      <td className="text-center py-2 px-3">{row.yourProduct ? '✅' : '❌'}</td>
                      {result.competitors.map((c, i) => (
                        <td key={i} className="text-center py-2 px-3">
                          {row.competitors[c.name] ? '✅' : '❌'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SWOT */}
            <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#131314] mb-4">🔄 SWOT Analysis</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <h3 className="text-[13px] font-semibold text-green-700 uppercase tracking-wide mb-2">💪 Strengths</h3>
                  <ul className="text-[13px] text-[#58585a] space-y-1">
                    {result.swot.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <h3 className="text-[13px] font-semibold text-red-700 uppercase tracking-wide mb-2">⚠️ Weaknesses</h3>
                  <ul className="text-[13px] text-[#58585a] space-y-1">
                    {result.swot.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <h3 className="text-[13px] font-semibold text-blue-700 uppercase tracking-wide mb-2">🚀 Opportunities</h3>
                  <ul className="text-[13px] text-[#58585a] space-y-1">
                    {result.swot.opportunities.map((o, i) => <li key={i}>• {o}</li>)}
                  </ul>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                  <h3 className="text-[13px] font-semibold text-yellow-700 uppercase tracking-wide mb-2">⚡ Threats</h3>
                  <ul className="text-[13px] text-[#58585a] space-y-1">
                    {result.swot.threats.map((t, i) => <li key={i}>• {t}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {/* Market Gaps & Recommendations */}
            <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#131314] mb-3">🔍 Market Gaps</h2>
                <div className="flex flex-wrap gap-2">
                  {result.marketGaps.map((gap, i) => (
                    <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-[12px]">
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#131314] mb-3">💡 Recommendations</h2>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] text-[#58585a]">
                      <span className="text-purple-500 font-bold">{i + 1}.</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={copyToClipboard}
                className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors"
              >
                {copied ? "✅ Copied!" : "📋 Copy JSON"}
              </button>
              <button
                onClick={downloadAsMarkdown}
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

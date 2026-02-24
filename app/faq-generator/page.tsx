"use client";

import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface FAQResult {
  productName: string;
  categories: string[];
  faqs: FAQ[];
  additionalResources: string[];
}

export default function FAQGeneratorPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [formData, setFormData] = useState({
    productDescription: "",
    targetAudience: "",
    existingFaqs: "",
    numberOfFaqs: "10",
  });
  const [result, setResult] = useState<FAQResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const generateFaqs = async () => {
    if (!formData.productDescription.trim()) {
      setError("Please provide a product description");
      return;
    }

    if (!isSignedIn) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate/faq-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate FAQs");
      }

      const data = await response.json();
      setResult(data.result);
      setSelectedCategory("all");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      const text = result.faqs.map(faq => 
        `**Q: ${faq.question}**\nA: ${faq.answer}\n`
      ).join("\n");
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadAsMarkdown = () => {
    if (result) {
      const md = `# ${result.productName} - Frequently Asked Questions

${result.categories.map(category => `## ${category}

${result.faqs
  .filter(faq => faq.category === category)
  .map(faq => `### ${faq.question}

${faq.answer}
`).join("\n")}`).join("\n---\n\n")}

---

## Additional Resources
${result.additionalResources.map(r => `- ${r}`).join("\n")}
`;
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `faq-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const downloadAsJSON = () => {
    if (result) {
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `faq-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const filteredFaqs = result?.faqs.filter(
    faq => selectedCategory === "all" || faq.category === selectedCategory
  ) || [];

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
            AI Product{" "}
            <span className="product-os-text">FAQ Generator</span>
          </h1>
          <p className="text-[#58585a] text-[15px] leading-relaxed max-w-lg mx-auto">
            Generate comprehensive FAQs for your product. Perfect for help centers, 
            landing pages, and customer support documentation.
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
                placeholder="Describe your product in detail. Include:&#10;- What it does&#10;- Key features&#10;- How it works&#10;- Pricing model (if applicable)&#10;- Target users"
                rows={6}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Target Audience <span className="text-[#58585a]">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g., Small business owners, developers, marketing teams"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {/* Existing FAQs */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Existing FAQs to Avoid <span className="text-[#58585a]">(optional)</span>
              </label>
              <textarea
                value={formData.existingFaqs}
                onChange={(e) => setFormData({ ...formData, existingFaqs: e.target.value })}
                placeholder="Paste any existing FAQs here to avoid duplicates..."
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Number of FAQs */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Number of FAQs
              </label>
              <select
                value={formData.numberOfFaqs}
                onChange={(e) => setFormData({ ...formData, numberOfFaqs: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              >
                <option value="5">5 FAQs</option>
                <option value="10">10 FAQs</option>
                <option value="15">15 FAQs</option>
                <option value="20">20 FAQs</option>
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
                  onClick={generateFaqs}
                  disabled={loading}
                  className="w-full bg-[#58585a] hover:bg-[#3d3d3e] disabled:bg-gray-400 text-white py-3.5 rounded-xl font-medium transition-colors text-[15px]"
                >
                  {loading ? "Generating..." : "Generate FAQs → (5 credits)"}
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button className="w-full bg-[#58585a] hover:bg-[#3d3d3e] text-white py-3.5 rounded-xl font-medium transition-colors text-[15px]">
                    Generate FAQs →
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#131314]">{result.productName} FAQ</h2>
              <p className="text-[13px] text-[#58585a] mt-1">
                {result.faqs.length} questions across {result.categories.length} categories
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({result.faqs.length})
              </button>
              {result.categories.map((category, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category} ({result.faqs.filter(f => f.category === category).length})
                </button>
              ))}
            </div>

            {/* FAQs */}
            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:border-purple-200 transition-colors"
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="w-full flex items-start justify-between p-4 text-left"
                    >
                      <div className="flex-1">
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mb-1 inline-block">
                          {faq.category}
                        </span>
                        <h3 className="text-[14px] font-medium text-[#131314] mt-1">
                          {faq.question}
                        </h3>
                      </div>
                      <span className="ml-3 text-[#58585a] text-lg">
                        {isExpanded ? "−" : "+"}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <p className="text-[13px] text-[#58585a] leading-relaxed bg-gray-50 rounded-lg p-3">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Additional Resources */}
            {result.additionalResources.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-[13px] font-semibold text-[#131314] mb-2">
                  📚 Suggested Additional Resources
                </h3>
                <ul className="space-y-1">
                  {result.additionalResources.map((resource, i) => (
                    <li key={i} className="text-[12px] text-[#58585a] flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      {resource}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={copyToClipboard}
                className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors"
              >
                {copied ? "✅ Copied!" : "📋 Copy All"}
              </button>
              <button
                onClick={downloadAsMarkdown}
                className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors"
              >
                📄 Download Markdown
              </button>
              <button
                onClick={downloadAsJSON}
                className="text-[13px] text-[#58585a] hover:text-[#131314] transition-colors"
              >
                💾 Download JSON
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

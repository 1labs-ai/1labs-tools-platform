"use client";

import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

interface UserStory {
  id: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  priority: "high" | "medium" | "low";
  storyPoints: number;
  notes: string;
}

interface UserStoriesResult {
  featureTitle: string;
  epic: string;
  stories: UserStory[];
  summary: string;
}

export default function UserStoriesPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [formData, setFormData] = useState({
    featureDescription: "",
    userType: "",
    context: "",
    numberOfStories: "5",
  });
  const [result, setResult] = useState<UserStoriesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generateStories = async () => {
    if (!formData.featureDescription.trim() || !formData.userType.trim()) {
      setError("Please fill in the required fields");
      return;
    }

    if (!isSignedIn) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate/user-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate user stories");
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
      const text = result.stories.map(s => 
        `**${s.id}** [${s.priority.toUpperCase()}] (${s.storyPoints} pts)\nAs a ${s.asA}, I want ${s.iWant}, so that ${s.soThat}\n\nAcceptance Criteria:\n${s.acceptanceCriteria.map(c => `- ${c}`).join('\n')}\n`
      ).join('\n---\n\n');
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadAsMarkdown = () => {
    if (result) {
      const md = `# ${result.featureTitle}

**Epic:** ${result.epic}

${result.summary}

---

${result.stories.map(s => `## ${s.id}: ${s.iWant.slice(0, 50)}...

**Priority:** ${s.priority.toUpperCase()} | **Story Points:** ${s.storyPoints}

> As a **${s.asA}**, I want **${s.iWant}**, so that **${s.soThat}**.

### Acceptance Criteria
${s.acceptanceCriteria.map(c => `- [ ] ${c}`).join('\n')}

${s.notes ? `### Notes\n${s.notes}` : ''}
`).join('\n---\n\n')}`;
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-stories-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
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
            AI User{" "}
            <span className="product-os-text">Story Generator</span>
          </h1>
          <p className="text-[#58585a] text-[15px] leading-relaxed max-w-lg mx-auto">
            Transform feature descriptions into well-formatted user stories with 
            acceptance criteria, priorities, and story points.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
          <div className="space-y-5">
            {/* Feature Description */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Feature Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.featureDescription}
                onChange={(e) => setFormData({ ...formData, featureDescription: e.target.value })}
                placeholder="Describe the feature you want to build. E.g., 'A dashboard where users can view their analytics, filter by date range, and export reports'"
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* User Type */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                User Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                placeholder="e.g., Marketing Manager, End User, Admin, Developer"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {/* Additional Context */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Additional Context <span className="text-[#58585a]">(optional)</span>
              </label>
              <textarea
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                placeholder="Any additional context, constraints, or requirements"
                rows={2}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Number of Stories */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Number of Stories
              </label>
              <select
                value={formData.numberOfStories}
                onChange={(e) => setFormData({ ...formData, numberOfStories: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              >
                <option value="3">3 stories</option>
                <option value="5">5 stories</option>
                <option value="8">8 stories</option>
                <option value="10">10 stories</option>
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
                  onClick={generateStories}
                  disabled={loading}
                  className="w-full bg-[#58585a] hover:bg-[#3d3d3e] disabled:bg-gray-400 text-white py-3.5 rounded-xl font-medium transition-colors text-[15px]"
                >
                  {loading ? "Generating..." : "Generate User Stories → (5 credits)"}
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button className="w-full bg-[#58585a] hover:bg-[#3d3d3e] text-white py-3.5 rounded-xl font-medium transition-colors text-[15px]">
                    Generate User Stories →
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
              <h2 className="text-2xl font-bold text-[#131314]">{result.featureTitle}</h2>
              <p className="text-[#58585a] text-[14px] mt-1">Epic: {result.epic}</p>
              <p className="text-[13px] text-[#58585a] mt-2 bg-gray-50 rounded-xl p-3">{result.summary}</p>
            </div>

            {/* Stories */}
            <div className="space-y-4">
              {result.stories.map((story, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-5 hover:border-purple-200 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[12px] font-mono bg-gray-100 px-2 py-1 rounded">{story.id}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2 py-1 rounded-full border ${getPriorityColor(story.priority)}`}>
                        {story.priority.toUpperCase()}
                      </span>
                      <span className="text-[11px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {story.storyPoints} pts
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-[14px] text-[#131314] mb-3">
                    As a <strong>{story.asA}</strong>, I want <strong>{story.iWant}</strong>, so that <strong>{story.soThat}</strong>.
                  </p>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[11px] font-semibold text-[#58585a] uppercase tracking-wide mb-2">Acceptance Criteria</p>
                    <ul className="space-y-1">
                      {story.acceptanceCriteria.map((criterion, i) => (
                        <li key={i} className="text-[13px] text-[#58585a] flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">☐</span>
                          {criterion}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {story.notes && (
                    <p className="text-[12px] text-[#58585a] mt-2 italic">💡 {story.notes}</p>
                  )}
                </div>
              ))}
            </div>

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

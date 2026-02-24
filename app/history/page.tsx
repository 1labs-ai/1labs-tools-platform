"use client";

import { useEffect, useState } from "react";
import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import Link from "next/link";

interface Generation {
  id: string;
  tool_type: string;
  title: string | null;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  credits_used: number;
  created_at: string;
}

const toolInfo: Record<string, { name: string; icon: string }> = {
  roadmap: { name: "Product Roadmap", icon: "📊" },
  prd: { name: "PRD Agent", icon: "📝" },
  pitch_deck: { name: "Pitch Deck", icon: "🎯" },
  persona: { name: "User Persona", icon: "👤" },
  competitive_analysis: { name: "Competitive Analysis", icon: "⚔️" },
  user_stories: { name: "User Stories", icon: "📝" },
  release_notes: { name: "Release Notes", icon: "🚀" },
  meeting_notes: { name: "Meeting Notes", icon: "📋" },
  faq_generator: { name: "FAQ Generator", icon: "❓" },
};

export default function HistoryPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (isSignedIn) {
      fetchHistory();
    }
  }, [isSignedIn]);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setGenerations(data.recentGenerations || []);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGenerations = filter === "all" 
    ? generations 
    : generations.filter(g => g.tool_type === filter);

  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-gray-500">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#131314]">Generation History</h1>
            <p className="text-[#58585a] text-[14px] sm:text-[15px]">
              View and manage all your AI generations
            </p>
          </div>
          <Link 
            href="/dashboard" 
            className="text-[14px] text-gray-500 hover:text-gray-700 self-start sm:self-auto"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition whitespace-nowrap ${
              filter === "all" 
                ? "bg-[#090221] text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({generations.length})
          </button>
          {Object.entries(toolInfo).map(([key, tool]) => {
            const count = generations.filter(g => g.tool_type === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full text-[13px] font-medium transition whitespace-nowrap ${
                  filter === key 
                    ? "bg-[#090221] text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tool.icon} {tool.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Generations List */}
        {filteredGenerations.length > 0 ? (
          <div className="space-y-4">
            {filteredGenerations.map((gen) => {
              const tool = toolInfo[gen.tool_type] || { name: gen.tool_type, icon: "🔧" };
              return (
                <div 
                  key={gen.id} 
                  className="bg-white border border-gray-200 rounded-[20px] p-6 hover:border-gray-300 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tool.icon}</span>
                      <div>
                        <h3 className="font-semibold text-[#131314]">
                          {gen.title || tool.name}
                        </h3>
                        <div className="text-[13px] text-[#58585a]">
                          {new Date(gen.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                        {gen.credits_used} credits
                      </span>
                    </div>
                  </div>

                  {/* Preview of input */}
                  {gen.input && Object.keys(gen.input).length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="text-[12px] text-gray-500 mb-2">Input</div>
                      <div className="text-[14px] text-[#131314] line-clamp-2">
                        {JSON.stringify(gen.input).slice(0, 200)}{JSON.stringify(gen.input).length > 200 ? '...' : ''}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(gen.output, null, 2));
                      }}
                      className="text-[13px] text-gray-500 hover:text-gray-700 transition"
                    >
                      📋 Copy Output
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(gen.output, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${gen.tool_type}-${gen.id}.json`;
                        a.click();
                      }}
                      className="text-[13px] text-gray-500 hover:text-gray-700 transition"
                    >
                      ⬇️ Download JSON
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-[24px] p-12 text-center">
            <div className="text-5xl mb-4">📜</div>
            <h3 className="text-lg font-semibold text-[#131314] mb-2">No generations yet</h3>
            <p className="text-[#58585a] text-[14px] mb-6">
              Start creating with our AI tools to see your history here
            </p>
            <Link 
              href="/roadmap"
              className="inline-block bg-[#090221] text-white px-6 py-3 rounded-lg hover:bg-[#1a1a2e] transition"
            >
              Create Your First Generation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

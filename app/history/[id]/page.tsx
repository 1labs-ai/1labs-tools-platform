"use client";

import { useEffect, useState } from "react";
import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { useParams } from "next/navigation";
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

export default function GenerationDetailPage() {
  const { isSignedIn, isLoaded } = useUser();
  const params = useParams();
  const id = params.id as string;
  
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn && id) {
      fetchGeneration();
    }
  }, [isSignedIn, id]);

  const fetchGeneration = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        const found = data.recentGenerations?.find((g: Generation) => g.id === id);
        if (found) {
          setGeneration(found);
        } else {
          setError("Generation not found");
        }
      } else {
        setError("Failed to load generation");
      }
    } catch (err) {
      console.error("Failed to fetch generation:", err);
      setError("Failed to load generation");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="text-gray-500">Loading generation...</div>
      </div>
    );
  }

  if (error || !generation) {
    return (
      <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-[24px] p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-[#131314] mb-2">
              {error || "Generation not found"}
            </h3>
            <p className="text-[#58585a] text-[14px] mb-6">
              The generation you're looking for doesn't exist or has been deleted.
            </p>
            <Link 
              href="/history"
              className="inline-block bg-[#090221] text-white px-6 py-3 rounded-lg hover:bg-[#1a1a2e] transition"
            >
              Back to History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tool = toolInfo[generation.tool_type] || { name: generation.tool_type, icon: "🔧" };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/history" 
            className="text-[14px] text-gray-500 hover:text-gray-700 mb-4 inline-block"
          >
            ← Back to History
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{tool.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-[#131314]">
                {generation.title || tool.name}
              </h1>
              <div className="flex items-center gap-4 text-[14px] text-[#58585a]">
                <span>
                  {new Date(generation.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-full text-[12px]">
                  {generation.credits_used} credits used
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white border border-gray-200 rounded-[20px] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#131314] mb-4">Input</h2>
          <pre className="bg-gray-50 rounded-xl p-4 overflow-x-auto text-[13px] text-[#131314]">
            {JSON.stringify(generation.input, null, 2)}
          </pre>
        </div>

        {/* Output Section */}
        <div className="bg-white border border-gray-200 rounded-[20px] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#131314]">Output</h2>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(generation.output, null, 2));
                }}
                className="text-[13px] text-gray-500 hover:text-gray-700 transition flex items-center gap-1"
              >
                📋 Copy JSON
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(generation.output, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${generation.tool_type}-${generation.id}.json`;
                  a.click();
                }}
                className="text-[13px] text-gray-500 hover:text-gray-700 transition flex items-center gap-1"
              >
                ⬇️ Download
              </button>
            </div>
          </div>
          <pre className="bg-gray-50 rounded-xl p-4 overflow-x-auto text-[13px] text-[#131314] max-h-[600px]">
            {JSON.stringify(generation.output, null, 2)}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link 
            href={`/${generation.tool_type.replace('_', '-')}`}
            className="bg-[#090221] text-white px-6 py-3 rounded-lg hover:bg-[#1a1a2e] transition text-[14px]"
          >
            Generate Another
          </Link>
          <Link 
            href="/history"
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition text-[14px]"
          >
            View All History
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

interface RoadmapItem {
  quarter: string;
  title: string;
  description: string;
  status: "planned" | "in-progress" | "completed";
}

interface Roadmap {
  productName: string;
  vision: string;
  items: RoadmapItem[];
}

export default function RoadmapPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [productDescription, setProductDescription] = useState("");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateRoadmap = async () => {
    if (!productDescription.trim()) {
      setError("Please describe your product");
      return;
    }

    if (!isSignedIn) {
      return; // Will show sign-in modal
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productDescription }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate roadmap");
      }

      const data = await response.json();
      setRoadmap(data.roadmap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    planned: "bg-gray-700 text-gray-300",
    "in-progress": "bg-yellow-900/50 text-yellow-400",
    completed: "bg-green-900/50 text-green-400",
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            AI Product Roadmap Generator
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Describe your product and let AI generate a professional roadmap. 
            Perfect for planning, presentations, and stakeholder alignment.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <label className="block text-sm font-medium mb-2">
            Describe your product
          </label>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="e.g., A SaaS platform that helps remote teams collaborate on design projects with real-time editing, version control, and client feedback features..."
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
          />
          
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              💰 5 credits per generation
            </span>
            
            {!isLoaded ? (
              <div className="bg-gray-700 text-gray-400 px-6 py-2 rounded-lg">
                Loading...
              </div>
            ) : isSignedIn ? (
              <button
                onClick={generateRoadmap}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Generating...
                  </>
                ) : (
                  "Generate Roadmap"
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

        {/* Roadmap Output */}
        {roadmap && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{roadmap.productName}</h2>
              <p className="text-gray-400">{roadmap.vision}</p>
            </div>

            <div className="space-y-4">
              {roadmap.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-400 font-medium">{item.quarter}</span>
                    <span className={`text-xs px-2 py-1 rounded ${statusColors[item.status]}`}>
                      {item.status.replace("-", " ")}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(roadmap, null, 2))}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                📋 Copy JSON
              </button>
              <button
                onClick={() => setRoadmap(null)}
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

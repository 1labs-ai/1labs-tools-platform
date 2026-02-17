"use client";

import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

interface RoadmapItem {
  week: string;
  title: string;
  description: string;
  priority: "must" | "should" | "nice";
}

interface Roadmap {
  productName: string;
  vision: string;
  items: RoadmapItem[];
}

export default function RoadmapPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [formData, setFormData] = useState({
    productName: "",
    problem: "",
    targetAudience: "",
    valueProposition: "",
    preferredLLM: "",
    features: ["", "", ""],
    featurePriorities: ["must", "must", "nice"],
  });
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handlePriorityChange = (index: number, value: string) => {
    const newPriorities = [...formData.featurePriorities];
    newPriorities[index] = value;
    setFormData({ ...formData, featurePriorities: newPriorities });
  };

  const generateRoadmap = async () => {
    if (!formData.productName.trim() || !formData.problem.trim()) {
      setError("Please fill in the required fields");
      return;
    }

    if (!isSignedIn) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  const priorityColors = {
    must: "text-red-500",
    should: "text-yellow-500",
    nice: "text-green-500",
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm text-gray-500 mb-3">
            ✨ Free AI Tool from <span className="text-pink-500">1Labs.ai</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            AI Product{" "}
            <span className="gradient-text">Roadmap Generator</span>
          </h1>
          <p className="text-gray-500">
            Get a complete 6-week roadmap for your AI product in seconds.
            The same framework we use to ship MVPs.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="e.g., AI Writing Assistant"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
              />
            </div>

            {/* Problem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What problem are you solving?
              </label>
              <textarea
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                placeholder="Describe the pain point your product addresses..."
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 resize-none"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g., Content marketers at SaaS companies"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
              />
            </div>

            {/* Value Proposition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Core Value Proposition
              </label>
              <input
                type="text"
                value={formData.valueProposition}
                onChange={(e) => setFormData({ ...formData, valueProposition: e.target.value })}
                placeholder="The ONE thing your product does better than anything else"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
              />
            </div>

            {/* Preferred LLM */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred LLM
              </label>
              <select
                value={formData.preferredLLM}
                onChange={(e) => setFormData({ ...formData, preferredLLM: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
              >
                <option value="">Select...</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude">Claude</option>
                <option value="gemini">Gemini</option>
                <option value="llama">LLaMA</option>
                <option value="mistral">Mistral</option>
              </select>
            </div>

            {/* Key Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Features (up to 3)
              </label>
              <div className="space-y-3">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={formData.features[index]}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={`Feature ${index + 1}`}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
                    />
                    <select
                      value={formData.featurePriorities[index]}
                      onChange={(e) => handlePriorityChange(index, e.target.value)}
                      className={`w-24 bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 focus:outline-none ${priorityColors[formData.featurePriorities[index] as keyof typeof priorityColors]}`}
                    >
                      <option value="must">🔴 Must</option>
                      <option value="should">🟡 Should</option>
                      <option value="nice">🟢 Nice</option>
                    </select>
                  </div>
                ))}
              </div>
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
                  onClick={generateRoadmap}
                  disabled={loading}
                  className="w-full bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition"
                >
                  {loading ? "Generating..." : "Generate My Roadmap →"}
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button className="w-full bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition">
                    Generate My Roadmap →
                  </button>
                </SignInButton>
              )}
              <p className="text-center text-sm text-pink-500 mt-3">
                Sign up free to get 50 credits
              </p>
            </div>
          </div>
        </div>

        {/* Roadmap Output */}
        {roadmap && (
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{roadmap.productName}</h2>
              <p className="text-gray-500">{roadmap.vision}</p>
            </div>

            <div className="space-y-4">
              {roadmap.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-pink-500 font-medium">{item.week}</span>
                    <span className={`text-xs font-medium ${priorityColors[item.priority]}`}>
                      {item.priority.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(roadmap, null, 2))}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                📋 Copy JSON
              </button>
              <button
                onClick={() => setRoadmap(null)}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
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

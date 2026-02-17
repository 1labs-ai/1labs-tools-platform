"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function ApiKeysPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async () => {
    try {
      const response = await fetch("/api/account/api-keys");
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys);
      }
    } catch (err) {
      console.error("Failed to fetch API keys:", err);
      setError("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/sign-in");
    }

    if (isSignedIn) {
      fetchApiKeys();
    }
  }, [isLoaded, isSignedIn, fetchApiKeys]);

  const handleCreateKey = async () => {
    if (!keyName.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/account/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewlyCreatedKey(data.fullKey);
        setApiKeys((prev) => [data.apiKey, ...prev]);
        setKeyName("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create API key");
      }
    } catch (err) {
      console.error("Failed to create API key:", err);
      setError("Failed to create API key");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyKey = async () => {
    if (newlyCreatedKey) {
      await navigator.clipboard.writeText(newlyCreatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseNewKeyModal = () => {
    setNewlyCreatedKey(null);
    setCopied(false);
    setIsModalOpen(false);
  };

  const handleDeleteKey = async (keyId: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/account/api-keys?id=${keyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setApiKeys((prev) => prev.filter((key) => key.id !== keyId));
        setDeleteConfirmId(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to revoke API key");
      }
    } catch (err) {
      console.error("Failed to revoke API key:", err);
      setError("Failed to revoke API key");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLastUsed = (dateString: string | null) => {
    if (!dateString) return "Never";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-[#58585a]">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/account" 
            className="text-[14px] text-[#58585a] hover:text-[#131314] transition"
          >
            ← Back to Account
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#131314]">API Keys</h1>
            <p className="text-[#58585a] text-[15px] mt-1">
              Manage API keys for programmatic access to 1Labs tools
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#090221] hover:bg-[#1a1a2e] text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Key
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-[14px]">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* API Keys List */}
        <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm">
          {apiKeys.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">🔑</div>
              <h3 className="text-lg font-semibold text-[#131314] mb-2">No API Keys Yet</h3>
              <p className="text-[#58585a] text-[14px] mb-6">
                Create your first API key to start using 1Labs tools programmatically.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#090221] hover:bg-[#1a1a2e] text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors"
              >
                Create Your First API Key
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {apiKeys.map((key) => (
                <div key={key.id} className="p-5 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-[15px] text-[#131314]">
                          {key.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[13px] text-[#58585a]">
                        <code className="bg-gray-100 px-2 py-1 rounded text-[12px] font-mono">
                          {key.keyPrefix}
                        </code>
                        <span>Created {formatDate(key.createdAt)}</span>
                        <span>Last used: {formatLastUsed(key.lastUsedAt)}</span>
                      </div>
                    </div>
                    
                    {deleteConfirmId === key.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-[#58585a]">Delete?</span>
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          disabled={isDeleting}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? "..." : "Yes"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="bg-gray-100 hover:bg-gray-200 text-[#131314] px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(key.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-[24px] p-6">
          <h3 className="text-lg font-semibold text-[#131314] mb-3">Using Your API Key</h3>
          <p className="text-[#58585a] text-[14px] mb-4">
            Include your API key in the Authorization header of your requests:
          </p>
          <div className="bg-[#1a1a2e] text-gray-100 p-4 rounded-xl text-[13px] font-mono overflow-x-auto">
            <pre>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://tools.1labs.ai/api/v1/generate/roadmap`}</pre>
          </div>
        </div>

        {/* Create Key Modal */}
        {isModalOpen && !newlyCreatedKey && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[24px] w-full max-w-md p-6 shadow-xl">
              <h2 className="text-xl font-bold text-[#131314] mb-4">Create New API Key</h2>
              <p className="text-[#58585a] text-[14px] mb-6">
                Give your API key a descriptive name to help you identify it later.
              </p>
              
              <div className="mb-6">
                <label className="block text-[14px] font-medium text-[#131314] mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g., Production Server, Development"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setKeyName("");
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#131314] px-4 py-3 rounded-xl text-[14px] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  disabled={!keyName.trim() || isCreating}
                  className="flex-1 bg-[#090221] hover:bg-[#1a1a2e] text-white px-4 py-3 rounded-xl text-[14px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Create Key"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Key Created Modal */}
        {newlyCreatedKey && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[24px] w-full max-w-lg p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#131314]">API Key Created!</h2>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-amber-800 text-[14px]">Save your key now!</p>
                    <p className="text-amber-700 text-[13px]">
                      This is the only time you&apos;ll see this key. Store it securely — we cannot show it again.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[14px] font-medium text-[#131314] mb-2">
                  Your API Key
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newlyCreatedKey}
                    readOnly
                    className="w-full px-4 py-3 pr-24 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-mono"
                  />
                  <button
                    onClick={handleCopyKey}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#090221] hover:bg-[#1a1a2e] text-white px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <button
                onClick={handleCloseNewKeyModal}
                className="w-full bg-gray-100 hover:bg-gray-200 text-[#131314] px-4 py-3 rounded-xl text-[14px] font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between px-4 py-2 bg-[#12121f] border-b border-gray-800 rounded-t-xl">
        <span className="text-xs font-medium text-gray-400 uppercase">{language}</span>
        <button
          onClick={copyToClipboard}
          className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="bg-[#1a1a2e] text-gray-300 p-4 rounded-b-xl overflow-x-auto text-[13px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const ToolCard = ({
  name,
  description,
  parameters,
  credits,
}: {
  name: string;
  description: string;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  credits: number;
}) => (
  <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <code className="text-purple-600 font-mono font-semibold">{name}</code>
      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
        {credits} credits
      </span>
    </div>
    <p className="text-gray-600 text-sm mb-4">{description}</p>
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-gray-500 uppercase">Parameters</h4>
      {parameters.map((param) => (
        <div key={param.name} className="flex items-start gap-2 text-sm">
          <code className="text-blue-600 font-mono text-xs bg-blue-50 px-1.5 py-0.5 rounded">
            {param.name}
          </code>
          <span className="text-gray-400">({param.type})</span>
          {param.required && <span className="text-red-500 text-xs">required</span>}
          <span className="text-gray-600 text-xs">{param.description}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function MCPDocsPage() {
  const claudeDesktopConfig = `{
  "mcpServers": {
    "1labs-tools": {
      "command": "npx",
      "args": ["-y", "@1labs/mcp-tools"],
      "env": {
        "ONELABS_API_KEY": "your-api-key-here"
      }
    }
  }
}`;

  const examplePrompts = `# Generate a product roadmap
Use the roadmap_generator tool to create a roadmap for: 
"A mobile app for async video updates for remote teams"

# Create a PRD
Use the prd_generator to create a comprehensive PRD for:
"An AI-powered code review tool that integrates with GitHub"

# Generate a pitch deck
Use the pitch_deck_generator for:
Company: "DataFlow"
Description: "Real-time data pipeline management"
Stage: "seed"

# Create user personas
Use the persona_generator to create 3 personas for:
"A meditation app for busy professionals"`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">1L</span>
              </div>
              <span className="font-semibold text-[#131314]">1Labs</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/docs" className="text-sm text-gray-600 hover:text-purple-600">
                API Docs
              </Link>
              <span className="text-purple-600 font-medium text-sm">MCP Integration</span>
            </nav>
          </div>
          <Link
            href="/account/api-keys"
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-full hover:bg-purple-700 transition-colors"
          >
            Get API Key
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            <span>🔌</span> Model Context Protocol
          </div>
          <h1 className="text-4xl font-bold text-[#131314] mb-4">
            Connect 1Labs to Claude Desktop
          </h1>
          <p className="text-lg text-gray-600">
            Use 1Labs AI tools directly in Claude Desktop, n8n, or any MCP-compatible client.
            Generate roadmaps, PRDs, pitch decks, and personas with natural language.
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-[#131314] mb-6">Quick Start</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Step 1: Get your API key
              </h3>
              <p className="text-gray-600 mb-3">
                Create an API key from your{" "}
                <Link href="/account/api-keys" className="text-purple-600 hover:underline">
                  account settings
                </Link>
                .
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Step 2: Configure Claude Desktop
              </h3>
              <p className="text-gray-600 mb-3">
                Add this to your Claude Desktop config file:
              </p>
              <ul className="text-sm text-gray-500 mb-3 space-y-1">
                <li><strong>macOS:</strong> <code className="bg-gray-100 px-1 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code></li>
                <li><strong>Windows:</strong> <code className="bg-gray-100 px-1 rounded">%APPDATA%\Claude\claude_desktop_config.json</code></li>
              </ul>
              <CodeBlock code={claudeDesktopConfig} language="json" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Step 3: Restart Claude Desktop
              </h3>
              <p className="text-gray-600">
                After restarting, you&apos;ll see 1Labs tools available in the tools menu.
              </p>
            </div>
          </div>
        </div>

        {/* Available Tools */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#131314] mb-6">Available Tools</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ToolCard
              name="roadmap_generator"
              description="Generate detailed product roadmaps with quarterly milestones, features, and progress tracking."
              credits={5}
              parameters={[
                { name: "productDescription", type: "string", required: true, description: "Description of your product" },
              ]}
            />
            <ToolCard
              name="prd_generator"
              description="Create comprehensive PRDs with problem analysis, user stories, and technical specifications."
              credits={10}
              parameters={[
                { name: "productDescription", type: "string", required: true, description: "What your product does" },
                { name: "includeUserStories", type: "boolean", required: false, description: "Include user stories" },
                { name: "includeTechSpecs", type: "boolean", required: false, description: "Include tech specs" },
              ]}
            />
            <ToolCard
              name="pitch_deck_generator"
              description="Generate investor-ready pitch decks with problem, solution, market, and financials."
              credits={10}
              parameters={[
                { name: "companyName", type: "string", required: true, description: "Your company name" },
                { name: "description", type: "string", required: true, description: "What you do" },
                { name: "stage", type: "string", required: false, description: "idea, mvp, seed, series_a, growth" },
                { name: "industry", type: "string", required: false, description: "Your industry" },
              ]}
            />
            <ToolCard
              name="persona_generator"
              description="Create detailed user personas with demographics, goals, pain points, and behaviors."
              credits={5}
              parameters={[
                { name: "productDescription", type: "string", required: true, description: "Your product" },
                { name: "personaCount", type: "number", required: false, description: "1-5 personas" },
                { name: "targetMarket", type: "string", required: false, description: "Target segment" },
              ]}
            />
          </div>
        </div>

        {/* Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#131314] mb-6">Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
              <code className="text-blue-600 font-mono">1labs://credits</code>
              <p className="text-gray-600 text-sm mt-2">Check your current credit balance</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
              <code className="text-blue-600 font-mono">1labs://generations</code>
              <p className="text-gray-600 text-sm mt-2">List your past generations</p>
            </div>
          </div>
        </div>

        {/* Example Prompts */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-[#131314] mb-6">Example Prompts</h2>
          <p className="text-gray-600 mb-4">
            Try these prompts in Claude Desktop after setting up the MCP server:
          </p>
          <CodeBlock code={examplePrompts} language="text" />
        </div>

        {/* n8n Integration */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-[#131314] mb-6">n8n Integration</h2>
          <p className="text-gray-600 mb-4">
            Use the MCP node in n8n with these settings:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li><strong>Command:</strong> <code className="bg-gray-100 px-2 py-1 rounded">npx -y @1labs/mcp-tools</code></li>
            <li><strong>Environment:</strong> <code className="bg-gray-100 px-2 py-1 rounded">ONELABS_API_KEY=your-api-key</code></li>
          </ul>
        </div>

        {/* Troubleshooting */}
        <div className="bg-gray-50 border border-gray-200 rounded-[24px] p-8">
          <h2 className="text-2xl font-bold text-[#131314] mb-6">Troubleshooting</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-[#131314]">&quot;API key not set&quot; error</h3>
              <p className="text-gray-600 text-sm">Make sure ONELABS_API_KEY is set in your config&apos;s env section.</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#131314]">&quot;Insufficient credits&quot; error</h3>
              <p className="text-gray-600 text-sm">
                Purchase credits from the{" "}
                <Link href="/pricing" className="text-purple-600 hover:underline">pricing page</Link>.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#131314]">Server not starting</h3>
              <p className="text-gray-600 text-sm">Ensure Node.js 18+ is installed. Try running <code className="bg-gray-200 px-1 rounded">npx @1labs/mcp-tools</code> manually.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Need help? Email us at <a href="mailto:hello@1labs.ai" className="text-purple-600">hello@1labs.ai</a></p>
        </div>
      </footer>
    </div>
  );
}

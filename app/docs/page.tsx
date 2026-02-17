"use client";

import { useState } from "react";
import Link from "next/link";

type Language = "curl" | "python" | "node";

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-[#1a1a2e] text-gray-300 p-4 rounded-xl overflow-x-auto text-[13px] leading-relaxed">
        <code>{code}</code>
      </pre>
      <button
        onClick={copyToClipboard}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-[11px] transition-opacity"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
};

const LanguageTabs = ({
  examples,
  selected,
  onSelect,
}: {
  examples: Record<Language, string>;
  selected: Language;
  onSelect: (lang: Language) => void;
}) => {
  const languages: { key: Language; label: string }[] = [
    { key: "curl", label: "cURL" },
    { key: "python", label: "Python" },
    { key: "node", label: "Node.js" },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-3">
        {languages.map((lang) => (
          <button
            key={lang.key}
            onClick={() => onSelect(lang.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
              selected === lang.key
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
      <CodeBlock code={examples[selected]} language={selected} />
    </div>
  );
};

const EndpointCard = ({
  method,
  endpoint,
  description,
  requestBody,
  responseExample,
  examples,
}: {
  method: "GET" | "POST";
  endpoint: string;
  description: string;
  requestBody?: { field: string; type: string; required: boolean; description: string }[];
  responseExample: string;
  examples: Record<Language, string>;
}) => {
  const [selectedLang, setSelectedLang] = useState<Language>("curl");
  const [showResponse, setShowResponse] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`px-3 py-1 rounded-lg text-[12px] font-bold ${
            method === "POST"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {method}
        </span>
        <code className="text-[14px] font-mono text-[#131314]">{endpoint}</code>
      </div>

      <p className="text-[#58585a] text-[14px] mb-6">{description}</p>

      {requestBody && requestBody.length > 0 && (
        <div className="mb-6">
          <h4 className="text-[13px] font-semibold text-[#131314] mb-3">Request Body</h4>
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 font-medium text-[#58585a]">Field</th>
                  <th className="text-left py-2 px-4 font-medium text-[#58585a]">Type</th>
                  <th className="text-left py-2 px-4 font-medium text-[#58585a]">Required</th>
                  <th className="text-left py-2 px-4 font-medium text-[#58585a]">Description</th>
                </tr>
              </thead>
              <tbody>
                {requestBody.map((field) => (
                  <tr key={field.field} className="border-b border-gray-200 last:border-0">
                    <td className="py-2 px-4 font-mono text-purple-600">{field.field}</td>
                    <td className="py-2 px-4 text-[#58585a]">{field.type}</td>
                    <td className="py-2 px-4">
                      {field.required ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-[#58585a]">{field.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h4 className="text-[13px] font-semibold text-[#131314] mb-3">Code Examples</h4>
        <LanguageTabs examples={examples} selected={selectedLang} onSelect={setSelectedLang} />
      </div>

      <div>
        <button
          onClick={() => setShowResponse(!showResponse)}
          className="text-[13px] font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          {showResponse ? "Hide" : "Show"} Response Example
          <span className={`transition-transform ${showResponse ? "rotate-180" : ""}`}>▼</span>
        </button>
        {showResponse && (
          <div className="mt-3">
            <CodeBlock code={responseExample} language="json" />
          </div>
        )}
      </div>
    </div>
  );
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "authentication", label: "Authentication" },
    { id: "endpoints", label: "Endpoints" },
    { id: "rate-limits", label: "Rate Limits" },
    { id: "errors", label: "Error Codes" },
  ];

  const endpoints = [
    {
      method: "POST" as const,
      endpoint: "/api/v1/roadmap",
      description: "Generate an AI-powered product roadmap based on your product description. Returns a structured roadmap with phases, milestones, and timeline.",
      requestBody: [
        { field: "productName", type: "string", required: true, description: "Name of your product" },
        { field: "productDescription", type: "string", required: true, description: "Detailed description of your product (50-2000 chars)" },
        { field: "timeframe", type: "string", required: false, description: "Roadmap timeframe: '3-months', '6-months', '12-months'" },
        { field: "focus", type: "string", required: false, description: "Focus area: 'growth', 'features', 'infrastructure'" },
      ],
      responseExample: `{
  "success": true,
  "data": {
    "id": "rdm_abc123",
    "productName": "TaskFlow",
    "roadmap": {
      "phases": [
        {
          "name": "Foundation",
          "duration": "Month 1-2",
          "milestones": [
            "Core task management",
            "User authentication",
            "Basic integrations"
          ]
        },
        {
          "name": "Growth",
          "duration": "Month 3-4",
          "milestones": [
            "Team collaboration",
            "Advanced analytics",
            "Mobile app"
          ]
        }
      ],
      "summary": "A focused 6-month roadmap..."
    },
    "creditsUsed": 5
  }
}`,
      examples: {
        curl: `curl -X POST https://tools.1labs.ai/api/v1/roadmap \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "productName": "TaskFlow",
    "productDescription": "A modern task management app for remote teams",
    "timeframe": "6-months",
    "focus": "growth"
  }'`,
        python: `import requests

response = requests.post(
    "https://tools.1labs.ai/api/v1/roadmap",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "productName": "TaskFlow",
        "productDescription": "A modern task management app for remote teams",
        "timeframe": "6-months",
        "focus": "growth"
    }
)

data = response.json()
print(data)`,
        node: `const response = await fetch("https://tools.1labs.ai/api/v1/roadmap", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    productName: "TaskFlow",
    productDescription: "A modern task management app for remote teams",
    timeframe: "6-months",
    focus: "growth"
  })
});

const data = await response.json();
console.log(data);`,
      },
    },
    {
      method: "POST" as const,
      endpoint: "/api/v1/prd",
      description: "Generate a comprehensive Product Requirements Document (PRD) with features, user stories, technical requirements, and success metrics.",
      requestBody: [
        { field: "productName", type: "string", required: true, description: "Name of your product" },
        { field: "productDescription", type: "string", required: true, description: "Detailed description of your product" },
        { field: "targetAudience", type: "string", required: false, description: "Description of target users" },
        { field: "problemStatement", type: "string", required: false, description: "The problem your product solves" },
        { field: "includeUserStories", type: "boolean", required: false, description: "Include user stories (default: true)" },
        { field: "includeTechSpecs", type: "boolean", required: false, description: "Include technical specifications (default: true)" },
      ],
      responseExample: `{
  "success": true,
  "data": {
    "id": "prd_xyz789",
    "productName": "TaskFlow",
    "prd": {
      "overview": "TaskFlow is a modern task management...",
      "problemStatement": "Remote teams struggle with...",
      "targetAudience": "Remote teams of 5-50 people...",
      "features": [
        {
          "name": "Task Board",
          "description": "Kanban-style board...",
          "priority": "P0",
          "userStories": [
            "As a user, I want to drag tasks..."
          ]
        }
      ],
      "technicalRequirements": {
        "frontend": ["React", "TypeScript"],
        "backend": ["Node.js", "PostgreSQL"],
        "infrastructure": ["AWS", "Docker"]
      },
      "successMetrics": [
        "DAU > 1000 within 3 months",
        "Task completion rate > 80%"
      ]
    },
    "creditsUsed": 10
  }
}`,
      examples: {
        curl: `curl -X POST https://tools.1labs.ai/api/v1/prd \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "productName": "TaskFlow",
    "productDescription": "A modern task management app for remote teams",
    "targetAudience": "Remote teams of 5-50 people",
    "problemStatement": "Remote teams struggle with task visibility",
    "includeUserStories": true,
    "includeTechSpecs": true
  }'`,
        python: `import requests

response = requests.post(
    "https://tools.1labs.ai/api/v1/prd",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "productName": "TaskFlow",
        "productDescription": "A modern task management app for remote teams",
        "targetAudience": "Remote teams of 5-50 people",
        "problemStatement": "Remote teams struggle with task visibility",
        "includeUserStories": True,
        "includeTechSpecs": True
    }
)

data = response.json()
print(data)`,
        node: `const response = await fetch("https://tools.1labs.ai/api/v1/prd", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    productName: "TaskFlow",
    productDescription: "A modern task management app for remote teams",
    targetAudience: "Remote teams of 5-50 people",
    problemStatement: "Remote teams struggle with task visibility",
    includeUserStories: true,
    includeTechSpecs: true
  })
});

const data = await response.json();
console.log(data);`,
      },
    },
    {
      method: "GET" as const,
      endpoint: "/api/v1/user/credits",
      description: "Get the current user's credit balance, plan information, and usage statistics.",
      requestBody: [],
      responseExample: `{
  "success": true,
  "data": {
    "userId": "user_abc123",
    "plan": "pro",
    "credits": {
      "available": 450,
      "used": 50,
      "total": 500,
      "rollover": 150
    },
    "usage": {
      "thisMonth": {
        "roadmaps": 5,
        "prds": 2,
        "total": 35
      }
    },
    "resetDate": "2024-03-01T00:00:00Z"
  }
}`,
      examples: {
        curl: `curl -X GET https://tools.1labs.ai/api/v1/user/credits \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        python: `import requests

response = requests.get(
    "https://tools.1labs.ai/api/v1/user/credits",
    headers={
        "Authorization": "Bearer YOUR_API_KEY"
    }
)

data = response.json()
print(f"Available credits: {data['data']['credits']['available']}")`,
        node: `const response = await fetch("https://tools.1labs.ai/api/v1/user/credits", {
  headers: {
    "Authorization": "Bearer YOUR_API_KEY"
  }
});

const data = await response.json();
console.log(\`Available credits: \${data.data.credits.available}\`);`,
      },
    },
    {
      method: "GET" as const,
      endpoint: "/api/v1/generations",
      description: "List all your previous generations with pagination. Retrieve roadmaps, PRDs, and other generated content.",
      requestBody: [
        { field: "type", type: "string", required: false, description: "Filter by type: 'roadmap', 'prd', 'all'" },
        { field: "limit", type: "number", required: false, description: "Number of results (default: 10, max: 50)" },
        { field: "offset", type: "number", required: false, description: "Pagination offset (default: 0)" },
      ],
      responseExample: `{
  "success": true,
  "data": {
    "generations": [
      {
        "id": "rdm_abc123",
        "type": "roadmap",
        "productName": "TaskFlow",
        "createdAt": "2024-02-15T10:30:00Z",
        "creditsUsed": 5
      },
      {
        "id": "prd_xyz789",
        "type": "prd",
        "productName": "TaskFlow",
        "createdAt": "2024-02-14T15:45:00Z",
        "creditsUsed": 10
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}`,
      examples: {
        curl: `curl -X GET "https://tools.1labs.ai/api/v1/generations?type=roadmap&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        python: `import requests

response = requests.get(
    "https://tools.1labs.ai/api/v1/generations",
    headers={
        "Authorization": "Bearer YOUR_API_KEY"
    },
    params={
        "type": "roadmap",
        "limit": 10
    }
)

data = response.json()
for gen in data['data']['generations']:
    print(f"{gen['type']}: {gen['productName']}")`,
        node: `const params = new URLSearchParams({
  type: "roadmap",
  limit: "10"
});

const response = await fetch(
  \`https://tools.1labs.ai/api/v1/generations?\${params}\`,
  {
    headers: {
      "Authorization": "Bearer YOUR_API_KEY"
    }
  }
);

const data = await response.json();
data.data.generations.forEach(gen => {
  console.log(\`\${gen.type}: \${gen.productName}\`);
});`,
      },
    },
  ];

  const rateLimits = [
    { plan: "Free", requests: "10 requests/minute", daily: "100 requests/day" },
    { plan: "Starter", requests: "30 requests/minute", daily: "1,000 requests/day" },
    { plan: "Pro", requests: "60 requests/minute", daily: "5,000 requests/day" },
    { plan: "Unlimited", requests: "120 requests/minute", daily: "Unlimited" },
  ];

  const errorCodes = [
    { code: "400", name: "Bad Request", description: "Invalid request parameters. Check the request body." },
    { code: "401", name: "Unauthorized", description: "Missing or invalid API key. Check your Authorization header." },
    { code: "403", name: "Forbidden", description: "API access not enabled for your plan or insufficient credits." },
    { code: "404", name: "Not Found", description: "The requested resource doesn't exist." },
    { code: "429", name: "Too Many Requests", description: "Rate limit exceeded. Wait before retrying." },
    { code: "500", name: "Internal Server Error", description: "Something went wrong on our end. Try again later." },
    { code: "503", name: "Service Unavailable", description: "Service temporarily unavailable. Try again in a few minutes." },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <section className="py-12 px-4 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 bg-[#FEFCF7] border border-[#F5E6D3] rounded-full px-4 py-2 creme-badge-shadow">
              <span className="text-[13px] font-medium text-[#58585a]">📚 Developer Docs</span>
            </div>
            <span className="text-[12px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
              v1.0
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#131314]">
            API <span className="product-os-text">Documentation</span>
          </h1>
          <p className="text-[#58585a] max-w-2xl text-[15px] leading-relaxed">
            Integrate 1Labs AI tools directly into your applications. Generate roadmaps, PRDs, 
            and more programmatically with our RESTful API.
          </p>
          <div className="flex gap-4 mt-6">
            <Link
              href="/account"
              className="bg-[#090221] hover:bg-[#1a1a2e] text-white px-5 py-2.5 rounded-full font-medium transition-colors text-[14px]"
            >
              Get API Key →
            </Link>
            <a
              href="#endpoints"
              onClick={() => setActiveSection("endpoints")}
              className="border border-gray-200 hover:border-gray-300 text-[#58585a] hover:text-[#131314] px-5 py-2.5 rounded-full font-medium transition-colors text-[14px]"
            >
              View Endpoints
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 shrink-0">
            <nav className="sticky top-8">
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={() => setActiveSection(section.id)}
                      className={`block px-4 py-2 rounded-xl text-[14px] transition-colors ${
                        activeSection === section.id
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-[#58585a] hover:bg-gray-50 hover:text-[#131314]"
                      }`}
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <p className="text-[13px] font-medium text-[#131314] mb-2">Need help?</p>
                <p className="text-[12px] text-[#58585a] mb-3">
                  Our team is here to help you integrate.
                </p>
                <a
                  href="mailto:developers@1labs.ai"
                  className="text-[12px] text-purple-600 hover:text-purple-700 font-medium"
                >
                  Contact Support →
                </a>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Overview Section */}
            <section id="overview" className="mb-16 scroll-mt-8">
              <h2 className="text-2xl font-bold mb-4 text-[#131314]">Overview</h2>
              <div className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm">
                <p className="text-[#58585a] text-[14px] mb-4 leading-relaxed">
                  The 1Labs API provides programmatic access to our AI-powered product tools. 
                  Use it to generate roadmaps, PRDs, and other product artifacts directly from your applications.
                </p>

                <h3 className="text-[15px] font-semibold text-[#131314] mb-3">Base URL</h3>
                <CodeBlock code="https://tools.1labs.ai/api/v1" language="text" />

                <h3 className="text-[15px] font-semibold text-[#131314] mt-6 mb-3">Key Features</h3>
                <ul className="space-y-2 text-[14px] text-[#58585a]">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    RESTful JSON API
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Bearer token authentication
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Credit-based usage tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Comprehensive error handling
                  </li>
                </ul>

                <h3 className="text-[15px] font-semibold text-[#131314] mt-6 mb-3">Requirements</h3>
                <p className="text-[14px] text-[#58585a]">
                  API access is available on <strong>Pro</strong> and <strong>Unlimited</strong> plans. 
                  <Link href="/pricing" className="text-purple-600 hover:text-purple-700 ml-1">
                    View pricing →
                  </Link>
                </p>
              </div>
            </section>

            {/* Authentication Section */}
            <section id="authentication" className="mb-16 scroll-mt-8">
              <h2 className="text-2xl font-bold mb-4 text-[#131314]">Authentication</h2>
              <div className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm">
                <p className="text-[#58585a] text-[14px] mb-4 leading-relaxed">
                  All API requests require authentication using a Bearer token. You can generate an API key 
                  from your <Link href="/account" className="text-purple-600 hover:text-purple-700">account settings</Link>.
                </p>

                <h3 className="text-[15px] font-semibold text-[#131314] mb-3">Header Format</h3>
                <CodeBlock code='Authorization: Bearer YOUR_API_KEY' language="text" />

                <h3 className="text-[15px] font-semibold text-[#131314] mt-6 mb-3">Example Request</h3>
                <CodeBlock
                  code={`curl -X GET https://tools.1labs.ai/api/v1/user/credits \\
  -H "Authorization: Bearer 1labs_sk_abc123def456..."`}
                  language="bash"
                />

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-[13px] text-amber-800">
                    <strong>🔒 Keep your API key secure!</strong> Never expose it in client-side code or 
                    public repositories. Rotate keys immediately if compromised.
                  </p>
                </div>

                <h3 className="text-[15px] font-semibold text-[#131314] mt-6 mb-3">API Key Format</h3>
                <p className="text-[14px] text-[#58585a] mb-2">
                  API keys follow this format:
                </p>
                <CodeBlock code="1labs_sk_[32-character-random-string]" language="text" />
              </div>
            </section>

            {/* Endpoints Section */}
            <section id="endpoints" className="mb-16 scroll-mt-8">
              <h2 className="text-2xl font-bold mb-4 text-[#131314]">Endpoints</h2>
              <div className="space-y-6">
                {endpoints.map((endpoint) => (
                  <EndpointCard key={endpoint.endpoint} {...endpoint} />
                ))}
              </div>
            </section>

            {/* Rate Limits Section */}
            <section id="rate-limits" className="mb-16 scroll-mt-8">
              <h2 className="text-2xl font-bold mb-4 text-[#131314]">Rate Limits</h2>
              <div className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm">
                <p className="text-[#58585a] text-[14px] mb-6 leading-relaxed">
                  Rate limits are applied per API key to ensure fair usage. When you exceed the limit, 
                  you&apos;ll receive a <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[13px]">429</code> response.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-[#131314]">Plan</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#131314]">Requests/Minute</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#131314]">Daily Limit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rateLimits.map((limit) => (
                        <tr key={limit.plan} className="border-b border-gray-200 last:border-0">
                          <td className="py-3 px-4 font-medium text-[#131314]">{limit.plan}</td>
                          <td className="py-3 px-4 text-[#58585a]">{limit.requests}</td>
                          <td className="py-3 px-4 text-[#58585a]">{limit.daily}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 className="text-[15px] font-semibold text-[#131314] mt-6 mb-3">Rate Limit Headers</h3>
                <p className="text-[14px] text-[#58585a] mb-3">
                  Every response includes rate limit information:
                </p>
                <CodeBlock
                  code={`X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1709312400`}
                  language="text"
                />
              </div>
            </section>

            {/* Error Codes Section */}
            <section id="errors" className="mb-16 scroll-mt-8">
              <h2 className="text-2xl font-bold mb-4 text-[#131314]">Error Codes</h2>
              <div className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm">
                <p className="text-[#58585a] text-[14px] mb-6 leading-relaxed">
                  All errors return a consistent JSON structure with an error code and human-readable message.
                </p>

                <h3 className="text-[15px] font-semibold text-[#131314] mb-3">Error Response Format</h3>
                <CodeBlock
                  code={`{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "You don't have enough credits. Please upgrade your plan.",
    "status": 403
  }
}`}
                  language="json"
                />

                <h3 className="text-[15px] font-semibold text-[#131314] mt-6 mb-3">HTTP Status Codes</h3>
                <div className="space-y-3">
                  {errorCodes.map((error) => (
                    <div key={error.code} className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                      <span
                        className={`px-2 py-1 rounded text-[12px] font-bold shrink-0 ${
                          error.code.startsWith("4")
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {error.code}
                      </span>
                      <div>
                        <p className="font-medium text-[14px] text-[#131314]">{error.name}</p>
                        <p className="text-[13px] text-[#58585a]">{error.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-[15px] font-semibold text-[#131314] mt-6 mb-3">Common Error Codes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-4 font-medium text-[#58585a]">Code</th>
                        <th className="text-left py-2 px-4 font-medium text-[#58585a]">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-4 font-mono text-purple-600">INVALID_API_KEY</td>
                        <td className="py-2 px-4 text-[#58585a]">The API key is malformed or doesn&apos;t exist</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-4 font-mono text-purple-600">INSUFFICIENT_CREDITS</td>
                        <td className="py-2 px-4 text-[#58585a]">Not enough credits to complete the request</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-4 font-mono text-purple-600">API_NOT_ENABLED</td>
                        <td className="py-2 px-4 text-[#58585a]">API access not available on your plan</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-4 font-mono text-purple-600">RATE_LIMIT_EXCEEDED</td>
                        <td className="py-2 px-4 text-[#58585a]">Too many requests, slow down</td>
                      </tr>
                      <tr className="border-b border-gray-200 last:border-0">
                        <td className="py-2 px-4 font-mono text-purple-600">VALIDATION_ERROR</td>
                        <td className="py-2 px-4 text-[#58585a]">Request body validation failed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Footer CTA */}
            <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-[24px] p-8 border border-purple-100 text-center">
              <h3 className="text-xl font-bold text-[#131314] mb-2">Ready to start building?</h3>
              <p className="text-[#58585a] text-[14px] mb-6">
                Get your API key and start integrating 1Labs tools into your applications.
              </p>
              <Link
                href="/account"
                className="inline-block bg-[#090221] hover:bg-[#1a1a2e] text-white px-6 py-3 rounded-full font-medium transition-colors text-[14px]"
              >
                Get Started →
              </Link>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

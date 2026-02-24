"use client";

import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

interface ActionItem {
  task: string;
  assignee: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
}

interface MeetingNotesResult {
  title: string;
  date: string;
  duration: string;
  attendees: string[];
  summary: string;
  keyPoints: string[];
  decisions: {
    decision: string;
    context: string;
    decidedBy: string;
  }[];
  actionItems: ActionItem[];
  discussionTopics: {
    topic: string;
    summary: string;
    outcome: string;
  }[];
  nextSteps: string[];
  followUpDate: string;
  parkingLot: string[];
}

export default function MeetingNotesPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [formData, setFormData] = useState({
    transcript: "",
    meetingType: "general",
    attendees: "",
  });
  const [result, setResult] = useState<MeetingNotesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generateNotes = async () => {
    if (!formData.transcript.trim()) {
      setError("Please provide a meeting transcript");
      return;
    }

    if (!isSignedIn) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate/meeting-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate meeting notes");
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
      const text = `# ${result.title}
      
**Date:** ${result.date}
**Duration:** ${result.duration}
**Attendees:** ${result.attendees.join(", ")}

## Summary
${result.summary}

## Key Points
${result.keyPoints.map(p => `- ${p}`).join("\n")}

## Decisions
${result.decisions.map(d => `- **${d.decision}** (${d.decidedBy}): ${d.context}`).join("\n")}

## Action Items
${result.actionItems.map(a => `- [ ] ${a.task} (@${a.assignee}, due: ${a.dueDate}) [${a.priority}]`).join("\n")}

## Next Steps
${result.nextSteps.map(s => `- ${s}`).join("\n")}
`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadAsMarkdown = () => {
    if (result) {
      const md = `# ${result.title}

📅 **Date:** ${result.date}  
⏱️ **Duration:** ${result.duration}  
👥 **Attendees:** ${result.attendees.join(", ")}

---

## 📝 Summary
${result.summary}

---

## 🎯 Key Points
${result.keyPoints.map(p => `- ${p}`).join("\n")}

---

## ✅ Decisions Made
${result.decisions.map(d => `### ${d.decision}
- **Context:** ${d.context}
- **Decided by:** ${d.decidedBy}
`).join("\n")}

---

## 📋 Action Items
| Task | Assignee | Due Date | Priority |
|------|----------|----------|----------|
${result.actionItems.map(a => `| ${a.task} | ${a.assignee} | ${a.dueDate} | ${a.priority} |`).join("\n")}

---

## 💬 Discussion Topics
${result.discussionTopics.map(t => `### ${t.topic}
${t.summary}

**Outcome:** ${t.outcome}
`).join("\n")}

---

## ⏭️ Next Steps
${result.nextSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

${result.followUpDate ? `\n**Next Meeting:** ${result.followUpDate}` : ""}

${result.parkingLot.length > 0 ? `
---

## 🅿️ Parking Lot (Deferred Items)
${result.parkingLot.map(p => `- ${p}`).join("\n")}
` : ""}
`;
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meeting-notes-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
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
            AI Meeting{" "}
            <span className="product-os-text">Notes Summarizer</span>
          </h1>
          <p className="text-[#58585a] text-[15px] leading-relaxed max-w-lg mx-auto">
            Transform messy meeting transcripts into structured notes with 
            action items, decisions, and key takeaways.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
          <div className="space-y-5">
            {/* Transcript */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Meeting Transcript <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.transcript}
                onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                placeholder="Paste your meeting transcript, notes, or recording transcription here...&#10;&#10;Example:&#10;John: Let's discuss the Q2 roadmap. Sarah, can you give an update on the dashboard project?&#10;Sarah: Sure, we're about 70% done. Should ship by end of March.&#10;John: Great. Let's make sure to add the export feature users requested.&#10;Sarah: I'll add that to the backlog. Mike, can you handle the backend?&#10;Mike: Yes, I can start next week..."
                rows={10}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Meeting Type */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Meeting Type
              </label>
              <select
                value={formData.meetingType}
                onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              >
                <option value="general">General Meeting</option>
                <option value="standup">Daily Standup</option>
                <option value="sprint">Sprint Planning/Review</option>
                <option value="brainstorm">Brainstorming Session</option>
                <option value="client">Client Meeting</option>
                <option value="oneonone">1:1 Meeting</option>
              </select>
            </div>

            {/* Attendees */}
            <div>
              <label className="block text-[13px] font-medium text-[#131314] mb-2">
                Attendees <span className="text-[#58585a]">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                placeholder="Comma-separated names, e.g., John Smith, Sarah Chen, Mike Johnson"
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
                  onClick={generateNotes}
                  disabled={loading}
                  className="w-full bg-[#58585a] hover:bg-[#3d3d3e] disabled:bg-gray-400 text-white py-3.5 rounded-xl font-medium transition-colors text-[15px]"
                >
                  {loading ? "Summarizing..." : "Generate Meeting Notes → (5 credits)"}
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button className="w-full bg-[#58585a] hover:bg-[#3d3d3e] text-white py-3.5 rounded-xl font-medium transition-colors text-[15px]">
                    Generate Meeting Notes →
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
            {/* Header Card */}
            <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[#131314] mb-4">{result.title}</h2>
              <div className="flex flex-wrap gap-4 mb-4 text-[13px] text-[#58585a]">
                <span>📅 {result.date}</span>
                <span>⏱️ {result.duration}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {result.attendees.map((attendee, i) => (
                  <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-[12px] text-[#58585a]">
                    👤 {attendee}
                  </span>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[14px] text-[#58585a] leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {/* Key Points */}
            <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
              <h3 className="text-lg font-bold text-[#131314] mb-4">🎯 Key Points</h3>
              <ul className="space-y-2">
                {result.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-[14px] text-[#58585a]">
                    <span className="text-purple-500 mt-0.5">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Decisions */}
            {result.decisions.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
                <h3 className="text-lg font-bold text-[#131314] mb-4">✅ Decisions Made</h3>
                <div className="space-y-3">
                  {result.decisions.map((decision, i) => (
                    <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-4">
                      <p className="text-[14px] font-medium text-green-800">{decision.decision}</p>
                      <p className="text-[12px] text-green-700 mt-1">{decision.context}</p>
                      <p className="text-[11px] text-green-600 mt-1">— {decision.decidedBy}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items */}
            {result.actionItems.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
                <h3 className="text-lg font-bold text-[#131314] mb-4">📋 Action Items</h3>
                <div className="space-y-3">
                  {result.actionItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl hover:border-purple-200 transition-colors">
                      <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300" />
                      <div className="flex-1">
                        <p className="text-[14px] text-[#131314]">{item.task}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                            @{item.assignee}
                          </span>
                          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            Due: {item.dueDate}
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discussion Topics */}
            {result.discussionTopics.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
                <h3 className="text-lg font-bold text-[#131314] mb-4">💬 Discussion Topics</h3>
                <div className="space-y-4">
                  {result.discussionTopics.map((topic, i) => (
                    <div key={i} className="border-l-2 border-purple-300 pl-4">
                      <h4 className="text-[14px] font-semibold text-[#131314]">{topic.topic}</h4>
                      <p className="text-[13px] text-[#58585a] mt-1">{topic.summary}</p>
                      <p className="text-[12px] text-purple-600 mt-1">
                        <strong>Outcome:</strong> {topic.outcome}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
              <h3 className="text-lg font-bold text-[#131314] mb-4">⏭️ Next Steps</h3>
              <ol className="space-y-2">
                {result.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-[14px] text-[#58585a]">
                    <span className="bg-purple-100 text-purple-700 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              {result.followUpDate && (
                <p className="mt-4 text-[13px] text-[#58585a] bg-blue-50 rounded-lg p-3">
                  📅 <strong>Next Meeting:</strong> {result.followUpDate}
                </p>
              )}
            </div>

            {/* Parking Lot */}
            {result.parkingLot.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
                <h3 className="text-lg font-bold text-[#131314] mb-4">🅿️ Parking Lot</h3>
                <p className="text-[12px] text-[#58585a] mb-3">Items to revisit later:</p>
                <ul className="space-y-1">
                  {result.parkingLot.map((item, i) => (
                    <li key={i} className="text-[13px] text-[#58585a] flex items-start gap-2">
                      <span>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
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

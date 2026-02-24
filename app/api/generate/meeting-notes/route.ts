import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { deductCredits, hasEnoughCredits, saveGeneration, TOOL_CREDITS } from "@/lib/credits";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to generate meeting notes" },
        { status: 401 }
      );
    }

    const hasCredits = await hasEnoughCredits(userId, "meeting_notes");
    if (!hasCredits) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${TOOL_CREDITS.meeting_notes} credits to generate meeting notes.` },
        { status: 402 }
      );
    }

    const { transcript, meetingType, attendees } = await request.json();

    if (!transcript || transcript.length < 50) {
      return NextResponse.json(
        { error: "Please provide a more detailed meeting transcript" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert meeting note-taker and summarizer. Transform the following meeting transcript into structured, actionable meeting notes.

Meeting Transcript:
${transcript}

Meeting Type: ${meetingType || 'general'}
${attendees ? `Known Attendees: ${attendees}` : ''}

Create comprehensive meeting notes that capture all important information.

Respond with a JSON object in this exact format:
{
  "title": "A descriptive meeting title based on the content",
  "date": "Today's date or inferred from context (Month DD, YYYY)",
  "duration": "Estimated duration based on content",
  "attendees": ["List of participants mentioned or provided"],
  "summary": "A 2-3 sentence executive summary of the meeting",
  "keyPoints": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "decisions": [
    {
      "decision": "What was decided",
      "context": "Brief context or rationale",
      "decidedBy": "Who made/approved the decision"
    }
  ],
  "actionItems": [
    {
      "task": "Specific action to be taken",
      "assignee": "Person responsible",
      "dueDate": "Due date or timeframe",
      "priority": "high|medium|low"
    }
  ],
  "discussionTopics": [
    {
      "topic": "Topic discussed",
      "summary": "Brief summary of the discussion",
      "outcome": "What was concluded or decided"
    }
  ],
  "nextSteps": [
    "Next step 1",
    "Next step 2"
  ],
  "followUpDate": "Next meeting date if mentioned",
  "parkingLot": ["Items deferred for later discussion"]
}

Be thorough in extracting action items - they are crucial. If specific due dates aren't mentioned, suggest reasonable timeframes. Extract decisions even if they seem small.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);

    const deductResult = await deductCredits(userId, "meeting_notes");
    if (!deductResult.success) {
      return NextResponse.json(
        { error: deductResult.error || "Failed to deduct credits" },
        { status: 402 }
      );
    }

    await saveGeneration(
      userId,
      "meeting_notes",
      result.title,
      { transcript: transcript.substring(0, 500), meetingType, attendees },
      result,
      TOOL_CREDITS.meeting_notes
    );

    return NextResponse.json({ 
      result,
      creditsUsed: TOOL_CREDITS.meeting_notes,
      creditsRemaining: deductResult.newBalance
    });
  } catch (error) {
    console.error("Meeting notes generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate meeting notes. Please try again." },
      { status: 500 }
    );
  }
}

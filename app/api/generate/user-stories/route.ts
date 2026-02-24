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
        { error: "Please sign in to generate user stories" },
        { status: 401 }
      );
    }

    const hasCredits = await hasEnoughCredits(userId, "user_stories");
    if (!hasCredits) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${TOOL_CREDITS.user_stories} credits to generate user stories.` },
        { status: 402 }
      );
    }

    const { featureDescription, userType, context, numberOfStories } = await request.json();

    if (!featureDescription || featureDescription.length < 10) {
      return NextResponse.json(
        { error: "Please provide a more detailed feature description" },
        { status: 400 }
      );
    }

    if (!userType) {
      return NextResponse.json(
        { error: "Please provide the user type" },
        { status: 400 }
      );
    }

    const prompt = `You are an experienced product manager and agile coach. Generate well-structured user stories based on the following feature description.

Feature Description: ${featureDescription}
Primary User Type: ${userType}
${context ? `Additional Context: ${context}` : ''}
Number of Stories to Generate: ${numberOfStories || 5}

Create user stories following the standard format: "As a [user type], I want [goal], so that [benefit]."

Each story should:
1. Be specific and actionable
2. Have clear acceptance criteria (3-5 criteria per story)
3. Include a priority (high/medium/low)
4. Have estimated story points (1, 2, 3, 5, 8, or 13 using Fibonacci)
5. Be independent where possible

Respond with a JSON object in this exact format:
{
  "featureTitle": "A concise title for the feature",
  "epic": "The epic this feature belongs to",
  "summary": "A brief summary of what this feature set accomplishes",
  "stories": [
    {
      "id": "US-001",
      "asA": "the user type",
      "iWant": "what they want to do",
      "soThat": "the benefit they get",
      "acceptanceCriteria": [
        "Given X, when Y, then Z",
        "The user should be able to...",
        "The system must..."
      ],
      "priority": "high",
      "storyPoints": 5,
      "notes": "Any implementation notes or dependencies"
    }
  ]
}

Make stories specific, testable, and valuable to the user.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);

    const deductResult = await deductCredits(userId, "user_stories");
    if (!deductResult.success) {
      return NextResponse.json(
        { error: deductResult.error || "Failed to deduct credits" },
        { status: 402 }
      );
    }

    await saveGeneration(
      userId,
      "user_stories",
      result.featureTitle,
      { featureDescription, userType, context, numberOfStories },
      result,
      TOOL_CREDITS.user_stories
    );

    return NextResponse.json({ 
      result,
      creditsUsed: TOOL_CREDITS.user_stories,
      creditsRemaining: deductResult.newBalance
    });
  } catch (error) {
    console.error("User stories generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate user stories. Please try again." },
      { status: 500 }
    );
  }
}

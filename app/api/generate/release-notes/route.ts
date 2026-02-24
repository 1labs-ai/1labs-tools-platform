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
        { error: "Please sign in to generate release notes" },
        { status: 401 }
      );
    }

    const hasCredits = await hasEnoughCredits(userId, "release_notes");
    if (!hasCredits) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${TOOL_CREDITS.release_notes} credits to generate release notes.` },
        { status: 402 }
      );
    }

    const { changes, version, productName, audience } = await request.json();

    if (!changes || changes.length < 10) {
      return NextResponse.json(
        { error: "Please provide changes or commits" },
        { status: 400 }
      );
    }

    const prompt = `You are a technical writer who creates clear, user-friendly release notes. Transform the following changes into professional release notes.

Changes/Commits:
${changes}

${version ? `Version: ${version}` : 'Generate an appropriate version number'}
${productName ? `Product: ${productName}` : ''}
Target Audience: ${audience || 'users'} (${audience === 'developers' ? 'technical details are OK' : audience === 'users' ? 'avoid technical jargon' : 'balance technical and non-technical'})

Create release notes in multiple formats. Categorize changes appropriately.

Respond with a JSON object in this exact format:
{
  "version": "x.y.z",
  "releaseDate": "Month DD, YYYY",
  "title": "A catchy release title summarizing the main theme",
  "summary": "A 2-3 sentence summary of this release",
  "highlights": ["Top 2-3 highlights of this release"],
  "sections": [
    {
      "type": "new",
      "title": "New Features",
      "items": [
        {
          "description": "User-friendly description of the feature",
          "details": "Optional additional details"
        }
      ]
    },
    {
      "type": "improved",
      "title": "Improvements",
      "items": []
    },
    {
      "type": "fixed",
      "title": "Bug Fixes",
      "items": []
    }
  ],
  "breakingChanges": ["Any breaking changes that users need to know about"],
  "upgradeNotes": ["Steps or notes for upgrading"],
  "markdown": "Full release notes in markdown format",
  "slack": "Slack-formatted message (use *bold* and emojis)",
  "twitter": "Twitter/X post under 280 characters announcing the release"
}

Section types can be: new, improved, fixed, deprecated, security.
Only include sections that have items.
Make it engaging and professional.`;

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

    const deductResult = await deductCredits(userId, "release_notes");
    if (!deductResult.success) {
      return NextResponse.json(
        { error: deductResult.error || "Failed to deduct credits" },
        { status: 402 }
      );
    }

    await saveGeneration(
      userId,
      "release_notes",
      `${result.version} - ${result.title}`,
      { changes, version, productName, audience },
      result,
      TOOL_CREDITS.release_notes
    );

    return NextResponse.json({ 
      result,
      creditsUsed: TOOL_CREDITS.release_notes,
      creditsRemaining: deductResult.newBalance
    });
  } catch (error) {
    console.error("Release notes generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate release notes. Please try again." },
      { status: 500 }
    );
  }
}

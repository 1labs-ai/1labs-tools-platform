import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { validateApiKey } from "@/lib/api-auth";
import { getUserCredits, deductCredits, saveGeneration, TOOL_CREDITS } from "@/lib/credits";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const authHeader = request.headers.get("Authorization");
    const validation = await validateApiKey(authHeader);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 401 }
      );
    }

    const clerkId = validation.clerkId!;
    const toolType = "pitch_deck";
    const creditCost = TOOL_CREDITS[toolType];

    // Check credits
    const currentCredits = await getUserCredits(clerkId);
    if (currentCredits < creditCost) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient credits",
          credits_required: creditCost,
          credits_remaining: currentCredits,
        },
        { status: 402 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { companyName, description, stage, industry } = body;

    if (!companyName || companyName.length < 1) {
      return NextResponse.json(
        { success: false, error: "Please provide a company name" },
        { status: 400 }
      );
    }

    if (!description || description.length < 20) {
      return NextResponse.json(
        { success: false, error: "Please provide a more detailed description (min 20 characters)" },
        { status: 400 }
      );
    }

    // Generate pitch deck
    const prompt = `You are a startup pitch deck expert. Generate a comprehensive pitch deck for:

Company: ${companyName}
Description: ${description}
${stage ? `Stage: ${stage}` : ""}
${industry ? `Industry: ${industry}` : ""}

Create a pitch deck with the following slides:
1. Title/Overview
2. Problem
3. Solution
4. Market Opportunity
5. Business Model
6. Traction (hypothetical if early stage)
7. Competition
8. Team (placeholder)
9. Financials/Ask
10. Contact

Respond with a JSON object:
{
  "companyName": "Company Name",
  "tagline": "One-line description",
  "slides": [
    {
      "title": "Slide title",
      "content": "Main content for the slide",
      "bulletPoints": ["Point 1", "Point 2"],
      "notes": "Speaker notes"
    }
  ]
}`;

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

    const pitchDeck = JSON.parse(content);

    // Save generation
    const generation = await saveGeneration(
      clerkId,
      toolType,
      `${companyName} Pitch Deck`,
      { companyName, description, stage, industry },
      pitchDeck,
      creditCost
    );

    // Deduct credits
    const deductResult = await deductCredits(clerkId, toolType, generation.id);

    if (!deductResult.success) {
      return NextResponse.json(
        { success: false, error: deductResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { pitchDeck },
      generation_id: generation.id,
      credits_used: creditCost,
      credits_remaining: deductResult.newBalance,
    });
  } catch (error) {
    console.error("API v1 Pitch Deck generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate pitch deck. Please try again." },
      { status: 500 }
    );
  }
}

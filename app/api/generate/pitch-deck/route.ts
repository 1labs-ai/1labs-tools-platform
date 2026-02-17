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
        { error: "Please sign in to generate a pitch deck" },
        { status: 401 }
      );
    }

    // Check credits before generating
    const hasCredits = await hasEnoughCredits(userId, "pitch_deck");
    if (!hasCredits) {
      return NextResponse.json(
        { error: `Insufficient credits. This tool requires ${TOOL_CREDITS.pitch_deck} credits.` },
        { status: 402 }
      );
    }

    const { companyName, problem, solution, targetMarket, businessModel, traction, team, askAmount } = await request.json();

    if (!companyName || !problem || !solution) {
      return NextResponse.json(
        { error: "Please provide Company Name, Problem, and Solution" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert pitch deck consultant who has helped hundreds of startups raise funding. Generate a compelling 10-slide investor pitch deck based on this information:

Company Name: ${companyName}
Problem: ${problem}
Solution: ${solution}
${targetMarket ? `Target Market: ${targetMarket}` : ""}
${businessModel ? `Business Model: ${businessModel}` : ""}
${traction ? `Traction: ${traction}` : ""}
${team ? `Team: ${team}` : ""}
${askAmount ? `Fundraising Ask: ${askAmount}` : ""}

Create a pitch deck with exactly 10 slides following this structure:
1. Title Slide - Company name and tagline
2. Problem - The pain point you're solving
3. Solution - How you solve it
4. Market Opportunity - TAM/SAM/SOM if possible
5. Product - Key features and demo points
6. Business Model - How you make money
7. Traction - Key metrics and milestones
8. Competition - Competitive landscape and differentiation
9. Team - Key people and why they're the right team
10. The Ask - Funding amount and use of funds

Respond with a JSON object in this exact format:
{
  "companyName": "${companyName}",
  "tagline": "A compelling one-liner",
  "slides": [
    {
      "title": "Slide Title",
      "content": "Main content for the slide (2-4 bullet points or short paragraphs, make it compelling)",
      "notes": "Speaker notes - what to say when presenting this slide"
    }
  ]
}

Make the content punchy, investor-ready, and compelling. Use specific numbers where possible. Each slide should be concise but impactful.`;

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

    // Deduct credits after successful generation
    const creditResult = await deductCredits(userId, "pitch_deck");
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error || "Failed to deduct credits" },
        { status: 500 }
      );
    }

    // Save generation to history
    await saveGeneration(
      userId,
      "pitch_deck",
      companyName,
      { companyName, problem, solution, targetMarket, businessModel, traction, team, askAmount },
      pitchDeck,
      TOOL_CREDITS.pitch_deck
    );

    return NextResponse.json({ 
      pitchDeck,
      creditsRemaining: creditResult.newBalance 
    });
  } catch (error) {
    console.error("Pitch deck generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate pitch deck. Please try again." },
      { status: 500 }
    );
  }
}

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
        { error: "Please sign in to generate competitive analysis" },
        { status: 401 }
      );
    }

    const hasCredits = await hasEnoughCredits(userId, "competitive_analysis");
    if (!hasCredits) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${TOOL_CREDITS.competitive_analysis} credits to generate competitive analysis.` },
        { status: 402 }
      );
    }

    const { productName, productDescription, competitors, industry } = await request.json();

    if (!productName || !productDescription || productDescription.length < 10) {
      return NextResponse.json(
        { error: "Please provide product name and description" },
        { status: 400 }
      );
    }

    if (!competitors || competitors.length < 3) {
      return NextResponse.json(
        { error: "Please provide at least one competitor" },
        { status: 400 }
      );
    }

    const prompt = `You are a strategic market analyst specializing in competitive intelligence. Generate a comprehensive competitive analysis.

Your Product: ${productName}
Product Description: ${productDescription}
Competitors: ${competitors}
${industry ? `Industry: ${industry}` : ''}

Create a detailed competitive analysis with:
1. Analysis of each competitor
2. Feature comparison matrix
3. SWOT analysis for the user's product
4. Market gaps and recommendations

Respond with a JSON object in this exact format:
{
  "yourProduct": {
    "name": "${productName}",
    "positioning": "How the product should position itself in the market",
    "uniqueValue": "The unique value proposition"
  },
  "competitors": [
    {
      "name": "Competitor name",
      "description": "Brief description of the competitor",
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "pricing": "Pricing model/range",
      "targetMarket": "Who they target",
      "keyFeatures": ["feature 1", "feature 2", "feature 3"]
    }
  ],
  "featureMatrix": [
    {
      "feature": "Feature name",
      "importance": "critical|high|medium|low",
      "yourProduct": true,
      "competitors": {
        "Competitor1": true,
        "Competitor2": false
      }
    }
  ],
  "swot": {
    "strengths": ["Your product's strengths"],
    "weaknesses": ["Your product's weaknesses"],
    "opportunities": ["Market opportunities"],
    "threats": ["Market threats"]
  },
  "recommendations": [
    "Strategic recommendation 1",
    "Strategic recommendation 2"
  ],
  "marketGaps": [
    "Gap 1 you could fill",
    "Gap 2 you could fill"
  ]
}

Be specific, data-driven, and actionable. Include 6-10 features in the matrix.`;

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

    const deductResult = await deductCredits(userId, "competitive_analysis");
    if (!deductResult.success) {
      return NextResponse.json(
        { error: deductResult.error || "Failed to deduct credits" },
        { status: 402 }
      );
    }

    await saveGeneration(
      userId,
      "competitive_analysis",
      `${productName} vs Competitors`,
      { productName, productDescription, competitors, industry },
      result,
      TOOL_CREDITS.competitive_analysis
    );

    return NextResponse.json({ 
      result,
      creditsUsed: TOOL_CREDITS.competitive_analysis,
      creditsRemaining: deductResult.newBalance
    });
  } catch (error) {
    console.error("Competitive analysis generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis. Please try again." },
      { status: 500 }
    );
  }
}

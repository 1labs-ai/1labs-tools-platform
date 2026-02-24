import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  getUserCredits,
  hasEnoughCredits,
  deductCredits,
  saveGeneration,
  TOOL_CREDITS,
} from "@/lib/credits";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TOOL_TYPE = "roadmap" as const;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to generate a roadmap" },
        { status: 401 }
      );
    }

    // Check credits
    const hasCredits = await hasEnoughCredits(userId, TOOL_TYPE);
    if (!hasCredits) {
      const currentCredits = await getUserCredits(userId);
      return NextResponse.json(
        {
          error: "Insufficient credits",
          credits_required: TOOL_CREDITS[TOOL_TYPE],
          credits_remaining: currentCredits,
        },
        { status: 402 }
      );
    }

    const body = await request.json();
    const {
      productName,
      problem,
      targetAudience,
      valueProposition,
      preferredLLM,
      features,
      featurePriorities,
    } = body;

    // Build product description from form data
    let productDescription = "";
    if (productName) productDescription += `Product: ${productName}\n`;
    if (problem) productDescription += `Problem: ${problem}\n`;
    if (targetAudience) productDescription += `Target Audience: ${targetAudience}\n`;
    if (valueProposition) productDescription += `Value Proposition: ${valueProposition}\n`;
    if (preferredLLM) productDescription += `Preferred LLM: ${preferredLLM}\n`;
    if (features && features.length > 0) {
      const featureList = features
        .map((f: string, i: number) => {
          if (!f) return null;
          const priority = featurePriorities?.[i] || "should";
          return `- ${f} (${priority})`;
        })
        .filter(Boolean)
        .join("\n");
      if (featureList) productDescription += `Key Features:\n${featureList}\n`;
    }

    if (!productDescription || productDescription.length < 10) {
      return NextResponse.json(
        { error: "Please provide more details about your product" },
        { status: 400 }
      );
    }

    const prompt = `You are a product management expert. Generate a detailed 6-week MVP roadmap for the following product:

${productDescription}

Create a roadmap with exactly 6 items, one for each week. Each item should be achievable in one week.
Use the MoSCoW prioritization (must, should, nice) based on the feature priorities provided.

Respond with a JSON object in this exact format:
{
  "productName": "Name of the product",
  "vision": "A one-sentence vision statement",
  "items": [
    {
      "week": "Week 1",
      "title": "Feature or milestone name",
      "description": "Brief description of what will be delivered",
      "priority": "must"
    }
  ]
}

Start with core infrastructure and must-haves in weeks 1-2, then build out should-haves in weeks 3-4, and nice-to-haves in weeks 5-6. Be specific and actionable.`;

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

    const roadmap = JSON.parse(content);

    // Save generation
    const generation = await saveGeneration(
      userId,
      TOOL_TYPE,
      roadmap.productName || productName || "Product Roadmap",
      { productName, problem, targetAudience, valueProposition, preferredLLM, features, featurePriorities },
      roadmap,
      TOOL_CREDITS[TOOL_TYPE]
    );

    // Deduct credits
    const deductResult = await deductCredits(userId, TOOL_TYPE, generation.id);

    if (!deductResult.success) {
      console.error("Failed to deduct credits:", deductResult.error);
    }

    return NextResponse.json({
      roadmap,
      credits_used: TOOL_CREDITS[TOOL_TYPE],
      credits_remaining: deductResult.newBalance,
      generation_id: generation.id,
    });
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap. Please try again." },
      { status: 500 }
    );
  }
}

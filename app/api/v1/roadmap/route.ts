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
    const toolType = "roadmap";
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
    const { productDescription } = body;

    if (!productDescription || productDescription.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a more detailed product description (min 10 characters)" },
        { status: 400 }
      );
    }

    // Generate roadmap
    const prompt = `You are a product management expert. Generate a detailed product roadmap for the following product:

"${productDescription}"

Create a roadmap with 6-8 items spread across the next 4 quarters (Q1-Q4 2025). Include a mix of features, improvements, and infrastructure work.

Respond with a JSON object in this exact format:
{
  "productName": "Name of the product",
  "vision": "A one-sentence vision statement",
  "items": [
    {
      "quarter": "Q1 2025",
      "title": "Feature or milestone name",
      "description": "Brief description of what will be delivered",
      "status": "planned"
    }
  ]
}

Make the first 1-2 items "in-progress", the rest "planned". Be specific and actionable.`;

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
      clerkId,
      toolType,
      roadmap.productName || "Product Roadmap",
      { productDescription },
      roadmap,
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
      data: { roadmap },
      generation_id: generation.id,
      credits_used: creditCost,
      credits_remaining: deductResult.newBalance,
    });
  } catch (error) {
    console.error("API v1 Roadmap generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate roadmap. Please try again." },
      { status: 500 }
    );
  }
}

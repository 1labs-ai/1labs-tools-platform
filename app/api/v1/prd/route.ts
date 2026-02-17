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
    const toolType = "prd";
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
    const { productIdea } = body;

    if (!productIdea || productIdea.length < 20) {
      return NextResponse.json(
        { success: false, error: "Please provide a more detailed product idea (min 20 characters)" },
        { status: 400 }
      );
    }

    // Generate PRD
    const prompt = `You are a senior product manager. Generate a comprehensive Product Requirements Document (PRD) for the following product idea:

"${productIdea}"

Create a detailed PRD with the following sections:
1. Problem Statement - What problem does this solve?
2. Target Users - Who is this for?
3. User Stories - 5-7 key user stories in "As a [user], I want [goal], so that [benefit]" format
4. Core Features - Key features with brief descriptions
5. Success Metrics - How will we measure success?
6. Technical Considerations - High-level technical requirements
7. MVP Scope - What's included in v1 vs future versions
8. Risks & Mitigations - Key risks and how to address them

Respond with a JSON object in this exact format:
{
  "title": "Product Name - PRD",
  "overview": "A 2-3 sentence overview of the product",
  "sections": [
    {
      "title": "Problem Statement",
      "content": "Detailed content for this section..."
    }
  ]
}

Be specific, actionable, and thorough. Use bullet points where appropriate.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const prd = JSON.parse(content);

    // Save generation
    const generation = await saveGeneration(
      clerkId,
      toolType,
      prd.title || "Product PRD",
      { productIdea },
      prd,
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
      data: { prd },
      generation_id: generation.id,
      credits_used: creditCost,
      credits_remaining: deductResult.newBalance,
    });
  } catch (error) {
    console.error("API v1 PRD generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate PRD. Please try again." },
      { status: 500 }
    );
  }
}

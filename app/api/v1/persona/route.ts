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
    const toolType = "persona";
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
    const { productDescription, personaCount, targetMarket } = body;

    if (!productDescription || productDescription.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a more detailed product description (min 10 characters)" },
        { status: 400 }
      );
    }

    const count = Math.min(Math.max(parseInt(personaCount || "3", 10), 1), 5);

    // Generate personas
    const prompt = `You are a UX research expert. Generate ${count} detailed user personas for the following product:

"${productDescription}"

${targetMarket ? `Focus on this target market: ${targetMarket}` : ""}

For each persona, include:
- Name, age, occupation, location
- Background story
- Goals and motivations
- Pain points and frustrations
- Tech savviness
- Preferred channels
- Quote that represents them

Respond with a JSON object:
{
  "productName": "Product this is for",
  "personas": [
    {
      "name": "Full Name",
      "age": 32,
      "occupation": "Job Title",
      "location": "City, Country",
      "avatar": "Description for avatar",
      "background": "2-3 sentence background",
      "goals": ["Goal 1", "Goal 2"],
      "painPoints": ["Pain 1", "Pain 2"],
      "techSavviness": "high",
      "preferredChannels": ["Channel 1", "Channel 2"],
      "quote": "A quote that represents this persona"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const personas = JSON.parse(content);

    // Save generation
    const generation = await saveGeneration(
      clerkId,
      toolType,
      "User Personas",
      { productDescription, personaCount: count, targetMarket },
      personas,
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
      data: { personas },
      generation_id: generation.id,
      credits_used: creditCost,
      credits_remaining: deductResult.newBalance,
    });
  } catch (error) {
    console.error("API v1 Persona generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate personas. Please try again." },
      { status: 500 }
    );
  }
}

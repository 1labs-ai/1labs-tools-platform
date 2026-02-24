import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { deductCredits, getUserCredits, hasEnoughCredits, saveGeneration, TOOL_CREDITS } from "@/lib/credits";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TOOL_TYPE = "persona" as const;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to generate a persona" },
        { status: 401 }
      );
    }

    // Check if user has enough credits
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

    const { productDescription, targetIndustry, userRole, painPoints, goals } = await request.json();

    if (!productDescription || productDescription.length < 10) {
      return NextResponse.json(
        { error: "Please provide a more detailed product description" },
        { status: 400 }
      );
    }

    if (!targetIndustry || !userRole) {
      return NextResponse.json(
        { error: "Please provide target industry and user role" },
        { status: 400 }
      );
    }

    const prompt = `You are a user research expert specializing in creating detailed, realistic user personas. Generate a comprehensive user persona based on the following information:

Product: ${productDescription}
Target Industry: ${targetIndustry}
User Role: ${userRole}
${painPoints ? `Known Pain Points: ${painPoints}` : ''}
${goals ? `Known Goals: ${goals}` : ''}

Create a detailed, realistic user persona that would be a typical user of this product. Make the persona feel like a real person with specific details.

Respond with a JSON object in this exact format:
{
  "name": "A realistic full name that fits the demographic",
  "demographics": {
    "age": "Specific age (e.g., '34')",
    "gender": "Male/Female/Non-binary",
    "location": "City, Country",
    "education": "Highest education level",
    "income": "Annual income range",
    "jobTitle": "Their current job title"
  },
  "background": "2-3 sentences describing their career journey and current situation",
  "behaviors": ["Array of 4-6 specific behavioral traits related to how they work and use technology"],
  "goals": ["Array of 4-5 specific professional and personal goals"],
  "frustrations": ["Array of 4-5 specific frustrations and pain points they experience"],
  "motivations": ["Array of 3-4 key motivations that drive their decisions"],
  "preferredChannels": ["Array of 4-6 communication and information channels they prefer"],
  "quote": "A characteristic quote that captures their personality and perspective",
  "dayInLife": "A paragraph describing a typical day in their life, highlighting when and how they might interact with products like this"
}

Make the persona specific, realistic, and useful for product development. Avoid generic descriptions.`;

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

    const persona = JSON.parse(content);

    // Save the generation
    const generation = await saveGeneration(
      userId,
      TOOL_TYPE,
      `${persona.name} - ${persona.demographics.jobTitle}`,
      { productDescription, targetIndustry, userRole, painPoints, goals },
      persona,
      TOOL_CREDITS[TOOL_TYPE]
    );

    // Deduct credits
    const deductResult = await deductCredits(userId, TOOL_TYPE, generation.id);
    if (!deductResult.success) {
      console.error("Failed to deduct credits:", deductResult.error);
    }

    return NextResponse.json({ 
      persona,
      credits_used: TOOL_CREDITS[TOOL_TYPE],
      credits_remaining: deductResult.newBalance,
      generation_id: generation.id,
    });
  } catch (error) {
    console.error("Persona generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate persona. Please try again." },
      { status: 500 }
    );
  }
}

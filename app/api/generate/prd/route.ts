import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to generate a PRD" },
        { status: 401 }
      );
    }

    const { productIdea } = await request.json();

    if (!productIdea || productIdea.length < 20) {
      return NextResponse.json(
        { error: "Please provide a more detailed product idea" },
        { status: 400 }
      );
    }

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

    // TODO: Deduct credits from user account

    return NextResponse.json({ prd });
  } catch (error) {
    console.error("PRD generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PRD. Please try again." },
      { status: 500 }
    );
  }
}

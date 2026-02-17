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
        { error: "Please sign in to generate a roadmap" },
        { status: 401 }
      );
    }

    const { productDescription } = await request.json();

    if (!productDescription || productDescription.length < 10) {
      return NextResponse.json(
        { error: "Please provide a more detailed product description" },
        { status: 400 }
      );
    }

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

    // TODO: Deduct credits from user account

    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap. Please try again." },
      { status: 500 }
    );
  }
}

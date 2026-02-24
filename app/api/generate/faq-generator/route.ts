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
        { error: "Please sign in to generate FAQs" },
        { status: 401 }
      );
    }

    const hasCredits = await hasEnoughCredits(userId, "faq_generator");
    if (!hasCredits) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${TOOL_CREDITS.faq_generator} credits to generate FAQs.` },
        { status: 402 }
      );
    }

    const { productDescription, targetAudience, existingFaqs, numberOfFaqs } = await request.json();

    if (!productDescription || productDescription.length < 20) {
      return NextResponse.json(
        { error: "Please provide a more detailed product description" },
        { status: 400 }
      );
    }

    const prompt = `You are a customer support and content expert. Generate comprehensive, helpful FAQs for a product based on the following information.

Product Description:
${productDescription}

${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${existingFaqs ? `Existing FAQs to avoid duplicating:\n${existingFaqs}` : ''}

Number of FAQs to generate: ${numberOfFaqs || 10}

Create FAQs that:
1. Address real customer concerns and common questions
2. Are clear and easy to understand
3. Provide helpful, actionable answers
4. Cover various aspects: product usage, pricing, technical, troubleshooting, etc.
5. Are organized by logical categories

Respond with a JSON object in this exact format:
{
  "productName": "The product name extracted or inferred",
  "categories": ["Category 1", "Category 2", "Category 3"],
  "faqs": [
    {
      "question": "A common question customers might ask",
      "answer": "A clear, helpful answer (2-4 sentences)",
      "category": "Category this belongs to"
    }
  ],
  "additionalResources": [
    "Suggested documentation or resources that could complement these FAQs"
  ]
}

Make FAQs specific, practical, and genuinely helpful. Avoid generic questions. Include categories like:
- Getting Started
- Features & Usage
- Pricing & Billing
- Technical/Troubleshooting
- Account & Security
- Integrations

Order FAQs by importance/frequency within each category.`;

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

    const deductResult = await deductCredits(userId, "faq_generator");
    if (!deductResult.success) {
      return NextResponse.json(
        { error: deductResult.error || "Failed to deduct credits" },
        { status: 402 }
      );
    }

    await saveGeneration(
      userId,
      "faq_generator",
      `${result.productName} FAQ`,
      { productDescription: productDescription.substring(0, 300), targetAudience, numberOfFaqs },
      result,
      TOOL_CREDITS.faq_generator
    );

    return NextResponse.json({ 
      result,
      creditsUsed: TOOL_CREDITS.faq_generator,
      creditsRemaining: deductResult.newBalance
    });
  } catch (error) {
    console.error("FAQ generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate FAQs. Please try again." },
      { status: 500 }
    );
  }
}

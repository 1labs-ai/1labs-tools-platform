import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud";

// HTTP client for server-side use
export const convex = new ConvexHttpClient(convexUrl);

// Check if Convex is configured
export const isConvexConfigured = () => {
  return convexUrl !== "https://placeholder.convex.cloud";
};

// Tool credit costs
export const TOOL_CREDITS = {
  roadmap: 5,
  prd: 10,
  pitch_deck: 15,
  persona: 5,
  competitive_analysis: 10,
} as const;

export type ToolType = keyof typeof TOOL_CREDITS;

// Initial credits for new users
export const INITIAL_CREDITS = 25;

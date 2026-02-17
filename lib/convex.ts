import { ConvexHttpClient } from "convex/browser";
import type { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server";

/**
 * Server-side Convex client for use in API routes and server components
 * Uses ConvexHttpClient which doesn't require React hooks
 */

const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || "";

/**
 * Check if Convex is configured
 */
export function isConvexConfigured(): boolean {
  return convexUrl.startsWith("https://") || convexUrl.startsWith("http://");
}

// Lazy-initialize the client only when actually needed
let _convexClient: ConvexHttpClient | null = null;

function getConvexClient(): ConvexHttpClient {
  if (!isConvexConfigured()) {
    throw new Error("Convex is not configured. Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL.");
  }
  if (!_convexClient) {
    _convexClient = new ConvexHttpClient(convexUrl);
  }
  return _convexClient;
}

/**
 * Convex client wrapper that provides type-safe methods
 */
export const convex = {
  query: async <F extends FunctionReference<"query", "public">>(
    fn: F,
    args: FunctionArgs<F>
  ): Promise<FunctionReturnType<F>> => {
    return getConvexClient().query(fn, args);
  },
  mutation: async <F extends FunctionReference<"mutation", "public">>(
    fn: F,
    args: FunctionArgs<F>
  ): Promise<FunctionReturnType<F>> => {
    return getConvexClient().mutation(fn, args);
  },
};

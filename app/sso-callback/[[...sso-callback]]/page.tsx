"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <AuthenticateWithRedirectCallback />
    </div>
  );
}

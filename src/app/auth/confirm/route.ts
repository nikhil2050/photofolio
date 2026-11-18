import type { NextRequest } from "next/server";
import { completeAuthCallback } from "@/lib/auth/complete-callback";

export async function GET(request: NextRequest) {
  return completeAuthCallback(request);
}

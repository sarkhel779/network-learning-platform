import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { refreshSupabaseSession } from "@/lib/supabase/middleware";

export function middleware(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  if (
    (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") &&
    process.env.PLAYWRIGHT_TEST_SESSION === "1" &&
    process.env.PACKETSECRETS_TEST_ENV === "test" &&
    request.headers.has("x-packetsecrets-test-viewer")
  ) {
    return NextResponse.next();
  }

  return refreshSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

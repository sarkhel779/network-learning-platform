import { NextResponse } from "next/server";

import { safeReturnPath } from "@/features/auth/return-path";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function authenticationErrorUrl(request: Request) {
  return new URL("/sign-in?error=authentication", request.url);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(authenticationErrorUrl(request));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(authenticationErrorUrl(request));
  }

  const destination = safeReturnPath(requestUrl.searchParams.get("next"));
  return NextResponse.redirect(new URL(destination, request.url));
}

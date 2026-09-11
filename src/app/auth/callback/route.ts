import { NextResponse } from "next/server";

import { safeReturnPath } from "@/features/auth/return-path";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function authenticationErrorUrl(
  request: Request,
  error: "authentication" | "link_expired",
  returnTo: string,
) {
  const url = new URL("/sign-in", request.url);
  url.searchParams.set("error", error);
  url.searchParams.set("returnTo", returnTo);
  return url;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const destination = safeReturnPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(
      authenticationErrorUrl(request, "authentication", destination),
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      authenticationErrorUrl(request, "link_expired", destination),
    );
  }

  return NextResponse.redirect(new URL(destination, request.url));
}

import { cookies } from "next/headers";

import { parsePageView } from "@/features/analytics/page-view.schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const VISITOR_COOKIE = "ps_vid";
const VISITOR_COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request): Promise<Response> {
  let input;
  try {
    const body = await request.text();
    if (body.length > 512) return new Response(null, { status: 400 });
    input = parsePageView(JSON.parse(body));
  } catch {
    return new Response(null, { status: 400 });
  }

  if (process.env.PLAYWRIGHT_TEST_SESSION === "1" && process.env.PACKETSECRETS_TEST_ENV === "test") {
    return new Response(null, { status: 204 });
  }

  const ingestToken = process.env.PAGE_VIEW_INGEST_TOKEN;
  if (!ingestToken || ingestToken.length < 32) return new Response(null, { status: 503 });

  const cookieStore = await cookies();
  const existingVisitorId = cookieStore.get(VISITOR_COOKIE)?.value;
  const visitorId = existingVisitorId && uuidPattern.test(existingVisitorId) ? existingVisitorId : crypto.randomUUID();

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc("record_page_view", {
      p_event_id: input.eventId,
      p_path: input.path,
      p_ingest_token: ingestToken,
      p_visitor_id: visitorId,
    });
    if (error) return new Response(null, { status: 503 });
    if (data === "rate_limited") return new Response(null, { status: 429 });
    if (data === "recorded" || data === "duplicate") {
      if (visitorId !== existingVisitorId) {
        cookieStore.set(VISITOR_COOKIE, visitorId, {
          path: "/",
          maxAge: VISITOR_COOKIE_MAX_AGE_SECONDS,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
      }
      return new Response(null, { status: 204 });
    }
    return new Response(null, { status: 503 });
  } catch {
    return new Response(null, { status: 503 });
  }
}

import { parsePageView } from "@/features/analytics/page-view.schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc("record_page_view", {
      p_event_id: input.eventId,
      p_path: input.path,
      p_ingest_token: ingestToken,
    });
    if (error) return new Response(null, { status: 503 });
    if (data === "rate_limited") return new Response(null, { status: 429 });
    if (data === "recorded" || data === "duplicate") return new Response(null, { status: 204 });
    return new Response(null, { status: 503 });
  } catch {
    return new Response(null, { status: 503 });
  }
}

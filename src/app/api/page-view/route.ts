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

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.rpc("record_page_view", {
      p_event_id: input.eventId,
      p_path: input.path,
    });
    return new Response(null, { status: error ? 503 : 204 });
  } catch {
    return new Response(null, { status: 503 });
  }
}

import { parseRestartProgressInput } from "@/features/progress/progress-input.schema";
import { restartLearnerProgress } from "@/features/progress/progress.repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const headers = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Authentication required." }, 401);
  let input;
  try { input = parseRestartProgressInput(await request.json()); }
  catch { return json({ error: "Invalid restart request." }, 400); }
  const result = await restartLearnerProgress(input);
  if (result.ok) return json({ progress: result.progress });
  const status = result.code === "stale_version" ? 409 : result.code === "invalid_item" ? 400 : 503;
  return json({ error: result.code === "stale_version" ? "Lesson content changed. Refresh and try again." : result.code === "invalid_item" ? "Unknown lesson." : "Progress could not be restarted." }, status);
}

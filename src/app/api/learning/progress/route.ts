import { recordLearnerProgress } from "@/features/progress/progress.repository";
import { parseProgressMutationInput } from "@/features/progress/progress-input.schema";
import { getViewer } from "@/lib/supabase/session";

const headers = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) return json({ error: "Authentication required." }, 401);
  let input;
  try { input = parseProgressMutationInput(await request.json()); }
  catch { return json({ error: "Invalid progress request." }, 400); }
  const result = await recordLearnerProgress(input, viewer.id);
  if (result.ok) return json({ progress: result.progress });
  const status = result.code === "stale_version" ? 409 : result.code === "invalid_item" ? 400 : 503;
  return json({ error: result.code === "stale_version" ? "Lesson content changed. Refresh and try again." : result.code === "invalid_item" ? "Unknown lesson item." : "Progress could not be saved." }, status);
}

import {
  getWaitlistStatus,
  joinWaitlist,
  leaveWaitlist,
} from "@/features/waitlist/waitlist.repository";
import { parseWaitlistJoinInput } from "@/features/waitlist/waitlist-input.schema";
import { getViewer } from "@/lib/supabase/session";

const headers = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });

async function authenticatedViewer() {
  return getViewer();
}

function resultResponse(result: Awaited<ReturnType<typeof getWaitlistStatus>>) {
  if (result.ok) return json({ entry: result.entry });
  if (result.code === "invalid_source") return json({ error: "Invalid waitlist request." }, 400);
  return json({ error: "Waitlist is temporarily unavailable." }, 503);
}

export async function GET() {
  const viewer = await authenticatedViewer();
  if (!viewer) return json({ error: "Authentication required." }, 401);
  return resultResponse(await getWaitlistStatus(viewer.id));
}

export async function POST(request: Request) {
  const viewer = await authenticatedViewer();
  if (!viewer) return json({ error: "Authentication required." }, 401);
  let input;
  try {
    input = parseWaitlistJoinInput(await request.json());
  } catch {
    return json({ error: "Invalid waitlist request." }, 400);
  }
  return resultResponse(await joinWaitlist(viewer.id, input));
}

export async function DELETE(_request: Request) {
  const viewer = await authenticatedViewer();
  if (!viewer) return json({ error: "Authentication required." }, 401);
  return resultResponse(await leaveWaitlist(viewer.id));
}

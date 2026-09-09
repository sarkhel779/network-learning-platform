import type { User } from "@supabase/supabase-js";
import { headers } from "next/headers";

import type { Viewer } from "@/features/learner-workspace/learner-workspace.types";

import { createServerSupabaseClient } from "./server";

type ViewerSource = Pick<User, "id" | "user_metadata">;
type TestSessionEnv = Partial<Record<"NODE_ENV" | "PLAYWRIGHT_TEST_SESSION" | "PACKETSECRETS_TEST_ENV", string>>;

export function resolveTestViewer(viewerId: string | null, env: TestSessionEnv): Viewer | null {
  if (
    !viewerId ||
    (env.NODE_ENV !== "test" && env.NODE_ENV !== "development") ||
    env.PLAYWRIGHT_TEST_SESSION !== "1" ||
    env.PACKETSECRETS_TEST_ENV !== "test"
  ) {
    return null;
  }

  return { id: viewerId, displayName: "Playwright learner", avatarUrl: null };
}

function stringMetadata(
  metadata: User["user_metadata"],
  key: "full_name" | "avatar_url",
) {
  const value = metadata[key];
  return typeof value === "string" ? value : null;
}

export function toViewer<T extends ViewerSource>(user: T | null): Viewer | null {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    displayName: stringMetadata(user.user_metadata, "full_name"),
    avatarUrl: stringMetadata(user.user_metadata, "avatar_url"),
  };
}

export async function getViewer(): Promise<Viewer | null> {
  const requestHeaders = await headers();
  const testViewer = resolveTestViewer(
    requestHeaders.get("x-packetsecrets-test-viewer"),
    process.env,
  );
  if (testViewer) return testViewer;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return toViewer(user);
}

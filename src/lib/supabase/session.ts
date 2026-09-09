import type { User } from "@supabase/supabase-js";

import type { Viewer } from "@/features/learner-workspace/learner-workspace.types";

import { createServerSupabaseClient } from "./server";

type ViewerSource = Pick<User, "id" | "user_metadata">;

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
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return toViewer(user);
}

import { z } from "zod";

import type { LessonProgressManifest } from "./progress.types";

const stableId = z.string().trim().min(1).regex(/^[a-z0-9_]+$/);
const anchor = z.string().trim().min(1).regex(/^[a-z0-9-]+$/);

const progressManifestItemSchema = z.object({
  itemId: stableId,
  kind: z.enum(["section", "interactive", "knowledge_check"]),
  label: z.string().trim().min(1),
  anchor,
  required: z.literal(true),
}).strict();

const lessonProgressManifestSchema = z.object({
  pathwayId: stableId,
  lessonId: stableId,
  contentVersion: z.number().int().positive(),
  items: z.array(progressManifestItemSchema).min(1),
}).strict();

function findDuplicate(values: readonly string[]) {
  const seen = new Set<string>();
  return values.find((value) => {
    if (seen.has(value)) return true;
    seen.add(value);
    return false;
  });
}

export function parseLessonProgressManifest(input: unknown): LessonProgressManifest {
  const manifest = lessonProgressManifestSchema.parse(input);
  const duplicateItemId = findDuplicate(manifest.items.map(({ itemId }) => itemId));
  if (duplicateItemId) throw new Error(`Duplicate itemId: ${duplicateItemId}`);

  const duplicateAnchor = findDuplicate(manifest.items.map(({ anchor: itemAnchor }) => itemAnchor));
  if (duplicateAnchor) throw new Error(`Duplicate anchor: ${duplicateAnchor}`);

  return manifest;
}

import { z } from "zod";

const publicPath = /^(?:\/|\/(?:pricing|labs|contact|privacy|terms|sign-in)(?:\/[a-z0-9-]+)*|\/(?:paths|learn)\/[a-z0-9-]+(?:\/[a-z0-9-]+)*)$/;

export function isPublicPagePath(value: string): boolean {
  return value.length <= 200 && publicPath.test(value);
}

const pageViewSchema = z.object({
  path: z.string().max(200).refine(isPublicPagePath),
  eventId: z.uuid(),
}).strict();

export type PageViewInput = z.infer<typeof pageViewSchema>;

export function parsePageView(input: unknown): PageViewInput {
  return pageViewSchema.parse(input);
}

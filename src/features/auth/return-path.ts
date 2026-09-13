import {
  listPathways,
  listPublishedLessons,
} from "@/features/catalog/catalog.repository";

const allowedReturnPaths = new Set([
  "/",
  "/dashboard",
  ...listPathways().flatMap(({ slug }) => [
    `/paths/${slug}`,
    ...listPublishedLessons(slug).flatMap((lesson) => {
      const path = `/learn/${slug}/${lesson.slug}`;
      return [
        path,
        ...(lesson.sections ?? []).map((section) => `${path}#${section.id}`),
      ];
    }),
  ]),
]);

export function safeReturnPath(value: unknown): string {
  return typeof value === "string" && allowedReturnPaths.has(value)
    ? value
    : "/";
}

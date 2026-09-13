import {
  listPathways,
  listPublishedLessons,
} from "@/features/catalog/catalog.repository";

const allowedReturnPaths = new Set([
  "/",
  "/dashboard",
  ...listPathways().flatMap(({ slug }) => [
    `/paths/${slug}`,
    ...listPublishedLessons(slug).map(
      (lesson) => `/learn/${slug}/${lesson.slug}`,
    ),
  ]),
]);

export function safeReturnPath(value: unknown): string {
  return typeof value === "string" && allowedReturnPaths.has(value)
    ? value
    : "/";
}

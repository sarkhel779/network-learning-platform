const lessonAliases: Readonly<Record<string, string>> = {
  "networking-foundations/hubs-bridges-and-switches": "hubs",
};

export function resolveLessonAlias(pathwaySlug: string, lessonSlug: string) {
  return lessonAliases[`${pathwaySlug}/${lessonSlug}`];
}

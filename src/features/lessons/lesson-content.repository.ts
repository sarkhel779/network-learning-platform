import "server-only";

import type {
  AuthorizedLessonContent,
  LessonContentKey,
  LessonContentRegistry,
  ViewerAccess,
} from "./lesson-content.types";

export type { LessonContentModule } from "./lesson-content.types";

const lessonImports = {
  "networking-foundations/how-networks-communicate": {
    public: () =>
      import("@/content/networking-foundations/how-networks-communicate.public.mdx"),
    account: () =>
      import("@/content/networking-foundations/how-networks-communicate.account.mdx"),
  },
  "networking-foundations/hosts-and-network-devices": {
    public: () =>
      import("@/content/networking-foundations/hosts-and-network-devices.public.mdx"),
    account: () =>
      import("@/content/networking-foundations/hosts-and-network-devices.account.mdx"),
  },
  "networking-foundations/cables-fibre-wireless-and-network-connections": {
    public: () =>
      import("@/content/networking-foundations/cables-fibre-wireless-and-network-connections.public.mdx"),
    account: () =>
      import("@/content/networking-foundations/cables-fibre-wireless-and-network-connections.account.mdx"),
  },
  "networking-foundations/osi-and-tcp-ip-models": {
    account: () =>
      import("@/content/networking-foundations/osi-and-tcp-ip-models.account.mdx"),
  },
} satisfies LessonContentRegistry;

async function loadFromRegistry(
  registry: LessonContentRegistry,
  key: LessonContentKey,
  access: ViewerAccess,
): Promise<AuthorizedLessonContent> {
  const blocks = registry[key];

  if (!blocks) throw new Error("LESSON_CONTENT_NOT_FOUND");

  return {
    public: blocks.public ? await blocks.public() : undefined,
    account:
      access !== "anonymous" && blocks.account ? await blocks.account() : undefined,
    pro: access === "pro" && blocks.pro ? await blocks.pro() : undefined,
  };
}

export function createAuthorizedLessonContentLoader(registry: LessonContentRegistry) {
  return (key: LessonContentKey, access: ViewerAccess) =>
    loadFromRegistry(registry, key, access);
}

export async function loadAuthorizedLessonContent(
  key: LessonContentKey,
  access: ViewerAccess,
): Promise<AuthorizedLessonContent> {
  return loadFromRegistry(lessonImports, key, access);
}

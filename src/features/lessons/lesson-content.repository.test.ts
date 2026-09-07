import { describe, expect, it, vi } from "vitest";

import type {
  LessonContentModule,
  LessonContentRegistry,
} from "./lesson-content.types";

vi.mock("server-only", () => ({}));
vi.mock("@/content/networking-foundations/how-networks-communicate.public.mdx", () => ({
  default: () => null,
}));

import {
  createAuthorizedLessonContentLoader,
  loadAuthorizedLessonContent,
} from "./lesson-content.repository";

const ACCOUNT_SENTINEL = "ACCOUNT_ONLY_SENTINEL";
const PRO_SENTINEL = "PRO_ONLY_SENTINEL";

function contentModule(extra: Record<string, unknown> = {}): LessonContentModule {
  return { default: () => null, ...extra };
}

function serializedValues(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") return [value.toString()];
  if (!value || typeof value !== "object") return [];

  return Object.values(value).flatMap(serializedValues);
}

function createFixture() {
  const publicLoader = vi.fn(async () => contentModule({ visibility: "public" }));
  const accountLoader = vi.fn(async () =>
    contentModule({ protectedFixture: ACCOUNT_SENTINEL }),
  );
  const proLoader = vi.fn(async () => contentModule({ protectedFixture: PRO_SENTINEL }));
  const registry = {
    "fixtures/with-pro": {
      public: publicLoader,
      account: accountLoader,
      pro: proLoader,
    },
    "fixtures/without-pro": {
      public: publicLoader,
      account: accountLoader,
    },
  } satisfies LessonContentRegistry;

  return {
    accountLoader,
    load: createAuthorizedLessonContentLoader(registry),
    proLoader,
    publicLoader,
  };
}

describe("loadAuthorizedLessonContent", () => {
  it("loads only the public block for an anonymous viewer", async () => {
    const result = await loadAuthorizedLessonContent(
      "networking-foundations/how-networks-communicate",
      "anonymous",
    );

    expect(result.public).toBeDefined();
    expect(result.account).toBeUndefined();
    expect(result.pro).toBeUndefined();
  });

  it("rejects a lesson absent from the explicit import map", async () => {
    await expect(
      loadAuthorizedLessonContent("unknown-pathway/unknown-lesson", "anonymous"),
    ).rejects.toThrow("LESSON_CONTENT_NOT_FOUND");
  });
});

describe("authorized lesson block loading", () => {
  it("does not invoke or return protected loaders for an anonymous viewer", async () => {
    const { accountLoader, load, proLoader, publicLoader } = createFixture();

    const result = await load("fixtures/with-pro", "anonymous");

    expect(publicLoader).toHaveBeenCalledOnce();
    expect(accountLoader).not.toHaveBeenCalled();
    expect(proLoader).not.toHaveBeenCalled();
    expect(serializedValues(result)).not.toContain(ACCOUNT_SENTINEL);
    expect(serializedValues(result)).not.toContain(PRO_SENTINEL);
  });

  it("loads account content but does not invoke or return Pro content for an account viewer", async () => {
    const { accountLoader, load, proLoader, publicLoader } = createFixture();

    const result = await load("fixtures/with-pro", "account");

    expect(publicLoader).toHaveBeenCalledOnce();
    expect(accountLoader).toHaveBeenCalledOnce();
    expect(proLoader).not.toHaveBeenCalled();
    expect(result.account).toBeDefined();
    expect(result.pro).toBeUndefined();
    expect(serializedValues(result)).not.toContain(PRO_SENTINEL);
  });

  it("loads public, account, and Pro content for a Pro viewer when all loaders exist", async () => {
    const { accountLoader, load, proLoader, publicLoader } = createFixture();

    const result = await load("fixtures/with-pro", "pro");

    expect(publicLoader).toHaveBeenCalledOnce();
    expect(accountLoader).toHaveBeenCalledOnce();
    expect(proLoader).toHaveBeenCalledOnce();
    expect(result.public).toBeDefined();
    expect(result.account).toBeDefined();
    expect(result.pro).toBeDefined();
  });

  it("returns undefined Pro content when a Pro loader is absent", async () => {
    const { load } = createFixture();

    const result = await load("fixtures/without-pro", "pro");

    expect(result.public).toBeDefined();
    expect(result.account).toBeDefined();
    expect(result.pro).toBeUndefined();
  });
});

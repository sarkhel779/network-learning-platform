import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createServerSupabaseClient: vi.fn(), rpc: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.createServerSupabaseClient }));

import { applyContentOverrides, loadContentOverridesSnapshot } from "./content-publication.repository";
import type { Pathway } from "./catalog.types";

beforeEach(() => {
  mocks.rpc.mockReset();
  mocks.createServerSupabaseClient.mockReset();
  mocks.createServerSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
});

const pathway: Pathway = {
  id: "path_test",
  slug: "test-pathway",
  title: "Test Pathway",
  description: "A pathway for tests.",
  audience: "Testers.",
  modules: [
    {
      id: "module_one",
      slug: "module-one",
      title: "Module One",
      description: "First module.",
      lessons: [
        { id: "lesson_a", slug: "lesson-a", title: "Lesson A", objective: "", seo: { title: "A", description: "A" }, estimatedMinutes: 5, published: true },
        { id: "lesson_b", slug: "lesson-b", title: "Lesson B", objective: "", seo: { title: "B", description: "B" }, estimatedMinutes: 5, published: true },
        { id: "lesson_c", slug: "lesson-c", title: "Lesson C", objective: "", seo: { title: "C", description: "C" }, estimatedMinutes: 5, published: false },
      ],
    },
  ],
};

describe("loadContentOverridesSnapshot", () => {
  it("returns an empty snapshot when the RPC fails", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "offline" } });
    await expect(loadContentOverridesSnapshot()).resolves.toEqual({ publications: {}, orders: {} });
  });

  it("returns an empty snapshot when the client throws", async () => {
    mocks.createServerSupabaseClient.mockRejectedValue(new Error("no env"));
    await expect(loadContentOverridesSnapshot()).resolves.toEqual({ publications: {}, orders: {} });
  });

  it("normalizes only well-shaped publication and order entries", async () => {
    mocks.rpc.mockResolvedValue({
      data: {
        publications: { lesson_a: false, lesson_b: "not-a-boolean" },
        orders: { module_one: ["lesson_c", "lesson_a"], module_bad: "not-an-array", module_mixed: ["lesson_a", 5] },
      },
      error: null,
    });
    await expect(loadContentOverridesSnapshot()).resolves.toEqual({
      publications: { lesson_a: false },
      orders: { module_one: ["lesson_c", "lesson_a"] },
    });
  });
});

describe("applyContentOverrides", () => {
  it("leaves the pathway unchanged when there are no overrides", () => {
    expect(applyContentOverrides(pathway, { publications: {}, orders: {} })).toEqual(pathway);
  });

  it("overrides the published flag for matching lessons only", () => {
    const result = applyContentOverrides(pathway, { publications: { lesson_a: false, lesson_missing: true }, orders: {} });
    expect(result.modules[0].lessons.map((lesson) => [lesson.id, lesson.published])).toEqual([
      ["lesson_a", false],
      ["lesson_b", true],
      ["lesson_c", false],
    ]);
  });

  it("applies only an exact permutation of the current lesson ids", () => {
    const result = applyContentOverrides(pathway, { publications: {}, orders: { module_one: ["lesson_c", "lesson_a", "lesson_b"] } });
    expect(result.modules[0].lessons.map((lesson) => lesson.id)).toEqual(["lesson_c", "lesson_a", "lesson_b"]);
  });

  it("rejects stale or incomplete stored orders", () => {
    const result = applyContentOverrides(pathway, { publications: {}, orders: { module_one: ["lesson_deleted", "lesson_b", "lesson_a"] } });
    expect(result.modules[0].lessons.map((lesson) => lesson.id)).toEqual(["lesson_a", "lesson_b", "lesson_c"]);

    const incomplete = applyContentOverrides(pathway, { publications: {}, orders: { module_one: ["lesson_b", "lesson_a"] } });
    expect(incomplete.modules[0].lessons.map((lesson) => lesson.id)).toEqual(["lesson_a", "lesson_b", "lesson_c"]);
  });
});

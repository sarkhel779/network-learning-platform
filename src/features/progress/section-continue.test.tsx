import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SectionContinue } from "./section-continue";

const { complete } = vi.hoisted(() => ({ complete: vi.fn() }));
vi.mock("./lesson-progress-context", () => ({
  useOptionalLessonProgress: () => ({}),
  useLessonProgressItem: () => ({ state: "idle", complete, retry: vi.fn() }),
  useLessonProgress: () => ({ manifest: { items: [
    { itemId: "read_intro", label: "Introduction", anchor: "intro" },
    { itemId: "read_second", label: "Second topic", anchor: "second" },
  ] } }),
}));

describe("SectionContinue", () => {
  it("saves before focusing the next section", async () => {
    let resolveSave: () => void = () => undefined;
    complete.mockReturnValue(new Promise<void>((resolve) => { resolveSave = resolve; }));
    render(<><h2 id="second" tabIndex={-1}>Second topic</h2><SectionContinue itemId="read_intro" anchor="intro" /></>);
    await userEvent.click(screen.getByRole("button", { name: "Continue: Introduction" }));
    expect(screen.getByRole("heading", { name: "Second topic" })).not.toHaveFocus();
    resolveSave();
    await waitFor(() => expect(screen.getByRole("heading", { name: "Second topic" })).toHaveFocus());
  });
});

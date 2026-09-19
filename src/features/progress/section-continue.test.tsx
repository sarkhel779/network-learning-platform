import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SectionContinue } from "./section-continue";

const { complete } = vi.hoisted(() => ({ complete: vi.fn() }));
vi.mock("./lesson-progress-context", () => ({
  useOptionalLessonProgress: () => ({ complete }),
}));

const observe = vi.fn();

describe("SectionContinue", () => {
  it("does not render or save section progress", () => {
    const { container } = render(<SectionContinue itemId="read_intro" anchor="intro" />);
    expect(container).toBeEmptyDOMElement();
    expect(complete).not.toHaveBeenCalled();
    expect(observe).not.toHaveBeenCalled();
  });
});

import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import type { LessonSection } from "@/features/catalog/catalog.types";

import { LessonSectionNavigation } from "./lesson-section-navigation";

afterEach(cleanup);

const sections: LessonSection[] = [
  { id: "communication-decisions", label: "Communication decisions", access: "public" },
  { id: "packet-journey", label: "Interactive packet journey", access: "public" },
];

const missingSectionCases: Array<LessonSection[] | undefined> = [undefined, []];

describe("LessonSectionNavigation", () => {
  it("describes locked account and Pro sections without inaccessible anchors", () => {
    render(<LessonSectionNavigation sections={[
      ...sections,
      { id: "wireshark-check", label: "Wireshark check", access: "account" },
      { id: "pro-deep-dive", label: "Pro Deep Dive", access: "pro", preview: "Explore standards and diagnostic checks." },
    ]} />);

    const navigation = screen.getByRole("navigation", { name: "On this page" });
    expect(within(navigation).getAllByRole("link")).toHaveLength(2);
    expect(within(navigation).queryByRole("button")).not.toBeInTheDocument();
    const accountItem = screen.getByText("Wireshark check").closest("li")!;
    const proItem = screen.getByText("Pro Deep Dive").closest("li")!;
    expect(accountItem).toHaveTextContent("Locked");
    expect(accountItem).not.toHaveTextContent("Free account");
    expect(proItem).toHaveTextContent("Pro");
    expect(proItem).toHaveTextContent("Locked");
    expect(proItem).toHaveTextContent("Explore standards and diagnostic checks.");
    expect(navigation.querySelector('a[href="#wireshark-check"], a[href="#pro-deep-dive"]')).toBeNull();
  });

  it("links each supplied lesson section", () => {
    render(<LessonSectionNavigation sections={sections} />);

    const navigation = screen.getByRole("navigation", { name: "On this page" });
    expect(
      within(navigation).getByRole("link", { name: "Communication decisions" }),
    ).toHaveAttribute("href", "#communication-decisions");
    expect(
      within(navigation).getByRole("link", { name: "Interactive packet journey" }),
    ).toHaveAttribute("href", "#packet-journey");
  });

  it("server-renders locked previews without paragraph nesting or parser repairs", () => {
    const html = renderToStaticMarkup(<LessonSectionNavigation sections={[
      { id: "pro-deep-dive", label: "Pro Deep Dive", access: "pro", preview: "Explore standards and diagnostic checks." },
    ]} />);
    expect(new DOMParser().parseFromString(html, "text/html").body.innerHTML).toBe(html);
  });

  it.each(missingSectionCases)("omits navigation when lesson sections are %j", (missingSections) => {
    render(<LessonSectionNavigation sections={missingSections} />);

    expect(screen.queryByRole("navigation", { name: "On this page" })).toBeNull();
  });
});

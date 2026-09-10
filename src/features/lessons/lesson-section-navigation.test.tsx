import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("collapses DNS topics into an expandable network map", async () => {
    const user = userEvent.setup();
    render(<LessonSectionNavigation
      presentation="dns-network-map"
      lockedReturnTo="/learn/networking-foundations/dns-and-name-resolution"
      sections={[
      { id: "why-name-resolution-exists", label: "Why name resolution exists", access: "public" },
      { id: "interactive-complete-resolution", label: "Interactive complete DNS resolution", access: "public" },
      { id: "dns-packet-capture-practice", label: "DNS packet and capture practice", access: "account" },
      { id: "root-server-bootstrap-bonus", label: "Bonus: root-server bootstrap", access: "pro", preview: "Trace root hints." },
      ]}
    />);

    const navigation = screen.getByRole("navigation", { name: "Page contents" });
    const disclosure = within(navigation).getByRole("button", { name: "Page contents" });
    expect(within(disclosure).queryByText("▣")).not.toBeInTheDocument();
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    expect(within(navigation).queryByText("Resolver")).not.toBeInTheDocument();

    await user.click(disclosure);
    expect(disclosure).toHaveAttribute("aria-expanded", "true");
    expect(within(navigation).getByRole("link", { name: "Why name resolution exists" })).toBeVisible();
    const firstPacket = navigation.querySelector(".dns-map__travelling-packet");
    expect(firstPacket).toBeInTheDocument();
    const accountLink = within(navigation).getByRole("link", { name: /DNS packet and capture practice.*Locked/ });
    const proLink = within(navigation).getByRole("link", { name: /Bonus: root-server bootstrap.*Pro.*Locked/ });
    expect(accountLink).toHaveAttribute(
      "href",
      "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fdns-and-name-resolution%23dns-packet-capture-practice",
    );
    expect(proLink).toHaveAttribute(
      "href",
      "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fdns-and-name-resolution%23root-server-bootstrap-bonus",
    );
    expect(accountLink.closest("li")).toHaveTextContent("Locked");
    expect(proLink.closest("li")).toHaveTextContent("Pro");

    await user.click(disclosure);
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    expect(navigation.querySelector(".dns-map__travelling-packet")).not.toBeInTheDocument();

    await user.click(disclosure);
    expect(disclosure).toHaveAttribute("aria-expanded", "true");
    expect(navigation.querySelector(".dns-map__travelling-packet")).not.toBe(firstPacket);
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

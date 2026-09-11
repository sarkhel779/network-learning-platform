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

  it("renders a reusable service-station map and preserves locked anchors", async () => {
    const user = userEvent.setup();
    const mapSections: LessonSection[] = [
      { id: "http-request-response", label: "HTTP request and response", access: "public" },
      { id: "web-capture-analysis", label: "Pro capture analysis", access: "pro", preview: "Inspect evidence." },
    ];
    render(<LessonSectionNavigation presentation="network-map" panelId="service-page-contents" lockedReturnTo="/learn/networking-foundations/http-https-tls-and-essential-network-services" mapGroups={[
      { label: "Web services", node: "Web", ids: ["http-request-response"] },
      { label: "Advanced evidence", node: "Pro", ids: ["web-capture-analysis"] },
    ]} sections={mapSections} />);
    const button = screen.getByRole("button", { name: "Page contents" });
    await user.click(button);
    expect(screen.getByRole("link", { name: "HTTP request and response" })).toHaveAttribute("href", "#http-request-response");
    expect(screen.getByRole("link", { name: /Pro capture analysis.*Pro.*Locked/ })).toHaveAttribute("href", "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fhttp-https-tls-and-essential-network-services%23web-capture-analysis");
    const firstRoute = screen.getByTestId("network-map-route");
    expect(firstRoute).toHaveAttribute("data-reveal-cycle", "1");
    await user.click(button);
    await user.click(button);
    expect(screen.getByTestId("network-map-route")).toHaveAttribute("data-reveal-cycle", "2");
  });

  it("renders the NAT packet route, preserves locked anchors, and replays on every open", async () => {
    const user = userEvent.setup();
    render(<LessonSectionNavigation
      presentation="nat-network-map"
      lockedReturnTo="/learn/networking-foundations/nat-pat-and-the-complete-internet-packet-journey"
      sections={[
        { id: "ipv4-translation-boundary", label: "The IPv4 translation boundary", access: "public" },
        { id: "pat-translation-table-state", label: "PAT and translation-table state", access: "public" },
        { id: "account-pat-journey", label: "Control the PAT journey", access: "account" },
        { id: "pro-u-turn-nat-lab", label: "U-Turn NAT lab", access: "pro", preview: "Compare paths." },
      ]}
    />);
    const button = screen.getByRole("button", { name: "Page contents" });
    await user.click(button);
    expect(screen.getByText("Boundary")).toBeVisible();
    expect(screen.getByText("PAT State")).toBeVisible();
    expect(screen.getByRole("link", { name: "The IPv4 translation boundary" })).toHaveAttribute("href", "#ipv4-translation-boundary");
    expect(screen.getByRole("link", { name: /Control the PAT journey.*Locked/ })).toHaveAttribute("href", "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fnat-pat-and-the-complete-internet-packet-journey%23account-pat-journey");
    expect(screen.getByRole("link", { name: /U-Turn NAT lab.*Pro.*Locked/ })).toHaveAttribute("href", "/sign-in?returnTo=%2Flearn%2Fnetworking-foundations%2Fnat-pat-and-the-complete-internet-packet-journey%23pro-u-turn-nat-lab");
    expect(screen.getByTestId("network-map-route")).toHaveAttribute("data-reveal-cycle", "1");
    await user.click(button);
    await user.click(button);
    expect(screen.getByTestId("network-map-route")).toHaveAttribute("data-reveal-cycle", "2");
  });

  it("unlocks account anchors for authenticated learners while retaining Pro locks", async () => {
    const user = userEvent.setup();
    render(<LessonSectionNavigation presentation="nat-network-map" viewerAccess="account" lockedReturnTo="/learn/networking-foundations/nat-pat-and-the-complete-internet-packet-journey" sections={[
      { id: "account-pat-journey", label: "Control the PAT journey", access: "account" },
      { id: "pro-u-turn-nat-lab", label: "U-Turn NAT lab", access: "pro" },
    ]} />);
    await user.click(screen.getByRole("button", { name: "Page contents" }));
    expect(screen.getByRole("link", { name: "Control the PAT journey" })).toHaveAttribute("href", "#account-pat-journey");
    expect(screen.getByRole("link", { name: /U-Turn NAT lab.*Pro.*Locked/ })).toBeVisible();
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

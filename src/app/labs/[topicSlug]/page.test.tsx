import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { listLabTopics } from "@/features/labs/labs.repository";

import * as topicPage from "./page";

afterEach(cleanup);

describe("lab topic route", () => {
  it("renders a topic's scenarios", async () => {
    render(await topicPage.default({ params: Promise.resolve({ topicSlug: "packet-forwarding" }) }));
    expect(screen.getByRole("heading", { level: 1, name: "Packet Forwarding" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Local delivery on one LAN/ })).toHaveAttribute("href", "/labs/packet-forwarding/local-delivery");
    expect(screen.getByRole("link", { name: /Delivery across a gateway/ })).toHaveAttribute("href", "/labs/packet-forwarding/remote-delivery");
    expect(screen.getByRole("link", { name: /Missing default gateway/ })).toHaveAttribute("href", "/labs/packet-forwarding/missing-gateway");
  });

  it("404s for an unknown topic", async () => {
    const props = { params: Promise.resolve({ topicSlug: "does-not-exist" }) };
    await expect(topicPage.generateMetadata(props)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(topicPage.default(props)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("generates static params for every topic", () => {
    expect(topicPage.generateStaticParams()).toEqual(listLabTopics().map(({ slug }) => ({ topicSlug: slug })));
  });

  it("renders lab topics outside the generated set on demand", () => {
    expect(topicPage.dynamicParams).toBe(true);
  });
});

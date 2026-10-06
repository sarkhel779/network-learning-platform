import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { listLabTopics } from "@/features/labs/labs.repository";

import * as scenarioPage from "./page";

afterEach(cleanup);

describe("lab scenario route", () => {
  it("renders the scenario's interactive component with breadcrumb and intro", async () => {
    render(await scenarioPage.default({ params: Promise.resolve({ topicSlug: "packet-forwarding", scenarioSlug: "local-delivery" }) }));
    expect(screen.getByRole("heading", { level: 1, name: "Local delivery on one LAN" })).toBeVisible();
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent("Labs");
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent("Packet Forwarding");
    expect(screen.getByRole("link", { name: "Labs" })).toHaveAttribute("href", "/labs");
    expect(screen.getByRole("link", { name: "Packet Forwarding" })).toHaveAttribute("href", "/labs/packet-forwarding");
    expect(screen.getByRole("img", { name: /Packet path from your PC/ })).toBeVisible();
  });

  it("renders a genuinely independent challenge-style scenario", async () => {
    const user = userEvent.setup();
    render(await scenarioPage.default({ params: Promise.resolve({ topicSlug: "ip-subnetting", scenarioSlug: "find-the-subnet-mask" }) }));
    expect(screen.getByRole("heading", { level: 1, name: "Find the subnet mask" })).toBeVisible();
    const option = screen.getAllByRole("radio")[0];
    await user.click(option);
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status", { name: "Answer feedback" })).toBeVisible();
  });

  it("404s for an unknown topic or scenario", async () => {
    const unknownTopic = { params: Promise.resolve({ topicSlug: "does-not-exist", scenarioSlug: "local-delivery" }) };
    await expect(scenarioPage.generateMetadata(unknownTopic)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(scenarioPage.default(unknownTopic)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");

    const unknownScenario = { params: Promise.resolve({ topicSlug: "packet-forwarding", scenarioSlug: "does-not-exist" }) };
    await expect(scenarioPage.generateMetadata(unknownScenario)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(scenarioPage.default(unknownScenario)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("generates static params for every topic's scenarios", () => {
    expect(scenarioPage.generateStaticParams()).toEqual(
      listLabTopics().flatMap((topic) => topic.scenarios.map((scenario) => ({ topicSlug: topic.slug, scenarioSlug: scenario.slug }))),
    );
  });

  it("renders lab scenarios outside the generated set on demand", () => {
    expect(scenarioPage.dynamicParams).toBe(true);
  });
});

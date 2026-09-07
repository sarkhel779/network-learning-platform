import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { accountConnectionScenarios } from "./connection-media.account.data";
import { ConnectionMediaLab } from "./connection-media-lab";

afterEach(cleanup);

describe("ConnectionMediaLab", () => {
  it("starts with the first scenario and readable requirements, awaiting an explicit choice and submission", async () => {
    const user = userEvent.setup();
    render(<ConnectionMediaLab scenarios={accountConnectionScenarios} />);
    expect(screen.getByRole("radio", { name: "Desktop near a home router" })).toBeChecked();
    const requirements = screen.getByRole("region", { name: "Scenario requirements" });
    for (const value of ["A fixed desktop computer", "A home router", "8 metres in the same room", "1 Gbit/s for local backups and downloads", "A quiet home office with a clear cable route"]) {
      expect(within(requirements).getByText(value)).toBeVisible();
    }
    for (const [label, value] of [["Latency sensitivity", "medium"], ["Mobility", "Fixed connection"], ["Reliability priority", "standard"], ["Budget", "low"]]) {
      expect(within(requirements).getByText(label).nextElementSibling).toHaveTextContent(value);
    }
    expect(screen.getByRole("button", { name: "Check my connection choice" })).toBeDisabled();
    expect(screen.queryByRole("region", { name: "Connection choice result" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    await user.click(screen.getByRole("radio", { name: "Wireless" }));
    expect(screen.getByRole("button", { name: "Check my connection choice" })).toBeEnabled();
    expect(screen.queryByRole("region", { name: "Connection choice result" })).not.toBeInTheDocument();
  });

  it.each([
    { scenario: "Desktop near a home router", medium: "Copper", outcome: "Recommended", decisive: "The low budget", recommendation: "Copper", explanation: "straightforward fit", comparison: "Your choice is the recommended option" },
    { scenario: "Desktop near a home router", medium: "Fibre", outcome: "Workable with trade-offs", decisive: "The low budget", recommendation: "Copper", explanation: "compatible optics and installation add cost", comparison: "Copper Ethernet is the straightforward fit" },
    { scenario: "Laptop used throughout a small office", medium: "Copper", outcome: "Unsuitable", decisive: "Movement between rooms", recommendation: "Wireless", explanation: "does not meet the required mobility", comparison: "Managed wireless coverage lets the laptop move" },
  ])("explains $outcome and compares with the recommended option", async ({ scenario, medium, outcome, decisive, recommendation, explanation, comparison }) => {
    const user = userEvent.setup();
    render(<ConnectionMediaLab scenarios={accountConnectionScenarios} />);
    await user.click(screen.getByRole("radio", { name: scenario }));
    await user.click(screen.getByRole("radio", { name: medium }));
    await user.click(screen.getByRole("button", { name: "Check my connection choice" }));
    const result = screen.getByRole("region", { name: "Connection choice result" });
    expect(within(result).getByRole("heading", { name: outcome })).toBeVisible();
    expect(result).toHaveTextContent(decisive);
    expect(result).toHaveTextContent(explanation);
    expect(result).toHaveTextContent(`Recommended option: ${recommendation}`);
    expect(result).toHaveTextContent(comparison);
    expect(screen.getByRole("status")).toHaveTextContent(outcome);
    expect(result).not.toHaveAttribute("aria-live");
  });

  it("clears the choice, result, and announcement every time the scenario changes", async () => {
    const user = userEvent.setup();
    render(<ConnectionMediaLab scenarios={accountConnectionScenarios} />);
    for (const scenario of accountConnectionScenarios.slice(1)) {
      await user.click(screen.getByRole("radio", { name: "Copper" }));
      await user.click(screen.getByRole("button", { name: "Check my connection choice" }));
      await user.click(screen.getByRole("radio", { name: scenario.title }));
      for (const medium of ["Copper", "Fibre", "Wireless"]) {
        expect(screen.getByRole("radio", { name: medium })).not.toBeChecked();
      }
      expect(screen.queryByRole("region", { name: "Connection choice result" })).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
      expect(screen.getByRole("button", { name: "Check my connection choice" })).toBeDisabled();
    }
  });

  it("uses one polite announcement per submission, including repeat submissions", async () => {
    const user = userEvent.setup();
    const { container } = render(<ConnectionMediaLab scenarios={accountConnectionScenarios} />);
    await user.click(screen.getByRole("radio", { name: "Copper" }));
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(container.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);
    const announcements: string[] = [];
    const observer = new MutationObserver(() => {
      if (status.textContent) announcements.push(status.textContent);
    });
    observer.observe(status, { childList: true, characterData: true, subtree: true });
    try {
      await user.click(screen.getByRole("button", { name: "Check my connection choice" }));
      await user.click(screen.getByRole("button", { name: "Check my connection choice" }));
      expect(announcements).toHaveLength(2);
      expect(announcements[0]).toContain("Recommended");
      expect(announcements[1]).toContain("Recommended");
      expect(announcements[0]).not.toBe(announcements[1]);
      await user.click(screen.getByRole("radio", { name: "Fibre" }));
      expect(screen.queryByRole("region", { name: "Connection choice result" })).not.toBeInTheDocument();
      expect(status).toBeEmptyDOMElement();
    } finally {
      observer.disconnect();
    }
  });

  it("supports keyboard selection across every scenario and medium and keyboard submission", async () => {
    const user = userEvent.setup();
    render(<ConnectionMediaLab scenarios={accountConnectionScenarios} />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "Desktop near a home router" })).toHaveFocus();
    for (const scenario of accountConnectionScenarios.slice(1)) {
      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("radio", { name: scenario.title })).toHaveFocus();
      expect(screen.getByRole("radio", { name: scenario.title })).toBeChecked();
    }
    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: "Copper" })).toBeChecked();
    for (const medium of ["Fibre", "Wireless"]) {
      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("radio", { name: medium })).toHaveFocus();
      expect(screen.getByRole("radio", { name: medium })).toBeChecked();
    }
    await user.tab();
    expect(screen.getByRole("button", { name: "Check my connection choice" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent("Recommended");
  });

  it("server-renders every scenario's requirements for use without hydration", () => {
    const markup = renderToStaticMarkup(<ConnectionMediaLab scenarios={accountConnectionScenarios} />);
    expect(markup).toContain("Read all scenario requirements");
    for (const scenario of accountConnectionScenarios) {
      expect(markup).toContain(scenario.title);
      expect(markup).toContain(scenario.distance);
      expect(markup).toContain(scenario.minimumBandwidth);
    }
  });
});

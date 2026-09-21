import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HostRoleConversationPlayer } from "./host-role-conversation-player";

const motionPreference = vi.hoisted(() => ({ reduced: false }));

vi.mock("@/features/packet-flow/use-reduced-motion", () => ({
  useReducedMotion: () => motionPreference.reduced,
  useReducedMotionState: () => ({ reducedMotion: motionPreference.reduced, isHydrated: true }),
}));

afterEach(() => {
  cleanup();
  motionPreference.reduced = false;
});

describe("HostRoleConversationPlayer", () => {
  it("starts untouched with real device symbols but no packet or explanation bubble", async () => {
    const user = userEvent.setup();
    const { container } = render(<HostRoleConversationPlayer />);
    const choices = screen.getByRole("group", { name: "Choose a host conversation" });

    expect(within(choices).getByRole("button", { name: "Open a website" })).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector('[data-device-symbol="host"]')).toBeInTheDocument();
    expect(container.querySelector('[data-device-symbol="server"]')).toBeInTheDocument();
    expect(container.querySelector("[data-packet-marker]")).toBeNull();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Restart" }));
    expect(container.querySelector("[data-packet-marker]")).toBeNull();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play" })).toBeVisible();
  });

  it("resets a newly selected scenario but keeps the active scenario running when reselected", async () => {
    const user = userEvent.setup();
    render(<HostRoleConversationPlayer />);

    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Laptop");

    await user.click(screen.getByRole("button", { name: "Send a print job" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Play" }));
    await user.click(screen.getByRole("button", { name: "Send a print job" }));
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Laptop");
  });

  it("keeps request direction, endpoint emphasis, role labels, and bubble synchronized", async () => {
    const user = userEvent.setup();
    const { container } = render(<HostRoleConversationPlayer />);

    await user.click(screen.getByRole("button", { name: "Play" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    const marker = container.querySelector("[data-packet-marker]");
    expect(marker).toHaveAttribute("data-from", "laptop");
    expect(marker).toHaveAttribute("data-to", "web-server");
    expect(marker).toHaveClass("network-topology__packet-marker--travel");
    expect(marker).toHaveStyle({ animationDuration: "1500ms" });
    expect(marker?.getAttribute("style")).toMatch(/--packet-travel-x:/);
    expect(container.querySelector('[data-device-id="laptop"]')).toHaveAttribute("data-active", "true");
    expect(container.querySelector('[data-role-for="laptop"]')).toHaveTextContent("Client");
    expect(container.querySelector('[data-role-for="web-server"]')).toHaveTextContent("Server");
    expect(screen.getByRole("status")).toHaveTextContent("Laptop requests a page");

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(container.querySelector("[data-packet-marker]")).toHaveAttribute("data-from", "web-server");
    expect(container.querySelector('[data-device-id="web-server"]')).toHaveAttribute("data-active", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Web server provides the page");
  });

  it("reverses client and server labels together with packet direction during file sharing", async () => {
    const user = userEvent.setup();
    const { container } = render(<HostRoleConversationPlayer />);

    await user.click(screen.getByRole("button", { name: "Share files both ways" }));
    await user.click(screen.getByRole("button", { name: "Play" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(container.querySelector('[data-role-for="computer-a"]')).toHaveTextContent("Client");
    expect(container.querySelector('[data-role-for="computer-b"]')).toHaveTextContent("Server");
    expect(container.querySelector("[data-packet-marker]")).toHaveAttribute("data-from", "computer-a");

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(container.querySelector('[data-role-for="computer-a"]')).toHaveTextContent("Server");
    expect(container.querySelector('[data-role-for="computer-b"]')).toHaveTextContent("Client");
    expect(container.querySelector("[data-packet-marker]")).toHaveAttribute("data-from", "computer-b");
    expect(container.querySelector("[data-packet-marker]")).toHaveAttribute("data-to", "computer-a");
    expect(screen.getByRole("status")).toHaveTextContent("Computer B asks for another file");
  });

  it("lets reduced-motion learners explicitly enable the same smooth 1.5-second travel", async () => {
    motionPreference.reduced = true;
    const user = userEvent.setup();
    const { container } = render(<HostRoleConversationPlayer />);

    await user.click(screen.getByRole("button", { name: "Play" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(container.querySelector(".network-topology__packet-marker--travel")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Enable smooth packet motion" }));
    const marker = container.querySelector(".network-topology__packet-marker--travel");
    expect(marker).toHaveStyle({ animationDuration: "1500ms" });
  });

  it("renders a static beginner explanation instead of crashing on invalid scenario data", () => {
    render(<HostRoleConversationPlayer conversations={{}} />);

    expect(screen.getByRole("note", { name: "Host conversation overview" })).toHaveTextContent(
      "A client asks for a service and a server responds",
    );
    expect(screen.queryByRole("button", { name: "Play" })).not.toBeInTheDocument();
  });
});

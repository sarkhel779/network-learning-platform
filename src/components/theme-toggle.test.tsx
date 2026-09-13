import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "./theme-toggle";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeToggle", () => {
  it("loads a persisted preference", () => {
    localStorage.setItem("packetsecrets-theme", "dark");
    render(<ThemeToggle />);
    expect(screen.getByRole("switch", { name: "Dark mode" })).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("falls back to dark when reading storage is denied", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage is denied", "SecurityError");
    });
    document.documentElement.setAttribute("data-theme", "dark");
    expect(() => render(<ThemeToggle />)).not.toThrow();
    expect(screen.getByRole("switch", { name: "Dark mode" })).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("toggles light and dark even when persisting storage fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage is full", "QuotaExceededError");
    });
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch", { name: "Dark mode" });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("presents light and dark on opposite sides of one switch and saves the choice", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch", { name: "Dark mode" });
    expect(toggle).toHaveTextContent("LightDark");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(localStorage.getItem("packetsecrets-theme")).toBe("light");
  });

  it("shows the active theme icon inside the slider thumb", async () => {
    const user = userEvent.setup();
    const { container } = render(<ThemeToggle />);
    const toggle = screen.getByRole("switch", { name: "Dark mode" });
    expect(container.querySelector('.theme-control__thumb [data-theme-icon="moon"]')).toBeInTheDocument();
    await user.click(toggle);
    expect(container.querySelector('.theme-control__thumb [data-theme-icon="sun"]')).toBeInTheDocument();
  });
});

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
    expect(screen.getByRole("combobox", { name: "Color theme" })).toHaveValue("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("falls back to system when reading storage is denied", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage is denied", "SecurityError");
    });
    document.documentElement.setAttribute("data-theme", "dark");
    expect(() => render(<ThemeToggle />)).not.toThrow();
    expect(screen.getByRole("combobox", { name: "Color theme" })).toHaveValue("system");
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });

  it("still applies dark, light, and system when persisting storage fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage is full", "QuotaExceededError");
    });
    render(<ThemeToggle />);
    const selector = screen.getByRole("combobox", { name: "Color theme" });
    for (const theme of ["dark", "light", "system"]) {
      await user.selectOptions(selector, theme);
      expect(selector).toHaveValue(theme);
      if (theme === "system") expect(document.documentElement).not.toHaveAttribute("data-theme");
      else expect(document.documentElement).toHaveAttribute("data-theme", theme);
    }
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/users" }));

import { AdminShell } from "./admin-shell";
import { navigationForRole } from "./admin-navigation";

describe("admin shell", () => {
  it("shows only support-authorized sections with the active users link", () => {
    render(<AdminShell items={navigationForRole("support_agent")}><main id="main-content">Directory</main></AdminShell>);
    expect(screen.getByRole("navigation", { name: "Admin navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "Billing" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Roles" })).not.toBeInTheDocument();
    expect(screen.getByText("GENERAL")).toBeInTheDocument();
    expect(screen.getByText("SYSTEM")).toBeInTheDocument();
  });
});

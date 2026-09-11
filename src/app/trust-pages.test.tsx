import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ContactPage from "./contact/page";
import PricingPage from "./pricing/page";
import PrivacyPage from "./privacy/page";
import TermsPage from "./terms/page";

const waitlistMocks = vi.hoisted(() => ({ getViewer: vi.fn(), getWaitlistStatus: vi.fn() }));
vi.mock("@/lib/supabase/session", () => ({ getViewer: waitlistMocks.getViewer }));
vi.mock("@/features/waitlist/waitlist.repository", () => ({ getWaitlistStatus: waitlistMocks.getWaitlistStatus }));

beforeEach(() => {
  waitlistMocks.getViewer.mockResolvedValue(null);
  waitlistMocks.getWaitlistStatus.mockResolvedValue({ ok: true, entry: null });
});

afterEach(cleanup);

describe("launch trust pages", () => {
  it("accurately explains account data and the absence of analytics and payments", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("heading", { name: "Privacy" })).toBeInTheDocument();
    expect(screen.getByText(/Supabase/i)).toBeInTheDocument();
    expect(screen.getByText(/learning progress/i)).toBeInTheDocument();
    expect(screen.getByText(/no analytics service/i)).toBeInTheDocument();
    expect(screen.getByText(/does not collect payments/i)).toBeInTheDocument();
    expect(screen.queryByText(/has no user accounts/i)).not.toBeInTheDocument();
    expect(screen.getByText(/waitlist status/i)).toBeInTheDocument();
    expect(screen.getByText(/consent timestamp and version/i)).toBeInTheDocument();
    expect(screen.getByText(/lesson attribution/i)).toBeInTheDocument();
    expect(screen.getByText(/notification delivery is not configured/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /withdraw.*contact/i })).toHaveAttribute("href", "/contact");
  });

  it("describes account and content responsibilities without claiming paid access", () => {
    render(<TermsPage />);

    expect(screen.getByText(/passwordless account/i)).toBeInTheDocument();
    expect(screen.getByText(/learning progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Pro access is not currently for sale/i)).toBeInTheDocument();
    expect(screen.getByText(/joining.*free/i)).toBeInTheDocument();
    expect(screen.getByText(/does not create.*Pro entitlement/i)).toBeInTheDocument();
    expect(screen.getByText(/does not guarantee.*availability or price/i)).toBeInTheDocument();
  });

  it("presents the launch offering as free learning plus a future Pro waitlist", () => {
    render(<PricingPage />);

    expect(screen.getByRole("heading", { name: "Free learning" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Founding Pro waitlist" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Join the Pro Member Waitlist" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.getByText(/No checkout is available/i)).toBeInTheDocument();
    expect(screen.queryByText(/Individual premium modules/i)).not.toBeInTheDocument();
  });

  it("offers a waitlist contact path without publishing a personal email address", async () => {
    render(await ContactPage({}));

    expect(screen.getByRole("heading", { name: "Founding Pro waitlist" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in to join/i })).toHaveAttribute("href", "/sign-in?returnTo=%2Fcontact");
    expect(screen.getByText(/does not collect payment details/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /@/ })).not.toBeInTheDocument();
  });
});

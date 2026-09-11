import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import ContactPage from "./contact/page";
import PricingPage from "./pricing/page";
import PrivacyPage from "./privacy/page";
import TermsPage from "./terms/page";

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
  });

  it("describes account and content responsibilities without claiming paid access", () => {
    render(<TermsPage />);

    expect(screen.getByText(/passwordless account/i)).toBeInTheDocument();
    expect(screen.getByText(/learning progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Pro access is not currently for sale/i)).toBeInTheDocument();
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

  it("offers a waitlist contact path without publishing a personal email address", () => {
    render(<ContactPage />);

    expect(screen.getByRole("heading", { name: "Founding Pro waitlist" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /free account/i })).toHaveAttribute("href", "/sign-in");
    expect(screen.getByText(/dedicated waitlist form/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /@/ })).not.toBeInTheDocument();
  });
});

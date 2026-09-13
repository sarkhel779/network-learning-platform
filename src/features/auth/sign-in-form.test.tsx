import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SignInForm } from "./sign-in-form";

const signInWithOAuth = vi.fn();
const signInWithOtp = vi.fn();

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserSupabaseClient: () => ({
    auth: { signInWithOAuth, signInWithOtp },
  }),
}));

beforeEach(() => {
  signInWithOAuth.mockResolvedValue({ error: null });
  signInWithOtp.mockResolvedValue({ error: null });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SignInForm", () => {
  it("renders Google and email passwordless options", () => {
    render(<SignInForm googleEnabled returnTo="/" />);

    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
    expect(screen.getByLabelText("Email address")).toBeVisible();
    expect(screen.getByRole("button", { name: "Email me a sign-in link" }))
      .toHaveClass("sign-in-text-action");
    expect(screen.getByRole("button", { name: "Continue with Google" }).querySelector("svg"))
      .toHaveAttribute("aria-hidden", "true");
    expect(screen.getByLabelText("Email address").closest(".sign-in-field")).not.toBeNull();
  });

  it("rejects an invalid email without contacting Supabase", async () => {
    const user = userEvent.setup();
    render(<SignInForm googleEnabled returnTo="/" />);

    await user.type(screen.getByLabelText("Email address"), "not-an-email");
    await user.click(
      screen.getByRole("button", { name: "Email me a sign-in link" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter a valid email address.",
    );
    expect(signInWithOtp).not.toHaveBeenCalled();
  });

  it("starts Google OAuth with the safe return path", async () => {
    const user = userEvent.setup();
    render(
      <SignInForm
        googleEnabled
        returnTo="/learn/networking-foundations/vlans-access-ports-and-trunks"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo:
          "http://localhost:3000/auth/callback?next=%2Flearn%2Fnetworking-foundations%2Fvlans-access-ports-and-trunks",
      },
    });
  });

  it("requests a magic link without revealing account existence", async () => {
    const user = userEvent.setup();
    render(<SignInForm googleEnabled returnTo="/paths/networking-foundations" />);

    await user.type(
      screen.getByLabelText("Email address"),
      "learner@example.com",
    );
    await user.click(
      screen.getByRole("button", { name: "Email me a sign-in link" }),
    );

    expect(signInWithOtp).toHaveBeenCalledWith({
      email: "learner@example.com",
      options: {
        emailRedirectTo:
          "http://localhost:3000/auth/callback?next=%2Fpaths%2Fnetworking-foundations",
        shouldCreateUser: true,
      },
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "If the address can receive mail, open its secure sign-in link on this device in the same browser.",
    );
  });

  it("shows why Google is unavailable when the provider is not configured", () => {
    render(<SignInForm googleEnabled={false} returnTo="/" />);

    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
    expect(screen.getByText(/Google sign-in is unavailable/)).toBeVisible();
  });

  it("prevents repeat submission while a request is pending", async () => {
    signInWithOtp.mockReturnValue(new Promise(() => undefined));
    const user = userEvent.setup();
    render(<SignInForm googleEnabled returnTo="/" />);

    await user.type(
      screen.getByLabelText("Email address"),
      "learner@example.com",
    );
    await user.click(
      screen.getByRole("button", { name: "Email me a sign-in link" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Sending secure link…" }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Continue with Google" }),
      ).toBeDisabled();
    });
  });

  it("shows a neutral error when Supabase rejects a request", async () => {
    signInWithOAuth.mockResolvedValue({ error: new Error("provider details") });
    const user = userEvent.setup();
    render(<SignInForm googleEnabled returnTo="/" />);

    await user.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We could not start secure sign-in. Please try again.",
    );
    expect(screen.queryByText("provider details")).not.toBeInTheDocument();
  });
});

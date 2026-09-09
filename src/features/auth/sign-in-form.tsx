"use client";

import { FormEvent, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type SignInFormProps = {
  returnTo: string;
};

type PendingMethod = "google" | "email" | null;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const genericError = "We could not start secure sign-in. Please try again.";

function callbackUrl(returnTo: string) {
  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("next", returnTo);
  return url.toString();
}

export function SignInForm({ returnTo }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState<PendingMethod>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function continueWithGoogle() {
    if (pending) return;

    setPending("google");
    setError(null);
    setMessage(null);

    const supabase = createBrowserSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl(returnTo) },
    });

    if (authError) {
      setError(genericError);
      setPending(null);
    }
  }

  async function emailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      setMessage(null);
      return;
    }

    setPending("email");
    setError(null);
    setMessage(null);

    const supabase = createBrowserSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: callbackUrl(returnTo),
        shouldCreateUser: true,
      },
    });

    if (authError) {
      setError(genericError);
    } else {
      setMessage(
        "If the address can receive mail, check it for your secure sign-in link.",
      );
    }
    setPending(null);
  }

  return (
    <div className="sign-in-form">
      <button
        className="secondary-link"
        type="button"
        disabled={pending !== null}
        onClick={continueWithGoogle}
      >
        {pending === "google" ? "Connecting securely…" : "Continue with Google"}
      </button>

      <p aria-hidden="true" className="sign-in-divider">or</p>

      <form noValidate onSubmit={emailSignIn}>
        <label htmlFor="sign-in-email">Email address</label>
        <input
          id="sign-in-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          disabled={pending !== null}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button className="primary-link" type="submit" disabled={pending !== null}>
          {pending === "email" ? "Sending secure link…" : "Email me a sign-in link"}
        </button>
      </form>

      {error ? <p role="alert">{error}</p> : null}
      {message ? <p role="status">{message}</p> : null}
    </div>
  );
}

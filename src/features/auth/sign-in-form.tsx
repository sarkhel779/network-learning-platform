"use client";

import { FormEvent, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type SignInFormProps = {
  googleEnabled: boolean;
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

export function SignInForm({ googleEnabled, returnTo }: SignInFormProps) {
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
        "If the address can receive mail, open its secure sign-in link on this device in the same browser.",
      );
    }
    setPending(null);
  }

  return (
    <div className="sign-in-form">
      <>
          <button
            className="secondary-link"
            type="button"
            disabled={!googleEnabled || pending !== null}
            onClick={continueWithGoogle}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.7h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.2c1.9-1.8 3.1-4.4 3.1-7.4Z"/><path fill="currentColor" opacity=".75" d="M12 22c2.7 0 5-.9 6.7-2.4L15.5 17c-.9.6-2 .9-3.5.9a5.9 5.9 0 0 1-5.5-4.1H3.2v2.7A10 10 0 0 0 12 22Z"/><path fill="currentColor" opacity=".55" d="M6.5 13.8a6 6 0 0 1 0-3.6V7.5H3.2a10 10 0 0 0 0 9l3.3-2.7Z"/><path fill="currentColor" opacity=".9" d="M12 6.1c1.6 0 3 .5 4.1 1.6l3.1-3.1A10 10 0 0 0 3.2 7.5l3.3 2.7A5.9 5.9 0 0 1 12 6.1Z"/></svg>
            {pending === "google" ? "Connecting securely…" : "Continue with Google"}
          </button>
          {!googleEnabled ? <p className="sign-in-feedback">Google sign-in is unavailable in this preview.</p> : null}
          <p aria-hidden="true" className="sign-in-divider">or</p>
      </>

      <form noValidate onSubmit={emailSignIn}>
        <div className="sign-in-field">
          <label htmlFor="sign-in-email">Email address</label>
          <input id="sign-in-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" value={email} disabled={pending !== null} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <button className="sign-in-text-action" type="submit" disabled={pending !== null}>
          {pending === "email" ? "Sending secure link…" : "Email me a sign-in link"}
        </button>
      </form>

      {error ? <p className="sign-in-feedback sign-in-feedback--error" role="alert">{error}</p> : null}
      {message ? <p className="sign-in-feedback sign-in-feedback--success" role="status">{message}</p> : null}
    </div>
  );
}

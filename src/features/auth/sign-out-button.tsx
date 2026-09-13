"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function signOut() {
    if (pending) return;
    setPending(true);
    setError(false);
    try {
      const { error: signOutError } = await createBrowserSupabaseClient().auth.signOut();
      if (signOutError) throw signOutError;
      router.replace("/");
      router.refresh();
    } catch {
      setError(true);
      setPending(false);
    }
  }

  return <div className="dashboard-sign-out">
    <button type="button" disabled={pending} onClick={() => void signOut()}>
      {pending ? "Signing out…" : "Sign out"}
    </button>
    {error ? <p role="alert">Could not sign out. Please try again.</p> : null}
  </div>;
}

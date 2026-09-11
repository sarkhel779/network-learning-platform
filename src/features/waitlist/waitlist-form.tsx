"use client";

import Link from "next/link";
import { useState } from "react";

import type { Viewer } from "@/features/learner-workspace/learner-workspace.types";

import type { WaitlistEntry } from "./waitlist.types";

type WaitlistFormProps = {
  viewer: Viewer | null;
  initialEntry: WaitlistEntry | null;
  initialUnavailable?: boolean;
  sourceLessonSlug?: string;
};

type PendingAction = "join" | "leave" | null;

async function confirmedEntry(response: Response): Promise<WaitlistEntry> {
  if (!response.ok) throw new Error("waitlist request failed");
  const body = await response.json() as { entry?: WaitlistEntry };
  if (!body.entry) throw new Error("waitlist confirmation missing");
  return body.entry;
}

export function WaitlistForm({
  viewer,
  initialEntry,
  initialUnavailable = false,
  sourceLessonSlug,
}: WaitlistFormProps) {
  const [entry, setEntry] = useState(initialEntry);
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  if (!viewer) {
    return (
      <section className="waitlist-card" aria-labelledby="waitlist-action-title">
        <p className="eyebrow">Free account required</p>
        <h2 id="waitlist-action-title">Save your place</h2>
        <p>Sign in first so your choice is securely linked to your learner account.</p>
        <Link className="primary-link waitlist-sign-in" href="/sign-in?returnTo=%2Fcontact">
          Sign in to join
        </Link>
      </section>
    );
  }

  const joined = entry?.status === "joined";

  async function join() {
    if (!consent || pending) return;
    setPending("join");
    setError(null);
    try {
      const response = await fetch("/api/pro-waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ consent: true, ...(sourceLessonSlug ? { sourceLessonSlug } : {}) }),
      });
      setEntry(await confirmedEntry(response));
      setConsent(false);
    } catch {
      setError("We could not update the waitlist. Please try again.");
    } finally {
      setPending(null);
    }
  }

  async function leave() {
    if (pending) return;
    setPending("leave");
    setError(null);
    try {
      setEntry(await confirmedEntry(await fetch("/api/pro-waitlist", { method: "DELETE" })));
    } catch {
      setError("We could not update the waitlist. Please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="waitlist-card" aria-labelledby="waitlist-action-title">
      <div className="waitlist-card__heading">
        <div>
          <p className="eyebrow">Founding Pro</p>
          <h2 id="waitlist-action-title">{joined ? "You are on the list" : "Join the early-access list"}</h2>
        </div>
        <span className={`waitlist-status waitlist-status--${joined ? "joined" : "open"}`}>
          {joined ? "Joined" : "No payment"}
        </span>
      </div>

      {joined ? (
        <div className="waitlist-card__body">
          <p>We will email you when Founding Pro launch updates are ready. Nothing has been charged.</p>
          <button className="waitlist-secondary-action" type="button" disabled={pending !== null} onClick={leave}>
            {pending === "leave" ? "Turning off updates…" : "Turn off updates"}
          </button>
        </div>
      ) : (
        <div className="waitlist-card__body">
          {entry?.status === "unsubscribed" ? <p className="waitlist-update-state">Updates are off. You can rejoin at any time.</p> : null}
          <label className="waitlist-consent">
            <input
              type="checkbox"
              checked={consent}
              disabled={pending !== null}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>Email me product and launch updates. Joining is free, no payment is collected, and I may withdraw at any time.</span>
          </label>
          <button className="waitlist-primary-action" type="button" disabled={!consent || pending !== null} onClick={join}>
            {pending === "join" ? "Joining…" : "Join Founding Pro waitlist"}
          </button>
        </div>
      )}

      <div className="waitlist-feedback" aria-live="polite">
        {initialUnavailable && !error ? <p role="status">Waitlist status is temporarily unavailable. You can retry by joining below.</p> : null}
        {error ? <p role="alert">{error}</p> : null}
      </div>
    </section>
  );
}

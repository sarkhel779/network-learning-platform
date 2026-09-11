export const WAITLIST_CONSENT_VERSION = "founding-pro-v1" as const;

export type WaitlistStatus = "joined" | "unsubscribed";

export type WaitlistEntry = {
  status: WaitlistStatus;
  sourceLessonSlug: string | null;
  consentVersion: string;
  consentedAt: string;
  unsubscribedAt: string | null;
};

export type WaitlistResult =
  | { ok: true; entry: WaitlistEntry | null }
  | { ok: false; code: "invalid_source" | "unavailable" };

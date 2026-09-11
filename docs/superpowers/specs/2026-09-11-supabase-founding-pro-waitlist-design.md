# Supabase Founding Pro Waitlist Design

**Date:** 2026-09-11

**Status:** Approved direction; implementation specification

## Purpose

Replace the temporary `/contact` placeholder with a real Founding Pro waitlist that records an authenticated learner's interest and explicit notification consent. The feature measures demand without selling access, changing entitlements, collecting payment, or promising a launch date.

## Scope

This slice includes:

- an authenticated Supabase-backed waitlist record;
- explicit consent before joining;
- idempotent duplicate joins;
- a visible joined state and an unsubscribe action;
- optional attribution to a valid published lesson slug;
- a responsive `/contact` waitlist experience;
- RLS and server-boundary tests; and
- privacy and terms copy that accurately describes the waitlist.

This slice excludes payments, pricing decisions, Pro entitlement delivery, marketing-email delivery, analytics vendors, administrator dashboards, and protected Pro content.

## Data model

Create `public.pro_waitlist_entries` with one row per authenticated user:

- `user_id uuid primary key references auth.users(id) on delete cascade`
- `email text not null`
- `status text not null check (status in ('joined', 'unsubscribed'))`
- `source_lesson_slug text null`
- `consent_version text not null`
- `consented_at timestamptz not null`
- `unsubscribed_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

`email` is a server-owned snapshot read from `auth.users`; no form or request body may supply it. A duplicate join while already joined returns the existing record without changing `consented_at`. Rejoining after unsubscribe records a new `consented_at`, clears `unsubscribed_at`, and restores `status = 'joined'`. `consent_version` is a fixed application constant for the exact launch consent wording.

The optional source must be validated against the repository's known lesson slugs before persistence. Invalid or unpublished values are rejected rather than stored as arbitrary text.

## Database boundary

Enable RLS on `pro_waitlist_entries`. Authenticated learners may select only their own row. Direct client insert, update, and delete are not granted.

Two `security definer` functions perform mutations:

- `public.join_pro_waitlist(p_consent boolean, p_consent_version text, p_source_lesson_slug text default null)`
- `public.leave_pro_waitlist()`

Both functions derive the user from `auth.uid()`. Join rejects an unauthenticated call, rejects any value other than `true` for consent, and reads the verified email from `auth.users`. Leave changes status to `unsubscribed`; it never deletes the record. Functions use `set search_path = ''`, schema-qualified names, minimal grants, and return only the caller's safe waitlist fields.

The application remains responsible for validating `consent_version` and lesson attribution before calling the join function. The database independently enforces identity, consent presence, status values, and ownership.

## Application boundary

Add `/api/pro-waitlist` with `Cache-Control: no-store`:

- `GET` returns the current learner's waitlist state or `401`.
- `POST` accepts exactly `{ consent: true, sourceLessonSlug?: string }`, obtains the authenticated viewer, validates the optional lesson, and joins idempotently.
- `DELETE` obtains the authenticated viewer and marks the entry unsubscribed.

Malformed input returns `400`; unauthenticated access returns `401`; unavailable persistence returns a generic `503` without leaking database details. The repository exposes typed `getWaitlistStatus`, `joinWaitlist`, and `leaveWaitlist` operations and maps Supabase failures to explicit application result codes.

## User experience

`/contact` becomes the dedicated waitlist page.

- Anonymous visitors see the Pro topics being explored and a sign-in link that returns safely to `/contact`.
- Authenticated non-members see a required unchecked consent checkbox and `Join the Founding Pro waitlist` button.
- The consent text says Packetsecrets may email product and launch updates, joining is free, no payment is taken, and consent can be withdrawn.
- Joined learners see a confirmation and an `Unsubscribe from updates` action.
- Unsubscribed learners see that updates are off and may explicitly rejoin.
- Pending, success, validation, and retry states are announced accessibly and prevent duplicate submissions.

The existing lesson Pro-preview links continue to target `/contact`. Lesson-specific attribution is supported when a future preview supplies `?source=<lesson-slug>`; the contact page ignores invalid query values and never reflects them as executable markup.

## Privacy and terms

Privacy will add waitlist status, consent timestamp/version, and source attribution to the disclosed account data, state that no marketing messages are sent until delivery is configured, and explain that unsubscribe stops future waitlist updates. Terms will reiterate that joining is free, creates no entitlement, and guarantees neither availability nor price.

## Testing

Automated coverage must prove:

- SQL structure, RLS ownership, lack of direct mutation grants, authenticated RPC behavior, email derivation, idempotent duplicate join, unsubscribe, and explicit rejoin;
- strict request parsing and valid lesson attribution;
- unauthenticated, malformed, successful, duplicate, failed-persistence, and unsubscribe API behavior;
- anonymous, eligible, joined, unsubscribed, pending, success, and retry UI states;
- keyboard operation, 44px touch targets, live announcements, and mobile containment; and
- updated Privacy, Terms, Pricing, and Contact claims remain mutually consistent.

The final branch must pass the focused waitlist tests, complete Vitest suite, TypeScript validation, ESLint, and production build. The migration is committed but is not claimed as deployed until it has been run and verified in the Supabase project.

## Rollout and failure handling

The UI must not present a successful join until the server confirms persistence. If Supabase is unavailable, the learner remains unjoined and receives a retry message. Existing lesson access and progress continue to work independently of waitlist failures.

Deployment order is migration first, application second. Before public launch, verify the migration in Supabase, join and unsubscribe with a real test learner, confirm RLS from a second account, and verify that no payment or immediate-Pro language appears.

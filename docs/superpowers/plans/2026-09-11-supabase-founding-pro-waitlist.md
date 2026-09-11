# Supabase Founding Pro Waitlist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the temporary contact placeholder with an authenticated, consent-based, Supabase-backed Founding Pro waitlist that supports idempotent joins and unsubscribe/rejoin behavior without payments or entitlement changes.

**Architecture:** PostgreSQL RLS exposes only the learner's own waitlist row, while security-definer RPCs derive identity and email from Supabase Auth and own every mutation. A strict repository and `/api/pro-waitlist` boundary map provider failures to safe application results; a client form renders anonymous, joined, unsubscribed, pending, and retry states on `/contact`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase PostgreSQL/Auth, Zod 4, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-11-supabase-founding-pro-waitlist-design.md`

## Global Constraints

- Joining is free and must not change an entitlement or imply that Pro access is available.
- The request body never accepts an email address; RPC code reads it from `auth.users` for `auth.uid()`.
- Consent must be exactly `true`; launch consent version is the application constant `founding-pro-v1`.
- A duplicate join while joined preserves `consented_at`; a rejoin after unsubscribe records a new consent time.
- Unsubscribe changes status and never deletes the row.
- Only published Networking Foundations lesson slugs may be stored as attribution.
- Every API response uses `Cache-Control: no-store`; provider details never reach the client.
- No payments, marketing delivery, analytics vendor, admin dashboard, or Pro-content delivery belongs in this plan.

---

### Task 1: Add the waitlist database boundary

**Files:**
- Create: `supabase/migrations/202609110006_create_pro_waitlist.sql`
- Create: `supabase/migrations/pro-waitlist.test.ts`
- Create: `supabase/tests/pro_waitlist_rls.sql`

**Interfaces:**
- Consumes: Supabase `auth.users`, `auth.uid()`, and the existing `public.set_updated_at()` trigger function.
- Produces: `public.pro_waitlist_entries`, `public.join_pro_waitlist(boolean,text,text)`, and `public.leave_pro_waitlist()`.

- [ ] **Step 1: Write failing migration-structure tests**

Assert the SQL contains the table fields and constraints, enables RLS, grants authenticated `select` only, revokes direct mutations, defines both security-definer functions with `set search_path = ''`, reads email from `auth.users`, rejects absent consent, uses an `on conflict (user_id)` idempotent branch, preserves `consented_at` for an already-joined row, and marks unsubscribe without deletion.

```ts
expect(sql).toMatch(/create table public\.pro_waitlist_entries/i);
expect(sql).toMatch(/primary key references auth\.users\s*\(id\)/i);
expect(sql).toMatch(/alter table public\.pro_waitlist_entries enable row level security/i);
expect(sql).toMatch(/from auth\.users[\s\S]*auth\.uid\(\)/i);
expect(sql).not.toMatch(/delete from public\.pro_waitlist_entries/i);
```

- [ ] **Step 2: Run the structure test and verify RED**

Run: `pnpm vitest run supabase/migrations/pro-waitlist.test.ts`

Expected: FAIL because `202609110006_create_pro_waitlist.sql` does not exist.

- [ ] **Step 3: Implement the migration**

Use status values `joined` and `unsubscribed`. The join RPC returns the row, keeps the timestamp for duplicate joined calls, and uses `now()` for an explicit rejoin. The leave RPC updates only the caller's row. Add an own-row select policy and grant RPC execution only to `authenticated`.

```sql
create policy "learners read own waitlist entry"
on public.pro_waitlist_entries for select to authenticated
using ((select auth.uid()) = user_id);

revoke insert, update, delete on public.pro_waitlist_entries from authenticated;
grant select on public.pro_waitlist_entries to authenticated;
```

- [ ] **Step 4: Add executable RLS/RPC assertions**

In `supabase/tests/pro_waitlist_rls.sql`, use transaction-local JWT claims for two learner UUIDs. Assert learner A cannot see learner B, duplicate joins preserve the first timestamp, `leave_pro_waitlist()` changes status, and rejoin restores joined with a later consent time. Roll back the fixture transaction.

- [ ] **Step 5: Run tests and commit**

Run: `pnpm vitest run supabase/migrations/pro-waitlist.test.ts`

Expected: PASS.

```bash
git add supabase/migrations/202609110006_create_pro_waitlist.sql supabase/migrations/pro-waitlist.test.ts supabase/tests/pro_waitlist_rls.sql
git commit -m "feat: add Founding Pro waitlist persistence"
```

### Task 2: Add strict input and repository adapters

**Files:**
- Create: `src/features/waitlist/waitlist.types.ts`
- Create: `src/features/waitlist/waitlist-input.schema.ts`
- Create: `src/features/waitlist/waitlist-input.schema.test.ts`
- Create: `src/features/waitlist/waitlist.repository.ts`
- Create: `src/features/waitlist/waitlist.repository.test.ts`

**Interfaces:**
- Consumes: `createServerSupabaseClient()` and `listPublishedLessons("networking-foundations")`.
- Produces: `WAITLIST_CONSENT_VERSION`, `parseWaitlistJoinInput`, `getWaitlistStatus(userId)`, `joinWaitlist(userId,input)`, `leaveWaitlist(userId)` and `WaitlistEntry`.

```ts
export const WAITLIST_CONSENT_VERSION = "founding-pro-v1" as const;
export type WaitlistEntry = {
  status: "joined" | "unsubscribed";
  sourceLessonSlug: string | null;
  consentVersion: string;
  consentedAt: string;
  unsubscribedAt: string | null;
};
export type WaitlistResult =
  | { ok: true; entry: WaitlistEntry | null }
  | { ok: false; code: "invalid_source" | "unavailable" };
```

- [ ] **Step 1: Write failing schema tests**

Accept only `{ consent: true }` plus an optional published lesson slug. Reject `false`, missing consent, email, unknown keys, empty strings, unpublished/unknown lesson slugs, and non-object JSON.

- [ ] **Step 2: Run schema tests and verify RED**

Run: `pnpm vitest run src/features/waitlist/waitlist-input.schema.test.ts`

Expected: FAIL because the schema module does not exist.

- [ ] **Step 3: Implement the Zod parser**

Build the allowed-slug set from `listPublishedLessons("networking-foundations")`, use `.strict()`, and add a refinement for `sourceLessonSlug`. Export a parser that throws `ZodError` on invalid input.

- [ ] **Step 4: Write failing repository tests**

Mock the Supabase adapter, not the repository. Assert own-row lookup maps snake case, join passes `{ p_consent: true, p_consent_version: "founding-pro-v1", p_source_lesson_slug }`, leave calls `leave_pro_waitlist`, user-ID mismatches in returned rows become unavailable, and error strings are never returned.

- [ ] **Step 5: Implement the repository and verify GREEN**

Every returned database row must have `user_id === userId` before mapping. Return `{ ok: false, code: "unavailable" }` for provider failures and `{ ok: false, code: "invalid_source" }` before any RPC when attribution is invalid.

Run: `pnpm vitest run src/features/waitlist`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/waitlist
git commit -m "feat: add waitlist validation and repository"
```

### Task 3: Add the authenticated waitlist API

**Files:**
- Create: `src/app/api/pro-waitlist/route.ts`
- Create: `src/app/api/pro-waitlist/route.test.ts`

**Interfaces:**
- Consumes: `getViewer()`, `parseWaitlistJoinInput`, `getWaitlistStatus`, `joinWaitlist`, and `leaveWaitlist` from Task 2.
- Produces: `GET`, `POST`, and `DELETE` route handlers returning `{ entry }` or `{ error }` JSON.

- [ ] **Step 1: Write failing route tests**

Cover `401` for every anonymous method; `400` for malformed POST bodies; `200` plus no-store for status, join, duplicate join, and unsubscribe; `503` for repository unavailability; and absence of provider messages in response text.

```ts
expect(response.headers.get("cache-control")).toContain("no-store");
expect(await response.text()).not.toContain("supabase");
```

- [ ] **Step 2: Run route tests and verify RED**

Run: `pnpm vitest run src/app/api/pro-waitlist/route.test.ts`

Expected: FAIL because the route module does not exist.

- [ ] **Step 3: Implement minimal handlers**

Authenticate before reading a body. POST catches parser errors and returns `Invalid waitlist request.` with `400`. Repository failures return `Waitlist is temporarily unavailable.` with `503`. Successful calls return the mapped entry only.

- [ ] **Step 4: Run route tests and commit**

Run: `pnpm vitest run src/app/api/pro-waitlist/route.test.ts src/features/waitlist`

Expected: PASS.

```bash
git add src/app/api/pro-waitlist src/features/waitlist
git commit -m "feat: expose authenticated waitlist API"
```

### Task 4: Build the accessible waitlist experience

**Files:**
- Create: `src/features/waitlist/waitlist-form.tsx`
- Create: `src/features/waitlist/waitlist-form.test.tsx`
- Modify: `src/app/contact/page.tsx`
- Modify: `src/app/trust-pages.test.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/theme-styles.test.ts`

**Interfaces:**
- Consumes: `Viewer | null`, initial `WaitlistEntry | null`, and optional validated `sourceLessonSlug` supplied by the server page.
- Produces: `<WaitlistForm viewer={viewer} initialEntry={entry} sourceLessonSlug={slug} />`.

- [ ] **Step 1: Write failing component tests**

Anonymous state links to `/sign-in?returnTo=%2Fcontact`; eligible state requires an unchecked consent box before enabling join; joined state shows confirmation and unsubscribe; unsubscribed state offers rejoin; pending state disables repeat clicks; success is server-confirmed; failed fetch shows a retry message; the status region uses `aria-live="polite"`.

- [ ] **Step 2: Run component tests and verify RED**

Run: `pnpm vitest run src/features/waitlist/waitlist-form.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the client form**

Use `fetch("/api/pro-waitlist", { method: "POST" | "DELETE", headers: { "content-type": "application/json" }, body })`. Update the visible membership state only after a successful response. Keep the checked consent in local state and reset it after unsubscribe or failed rejoin.

- [ ] **Step 4: Integrate the server page**

Make `/contact` an async Server Component. Load `getViewer()` and, only for a viewer, `getWaitlistStatus(viewer.id)`. Validate `searchParams.source` through the Task 2 parser helper before passing attribution; invalid values become `undefined`. If status loading fails, render the form with an unavailable initial state and allow retry through the API.

- [ ] **Step 5: Add responsive and trust-copy assertions**

Style `.waitlist-form` with a contained grid, 44px controls, visible focus, wrapping copy, and a one-column mobile layout. Extend trust-page tests for the exact consent/no-payment/unsubscribe claims and `theme-styles.test.ts` for containment and touch-target rules.

- [ ] **Step 6: Run UI tests and commit**

Run: `pnpm vitest run src/features/waitlist/waitlist-form.test.tsx src/app/trust-pages.test.tsx src/app/theme-styles.test.ts`

Expected: PASS.

```bash
git add src/features/waitlist/waitlist-form.tsx src/features/waitlist/waitlist-form.test.tsx src/app/contact/page.tsx src/app/trust-pages.test.tsx src/app/globals.css src/app/theme-styles.test.ts
git commit -m "feat: launch Founding Pro waitlist experience"
```

### Task 5: Align disclosures and complete release verification

**Files:**
- Modify: `src/app/privacy/page.tsx`
- Modify: `src/app/terms/page.tsx`
- Modify: `src/app/trust-pages.test.tsx`
- Modify: `src/features/lessons/premium-preview.test.tsx`

**Interfaces:**
- Consumes: the `/contact` waitlist route and its fixed consent semantics.
- Produces: consistent launch disclosures and regression evidence across trust pages and lesson preview links.

- [ ] **Step 1: Write failing disclosure tests**

Require Privacy to name waitlist status, consent timestamp/version, optional lesson attribution, unsubscribe, and the fact that marketing delivery is not configured. Require Terms to state that joining is free, creates no Pro entitlement, and guarantees no availability or price. Require every default waitlist CTA to target `/contact` without checkout language.

- [ ] **Step 2: Run disclosure tests and verify RED**

Run: `pnpm vitest run src/app/trust-pages.test.tsx src/features/lessons/premium-preview.test.tsx`

Expected: FAIL on the newly required disclosures.

- [ ] **Step 3: Update Privacy and Terms**

Use factual launch copy only. Do not claim that promotional email is being sent; state that notification delivery will be configured before messages begin and that consent can be withdrawn through `/contact`.

- [ ] **Step 4: Run focused verification**

Run: `pnpm vitest run src/features/waitlist src/app/api/pro-waitlist src/app/trust-pages.test.tsx src/features/lessons/premium-preview.test.tsx supabase/migrations/pro-waitlist.test.ts`

Expected: PASS.

- [ ] **Step 5: Run the full release gate**

Run: `pnpm test`

Expected: all Vitest files and tests pass.

Run: `pnpm typecheck`

Expected: exit 0 with no TypeScript errors.

Run: `pnpm lint`

Expected: exit 0 with no ESLint errors.

Run: `pnpm build`

Expected: exit 0 and `/contact` plus `/api/pro-waitlist` appear in the route output.

- [ ] **Step 6: Audit scope and commit**

Run: `rg -n "checkout|price|payment|entitlement.*pro" src/features/waitlist src/app/contact src/app/api/pro-waitlist`

Expected: only explicit statements that no payment is taken and joining creates no entitlement; no checkout implementation.

```bash
git add src/app/privacy/page.tsx src/app/terms/page.tsx src/app/trust-pages.test.tsx src/features/lessons/premium-preview.test.tsx
git commit -m "test: verify waitlist launch boundaries"
```

## Deployment checkpoint

Do not claim the feature is live when the branch merges. First run `202609110006_create_pro_waitlist.sql` in the production Supabase project, execute `supabase/tests/pro_waitlist_rls.sql` against a safe test context, then deploy the application. Verify join, duplicate join, unsubscribe, explicit rejoin, and cross-account isolation with controlled learner accounts before public launch.

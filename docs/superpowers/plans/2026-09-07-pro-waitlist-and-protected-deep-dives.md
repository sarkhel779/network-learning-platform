# Packetsecrets Pro Waitlist and Protected Deep Dives Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Introduce one lesson-attached Founding Pro preview and waitlist, then safely serve combined RFC/vendor/advanced content only to explicit Pro entitlements—without payments.

**Architecture:** A Pro manifest contains safe preview metadata. Each protected MDX body and scenario dataset is reachable only through a server-only registry after a fresh entitlement check. Waitlist enrollment is an idempotent authenticated mutation. Authoring validation requires authoritative source URLs and read-only vendor commands.

**Tech Stack:** Next.js Server Components/Actions, Prisma/PostgreSQL, MDX, Zod, Vitest, Playwright.

---

## Task 1: Model one combined Pro Deep Dive

**Files:**
- Create: `src/features/pro/pro-deep-dive.schema.ts`
- Create: `src/features/pro/pro-deep-dive.types.ts`
- Create matching tests

**Step 1: Write failing schema tests** for a single deep dive per lesson, at least one authoritative source, optional RFC/vendor groups, vendor relevance notes, read-only commands, output samples, and version/platform caveats.

```ts
type VendorCheck = {
  vendor: "cisco" | "fortinet" | "palo-alto";
  command: string;
  verifies: string;
  sourceUrl: string;
  platform: string;
  softwareVersions: string;
  outputExcerpt?: string;
};
```

**Step 2: Implement validation**

Allow only `https` source URLs whose hostname matches the configured IETF/vendor documentation allow-list. Reject common mutation verbs (`configure`, `set`, `delete`, `commit`, `write`, `copy ... running-config`) unless a future approved schema version explicitly permits them. Require a relevance explanation; do not require symmetric vendor coverage.

**Step 3: Run and commit**

Run: `pnpm vitest run src/features/pro/pro-deep-dive.schema.test.ts`
Expected: PASS.

```bash
git add src/features/pro
git commit -m "feat: validate combined Pro deep dives"
```

## Task 2: Add safe preview metadata and a protected registry

**Files:**
- Create: `src/features/pro/pro-preview.repository.ts`
- Create: `src/features/pro/pro-content.repository.ts`
- Create: `src/content/networking-foundations/pro/README.md`
- Create matching tests

**Step 1: Write failing leakage tests**

Import the preview repository as an anonymous consumer and assert it contains only lesson slug, title, benefit summary, and source/vendor counts. Assert `loadProContent` rejects anonymous/free access before invoking any MDX/data loader.

**Step 2: Implement separate registries**

```ts
import "server-only";
export async function loadProContent(key: LessonKey, viewer: ViewerDto) {
  if (viewer.access !== "pro") throw new ProAccessDeniedError();
  const entitlement = await revalidateEntitlement(viewer.userId);
  if (entitlement !== "PRO") throw new ProAccessDeniedError();
  return proImports[key]?.();
}
```

Never import the protected registry from a Client Component, public metadata generator, sitemap, or JSON-LD builder.

**Step 3: Run tests and commit**

Run: `pnpm vitest run src/features/pro`
Expected: PASS.

```bash
git add src/features/pro src/content/networking-foundations/pro
git commit -m "security: isolate Pro lesson payloads"
```

## Task 3: Add Founding Pro waitlist persistence

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/features/waitlist/waitlist.schema.ts`
- Create: `src/features/waitlist/waitlist.repository.ts`
- Create: `src/features/waitlist/join-waitlist.action.ts`
- Create matching tests

**Step 1: Write failing tests** for authenticated-only enrollment, explicit consent, allowed source lesson, duplicate idempotency, preserved original consent timestamp, and unsubscribe/status transitions.

**Step 2: Add the model**

```prisma
model ProWaitlistEntry {
  id               String         @id @default(cuid())
  userId           String         @unique
  email            String
  consentedAt      DateTime
  sourceLessonSlug String?
  status           WaitlistStatus @default(JOINED)
  updatedAt        DateTime       @updatedAt
  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Joining does not alter `User.entitlement`. Read email from the authenticated user record, never from a form field.

**Step 3: Migrate, test, and commit**

Run: `pnpm prisma migrate dev --name add_pro_waitlist && pnpm vitest run src/features/waitlist`
Expected: PASS.

```bash
git add prisma src/features/waitlist
git commit -m "feat: add Founding Pro waitlist"
```

## Task 4: Build the in-place Pro preview and waitlist UI

**Files:**
- Modify: `src/features/lessons/premium-preview.tsx`
- Create: `src/features/pro/pro-deep-dive-preview.tsx`
- Create: `src/features/waitlist/waitlist-button.tsx`
- Modify lesson navigation tests

**Step 1: Write failing tests** asserting one combined card titled “Pro Deep Dive,” RFC and relevant-vendor benefits within that card, no Vendor Academy link, no separate upgrade products, and a “Join the Founding Pro waitlist” action.

**Step 2: Implement access-specific behavior**

- Anonymous: invite sign-in with a safe lesson return path.
- Free account: show consent text and idempotent join action.
- Waitlisted account: show joined state and notification preference link.
- Pro: render the authorized deep-dive body in the same lesson position.

**Step 3: Run and commit**

Run: `pnpm vitest run src/features/pro src/features/waitlist src/features/lessons`
Expected: PASS.

```bash
git add src/features/pro src/features/waitlist src/features/lessons
git commit -m "feat: add in-lesson Founding Pro experience"
```

## Task 5: Add one representative protected deep dive

**Files:**
- Create: `src/content/networking-foundations/pro/osi-and-tcp-ip-models.pro.mdx`
- Create: `src/content/networking-foundations/pro/osi-and-tcp-ip-models.pro.ts`
- Create content tests

**Step 1: Write failing content tests** requiring cited authoritative URLs, correct access key, no configuration-changing commands, stated platform/version caveats, and no full vendor-course material.

**Step 2: Author the example**

Keep the free lesson vendor-neutral. In the attached Pro body, explain the relevant standards-to-observation connection and include only vendor checks that add genuine diagnostic value. Verify every factual claim/command against current IETF or official vendor documentation at authoring time; record `checkedAt`, document URL, platform, and version range in the data module.

**Step 3: Run tests and commit**

Run: `pnpm vitest run src/content/networking-foundations/pro`
Expected: PASS.

```bash
git add src/content/networking-foundations/pro
git commit -m "content: add first protected Pro deep dive"
```

## Task 6: Add privacy-safe funnel analytics

**Files:**
- Create: `src/features/analytics/events.schema.ts`
- Create: `src/features/analytics/track-event.ts`
- Create matching tests
- Instrument public player, registration boundary, auth, lesson completion, Pro preview, waitlist

**Step 1: Write failing allow-list tests** for the approved event names and fields. Reject email, name, token, magic-link URL, answers, premium text, and learner-submitted command output.

```ts
const eventNames = [
  "lesson_impression", "player_started", "player_completed",
  "registration_boundary_viewed", "auth_started", "account_completed",
  "lesson_completed", "return_learning_visit", "pro_preview_viewed",
  "pro_waitlist_joined",
] as const;
```

**Step 2: Implement a server endpoint/adapter** with a strict Zod payload, first-party pseudonymous session identifier, consent-aware persistence, and no raw IP stored in the analytics record.

**Step 3: Run and commit**

Run: `pnpm vitest run src/features/analytics`
Expected: PASS.

```bash
git add src/features/analytics src/features/packet-flow src/features/lessons src/features/auth src/features/waitlist
git commit -m "feat: measure the freemium learning funnel"
```

## Task 7: Verify access control and abuse cases end to end

**Files:**
- Create: `tests/e2e/pro-access.spec.ts`
- Create: `tests/e2e/pro-waitlist.spec.ts`

**Step 1: Test anonymous, free, and Pro fixtures** against the same canonical lesson URL. Assert only Pro receives protected body/scenario sentinels in HTML and RSC/network responses.

**Step 2: Test failures**: entitlement lookup failure falls back to free content; duplicate waitlist join stays joined; direct protected-loader/endpoint access is denied; sign-out removes Pro content on next navigation.

**Step 3: Run complete verification**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm build && pnpm test:e2e`
Expected: PASS with no console/hydration errors.

**Step 4: Commit**

```bash
git add tests/e2e
git commit -m "test: verify Pro isolation and waitlist flow"
```

## Release checkpoint

Release the waitlist before granting real Pro entitlements. Use explicit test/admin fixtures only in non-production until protected authoring review is complete. Confirm page source, RSC payloads, route responses, sitemap, and structured data never disclose protected bodies. Payments, prices, cancellation, taxes, invoices, and full vendor academies remain out of scope.


# Learner Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build secure cross-device lesson progress, exact resume, automatic completion, restart history, next-incomplete navigation, and a functional My learning drawer for authenticated learners.

**Architecture:** A versioned TypeScript manifest defines the ordered requirements for each published lesson and is mirrored into Supabase by a migration. Authenticated browser mutations call narrow Next.js route handlers, which validate payloads and invoke RLS-aware PostgreSQL functions that append idempotent events and transactionally update attempt summaries. A client progress provider composes reading, interactive-player, and knowledge-check adapters while server-rendered lesson and My learning views load authoritative summaries.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9, Supabase Auth/PostgreSQL/RLS, Zod 4, Vitest, Testing Library, Playwright

**Spec:** `docs/superpowers/specs/2026-09-09-learner-progress-design.md`

## Global Constraints

- Only authenticated learners are tracked; anonymous lesson behavior remains unchanged.
- Reading completion requires an explicit `Continue` action.
- Interactive completion requires the player's defined terminal state.
- Any submitted knowledge-check answer completes the requirement; correctness is stored separately.
- Completion percentage and lesson status are derived from server-owned manifest rows.
- Mutations are idempotent and never trust a browser-supplied percentage, status, or user ID.
- Restart creates a new current attempt and preserves earlier attempts and events.
- Progress failures remain visible and retryable; the UI never falsely claims completion.
- Account content is rendered only for authenticated viewers; Pro content remains unavailable.
- Existing public content, no-JavaScript access, keyboard behavior, and reduced-motion behavior must not regress.

---

### Task 1: Define and validate versioned progress manifests

**Files:**
- Create: `src/features/progress/progress.types.ts`
- Create: `src/features/progress/progress-manifest.schema.ts`
- Create: `src/features/progress/progress-manifest.schema.test.ts`
- Create: `src/features/progress/progress-manifests.ts`
- Create: `src/features/progress/progress-manifests.test.ts`
- Modify: `src/features/catalog/catalog.data.ts`

**Interfaces:**
- Produces: `ProgressItemKind = "section" | "interactive" | "knowledge_check"`
- Produces: `ProgressManifestItem`, `LessonProgressManifest`, `LessonProgressSummary`, `ProgressEventType`, and `lessonProgressManifests`
- Produces: `getLessonProgressManifest(pathwayId: string, lessonId: string): LessonProgressManifest`
- Requires every published, non-Pro trackable item to have a stable ID, label, anchor, kind, and `required: true`

- [ ] **Step 1: Write failing schema tests**

Test valid manifests and reject duplicate item IDs, duplicate anchors, empty requirement lists, non-positive versions, unknown kinds, and manifests that omit a published lesson.

```ts
expect(() => parseLessonProgressManifest({
  pathwayId: "path_networking_foundations",
  lessonId: "lesson_demo",
  contentVersion: 1,
  items: [
    { itemId: "read_intro", kind: "section", label: "Introduction", anchor: "intro", required: true },
    { itemId: "read_intro", kind: "section", label: "Repeated", anchor: "repeat", required: true },
  ],
})).toThrow(/duplicate itemId/i);
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `pnpm vitest run src/features/progress/progress-manifest.schema.test.ts src/features/progress/progress-manifests.test.ts`

Expected: FAIL because the manifest modules do not exist.

- [ ] **Step 3: Implement the schema and manifest registry**

Use Zod plus an explicit duplicate scan. Keep content identity separate from display labels.

```ts
export type ProgressManifestItem = Readonly<{
  itemId: string;
  kind: "section" | "interactive" | "knowledge_check";
  label: string;
  anchor: string;
  required: true;
}>;

export type LessonProgressManifest = Readonly<{
  pathwayId: string;
  lessonId: string;
  contentVersion: number;
  items: readonly ProgressManifestItem[];
}>;

export type LessonProgressSummary = Readonly<{
  attemptId: string;
  pathwayId: string;
  lessonId: string;
  contentVersion: number;
  attemptNumber: number;
  status: "not_started" | "in_progress" | "completed";
  completedItemIds: readonly string[];
  nextItemId: string | null;
  lastItemId: string | null;
  lastAnchor: string | null;
  completionPercent: number;
  incorrectCheckCount: number;
  updatedAt: string;
}>;
```

Create manifests for all 13 currently published lessons. Use catalog lesson IDs and heading anchors; give each knowledge check its own stable ID rather than treating the whole summary section as one item.

- [ ] **Step 4: Add catalog consistency checks**

Assert every published lesson has exactly one manifest, no unpublished lesson is accidentally enabled, every section-kind anchor exists in the lesson's catalog sections, and Pro-only sections are excluded.

- [ ] **Step 5: Run focused tests**

Run: `pnpm vitest run src/features/progress/progress-manifest.schema.test.ts src/features/progress/progress-manifests.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/progress src/features/catalog/catalog.data.ts
git commit -m "feat: define lesson progress manifests"
```

### Task 2: Add progress persistence, RLS, and transactional database functions

**Files:**
- Create: `supabase/migrations/202609090002_create_learner_progress.sql`
- Create: `supabase/tests/learner_progress_rls.sql`
- Create: `supabase/tests/learner_progress_functions.sql`

**Interfaces:**
- Produces tables `lesson_progress_manifests`, `lesson_progress_items`, `learner_lesson_attempts`, and `learner_progress_events`
- Produces RPC `record_learner_progress_event(p_pathway_id text, p_lesson_id text, p_content_version integer, p_idempotency_key uuid, p_event_type text, p_item_id text, p_item_kind text, p_anchor text, p_answer_correct boolean, p_metadata jsonb) returns learner_lesson_attempts`
- Produces RPC `restart_learner_lesson(p_pathway_id text, p_lesson_id text, p_content_version integer, p_idempotency_key uuid) returns learner_lesson_attempts`
- Consumes the exact manifest IDs and versions defined in Task 1

- [ ] **Step 1: Write failing transactional SQL tests**

Cover own-row reads, cross-user invisibility, denied direct mutations, event idempotency, stale-version rejection, unknown-item rejection, incorrect-answer completion, automatic completion, and restart history.

```sql
select public.record_learner_progress_event(
  'path_networking_foundations',
  'lesson_demo',
  1,
  '11111111-1111-1111-1111-111111111111',
  'knowledge_check_attempted',
  'check_demo_1',
  'knowledge_check',
  'knowledge-check-summary',
  false,
  '{}'::jsonb
);
```

The fourth argument is the idempotency key, never a user ID; functions derive ownership from `auth.uid()`.

- [ ] **Step 2: Run tests against a disposable/local Supabase database**

Open the Packetsecrets development project's Supabase SQL editor. Run `supabase/tests/learner_progress_rls.sql`, then run `supabase/tests/learner_progress_functions.sql`. Each file must begin with `begin;`, create uniquely named UUID fixtures, perform assertions in `do $$ ... $$`, and finish with `rollback;`.

Expected: FAIL because the tables and functions do not exist.

- [ ] **Step 3: Implement tables, indexes, grants, and RLS**

Enable RLS on every learner-owned table. Grant authenticated users `select` only on attempts/events; revoke direct insert/update/delete. Permit manifest reads but no browser writes. Add checks for enumerated event/status/item-kind values and unique `(user_id, idempotency_key)`.

- [ ] **Step 4: Implement `record_learner_progress_event`**

The security-definer function must set a safe `search_path`, require `auth.uid()`, validate the current manifest and item, create the current attempt when absent, insert the event with `on conflict do nothing`, recompute completed IDs and percentage, and emit `lesson_completed` exactly once when all requirements are complete.

- [ ] **Step 5: Implement `restart_learner_lesson`**

Lock the current attempt, calculate the next attempt number, retain historical rows, create a zero-percent current attempt, and append `lesson_restarted` in one transaction.

- [ ] **Step 6: Seed manifest and item rows**

Mirror every Task 1 manifest. A test must compare the SQL seed tuple count and IDs against a generated TypeScript snapshot so drift fails before deployment.

- [ ] **Step 7: Run SQL tests and inspect cleanup**

Expected: all RLS and function assertions pass, transaction rolls back, and no fixture users or attempts remain.

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/202609090002_create_learner_progress.sql supabase/tests
git commit -m "feat: secure learner progress data"
```

### Task 3: Build the server progress repository and validated API

**Files:**
- Create: `src/features/progress/progress-input.schema.ts`
- Create: `src/features/progress/progress-input.schema.test.ts`
- Create: `src/features/progress/progress.repository.ts`
- Create: `src/features/progress/progress.repository.test.ts`
- Create: `src/app/api/learning/progress/route.ts`
- Create: `src/app/api/learning/progress/route.test.ts`
- Create: `src/app/api/learning/progress/restart/route.ts`
- Create: `src/app/api/learning/progress/restart/route.test.ts`

**Interfaces:**
- Produces `ProgressMutationInput`
- Produces `getLessonProgress(userId, pathwayId, lessonId)` and `listPathwayProgress(userId, pathwayId)`
- Produces authenticated `POST /api/learning/progress` and `POST /api/learning/progress/restart`
- Consumes Task 1 manifests and Task 2 RPCs

- [ ] **Step 1: Write failing input-schema tests**

Accept UUID idempotency keys, known event kinds, stable IDs, optional correctness only for knowledge checks, and bounded metadata. Reject user IDs, percentages, completion status, external URLs, oversized metadata, and mismatched item kinds.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `pnpm vitest run src/features/progress/progress-input.schema.test.ts src/features/progress/progress.repository.test.ts src/app/api/learning/progress/route.test.ts src/app/api/learning/progress/restart/route.test.ts`

- [ ] **Step 3: Implement the repository**

Map Supabase rows to immutable application types. Validate every mutation against `getLessonProgressManifest` before calling the RPC. Return a discriminated result:

```ts
export type ProgressMutationResult =
  | { ok: true; progress: LessonProgressSummary }
  | { ok: false; code: "unauthenticated" | "invalid_item" | "stale_version" | "unavailable" };
```

- [ ] **Step 4: Implement route handlers**

Validate the session with `auth.getUser()`, parse JSON with Zod, return 401/400/409/503 without provider internals, set `Cache-Control: no-store`, and never echo event metadata in errors.

- [ ] **Step 5: Run focused tests**

Expected: PASS for authenticated writes, safe failures, duplicate requests, and restart.

- [ ] **Step 6: Commit**

```bash
git add src/features/progress src/app/api/learning/progress
git commit -m "feat: add learner progress API"
```

### Task 4: Load account content and authoritative progress on lesson pages

**Files:**
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.tsx`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.tsx`
- Modify: `src/features/lessons/lesson-shell.tsx`
- Modify: `src/features/lessons/lesson-shell.test.tsx`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`

**Interfaces:**
- Consumes `Viewer`, `getLessonProgress`, and `getLessonProgressManifest`
- Passes `manifest` and `initialProgress` into the lesson progress client boundary

- [ ] **Step 1: Write failing authorization and composition tests**

Verify anonymous loads only public content, authenticated loads public plus account content, Pro remains absent, and authenticated initial progress reaches `LessonShell`. Verify a Supabase progress-read failure produces an unavailable state without hiding lesson content.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `pnpm vitest run --run 'src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.tsx' src/features/lessons/lesson-shell.test.tsx src/features/lessons/lesson-content.repository.test.ts`

- [ ] **Step 3: Implement viewer-aware content loading**

Resolve access as `viewer ? "account" : "anonymous"`; render public then account modules in document order. Do not request or render Pro content.

- [ ] **Step 4: Load initial progress server-side**

For authenticated viewers, load the current summary and manifest with no-store semantics. For anonymous viewers, pass neither and render no account progress controls.

- [ ] **Step 5: Run focused tests**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add 'src/app/learn/[pathwaySlug]/[lessonSlug]' src/features/lessons
git commit -m "feat: compose authenticated lesson progress"
```

### Task 5: Create the client progress provider and reliable mutation queue

**Files:**
- Create: `src/features/progress/lesson-progress-context.tsx`
- Create: `src/features/progress/lesson-progress-context.test.tsx`
- Create: `src/features/progress/progress-client.ts`
- Create: `src/features/progress/progress-client.test.ts`
- Create: `src/features/progress/pending-progress-store.ts`
- Create: `src/features/progress/pending-progress-store.test.ts`

**Interfaces:**
- Produces `LessonProgressProvider`
- Produces `useLessonProgressItem(itemId)` returning `{ state, complete, retry }`
- Produces `useLessonProgress()` returning authoritative/optimistic summaries and navigation helpers
- Consumes the API from Task 3

- [ ] **Step 1: Write failing provider and queue tests**

Cover idle → saving → saved, failure → retry, duplicate `complete()` calls, ordered replay, stable idempotency keys, reload hydration, and rollback of an event rejected as invalid.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `pnpm vitest run src/features/progress/lesson-progress-context.test.tsx src/features/progress/progress-client.test.ts src/features/progress/pending-progress-store.test.ts`

- [ ] **Step 3: Implement the bounded pending store**

Store only pathway, lesson, version, event, item, anchor, correctness, creation time, and idempotency key. Cap the queue per learner and remove entries after confirmation. Namespace browser storage by the authenticated viewer ID.

- [ ] **Step 4: Implement the provider**

Compute optimistic display from the server summary plus pending known items. Keep authoritative completion separate and show `Lesson complete` only after the API confirms it. Replay pending events sequentially on `online` and provider mount.

- [ ] **Step 5: Run focused tests**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/progress
git commit -m "feat: coordinate learner progress mutations"
```

### Task 6: Add reading completion, resume, next-incomplete, and restart controls

**Files:**
- Create: `src/features/progress/section-continue.tsx`
- Create: `src/features/progress/section-continue.test.tsx`
- Create: `src/features/progress/lesson-progress-controls.tsx`
- Create: `src/features/progress/lesson-progress-controls.test.tsx`
- Modify: `src/features/lessons/lesson-shell.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces MDX component `SectionContinue({ itemId, anchor })`
- Produces `LessonProgressControls`
- Consumes Task 5 hooks

- [ ] **Step 1: Write failing UI tests**

Verify Continue saves before advancing focus, retry copy on failure, text progress, next-incomplete anchors, non-automatic resume, missing-anchor fallback, restart confirmation, restored focus, and reduced-motion styling.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `pnpm vitest run src/features/progress/section-continue.test.tsx src/features/progress/lesson-progress-controls.test.tsx src/features/lessons/lesson-shell.test.tsx`

- [ ] **Step 3: Implement section and lesson controls**

Use explicit buttons with stable names: `Continue: <section label>`, `Go to next incomplete item`, `Resume where you left off`, and `Restart lesson`. Navigate with `document.getElementById(anchor)?.focus({ preventScroll: true })` after making headings programmatically focusable, then call `scrollIntoView` respecting reduced motion.

- [ ] **Step 4: Implement restart confirmation**

The dialog copy states: “This starts a new attempt at 0%. Your previous attempts and answers remain in your history.” Do not restart until the learner confirms and the server responds successfully.

- [ ] **Step 5: Run focused tests and accessibility assertions**

Expected: PASS with text-only progress and no focus movement before an explicit action.

- [ ] **Step 6: Commit**

```bash
git add src/features/progress src/features/lessons/lesson-shell.tsx src/app/globals.css
git commit -m "feat: add lesson progress controls"
```

### Task 7: Track knowledge-check attempts without requiring correctness

**Files:**
- Modify: `src/features/lessons/knowledge-check.tsx`
- Modify: `src/features/lessons/knowledge-check.test.tsx`
- Modify: `mdx-components.tsx`
- Modify: every published `src/content/networking-foundations/*.account.mdx` containing `KnowledgeCheck`
- Modify: corresponding `*.content.test.ts` files

**Interfaces:**
- Extends `KnowledgeCheckProps` with required stable `progressItemId: string`
- Calls `complete({ eventType: "knowledge_check_attempted", answerCorrect })` after answer submission

- [ ] **Step 1: Write failing component tests**

Verify incorrect and correct submissions both complete the item, correctness differs, changing a radio selection does not create an event, repeat checks reuse the same idempotent completion, and save failure leaves the explanation visible with retry status.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `pnpm vitest run src/features/lessons/knowledge-check.test.tsx`

- [ ] **Step 3: Implement progress-aware `KnowledgeCheck`**

Keep existing answer feedback. On `Check answer`, set local feedback immediately and send the completion event with `answerCorrect: selectedIndex === correctIndex`.

- [ ] **Step 4: Assign stable IDs in account MDX**

Add `progressItemId` to every published knowledge check and assert the IDs exactly match the Task 1 manifests. IDs follow `<lesson-short-name>_check_<ordinal>`, remain independent of question text, and are unique repository-wide.

- [ ] **Step 5: Run component and content tests**

Run: `pnpm vitest run src/features/lessons/knowledge-check.test.tsx src/content`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/lessons/knowledge-check.tsx src/features/lessons/knowledge-check.test.tsx mdx-components.tsx src/content/networking-foundations
git commit -m "feat: track knowledge check attempts"
```

### Task 8: Add a shared terminal-state adapter to interactive players

**Files:**
- Create: `src/features/progress/progress-completion-boundary.tsx`
- Create: `src/features/progress/progress-completion-boundary.test.tsx`
- Modify: player components under `src/features/packet-flow`, `src/features/packet-journey`, `src/features/layer-models`, `src/features/hosts-and-devices`, `src/features/connection-media`, `src/features/switching`, `src/features/delivery-scope`, `src/features/route-decision`, `src/features/edge-devices`, `src/features/switch-learning`, `src/features/arp`, and `src/features/vlans`
- Modify: their colocated `*.test.tsx` files
- Modify: published MDX player invocations where an explicit ID is required

**Interfaces:**
- Produces `useProgressCompletionBoundary(progressItemId)` returning `markTerminalStateReached()`
- Each player accepts a stable `progressItemId`
- Consumes Task 5 progress context

- [ ] **Step 1: Write failing shared-boundary tests**

Verify a terminal signal completes once, non-terminal steps do nothing, replay does not restart lesson progress, scenario changes require the manifest-defined terminal condition, and the boundary becomes a no-op for anonymous/no-provider rendering.

- [ ] **Step 2: Run the boundary test and confirm failure**

Run: `pnpm vitest run src/features/progress/progress-completion-boundary.test.tsx`

- [ ] **Step 3: Implement the shared adapter**

Keep completion policy outside playback reducers. The adapter receives a terminal signal from a player and translates it into one shared progress event.

- [ ] **Step 4: Integrate players by behavioral family**

For linear autoplay/manual players, signal when the final stage is first reached. For scenario/lab players, signal only after the learner reaches the scenario's defined completed outcome. Opening, playing, pausing, selecting a scenario, or inspecting a packet must not complete the item.

- [ ] **Step 5: Add focused tests to every modified player family**

Use fake timers for autoplay players. Assert that reaching the final stage calls the adapter exactly once and Restart/Replay does not issue another lesson event.

- [ ] **Step 6: Run all player tests**

Run: `pnpm vitest run src/features/packet-flow src/features/packet-journey src/features/layer-models src/features/hosts-and-devices src/features/connection-media src/features/switching src/features/delivery-scope src/features/route-decision src/features/edge-devices src/features/switch-learning src/features/arp src/features/vlans`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features src/content/networking-foundations mdx-components.tsx
git commit -m "feat: track interactive lesson completion"
```

### Task 9: Place explicit Continue boundaries throughout published lessons

**Files:**
- Modify: `mdx-components.tsx`
- Modify: all published `src/content/networking-foundations/*.public.mdx`
- Modify: all published `src/content/networking-foundations/*.account.mdx`
- Modify: all corresponding `*.content.test.ts`
- Modify: `src/content/lesson-rendering.test.tsx`

**Interfaces:**
- Consumes `SectionContinue` and Task 1 manifests
- Produces one explicit completion action after each required reading section

- [ ] **Step 1: Write failing content-coverage tests**

For each manifest, parse the MDX source and assert exactly one `SectionContinue` for every section-kind item, no Continue for Pro content, no duplicate IDs, and placement after the section's learning content rather than before it.

- [ ] **Step 2: Run content tests and confirm failure**

Run: `pnpm vitest run src/content`

- [ ] **Step 3: Add Continue boundaries lesson by lesson**

Add `<SectionContinue itemId="..." anchor="..." />` after each required reading section. Do not add it to a section whose manifest item is an interactive or knowledge check; those components own their completion signals.

- [ ] **Step 4: Verify rendered HTML and public/account separation**

Assert no invalid nested interactive elements, anonymous rendering remains useful, authenticated rendering includes account boundaries, and Pro content stays locked.

- [ ] **Step 5: Run content and rendering tests**

Run: `pnpm vitest run src/content src/features/lessons`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add mdx-components.tsx src/content
git commit -m "feat: add explicit section progress actions"
```

### Task 10: Replace the My learning placeholder with real progress

**Files:**
- Create: `src/features/progress/my-learning.tsx`
- Create: `src/features/progress/my-learning.test.tsx`
- Create: `src/features/progress/my-learning.server.tsx`
- Create: `src/features/progress/my-learning.server.test.tsx`
- Modify: `src/features/learner-workspace/learner-workspace.tsx`
- Modify: `src/features/learner-workspace/learner-workspace.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes `listPathwayProgress`, pathway catalog, manifests, and restart API
- Produces a server-loaded `MyLearning` drawer body

- [ ] **Step 1: Write failing grouping and rendering tests**

Cover Continue learning selection, Not started/In progress/Completed groups, pathway percentage, next incomplete labels, incorrect-answer review indicators, empty state, restart confirmation, long titles, 360-pixel layout, and safe repository failure copy.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `pnpm vitest run src/features/progress/my-learning.test.tsx src/features/progress/my-learning.server.test.tsx src/features/learner-workspace/learner-workspace.test.tsx`

- [ ] **Step 3: Implement the server loader and client view**

Choose Continue learning by most recent `updated_at` among current in-progress attempts. Compute pathway progress from completed current-version lessons divided by currently published manifested lessons. Never mix historical attempt percentages into the current display.

- [ ] **Step 4: Wire the workspace tool**

Replace only the `learning` placeholder. Preserve the existing drawer, tool order, focus trap, mobile bottom sheet, and honest placeholders for every later-stage tool.

- [ ] **Step 5: Run focused tests**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/progress src/features/learner-workspace src/app/globals.css
git commit -m "feat: deliver My learning progress"
```

### Task 11: Add end-to-end progress and security journeys

**Files:**
- Create: `tests/e2e/learner-progress.spec.ts`
- Modify: `tests/e2e/learner-workspace.spec.ts`
- Modify: `playwright.config.ts`
- Modify: test-only authenticated viewer/progress adapters introduced by Stage 1 and Tasks 3–5

**Interfaces:**
- Exercises the public UI and API contracts from Tasks 3–10
- Keeps all test adapters gated by exact `NODE_ENV === "test"` and `PLAYWRIGHT_TEST_SESSION === "1"`

- [ ] **Step 1: Write failing desktop and mobile journeys**

Cover signed-in start, explicit reading Continue, a representative terminal player, incorrect knowledge-check attempt, refresh restoration, next incomplete, automatic completion, My learning display, restart history, retry after simulated failure, duplicate submission, and anonymous absence.

- [ ] **Step 2: Run the new spec and confirm failure**

Run: `pnpm playwright test tests/e2e/learner-progress.spec.ts --project=chromium --project=mobile-chromium`

- [ ] **Step 3: Add deterministic test adapters**

Provide seeded per-test progress state and failure injection only when both test guards are exact. Add unit tests proving undefined, development, staging, and production environments reject the adapters.

- [ ] **Step 4: Make all new journeys pass**

Use role- and label-based locators. Do not depend on timing sleeps; wait for explicit saved, retry, or completion states.

- [ ] **Step 5: Run the new E2E spec**

Expected: PASS on desktop and mobile Chromium.

- [ ] **Step 6: Commit**

```bash
git add tests/e2e playwright.config.ts src
git commit -m "test: cover learner progress journeys"
```

### Task 12: Deploy the migration safely and complete full verification

**Files:**
- Modify only if verification exposes a defect in files already owned by Tasks 1–11

**Interfaces:**
- Validates the entire Stage 2 vertical slice and the live Supabase schema

- [ ] **Step 1: Run static and unit verification**

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands exit 0 and the production build generates every static route.

- [ ] **Step 2: Run the complete browser suite once**

Run: `pnpm test:e2e`

Expected: all desktop and mobile projects pass with no unexpected console errors or horizontal overflow.

- [ ] **Step 3: Review the migration before applying it**

Check the exact target project, confirm automatic RLS remains enabled, inspect grants/functions for `search_path` and ownership, and verify no service-role key is present in tracked files or browser bundles.

- [ ] **Step 4: Apply the migration to the configured Supabase development project**

Run the migration once. Record the migration identifier and resulting schema state without copying secrets into terminal output, documentation, or commits.

- [ ] **Step 5: Execute live transactional isolation tests**

Run the two-user RLS and RPC tests inside a transaction and roll back. Confirm own progress is visible, cross-user progress is invisible, direct mutation is denied, duplicate idempotency keys do not duplicate events, and restart preserves history.

- [ ] **Step 6: Verify repository state**

```bash
git diff --check main...HEAD
git status --short
```

Expected: clean diff check and no uncommitted files.

- [ ] **Step 7: Request an independent code review**

Review specifically for authorization bypasses, manifest drift, false completion, retry/idempotency defects, content-access regressions, focus behavior, and mobile overflow. Resolve important findings and rerun affected verification.

- [ ] **Step 8: Commit verification fixes if any**

```bash
git add -u
git commit -m "fix: harden learner progress tracking"
```

Skip this commit when verification requires no changes.

---

## Completion boundary

Stage 2 is ready for a pull request only when all published lessons have validated manifests, every required item has exactly one completion mechanism, incorrect knowledge-check answers count as attempts, authoritative server completion cannot be forged, progress restores across sessions, restart retains history, My learning is functional, live RLS tests pass, and the complete test/build/browser suite is green.

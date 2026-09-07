# Packetsecrets Free Account Learning State Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let signed-in learners bookmark lessons, save position, mark completion, and resume without weakening lesson authorization.

**Architecture:** PostgreSQL stores one progress record per user/lesson and one bookmark per user/lesson. Server actions validate inputs, resolve the authenticated user in the DAL, and perform idempotent upserts. Client controls use optimistic UI only after receiving the server-authorized initial state.

**Tech Stack:** Next.js Server Actions, Prisma/PostgreSQL, Zod, React, Vitest, Playwright.

---

## Task 1: Add progress persistence

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/features/progress/progress.schema.ts`
- Create: `src/features/progress/progress.repository.ts`
- Create matching tests

**Step 1: Write failing validation/repository tests** for known lesson slugs, a `0..100` percentage, optional current section, unique user+lesson records, monotonic `highestPercent`, and idempotent completion.

**Step 2: Add models**

```prisma
model LessonProgress {
  id             String   @id @default(cuid())
  userId         String
  lessonSlug     String
  currentSection String?
  highestPercent Int      @default(0)
  completedAt    DateTime?
  updatedAt      DateTime @updatedAt
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, lessonSlug])
}
```

Reject unpublished/unknown lessons before writes. Once complete, ordinary progress updates must not clear `completedAt`.

**Step 3: Migrate, run tests, commit**

Run: `pnpm prisma migrate dev --name add_lesson_progress && pnpm vitest run src/features/progress`
Expected: PASS.

```bash
git add prisma src/features/progress
git commit -m "feat: persist lesson progress"
```

## Task 2: Add bookmark persistence

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/features/bookmarks/bookmark.repository.ts`
- Create matching tests

**Step 1: Write failing tests** for idempotent add/remove, user isolation, and rejection of unknown lessons.

**Step 2: Add `LessonBookmark`** with `@@unique([userId, lessonSlug])`, cascade deletion, and `createdAt`.

**Step 3: Run migration/tests and commit**

Run: `pnpm prisma migrate dev --name add_lesson_bookmarks && pnpm vitest run src/features/bookmarks`
Expected: PASS.

```bash
git add prisma src/features/bookmarks
git commit -m "feat: persist lesson bookmarks"
```

## Task 3: Add authenticated server actions

**Files:**
- Create: `src/features/progress/progress.actions.ts`
- Create: `src/features/bookmarks/bookmark.actions.ts`
- Create matching tests

**Step 1: Write failing authorization tests** proving anonymous callers cannot mutate, forged `userId` fields are ignored/rejected, malformed payloads fail, and user A cannot mutate user B.

**Step 2: Implement actions**

```ts
"use server";
export async function saveProgress(input: unknown) {
  const viewer = await requireAccount();
  const command = progressCommandSchema.parse(input);
  await progressRepository.upsert(viewer.userId, command);
  revalidatePath(`/learn/networking-foundations/${command.lessonSlug}`);
}
```

Apply the same pattern to bookmark toggles. Rate-limit high-frequency position writes and coalesce client updates; completion and bookmark changes write immediately.

**Step 3: Run and commit**

Run: `pnpm vitest run src/features/progress src/features/bookmarks`
Expected: PASS.

```bash
git add src/features/progress src/features/bookmarks
git commit -m "feat: add authorized learning-state actions"
```

## Task 4: Add lesson controls and resume behavior

**Files:**
- Create: `src/features/progress/lesson-progress-controls.tsx`
- Create: `src/features/bookmarks/bookmark-button.tsx`
- Modify: `src/features/lessons/lesson-shell.tsx`
- Add matching tests

**Step 1: Write failing tests** for signed-out hidden controls, signed-in current state, optimistic pending labels, failure rollback, completion announcement, and bookmark accessible name.

**Step 2: Render server-authorized initial state** near the lesson header. Save section changes only for authenticated learners; preserve anonymous reading position locally without treating it as an account record.

**Step 3: Run tests and commit**

Run: `pnpm vitest run src/features/progress src/features/bookmarks src/features/lessons/lesson-shell.test.tsx`
Expected: PASS.

```bash
git add src/features/progress src/features/bookmarks src/features/lessons
git commit -m "feat: add lesson progress and bookmark controls"
```

## Task 5: Add the learner account page

**Files:**
- Create: `src/app/account/page.tsx`
- Create: `src/features/account/learning-summary.tsx`
- Add tests and `tests/e2e/learning-state.spec.ts`

**Step 1: Write failing tests** for authentication redirect with safe `returnTo`, bookmarked and in-progress lessons, percentage/completion labels, and empty states.

**Step 2: Build the server-rendered summary** using minimal DTOs. Each Resume link points directly to the canonical lesson and optional safe section fragment.

**Step 3: Run full verification**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm build && pnpm test:e2e -- tests/e2e/learning-state.spec.ts`
Expected: PASS.

**Step 4: Commit**

```bash
git add src/app/account src/features/account tests/e2e
git commit -m "feat: add learner resume dashboard"
```

## Manual checkpoint

Using two test accounts, confirm progress/bookmarks never cross users, sign-out removes account controls, a failed save visibly rolls back, the experience fits at 360 px, and keyboard/screen-reader status messages are meaningful in both themes.


# Packetsecrets Full-Site Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Release all user-facing PR #33 work on the current Packetsecrets site while retaining PRs #35 and #36 and preserving learner history.

**Architecture:** Start from merged `origin/main` in the isolated `feature/full-site-integration` worktree. Merge the old `origin/feature/landing-page-refresh` tree without committing, resolve its 11 known overlaps against current dashboard/auth/home contracts, then validate the combined product. Treat the two progress SQL migrations and Vercel release as separate gated operations after application verification.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, Playwright, Supabase Postgres, Vercel CLI.

**Spec:** `docs/superpowers/specs/2026-09-13-full-site-integration-design.md`

## Global Constraints

- Preserve the current `/dashboard` route, admin roles, auth callback, account gates, progress APIs, and the PR #36 homepage content.
- Preserve curriculum content and technical packet fields while adding the older branch's new lessons, Labs, and players.
- Maintain a readable explicit light theme, visible focus, reduced-motion behavior, and mobile layouts.
- Never run either progress migration in production until staging passes and a restorable backup or verified recovery path exists.
- Keep credentials and learner identifiers out of command output, commits, test artifacts, and PR descriptions.
- The production Vercel project `packet-secrets-team/packetsecrets` is not Git-connected; merging a PR does not deploy it.

---

### Task 1: Integrate the older branch without losing released routes

**Files:** `src/app/globals.css`, `src/app/page.tsx`, `src/app/page.test.tsx`, `src/app/sign-in/page.test.tsx`, `src/components/header-search.tsx`, `src/components/header-search.test.tsx`, `src/components/site-header.tsx`, `src/features/auth/return-path.ts`, `src/features/auth/return-path.test.ts`, `src/features/home/topic-icon.tsx`, `src/features/lessons/lesson-shell.test.tsx`; preserve `src/app/dashboard/page.tsx`, `src/app/dashboard/page.test.tsx`, and `src/app/api/learning/progress/**`.

**Interfaces:** The merged `SiteHeader` still exposes `/dashboard`; `HeaderSearch` returns published lesson URLs; `HomePage` keeps the released hero and working topic cards. The old branch supplies the rest of the changed app files and tests.

- [ ] Record `git status --short` and `git rev-parse origin/main origin/feature/landing-page-refresh`. Start only if this worktree contains the committed integration spec and no unrelated edits.
- [ ] Run `git merge --no-commit --no-ff origin/feature/landing-page-refresh` in this worktree. Inspect `git diff --name-only --diff-filter=U`; the expected overlaps are the 11 files listed above. Stop if the merge adds unexpected deletions of dashboard/auth/progress files.
- [ ] Resolve homepage, topic icon, header, and search overlaps by keeping PR #36 route destinations and dashboard link, while adding the older branch's shared-theme semantics and relevant tests. Resolve `return-path` and sign-in overlaps by preserving current-main security and redirect behavior. For `lesson-shell.test.tsx`, retain both suites of assertions. Resolve CSS by retaining homepage sections and incorporating older shared tokens/player/Labs selectors; no conflict markers may remain.
- [ ] Remove the obsolete `docs/superpowers/specs/2026-09-12-visual-refresh-design.md` from the integrated tree, as previously requested by the user; keep current integration docs and other historical implementation notes.
- [ ] Add an integration test in `src/components/site-header.test.tsx` asserting the header still links to `/dashboard`, `/labs`, and a published pathway. Run `pnpm exec vitest run src/components/site-header.test.tsx` before and after the resolution, and preserve all existing tests.
- [ ] Run `git diff --check` and `git status --short`. Commit only when no unmerged paths remain: `git add -A` followed by `git commit -m "Integrate site visual system, lessons, and labs"`.

### Task 2: Verify shared visual system and current application contracts

**Files:** `src/app/globals.css`, `src/app/theme-styles.test.ts`, `src/components/theme-toggle.tsx`, `src/components/theme-toggle.test.tsx`, `src/components/site-footer.tsx`, `src/features/lessons/lesson-shell.tsx`, `src/features/packet-flow/packet-flow-player.tsx`, `tests/e2e/home.spec.ts`, `tests/e2e/paragraph-color.spec.ts`, `tests/e2e/site-header-active-navigation.spec.ts`.

**Interfaces:** Root CSS variables power homepage, footer, forms, cards, lesson shells, and players; explicit light mode and reduced motion remain operative.

- [ ] Run focused Vitest: `pnpm exec vitest run src/app/theme-styles.test.ts src/components/theme-toggle.test.tsx src/components/site-brand.test.tsx src/features/lessons/lesson-shell.test.tsx`. Resolve failures using the shared token values from PR #33; preserve PR #36 homepage links.
- [ ] Run `pnpm exec playwright test tests/e2e/home.spec.ts tests/e2e/paragraph-color.spec.ts tests/e2e/site-header-active-navigation.spec.ts --reporter=line`. Inspect both desktop and mobile results and fix actual contrast, focus, or overflow failures before proceeding.
- [ ] Open local `/`, `/sign-in`, `/paths/networking-foundations`, a public lesson, and `/dashboard` in a browser; verify the same navy/teal visual language and that signed-out `/dashboard` redirects to sign-in without an open redirect.
- [ ] Commit any resulting focused fixes with `git add` of the affected files and `git commit -m "Preserve shared theme and dashboard navigation"`.

### Task 3: Verify Labs, transport split, and packet players

**Files:** `src/app/labs/page.tsx`, `src/features/labs/sample-packet-lab.tsx`, `src/features/catalog/catalog.data.ts`, `src/features/lessons/lesson-content.repository.ts`, `src/app/learn/networking-foundations/tcp-udp-and-ports/page.tsx`, `src/features/progress/progress-manifests.ts`, `src/features/transport/**`, `src/features/dhcp/**`, `src/features/vlans/**`, `src/features/packet-formats/protocol-format-diagram.tsx`, `tests/e2e/labs.spec.ts`, `tests/e2e/protocol-format-diagrams.spec.ts`, `tests/e2e/lesson-page-contents.spec.ts`.

**Interfaces:** `/labs` renders the old branch's sample lab; distinct TCP and UDP lesson slugs are published; the legacy combined route remains usable; packet-player controls and inspector fields remain intact.

- [ ] Run focused Vitest: `pnpm exec vitest run src/app/labs/page.test.tsx src/features/labs src/features/progress/progress-manifests.test.ts src/features/transport src/features/dhcp src/features/vlans`. Resolve failures by reconciling old branch identifiers with current catalog and progress contracts; do not discard learner events.
- [ ] Run `pnpm exec playwright test tests/e2e/labs.spec.ts tests/e2e/protocol-format-diagrams.spec.ts tests/e2e/lesson-page-contents.spec.ts tests/e2e/dhcp-packet-format.spec.ts --reporter=line` in desktop and mobile projects.
- [ ] In local browser QA, open `/labs`, the distinct TCP and UDP lessons, the legacy `/learn/networking-foundations/tcp-udp-and-ports` route, and representative DHCP/VLAN lesson interactives. Use visible navigation and player controls; verify no dead links, missing packet fields, or horizontal overflow.
- [ ] Run the complete application checks sequentially: `pnpm exec vitest run --reporter=dot --testTimeout=15000`, `pnpm exec tsc --noEmit`, `pnpm exec next lint`, and `pnpm build`. Record exit codes and counts; stop on any failure.
- [ ] Commit only corrections required by those checks, with a message naming the corrected feature area.

### Task 4: Validate staging data migration and recovery

**Files:** `supabase/migrations/202609120001_split_tcp_udp_progress.sql`, `supabase/migrations/202609120002_add_tcp_fast_retransmit_progress.sql`, `supabase/migrations/tcp-udp-ports-progress.test.ts`.

**Interfaces:** The first transaction changes required TCP items to 20 and adds 14 UDP items; the second adds fast retransmit for 21 TCP items. Both retain `learner_progress_events` and recalculate relevant `learner_lesson_attempts` rows.

- [ ] Confirm the staging Supabase project ref is `tkeaajaybqwkamdgzsap` and production ref is `qenatospppxrydqtgxua` using authenticated project metadata, not URL assumptions. Check each database's migration history for the two exact version identifiers.
- [ ] Before any mutation, obtain a restorable backup of `lesson_progress_manifests`, `lesson_progress_items`, `learner_lesson_attempts`, and `learner_progress_events`, or verify a provider recovery point. If no recovery path is available, stop; do not apply SQL.
- [ ] Record private aggregate baseline queries in a secure session: counts of the four tables; counts of old TCP attempts by status; counts of old TCP events; counts of new UDP manifest/items, if any. Do not print rows, user IDs, or credentials.
- [ ] Apply the two reviewed SQL files to staging in version order only if they are not already recorded as applied. Re-run the aggregate queries and assert: event count unchanged, old attempts retained, TCP manifest `required_item_count = 21`, UDP manifest `required_item_count = 14`, and no duplicate item ordinals.
- [ ] Exercise signed-in staging lesson progress with an approved test account or report this as unverified if no test session is available. Do not modify real learner progress merely to test.

### Task 5: Release and verify production

**Files:** The integration branch and the Vercel project `packet-secrets-team/packetsecrets`; no local secret files enter Git.

**Interfaces:** GitHub PR targets `main`; Vercel production deployment uses the merged tree and existing production environment variables; the public alias remains `https://packetsecrets.com`.

- [ ] Create a focused PR from `feature/full-site-integration` to `main`. Inspect changed filenames for retained dashboard/auth and no committed `.env*` or `.vercel` files. Require a green Vercel preview check and all local checks from Task 3.
- [ ] Review the PR merge diff and GitHub mergeability. Merge only with the tested head SHA. Fetch merged `main` and verify its tracked file tree matches the tested integration content, excluding integration documentation and merge metadata.
- [ ] Reconfirm production project ref, recovery path, migration history, and pre-migration aggregate counts immediately before change. Apply both SQL files in order if absent; assert the same post-migration invariants as staging. If an invariant fails, stop before deploying application code and follow the validated recovery path.
- [ ] Link a clean checkout of merged `main` to Vercel project `packet-secrets-team/packetsecrets`; use `vercel deploy --prod --yes --scope packet-secrets-team` for a one-time deploy. Confirm the returned deployment is `READY` and aliased to `https://packetsecrets.com`.
- [ ] On the live domain verify homepage, `/labs`, new TCP and UDP lessons, legacy transport URL, a representative packet player, sign-in, and signed-out dashboard redirect. Check desktop/mobile layout and console errors; mark signed-in progress unverified unless exercised with an approved test account. Report what was deployed, migration results, and any remaining issue.

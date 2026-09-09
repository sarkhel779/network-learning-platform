# Subnetting Fundamentals Lesson Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a beginner-friendly Subnetting Fundamentals lesson with two focused interactive players, account-gated practice, Pro preview, and durable learner progress.

**Architecture:** Put all IPv4 subnet mathematics in a pure `subnetting.ts` domain module. Two client components consume that module independently: `SubnetBoundaryPlayer` teaches the calculation and `SubnetScenarioPlayer` tests application. Public/account MDX, catalog metadata, route registration and a manifest migration use the platform's existing lesson boundaries.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.9, MDX 3, Vitest, Testing Library, Supabase PostgreSQL migrations.

**Spec:** `docs/superpowers/specs/2026-09-09-subnetting-fundamentals-lesson-design.md`

## Global Constraints

- Do not change authentication providers, redirect URLs, sign-in behavior or learning-tool drawers.
- Use CIDR reasoning and IPv4 documentation ranges; do not teach classful defaults.
- Treat `/31` and `/32` explicitly instead of applying subtract-two universally.
- Account-gated contents entries show `Locked`; Pro entries show `Pro` and `Locked`.
- Wrong knowledge/scenario answers count as attempts for progress but remain visibly incorrect.
- Both players autoplay, retain manual controls, respect reduced motion and fit a 390-pixel viewport.
- Write a failing focused test before each production change.

---

### Task 1: Pure subnet calculation domain

**Files:**
- Create: `src/features/subnetting/subnetting.ts`
- Create: `src/features/subnetting/subnetting.test.ts`

**Interfaces:**
- Produces: `parseIpv4(value: string): number`, `formatIpv4(value: number): string`, `prefixToMask(prefix: number): number`, `analyzeSubnet(address: string, prefix: number): SubnetAnalysis`, and `sameSubnet(left: string, right: string, prefix: number): boolean`.
- `SubnetAnalysis` contains `address`, `prefix`, `mask`, `maskBinary`, `network`, `firstUsable`, `lastUsable`, `broadcast`, `totalAddresses`, `usableAddresses`, `hostBits`, `interestingOctet`, `blockSize`, and `specialCase`.

- [ ] **Step 1: Write failing domain tests** covering `192.0.2.130/26`, `/0`, `/8`, `/24`, `/30`, `/31`, `/32`, same-subnet true/false, malformed octets and invalid prefixes.

```ts
expect(analyzeSubnet("192.0.2.130", 26)).toMatchObject({
  mask: "255.255.255.192", network: "192.0.2.128",
  firstUsable: "192.0.2.129", lastUsable: "192.0.2.190",
  broadcast: "192.0.2.191", totalAddresses: 64, usableAddresses: 62,
});
expect(analyzeSubnet("192.0.2.10", 31)).toMatchObject({ usableAddresses: 2, specialCase: "point-to-point" });
expect(analyzeSubnet("192.0.2.10", 32)).toMatchObject({ usableAddresses: 1, specialCase: "single-address" });
```

- [ ] **Step 2: Run `pnpm test -- src/features/subnetting/subnetting.test.ts`** and verify failure because the module is absent.
- [ ] **Step 3: Implement unsigned 32-bit parsing, masks, boundaries and special-prefix rules** without UI dependencies.
- [ ] **Step 4: Run the focused test** and verify all domain cases pass.
- [ ] **Step 5: Commit** with `git add src/features/subnetting && git commit -m "Add tested IPv4 subnet calculations"`.

### Task 2: Binary prefix and boundary player

**Files:**
- Create: `src/features/subnetting/subnet-boundary-player.tsx`
- Create: `src/features/subnetting/subnet-boundary-player.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `analyzeSubnet(address, prefix)` from Task 1.
- Produces: `SubnetBoundaryPlayer(): JSX.Element` with curated scenarios, autoplay/manual controls and accessible calculation status.

- [ ] **Step 1: Write failing component tests** asserting the default `192.0.2.130/26` journey, six calculation stages, boundary-bit labels, scenario changes, Play/Pause, Previous, Next, Restart, speed control and reduced-motion manual mode.

```tsx
render(<SubnetBoundaryPlayer />);
expect(screen.getByText("192.0.2.128")).toBeInTheDocument();
await user.click(screen.getByRole("button", { name: "Next" }));
expect(screen.getByRole("status")).toHaveTextContent("subnet mask");
```

- [ ] **Step 2: Run `pnpm test -- src/features/subnetting/subnet-boundary-player.test.tsx`** and verify the missing-component failure.
- [ ] **Step 3: Implement the player** with decimal, dotted-mask and binary rows; text-labelled network/host bits; interesting-octet calculation; final range cards; reusable timer cleanup; and semantic controls.
- [ ] **Step 4: Add scoped responsive styles** so the binary strip scrolls locally while the page stays within 390 pixels.
- [ ] **Step 5: Run the focused test and `pnpm typecheck`** and verify both pass.
- [ ] **Step 6: Commit** with `git add src/features/subnetting src/app/globals.css && git commit -m "Add interactive subnet boundary visualizer"`.

### Task 3: Practical subnet scenario player

**Files:**
- Create: `src/features/subnetting/subnet-scenarios.ts`
- Create: `src/features/subnetting/subnet-scenario-player.tsx`
- Create: `src/features/subnetting/subnet-scenario-player.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `analyzeSubnet` and `sameSubnet` from Task 1.
- Produces: `SubnetScenario`, `SUBNET_SCENARIOS`, and `SubnetScenarioPlayer(): JSX.Element`.
- `SubnetScenario` contains `id`, `kind`, `prompt`, `options`, `correctOptionId`, `address`, `prefix`, `explanationSteps`, and optional `peerAddress`/`requiredHosts`.

- [ ] **Step 1: Write failing tests** for all five scenario kinds, `/24` through `/30` coverage, wrong-answer feedback, next-scenario navigation, replay, autoplay/manual controls and progress-attempt emission.

```tsx
await user.click(screen.getByRole("radio", { name: /192\.0\.2\.127/ }));
await user.click(screen.getByRole("button", { name: "Check answer" }));
expect(screen.getByRole("alert")).toHaveTextContent("not an assignable host");
expect(screen.getByTestId("scenario-attempted")).toHaveTextContent("Attempt recorded");
```

- [ ] **Step 2: Run the focused player test** and verify failure because the scenario modules are absent.
- [ ] **Step 3: Add deterministic scenario data** for containing subnet, same-subnet, valid host, capacity and reserved-address questions using documentation ranges.
- [ ] **Step 4: Implement the player** so feedback separates attempted/completed state from correctness and reveals the calculation in short replayable steps.
- [ ] **Step 5: Add responsive/accessibility styles and run the focused test plus type-check**.
- [ ] **Step 6: Commit** with `git add src/features/subnetting src/app/globals.css && git commit -m "Add practical subnet scenario player"`.

### Task 4: Public and account lesson content

**Files:**
- Create: `src/content/networking-foundations/subnetting-fundamentals.public.mdx`
- Create: `src/content/networking-foundations/subnetting-fundamentals.account.mdx`
- Create: `src/content/networking-foundations/subnetting-fundamentals.content.test.ts`
- Modify: `src/mdx-components.tsx`

**Interfaces:**
- Consumes: `SubnetBoundaryPlayer`, `SubnetScenarioPlayer`, existing `KnowledgeCheck`, `InterviewScenario`, `WiresharkCheck`/evidence components and `PremiumPreview` registration.
- Produces: public/account MDX exports with stable section IDs matching Task 5.

- [ ] **Step 1: Write failing content tests** for every public/account heading, both component tags, `/31` and `/32` accuracy, Windows/Linux evidence, three knowledge checks and Pro preview language.
- [ ] **Step 2: Run `pnpm test -- src/content/networking-foundations/subnetting-fundamentals.content.test.ts`** and verify missing-file failure.
- [ ] **Step 3: Write the public MDX** in the approved sequence: purpose, masks, portions, Player 1, repeatable method, ranges, capacity, Player 2, special prefixes and gateway bridge.
- [ ] **Step 4: Write the account MDX** with command evidence, guided `/24`–`/30` exercises, mask/overlap/reserved-address troubleshooting, attempted knowledge checks and summary.
- [ ] **Step 5: Register both player components in `src/mdx-components.tsx`**, run the content test and type-check, and verify pass.
- [ ] **Step 6: Commit** with `git add src/content/networking-foundations src/mdx-components.tsx && git commit -m "Write subnetting fundamentals lesson"`.

### Task 5: Publish and route the lesson

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/catalog/module-list.test.tsx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
- Modify: `src/app/sitemap.test.ts`

**Interfaces:**
- Produces: published `lesson_subnetting_fundamentals` with ten stable section records and adjacent navigation from IPv4 Addressing to IPv6 Fundamentals.

- [ ] **Step 1: Extend repository, route, sitemap and module tests** to expect the published lesson and anonymous/account content boundary.
- [ ] **Step 2: Run those focused tests** and verify they fail while the catalog entry remains planned.
- [ ] **Step 3: Replace `plannedLesson(...)` with a published lesson record** containing the approved objective, SEO, 25-minute estimate, public/account/Pro section IDs and Pro preview.
- [ ] **Step 4: Add dynamic public/account MDX imports** to `lesson-content.repository.ts`.
- [ ] **Step 5: Run all focused catalog/lesson/page/sitemap tests** and verify pass.
- [ ] **Step 6: Commit** with `git add src/features/catalog src/features/lessons/lesson-content.repository* src/app && git commit -m "Publish subnetting fundamentals lesson"`.

### Task 6: Register durable lesson progress

**Files:**
- Create: `supabase/migrations/202609090004_add_subnetting_fundamentals_progress.sql`
- Create: `supabase/migrations/subnetting-fundamentals-progress.test.ts`

**Interfaces:**
- Produces: manifest `lesson_subnetting_fundamentals`, version `1`, plus required section/player/check item rows using the schema established by `202609090002_create_learner_progress.sql`.

- [ ] **Step 1: Write a failing migration text test** asserting one idempotent manifest upsert, unique item IDs, contiguous positions, correct item kinds and no auth/provider statements.
- [ ] **Step 2: Run the focused migration test** and verify missing-file failure.
- [ ] **Step 3: Write an idempotent transaction** that upserts the manifest and its required items, including both player attempts and each knowledge-check attempt.
- [ ] **Step 4: Run the migration test twice** and verify both runs pass the idempotency assertions without duplicate manifest or item definitions.
- [ ] **Step 5: Commit** with `git add supabase/migrations && git commit -m "Register subnetting lesson progress"`.

### Task 7: Full verification and visual acceptance

**Files:**
- Modify only files required by failures found in this task.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: a release-ready feature branch; no push or PR until user approval.

- [ ] **Step 1: Run `pnpm test`** and fix only regressions caused by this lesson until the full suite passes.
- [ ] **Step 2: Run `pnpm typecheck` and `pnpm lint`** and resolve all introduced errors.
- [ ] **Step 3: Run `pnpm build`** and verify the production build and sitemap succeed.
- [ ] **Step 4: Start `pnpm dev -- --hostname 127.0.0.1 --port 3018`** and inspect the public lesson anonymously at desktop and 390-pixel widths in light and dark themes.
- [ ] **Step 5: Verify both players** for readable bits/labels, autoplay, manual controls, reduced motion, wrong-answer feedback, local rather than page-level horizontal scrolling, and no auth changes.
- [ ] **Step 6: Record exact verification counts/results, run `git diff --check`, and commit any verification fixes** with `git commit -m "Polish subnetting lesson verification"` when changes exist.
- [ ] **Step 7: Present the preview for user approval** before committing/pushing any otherwise uncommitted final changes or creating a pull request.

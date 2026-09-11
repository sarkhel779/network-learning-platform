# NAT, PAT and the Complete Internet Packet Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a tiered IPv4 NAT/PAT lesson with synchronized packet, tuple, and translation-table interactions plus an advanced animated U-Turn NAT lab.

**Architecture:** Add a focused `src/features/nat` domain whose typed scenario definitions drive reusable topology, player, inspector, exercise, capture, and RFC components. Compose those components through Public, Account, and Pro MDX, then register the lesson through the existing catalog, content repository, progress manifest, and Supabase migration patterns.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.9, MDX 3, Zod 4, Vitest, Testing Library, Playwright, Supabase SQL.

**Spec:** `docs/superpowers/specs/2026-09-11-nat-pat-internet-packet-journey-design.md`

## Global Constraints

- Teach IPv4 NAT only; exclude NAT64, NPTv6, and other IPv6 translation mechanisms.
- Pro must contain Wireshark-style analysis, RFC validation, and U-Turn NAT with both DNAT-only failure and DNAT+SNAT success.
- All packet motion must be subtle, instructional, finite, and compatible with `prefers-reduced-motion`.
- Use the shared Previous, Play/Pause, Next, Restart, and playback-speed control contract.
- Wrong answers still mark an attempt complete while correctness and confidence remain separate.
- Locked Account and Pro links must remain clickable and preserve the exact lesson anchor through sign-in.
- Do not redesign older lessons or implement authentication, billing, chat, notifications, or dashboard expansion.

---

### Task 1: Model and validate NAT lesson scenarios

**Files:**
- Create: `src/features/nat/nat-scenario.schema.ts`
- Create: `src/features/nat/nat-scenario.schema.test.ts`

**Interfaces:**
- Produces: `natScenarioSchema`, `NatScenario`, `NatStep`, `NatTuple`, `NatTranslation`, and `NatTableEntry`.
- Consumes: Zod only.

- [ ] **Step 1: Write failing schema tests**

```ts
import { describe, expect, it } from "vitest";
import { natScenarioSchema } from "./nat-scenario.schema";

describe("natScenarioSchema", () => {
  it("accepts a synchronized PAT journey", () => {
    expect(natScenarioSchema.parse({
      id: "pat-web",
      mode: "pat",
      steps: [{
        id: "outbound",
        from: "client",
        to: "gateway",
        tuple: { protocol: "tcp", sourceIp: "10.0.0.25", sourcePort: 51514, destinationIp: "198.51.100.20", destinationPort: 443 },
        translations: [],
        tableMutations: [],
        explanation: "The private tuple reaches the translation boundary.",
      }],
    }).id).toBe("pat-web");
  });

  it("rejects a successful hairpin scenario without both dnat and snat", () => {
    expect(() => natScenarioSchema.parse({
      id: "invalid-hairpin", mode: "hairpin-success", outcome: "success",
      steps: [{ id: "translated", from: "gateway", to: "server", tuple: { protocol: "tcp", sourceIp: "10.0.0.25", sourcePort: 51514, destinationIp: "10.0.0.50", destinationPort: 443 }, translations: [{ kind: "dnat", field: "destinationIp", before: "203.0.113.10", after: "10.0.0.50" }], tableMutations: [], explanation: "DNAT only." }],
    })).toThrow(/DNAT and SNAT/);
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm test -- src/features/nat/nat-scenario.schema.test.ts`
Expected: FAIL because `nat-scenario.schema` does not exist.

- [ ] **Step 3: Implement the typed schema**

Define strict Zod objects for tuples, translation operations, table mutations, steps, and scenarios. Add a `superRefine` rule requiring at least one `dnat` and one `snat` operation when `mode === "hairpin-success"` and `outcome === "success"`. Reject duplicate step IDs and empty explanations.

```ts
export type NatTuple = z.infer<typeof natTupleSchema>;
export type NatTranslation = z.infer<typeof natTranslationSchema>;
export type NatTableEntry = z.infer<typeof natTableEntrySchema>;
export type NatStep = z.infer<typeof natStepSchema>;
export type NatScenario = z.infer<typeof natScenarioSchema>;
```

- [ ] **Step 4: Run focused tests**

Run: `pnpm test -- src/features/nat/nat-scenario.schema.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/nat/nat-scenario.schema.ts src/features/nat/nat-scenario.schema.test.ts
git commit -m "feat: model NAT packet journeys"
```

---

### Task 2: Author canonical normal and hairpin scenarios

**Files:**
- Create: `src/features/nat/nat-scenarios.ts`
- Create: `src/features/nat/nat-scenarios.test.ts`

**Interfaces:**
- Consumes: `NatScenario` and `natScenarioSchema` from Task 1.
- Produces: `patInternetJourney`, `hairpinDnatOnlyJourney`, `hairpinBidirectionalJourney`, and `natScenarios`.

- [ ] **Step 1: Write failing scenario tests**

```ts
import { describe, expect, it } from "vitest";
import { hairpinBidirectionalJourney, hairpinDnatOnlyJourney, patInternetJourney } from "./nat-scenarios";

describe("NAT journeys", () => {
  it("maps and reverses a PAT HTTPS tuple", () => {
    expect(patInternetJourney.steps.some((step) => step.translations.some((item) => item.kind === "pat"))).toBe(true);
    expect(patInternetJourney.steps.at(-1)?.tuple.destinationIp).toBe("10.0.0.25");
  });

  it("contrasts broken and working hairpin paths", () => {
    expect(hairpinDnatOnlyJourney.outcome).toBe("failure");
    expect(hairpinBidirectionalJourney.steps.flatMap((step) => step.translations).map((item) => item.kind)).toEqual(expect.arrayContaining(["dnat", "snat"]));
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `pnpm test -- src/features/nat/nat-scenarios.test.ts`
Expected: FAIL because the scenario exports do not exist.

- [ ] **Step 3: Implement exact journeys**

Use documentation networks: client `10.0.0.25`, gateway inside `10.0.0.1`, public NAT address `203.0.113.10`, internal server `10.0.0.50`, and remote server `198.51.100.20`. The hairpin modes must share the client request `10.0.0.25:51514 → 203.0.113.10:443`; the failed mode returns directly from `10.0.0.50:443`, while the working mode returns through the gateway and restores the public peer tuple.

- [ ] **Step 4: Run schema and scenario tests**

Run: `pnpm test -- src/features/nat/nat-scenario.schema.test.ts src/features/nat/nat-scenarios.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/nat/nat-scenarios.ts src/features/nat/nat-scenarios.test.ts
git commit -m "feat: author NAT and hairpin journeys"
```

---

### Task 3: Build synchronized tuple and translation-table inspectors

**Files:**
- Create: `src/features/nat/packet-tuple-inspector.tsx`
- Create: `src/features/nat/translation-table-inspector.tsx`
- Create: `src/features/nat/nat-inspectors.test.tsx`

**Interfaces:**
- Consumes: `NatTuple`, `NatTranslation`, and `NatTableEntry` from Task 1.
- Produces: `PacketTupleInspector({ tuple, translations, expectedTuple? })` and `TranslationTableInspector({ entries, activeEntryId? })`.

- [ ] **Step 1: Write failing rendering tests**

```tsx
render(<PacketTupleInspector tuple={tuple} translations={[{ kind: "snat", field: "sourceIp", before: "10.0.0.25", after: "203.0.113.10" }]} />);
expect(screen.getByText("10.0.0.25:51514")).toBeInTheDocument();
expect(screen.getByText("203.0.113.10")).toHaveAttribute("data-translated", "true");

render(<TranslationTableInspector entries={[entry]} activeEntryId="pat-1" />);
expect(screen.getByRole("row", { name: /pat-1/i })).toHaveAttribute("data-active", "true");
```

- [ ] **Step 2: Run and verify failure**

Run: `pnpm test -- src/features/nat/nat-inspectors.test.tsx`
Expected: FAIL because both components are missing.

- [ ] **Step 3: Implement semantic inspectors**

Render tuple endpoints in `<dl>` structures and translation entries in a captioned table. Mark changed values with `data-translated="true"`; mark the active table row with `data-active="true"`; include a narrow-screen card alternative without duplicating accessible content.

- [ ] **Step 4: Run focused tests**

Run: `pnpm test -- src/features/nat/nat-inspectors.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/nat/packet-tuple-inspector.tsx src/features/nat/translation-table-inspector.tsx src/features/nat/nat-inspectors.test.tsx
git commit -m "feat: add NAT tuple and table inspectors"
```

---

### Task 4: Build the reusable NAT topology and journey player

**Files:**
- Create: `src/features/nat/nat-topology.tsx`
- Create: `src/features/nat/nat-journey-player.tsx`
- Create: `src/features/nat/nat-journey-player.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `NatScenario` from Task 1 and inspectors from Task 3.
- Produces: `NatJourneyPlayer({ scenarios, initialScenarioId, title })`.

- [ ] **Step 1: Write failing player tests**

```tsx
render(<NatJourneyPlayer scenarios={[patInternetJourney]} initialScenarioId="pat-web" title="PAT journey" />);
expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
await user.click(screen.getByRole("button", { name: "Next" }));
expect(screen.getByTestId("nat-packet")).toHaveAttribute("data-step", "translated");
await user.click(screen.getByRole("button", { name: "Restart" }));
expect(screen.getByText(/private tuple reaches/i)).toBeInTheDocument();
```

Also test Play/Pause, speed selection, last-step boundaries, scenario switching, and synchronized tuple/table step IDs.

- [ ] **Step 2: Run and verify failure**

Run: `pnpm test -- src/features/nat/nat-journey-player.test.tsx`
Expected: FAIL because the player does not exist.

- [ ] **Step 3: Implement player state and topology**

Use a single `stepIndex` as the source of truth. The topology receives only the current step. Autoplay advances with a timeout derived from speed and stops at the last step. Scenario switching and Restart set `stepIndex` to zero and pause playback.

- [ ] **Step 4: Add subtle accessible motion styles**

Add NAT-scoped classes for a softly glowing packet, short link activation, translation highlights, failure amber/red, and success blue/green. Under `@media (prefers-reduced-motion: reduce)`, remove transforms and travel keyframes while retaining immediate state color and opacity changes. Add narrow-screen stacking and bounded tuple overflow.

- [ ] **Step 5: Run focused tests**

Run: `pnpm test -- src/features/nat/nat-journey-player.test.tsx src/app/theme-styles.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/nat/nat-topology.tsx src/features/nat/nat-journey-player.tsx src/features/nat/nat-journey-player.test.tsx src/app/globals.css
git commit -m "feat: add animated NAT journey player"
```

---

### Task 5: Add mapping and troubleshooting exercises

**Files:**
- Create: `src/features/nat/nat-mapping-lab.tsx`
- Create: `src/features/nat/nat-troubleshooting-cases.ts`
- Create: `src/features/nat/nat-troubleshooting-lab.tsx`
- Create: `src/features/nat/nat-exercises.test.tsx`

**Interfaces:**
- Produces: `NatMappingLab`, `NatTroubleshootingLab`, and `natTroubleshootingCases`.
- Consumes: existing `KnowledgeCheck`/progress completion conventions; no direct persistence calls.

- [ ] **Step 1: Write failing interaction tests**

Test classification of static/dynamic/PAT, correct reverse mapping, immediate explanations for correct and incorrect choices, retry, confidence selection, and `onComplete` firing once per attempted case.

```tsx
await user.click(screen.getByRole("button", { name: /missing translation state/i }));
expect(screen.getByRole("status")).toHaveTextContent(/return packet cannot be matched/i);
expect(onComplete).toHaveBeenCalledTimes(1);
```

- [ ] **Step 2: Run and verify failure**

Run: `pnpm test -- src/features/nat/nat-exercises.test.tsx`
Expected: FAIL because the labs do not exist.

- [ ] **Step 3: Implement minimal reusable labs and case data**

Include missing state, incorrect port forward, pool exhaustion, PAT collision avoidance, expired timeout, and asymmetric routing. Explanations must state the observed evidence, failed assumption, and next verification step.

- [ ] **Step 4: Run focused tests**

Run: `pnpm test -- src/features/nat/nat-exercises.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/nat/nat-mapping-lab.tsx src/features/nat/nat-troubleshooting-cases.ts src/features/nat/nat-troubleshooting-lab.tsx src/features/nat/nat-exercises.test.tsx
git commit -m "feat: add NAT practice and troubleshooting"
```

---

### Task 6: Add Pro Wireshark and RFC validation labs

**Files:**
- Create: `src/features/nat/nat-pro-exercises.ts`
- Create: `src/features/nat/nat-capture-analysis-lab.tsx`
- Create: `src/features/nat/nat-rfc-validation-lab.tsx`
- Create: `src/features/nat/nat-pro-exercises.test.tsx`

**Interfaces:**
- Produces: `NatCaptureAnalysisLab`, `NatRfcValidationLab`, `natCaptureCases`, and `natRfcChecks`.
- Consumes: `NatTuple` from Task 1.

- [ ] **Step 1: Write failing Pro exercise tests**

Assert capture rows expose interface, direction, tuple, flags/type, and evidence; assert RFC checks cover UDP hairpin external-source behavior, TCP hairpin support, ICMP translation, checksum changes, fragments, and ALG cautions. Every submitted choice must reveal an immediate explanation.

- [ ] **Step 2: Run and verify failure**

Run: `pnpm test -- src/features/nat/nat-pro-exercises.test.tsx`
Expected: FAIL because Pro exercise modules are absent.

- [ ] **Step 3: Implement data and accessible labs**

Use concise paraphrases and cite RFC numbers in authored explanations: RFC 2663 terminology, RFC 3022 traditional NAT, RFC 4787 UDP behavior, RFC 5382 TCP behavior, RFC 5508 ICMP behavior, and RFC 7857 updates. Do not copy long RFC passages.

- [ ] **Step 4: Run focused tests**

Run: `pnpm test -- src/features/nat/nat-pro-exercises.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/nat/nat-pro-exercises.ts src/features/nat/nat-capture-analysis-lab.tsx src/features/nat/nat-rfc-validation-lab.tsx src/features/nat/nat-pro-exercises.test.tsx
git commit -m "feat: add advanced NAT packet analysis"
```

---

### Task 7: Compose the Public, Account, and Pro lesson content

**Files:**
- Create: `src/content/networking-foundations/nat-pat-and-the-complete-internet-packet-journey.public.mdx`
- Create: `src/content/networking-foundations/nat-pat-and-the-complete-internet-packet-journey.account.mdx`
- Create: `src/content/networking-foundations/nat-pat-and-the-complete-internet-packet-journey.pro.mdx`
- Create: `src/content/networking-foundations/nat-pat-and-the-complete-internet-packet-journey.content.test.ts`
- Modify: `mdx-components.tsx`

**Interfaces:**
- Consumes: all Tasks 2–6 components and existing MDX tier rendering.
- Produces: three registered MDX content tiers for the lesson slug.

- [ ] **Step 1: Write failing content assertions**

Test required headings, terminology, RFC 1918 ranges, all NAT modes, Account component tags, Pro capture/RFC tags, both hairpin mode labels, HTTPS/443 tuples, and the explicit IPv6 non-goal.

- [ ] **Step 2: Run and verify failure**

Run: `pnpm test -- src/content/networking-foundations/nat-pat-and-the-complete-internet-packet-journey.content.test.ts`
Expected: FAIL because content files are absent.

- [ ] **Step 3: Register MDX components**

Expose the NAT player, mapping lab, troubleshooting lab, capture lab, and RFC lab in `useMDXComponents` using stable PascalCase names.

- [ ] **Step 4: Author Public and Account MDX**

Write the public chapters from the approved spec and embed the normal PAT journey, tuple/table practice, mapping lab, and troubleshooting lab in Account content. Every section needs a stable anchor matching the navigation plan.

- [ ] **Step 5: Author Pro MDX**

Embed the capture lab, RFC validation, and `NatJourneyPlayer` with `hairpinDnatOnlyJourney` and `hairpinBidirectionalJourney`. Explain the direct server return as a mismatched peer tuple and path-consistency failure, then show paired DNAT/SNAT correction.

- [ ] **Step 6: Run focused content and rendering tests**

Run: `pnpm test -- src/content/networking-foundations/nat-pat-and-the-complete-internet-packet-journey.content.test.ts src/content/lesson-rendering.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add mdx-components.tsx src/content/networking-foundations/nat-pat-and-the-complete-internet-packet-journey.*
git commit -m "feat: author NAT and PAT lesson content"
```

---

### Task 8: Publish the lesson through catalog and content routing

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/catalog/pathway-overview.test.tsx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `src/app/sitemap.test.ts`
- Modify: `tests/e2e/lesson.spec.ts`
- Modify: `tests/e2e/pathway.spec.ts`

**Interfaces:**
- Produces: published route `/learn/networking-foundations/nat-pat-and-the-complete-internet-packet-journey`.
- Consumes: the three MDX modules from Task 7.

- [ ] **Step 1: Change repository and route tests first**

Expect the lesson to be published, sitemap-visible, available through public/account/pro resolution, and reflected in curriculum published/coming-later counts.

- [ ] **Step 2: Run and verify failure**

Run: `pnpm test -- src/features/catalog/catalog.repository.test.ts src/features/lessons/lesson-content.repository.test.ts src/app/sitemap.test.ts`
Expected: FAIL while the catalog still uses `plannedLesson` and routing has no loaders.

- [ ] **Step 3: Publish catalog metadata and add tier loaders**

Replace the planned entry with a published lesson summary whose sections match all stable anchors. Add public/account/pro dynamic imports keyed by the exact slug.

- [ ] **Step 4: Update curriculum browser expectations**

Increase published-link counts by one and decrease coming-later counts by one in the targeted Playwright expectations.

- [ ] **Step 5: Run focused tests**

Run: `pnpm test -- src/features/catalog/catalog.repository.test.ts src/features/catalog/pathway-overview.test.tsx src/features/lessons/lesson-content.repository.test.ts src/app/sitemap.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/catalog src/features/lessons/lesson-content.repository* src/app/sitemap.test.ts tests/e2e/lesson.spec.ts tests/e2e/pathway.spec.ts
git commit -m "feat: publish NAT and PAT lesson"
```

---

### Task 9: Add the NAT chapter network map

**Files:**
- Modify: `src/features/lessons/lesson-section-navigation.tsx`
- Modify: `src/features/lessons/lesson-section-navigation.test.tsx`
- Modify: `src/features/lessons/lesson-shell.tsx`

**Interfaces:**
- Consumes: published section definitions from Task 8.
- Produces: NAT-specific node labels and route animation through the existing reusable navigation component.

- [ ] **Step 1: Write failing navigation tests**

Assert `Page contents` expands the NAT route, each open node links to the correct anchor, locked Account and Pro nodes link to safe sign-in return paths, and close/reopen increments the reveal cycle.

- [ ] **Step 2: Run and verify failure**

Run: `pnpm test -- src/features/lessons/lesson-section-navigation.test.tsx`
Expected: FAIL because the NAT presentation mapping is missing.

- [ ] **Step 3: Add NAT presentation configuration**

Map section IDs to concise nodes such as Boundary, Vocabulary, Mappings, PAT State, Internet Journey, Failures, and Hairpin. Reuse current layout, locked-link, replay, and reduced-motion logic instead of forking the component.

- [ ] **Step 4: Run navigation and shell tests**

Run: `pnpm test -- src/features/lessons/lesson-section-navigation.test.tsx src/features/lessons/lesson-shell.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/lessons/lesson-section-navigation.tsx src/features/lessons/lesson-section-navigation.test.tsx src/features/lessons/lesson-shell.tsx
git commit -m "feat: add NAT lesson network map"
```

---

### Task 10: Register progress and Supabase data

**Files:**
- Modify: `src/features/progress/progress-manifests.ts`
- Modify: `src/features/progress/progress-manifests.test.ts`
- Create: `supabase/migrations/202609110004_add_nat_pat_progress.sql`
- Create: `supabase/migrations/nat-pat-progress.test.ts`

**Interfaces:**
- Produces: stable manifest for `lesson_nat_pat_and_the_complete_internet_packet_journey`, content version `1`, plus an idempotent transactional migration.
- Consumes: existing manifest schema and learner-progress tables.

- [ ] **Step 1: Write failing manifest and migration tests**

Define stable IDs for required public sections, Account journey/mapping/troubleshooting activities, and knowledge checks. Assert runtime and SQL rows match exactly by item ID, ordinal, kind, label, and anchor.

- [ ] **Step 2: Run and verify failure**

Run: `pnpm test -- src/features/progress/progress-manifests.test.ts supabase/migrations/nat-pat-progress.test.ts`
Expected: FAIL because the manifest and migration are missing.

- [ ] **Step 3: Add runtime manifest**

Add the NAT lesson definition to the existing manifest builder. Keep Pro-only labs out of required public completion unless the current schema explicitly supports tier-specific completion.

- [ ] **Step 4: Add the transactional idempotent SQL migration**

Use `begin;`/`commit;`, upsert the manifest count, and upsert each item on `(pathway_id, lesson_id, content_version, item_id)` without deleting learner attempts.

- [ ] **Step 5: Run focused tests**

Run: `pnpm test -- src/features/progress/progress-manifests.test.ts supabase/migrations/nat-pat-progress.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/progress/progress-manifests.ts src/features/progress/progress-manifests.test.ts supabase/migrations/202609110004_add_nat_pat_progress.sql supabase/migrations/nat-pat-progress.test.ts
git commit -m "feat: register NAT lesson progress"
```

---

### Task 11: Add responsive browser coverage

**Files:**
- Create: `tests/e2e/nat-pat-internet-journey.spec.ts`
- Modify: `src/app/theme-styles.test.ts`

**Interfaces:**
- Consumes: the published route and all completed interactions.
- Produces: desktop/mobile acceptance coverage.

- [ ] **Step 1: Write browser tests**

Cover public heading and no Pro leakage, Page contents replay, locked Pro hairpin anchor, Account normal journey, Pro hairpin mode switching, packet/tuple/table synchronization, and 360×800 no-overflow behavior with reduced motion.

```ts
test("keeps the NAT diagram inside a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  await page.getByRole("button", { name: "Page contents" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
```

- [ ] **Step 2: Run the targeted browser test and observe failures**

Run: `pnpm exec playwright test tests/e2e/nat-pat-internet-journey.spec.ts`
Expected: Any genuine responsive, routing, or interaction gaps fail with a specific assertion.

- [ ] **Step 3: Make only evidence-driven responsive corrections**

Adjust NAT-scoped CSS or accessible labels identified by the failures. Do not weaken assertions or alter older lesson layouts.

- [ ] **Step 4: Run targeted browser and style tests**

Run: `pnpm test -- src/app/theme-styles.test.ts && pnpm exec playwright test tests/e2e/nat-pat-internet-journey.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/nat-pat-internet-journey.spec.ts src/app/globals.css src/app/theme-styles.test.ts
git commit -m "test: verify responsive NAT lesson"
```

---

### Task 12: Run complete verification and prepare integration

**Files:**
- Modify only files required to correct verified failures; do not add scope.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: a clean, verified feature branch ready for review.

- [ ] **Step 1: Run focused NAT tests**

Run: `pnpm test -- src/features/nat src/content/networking-foundations/nat-pat-and-the-complete-internet-packet-journey.content.test.ts supabase/migrations/nat-pat-progress.test.ts`
Expected: PASS.

- [ ] **Step 2: Run TypeScript validation**

Run: `pnpm typecheck`
Expected: exit 0.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: exit 0.

- [ ] **Step 4: Run the full unit/integration suite**

Run: `pnpm test`
Expected: all tests pass with zero failures.

- [ ] **Step 5: Run targeted desktop/mobile browser verification**

Run: `pnpm exec playwright test tests/e2e/nat-pat-internet-journey.spec.ts`
Expected: all NAT browser tests pass.

- [ ] **Step 6: Inspect the final diff**

Run: `git status --short && git diff --check && git diff --stat main...HEAD`
Expected: no uncommitted generated artifacts, no whitespace errors, and only approved NAT lesson changes.

- [ ] **Step 7: Commit any verification-only corrections**

```bash
git add <only-files-corrected-by-verification>
git commit -m "fix: complete NAT lesson verification"
```

Skip this commit when Step 6 shows a clean worktree and no corrections were required.

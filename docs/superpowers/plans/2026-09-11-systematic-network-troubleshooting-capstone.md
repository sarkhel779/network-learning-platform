# Systematic Network Troubleshooting Capstone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a tiered, evidence-driven troubleshooting capstone that teaches and evaluates a complete multi-fault enterprise incident workflow.

**Architecture:** Validated scenario data drives a deterministic incident reducer; focused React views render topology, hypotheses, evidence, timeline, remediation, restoration, and the Pro report without containing answer logic. Existing MDX authorization, progress reliability, catalog, network-map navigation, and Supabase migration patterns provide delivery and persistence.

**Tech Stack:** Next.js 15, React 19, TypeScript, Zod, MDX, Vitest, Testing Library, Playwright, PostgreSQL/Supabase.

**Spec:** `docs/superpowers/specs/2026-09-11-systematic-network-troubleshooting-capstone-design.md`

## Global Constraints

- Reuse one enterprise topology across account and Pro incidents.
- Public MDX must contain no answer-bearing assessment component or protected solution.
- Every submitted attempt records completion even when incorrect; confidence remains separate from correctness.
- Pro content stays authored but locked until the platform entitlement layer is implemented.
- Do not build a free-form CLI parser, real-device integration, upload flow, billing, or unrestricted AI grading.
- Technical tables must scroll locally at 360px and all interactive targets must be at least 44px.
- Motion must be subtle, state-driven, replayable, and disabled by `prefers-reduced-motion` without losing meaning.
- Follow TDD: observe RED, make the smallest implementation, observe GREEN, then commit.

---

### Task 1: Define the troubleshooting scenario contract

**Files:**
- Create: `src/features/troubleshooting/troubleshooting-scenario.schema.ts`
- Create: `src/features/troubleshooting/troubleshooting-scenario.schema.test.ts`

**Interfaces:**
- Produces: `troubleshootingScenarioSchema`, `TroubleshootingScenario`, `TroubleshootingFault`, `TroubleshootingTest`, `RestorationCheck`.

- [ ] **Step 1: Write schema tests for valid sequencing and invalid references**

```ts
expect(() => troubleshootingScenarioSchema.parse(validScenario)).not.toThrow();
expect(() => troubleshootingScenarioSchema.parse({ ...validScenario, faults: [{ ...fault, unlocksFaultId: "missing" }] })).toThrow(/fault/i);
expect(() => troubleshootingScenarioSchema.parse({ ...validScenario, tests: [{ ...test, risk: "dangerous" }] })).toThrow();
```

- [ ] **Step 2: Run the schema test and verify RED**

Run: `pnpm exec vitest run src/features/troubleshooting/troubleshooting-scenario.schema.test.ts`
Expected: FAIL because the schema module does not exist.

- [ ] **Step 3: Implement strict Zod contracts**

```ts
const evidenceSchema = z.object({ kind: z.enum(["cli", "table", "log", "capture", "observation"]), title: z.string().min(1), body: z.string().min(1) }).strict();
const testSchema = z.object({ id: z.string().min(1), label: z.string().min(1), command: z.string().min(1).optional(), risk: z.enum(["read-only", "reversible"]), timeCost: z.number().int().positive(), expectedFaultId: z.string().min(1).optional(), evidence: evidenceSchema }).strict();
export const troubleshootingScenarioSchema = z.object({ id: z.string().min(1), title: z.string().min(1), topology: topologySchema, faults: z.array(faultSchema).min(1), hypotheses: z.array(hypothesisSchema).min(1), tests: z.array(testSchema).min(1), remediations: z.array(remediationSchema).min(1), restorationChecks: z.array(restorationCheckSchema).min(1) }).strict().superRefine(validateReferences);
export type TroubleshootingScenario = z.infer<typeof troubleshootingScenarioSchema>;
```

Validation must reject duplicate IDs, missing fault/test/remediation references, cycles in `unlocksFaultId`, and restoration checks without a test.

- [ ] **Step 4: Run the schema test and verify GREEN**

Run: `pnpm exec vitest run src/features/troubleshooting/troubleshooting-scenario.schema.test.ts`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/troubleshooting/troubleshooting-scenario.schema.ts src/features/troubleshooting/troubleshooting-scenario.schema.test.ts
git commit -m "feat: model troubleshooting capstone scenarios"
```

### Task 2: Author the shared topology and sequential incidents

**Files:**
- Create: `src/features/troubleshooting/troubleshooting-scenarios.ts`
- Create: `src/features/troubleshooting/troubleshooting-scenarios.test.ts`

**Interfaces:**
- Consumes: `TroubleshootingScenario`.
- Produces: `guidedBranchPortalIncident`, `proBranchPortalIncident`, `troubleshootingScenarios`.

- [ ] **Step 1: Write content-integrity tests**

```ts
expect(guidedBranchPortalIncident.faults.map(({ id }) => id)).toEqual(["wrong-access-vlan", "wrong-specific-route", "stale-portal-dns"]);
expect(proBranchPortalIncident.topology).toEqual(guidedBranchPortalIncident.topology);
expect(proBranchPortalIncident.faults.map(({ id }) => id)).toEqual(["asymmetric-stateful-return", "stale-dns-cache"]);
expect(proBranchPortalIncident.tests.some(({ evidence }) => evidence.kind === "capture")).toBe(true);
```

- [ ] **Step 2: Run the scenario test and verify RED**

Run: `pnpm exec vitest run src/features/troubleshooting/troubleshooting-scenarios.test.ts`
Expected: FAIL because scenario data is absent.

- [ ] **Step 3: Author exact topology, evidence, faults, and restoration checks**

Use stable nodes `branch-client`, `access-switch`, `branch-router`, `edge-firewall`, `dns-resolver`, and `portal-server`. Include labelled interfaces, VLAN 20/30, IPv4 tuples, the incorrect `/32` next hop, stale/current DNS answers, TCP/TLS/HTTP evidence, asymmetric return capture rows, interface-error distractors, and checks for addressing, ARP, VLAN, route, DNS, TCP/TLS, and HTTP.

- [ ] **Step 4: Run schema and scenario tests and verify GREEN**

Run: `pnpm exec vitest run src/features/troubleshooting/troubleshooting-scenario.schema.test.ts src/features/troubleshooting/troubleshooting-scenarios.test.ts`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/troubleshooting/troubleshooting-scenarios.ts src/features/troubleshooting/troubleshooting-scenarios.test.ts
git commit -m "feat: author troubleshooting capstone incidents"
```

### Task 3: Build deterministic incident state and scoring

**Files:**
- Create: `src/features/troubleshooting/troubleshooting-engine.ts`
- Create: `src/features/troubleshooting/troubleshooting-engine.test.ts`

**Interfaces:**
- Produces: `IncidentState`, `IncidentAction`, `createIncidentState(scenario)`, `reduceIncident(state, action, scenario)`, `scoreIncident(state, scenario)`; private helpers `runScenarioTest`, `applyScenarioRemediation`, `recordRestorationResult`, `closeResolvedIncident`, and `assertNever` each accept the arguments shown in Step 3 and return `IncidentState` except `assertNever`, which returns `never`.

- [ ] **Step 1: Write reducer tests for the full guided sequence**

```ts
let state = createIncidentState(guidedBranchPortalIncident);
state = reduceIncident(state, { type: "run_test", hypothesisId: "vlan-mismatch", predictionId: "wrong-vlan", testId: "show-access-vlan", confidence: "underconfident" }, guidedBranchPortalIncident);
state = reduceIncident(state, { type: "apply_remediation", remediationId: "set-vlan-20" }, guidedBranchPortalIncident);
expect(state.exposedFaultIds).toContain("wrong-specific-route");
expect(() => reduceIncident(state, { type: "close_incident" }, guidedBranchPortalIncident)).toThrow(/restoration/i);
```

Also test repeated events, invalid early remediation, simulated time, wrong-attempt recording, all restoration checks, and independent score dimensions.

- [ ] **Step 2: Run the engine test and verify RED**

Run: `pnpm exec vitest run src/features/troubleshooting/troubleshooting-engine.test.ts`
Expected: FAIL because the engine does not exist.

- [ ] **Step 3: Implement pure state transitions**

```ts
export type IncidentState = { exposedFaultIds: string[]; correctedFaultIds: string[]; attempts: AttemptRecord[]; timeline: TimelineEntry[]; restorationResults: Record<string, boolean>; elapsedMinutes: number; closed: boolean };
export function reduceIncident(state: IncidentState, action: IncidentAction, scenario: TroubleshootingScenario): IncidentState {
  switch (action.type) {
    case "run_test": return runScenarioTest(state, action, scenario);
    case "apply_remediation": return applyScenarioRemediation(state, action, scenario);
    case "record_restoration": return recordRestorationResult(state, action, scenario);
    case "close_incident": return closeResolvedIncident(state, scenario);
    default: return assertNever(action);
  }
}
export function scoreIncident(state: IncidentState, scenario: TroubleshootingScenario): IncidentScore { return { scope, hypothesis, prediction, safety, interpretation, rootCause, restoration, report }; }
```

Use immutable updates and exhaustive `never` checking. Derive all correctness and unlock behavior from scenario data.

- [ ] **Step 4: Run engine and scenario tests and verify GREEN**

Run: `pnpm exec vitest run src/features/troubleshooting/troubleshooting-engine.test.ts src/features/troubleshooting/troubleshooting-scenarios.test.ts`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/troubleshooting/troubleshooting-engine.ts src/features/troubleshooting/troubleshooting-engine.test.ts
git commit -m "feat: add deterministic troubleshooting engine"
```

### Task 4: Render topology, evidence, and incident timeline

**Files:**
- Create: `src/features/troubleshooting/troubleshooting-topology.tsx`
- Create: `src/features/troubleshooting/evidence-board.tsx`
- Create: `src/features/troubleshooting/incident-timeline.tsx`
- Create: `src/features/troubleshooting/troubleshooting-views.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: scenario topology, available tests, `IncidentState`, `onRunTest(testId)`.
- Produces: accessible, presentation-only views.

- [ ] **Step 1: Write view tests**

```tsx
render(<TroubleshootingTopology topology={scenario.topology} activePath={["branch-client", "access-switch"]} />);
expect(screen.getByRole("img", { name: /branch troubleshooting topology/i })).toBeVisible();
render(<EvidenceBoard tests={availableTests} selectedEvidence={evidence} onRunTest={onRunTest} />);
expect(screen.getByRole("table", { name: /packet capture evidence/i })).toBeVisible();
expect(screen.getByRole("list", { name: /incident timeline/i })).toHaveTextContent(/hypothesis/i);
```

- [ ] **Step 2: Run view tests and verify RED**

Run: `pnpm exec vitest run src/features/troubleshooting/troubleshooting-views.test.tsx`
Expected: FAIL because views do not exist.

- [ ] **Step 3: Implement views and scoped responsive styles**

Topology uses semantic text plus decorative links. Evidence supports CLI `pre`, tables, logs, observations, and packet rows. Timeline entries name hypothesis, prediction, action, result, confidence, and elapsed time. Use `useId()` for every `aria-labelledby` relationship.

- [ ] **Step 4: Run view and style tests and verify GREEN**

Run: `pnpm exec vitest run src/features/troubleshooting/troubleshooting-views.test.tsx src/app/theme-styles.test.ts`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/troubleshooting/troubleshooting-topology.tsx src/features/troubleshooting/evidence-board.tsx src/features/troubleshooting/incident-timeline.tsx src/features/troubleshooting/troubleshooting-views.test.tsx src/app/globals.css src/app/theme-styles.test.ts
git commit -m "feat: add troubleshooting evidence views"
```

### Task 5: Build the guided troubleshooting workspace

**Files:**
- Create: `src/features/troubleshooting/hypothesis-journal.tsx`
- Create: `src/features/troubleshooting/remediation-panel.tsx`
- Create: `src/features/troubleshooting/restoration-checklist.tsx`
- Create: `src/features/troubleshooting/troubleshooting-workspace.tsx`
- Create: `src/features/troubleshooting/troubleshooting-workspace.test.tsx`

**Interfaces:**
- Consumes: `scenario`, optional `progressItemId`.
- Produces: `TroubleshootingWorkspace({ scenario, progressItemId, guidance })`.

- [ ] **Step 1: Write interaction tests for the full multi-fault flow**

```tsx
render(<TroubleshootingWorkspace scenario={guidedBranchPortalIncident} progressItemId="capstone_guided_incident" guidance="guided" />);
await user.click(screen.getByLabelText("VLAN mismatch"));
await user.click(screen.getByLabelText("The port reports VLAN 30"));
await user.click(screen.getByRole("button", { name: "Run show interface switchport" }));
expect(screen.getByRole("status")).toHaveTextContent(/VLAN 30/i);
expect(markTerminalStateReached).not.toHaveBeenCalled();
```

Complete all three faults, verify that premature remediation is explained, wrong attempts appear in the timeline, restoration gates closure, and terminal progress fires once.

- [ ] **Step 2: Run workspace tests and verify RED**

Run: `pnpm exec vitest run src/features/troubleshooting/troubleshooting-workspace.test.tsx`
Expected: FAIL because workspace components do not exist.

- [ ] **Step 3: Implement reducer-driven workspace and progress retry**

Use `useReducer`, `useProgressCompletionBoundary(progressItemId)`, controlled hypothesis/prediction inputs, and immediate feedback. Render `Retry saving progress` only when progress state is `error`. Do not mark progress before restoration closes successfully.

- [ ] **Step 4: Run workspace tests and verify GREEN**

Run: `pnpm exec vitest run src/features/troubleshooting/troubleshooting-workspace.test.tsx src/features/progress/progress-completion-boundary.test.tsx`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/troubleshooting/hypothesis-journal.tsx src/features/troubleshooting/remediation-panel.tsx src/features/troubleshooting/restoration-checklist.tsx src/features/troubleshooting/troubleshooting-workspace.tsx src/features/troubleshooting/troubleshooting-workspace.test.tsx
git commit -m "feat: add guided troubleshooting workspace"
```

### Task 6: Add the Pro incident report and advanced validation

**Files:**
- Create: `src/features/troubleshooting/incident-report-builder.tsx`
- Create: `src/features/troubleshooting/advanced-validation-lab.tsx`
- Create: `src/features/troubleshooting/troubleshooting-pro.test.tsx`

**Interfaces:**
- Produces: `IncidentReportBuilder({ state, scenario, onSubmit })`, `AdvancedValidationLab({ checks })`.

- [ ] **Step 1: Write Pro behavior tests**

```tsx
render(<IncidentReportBuilder state={resolvedState} scenario={proBranchPortalIncident} onSubmit={onSubmit} />);
await user.type(screen.getByLabelText("Impact"), "Branch portal access failed for VLAN 20 users.");
await user.click(screen.getByRole("button", { name: "Submit incident report" }));
expect(screen.getByRole("alert")).toHaveTextContent(/evidence.*required/i);
expect(proBranchPortalIncident.tests.some(({ evidence }) => evidence.body.includes("SYN"))).toBe(true);
```

- [ ] **Step 2: Run Pro tests and verify RED**

Run: `pnpm exec vitest run src/features/troubleshooting/troubleshooting-pro.test.tsx`
Expected: FAIL because Pro components do not exist.

- [ ] **Step 3: Implement structured reporting and reference checks**

Require non-empty impact, evidence, root causes, correction, restoration, and prevention fields. Advanced checks cover asymmetric routing/stateful inspection, DNS cache timing, TCP retransmission evidence, and relevant standards/vendor behavior with direct authoritative reference links.

- [ ] **Step 4: Run Pro tests and verify GREEN**

Run: `pnpm exec vitest run src/features/troubleshooting/troubleshooting-pro.test.tsx`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/troubleshooting/incident-report-builder.tsx src/features/troubleshooting/advanced-validation-lab.tsx src/features/troubleshooting/troubleshooting-pro.test.tsx
git commit -m "feat: add advanced troubleshooting capstone"
```

### Task 7: Author and register tiered lesson content

**Files:**
- Create: `src/content/networking-foundations/systematic-network-troubleshooting-capstone.public.mdx`
- Create: `src/content/networking-foundations/systematic-network-troubleshooting-capstone.account.mdx`
- Create: `src/content/networking-foundations/systematic-network-troubleshooting-capstone.pro.mdx`
- Create: `src/content/networking-foundations/systematic-network-troubleshooting-capstone.content.test.ts`
- Modify: `mdx-components.tsx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`

**Interfaces:**
- Produces: authorized public/account/Pro MDX loaders and component registrations.

- [ ] **Step 1: Write content and authorization tests**

Assert that public content covers scope, hypothesis, predicted result, least-destructive tests, evidence, restoration, and escalation; account content embeds the guided workspace; Pro embeds sparse workspace, report, and advanced validation. Assert public source excludes `correctIndex`, protected components, and root-cause solutions.

- [ ] **Step 2: Run content tests and verify RED**

Run: `pnpm exec vitest run src/content/networking-foundations/systematic-network-troubleshooting-capstone.content.test.ts src/features/lessons/lesson-content.repository.test.ts src/content/lesson-access.content.test.ts`
Expected: FAIL because files and loader registrations are missing.

- [ ] **Step 3: Author MDX and register components/loaders**

Use exact anchors from Task 8. Keep public reflection prompts answer-free. Pass `progressItemId="capstone_guided_incident"` to account workspace and Pro IDs to Pro components.

- [ ] **Step 4: Run content tests and verify GREEN**

Run: same command as Step 2.
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add mdx-components.tsx src/content/networking-foundations/systematic-network-troubleshooting-capstone.* src/features/lessons/lesson-content.repository.ts src/features/lessons/lesson-content.repository.test.ts src/content/lesson-access.content.test.ts
git commit -m "feat: author troubleshooting capstone content"
```

### Task 8: Publish the catalog route and Page contents network map

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/catalog/pathway-overview.test.tsx`
- Modify: `src/features/lessons/lesson-section-navigation.tsx`
- Modify: `src/features/lessons/lesson-section-navigation.test.tsx`
- Modify: `src/features/lessons/lesson-shell.tsx`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
- Modify: `src/app/sitemap.test.ts`

**Interfaces:**
- Produces: published canonical route `/learn/networking-foundations/systematic-network-troubleshooting-capstone`.

- [ ] **Step 1: Write failing publication and navigation tests**

Assert unique SEO, published module count, sitemap inclusion, anonymous public rendering, authenticated account rendering, collapsible Page contents replay, account anchor unlock, and Pro locked return anchors.

- [ ] **Step 2: Run catalog/route/navigation tests and verify RED**

Run: `pnpm exec vitest run src/features/catalog/catalog.repository.test.ts src/features/catalog/pathway-overview.test.tsx src/features/lessons/lesson-section-navigation.test.tsx "src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts" src/app/sitemap.test.ts`
Expected: FAIL because the capstone remains planned.

- [ ] **Step 3: Publish the lesson and add troubleshooting map groups**

Use network nodes `Scope`, `Evidence`, `Isolation`, `Restore`, `Report`. Register every public/account/Pro section with exact access. Reuse viewer-aware locked-link behavior; do not special-case authenticated account content as locked.

- [ ] **Step 4: Run publication tests and verify GREEN**

Run: same command as Step 2.
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/catalog src/features/lessons/lesson-section-navigation.tsx src/features/lessons/lesson-section-navigation.test.tsx src/features/lessons/lesson-shell.tsx "src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts" src/app/sitemap.test.ts
git commit -m "feat: publish troubleshooting capstone"
```

### Task 9: Register progress and Supabase migration

**Files:**
- Modify: `src/features/progress/progress-manifests.ts`
- Modify: `src/features/progress/progress-manifests.test.ts`
- Create: `supabase/migrations/202609110005_add_troubleshooting_capstone_progress.sql`
- Create: `supabase/migrations/troubleshooting-capstone-progress.test.ts`

**Interfaces:**
- Produces: stable ordered item manifest and idempotent transactional database publication.

- [ ] **Step 1: Write failing manifest and SQL contract tests**

```ts
expect(manifest.itemIds).toContain("capstone_guided_incident");
expect(sql).toMatch(/begin;[\s\S]*on conflict[\s\S]*commit;/i);
expect(sql).toContain("lesson_systematic_network_troubleshooting_capstone");
```

- [ ] **Step 2: Run progress tests and verify RED**

Run: `pnpm exec vitest run src/features/progress/progress-manifests.test.ts supabase/migrations/troubleshooting-capstone-progress.test.ts`
Expected: FAIL because manifest and migration are absent.

- [ ] **Step 3: Add ordered manifest and migration**

Register public section completions, `capstone_guided_incident`, guided checks, `capstone_restoration_verification`, Pro evidence, Pro validation, and Pro report. Use stable anchors, content version 1, one transaction, explicit conflict targets, and safe reruns.

- [ ] **Step 4: Run progress tests and verify GREEN**

Run: same command as Step 2.
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/progress/progress-manifests.ts src/features/progress/progress-manifests.test.ts supabase/migrations/202609110005_add_troubleshooting_capstone_progress.sql supabase/migrations/troubleshooting-capstone-progress.test.ts
git commit -m "feat: register troubleshooting capstone progress"
```

### Task 10: Add desktop/mobile end-to-end verification

**Files:**
- Create: `tests/e2e/systematic-network-troubleshooting-capstone.spec.ts`
- Modify: `playwright.config.ts` only if existing project definitions do not already cover desktop and mobile Chromium.

**Interfaces:**
- Verifies the published experience through the browser.

- [ ] **Step 1: Write E2E tests**

```ts
test("completes the guided sequential-fault incident", async ({ page }) => {
  await page.goto("/learn/networking-foundations/systematic-network-troubleshooting-capstone");
  await expect(page.getByRole("heading", { level: 1, name: /Systematic Network Troubleshooting Capstone/i })).toBeVisible();
  await completeGuidedFaults(page);
  await expect(page.getByRole("status")).toContainText("Incident restored");
});
```

Add anonymous access-boundary, Page contents replay/locked Pro anchor, authenticated resume, 360px containment, keyboard, and reduced-motion cases.

- [ ] **Step 2: Run E2E tests and verify RED**

Run: `pnpm exec playwright test tests/e2e/systematic-network-troubleshooting-capstone.spec.ts`
Expected: at least one new workflow assertion fails before final integration corrections.

- [ ] **Step 3: Correct only browser-discovered integration defects**

Keep fixes scoped to route authorization, focus, layout containment, animation state, or selectors proven by the failing test. Add a focused unit regression for each behavior defect.

- [ ] **Step 4: Run E2E tests and verify GREEN**

Run: `pnpm exec playwright test tests/e2e/systematic-network-troubleshooting-capstone.spec.ts`
Expected: all desktop and mobile projects pass.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/systematic-network-troubleshooting-capstone.spec.ts playwright.config.ts src
git commit -m "test: verify troubleshooting capstone experience"
```

### Task 11: Complete full verification and branch review

**Files:**
- Modify: only files required by failures reproduced in this task.

**Interfaces:**
- Produces: a clean, reviewable branch ready for a pull request.

- [ ] **Step 1: Run focused capstone tests**

Run: `pnpm exec vitest run src/features/troubleshooting src/content/networking-foundations/systematic-network-troubleshooting-capstone.content.test.ts supabase/migrations/troubleshooting-capstone-progress.test.ts`
Expected: all focused tests pass.

- [ ] **Step 2: Run static validation**

Run: `pnpm typecheck`
Expected: exit 0.

Run: `pnpm lint`
Expected: exit 0.

- [ ] **Step 3: Run the complete unit/integration suite**

Run: `pnpm test`
Expected: all test files and tests pass with zero failures.

- [ ] **Step 4: Run final browser verification**

Run: `pnpm exec playwright test tests/e2e/systematic-network-troubleshooting-capstone.spec.ts`
Expected: desktop and mobile checks pass.

- [ ] **Step 5: Inspect the branch**

Run: `git diff --check && git status --short --branch && git diff --stat main...HEAD`
Expected: no whitespace errors, no unintended generated-file edits, and only capstone-related changes.

- [ ] **Step 6: Request independent review and address findings**

Review `main...HEAD` against the design specification. Fix every Critical or Important finding with a focused regression test, then repeat Steps 1–5.

- [ ] **Step 7: Commit final corrections**

```bash
git add src tests supabase mdx-components.tsx
git commit -m "fix: complete troubleshooting capstone integration"
```

If no correction files exist, do not create an empty commit.

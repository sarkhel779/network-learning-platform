# Packet Labs MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish one functional packet experiment and a Labs entry point connected to existing practice.

**Architecture:** A pure scenario builder describes the path for three configurations. A client workspace renders the selected scenario with packet motion and prediction feedback. A server page lists the sample lab and real lesson practice links; shared header/footer expose only live routes.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Testing Library, Playwright, existing CSS.

**Spec:** `docs/superpowers/specs/2026-09-12-packet-labs-mvp-design.md`

## Global Constraints

- Preserve the approved navy/teal visual design.
- Do not create dead Blog, Community, newsletter, social, or search controls.
- Do not claim sample attempts are persisted.
- Respect reduced motion and keyboard operation.

---

### Task 1: Scenario engine

**Files:** Create `src/features/labs/sample-lab-scenarios.ts`; test `src/features/labs/sample-lab-scenarios.test.ts`.

**Interfaces:** Export `type LabConfiguration = "local" | "remote" | "no-gateway"`, `type LabHop` containing from/to, title, explanation, source/destination IP and MAC, and `buildLabJourney(configuration: LabConfiguration): readonly LabHop[]`.

- [ ] Write failing tests proving local traffic stays on-link, remote traffic traverses the gateway, and no-gateway traffic ends with a local failure rather than inventing a sent packet.
- [ ] Run `pnpm exec vitest run src/features/labs/sample-lab-scenarios.test.ts` and observe the missing behavior.
- [ ] Implement exact scenarios with explanatory per-hop fields and explicit terminal outcomes.
- [ ] Rerun the focused test and commit the scenario engine.

### Task 2: Interactive workspace

**Files:** Create `src/features/labs/sample-packet-lab.tsx`, `src/features/labs/sample-packet-lab.test.tsx`; modify `src/app/globals.css`.

**Interfaces:** Consume `buildLabJourney`, export `SamplePacketLab()`.

- [ ] Write failing tests for configuration changes, Next/Restart, active packet fields, a failed no-gateway run, quiz feedback, and the four accessible tabs.
- [ ] Run the focused test and observe missing behavior.
- [ ] Implement the topology, animated active packet, tabs, controls, and prediction check. Use CSS reduced-motion override.
- [ ] Rerun tests, check keyboard tab changes and browser animation, then commit.

### Task 3: Labs route and real navigation

**Files:** Create `src/app/labs/page.tsx`, `src/app/labs/page.test.tsx`; modify `src/app/page.tsx`, `src/app/page.test.tsx`, `src/components/site-header.tsx`, `src/components/site-footer.tsx`, `src/app/globals.css`.

**Interfaces:** Route `/labs` renders `SamplePacketLab` and links to published lesson interactions and quizzes.

- [ ] Write failing page/header/footer tests for live `/labs` links, actual lesson anchors, and the absence of placeholder destinations.
- [ ] Run focused tests to verify red.
- [ ] Build the page and connect homepage, header, and footer links.
- [ ] Run focused tests and commit.

### Task 4: End-to-end verification

**Files:** Create `tests/e2e/labs.spec.ts`.

- [ ] Write a browser test that selects no gateway, advances the run, sees a local failure, restarts with a gateway, and receives quiz feedback.
- [ ] Verify failure before the browser path works, then adjust only behavior exposed by the browser test.
- [ ] Run `pnpm exec vitest run`, `pnpm exec tsc --noEmit`, `pnpm exec eslint .`, and the Labs browser test. Inspect desktop and narrow viewport, then commit.

# Packetsecrets Visual System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved visual system to the landing page and shared site surfaces without changing lesson functionality.

**Architecture:** The homepage owns its topic mapping and decorative route graphic. `globals.css` owns shared color tokens and component surfaces. Existing lesson components retain their state and data flow.

**Tech Stack:** Next.js 15, React 19, CSS, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-12-site-visual-system-design.md`

## Global Constraints

- Preserve curriculum, access control, learning progress, and technical player data.
- Use existing published lessons only.
- Respect `prefers-reduced-motion: reduce`.
- No production deployment.

---

### Task 1: Exact topic cards and device illustration

**Files:** Modify `src/app/page.tsx`, `src/app/page.test.tsx`, `src/app/globals.css`; create `src/features/home/route-illustration.tsx`.

**Interfaces:** `RouteIllustration` is a decorative server-renderable React component. The homepage consumes it and a static list of `{label, slug, anchor, icon}` cards.

- [ ] Add a `page.test.tsx` assertion for all eleven exact card labels and URLs, distinct device labels, and the route illustration.
- [ ] Run `pnpm exec vitest run src/app/page.test.tsx`; expect failure for missing labels/device nodes.
- [ ] Implement the topic list from published slugs, SVG device symbols, packet path, and responsive card layout.
- [ ] Rerun the focused test; expect all passing.

### Task 2: Shared theme and brand

**Files:** Modify `src/app/globals.css`, `src/app/theme-styles.test.ts`, `src/components/site-brand.test.tsx`.

**Interfaces:** CSS variables `--background`, `--foreground`, `--muted`, `--accent`, `--border`, `--focus-ring` remain stable for existing components.

- [ ] Add failing tests checking the default dark tokens and white/teal dark logo; run focused Vitest.
- [ ] Change root tokens, preserve explicit light tokens, and style common page surfaces and interactive components through existing selectors.
- [ ] Rerun focused tests and typecheck.

### Task 3: Background transition and preview verification

**Files:** Modify `src/app/globals.css`, `src/app/theme-styles.test.ts`.

**Interfaces:** Hero gradient animation is CSS-only and deactivated under reduced motion.

- [ ] Add a failing style test for the gradient animation and reduced-motion override; run focused Vitest.
- [ ] Add the slow background transition without layout movement; rerun focused tests.
- [ ] Stop the dev server, run `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build`, then restart the dev server to avoid `.next` asset collisions.
- [ ] Inspect desktop and mobile landing and first-lesson previews in Chromium; confirm stylesheet status 200 and no horizontal overflow.

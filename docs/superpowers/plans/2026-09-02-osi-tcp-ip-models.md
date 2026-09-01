# OSI and TCP/IP Models Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the third Networking Essentials lesson with an accessible, controllable encapsulation visualization and practical layer-mapping exercises.

**Architecture:** Add validated lesson-specific data and a focused client experience beside the existing packet-flow engine. The lesson MDX composes reusable learning blocks, while the catalogue provides navigation and publication state. The interactive component owns playback state but reuses existing speed, reduced-motion, theme, and accessibility conventions.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, MDX, Zod, Vitest, Testing Library, Playwright, CSS.

**Spec:** `docs/superpowers/specs/2026-09-02-osi-tcp-ip-models-design.md`

## Global Constraints

- No new runtime dependency or animation framework.
- Keep Light, Dark, and System themes working.
- Reduced-motion learners start paused and receive discrete state changes.
- Use Data → Segment → Packet → Frame → Bits terminology while explaining that UDP uses a datagram.
- Keep TCP, DNS, TLS, VLAN, routing, NAT, and firewall configuration details for later lessons.
- All learner-visible controls must be keyboard accessible and must not rely on color alone.

---

### Task 1: Publish the catalogue entry and lesson shell

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Create: `src/content/networking-foundations/osi-and-tcp-ip-models.mdx`
- Create: `src/content/networking-foundations/osi-and-tcp-ip-models.content.test.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`

**Interfaces:**
- Consumes: existing `Pathway` catalogue validation and dynamic lesson loader.
- Produces: published slug `osi-and-tcp-ip-models` with nine section IDs and an MDX module resolvable by `loadLessonContent`.

- [ ] **Step 1: Write the failing catalogue and content tests**

```ts
expect(publishedLessonSlugs).toContain("osi-and-tcp-ip-models");
expect(headingIds).toEqual([
  "why-layers", "osi-model", "tcp-ip-model", "model-mapping",
  "encapsulation-lab", "device-layer-scope", "wireshark-layers",
  "troubleshooting-interview", "knowledge-summary",
]);
```

- [ ] **Step 2: Run the focused tests and verify they fail because the lesson is unpublished and its MDX file is absent**

Run: `pnpm test -- src/features/catalog/catalog.repository.test.ts src/content/networking-foundations/osi-and-tcp-ip-models.content.test.ts src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`

- [ ] **Step 3: Publish the catalogue record and add the complete static MDX structure**

Set `published: true`, `estimatedMinutes: 18`, and add the exact nine section records from the design. The MDX must include substantive explanations, a static encapsulation sequence, one `WiresharkCheck`, at least two `KnowledgeCheck` blocks, and at least two `InterviewScenario` blocks.

- [ ] **Step 4: Run the focused tests and verify they pass**

- [ ] **Step 5: Commit**

```bash
git add src/features/catalog src/content/networking-foundations/osi-and-tcp-ip-models.mdx src/app/learn
git commit -m "feat: publish OSI and TCP-IP lesson shell"
```

### Task 2: Validate model and encapsulation data

**Files:**
- Create: `src/features/layer-models/layer-models.schema.ts`
- Create: `src/features/layer-models/layer-models.data.ts`
- Create: `src/features/layer-models/layer-models.schema.test.ts`
- Create: `src/features/layer-models/layer-models.data.test.ts`

**Interfaces:**
- Produces: `parseLayerModelsLab(input: unknown): LayerModelsLab` and `layerModelsLab: LayerModelsLab`.
- `LayerModelsLab` contains `osiLayers`, `tcpIpLayers`, `mapping`, `encapsulationSteps`, and `deviceScopes`.
- Each encapsulation step contains `id`, `direction`, `title`, `plainExplanation`, `technicalExplanation`, `activeOsiLayer`, `activeTcpIpLayer`, `pdu`, `addedInformation`, and `durationMs`.

- [ ] **Step 1: Write schema tests for unique layer numbers, complete OSI-to-TCP/IP coverage, valid step references, and positive durations**

```ts
expect(() => parseLayerModelsLab(validLab)).not.toThrow();
expect(() => parseLayerModelsLab({ ...validLab, mapping: [] })).toThrow(/coverage/i);
```

- [ ] **Step 2: Run the schema test and verify failure because the parser is absent**

- [ ] **Step 3: Implement the Zod schema and cross-reference validation**

OSI numbers must be exactly `7, 6, 5, 4, 3, 2, 1`; TCP/IP layer IDs must be `application`, `transport`, `internet`, and `network-access`; every OSI layer must occur in exactly one mapping entry.

- [ ] **Step 4: Write the failing canonical-data test**

```ts
expect(layerModelsLab.encapsulationSteps.map(({ pdu }) => pdu)).toEqual([
  "Data", "Segment", "Packet", "Frame", "Bits",
  "Frame", "Packet", "Segment", "Data",
]);
```

- [ ] **Step 5: Add the canonical mapping, nine-step browser-request journey, and device scope data**

- [ ] **Step 6: Run both data tests and commit**

```bash
git add src/features/layer-models
git commit -m "feat: model OSI and TCP-IP encapsulation data"
```

### Task 3: Build the synchronized layer comparison

**Files:**
- Create: `src/features/layer-models/layer-model-comparison.tsx`
- Create: `src/features/layer-models/layer-model-comparison.test.tsx`
- Modify: `mdx-components.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/content/networking-foundations/osi-and-tcp-ip-models.mdx`

**Interfaces:**
- Consumes: `layerModelsLab.osiLayers`, `tcpIpLayers`, and `mapping`.
- Produces: `<LayerModelComparison />`, a server-renderable side-by-side semantic comparison.

- [ ] **Step 1: Write the failing rendered-behavior test**

```tsx
render(<LayerModelComparison />);
expect(screen.getAllByRole("listitem")).toHaveLength(11);
expect(screen.getByText("Application", { selector: "[data-tcp-ip-layer]" })).toBeVisible();
expect(screen.getByText(/OSI layers 7, 6, and 5/)).toBeVisible();
```

- [ ] **Step 2: Run it and verify failure because the component is absent**

- [ ] **Step 3: Implement semantic lists with mapping connectors and concise protocol examples**

Use text labels and `data-*` attributes for mapping; connectors are decorative and `aria-hidden`.

- [ ] **Step 4: Register the component in `mdx-components.tsx`, embed it under `model-mapping`, and add responsive theme-aware CSS**

- [ ] **Step 5: Run focused tests at desktop and narrow DOM widths, then commit**

```bash
git add mdx-components.tsx src/features/layer-models src/content/networking-foundations/osi-and-tcp-ip-models.mdx src/app/globals.css
git commit -m "feat: compare OSI and TCP-IP layers"
```

### Task 4: Build the encapsulation playback experience

**Files:**
- Create: `src/features/layer-models/encapsulation-player.tsx`
- Create: `src/features/layer-models/encapsulation-player.test.tsx`
- Create: `src/features/layer-models/encapsulation-experience.tsx`
- Modify: `mdx-components.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/content/networking-foundations/osi-and-tcp-ip-models.mdx`

**Interfaces:**
- Consumes: `layerModelsLab.encapsulationSteps` and existing `PLAYBACK_SPEEDS`.
- Produces: `<EncapsulationExperience />` with Previous, Play/Pause, Next, Restart, speed selection, active-layer state, visible PDU state, and a native technical-details disclosure.

- [ ] **Step 1: Write failing tests for initial state, autoplay, pause/resume, previous/next/restart, four speeds, final-step behavior, and synchronized PDU/layer text**

```tsx
expect(screen.getByText("Step 1 of 9")).toBeVisible();
expect(screen.getByText("Data", { selector: "[data-current-pdu]" })).toBeVisible();
await user.click(screen.getByRole("button", { name: "Next" }));
expect(screen.getByText("Segment", { selector: "[data-current-pdu]" })).toBeVisible();
```

- [ ] **Step 2: Run and verify the tests fail because the player is absent**

- [ ] **Step 3: Implement the minimal playback reducer and timer lifecycle**

Maintain exactly one timer, clear it on pause/unmount, scale duration by the selected speed, and pause at the final step.

- [ ] **Step 4: Write the failing reduced-motion and accessibility tests**

Assert initial pause under reduced motion, no continuous animation element, an accessible experience name, visible active-state text, keyboard-operable buttons, and a mounted polite status region.

- [ ] **Step 5: Implement the synchronized stack/PDU visualization and expandable technical details**

Use CSS transitions only when reduced motion is false. Render encapsulation blocks as semantic text plus decorative SVG/CSS layers.

- [ ] **Step 6: Register and embed `<EncapsulationExperience />`, run focused tests, and commit**

```bash
git add mdx-components.tsx src/features/layer-models src/content/networking-foundations/osi-and-tcp-ip-models.mdx src/app/globals.css
git commit -m "feat: animate packet encapsulation and decapsulation"
```

### Task 5: Add device scope, practical checks, and completion coverage

**Files:**
- Create: `src/features/layer-models/device-layer-scope.tsx`
- Create: `src/features/layer-models/device-layer-scope.test.tsx`
- Modify: `mdx-components.tsx`
- Modify: `src/content/networking-foundations/osi-and-tcp-ip-models.mdx`
- Modify: `src/app/globals.css`
- Modify: `tests/e2e/lesson.spec.ts`
- Modify: `tests/e2e/navigation.spec.ts`

**Interfaces:**
- Consumes: `layerModelsLab.deviceScopes` and `NetworkDeviceSymbol`.
- Produces: `<DeviceLayerScope />` with host, switch, router, and firewall comparisons.

- [ ] **Step 1: Write a failing component test for all four shared device symbols and their “commonly examines” text**

```tsx
render(<DeviceLayerScope />);
expect(container.querySelector('[data-device-symbol="switch"]')).toBeInTheDocument();
expect(screen.getByText(/commonly examines/i)).toBeVisible();
```

- [ ] **Step 2: Implement the responsive device comparison and register it for MDX**

- [ ] **Step 3: Complete the Wireshark, troubleshooting, interview, knowledge-check, and summary copy with all filters and fields from the spec**

- [ ] **Step 4: Add end-to-end checks for navigation, playback, responsive overflow, Light/Dark compatibility, static no-JavaScript content, and zero hydration/console errors**

```ts
await page.goto("/learn/networking-foundations/osi-and-tcp-ip-models");
await expect(page.getByRole("heading", { level: 1, name: "OSI and TCP/IP Models" })).toBeVisible();
await expect(page.getByText("Step 1 of 9")).toBeVisible();
expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
```

- [ ] **Step 5: Run full verification**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm test:e2e`

Expected: every command exits `0`; no test failures, hydration errors, console errors, or horizontal overflow.

- [ ] **Step 6: Commit**

```bash
git add mdx-components.tsx src/features/layer-models src/content/networking-foundations/osi-and-tcp-ip-models.mdx src/app/globals.css tests/e2e
git commit -m "feat: complete OSI and TCP-IP lesson"
```


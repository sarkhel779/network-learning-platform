# Cables, Fibre, Wireless and Network Connections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the third Networking Foundations lesson with a descriptive copper/fibre/wireless comparison, a guided connection-design lab, foundational troubleshooting, and server-enforced access boundaries.

**Architecture:** Keep public and account lesson prose in separate MDX modules and keep catalog metadata authoritative. Add a focused `connection-media` feature whose Zod-validated data and pure evaluator are independent of React; small comparison and lab components consume those types, while a lesson composition component owns only UI state. Anonymous rendering receives public comparison data only, and protected scenarios remain in the account module/loader boundary until authentication is implemented.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9 strict mode, MDX 3, Zod 4, Vitest 3, Testing Library, Playwright 1.55, CSS.

**Spec:** `docs/superpowers/specs/2026-09-08-connection-media-lesson-design.md`

## Global Constraints

- Preserve the approved slug, order, title, objective, SEO metadata, and `estimatedMinutes: 20`.
- Explain behavior before terminology and remain vendor-neutral.
- Do not teach switching, VLANs, routing, packet encapsulation, fibre splicing, or wireless site-survey certification here.
- Wireless is shared and contention-based; never describe it as switched full-duplex Ethernet.
- A link indicator proves only physical/link negotiation, not end-to-end connectivity.
- Public responses may contain only the introduction and medium comparison; account scenarios, answers, and Pro copy must not enter anonymous HTML, RSC, or client props.
- The only upgrade action is exactly **Join the Pro Member Waitlist**; no checkout or immediate Pro entitlement is implemented.
- **I know this—proceed to advanced** may navigate within authorized content but never bypass authentication or Pro access.
- Essential explanations remain usable without JavaScript and without animation.
- Support keyboard input, visible focus, screen-reader announcements, reduced motion, and 360px layouts without horizontal overflow.
- Add no runtime dependency, external request, browser permission, hardware inspection, or learner-data persistence.
- Follow TDD for each task and never stage `.pnpm-store/` or `.next/`.

## File Structure

- `src/features/connection-media/connection-media.schema.ts` owns the public schemas and inferred types.
- `src/features/connection-media/connection-media.data.ts` owns public comparison data and account-only scenario data as separate exports.
- `src/features/connection-media/evaluate-connection-choice.ts` contains the pure recommendation lookup and validation-safe result API.
- `src/features/connection-media/connection-media-comparison.tsx` renders the public visual comparison.
- `src/features/connection-media/connection-media-lab.tsx` renders account scenario selection and feedback.
- `src/features/connection-media/connection-media-experience.tsx` composes the authorized lab, advanced jump, and fallback.
- `src/content/networking-foundations/cables-fibre-wireless-and-network-connections.public.mdx` contains anonymous-safe instruction.
- `src/content/networking-foundations/cables-fibre-wireless-and-network-connections.account.mdx` contains free-member scenarios, troubleshooting, assessment, and the Pro preview.
- Existing catalog, lesson registry, MDX component registry, CSS, content contracts, route tests, and E2E tests receive focused integrations.

---

### Task 1: Publish the Lesson and Establish Server Content Boundaries

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `src/content/lesson-access.content.test.ts`
- Create: `src/content/networking-foundations/cables-fibre-wireless-and-network-connections.public.mdx`
- Create: `src/content/networking-foundations/cables-fibre-wireless-and-network-connections.account.mdx`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
- Modify: `src/app/sitemap.test.ts`

**Interfaces:**
- Consumes: `loadAuthorizedLessonContent(key: LessonContentKey, access: ViewerAccess)` and catalog repository APIs.
- Produces: a published `/learn/networking-foundations/cables-fibre-wireless-and-network-connections` route with ten ordered section records and split public/account loaders.

- [ ] **Step 1: Write failing publication, route-generation, adjacency, and sitemap tests**

```ts
expect(listPublishedLessons("networking-foundations").map(({ slug }) => slug)).toEqual([
  "how-networks-communicate",
  "hosts-and-network-devices",
  "cables-fibre-wireless-and-network-connections",
  "osi-and-tcp-ip-models",
]);
const adjacent = getAdjacentLessons(
  "networking-foundations",
  "cables-fibre-wireless-and-network-connections",
);
expect(adjacent.previous?.slug).toBe("hosts-and-network-devices");
expect(adjacent.next?.slug).toBe("hubs-bridges-and-switches");
```

Update `generateStaticParams` and sitemap expectations to include the new route once and retain the existing three routes.

- [ ] **Step 2: Run the focused tests and observe the unpublished/unregistered failures**

```powershell
pnpm exec vitest run src/features/catalog/catalog.repository.test.ts src/features/lessons/lesson-content.repository.test.ts src/content/lesson-access.content.test.ts 'src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts' src/app/sitemap.test.ts
```

Expected: FAIL because the lesson is planned, absent from static routes/sitemap, and absent from the content registry.

- [ ] **Step 3: Publish exact catalog metadata and sections**

Set `published: true` and add these ordered sections:

```ts
sections: [
  { id: "how-connections-carry-data", label: "How connections carry data", access: "public" },
  { id: "connection-qualities", label: "Connection qualities", access: "public" },
  { id: "copper-ethernet", label: "Copper Ethernet", access: "public" },
  { id: "fibre-connections", label: "Fibre connections", access: "public" },
  { id: "wireless-connections", label: "Wireless connections", access: "public" },
  { id: "compare-media", label: "Compare connection media", access: "public" },
  { id: "design-a-connection", label: "Design a connection", access: "account" },
  { id: "diagnose-link-symptoms", label: "Diagnose link symptoms", access: "account" },
  { id: "knowledge-check-summary", label: "Knowledge check and summary", access: "account" },
  { id: "pro-deep-dive", label: "Pro Deep Dive", access: "pro", preview: "Explore optical budgets, wireless channel analysis, advanced troubleshooting, standards checks, and interview preparation." },
],
```

- [ ] **Step 4: Create valid MDX skeletons and register split loaders**

```ts
"networking-foundations/cables-fibre-wireless-and-network-connections": {
  public: () => import("@/content/networking-foundations/cables-fibre-wireless-and-network-connections.public.mdx"),
  account: () => import("@/content/networking-foundations/cables-fibre-wireless-and-network-connections.account.mdx"),
},
```

The public skeleton contains only the six public headings; the account skeleton contains the three account headings plus `pro-deep-dive`. Do not add a `.pro.mdx` module because launch access is waitlist-only.

- [ ] **Step 5: Assert loader isolation explicitly**

```ts
const anonymous = await loader(key, "anonymous");
expect(anonymous.public).toBeDefined();
expect(anonymous.account).toBeUndefined();
expect(anonymous.pro).toBeUndefined();

const account = await loader(key, "account");
expect(account.public).toBeDefined();
expect(account.account).toBeDefined();
expect(account.pro).toBeUndefined();
```

Add `CONNECTION_MEDIA_ACCOUNT_SENTINEL`, answer phrases, advanced optical-budget copy, and scenario explanations to the protected-string assertions. Mock the account MDX in `page.test.ts` so any anonymous import throws.

- [ ] **Step 6: Run focused tests, typecheck, and commit**

```powershell
pnpm exec vitest run src/features/catalog/catalog.repository.test.ts src/features/lessons/lesson-content.repository.test.ts src/content/lesson-access.content.test.ts 'src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts' src/app/sitemap.test.ts
pnpm typecheck
git add src/features/catalog/catalog.data.ts src/features/catalog/catalog.repository.test.ts src/features/lessons/lesson-content.repository.ts src/features/lessons/lesson-content.repository.test.ts src/content/lesson-access.content.test.ts src/content/networking-foundations 'src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts' src/app/sitemap.test.ts
git commit -m "feat: publish connection media lesson shell"
```

---

### Task 2: Define and Validate Media, Scenario, and Evaluation Data

**Files:**
- Create: `src/features/connection-media/connection-media.schema.ts`
- Create: `src/features/connection-media/connection-media.schema.test.ts`
- Create: `src/features/connection-media/connection-media.data.ts`
- Create: `src/features/connection-media/connection-media.data.test.ts`

**Interfaces:**
- Produces: `ConnectionMediumId`, `ComparisonQualityId`, `ConnectionOutcome`, `ConnectionMedium`, `ConnectionScenario`, `ConnectionMediaCatalog`, `parseConnectionMediaCatalog(input)`, `safeParseConnectionMediaCatalog(input)`, `publicConnectionMedia`, and `accountConnectionScenarios`.

- [ ] **Step 1: Write failing schema tests for accepted and rejected catalogs**

Test valid data plus duplicate medium/scenario IDs, missing choice evaluations, multiple recommended choices, unknown recommended IDs, empty decisive requirements, and invalid outcomes.

```ts
expect(() => parseConnectionMediaCatalog(validCatalog)).not.toThrow();
expect(() => parseConnectionMediaCatalog({ ...validCatalog, media: [] })).toThrow();
expect(() => parseConnectionMediaCatalog(catalogWithTwoRecommendedChoices)).toThrow(/one recommended/i);
expect(() => parseConnectionMediaCatalog(catalogMissingWirelessEvaluation)).toThrow(/wireless/i);
```

- [ ] **Step 2: Run the schema test and observe module-not-found failure**

```powershell
pnpm exec vitest run src/features/connection-media/connection-media.schema.test.ts
```

- [ ] **Step 3: Implement exact exported types and parser**

```ts
export type ConnectionMediumId = "copper" | "fibre" | "wireless";
export type ComparisonQualityId = "distance" | "bandwidth" | "interference" | "mobility" | "cost";
export type ConnectionOutcome = "recommended" | "workable-with-trade-offs" | "unsuitable";

export type ChoiceEvaluation = Readonly<{
  outcome: ConnectionOutcome;
  decisiveRequirements: readonly string[];
  explanation: string;
}>;

export type ConnectionScenario = Readonly<{
  id: string;
  title: string;
  source: string;
  destination: string;
  distance: string;
  minimumBandwidth: string;
  latencySensitivity: "low" | "medium" | "high";
  environment: string;
  mobilityRequired: boolean;
  reliabilityPriority: "standard" | "high";
  budget: "low" | "medium" | "high";
  recommendedMediumId: ConnectionMediumId;
  evaluations: Readonly<Record<ConnectionMediumId, ChoiceEvaluation>>;
}>;
```

Use Zod `.superRefine()` to enforce unique IDs, exactly three medium IDs, all five qualities per medium, complete evaluations, and exactly one `recommended` result matching `recommendedMediumId`.

- [ ] **Step 4: Write failing semantic data tests for the six approved scenarios**

Assert IDs `home-desktop`, `mobile-office`, `noisy-workshop`, `campus-buildings`, `data-centre-interconnect`, and `temporary-classroom`; all three media; all five comparison qualities; and coverage of all three outcomes across the dataset.

- [ ] **Step 5: Add validated public and protected datasets**

`publicConnectionMedia` contains only medium names, signal labels, summaries, analogies, and the five comparison qualities. `accountConnectionScenarios` contains the six scenario requirements and all choice explanations. Export a combined parsed catalog only from a module consumed by authorized account UI; public MDX must import only `publicConnectionMedia`.

- [ ] **Step 6: Verify and commit**

```powershell
pnpm exec vitest run src/features/connection-media/connection-media.schema.test.ts src/features/connection-media/connection-media.data.test.ts
pnpm typecheck
git add src/features/connection-media/connection-media.schema.ts src/features/connection-media/connection-media.schema.test.ts src/features/connection-media/connection-media.data.ts src/features/connection-media/connection-media.data.test.ts
git commit -m "feat: model connection media scenarios"
```

---

### Task 3: Implement the Pure Connection-Choice Evaluator

**Files:**
- Create: `src/features/connection-media/evaluate-connection-choice.ts`
- Create: `src/features/connection-media/evaluate-connection-choice.test.ts`

**Interfaces:**
- Consumes: `ConnectionScenario`, `ConnectionMediumId`, and `ChoiceEvaluation` from Task 2.
- Produces: `evaluateConnectionChoice(scenario, mediumId): ConnectionChoiceResult` and `safeEvaluateConnectionChoice(scenario, mediumId): ConnectionChoiceResult | undefined`.

- [ ] **Step 1: Write failing tests for all outcomes and unknown inputs**

```ts
expect(evaluateConnectionChoice(homeDesktop, "copper")).toMatchObject({
  outcome: "recommended",
  selectedMediumId: "copper",
  recommendedMediumId: "copper",
});
expect(evaluateConnectionChoice(campusBuildings, "wireless").outcome).toBe("unsuitable");
expect(safeEvaluateConnectionChoice(campusBuildings, "unknown" as ConnectionMediumId)).toBeUndefined();
```

Also assert that returned requirement arrays are copied/read-only and every explanation is the scenario's exact validated explanation.

- [ ] **Step 2: Run the evaluator test and observe module-not-found failure**

```powershell
pnpm exec vitest run src/features/connection-media/evaluate-connection-choice.test.ts
```

- [ ] **Step 3: Implement a lookup-only evaluator**

```ts
export type ConnectionChoiceResult = Readonly<{
  scenarioId: string;
  selectedMediumId: ConnectionMediumId;
  recommendedMediumId: ConnectionMediumId;
  outcome: ConnectionOutcome;
  decisiveRequirements: readonly string[];
  explanation: string;
}>;
```

Look up the validated evaluation; do not recalculate recommendations from display strings and do not fall back to the first scenario or medium.

- [ ] **Step 4: Verify and commit**

```powershell
pnpm exec vitest run src/features/connection-media/evaluate-connection-choice.test.ts src/features/connection-media/connection-media.data.test.ts
pnpm typecheck
git add src/features/connection-media/evaluate-connection-choice.ts src/features/connection-media/evaluate-connection-choice.test.ts
git commit -m "feat: evaluate connection media choices"
```

---

### Task 4: Build the Public Visual Comparison

**Files:**
- Create: `src/features/connection-media/connection-media-comparison.tsx`
- Create: `src/features/connection-media/connection-media-comparison.test.tsx`
- Modify: `mdx-components.tsx`

**Interfaces:**
- Consumes: `publicConnectionMedia` and `ComparisonQualityId` from Task 2.
- Produces: `ConnectionMediaComparison()` registered for MDX and containing no account scenario imports.

- [ ] **Step 1: Write failing rendering and interaction tests**

Render three named regions/cards: `Copper`, `Fibre`, and `Wireless`. Assert the default signal labels `Electrical pulses`, `Light pulses`, and `Radio waves`, a labelled quality selector, and updated explanations for `Distance`, `Bandwidth`, `Interference`, `Mobility`, and `Cost`.

```tsx
render(<ConnectionMediaComparison />);
expect(screen.getByRole("heading", { name: "Copper" })).toBeVisible();
await user.click(screen.getByRole("radio", { name: "Interference" }));
expect(screen.getByText(/electromagnetic interference/i)).toBeVisible();
expect(screen.getByText(/shared radio environment/i)).toBeVisible();
```

Assert no text from `accountConnectionScenarios`, no drag interaction, and meaningful content before any click.

- [ ] **Step 2: Run the component test and observe failure**

```powershell
pnpm exec vitest run src/features/connection-media/connection-media-comparison.test.tsx
```

- [ ] **Step 3: Implement accessible synchronized panels**

Use a `<fieldset>` with one radio per quality, three `<article aria-labelledby>` panels, labelled signal tracks, persistent text summaries, and `data-signal="electrical|optical|radio"` hooks for CSS. State changes update visible prose; animation is decorative and `aria-hidden="true"`.

- [ ] **Step 4: Register the component and verify server safety**

Add `ConnectionMediaComparison` to `mdx-components.tsx`. Render it with `renderToStaticMarkup` and assert the three media names, signal types, and default comparison remain present without hydration.

- [ ] **Step 5: Verify and commit**

```powershell
pnpm exec vitest run src/features/connection-media/connection-media-comparison.test.tsx src/content/lesson-rendering.test.tsx
pnpm typecheck
git add src/features/connection-media/connection-media-comparison.tsx src/features/connection-media/connection-media-comparison.test.tsx mdx-components.tsx
git commit -m "feat: compare network connection media"
```

---

### Task 5: Build the Authorized Guided Lab and Advanced Jump

**Files:**
- Create: `src/features/connection-media/connection-media-lab.tsx`
- Create: `src/features/connection-media/connection-media-lab.test.tsx`
- Create: `src/features/connection-media/connection-media-experience.tsx`
- Create: `src/features/connection-media/connection-media-experience.test.tsx`
- Modify: `mdx-components.tsx`

**Interfaces:**
- Consumes: `accountConnectionScenarios`, `publicConnectionMedia`, and `safeEvaluateConnectionChoice()`.
- Produces: `ConnectionMediaLab({ scenarios })`, `ConnectionMediaExperience()`, explicit fallback UI, and an `#design-a-connection` focus target.

- [ ] **Step 1: Write failing lab-state tests**

Assert the first scenario is selected, requirement cards show all approved fields, no result exists before submission, and submission renders each outcome with decisive requirements and the recommended alternative.

```tsx
render(<ConnectionMediaLab scenarios={accountConnectionScenarios} />);
await user.click(screen.getByRole("radio", { name: "Wireless" }));
await user.click(screen.getByRole("button", { name: "Check my connection choice" }));
expect(screen.getByRole("status")).toHaveTextContent(/workable|unsuitable|recommended/i);
```

Changing scenario must clear the chosen medium, result, and live-region text. Re-submission announces exactly once.

- [ ] **Step 2: Write failing keyboard, advanced-jump, and fallback tests**

Exercise all selectors with keyboard input. Activate **I know this—proceed to advanced** and assert focus reaches the `design-a-connection` heading. Pass invalid scenario data to the composition boundary and assert `Connection design lab unavailable` plus the static troubleshooting workflow, never a substituted scenario.

- [ ] **Step 3: Run the tests and observe missing-component failures**

```powershell
pnpm exec vitest run src/features/connection-media/connection-media-lab.test.tsx src/features/connection-media/connection-media-experience.test.tsx
```

- [ ] **Step 4: Implement lab state with explicit submission**

```ts
const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "");
const [mediumId, setMediumId] = useState<ConnectionMediumId>();
const [result, setResult] = useState<ConnectionChoiceResult>();
```

Scenario selection clears `mediumId` and `result`. Disable submission until a medium is selected. The result panel has a visible heading plus a polite status announcement; do not put the complete panel in a repeatedly updating live region.

- [ ] **Step 5: Implement the composition and focus-managed jump**

`ConnectionMediaExperience` validates its imported authorized dataset once, renders a labelled `section`, and catches invalid data by showing static guidance. The jump control calls `document.getElementById("design-a-connection")?.focus()`; the heading receives `tabIndex={-1}`. Do not render this component from public MDX.

- [ ] **Step 6: Register, verify, and commit**

```powershell
pnpm exec vitest run src/features/connection-media
pnpm typecheck
git add src/features/connection-media/connection-media-lab.tsx src/features/connection-media/connection-media-lab.test.tsx src/features/connection-media/connection-media-experience.tsx src/features/connection-media/connection-media-experience.test.tsx mdx-components.tsx
git commit -m "feat: add guided connection design lab"
```

---

### Task 6: Author the Complete Public and Account Lesson

**Files:**
- Modify: `src/content/networking-foundations/cables-fibre-wireless-and-network-connections.public.mdx`
- Modify: `src/content/networking-foundations/cables-fibre-wireless-and-network-connections.account.mdx`
- Create: `src/content/networking-foundations/cables-fibre-wireless-and-network-connections.content.test.ts`
- Modify: `src/content/lesson-rendering.test.tsx`
- Modify: `src/features/lessons/premium-preview.tsx`
- Create: `src/features/lessons/premium-preview.test.tsx`

**Interfaces:**
- Consumes: `ConnectionMediaComparison`, `ConnectionMediaExperience`, `KnowledgeCheck`, `InterviewScenario`, and `PremiumPreview` from the MDX registry.
- Produces: all ten catalog anchors with anonymous-safe public copy, protected account assessment/troubleshooting, and `PremiumPreview({ ctaLabel?, ctaHref? })` with backward-compatible defaults.

- [ ] **Step 1: Write failing source-boundary and content-contract tests**

Assert exact heading IDs, one comparison component in public MDX, one experience component in account MDX, no `KnowledgeCheck`, correct answers, scenario explanations, optical-budget details, or interview answers in the public file, and exactly three foundational knowledge checks in the account file.

```ts
expect(publicSource).toContain("<ConnectionMediaComparison />");
expect(publicSource).not.toMatch(/<ConnectionMediaExperience|<KnowledgeCheck|correctIndex/);
expect(accountSource).toContain("<ConnectionMediaExperience />");
expect(accountSource.match(/<KnowledgeCheck\b/g)).toHaveLength(3);
expect(accountSource).toContain("Join the Pro Member Waitlist");
```

- [ ] **Step 2: Run the content tests and observe missing-copy failures**

```powershell
pnpm exec vitest run src/content/networking-foundations/cables-fibre-wireless-and-network-connections.content.test.ts src/content/lesson-rendering.test.tsx src/content/lesson-access.content.test.ts
```

- [ ] **Step 3: Author the public explanation and static comparison**

Cover signal representation; bandwidth/throughput/latency; UTP/STP, categories and RJ45; scoped 100-metre twisted-pair channel guidance; single-mode/multimode and connector/transceiver concepts; radio bands, channels, obstruction, interference, shared airtime, and mobility. State explicitly that fibre is not universally better, shielded cable is installation-dependent, Wi-Fi is not full-duplex switched Ethernet, and a link light is not end-to-end proof.

Add a server-rendered table with columns `Medium`, `Signal`, `Strong fit`, `Main constraints`, and `First evidence`, followed by `<ConnectionMediaComparison />`.

- [ ] **Step 4: Author account lab, troubleshooting, and assessment**

Place `<ConnectionMediaExperience />` beneath `<h2 id="design-a-connection" tabIndex={-1}>`. Add the six-step evidence-first troubleshooting loop and the six approved fault cases. Add three application-based `KnowledgeCheck`s covering medium selection, duplex/link evidence, and wireless interference. Add interview disclosures whose answers distinguish symptoms from conclusions.

- [ ] **Step 5: Extend the premium preview with a backward-compatible waitlist action**

Add optional props without changing existing callers:

```tsx
type PremiumPreviewProps = PropsWithChildren<{
  ctaLabel?: string;
  ctaHref?: string;
}>;

export function PremiumPreview({
  children,
  ctaLabel = "Explore premium learning options",
  ctaHref = "/pricing",
}: PremiumPreviewProps) {
  // Preserve the existing section markup and render the supplied link values.
}
```

Test both the existing default link and `{ ctaLabel: "Join the Pro Member Waitlist", ctaHref: "/contact" }`.

- [ ] **Step 6: Add the truthful Pro waitlist preview to account MDX**

Use `<PremiumPreview ctaLabel="Join the Pro Member Waitlist" ctaHref="/contact">` under `pro-deep-dive` to preview optical power budgets/transceivers, wireless channel analysis, ambiguous designs, advanced evidence, standards checks, and certification/interview practice. Do not add price, checkout, or immediate-access language. `/contact` is the temporary launch destination until the dedicated waitlist form is implemented in the accounts phase.

- [ ] **Step 7: Verify rendered markup, boundaries, and commit**

```powershell
pnpm exec vitest run src/content/networking-foundations/cables-fibre-wireless-and-network-connections.content.test.ts src/content/lesson-rendering.test.tsx src/content/lesson-access.content.test.ts src/features/lessons/knowledge-check.test.tsx src/features/lessons/premium-preview.test.tsx
pnpm typecheck
git add src/content/networking-foundations/cables-fibre-wireless-and-network-connections.public.mdx src/content/networking-foundations/cables-fibre-wireless-and-network-connections.account.mdx src/content/networking-foundations/cables-fibre-wireless-and-network-connections.content.test.ts src/content/lesson-rendering.test.tsx src/features/lessons/premium-preview.tsx src/features/lessons/premium-preview.test.tsx
git commit -m "feat: author connection media lesson"
```

---

### Task 7: Add Responsive, Reduced-Motion, and Browser Verification

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/theme-styles.test.ts`
- Create: `tests/e2e/connection-media.spec.ts`
- Modify: `tests/e2e/lesson-access.spec.ts`
- Modify: `tests/e2e/navigation.spec.ts`
- Modify: `tests/e2e/pathway.spec.ts`

**Interfaces:**
- Produces: responsive public comparison and account-lab styles, reduced-motion signal states, updated curriculum assertions, and browser evidence for the published route.

- [ ] **Step 1: Write failing browser tests for public behavior**

```ts
await page.goto("/learn/networking-foundations/cables-fibre-wireless-and-network-connections");
await expect(page.getByRole("heading", { level: 1, name: "Cables, Fibre, Wireless and Network Connections" })).toBeVisible();
await expect(page.getByRole("heading", { name: "Copper" })).toBeVisible();
await expect(page.getByRole("heading", { name: "Fibre" })).toBeVisible();
await expect(page.getByRole("heading", { name: "Wireless" })).toBeVisible();
await page.getByRole("radio", { name: "Interference" }).check();
await expect(page.getByText(/electromagnetic interference/i)).toBeVisible();
await expect(page.getByRole("region", { name: "Continue this lesson for free" })).toBeVisible();
```

Assert the account scenario titles, answer text, and Pro details are absent from anonymous HTML and collected RSC responses.

- [ ] **Step 2: Add mobile, keyboard, reduced-motion, and no-JavaScript cases**

At `360×800`, assert `scrollWidth <= clientWidth`, stacked panels, usable selectors, and visible focus. Under `reducedMotion: "reduce"`, assert signal tracks carry `data-motion="reduced"`. With JavaScript disabled, assert the six public headings and comparison table remain readable and the registration boundary remains usable.

- [ ] **Step 3: Update curriculum/navigation assertions without weakening earlier routes**

The pathway must show four published links and the remaining 19 lessons as `Coming later`. Previous/Next from Hosts must reach the connection lesson; the connection lesson's next planned item remains non-clickable. Preserve all existing packet-flow and OSI boundary assertions.

- [ ] **Step 4: Run focused unit and E2E tests to observe styling/integration failures**

```powershell
pnpm exec vitest run src/app/theme-styles.test.ts src/features/connection-media src/features/catalog src/features/lessons
pnpm exec playwright test tests/e2e/connection-media.spec.ts tests/e2e/lesson-access.spec.ts tests/e2e/navigation.spec.ts tests/e2e/pathway.spec.ts --project=chromium
```

- [ ] **Step 5: Add focused CSS**

Add `.connection-media-comparison`, `.connection-media-card`, `.signal-track`, `.connection-media-lab`, `.connection-requirements`, `.connection-choice-grid`, and `.connection-result` rules. Use one-column layouts by default, three comparison columns above `56rem`, no fixed content width wider than the container, and `overflow-wrap: anywhere` for technical terms. Use CSS custom properties plus text/icons/patterns for outcomes. Under `prefers-reduced-motion: reduce`, stop signal travel and show discrete source/medium/destination states.

- [ ] **Step 6: Re-run focused verification and commit**

```powershell
pnpm exec vitest run src/app/theme-styles.test.ts src/features/connection-media src/features/catalog src/features/lessons src/content
pnpm exec playwright test tests/e2e/connection-media.spec.ts tests/e2e/lesson-access.spec.ts tests/e2e/navigation.spec.ts tests/e2e/pathway.spec.ts --project=chromium
git add src/app/globals.css src/app/theme-styles.test.ts tests/e2e/connection-media.spec.ts tests/e2e/lesson-access.spec.ts tests/e2e/navigation.spec.ts tests/e2e/pathway.spec.ts
git commit -m "test: verify connection media experience"
```

---

### Task 8: Complete Full Regression and Visual Verification

**Files:**
- Modify only files implicated by a reproduced failure.

**Interfaces:**
- Produces: a review-ready feature branch with verified public boundaries, lesson behavior, build output, accessibility, and responsive presentation.

- [ ] **Step 1: Run the complete automated suite**

```powershell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm test:e2e
```

Expected: every command exits 0; the production build emits four published lesson routes including `cables-fibre-wireless-and-network-connections`.

- [ ] **Step 2: Audit generated anonymous artifacts**

Search `.next/server/app/learn/networking-foundations/cables-fibre-wireless-and-network-connections` for account scenario titles, answer phrases, `CONNECTION_MEDIA_ACCOUNT_SENTINEL`, optical-budget details, and interview answers. Expected: no match. Confirm the six public headings and medium comparison do appear.

- [ ] **Step 3: Perform desktop, 360px, keyboard, reduced-motion, and no-JavaScript visual review**

Verify hierarchy, readability, all five comparison qualities, focus order, signal alternatives, registration boundary, lack of overflow, dark/light themes, and no relevant console, hydration, or markup errors. When authentication is unavailable, verify account content through component tests and the authorized loader rather than weakening the anonymous route.

- [ ] **Step 4: Apply only evidence-driven corrections**

For each reproduced issue, add a focused failing test, run it to confirm the failure, implement the smallest correction, rerun that test, and rerun the affected full command from Step 1.

- [ ] **Step 5: Inspect repository state and commit verified corrections if needed**

```powershell
git status --short
git diff --check
git diff --stat main...HEAD
git log --oneline main..HEAD
git add src tests docs/superpowers mdx-components.tsx
git commit -m "fix: finalize connection media lesson"
```

Expected: no `.pnpm-store/` or `.next/` entries are staged, `git diff --check` is silent, and only the approved spec, plan, lesson, integration, style, and test files differ from `main`.

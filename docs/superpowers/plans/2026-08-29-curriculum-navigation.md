# Curriculum Navigation and Hydration Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the published lesson hydration error and add scalable, catalog-driven curriculum and section navigation for the six approved networking modules.

**Architecture:** The typed catalog remains the only curriculum source. Server-rendered lesson pages pass the complete pathway and current lesson into focused navigation components; a shared curriculum tree appears as a desktop sidebar and inside a native mobile disclosure, while optional section metadata drives `On this page` links without scraping rendered MDX.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, MDX, Zod, Vitest, Testing Library, Playwright, CSS.

**Spec:** `docs/superpowers/specs/2026-08-29-curriculum-navigation-design.md`

## Global Constraints

- Render the six approved modules in exact catalog order without encoding a maximum count or hard-coding module names in navigation components.
- The catalog is the single source of truth for module/lesson order, URLs, publication state, access state, and optional lesson sections.
- Published lessons are links; unpublished lessons are non-links labeled `Coming later`.
- The current lesson uses `aria-current="page"` plus visible text that does not rely on color alone.
- Free and premium labels are visible without implying unavailable content can be opened or purchased.
- Desktop uses a persistent curriculum sidebar; mobile uses an accessible `Course contents` disclosure over the same data.
- Existing bottom Previous/Next navigation follows flattened curriculum order across module boundaries.
- `On this page` renders only from validated metadata and never scrapes the document.
- Lesson and published curriculum links remain readable and usable without JavaScript.
- The current lesson produces no invalid HTML/SVG warning, hydration mismatch, or Next.js error overlay.
- Add no dependency and do not upgrade Next.js.
- Accounts, persisted progress, and the `Hosts and Network Devices` lesson are out of scope.

---

## File Structure

**Create**

- `src/features/lessons/curriculum-navigation.tsx` — reusable module/lesson tree.
- `src/features/lessons/curriculum-navigation.test.tsx` — tree semantics and status coverage.
- `src/features/lessons/lesson-section-navigation.tsx` — validated anchor navigation.
- `src/features/lessons/lesson-section-navigation.test.tsx` — section link and omission coverage.

**Modify**

- `src/content/networking-foundations/how-networks-communicate.mdx` — valid MDX/SVG and explicit anchors.
- `src/features/catalog/catalog.types.ts` — section metadata type.
- `src/features/catalog/catalog.schema.ts` and `.test.ts` — section validation.
- `src/features/catalog/catalog.data.ts` — six approved modules and sections.
- `src/features/catalog/catalog.repository.test.ts` — exact curriculum and adjacency.
- `src/features/lessons/lesson-shell.tsx` and `.test.tsx` — responsive navigation composition.
- `src/app/learn/[pathwaySlug]/[lessonSlug]/page.tsx` and `page.test.ts` — pass complete pathway.
- `src/app/globals.css` — desktop/mobile navigation layout and states.
- `tests/e2e/lesson.spec.ts` and `pathway.spec.ts` — hydration and navigation acceptance.

---

### Task 1: Repair the Published Lesson Hydration Error

**Files:**
- Modify: `src/content/networking-foundations/how-networks-communicate.mdx`
- Modify: `tests/e2e/lesson.spec.ts`

**Interfaces:**
- Consumes: `/learn/networking-foundations/how-networks-communicate` and its static figure.
- Produces: valid MDX/SVG with unchanged visible figure, accessible image name, figcaption, and text alternative.

- [ ] **Step 1: Add the failing browser regression**

```ts
test("hydrates the lesson without invalid HTML or React errors", async ({ page }) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydration|cannot be a descendant|server rendered html didn't match/i.test(message.text())
    ) failures.push(message.text());
  });

  await page.goto("/learn/networking-foundations/how-networks-communicate");
  await expect(page.getByRole("heading", { level: 1, name: "How Networks Communicate" })).toBeVisible();
  await page.waitForTimeout(250);
  expect(failures).toEqual([]);
  await expect(page.getByRole("dialog", { name: /console error/i })).toHaveCount(0);
});
```

- [ ] **Step 2: Verify RED**

Run: `pnpm exec playwright test tests/e2e/lesson.spec.ts --grep "hydrates the lesson"`

Expected: FAIL with nested `<p>` and/or hydration mismatch evidence.

- [ ] **Step 3: Make the MDX valid**

Keep SVG character data inline:

```mdx
<text className="network-link-label" textAnchor="middle" x="400" y="205">Each link carries a frame; the IP packet is forwarded across the route.</text>
```

Replace the outer screen-reader paragraph with a valid block wrapper:

```mdx
<div className="sr-only">
  Text alternative: The source PC sends a local frame through a switch to its router.
  The router reads the packet destination, chooses another network, and places the packet
  in a new frame for the path to the destination server.
</div>
```

- [ ] **Step 4: Verify GREEN and static fallback**

Run:

```powershell
pnpm exec playwright test tests/e2e/lesson.spec.ts --grep "hydrates the lesson|static network journey|without JavaScript"
```

Expected: all matching tests pass in both projects with unchanged accessibility evidence.

- [ ] **Step 5: Commit**

```bash
git add src/content/networking-foundations/how-networks-communicate.mdx tests/e2e/lesson.spec.ts
git commit -m "fix: repair lesson hydration markup"
```

---

### Task 2: Model and Validate the Six-Module Curriculum

**Files:**
- Modify: `src/features/catalog/catalog.types.ts`
- Modify: `src/features/catalog/catalog.schema.ts`
- Modify: `src/features/catalog/catalog.schema.test.ts`
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`

**Interfaces:**
- Consumes: existing `Pathway`, `Module`, and `LessonSummary`.
- Produces: `LessonSection`, `LessonSummary.sections?: LessonSection[]`, and the six-module pathway consumed by Tasks 3–6.

- [ ] **Step 1: Write failing section-schema tests**

```ts
it("accepts ordered lesson sections", () => {
  const lesson = lessonSummarySchema.parse({
    id: "lesson_example", slug: "example", title: "Example",
    objective: "Explain an example.", access: "free", published: true,
    estimatedMinutes: 10,
    sections: [{ id: "first-section", label: "First section" }],
  });
  expect(lesson.sections).toEqual([{ id: "first-section", label: "First section" }]);
});

it("rejects duplicate section ids", () => {
  expect(() => lessonSummarySchema.parse({
    id: "lesson_example", slug: "example", title: "Example",
    objective: "Explain an example.", access: "free", published: true,
    estimatedMinutes: 10,
    sections: [
      { id: "repeated", label: "First" },
      { id: "repeated", label: "Second" },
    ],
  })).toThrow();
});
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/catalog/catalog.schema.test.ts`

Expected: FAIL because `sections` is absent and duplicate IDs are not validated.

- [ ] **Step 3: Add the type and Zod contract**

```ts
export type LessonSection = { id: string; label: string };

export type LessonSummary = {
  // existing fields
  sections?: LessonSection[];
};
```

```ts
const lessonSectionSchema = z.object({ id: slugSchema, label: learnerTextSchema });

export const lessonSummarySchema = z.object({
  id: idSchema,
  slug: slugSchema,
  title: learnerTextSchema,
  objective: learnerTextSchema,
  access: z.enum(["free", "premium"]),
  published: z.boolean(),
  estimatedMinutes: z.number().int().min(1).max(60),
  sections: z.array(lessonSectionSchema).optional(),
}).superRefine(({ sections }, context) => {
  const seen = new Set<string>();
  sections?.forEach(({ id }, index) => {
    if (seen.has(id)) context.addIssue({ code: "custom", message: `Duplicate lesson section id: ${id}`, path: ["sections", index, "id"] });
    seen.add(id);
  });
});
```

- [ ] **Step 4: Write exact failing curriculum assertions**

```ts
const pathway = getPathway("networking-foundations");
expect(pathway.modules.map(({ title }) => title)).toEqual([
  "Networking Essentials",
  "Ethernet and Local Networks",
  "IP Addressing and Routing",
  "Transport and Network Services",
  "Network Security Fundamentals",
  "Packet Analysis and Troubleshooting",
]);
expect(pathway.modules.map(({ lessons }) => lessons.map(({ title }) => title))).toEqual([
  ["How Networks Communicate", "Hosts and Network Devices", "OSI and TCP/IP Models"],
  ["ARP and MAC Learning", "Switching and VLAN Basics"],
  ["IPv4 Addressing", "Subnetting Fundamentals", "Routing and Default Gateways"],
  ["TCP, UDP, and Ports", "DNS, DHCP, HTTP, HTTPS, and TLS"],
  ["NAT Fundamentals", "Firewall Fundamentals", "Palo Alto Basics"],
  ["End-to-End Packet Journey"],
]);
```

Also assert `How Networks Communicate` still precedes `Hosts and Network Devices`, and `End-to-End Packet Journey` is the final boundary.

- [ ] **Step 5: Verify curriculum RED**

Run: `pnpm vitest run src/features/catalog/catalog.schema.test.ts src/features/catalog/catalog.repository.test.ts`

Expected: schema GREEN after Step 3; curriculum FAIL against the old single module.

- [ ] **Step 6: Restructure `catalog.data.ts`**

Create modules with slugs:

```ts
"networking-essentials"
"ethernet-and-local-networks"
"ip-addressing-and-routing"
"transport-and-network-services"
"network-security-fundamentals"
"packet-analysis-and-troubleshooting"
```

Preserve existing lesson IDs/slugs except the approved NAT/firewall split. Add:

```ts
{ id: "lesson_nat_fundamentals", slug: "nat-fundamentals", title: "NAT Fundamentals", objective: "Explain why networks translate addresses and ports.", access: "premium", published: false, estimatedMinutes: 15 },
{ id: "lesson_firewall_fundamentals", slug: "firewall-fundamentals", title: "Firewall Fundamentals", objective: "Explain how stateful firewalls permit and deny network traffic.", access: "premium", published: false, estimatedMinutes: 16 },
{ id: "lesson_palo_alto_basics", slug: "palo-alto-basics", title: "Palo Alto Basics", objective: "Identify the core components of a Palo Alto Networks firewall.", access: "premium", published: false, estimatedMinutes: 18 },
```

Add to `How Networks Communicate`:

```ts
sections: [
  { id: "communication-decisions", label: "Communication decisions" },
  { id: "packet-journey", label: "Interactive packet journey" },
  { id: "wireshark-check", label: "Basic Wireshark check" },
  { id: "knowledge-check", label: "Knowledge check" },
  { id: "interview-scenario", label: "Interview scenario" },
],
```

- [ ] **Step 7: Verify GREEN and commit**

Run: `pnpm vitest run src/features/catalog/catalog.schema.test.ts src/features/catalog/catalog.repository.test.ts`

Expected: all pass; only `how-networks-communicate` is published.

```bash
git add src/features/catalog
git commit -m "feat: organize networking curriculum modules"
```

---

### Task 3: Build the Reusable Curriculum Tree

**Files:**
- Create: `src/features/lessons/curriculum-navigation.tsx`
- Create: `src/features/lessons/curriculum-navigation.test.tsx`

**Interfaces:**
- Consumes: `Pathway` and `currentLessonSlug`.
- Produces: `CurriculumNavigation({ pathway, currentLessonSlug })`, reused by desktop/mobile containers in Task 4.

- [ ] **Step 1: Write failing semantic tests**

Use a two-module fixture with current published free, upcoming free, and upcoming premium lessons:

```tsx
render(<CurriculumNavigation pathway={pathwayFixture} currentLessonSlug="current-lesson" />);
const navigation = screen.getByRole("navigation", { name: "Course curriculum" });
expect(within(navigation).getByRole("heading", { name: "Module one" })).toBeVisible();
expect(within(navigation).getByRole("link", { name: /current lesson/i })).toHaveAttribute("aria-current", "page");
expect(within(navigation).getByRole("link", { name: /current lesson/i })).toHaveAttribute("href", "/learn/networking-foundations/current-lesson");
expect(within(navigation).getByText("Coming later")).toBeVisible();
expect(within(navigation).getByText("Premium")).toBeVisible();
expect(within(navigation).queryByRole("link", { name: /future premium/i })).toBeNull();
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/lessons/curriculum-navigation.test.tsx`

Expected: FAIL because the component is absent.

- [ ] **Step 3: Implement the tree**

```tsx
type CurriculumNavigationProps = { pathway: Pathway; currentLessonSlug: string };

export function CurriculumNavigation({ pathway, currentLessonSlug }: CurriculumNavigationProps) {
  return (
    <nav aria-label="Course curriculum" className="curriculum-navigation">
      <ol className="curriculum-navigation__modules">
        {pathway.modules.map((module, moduleIndex) => (
          <li key={module.id} className="curriculum-navigation__module">
            <h2><span>Module {moduleIndex + 1}</span>{module.title}</h2>
            <ol>
              {module.lessons.map((lesson) => {
                const isCurrent = lesson.slug === currentLessonSlug;
                const content = <><span>{lesson.title}</span><span>{lesson.access === "premium" ? "Premium" : "Free"}</span>{!lesson.published && <span>Coming later</span>}{isCurrent && <span>Current lesson</span>}</>;
                return <li key={lesson.id}>{lesson.published ? <Link aria-current={isCurrent ? "page" : undefined} href={`/learn/${pathway.slug}/${lesson.slug}`}>{content}</Link> : <div>{content}</div>}</li>;
              })}
            </ol>
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

Keep it server-renderable and class-driven; add no state or fetching.

- [ ] **Step 4: Verify GREEN and commit**

Run: `pnpm vitest run src/features/lessons/curriculum-navigation.test.tsx`

```bash
git add src/features/lessons/curriculum-navigation.tsx src/features/lessons/curriculum-navigation.test.tsx
git commit -m "feat: add curriculum navigation tree"
```

---

### Task 4: Integrate Responsive Navigation into the Lesson Shell

**Files:**
- Modify: `src/features/lessons/lesson-shell.tsx`
- Modify: `src/features/lessons/lesson-shell.test.tsx`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.tsx`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `CurriculumNavigation`, `Pathway`, current lesson, and adjacency.
- Produces: `LessonShell({ pathway, lesson, previous, next, children })` with desktop aside and native mobile disclosure.

- [ ] **Step 1: Write failing shell/page tests**

Pass `pathway={pathwayFixture}` and assert a `Course contents` complementary region, native summary, module title, current lesson `aria-current`, and unchanged bottom navigation.

```tsx
expect(screen.getByRole("complementary", { name: "Course contents" })).toBeVisible();
expect(screen.getByText("Networking Essentials")).toBeVisible();
expect(screen.getByText("Course contents", { selector: "summary" })).toBeVisible();
expect(screen.getAllByRole("link", { name: /hosts/i })[0]).toHaveAttribute("aria-current", "page");
```

- [ ] **Step 2: Verify RED**

Run:

```powershell
pnpm vitest run src/features/lessons/lesson-shell.test.tsx "src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts"
```

Expected: FAIL because `LessonShell` has no pathway/navigation interface.

- [ ] **Step 3: Pass the pathway from the server page**

```ts
const pathway = getPathway(pathwaySlug);
const lesson = findPublishedLesson(pathwaySlug, lessonSlug);
```

```tsx
<LessonShell pathway={pathway} lesson={lesson} previous={previous} next={next}>
  <LessonContent />
</LessonShell>
```

Remove the redundant `pathwaySlug` prop; use `pathway.slug` for links.

- [ ] **Step 4: Compose desktop and mobile navigation**

```tsx
<main className="lesson-page" id="main-content">
  <aside aria-label="Course contents" className="lesson-curriculum lesson-curriculum--desktop">
    <CurriculumNavigation pathway={pathway} currentLessonSlug={lesson.slug} />
  </aside>
  <article className="lesson-shell">
    <details className="lesson-curriculum lesson-curriculum--mobile">
      <summary>Course contents</summary>
      <CurriculumNavigation pathway={pathway} currentLessonSlug={lesson.slug} />
    </details>
    {/* existing header, objective, content, Previous/Next */}
  </article>
</main>
```

- [ ] **Step 5: Add responsive CSS**

```css
.lesson-page { display: grid; gap: clamp(1.5rem, 4vw, 3rem); width: min(100% - 2rem, 80rem); margin: 0 auto; padding: clamp(2rem, 6vw, 5rem) 0; }
.lesson-curriculum--desktop { display: none; }
.lesson-curriculum--mobile { display: block; margin-bottom: 1.5rem; }
.curriculum-navigation ol { list-style: none; margin: 0; padding: 0; }
.curriculum-navigation a, .curriculum-navigation li > div { overflow-wrap: anywhere; }
.curriculum-navigation [aria-current="page"] { border-inline-start: 0.25rem solid var(--accent); }

@media (min-width: 64rem) {
  .lesson-page { grid-template-columns: minmax(15rem, 18rem) minmax(0, 52rem); }
  .lesson-curriculum--desktop { display: block; position: sticky; top: 1.5rem; align-self: start; max-height: calc(100vh - 3rem); overflow-y: auto; }
  .lesson-curriculum--mobile { display: none; }
}
```

Add readable status badges, module spacing, visible focus, and non-color current-state text.

- [ ] **Step 6: Verify focused tests and commit**

Run:

```powershell
pnpm vitest run src/features/lessons/curriculum-navigation.test.tsx src/features/lessons/lesson-shell.test.tsx "src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts"
```

```bash
git add src/features/lessons/lesson-shell.tsx src/features/lessons/lesson-shell.test.tsx "src/app/learn/[pathwaySlug]/[lessonSlug]/page.tsx" "src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts" src/app/globals.css
git commit -m "feat: integrate responsive course navigation"
```

---

### Task 5: Add Validated `On This Page` Navigation

**Files:**
- Create: `src/features/lessons/lesson-section-navigation.tsx`
- Create: `src/features/lessons/lesson-section-navigation.test.tsx`
- Modify: `src/features/lessons/lesson-shell.tsx`
- Modify: `src/features/lessons/lesson-shell.test.tsx`
- Modify: `src/content/networking-foundations/how-networks-communicate.mdx`
- Modify: `src/app/globals.css`
- Modify: `tests/e2e/lesson.spec.ts`

**Interfaces:**
- Consumes: `lesson.sections` from Task 2.
- Produces: `LessonSectionNavigation({ sections })`, omitted for missing/empty input.

- [ ] **Step 1: Write failing component tests**

```tsx
const sections = [
  { id: "communication-decisions", label: "Communication decisions" },
  { id: "packet-journey", label: "Interactive packet journey" },
];
const { rerender } = render(<LessonSectionNavigation sections={sections} />);
const nav = screen.getByRole("navigation", { name: "On this page" });
expect(within(nav).getByRole("link", { name: "Communication decisions" })).toHaveAttribute("href", "#communication-decisions");
expect(within(nav).getByRole("link", { name: "Interactive packet journey" })).toHaveAttribute("href", "#packet-journey");
rerender(<LessonSectionNavigation sections={undefined} />);
expect(screen.queryByRole("navigation", { name: "On this page" })).toBeNull();
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/lessons/lesson-section-navigation.test.tsx`

- [ ] **Step 3: Implement the component**

```tsx
export function LessonSectionNavigation({ sections }: { sections?: LessonSection[] }) {
  if (!sections?.length) return null;
  return <nav aria-label="On this page" className="lesson-section-navigation"><h2>On this page</h2><ol>{sections.map(({ id, label }) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol></nav>;
}
```

Render it in `LessonShell` outside `CurriculumNavigation`.

- [ ] **Step 4: Add matching explicit MDX anchors**

Use `<h2 id="communication-decisions">...`, a section wrapper with screen-reader anchor heading for `packet-journey`, and single wrapper IDs around `WiresharkCheck`, `KnowledgeCheck`, and `InterviewScenario`:

```mdx
<section aria-labelledby="packet-journey">
  <h2 className="sr-only" id="packet-journey">Interactive packet journey</h2>
  <NetworkCommunicationPacketFlow />
</section>
```

Do not duplicate the player's visible heading.

- [ ] **Step 5: Add anchor integration assertions**

```ts
for (const anchor of ["communication-decisions", "packet-journey", "wireshark-check", "knowledge-check", "interview-scenario"]) {
  await expect(page.locator(`#${anchor}`)).toHaveCount(1);
}
```

- [ ] **Step 6: Verify GREEN and commit**

Run:

```powershell
pnpm vitest run src/features/lessons/lesson-section-navigation.test.tsx src/features/lessons/lesson-shell.test.tsx
pnpm exec playwright test tests/e2e/lesson.spec.ts --grep "representative beginner lesson|hydrates the lesson"
```

```bash
git add src/features/lessons/lesson-section-navigation.tsx src/features/lessons/lesson-section-navigation.test.tsx src/features/lessons/lesson-shell.tsx src/features/lessons/lesson-shell.test.tsx src/content/networking-foundations/how-networks-communicate.mdx src/app/globals.css tests/e2e/lesson.spec.ts
git commit -m "feat: add lesson section navigation"
```

---

### Task 6: Add Production Browser Coverage and Verify the Phase

**Files:**
- Modify: `tests/e2e/lesson.spec.ts`
- Modify: `tests/e2e/pathway.spec.ts`

**Interfaces:**
- Consumes: complete Phase 1 route/UI behavior.
- Produces: desktop/mobile/no-JavaScript acceptance evidence.

- [ ] **Step 1: Add desktop curriculum assertions**

Scope to the visible desktop container and assert `Networking Essentials`, `Network Security Fundamentals`, current published link with `aria-current`, `Hosts and Network Devices`, `Coming later`, and `Palo Alto Basics`.

```ts
const desktop = page.locator(".lesson-curriculum--desktop");
await expect(desktop.getByText("Networking Essentials")).toBeVisible();
await expect(desktop.getByRole("link", { name: /how networks communicate/i })).toHaveAttribute("aria-current", "page");
await expect(desktop.getByText("Palo Alto Basics")).toBeVisible();
```

- [ ] **Step 2: Add mobile disclosure and overflow assertions**

```ts
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("/learn/networking-foundations/how-networks-communicate");
const contents = page.locator("details.lesson-curriculum--mobile");
await contents.locator("summary").click();
await expect(contents.getByRole("navigation", { name: "Course curriculum" })).toBeVisible();
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
expect(overflow).toBe(false);
```

- [ ] **Step 3: Extend no-JavaScript coverage**

In the existing disabled-JavaScript context, set the native details `open` attribute when required, then verify the current published link, module title, upcoming title, and `Coming later` remain readable.

- [ ] **Step 4: Update pathway coverage**

Assert all six module headings in DOM order, only `How Networks Communicate` as a published lesson link, and separate NAT, Firewall, and Palo Alto lesson rows.

- [ ] **Step 5: Run focused E2E**

Run: `pnpm exec playwright test tests/e2e/lesson.spec.ts tests/e2e/pathway.spec.ts`

Expected: every desktop/mobile case passes with no overflow or hydration errors.

- [ ] **Step 6: Run full verification**

```powershell
node node_modules\vitest\vitest.mjs run --configLoader runner
pnpm typecheck
pnpm lint
pnpm build
pnpm exec playwright test
```

Expected: all tests pass; typecheck/lint/build exit 0; the lesson route is SSG; all browser projects pass.

- [ ] **Step 7: Inspect scope and commit**

```bash
git diff --check main...HEAD
git status --short
git add tests/e2e/lesson.spec.ts tests/e2e/pathway.spec.ts
git commit -m "test: cover curriculum navigation journey"
```

Expected: generated `.pnpm-store/`, `.next/`, `node_modules/`, and test artifacts are not staged.

---

## Completion Criteria

- Six approved modules and lesson placements are catalog-validated.
- The published lesson has no hydration or invalid HTML/SVG warning.
- Full curriculum navigation works on desktop and in mobile `Course contents`.
- Current, published, upcoming, free, and premium states are explicit and accessible.
- `On this page` links resolve to unique explicit IDs.
- Previous/Next behavior remains correct.
- JavaScript-disabled curriculum and lesson content remain readable.
- Unit, type, lint, production build, and full desktop/mobile browser suites pass.
- Final whole-branch review has no unaddressed Critical or Important finding.

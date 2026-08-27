# Content Site Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify a deployable public learning website with a typed curriculum, course navigation, free lessons, premium previews, and one complete representative networking lesson.

**Architecture:** Use the Next.js App Router with Server Components for public pages and local MDX for lesson bodies. Keep curriculum metadata in typed TypeScript modules validated by Zod; presentation components consume domain objects rather than reading files directly. This phase has no database, authentication, payment, analytics vendor, or animation engine dependency.

**Tech Stack:** Node.js 22 LTS, npm, Next.js App Router, React, TypeScript strict mode, MDX, Zod, CSS Modules/global CSS, Vitest, Testing Library, Playwright, ESLint.

**Spec:** `docs/superpowers/specs/2026-08-27-network-learning-platform-design.md`

## Global Constraints

- The MVP launch window is six to eight weeks; exclude subscriptions, certificates, community, real labs, and instructor dashboards.
- The initial pathway is Networking Foundations and contains approximately 10–12 lessons.
- Every lesson follows the approved hybrid lesson structure and remains usable without video.
- Content, route slugs, and products use stable identifiers that do not depend on display titles.
- Public pages and lesson reading must work without authentication or external services.
- Premium content is represented by a preview boundary in this plan; actual ownership enforcement is implemented only in the commerce plan.
- Use Server Components by default; add `"use client"` only to components that require browser state.
- Keep lesson content readable when JavaScript is disabled.
- Meet keyboard, responsive, and reduced-motion requirements from the specification.
- Never store credentials in the repository; `.env*` remains ignored except `.env.example`.

## File Structure

- `src/app/` — routes, metadata, layouts, and global styles only.
- `src/content/networking-foundations/` — MDX lesson bodies, one file per lesson.
- `src/features/catalog/` — curriculum schemas, repository, queries, and catalogue UI.
- `src/features/lessons/` — lesson layout, block components, premium preview, and navigation.
- `src/components/` — site-wide header, footer, and small shared primitives.
- `src/test/` — test setup and fixtures.
- `tests/e2e/` — browser journeys.
- `public/downloads/` — later packet captures; this plan adds only a README describing the boundary.

---

### Task 1: Application foundation and verification harness

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/test/setup.ts`
- Create: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: none.
- Produces: npm scripts `dev`, `build`, `lint`, `typecheck`, `test`, and `test:e2e`; root layout and public home route.

- [ ] **Step 1: Scaffold the application without overwriting project documentation**

Run from the repository root:

```powershell
npx create-next-app@latest work/scaffold --ts --eslint --app --src-dir --use-npm --import-alias "@/*" --no-tailwind
```

Copy only the generated application/configuration files into the repository. Do not copy its `.git` directory or overwrite `.gitignore`, `docs/`, or the approved specification. Delete `work/scaffold` after confirming the copied files.

- [ ] **Step 2: Add the test dependencies and scripts**

Run:

```powershell
npm install zod
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react playwright @playwright/test
npx playwright install chromium
```

Set these exact scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 3: Write the failing public-home browser test**

Create `tests/e2e/home.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("introduces the beginner networking pathway", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /understand how networks really work/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /start networking foundations/i })).toHaveAttribute(
    "href",
    "/paths/networking-foundations",
  );
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/home.spec.ts`

Expected: FAIL because the required heading and pathway link do not exist.

- [ ] **Step 5: Implement the root layout and minimal home page**

Create a semantic root layout with metadata title `Network Learning Platform` and a home page containing the tested heading and a Next.js `Link` to `/paths/networking-foundations`. Add global theme tokens for background, foreground, muted text, accent, borders, content width, and focus rings; support light and dark color schemes and `prefers-reduced-motion`.

- [ ] **Step 6: Configure unit and browser test runners**

Use `jsdom`, `src/test/setup.ts`, and Testing Library matchers in `vitest.config.ts`. Configure Playwright to start `npm run dev` on `http://127.0.0.1:3000`, test Chromium at desktop and a 390×844 mobile viewport, retain traces on first retry, and fail on test-only `.only` in CI.

- [ ] **Step 7: Run the foundation checks**

Run:

```powershell
npm run lint
npm run typecheck
npm run test
npm run test:e2e -- tests/e2e/home.spec.ts
npm run build
```

Expected: all commands exit 0; the browser test passes at desktop and mobile sizes.

- [ ] **Step 8: Commit**

```powershell
git add package.json package-lock.json next.config.ts tsconfig.json eslint.config.mjs vitest.config.ts playwright.config.ts src tests
git commit -m "chore: scaffold tested learning site"
```

---

### Task 2: Typed curriculum model and repository

**Files:**
- Create: `src/features/catalog/catalog.types.ts`
- Create: `src/features/catalog/catalog.schema.ts`
- Create: `src/features/catalog/catalog.data.ts`
- Create: `src/features/catalog/catalog.repository.ts`
- Test: `src/features/catalog/catalog.repository.test.ts`

**Interfaces:**
- Consumes: Zod.
- Produces: `Pathway`, `Module`, `LessonSummary`, `AccessLevel`; `getPathway(pathwaySlug)`, `getLesson(pathwaySlug, lessonSlug)`, `listPublishedLessons(pathwaySlug)`, and `getAdjacentLessons(pathwaySlug, lessonSlug)`.

- [ ] **Step 1: Write failing repository tests**

```ts
import { describe, expect, it } from "vitest";
import { getAdjacentLessons, getLesson, getPathway, listPublishedLessons } from "./catalog.repository";

describe("catalog repository", () => {
  it("returns the networking pathway by stable slug", () => {
    expect(getPathway("networking-foundations").id).toBe("path_networking_foundations");
  });

  it("keeps lessons in module order", () => {
    expect(listPublishedLessons("networking-foundations").map((lesson) => lesson.slug).slice(0, 3)).toEqual([
      "how-networks-communicate",
      "hosts-and-network-devices",
      "osi-and-tcp-ip-models",
    ]);
  });

  it("returns stable previous and next navigation", () => {
    const adjacent = getAdjacentLessons("networking-foundations", "hosts-and-network-devices");
    expect(adjacent.previous?.slug).toBe("how-networks-communicate");
    expect(adjacent.next?.slug).toBe("osi-and-tcp-ip-models");
  });

  it("throws a typed not-found error for unknown lessons", () => {
    expect(() => getLesson("networking-foundations", "missing")).toThrowError("LESSON_NOT_FOUND");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/features/catalog/catalog.repository.test.ts`

Expected: FAIL because the repository modules do not exist.

- [ ] **Step 3: Define the domain types and Zod schema**

Define these exact shapes:

```ts
export type AccessLevel = "free" | "premium";

export type LessonSummary = {
  id: string;
  slug: string;
  title: string;
  objective: string;
  access: AccessLevel;
  published: boolean;
  estimatedMinutes: number;
};

export type Module = {
  id: string;
  slug: string;
  title: string;
  description: string;
  lessons: LessonSummary[];
};

export type Pathway = {
  id: string;
  slug: string;
  title: string;
  description: string;
  audience: string;
  modules: Module[];
};
```

Require stable IDs to match `/^(path|module|lesson)_[a-z0-9_]+$/`, slugs to match `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, non-empty learner-facing text, and `estimatedMinutes` from 1 through 60.

- [ ] **Step 4: Add the 12-lesson curriculum metadata**

Create one `networking-foundations` pathway with the 12 approved topics in the approved order. Mark the first three lessons `free`, the remaining nine `premium`, and only the first representative lesson `published: true` until its full content passes review. Use stable IDs independent of titles.

- [ ] **Step 5: Implement repository queries**

Validate `catalog.data.ts` once at module load. Flatten lessons only inside repository functions. Throw `new Error("PATHWAY_NOT_FOUND")` or `new Error("LESSON_NOT_FOUND")` for unknown stable slugs. Filter unpublished lessons from public list queries. Return `undefined` for a missing previous/next boundary.

- [ ] **Step 6: Run tests and static checks**

Run:

```powershell
npm test -- src/features/catalog/catalog.repository.test.ts
npm run typecheck
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit**

```powershell
git add src/features/catalog
git commit -m "feat: add typed networking curriculum"
```

---

### Task 3: Public site shell and pathway catalogue

**Files:**
- Create: `src/components/site-header.tsx`
- Create: `src/components/site-footer.tsx`
- Create: `src/features/catalog/pathway-overview.tsx`
- Create: `src/features/catalog/module-list.tsx`
- Create: `src/app/paths/[pathwaySlug]/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Test: `src/features/catalog/pathway-overview.test.tsx`
- Test: `tests/e2e/pathway.spec.ts`

**Interfaces:**
- Consumes: `getPathway()` and `listPublishedLessons()` from Task 2.
- Produces: navigable public pathway page at `/paths/networking-foundations` and shared site chrome.

- [ ] **Step 1: Write failing pathway component and browser tests**

Component assertion:

```tsx
render(<PathwayOverview pathway={getPathway("networking-foundations")} />);
expect(screen.getByRole("heading", { name: "Networking Foundations" })).toBeVisible();
expect(screen.getByText(/complete beginners/i)).toBeVisible();
expect(screen.getAllByRole("listitem")).toHaveLength(12);
```

Browser assertion:

```ts
test("opens a published free lesson from the pathway", async ({ page }) => {
  await page.goto("/paths/networking-foundations");
  await page.getByRole("link", { name: /how networks communicate/i }).click();
  await expect(page).toHaveURL(/\/learn\/networking-foundations\/how-networks-communicate$/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npm test -- src/features/catalog/pathway-overview.test.tsx
npm run test:e2e -- tests/e2e/pathway.spec.ts
```

Expected: FAIL because the components and route do not exist.

- [ ] **Step 3: Implement accessible shared navigation**

Add a skip link, logo/home link, Learning Paths navigation, and Pricing navigation. Keep mobile navigation functional without custom JavaScript by using a compact wrapping layout rather than a hidden hamburger in this phase. Add a footer with About, Contact, Privacy, and Terms placeholders that link only to routes implemented in this task or use disabled plain text; do not create dead links.

- [ ] **Step 4: Implement the pathway page**

Render the pathway title, audience, description, modules, ordered lessons, estimated duration, and `Free` or `Premium` text labels. Published lessons are links. Unpublished lessons display `Coming later` and are not interactive. Generate page metadata from the validated pathway.

- [ ] **Step 5: Run tests at mobile and desktop widths**

Run:

```powershell
npm test -- src/features/catalog/pathway-overview.test.tsx
npm run test:e2e -- tests/e2e/pathway.spec.ts
npm run typecheck
npm run lint
```

Expected: all commands exit 0 and no horizontal page overflow occurs at 390 px.

- [ ] **Step 6: Commit**

```powershell
git add src/components src/features/catalog src/app tests/e2e/pathway.spec.ts
git commit -m "feat: add public networking pathway"
```

---

### Task 4: MDX lesson rendering and reusable learning blocks

**Files:**
- Create: `next.config.ts` MDX configuration
- Create: `mdx-components.tsx`
- Create: `src/features/lessons/lesson-shell.tsx`
- Create: `src/features/lessons/learning-objective.tsx`
- Create: `src/features/lessons/knowledge-check.tsx`
- Create: `src/features/lessons/interview-scenario.tsx`
- Create: `src/features/lessons/wireshark-check.tsx`
- Create: `src/features/lessons/premium-preview.tsx`
- Create: `src/features/lessons/lesson-content.repository.ts`
- Create: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.tsx`
- Test: `src/features/lessons/lesson-shell.test.tsx`
- Test: `src/features/lessons/knowledge-check.test.tsx`

**Interfaces:**
- Consumes: catalog repository types and adjacency queries.
- Produces: `LessonShell`, `LearningObjective`, `KnowledgeCheck`, `InterviewScenario`, `WiresharkCheck`, `PremiumPreview`, and `loadLessonContent(pathwaySlug, lessonSlug)`.

- [ ] **Step 1: Install and configure official MDX support**

Run:

```powershell
npm install @next/mdx @mdx-js/loader @mdx-js/react
npm install --save-dev @types/mdx
```

Configure `@next/mdx` for `.mdx` page extensions and provide `mdx-components.tsx`. Do not enable the experimental Rust MDX compiler.

- [ ] **Step 2: Write failing learning-block tests**

```tsx
it("reveals a knowledge-check explanation only after an answer", async () => {
  const user = userEvent.setup();
  render(
    <KnowledgeCheck
      question="Which table maps an IP address to a MAC address?"
      options={["Routing table", "ARP table", "MAC address table"]}
      correctIndex={1}
      explanation="ARP resolves an IPv4 address to a link-layer address."
    />,
  );
  expect(screen.queryByText(/arp resolves/i)).not.toBeInTheDocument();
  await user.click(screen.getByRole("radio", { name: "ARP table" }));
  await user.click(screen.getByRole("button", { name: "Check answer" }));
  expect(screen.getByText(/arp resolves/i)).toBeVisible();
});
```

Also test that `LessonShell` renders the learning objective before lesson content and exposes previous/next links with their accessible names.

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- src/features/lessons`

Expected: FAIL because the learning components do not exist.

- [ ] **Step 4: Implement learning blocks**

Use semantic `section`, `fieldset`, `legend`, `details`, and `aside` elements. `KnowledgeCheck` may be a Client Component; all static blocks remain Server Components. `WiresharkCheck` accepts exact props `filter`, `fields`, `normalEvidence`, `exercise`, and optional `downloadHref`. `PremiumPreview` renders teaser children and a link to `/pricing`; it must not claim that client-side hiding is secure ownership enforcement.

- [ ] **Step 5: Implement explicit lesson loading**

Create an import map rather than a free-form dynamic path:

```ts
const lessonImports = {
  "networking-foundations/how-networks-communicate": () =>
    import("@/content/networking-foundations/how-networks-communicate.mdx"),
} as const;
```

`loadLessonContent()` must reject any key not in the map with `LESSON_CONTENT_NOT_FOUND`. The route must call `notFound()` for unknown, unpublished, or missing-content lessons.

- [ ] **Step 6: Run tests and build**

Run:

```powershell
npm test -- src/features/lessons
npm run typecheck
npm run lint
npm run build
```

Expected: all commands exit 0 and the lesson route is statically generated.

- [ ] **Step 7: Commit**

```powershell
git add package.json package-lock.json next.config.ts mdx-components.tsx src/features/lessons src/app/learn
git commit -m "feat: add reusable lesson experience"
```

---

### Task 5: Representative lesson and premium pathway preview

**Files:**
- Create: `src/content/networking-foundations/how-networks-communicate.mdx`
- Create: `src/app/pricing/page.tsx`
- Create: `src/app/about/page.tsx`
- Create: `src/app/contact/page.tsx`
- Create: `src/app/privacy/page.tsx`
- Create: `src/app/terms/page.tsx`
- Create: `public/downloads/README.md`
- Test: `tests/e2e/lesson.spec.ts`
- Test: `tests/e2e/navigation.spec.ts`

**Interfaces:**
- Consumes: lesson blocks and content loader from Task 4.
- Produces: one complete free lesson, transparent pre-commerce pricing page, valid site-footer routes, and end-to-end public journey.

- [ ] **Step 1: Write the failing complete-lesson browser test**

```ts
test("completes the representative beginner lesson", async ({ page }) => {
  await page.goto("/learn/networking-foundations/how-networks-communicate");
  await expect(page.getByRole("heading", { level: 1, name: "How Networks Communicate" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Learning objective" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Basic Wireshark check" })).toBeVisible();
  await expect(page.getByRole("group", { name: /knowledge check/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Interview scenario" })).toBeVisible();
  await expect(page.getByRole("link", { name: /next lesson/i })).toBeVisible();
});
```

- [ ] **Step 2: Run the browser test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/lesson.spec.ts`

Expected: FAIL because the representative MDX lesson does not exist.

- [ ] **Step 3: Author the representative lesson**

Write original beginner-friendly content explaining source, destination, medium, protocol rules, frames/packets, and why devices make forwarding decisions. Include:

- Objective: explain the minimum decisions required to move data between two hosts.
- A static PC → switch → router → server diagram as accessible HTML/SVG with text alternative.
- A static animation notice that clearly says the interactive packet journey arrives in Plan 2 while the current diagram remains fully instructional.
- A Wireshark check using display filter `arp or icmp`, fields `eth.src`, `eth.dst`, `arp.opcode`, `ip.src`, `ip.dst`, and `icmp.type`, with no download link until a validated capture exists.
- One knowledge check with an evidence-based explanation.
- Interview scenario: “What happens after a user enters a website address?” limited to the concepts taught so far, with a layered reasoning answer.
- A premium preview for the deeper packet analysis and a next-lesson link.

- [ ] **Step 4: Implement honest pre-commerce pricing and legal/support pages**

Pricing must describe free lessons, individual premium modules, and complete-pathway access without displaying invented prices or a functioning purchase button. Use `Premium modules are opening after the learning preview` and an email/contact link. Privacy must state that the local MVP has no account or payment collection yet; Terms must not claim unavailable services. These pages will be replaced with reviewed business copy before commerce launches.

- [ ] **Step 5: Add full public navigation tests**

Test that header/footer links return successful pages, unknown lessons return 404, premium unpublished lesson routes return 404, and the representative lesson remains readable with JavaScript disabled in a separate Playwright browser context.

- [ ] **Step 6: Run the complete phase-one verification**

Run:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Expected: all commands exit 0 across configured desktop and mobile projects; no unresolved route or content-loader errors occur.

- [ ] **Step 7: Review against the approved scope**

Confirm the phase contains no Supabase, Stripe, subscription, certificate, community, real-lab, or analytics-vendor dependency. Confirm all 12 lessons have metadata but only reviewed lesson content is publicly reachable.

- [ ] **Step 8: Commit**

```powershell
git add src/content src/app public/downloads tests/e2e
git commit -m "feat: publish first networking lesson"
```

---

## Phase Completion Gate

Before starting the packet-animation plan:

1. Run the full verification commands in Task 5 and retain the output.
2. Review the representative lesson for networking accuracy and beginner comprehension.
3. Inspect the desktop and mobile pathway and lesson pages.
4. Deploy a preview build and repeat the public navigation test against the preview URL.
5. Record content, usability, and visual corrections as bounded follow-up work; do not add Plan 2 scope during this gate.

## Implementation References

- Next.js App Router: https://nextjs.org/docs/app
- Next.js MDX guide: https://nextjs.org/docs/app/guides/mdx
- Vitest test guide: https://vitest.dev/guide/learn/writing-tests
- Playwright testing practices: https://playwright.dev/docs/best-practices

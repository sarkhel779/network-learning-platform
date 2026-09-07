# Packetsecrets Search and Access Foundation Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give every lesson a stable search-friendly public surface and an explicit public/account/Pro content contract while preserving the existing Packetsecrets design.

**Architecture:** Extend the catalog with lesson SEO and ordered access sections. The lesson page remains one canonical URL and server-renders the public introduction, static player explanation, and interactive player. Locked account and Pro summaries are metadata only; their bodies live in separate modules and are not imported for anonymous requests.

**Tech Stack:** Next.js App Router, React Server Components, MDX, Zod, Vitest, Playwright.

---

## Task 1: Replace the binary course label with section access metadata

**Files:**
- Modify: `src/features/catalog/catalog.types.ts`
- Modify: `src/features/catalog/catalog.schema.ts`
- Modify: `src/features/catalog/catalog.schema.test.ts`

**Step 1: Write the failing schema tests**

Add cases proving `public`, `account`, and `pro` are accepted, an unknown value is rejected, section IDs remain unique, and a Pro section requires a non-empty preview.

```ts
expect(() => lessonSectionSchema.parse({
  id: "rfc-and-vendor-deep-dive",
  label: "Pro Deep Dive",
  access: "pro",
  preview: "Connect the standard to read-only vendor checks.",
})).not.toThrow();
```

**Step 2: Run the focused test and confirm failure**

Run: `pnpm vitest run src/features/catalog/catalog.schema.test.ts`
Expected: FAIL because access-block metadata is unsupported.

**Step 3: Implement the shared types and schema**

```ts
export type ContentAccess = "public" | "account" | "pro";

export type LessonSection = {
  id: string;
  label: string;
  access: ContentAccess;
  preview?: string;
};

export type LessonSeo = {
  title: string;
  description: string;
};
```

Export `lessonSectionSchema` for direct testing. In `superRefine`, require `preview` for Pro sections and reject a transition back to a lower access level after an account or Pro section.

**Step 4: Run tests**

Run: `pnpm vitest run src/features/catalog/catalog.schema.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/catalog
git commit -m "feat: model lesson access sections"
```

## Task 2: Update the curriculum and remove Palo Alto Basics

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/lessons/curriculum-navigation.test.tsx`

**Step 1: Write failing expectations**

Assert that all three published lessons have SEO metadata, access proceeds `public -> account -> pro`, and no foundational lesson slug or title contains `palo-alto`.

**Step 2: Run focused tests**

Run: `pnpm vitest run src/features/catalog/catalog.repository.test.ts src/features/lessons/curriculum-navigation.test.tsx`
Expected: FAIL on missing metadata and existing Palo Alto lesson.

**Step 3: Update catalog records**

Keep current public player section IDs public. Mark Wireshark, knowledge-check, and interview material as `account`. Append one locked Pro navigation entry:

```ts
{
  id: "pro-deep-dive",
  label: "Pro Deep Dive",
  access: "pro",
  preview: "Check the governing RFC and relevant read-only vendor diagnostics.",
}
```

Delete `lesson_palo_alto_basics` from Network Security Fundamentals. Change upcoming foundational lesson availability from the obsolete `premium` label to the neutral publication state used by navigation.

**Step 4: Run tests and commit**

Run: `pnpm vitest run src/features/catalog`
Expected: PASS.

```bash
git add src/features/catalog src/features/lessons/curriculum-navigation.test.tsx
git commit -m "content: align foundations with freemium curriculum"
```

## Task 3: Split authorized lesson bodies at the module boundary

**Files:**
- Create: `src/features/lessons/lesson-content.types.ts`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Create: `src/features/lessons/lesson-content.repository.test.ts`
- Move: each existing lesson MDX into `.public.mdx` and `.account.mdx`

**Step 1: Write a failing repository test**

```ts
const result = await loadAuthorizedLessonContent(key, "anonymous");
expect(result.public).toBeDefined();
expect(result.account).toBeUndefined();
expect(result.pro).toBeUndefined();
```

Also inspect the returned object recursively and assert protected test sentinel strings are absent.

**Step 2: Run and observe failure**

Run: `pnpm vitest run src/features/lessons/lesson-content.repository.test.ts`
Expected: FAIL because the repository imports one complete MDX body.

**Step 3: Implement explicit loaders**

```ts
import "server-only";

type ViewerAccess = "anonymous" | "account" | "pro";
type LessonBlockLoaders = {
  public: LessonContentImport;
  account?: LessonContentImport;
  pro?: LessonContentImport;
};

export async function loadAuthorizedLessonContent(
  key: LessonContentKey,
  access: ViewerAccess,
) {
  const blocks = lessonImports[key];
  return {
    public: await blocks.public(),
    account: access !== "anonymous" && blocks.account ? await blocks.account() : undefined,
    pro: access === "pro" && blocks.pro ? await blocks.pro() : undefined,
  };
}
```

Do not use a barrel file that statically imports all MDX blocks.

**Step 4: Split the three lesson documents**

The public documents end after their meaningful interactive experience. Move Wireshark checks, quizzes, interview answers, and concluding practice into account documents without changing wording or visual components.

**Step 5: Run content and repository tests**

Run: `pnpm vitest run src/content src/features/lessons/lesson-content.repository.test.ts`
Expected: PASS.

**Step 6: Commit**

```bash
git add src/content src/features/lessons
git commit -m "refactor: separate lesson access blocks"
```

## Task 4: Render the anonymous acquisition experience

**Files:**
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.tsx`
- Modify: `src/features/lessons/lesson-shell.tsx`
- Create: `src/features/lessons/registration-boundary.tsx`
- Modify: `src/features/lessons/lesson-section-navigation.tsx`
- Add/modify matching component tests

**Step 1: Write failing rendering tests**

Assert the public block and player render before a registration card; the card says “No payment required”; account and Pro navigation entries include textual access labels; and protected body sentinels do not render.

**Step 2: Run the focused tests**

Run: `pnpm vitest run src/features/lessons src/app/learn`
Expected: FAIL.

**Step 3: Implement the boundary**

```tsx
export function RegistrationBoundary({ returnTo }: { returnTo: string }) {
  return (
    <section aria-labelledby="continue-free">
      <p className="eyebrow">Free account</p>
      <h2 id="continue-free">Continue this lesson for free</h2>
      <p>Unlock the remaining explanation, Wireshark checks, quizzes,
        interview answers, and saved progress. No payment required.</p>
      <Link href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`}>
        Continue with Google or email
      </Link>
    </section>
  );
}
```

Until Plan 2 lands, `/sign-in` presents the approved methods as “coming in the identity phase”; it must not simulate authentication.

**Step 4: Render authorized blocks in order**

The server page computes the canonical lesson path, loads anonymous content, and passes catalog section access to the shell. Locked entries are buttons only when they open explanatory UI; otherwise render text, not dead links.

**Step 5: Verify tests and commit**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: all pass.

```bash
git add src/app src/features/lessons
git commit -m "feat: add player-first registration boundary"
```

## Task 5: Add canonical SEO, sitemap, and structured data

**Files:**
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.tsx`
- Create: `src/app/sitemap.ts`
- Create: `src/features/seo/lesson-structured-data.ts`
- Create tests beside each module

**Step 1: Write failing metadata tests**

Test canonical URL, unique title/description, published-only sitemap entries, `LearningResource`, `isAccessibleForFree: true`, and `hasPart` entries that mark account/Pro gated parts.

**Step 2: Implement server metadata**

```ts
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lesson = getPublishedLesson(await params);
  const path = `/learn/${lesson.pathwaySlug}/${lesson.slug}`;
  return {
    title: lesson.seo.title,
    description: lesson.seo.description,
    alternates: { canonical: path },
  };
}
```

Serialize JSON-LD with `JSON.stringify(data).replace(/</g, "\\u003c")` and derive it only from validated catalog metadata.

**Step 3: Run verification**

Run: `pnpm test && pnpm build`
Expected: PASS, with every published lesson statically discoverable.

**Step 4: Add E2E coverage**

Add a search-style direct navigation test, a no-JavaScript public-content test, and assertions that page HTML lacks protected sentinel strings.

Run: `pnpm test:e2e -- tests/e2e/lesson-access.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app src/features/seo tests/e2e
git commit -m "feat: make public lessons search discoverable"
```

## Final verification

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm build && pnpm test:e2e`

Confirm manually at 360 px and desktop in light/dark/system themes:
- public player works before registration;
- account and Pro body text is absent from page source and network payloads;
- the registration card follows, rather than covers, the player;
- Palo Alto Basics no longer appears in Networking Foundations.


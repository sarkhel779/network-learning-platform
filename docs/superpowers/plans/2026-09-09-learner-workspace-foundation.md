# Learner Workspace Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-shaped Supabase authentication, user-owned learner profiles, stable lesson target identifiers, and a reusable responsive learner-workspace toolbar and drawer shell.

**Architecture:** Next.js server code resolves the authenticated Supabase user and passes a minimal immutable viewer model into the client-side workspace shell. Supabase Auth owns Google and email magic-link identity; a public profile table, protected by row-level security, stores non-secret learner preferences. A single client drawer controller renders Course contents for everyone and account-only tool entry points for authenticated users, while later plans supply the actual progress, notes, bookmarks, practice, glossary, feedback, account, and Pro drawer bodies.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9, Supabase Auth/Postgres/RLS, `@supabase/ssr`, Zod 4, Vitest, Testing Library, Playwright

**Spec:** `docs/superpowers/specs/2026-09-09-learner-workspace-design.md`

## Global Constraints

- Signed-out visitors see only **Course contents**; do not render misleading disabled account tools.
- Opening a workspace tool overlays the lesson and does not change the URL, discard the lesson hash, or permanently reduce lesson width.
- Only one drawer is open at a time.
- Desktop uses the left-edge toolbar and slide-over; narrow screens use one **Learning tools** control and a bottom sheet.
- Focus moves into the drawer and returns to its invoking control; Escape and the backdrop close it.
- Client-supplied user identifiers are never trusted for ownership.
- Every learner-owned record is protected by server authorization and Supabase row-level security.
- Notes and progress are outside this foundation plan; this plan exposes typed extension points for them.
- Google OAuth and email magic links are the only launch sign-in methods.
- No password collection, payment integration, or Pro entitlement implementation belongs in this plan.

## Plan boundaries

The approved specification contains five independently reviewable systems. This document implements only **Stage 1 — Identity and workspace foundation**. The following plans are intentionally created only after this foundation is merged:

1. learner progress and My learning;
2. Notes, Bookmarks, Save for later, and revision markers;
3. Practice, Glossary, Feedback, and Account settings;
4. Pro Member Waitlist and entitlement-ready previews.

## File structure

### Authentication and data ownership

- Create `src/lib/env/public-env.ts` — validates browser-safe Supabase configuration.
- Create `src/lib/supabase/browser.ts` — creates the browser Supabase client.
- Create `src/lib/supabase/server.ts` — creates the request-scoped server client from cookies.
- Create `src/lib/supabase/middleware.ts` — refreshes expired sessions without trusting cookie contents.
- Create `src/middleware.ts` — applies session refresh to lesson and account routes.
- Create `src/middleware.test.ts` — verifies matcher scope and safe anonymous fallback.
- Create `src/lib/supabase/session.ts` — maps Supabase users into the minimal `Viewer` model.
- Create `src/lib/supabase/session.test.ts` — tests safe viewer mapping.
- Create `src/app/auth/callback/route.ts` — exchanges OAuth or magic-link codes and validates `next`.
- Create `src/app/auth/callback/route.test.ts` — tests callback success and safe fallback behaviour.
- Create `src/features/auth/sign-in-form.tsx` — starts Google or magic-link authentication.
- Create `src/features/auth/sign-in-form.test.tsx` — tests validation, pending, and error states.
- Modify `src/app/sign-in/page.tsx` — replaces the placeholder with the real form.
- Modify `src/app/sign-in/page.test.tsx` — preserves return-path safety and verifies the real methods.
- Create `supabase/migrations/202609090001_create_learner_profiles.sql` — profile schema, trigger, grants, and RLS.
- Create `supabase/tests/learner_profiles_rls.sql` — proves cross-account isolation at the database policy level.
- Create `.env.example` — documents required public configuration without secrets.

### Stable learning targets

- Modify `src/features/catalog/catalog.types.ts` — adds stable target IDs to sections.
- Modify `src/features/catalog/catalog.schema.ts` — validates stable target ID syntax and uniqueness.
- Modify `src/features/catalog/catalog.data.ts` — assigns stable IDs to every existing lesson section.
- Modify `src/features/catalog/catalog.schema.test.ts` — tests invalid and duplicate target IDs.
- Modify `src/features/catalog/catalog.repository.test.ts` — verifies IDs survive repository lookup.

### Workspace presentation

- Create `src/features/learner-workspace/learner-workspace.types.ts` — shared viewer and tool contracts.
- Create `src/features/learner-workspace/workspace-tools.ts` — ordered signed-in tool definitions.
- Create `src/features/learner-workspace/workspace-tools.test.ts` — verifies order and access visibility.
- Create `src/features/learner-workspace/workspace-drawer.tsx` — reusable focus-managed overlay/bottom sheet.
- Create `src/features/learner-workspace/workspace-drawer.test.tsx` — verifies focus, Escape, backdrop, and one-title semantics.
- Create `src/features/learner-workspace/learner-workspace.tsx` — owns one active drawer and responsive toolbar controls.
- Create `src/features/learner-workspace/learner-workspace.test.tsx` — verifies anonymous and authenticated tool sets and switching.
- Modify `src/features/lessons/course-contents-drawer.tsx` — extracts content for the shared shell while retaining its public API during migration.
- Modify `src/features/lessons/course-contents-drawer.test.tsx` — preserves existing behaviour during extraction.
- Modify `src/features/lessons/lesson-shell.tsx` — resolves the workspace around the lesson.
- Modify `src/features/lessons/lesson-shell.test.tsx` — tests anonymous and signed-in composition.
- Modify `src/app/learn/[pathwaySlug]/[lessonSlug]/page.tsx` — loads the server-side viewer once.
- Modify `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts` — verifies no protected account data enters public output.
- Modify `src/app/globals.css` — adds responsive toolbar, overlay, and bottom-sheet styling.
- Create `tests/e2e/learner-workspace.spec.ts` — covers desktop, mobile, keyboard, and signed-out behaviour.

---

### Task 1: Add validated Supabase client factories

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `.env.example`
- Create: `src/lib/env/public-env.ts`
- Create: `src/lib/env/public-env.test.ts`
- Create: `src/lib/supabase/browser.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/middleware.ts`
- Create: `src/middleware.test.ts`

**Interfaces:**
- Produces: `getPublicEnv(): { supabaseUrl: string; supabaseAnonKey: string }`
- Produces: `createBrowserSupabaseClient(): SupabaseClient`
- Produces: `createServerSupabaseClient(): Promise<SupabaseClient>`
- Produces: `refreshSupabaseSession(request: NextRequest): Promise<NextResponse>`

- [ ] **Step 1: Add failing environment-validation tests**

```ts
import { describe, expect, it } from "vitest";

import { parsePublicEnv } from "./public-env";

describe("parsePublicEnv", () => {
  it("accepts an HTTPS Supabase URL and public key", () => {
    expect(parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
    })).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "public-anon-key",
    });
  });

  it("rejects missing or non-HTTPS public configuration", () => {
    expect(() => parsePublicEnv({})).toThrow(/Supabase configuration/);
    expect(() => parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "http://example.test",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "key",
    })).toThrow(/Supabase configuration/);
  });
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run: `pnpm test -- src/lib/env/public-env.test.ts`
Expected: FAIL because `parsePublicEnv` does not exist.

- [ ] **Step 3: Install the official Supabase packages**

Run: `pnpm add @supabase/ssr @supabase/supabase-js`

- [ ] **Step 4: Implement strict public configuration parsing**

```ts
import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().startsWith("https://"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export function parsePublicEnv(input: Record<string, string | undefined>) {
  const result = publicEnvSchema.safeParse(input);
  if (!result.success) throw new Error("Supabase configuration is missing or invalid.");
  return {
    supabaseUrl: result.data.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: result.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  } as const;
}

export function getPublicEnv() {
  return parsePublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}
```

- [ ] **Step 5: Implement browser and server factories**

```ts
// src/lib/supabase/browser.ts
import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env/public-env";

export function createBrowserSupabaseClient() {
  const env = getPublicEnv();
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
```

```ts
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicEnv } from "@/lib/env/public-env";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const env = getPublicEnv();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        try {
          values.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies; callback/refresh routes perform writes.
        }
      },
    },
  });
}
```

Create `.env.example` with exactly:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

- [ ] **Step 6: Write failing session-refresh middleware tests**

Mock `createServerClient` and verify that matching lesson/account requests call `auth.getUser()`, copy refreshed cookies to the response, and return an unchanged anonymous response when no session exists. Verify static assets, images, and favicons are excluded by the exported matcher.

- [ ] **Step 7: Implement session refresh**

```ts
// src/middleware.ts
import type { NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/lib/supabase/middleware";

export function middleware(request: NextRequest) {
  return refreshSupabaseSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

`refreshSupabaseSession` creates a `NextResponse.next({ request })`, mirrors every cookie set by Supabase onto both the request and response, then calls `auth.getUser()` to validate and refresh the session. It must never authorize from `getSession()` cookie contents alone.

- [ ] **Step 8: Run focused tests and type checking**

Run: `pnpm test -- src/lib/env/public-env.test.ts src/middleware.test.ts && pnpm typecheck`
Expected: PASS.

- [ ] **Step 9: Commit the client foundation**

```bash
git add package.json pnpm-lock.yaml .env.example src/lib/env src/lib/supabase src/middleware.ts src/middleware.test.ts
git commit -m "feat: add Supabase client foundation"
```

### Task 2: Create learner profiles with row-level ownership

**Files:**
- Create: `supabase/migrations/202609090001_create_learner_profiles.sql`
- Create: `supabase/tests/learner_profiles_rls.sql`

**Interfaces:**
- Produces: `public.learner_profiles(id uuid, display_name text, avatar_url text, learning_level text, career_objective text, created_at timestamptz, updated_at timestamptz)`
- Produces: `public.handle_new_user()` trigger function

- [ ] **Step 1: Write the database policy test first**

```sql
begin;
select plan(4);

set local role postgres;
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
) values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'one@example.test', '', now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'two@example.test', '', now(), now(), now());

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select lives_ok(
  $$ update public.learner_profiles set display_name = 'Learner One' where id = auth.uid() $$,
  'a learner updates their own profile'
);
select is((select count(*) from public.learner_profiles), 1::bigint,
  'a learner sees only their own profile');

select set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select is((select count(*) from public.learner_profiles), 1::bigint,
  'another learner sees only their own profile');
select is_empty(
  $$ update public.learner_profiles set display_name = 'Hijacked'
     where id = '11111111-1111-1111-1111-111111111111' returning id $$,
  'a learner cannot update another profile'
);

select * from finish();
rollback;
```

- [ ] **Step 2: Run the SQL test and verify the red state**

Run: `supabase test db supabase/tests/learner_profiles_rls.sql`
Expected: FAIL because `learner_profiles` does not exist. If the Supabase CLI is unavailable locally, record this test as CI-required and continue only after the migration is reviewed manually.

- [ ] **Step 3: Implement the profile migration**

```sql
create type public.learning_level as enum (
  'beginner', 'graduate', 'it_experienced', 'networking_professional', 'career_switcher'
);

create table public.learner_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  avatar_url text,
  learning_level public.learning_level,
  career_objective text check (char_length(career_objective) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.learner_profiles enable row level security;

create policy "learners read own profile" on public.learner_profiles
for select to authenticated using ((select auth.uid()) = id);
create policy "learners update own profile" on public.learner_profiles
for update to authenticated using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.learner_profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger learner_profiles_set_updated_at
before update on public.learner_profiles
for each row execute procedure public.set_updated_at();

grant select, update on public.learner_profiles to authenticated;
```

- [ ] **Step 4: Run the SQL policy test**

Run: `supabase test db supabase/tests/learner_profiles_rls.sql`
Expected: 4 assertions pass.

- [ ] **Step 5: Commit the owned profile schema**

```bash
git add supabase
git commit -m "feat: protect learner profiles with RLS"
```

### Task 3: Map authenticated users to a minimal viewer

**Files:**
- Create: `src/features/learner-workspace/learner-workspace.types.ts`
- Create: `src/lib/supabase/session.ts`
- Create: `src/lib/supabase/session.test.ts`

**Interfaces:**
- Produces: `type Viewer = Readonly<{ id: string; displayName: string | null; avatarUrl: string | null }>`
- Produces: `getViewer(): Promise<Viewer | null>`

- [ ] **Step 1: Write failing mapper tests**

```ts
import { describe, expect, it } from "vitest";
import { toViewer } from "./session";

describe("toViewer", () => {
  it("returns only workspace-safe identity fields", () => {
    expect(toViewer({
      id: "user-1",
      email: "private@example.com",
      user_metadata: { full_name: "Pranita", avatar_url: "https://example.test/a.png", role: "admin" },
    })).toEqual({ id: "user-1", displayName: "Pranita", avatarUrl: "https://example.test/a.png" });
  });

  it("returns null for no authenticated user", () => expect(toViewer(null)).toBeNull());
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run: `pnpm test -- src/lib/supabase/session.test.ts`
Expected: FAIL because `toViewer` does not exist.

- [ ] **Step 3: Implement the viewer boundary**

```ts
// learner-workspace.types.ts
export type Viewer = Readonly<{
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}>;
```

```ts
// session.ts
import type { User } from "@supabase/supabase-js";
import type { Viewer } from "@/features/learner-workspace/learner-workspace.types";
import { createServerSupabaseClient } from "./server";

export function toViewer(user: Pick<User, "id" | "user_metadata"> | null): Viewer | null {
  if (!user) return null;
  const displayName = typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : null;
  const avatarUrl = typeof user.user_metadata.avatar_url === "string" ? user.user_metadata.avatar_url : null;
  return { id: user.id, displayName, avatarUrl };
}

export async function getViewer(): Promise<Viewer | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return toViewer(user);
}
```

- [ ] **Step 4: Run focused tests and type checking**

Run: `pnpm test -- src/lib/supabase/session.test.ts && pnpm typecheck`
Expected: PASS and no email, token, provider data, or metadata object appears in `Viewer`.

- [ ] **Step 5: Commit the viewer boundary**

```bash
git add src/features/learner-workspace/learner-workspace.types.ts src/lib/supabase/session.ts src/lib/supabase/session.test.ts
git commit -m "feat: expose minimal authenticated viewer"
```

### Task 4: Replace placeholder sign-in with Google and email magic links

**Files:**
- Create: `src/features/auth/return-path.ts`
- Create: `src/features/auth/return-path.test.ts`
- Create: `src/features/auth/sign-in-form.tsx`
- Create: `src/features/auth/sign-in-form.test.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/auth/callback/route.test.ts`
- Modify: `src/app/sign-in/page.tsx`
- Modify: `src/app/sign-in/page.test.tsx`

**Interfaces:**
- Produces: `safeReturnPath(value): string`
- Produces: `<SignInForm returnTo: string />`
- Consumes: `createBrowserSupabaseClient()` and `createServerSupabaseClient()`

- [ ] **Step 1: Extract and test return-path validation**

Move the current allow-list logic into `return-path.ts` and test `/`, pathway routes, published lesson routes, external URLs, protocol-relative URLs, arrays, unpublished routes, and unknown paths.

```ts
expect(safeReturnPath("/learn/networking-foundations/vlans-access-ports-and-trunks"))
  .toBe("/learn/networking-foundations/vlans-access-ports-and-trunks");
expect(safeReturnPath("https://attacker.example")).toBe("/");
expect(safeReturnPath("//attacker.example")).toBe("/");
```

- [ ] **Step 2: Run the return-path test and verify the red state**

Run: `pnpm test -- src/features/auth/return-path.test.ts`
Expected: FAIL because the extracted helper does not exist.

- [ ] **Step 3: Implement and verify the extracted helper**

Run: `pnpm test -- src/features/auth/return-path.test.ts`
Expected: PASS.

- [ ] **Step 4: Write failing sign-in form tests**

Test that the form:

- renders Google and email options;
- rejects an invalid email locally;
- calls `signInWithOAuth({ provider: "google", options: { redirectTo } })`;
- calls `signInWithOtp({ email, options: { emailRedirectTo, shouldCreateUser: true } })`;
- disables repeat submission while pending; and
- displays a neutral response that does not reveal whether an email already exists.

```ts
await user.type(screen.getByLabelText(/email address/i), "learner@example.com");
await user.click(screen.getByRole("button", { name: /email me a sign-in link/i }));
expect(signInWithOtp).toHaveBeenCalledWith(expect.objectContaining({
  email: "learner@example.com",
  options: expect.objectContaining({ shouldCreateUser: true }),
}));
```

- [ ] **Step 5: Run the form tests and verify the red state**

Run: `pnpm test -- src/features/auth/sign-in-form.test.tsx`
Expected: FAIL because `SignInForm` does not exist.

- [ ] **Step 6: Implement the client sign-in form**

Build callback URLs from `window.location.origin`, `/auth/callback`, and an encoded safe `next`. Use a single generic email success message: “If the address can receive mail, check it for your secure sign-in link.” Never collect a password.

- [ ] **Step 7: Write failing callback route tests**

```ts
it("exchanges a valid code and redirects to the allowed lesson", async () => {
  const response = await GET(new Request(
    "https://packetsecrets.test/auth/callback?code=abc&next=%2Fpaths%2Fnetworking-foundations",
  ));
  expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
  expect(response.headers.get("location")).toBe("https://packetsecrets.test/paths/networking-foundations");
});
```

Also verify missing code, exchange failure, external `next`, and unpublished paths redirect safely to `/sign-in?error=authentication` or `/` without exposing provider details.

- [ ] **Step 8: Implement callback exchange and safe redirects**

Use the server client to call `exchangeCodeForSession(code)`. Pass only `safeReturnPath(next)` into `new URL(path, request.url)`.

- [ ] **Step 9: Replace the placeholder page and run auth tests**

Run: `pnpm test -- src/features/auth src/app/sign-in/page.test.tsx src/app/auth/callback/route.test.ts && pnpm typecheck`
Expected: PASS.

- [ ] **Step 10: Commit working passwordless authentication**

```bash
git add src/features/auth src/app/sign-in src/app/auth/callback
git commit -m "feat: add Google and magic-link sign-in"
```

### Task 5: Add stable section target identifiers

**Files:**
- Modify: `src/features/catalog/catalog.types.ts`
- Modify: `src/features/catalog/catalog.schema.ts`
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.schema.test.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`

**Interfaces:**
- Produces: `LessonSection.targetId: string`
- Constraint: target IDs match `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` and are unique within a lesson.

- [ ] **Step 1: Add failing schema tests**

```ts
it("requires unique stable target IDs inside a lesson", () => {
  const catalog = validCatalog();
  catalog.modules[0].lessons[0].sections = [
    { targetId: "same-target", title: "One", access: "public" },
    { targetId: "same-target", title: "Two", access: "account" },
  ];
  expect(pathwayCatalogSchema.safeParse(catalog).success).toBe(false);
});
```

Add a second test rejecting spaces, uppercase characters, and display-title-derived empty values.

- [ ] **Step 2: Run focused catalog tests and verify the red state**

Run: `pnpm test -- src/features/catalog/catalog.schema.test.ts src/features/catalog/catalog.repository.test.ts`
Expected: FAIL because sections do not require `targetId`.

- [ ] **Step 3: Add the type and uniqueness refinement**

```ts
const lessonSectionSchema = z.object({
  targetId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  access: contentAccessSchema,
});
```

In the lesson refinement, compare `new Set(section.targetId)` size with the section count and add a targeted issue at `sections` on duplicates.

- [ ] **Step 4: Assign explicit IDs to every existing section**

Use durable semantic IDs such as `why-vlans-exist`, `interactive-vlan-membership`, and `knowledge-check-summary`. Do not generate IDs from titles at runtime.

- [ ] **Step 5: Verify schema, repository, route, and content tests**

Run: `pnpm test -- src/features/catalog src/app/learn src/content`
Expected: PASS.

- [ ] **Step 6: Commit stable content targets**

```bash
git add src/features/catalog src/app/learn src/content
git commit -m "feat: add stable lesson target identifiers"
```

### Task 6: Extract a reusable, accessible workspace drawer

**Files:**
- Create: `src/features/learner-workspace/workspace-drawer.tsx`
- Create: `src/features/learner-workspace/workspace-drawer.test.tsx`
- Modify: `src/features/lessons/course-contents-drawer.tsx`
- Modify: `src/features/lessons/course-contents-drawer.test.tsx`

**Interfaces:**
- Produces: `<WorkspaceDrawer open title triggerRef onClose children presentation />`
- `presentation` is `"side" | "bottom"`; CSS selects the effective viewport layout without duplicating content.

- [ ] **Step 1: Write failing drawer-shell tests**

Test that an open drawer:

- has one dialog named by its heading;
- focuses its first interactive control;
- cycles Tab and Shift+Tab inside;
- closes on Escape and backdrop selection;
- returns focus to the exact invoking control; and
- renders nothing when closed.

```ts
await user.keyboard("{Escape}");
expect(screen.queryByRole("dialog", { name: "Notes" })).not.toBeInTheDocument();
expect(trigger).toHaveFocus();
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run: `pnpm test -- src/features/learner-workspace/workspace-drawer.test.tsx`
Expected: FAIL because `WorkspaceDrawer` does not exist.

- [ ] **Step 3: Implement the shared drawer shell**

Move the proven focus-trap and focus-return behaviour from `CourseContentsDrawer` into `WorkspaceDrawer`. Accept a `triggerRef` from the controller so switching tools can return focus to the correct control.

- [ ] **Step 4: Migrate Course contents without changing its public behaviour**

Keep `CourseContentsDrawer` as a compatibility wrapper during this task:

```tsx
<WorkspaceDrawer open={open} title="Course contents" triggerRef={triggerRef} onClose={close}>
  <CurriculumNavigation pathway={pathway} currentLessonSlug={currentLessonSlug} onLessonSelect={close} />
</WorkspaceDrawer>
```

- [ ] **Step 5: Run drawer and lesson-shell regression tests**

Run: `pnpm test -- src/features/learner-workspace/workspace-drawer.test.tsx src/features/lessons/course-contents-drawer.test.tsx src/features/lessons/lesson-shell.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit the shared drawer shell**

```bash
git add src/features/learner-workspace src/features/lessons/course-contents-drawer*
git commit -m "refactor: share learner workspace drawer shell"
```

### Task 7: Build the access-aware learner toolbar

**Files:**
- Create: `src/features/learner-workspace/workspace-tools.ts`
- Create: `src/features/learner-workspace/workspace-tools.test.ts`
- Create: `src/features/learner-workspace/learner-workspace.tsx`
- Create: `src/features/learner-workspace/learner-workspace.test.tsx`
- Modify: `src/features/learner-workspace/learner-workspace.types.ts`

**Interfaces:**
- Produces: `type WorkspaceToolId = "course" | "learning" | "notes" | "bookmarks" | "practice" | "glossary" | "feedback" | "account" | "pro"`
- Produces: `getVisibleWorkspaceTools(viewer: Viewer | null): readonly WorkspaceTool[]`
- Produces: `<LearnerWorkspace pathway currentLessonSlug viewer />`

- [ ] **Step 1: Write failing access and ordering tests**

```ts
expect(getVisibleWorkspaceTools(null).map(({ id }) => id)).toEqual(["course"]);
expect(getVisibleWorkspaceTools(viewer).map(({ id }) => id)).toEqual([
  "course", "learning", "notes", "bookmarks", "practice", "glossary",
  "feedback", "account", "pro",
]);
```

- [ ] **Step 2: Run the tool-definition test and verify the red state**

Run: `pnpm test -- src/features/learner-workspace/workspace-tools.test.ts`
Expected: FAIL because the tool registry does not exist.

- [ ] **Step 3: Implement immutable tool definitions**

Each definition includes `id`, `label`, `requiresAccount`, and `group: "learning" | "account"`. Use inline SVG icons with `aria-hidden="true"`; the visible text remains the accessible label.

- [ ] **Step 4: Write failing controller tests**

Test anonymous visibility, authenticated visibility, one open drawer, switching tools, reselect-to-close, Course contents rendering, and placeholder copy that accurately says later tools are not active yet in this foundation branch.

```ts
await user.click(screen.getByRole("button", { name: "Notes" }));
expect(screen.getByRole("dialog", { name: "Notes" })).toBeVisible();
await user.click(screen.getByRole("button", { name: "Bookmarks" }));
expect(screen.queryByRole("dialog", { name: "Notes" })).not.toBeInTheDocument();
expect(screen.getByRole("dialog", { name: "Bookmarks" })).toBeVisible();
```

- [ ] **Step 5: Implement the workspace controller**

Use one `activeToolId: WorkspaceToolId | null` state. Render Course contents with `CurriculumNavigation`. Render signed-in foundation placeholders as honest empty states such as “Your notes will appear here when Notes is added in the personal-tools stage”; do not present controls that pretend to save data.

- [ ] **Step 6: Run workspace component tests**

Run: `pnpm test -- src/features/learner-workspace`
Expected: PASS.

- [ ] **Step 7: Commit the access-aware toolbar**

```bash
git add src/features/learner-workspace
git commit -m "feat: add learner workspace toolbar"
```

### Task 8: Resolve the viewer in the lesson route and compose the workspace

**Files:**
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.tsx`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
- Modify: `src/features/lessons/lesson-shell.tsx`
- Modify: `src/features/lessons/lesson-shell.test.tsx`

**Interfaces:**
- Consumes: `getViewer(): Promise<Viewer | null>`
- Consumes: `<LearnerWorkspace pathway currentLessonSlug viewer />`
- Modifies: `LessonShellProps` to require `viewer: Viewer | null`

- [ ] **Step 1: Add failing composition tests**

Verify that:

- `viewer={null}` exposes only Course contents;
- an authenticated viewer exposes all account tools;
- no viewer email, provider metadata, or access token is rendered; and
- public lesson content remains unchanged.

- [ ] **Step 2: Run route and shell tests and verify the red state**

Run: `pnpm test -- src/features/lessons/lesson-shell.test.tsx src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
Expected: FAIL because the route and shell do not accept a viewer.

- [ ] **Step 3: Compose the server and client boundaries**

Call `getViewer()` once in the lesson route and pass only the returned `Viewer | null` into `LessonShell`. Replace the direct `CourseContentsDrawer` render with `LearnerWorkspace`.

- [ ] **Step 4: Preserve static-generation compatibility explicitly**

Authenticated lesson rendering is request-specific. Remove or adjust any incompatible full-route static-generation assumption only for lesson pages; keep metadata and published lesson path generation deterministic. Add a test proving `generateStaticParams()` still returns the published catalogue while page output resolves the viewer at request time.

- [ ] **Step 5: Run route, shell, SEO, sitemap, and content tests**

Run: `pnpm test -- src/app/learn src/features/lessons src/features/seo src/app/sitemap.test.ts src/content`
Expected: PASS.

- [ ] **Step 6: Commit authenticated lesson composition**

```bash
git add src/app/learn src/features/lessons
git commit -m "feat: compose learner workspace in lessons"
```

### Task 9: Add desktop and mobile workspace presentation

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/theme-styles.test.ts`
- Modify: `src/features/learner-workspace/learner-workspace.test.tsx`

**Interfaces:**
- Consumes the learner-workspace class names from Task 7.
- Produces a left-edge desktop rail at `min-width: 48rem` and one mobile **Learning tools** trigger below that breakpoint.

- [ ] **Step 1: Add failing presentation assertions**

Test for:

- a labelled desktop toolbar;
- one mobile Learning tools control;
- CSS rules that hide the desktop rail below `48rem` and show the mobile trigger;
- a bottom-anchored mobile drawer;
- no fixed width applied to `.lesson-shell`; and
- reduced-motion removal of drawer transitions.

- [ ] **Step 2: Run focused tests and verify the red state**

Run: `pnpm test -- src/features/learner-workspace/learner-workspace.test.tsx src/app/theme-styles.test.ts`
Expected: FAIL because responsive workspace styles do not exist.

- [ ] **Step 3: Implement the responsive styles**

Use logical properties (`inset-inline-start`, `border-inline-end`) and existing colour tokens. Desktop drawers use a bounded width such as `min(26rem, calc(100vw - 2rem))`; mobile sheets use `max-height: min(85dvh, 48rem)` with internal scrolling. Never apply horizontal transforms to `.lesson-shell`.

- [ ] **Step 4: Add reduced-motion and high-contrast states**

Under `prefers-reduced-motion: reduce`, remove drawer transitions. Use borders plus fill changes for selected and badged states so colour is never the only signal.

- [ ] **Step 5: Run presentation and existing drawer tests**

Run: `pnpm test -- src/features/learner-workspace src/features/lessons/course-contents-drawer.test.tsx src/app/theme-styles.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit responsive presentation**

```bash
git add src/app/globals.css src/app/theme-styles.test.ts src/features/learner-workspace
git commit -m "feat: make learner workspace responsive"
```

### Task 10: Add end-to-end learner workspace journeys

**Files:**
- Create: `tests/e2e/learner-workspace.spec.ts`
- Modify: `playwright.config.ts` only if an existing environment override hook is required.

**Interfaces:**
- Tests the server-rendered anonymous flow without external Supabase credentials.
- Tests the signed-in presentation through a deterministic test-only session adapter injected at the server boundary; never bypasses production RLS or ships a test user to the browser.

- [ ] **Step 1: Add failing desktop and keyboard journeys**

```ts
test("opens one workspace drawer and preserves lesson position", async ({ page }) => {
  await page.goto("/learn/networking-foundations/vlans-access-ports-and-trunks#interactive-tag-journey");
  await page.getByRole("button", { name: "Course contents" }).click();
  await expect(page.getByRole("dialog", { name: "Course contents" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/#interactive-tag-journey$/);
  await expect(page.getByRole("button", { name: "Course contents" })).toBeFocused();
});
```

Add authenticated coverage for tool order, Notes-to-Bookmarks switching, and no duplicate dialogs.

- [ ] **Step 2: Add failing 390 px mobile journey**

At a 390 px viewport, verify the desktop toolbar is hidden, Learning tools opens the bottom sheet, every tool is reachable, the document has no horizontal overflow, and closing restores focus.

- [ ] **Step 3: Run the new browser tests and verify the red state**

Run: `pnpm test:e2e -- tests/e2e/learner-workspace.spec.ts`
Expected: FAIL until the signed-in fixture and final responsive details are connected.

- [ ] **Step 4: Add the deterministic signed-in test adapter**

Inject a `Viewer` only when `NODE_ENV === "test"` and a server-only test header established by Playwright is present. Keep the adapter in the test harness, exclude it from production branches with an explicit environment guard, and add a unit test proving it returns `null` outside test mode.

- [ ] **Step 5: Run the focused browser suite**

Run: `pnpm test:e2e -- tests/e2e/learner-workspace.spec.ts`
Expected: all learner-workspace journeys pass in desktop and mobile Chromium projects.

- [ ] **Step 6: Run existing lesson and navigation browser regressions**

Run: `pnpm test:e2e -- tests/e2e/lesson.spec.ts tests/e2e/navigation.spec.ts tests/e2e/lesson-access.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit browser coverage**

```bash
git add tests/e2e/learner-workspace.spec.ts playwright.config.ts src/lib/supabase
git commit -m "test: cover learner workspace journeys"
```

### Task 11: Verify the foundation release candidate

**Files:**
- Modify only files required to resolve verification failures; each correction must receive its own failing regression test.

**Interfaces:**
- Produces a verified foundation ready for review and for the later progress plan.

- [ ] **Step 1: Run all unit and component tests**

Run: `pnpm test`
Expected: every test passes with zero unhandled errors.

- [ ] **Step 2: Run static quality gates**

Run: `pnpm lint && pnpm typecheck && pnpm build`
Expected: all commands exit 0.

- [ ] **Step 3: Run the full browser suite**

Run: `pnpm test:e2e`
Expected: every configured desktop and mobile project passes.

- [ ] **Step 4: Run database policy tests**

Run: `supabase test db`
Expected: all profile ownership assertions pass. If CI owns the Supabase CLI, attach the successful CI job before merge; do not waive the RLS gate.

- [ ] **Step 5: Perform manual accessibility and responsive review**

Check the VLAN lesson at desktop width, 768 px, and 390 px. Verify keyboard-only opening, switching and closing; visible focus; reduced motion; long labels; zoom at 200%; light and dark themes; no horizontal overflow; and preserved hash position.

- [ ] **Step 6: Verify the diff and repository state**

Run: `git diff --check && git status --short && git log --oneline --decorate -12`
Expected: no whitespace errors, no uncommitted generated output, and focused commits corresponding to Tasks 1–10.

- [ ] **Step 7: Record the handoff evidence**

Document exact unit, browser, database, lint, type-check, and build totals in the pull-request description. Do not claim a gate passed without fresh command output.

## Definition of done

This foundation is complete only when a signed-out learner still has the existing Course contents experience, a signed-in learner can authenticate with Google or an email magic link and see the ordered learner toolbar, all tools use one accessible responsive drawer shell, profile ownership is enforced in Postgres, stable content targets exist, and all verification gates pass. Notes, bookmarks, progress, and other tool bodies remain honest placeholders until their dedicated plans are implemented.

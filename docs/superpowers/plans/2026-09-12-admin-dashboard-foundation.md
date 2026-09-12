# Admin Dashboard Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver secure staff and learner dashboards with real account, joined-waitlist, and total-page-view counts plus audited learner profile edits.

**Architecture:** Keep Supabase as the source of truth. PostgreSQL security-definer RPCs enforce staff permissions and expose only narrow aggregates, directory rows, and edits; Next.js server components guard routes and render the dashboard; a first-party navigation beacon records data-minimized page views. The admin UI matches the supplied dark two-column reference and labels disconnected subsystems honestly.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase/PostgreSQL RLS, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-12-admin-dashboard-foundation-design.md`

## Global Constraints

- Never use `?audit=1`, a client-provided role, or the Playwright viewer header as admin authority.
- Never expose the Supabase service-role key to a browser or make it necessary for ordinary admin requests.
- Bootstrap the first `super_admin` by an operator using a verified `auth.users.id`; no self-promotion route.
- Account count is `auth.users`, joined waitlist count is `pro_waitlist_entries.status = 'joined'`, and visitor metric is **total page views**, not unique visitors.
- Page-view rows contain only event ID, normalized path, and timestamp. No IP, query string, cookie, user ID, or fingerprint.
- Account edits are limited to display name, learning level, and internal notes. Suspension remains unavailable until all protected learner access paths enforce it. No refund, impersonation, deletion, paid-plan mutation, or waitlist-consent override.
- An unavailable count is `—`, never `0`. Unbuilt billing/support/course-management functions are explicitly unavailable.
- Protect every admin page server-side and every database read/mutation in PostgreSQL. Keep a usable learner dashboard for signed-in users only.
- Preserve the existing committed homepage/lesson work and keep this implementation off PR #33 until reviewed independently.

## File map

- `supabase/migrations/202609120003_admin_foundation.sql`: staff roles, staff-only dashboard RPCs, learner notes/edit RPC, append-only audit table, and page-view storage/recording RPC.
- `supabase/tests/admin_foundation_rls.sql` and `supabase/migrations/admin-foundation.test.ts`: database authorization and migration contract tests.
- `src/features/admin/admin.types.ts`: role, metrics, learner row, audit row, and result types shared by server/UI.
- `src/features/admin/admin.repository.ts`: authenticated Supabase RPC calls and result mapping; never creates a service-role client.
- `src/features/admin/admin-access.ts`: resolve role and permission checks for server routes/actions.
- `src/features/admin/admin-input.schema.ts`: Zod learner-edit and date/filter input validation.
- `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/{users,courses,billing,support,roles,audit,settings}/page.tsx`: guarded admin shell and screens.
- `src/features/admin/admin-shell.tsx`, `overview.tsx`, `users-table.tsx`, `learner-editor.tsx`, `integration-state.tsx`: focused presentation components.
- `src/app/admin/users/[id]/actions.ts`: validated, reauthorized learner edits.
- `src/app/api/page-view/route.ts`, `src/features/analytics/page-view-recorder.tsx`, `src/features/analytics/page-view.schema.ts`: first-party, idempotent public-page navigation recording.
- `src/app/dashboard/page.tsx`, `src/components/site-header.tsx`, `src/features/auth/return-path.ts`: learner dashboard and entry points.
- `src/app/globals.css`, `src/app/privacy/page.tsx`: responsive dashboard styles and analytics disclosure.
- Focused Vitest files adjacent to code plus `tests/e2e/admin-dashboard.spec.ts` and `tests/e2e/learner-dashboard.spec.ts`.

---

### Task 1: Staff identity and fail-closed permissions

**Files:** Create the migration and its SQL/Vitest tests; create `admin.types.ts`, `admin-access.ts`, and `admin-access.test.ts`; create `src/app/admin/layout.tsx` and initial guarded route test.

**Interfaces:** Produce `type StaffRole = 'super_admin' | 'content_editor' | 'support_agent' | 'finance'`, `getStaffRole(): Promise<StaffRole | null>`, and `requireStaff(permission: AdminPermission): Promise<{ viewer: Viewer; role: StaffRole }>`; `AdminPermission` is `overview | users_read | users_write | courses | billing | support | roles | audit | settings`.

Core permission boundary to implement and test:

```ts
export type StaffRole = "super_admin" | "content_editor" | "support_agent" | "finance";
export type AdminPermission = "overview" | "users_read" | "users_write" | "courses" | "billing" | "support" | "roles" | "audit" | "settings";
export const permissions: Record<StaffRole, readonly AdminPermission[]> = {
  super_admin: ["overview", "users_read", "users_write", "courses", "billing", "support", "roles", "audit", "settings"],
  content_editor: ["overview", "courses"],
  support_agent: ["overview", "users_read", "users_write", "support", "audit"],
  finance: ["overview", "billing"],
};
export const canStaff = (role: StaffRole, permission: AdminPermission) => permissions[role].includes(permission);
```

- [ ] **Step 1: Write failing SQL and TypeScript tests.** SQL: insert two auth fixtures; assign one `support_agent` role as database owner; as nonstaff confirm `admin_staff_role()` returns null; as support confirm it resolves `support_agent`; confirm anonymous lookup returns null and nonstaff cannot read another user's `staff_roles` row. TypeScript: mock `getViewer` and role repository, then assert unauthenticated calls redirect to `/sign-in?returnTo=%2Fadmin`, authenticated nonstaff calls `notFound()`, and support cannot request `billing`.
- [ ] **Step 2: Run the focused tests to observe failure.** `pnpm exec vitest run src/features/admin/admin-access.test.ts supabase/migrations/admin-foundation.test.ts`; execute `supabase/tests/admin_foundation_rls.sql` against a disposable local Supabase database with `psql -v ON_ERROR_STOP=1 -f ...`. Expected: missing function/files or denied test, not a passing placeholder.
- [ ] **Step 3: Implement the smallest permission base.** Migration creates `public.staff_roles(user_id uuid primary key references auth.users, role text check (...), created_at timestamptz, assigned_by uuid)`, enables RLS, revokes writes from `anon,authenticated`, and grants an own-row SELECT policy. `public.admin_staff_role()` is `SECURITY DEFINER SET search_path=''`, reads only `auth.uid()`, and returns the role or null; revoke PUBLIC execute and grant authenticated. Define a pure `canStaff(role, permission)` matrix: super admin all; content editor `overview,courses`; support agent `overview,users_read,users_write,support,audit`; finance `overview,billing`. `requireStaff` gets the real Supabase viewer, reads the role, and rejects missing permission before rendering. Never use a request-supplied user ID for role authority.
- [ ] **Step 4: Re-run focused tests and commit.** Run the two Vitest files and SQL test; confirm nonstaff and anonymous direct calls fail. Commit only Task 1 files with `feat: gate admin pages by staff role`.

### Task 2: Real metrics, searchable directory, and audit reads

**Files:** Modify migration/tests; create `admin.repository.ts`, `admin.repository.test.ts`, `admin-input.schema.ts` and tests; create `src/app/admin/page.tsx` and `src/app/admin/users/page.tsx` with focused route tests.

**Interfaces:** Produce `loadAdminOverview(): Promise<{ accounts: number | null; joinedWaitlist: number | null; pageViews: number | null; recent: AdminActivity[] }>`; `listLearners({ query, offset, limit }): Promise<{ rows: LearnerRow[]; total: number }>`; `listAudit({ offset, limit, actorId?, targetId? }): Promise<{ rows: AuditRow[]; total: number }>`.

Use these guarded SQL shapes; expand result columns only to match the declared row types:

```sql
create function public.admin_account_count() returns bigint
language plpgsql security definer set search_path = '' as $$
begin
  if public.admin_staff_role() is null then raise insufficient_privilege; end if;
  return (select count(*) from auth.users);
end; $$;

create function public.admin_joined_waitlist_count() returns bigint
language plpgsql security definer set search_path = '' as $$
begin
  if public.admin_staff_role() is null then raise insufficient_privilege; end if;
  return (select count(*) from public.pro_waitlist_entries where status = 'joined');
end; $$;
```

- [ ] **Step 1: Write failing authorization and mapping tests.** SQL: nonstaff cannot call any admin metric/list function; support sees only paginated directory rows; waitlist count includes `joined` and excludes `unsubscribed`; account count uses `auth.users` even when a profile row is absent; audit direct INSERT/UPDATE/DELETE by authenticated role fails. TypeScript: test that `loadAdminOverview` maps a Supabase error to `null` metric rather than `0`, and `listLearners` clamps limit to 50 and trims search input.
- [ ] **Step 2: Run focused tests and confirm expected red.** `pnpm exec vitest run src/features/admin/admin.repository.test.ts src/features/admin/admin-input.schema.test.ts`; run SQL test in disposable database.
- [ ] **Step 3: Implement narrow SQL RPCs and repository.** `admin_account_count()` reads `count(*) from auth.users`; `admin_joined_waitlist_count()` reads joined rows; `admin_list_learners(p_query text,p_offset int,p_limit int)` joins `auth.users`, `learner_profiles`, and waitlist status, returns only id/email/display name/learning level/created time/waitlist status, and caps limit at 50. Each function checks `auth.uid()` and staff role *inside SQL* before reading protected tables. Add `admin_audit_events(id,actor_id,target_id,action,before_value jsonb,after_value jsonb,created_at)` with no direct client DML grant, plus staff-only paginated read RPC. Use returned server-side counts for pagination, not fetching all rows into JS. Repository maps exact RPC shapes to types and catches per-panel errors.
- [ ] **Step 4: Add guarded server screens and commit.** Overview shows real account/waitlist counts and unavailable page views until Task 4; Users shows query, result count, and pagination. Re-run focused tests and SQL authorization checks. Commit `feat: show real admin accounts and waitlist metrics`.

### Task 3: Audited learner profile edits and notes

**Files:** Modify migration/SQL tests; create `src/app/admin/users/[id]/actions.ts`, `src/features/admin/learner-editor.tsx`, related tests; add user detail route.

**Interfaces:** `parseLearnerEdit(input: unknown): { displayName: string | null; learningLevel: LearningLevel | null; note?: string }`; `updateLearnerProfile(targetId: string, input: LearnerEdit): Promise<AdminMutationResult>` uses one SQL RPC `admin_update_learner`.

Validator contract; the SQL function must independently enforce the same bounds:

```ts
const learnerEditSchema = z.object({
  displayName: z.string().trim().max(80).nullable(),
  learningLevel: z.enum(["beginner", "graduate", "it_experienced", "networking_professional", "career_switcher"]).nullable(),
  note: z.string().trim().max(1000).optional(),
}).strict();
export type LearnerEdit = z.infer<typeof learnerEditSchema>;
export const parseLearnerEdit = (value: unknown): LearnerEdit => learnerEditSchema.parse(value);
```

- [ ] **Step 1: Write failing tests.** Validate name length ≤80, optional note length ≤1000, and enum level. SQL: support and super admin can edit a different learner; finance/nonstaff cannot; an edit inserts exactly one audit row with actor, target, before/after values; no-op editing does not add an event; notes never appear in learner-owned profile queries. UI action tests verify malformed input and unauthorized role never call the RPC.
- [ ] **Step 2: Run focused tests and observe red.** `pnpm exec vitest run src/features/admin/admin-input.schema.test.ts src/app/admin/users/[id]/actions.test.ts`; run the SQL RLS test.
- [ ] **Step 3: Implement atomic mutation.** Add `admin_learner_notes(target_id, note, updated_at, updated_by)` with no learner read grant. The `SECURITY DEFINER` RPC checks `auth.uid()` role in `(super_admin,support_agent)`, validates target and fields, locks the profile row, updates profile/notes, and inserts audit in the same transaction. The server action obtains the viewer and permission again, validates Zod input, calls the RPC, and revalidates the user detail/overview routes. The editor labels subscription, refund, deletion, impersonation, and suspension unavailable.
- [ ] **Step 4: Verify and commit.** Run focused Vitest and SQL tests; manually confirm the user-owned profile SELECT excludes notes. Commit `feat: audit authorized learner profile changes`.

### Task 4: Privacy-conscious total page views

**Files:** Modify migration/SQL tests; create `page-view.schema.ts`, `page-view-recorder.tsx`, `src/app/api/page-view/route.ts` and tests; modify `src/app/layout.tsx` and `src/app/privacy/page.tsx`.

**Interfaces:** `parsePageView(input: unknown): { path: string; eventId: string }`; POST `/api/page-view` returns 204 on accepted/duplicate event and 400 on malformed input. `admin_page_view_count(p_from timestamptz,p_to timestamptz)` returns count for `[from,to)`.

The database idempotency key and count query are exact:

```sql
create table public.page_views (
  event_id uuid primary key,
  path text not null check (char_length(path) between 1 and 200),
  created_at timestamptz not null default now()
);
-- The recording RPC validates the path and then performs:
insert into public.page_views(event_id, path) values (p_event_id, p_path)
on conflict (event_id) do nothing;
-- The staff-only count RPC performs:
select count(*) from public.page_views where created_at >= p_from and created_at < p_to;
```

- [ ] **Step 1: Write failing tests.** Accept `/`, `/pricing`, `/paths/...`, `/learn/...`; reject `/admin`, `/api`, `_next`, query strings, fragments, external URLs, paths >200 chars, and non-UUID event IDs. SQL: two inserts with one event UUID count once; a second UUID counts again; nonstaff cannot read count or raw rows; recorded row has only event_id/path/created_at. Route test confirms malformed requests do not call Supabase and valid requests call `record_page_view` once.
- [ ] **Step 2: Run focused tests and observe red.** `pnpm exec vitest run src/features/analytics/page-view.schema.test.ts src/app/api/page-view/route.test.ts`; run SQL test.
- [ ] **Step 3: Implement storage and beacon.** Create `page_views(event_id uuid primary key,path text,created_at timestamptz default now())`; revoke raw table access. `record_page_view(p_event_id uuid,p_path text)` is a narrowly granted definer RPC that validates paths and uses `ON CONFLICT DO NOTHING`; the unique UUID is the retry dedupe key and is not linked to an identity. Client recorder runs on public pathname changes, creates one UUID per navigation, and sends it to POST via `navigator.sendBeacon` or `fetch(...,{keepalive:true})`; exclude admin routes and Playwright test sessions. No query string or identifier is sent. An injected root-layout recorder has no visible DOM. Update Privacy before enabling the recorder.
- [ ] **Step 4: Connect date-filtered metric and commit.** Overview calls `admin_page_view_count` for default last 30 days and validated preset date ranges, displays `Total page views` and the coverage caveat. Confirm retry idempotence and nonstaff denial in SQL, focused Vitest, and browser navigation checks. Commit `feat: count first-party page views without visitor identifiers`.

### Task 5: Admin shell and honest secondary pages

**Files:** Create `admin-shell.tsx`, `overview.tsx`, `users-table.tsx`, `integration-state.tsx`; create Courses, Billing, Support, Roles, Audit, and Settings pages/tests; modify `src/app/globals.css`.

**Interfaces:** `AdminShell({ role, children })` renders role-filtered navigation; `IntegrationState({ area, reason })` renders an explicit unavailable state without enabled mutation controls.

Keep the unavailable state explicit, not a fabricated chart:

```tsx
export function IntegrationState({ area, reason }: { area: string; reason: string }) {
  return <section className="admin-integration-state" role="status">
    <h2>{area} is not connected yet</h2>
    <p>{reason}</p>
  </section>;
}
```

- [ ] **Step 1: Write failing component/route tests.** Assert two nav groups and screenshot labels, current-page state, role-filtered links, 15rem desktop sidebar, mobile stack, focus styles, no fake INR/revenue/ticket figures, disabled billing/refund/suspend/impersonation actions, and direct URL denial for roles without permission. Audit page must use the staff-only paginated RPC and remain read-only.
- [ ] **Step 2: Run focused tests and observe red.** `pnpm exec vitest run src/features/admin/admin-shell.test.tsx src/app/admin/admin-pages.test.tsx`.
- [ ] **Step 3: Implement UI.** Build the dark sidebar and cards using existing theme tokens, teal active state, responsive CSS, accessible links and forms. Routes call `requireStaff` with their section permission before loading data; Courses/Billing/Support/Roles/Settings show explicit `Not connected yet` copy, not fake functional controls. The Overview shows only real metrics and activity; Users and Audit show empty/loading/error states distinctly.
- [ ] **Step 4: Verify and commit.** Run focused tests, TypeScript, lint, and desktop/mobile browser navigation. Commit `feat: render guarded admin dashboard shell`.

### Task 6: Personal learner dashboard and entry points

**Files:** Create `src/app/dashboard/page.tsx` and tests; modify `src/components/site-header.tsx`, `src/features/auth/return-path.ts`, tests, and dashboard CSS.

**Interfaces:** `/dashboard` reads `getViewer()` and `loadMyLearning(viewer.id, pathway)` only; anonymous visitors redirect to `/sign-in?returnTo=%2Fdashboard`.

Server route's essential data boundary:

```tsx
const viewer = await getViewer();
if (!viewer) redirect("/sign-in?returnTo=%2Fdashboard");
const pathway = listPathways().find((item) => item.slug === "networking-foundations");
if (!pathway) notFound();
const { model, unavailable } = await loadMyLearning(viewer.id, pathway);
return <main id="main-content"><h1>My dashboard</h1><MyLearning model={model} unavailable={unavailable} /></main>;
```

- [ ] **Step 1: Write failing tests.** Anonymous redirects, signed-in user sees their own completion/Continue learning from `loadMyLearning`, unavailable progress shows a clear recovery state, `/dashboard` is an allowed return path, and header entry points never render an admin link solely from client state.
- [ ] **Step 2: Run focused tests and observe red.** `pnpm exec vitest run src/app/dashboard/page.test.tsx src/features/auth/return-path.test.ts src/components/site-header.test.tsx`.
- [ ] **Step 3: Implement learner route.** Reuse `listPathways()` and `loadMyLearning`, render `MyLearning` rather than duplicate progress logic, and add an authenticated dashboard link through server-provided viewer state or a simple account entry point that cannot expose staff data. Keep the existing public nav intact.
- [ ] **Step 4: Verify and commit.** Run focused tests and anonymous/authenticated browser checks. Commit `feat: add personal learning dashboard`.

### Task 7: End-to-end security and release checks

**Files:** Create `tests/e2e/admin-dashboard.spec.ts`, `tests/e2e/learner-dashboard.spec.ts`; modify deployment instructions in `docs/` only if the exact bootstrap command is verified against the migration.

**Interfaces:** No new production interface; confirms Tasks 1–6 together.

Representative browser boundary assertion:

```ts
test("an unauthenticated visitor cannot open the admin area", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fadmin/);
  await expect(page.getByRole("heading", { name: "Overview" })).toHaveCount(0);
});
```

- [ ] **Step 1: Write browser tests.** Check unauthenticated `/admin` redirect, authenticated nonstaff denial, staff role navigation, real zero versus unavailable metrics, learner edit audit visibility, page-view increment after navigation but not after duplicate POST, learner dashboard privacy, and mobile sidebar readability. Use a disposable seeded Supabase project for staff cases; do not introduce a production audit bypass.
- [ ] **Step 2: Run the browser tests and fix only observed integration failures.** `pnpm exec playwright test tests/e2e/admin-dashboard.spec.ts tests/e2e/learner-dashboard.spec.ts` with isolated test credentials; failures must name the broken route/RPC, not be silenced by mocks.
- [ ] **Step 3: Run complete verification.** `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and the SQL RLS suite against disposable Supabase. Record exact pass/fail outputs. Inspect `git diff --check` and `git status --short`; review every privileged function's grants and search path.
- [ ] **Step 4: Document deployment and commit.** State migration order, privacy notice activation, operator-only super-admin bootstrap with an explicit verified auth UUID, and expected blank metrics before data collection. Commit test/docs fixes separately. Do not claim deployed analytics or live production counts until migration and deployment actually occur.

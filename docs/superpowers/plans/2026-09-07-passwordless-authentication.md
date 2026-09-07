# Packetsecrets Passwordless Authentication Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Google sign-in and single-use 15-minute email magic links, returning learners safely to the lesson they came from.

**Architecture:** Auth.js owns OAuth, verification tokens, database sessions, and secure cookies. Prisma maps Auth.js tables to PostgreSQL. A server-only data-access layer resolves `anonymous | account | pro`; page components consume that result, while every mutation re-checks authorization.

**Tech Stack:** Next.js, Auth.js, Prisma, PostgreSQL, Resend transactional email, Zod, Vitest, Playwright.

---

## Task 1: Add database and environment foundations

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`, `.gitignore`
- Create: `.env.example`, `prisma/schema.prisma`, `src/lib/db.ts`, `src/lib/env.ts`
- Create: `src/lib/env.test.ts`

**Step 1: Add failing environment tests** for required `DATABASE_URL`, `AUTH_SECRET`, Google credentials, `AUTH_RESEND_KEY`, and `AUTH_EMAIL_FROM`, with production-only HTTPS validation for `AUTH_URL`.

**Step 2: Install dependencies**

Run: `pnpm add next-auth@beta @auth/prisma-adapter @prisma/client resend && pnpm add -D prisma`

**Step 3: Define the Auth.js-compatible Prisma models**

Create `User`, `Account`, `Session`, and `VerificationToken` using the official adapter field names and unique constraints. Add `role` (`LEARNER | ADMIN`) and `entitlement` (`FREE | PRO`) to `User`, defaulting to least privilege.

**Step 4: Generate and test**

Run: `pnpm prisma format && pnpm prisma validate && pnpm prisma generate && pnpm vitest run src/lib/env.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml .gitignore .env.example prisma src/lib
git commit -m "build: add authentication persistence"
```

## Task 2: Implement safe lesson return paths

**Files:**
- Create: `src/features/auth/safe-return-path.ts`
- Create: `src/features/auth/safe-return-path.test.ts`

**Step 1: Write table-driven failing tests**

```ts
it.each([
  ["/learn/networking-foundations/osi-and-tcp-ip-models", "/learn/networking-foundations/osi-and-tcp-ip-models"],
  ["https://evil.example/steal", "/"],
  ["//evil.example/steal", "/"],
  ["/api/auth/signout", "/"],
])("normalizes %s", (input, expected) => {
  expect(safeReturnPath(input)).toBe(expected);
});
```

**Step 2: Implement an allow-list** limited to `/learn/`, `/paths/`, and `/account`; reject backslashes, encoded protocol-relative values, auth endpoints, and control characters.

**Step 3: Run and commit**

Run: `pnpm vitest run src/features/auth/safe-return-path.test.ts`
Expected: PASS.

```bash
git add src/features/auth
git commit -m "feat: validate authentication return paths"
```

## Task 3: Configure Google and email-link authentication

**Files:**
- Create: `src/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/features/auth/send-magic-link.ts`
- Create tests for callbacks and mail payloads

**Step 1: Write failing tests** for Google verified-email acceptance, unverified-email rejection, normalized lowercase email identity, a 15-minute token expiry, and a mail payload that never logs or returns the raw link.

**Step 2: Configure Auth.js**

```ts
export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  providers: [
    Google({ allowDangerousEmailAccountLinking: false }),
    Resend({ from: env.AUTH_EMAIL_FROM, maxAge: 15 * 60 }),
  ],
  pages: { signIn: "/sign-in", verifyRequest: "/sign-in/check-email", error: "/sign-in/error" },
});
```

Use Auth.js verified-email safeguards; do not manually set dangerous email linking. If automatic cross-provider linking is not guaranteed by the installed Auth.js version, implement an explicit transaction that links only a provider assertion containing a verified email matching a normalized existing account, and cover it with duplicate/concurrency tests.

**Step 3: Export route handlers and run tests**

Run: `pnpm vitest run src/features/auth`
Expected: PASS.

**Step 4: Commit**

```bash
git add src/auth.ts src/app/api/auth src/features/auth
git commit -m "feat: add Google and magic-link authentication"
```

## Task 4: Add rate limiting and neutral request responses

**Files:**
- Create: `src/features/auth/request-magic-link.action.ts`
- Create: `src/features/abuse/rate-limit.ts`
- Create matching tests

**Step 1: Write failing tests** proving the response is identical for existing and new addresses, address and client buckets throttle repeated requests, and the raw address is not used as a rate-limit key.

**Step 2: Implement a replaceable server adapter**

```ts
export type RateLimitDecision = { allowed: boolean; retryAfterSeconds: number };
export interface RateLimiter {
  check(scope: "magic-link-email" | "magic-link-client", keyHash: string): Promise<RateLimitDecision>;
}
```

Use an HMAC of normalized email for the address key. Production startup must fail if only the in-memory development limiter is configured. Return the same neutral UI result whether Auth.js sends a link, suppresses a duplicate, or finds an existing user.

**Step 3: Run tests and commit**

Run: `pnpm vitest run src/features/abuse src/features/auth`
Expected: PASS.

```bash
git add src/features/abuse src/features/auth
git commit -m "security: throttle magic-link requests"
```

## Task 5: Build branded authentication pages

**Files:**
- Create: `src/app/sign-in/page.tsx`
- Create: `src/app/sign-in/check-email/page.tsx`
- Create: `src/app/sign-in/error/page.tsx`
- Create: `src/features/auth/sign-in-form.tsx`
- Modify: `src/components/site-header.tsx`
- Add component tests

**Step 1: Write failing accessibility tests** for named Google/email controls, pending state, masked destination, polite status announcements, expired/used-link retry, keyboard focus, and no password input.

**Step 2: Implement the two approved choices only**

The Google button submits `signIn("google", { redirectTo: safeReturnPath })`. The email form invokes the rate-limited server action. Preserve `returnTo` through success/error pages.

**Step 3: Add session-aware header**

Anonymous header shows Sign in. Authenticated header shows a learner menu and a POST-backed Sign out action; never expose provider access tokens.

**Step 4: Run and commit**

Run: `pnpm vitest run src/features/auth src/components/site-brand.test.tsx`
Expected: PASS.

```bash
git add src/app/sign-in src/features/auth src/components/site-header.tsx
git commit -m "feat: add branded passwordless sign-in"
```

## Task 6: Centralize authorization and connect lesson rendering

**Files:**
- Create: `src/features/auth/access-policy.ts`
- Create: `src/features/auth/session.dal.ts`
- Create matching tests
- Modify: lesson page and content repository from Plan 1

**Step 1: Write the access matrix test**

```ts
expect(resolveViewerAccess(null)).toBe("anonymous");
expect(resolveViewerAccess({ entitlement: "FREE" })).toBe("account");
expect(resolveViewerAccess({ entitlement: "PRO" })).toBe("pro");
expect(resolveViewerAccess({ entitlement: undefined })).toBe("account");
```

Entitlement read failure must fail closed to account access, never Pro.

**Step 2: Implement the server-only DAL** using `cache()`, `auth()`, and a fresh database lookup for secure entitlement checks. Return a minimal DTO `{ userId, displayName, access }`; never return OAuth tokens.

**Step 3: Load only authorized MDX blocks** in the lesson page. Server actions and route handlers call the DAL themselves rather than trusting props or hidden fields.

**Step 4: Add E2E tests** for Google callback stubs and captured-email magic-link stubs in a test-only mail adapter. Verify return to the originating lesson, replay rejection, expiry, free content unlock, Pro remaining locked, and protected sentinel absence from anonymous/free responses.

**Step 5: Full verification and commit**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm build && pnpm test:e2e`
Expected: PASS.

```bash
git add src tests/e2e
git commit -m "feat: enforce server-side lesson authorization"
```

## Deployment checkpoint

Provision PostgreSQL, Google OAuth credentials, the Resend sender/domain, a durable production rate limiter, and all `.env.example` values in a non-production preview first. Confirm production cookies are Secure, HTTP-only, SameSite=Lax, session deletion works, and OAuth/magic-link callback URLs use `https://packetsecrets.com` before release.


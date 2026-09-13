# Packetsecrets full-site integration design

## Goal

Bring the user-facing work from PR #33 onto the current `main` and then onto `packetsecrets.com`, without regressing the homepage release (PR #36), dashboard (PR #35), authentication, or existing learner progress.

## Scope

The release includes the shared navy/teal visual system and theme controls; lesson-shell and packet-player presentation; the Packet Labs MVP; DHCP, VLAN, TCP, UDP, transport, and protocol-format interactive improvements; and the associated published lesson content and navigation. It includes both TCP/UDP progress migrations because those lessons change the progress manifest. Old design and implementation documents are source references, not user-facing features; obsolete documents are not copied into the release solely to reproduce the old branch.

PR #33 is not merged directly: its branch predates PRs #35 and #36, and copying its tree would remove the dashboard and overwrite the released homepage. The integration starts at current `main` and ports each feature area, resolving overlaps in favor of current dashboard/auth contracts and the approved homepage. Existing public links must keep working, including the legacy combined TCP/UDP route.

## Application architecture

- Keep the current App Router layouts, dashboard route, auth callback, access gates, and progress APIs.
- Apply shared design tokens at the CSS root, preserving a readable explicit light theme and reduced-motion behavior. Shared header, footer, forms, cards, lesson shells, and players consume those tokens. The homepage remains the released PR #36 layout unless a specific older component adds missing functionality.
- Add `/labs` as an actual public route and point the lab teaser to it only once its navigation and interactive scenario work.
- Split TCP and UDP into distinct published lessons while retaining the old combined URL as a redirect or compatibility page. Preserve existing learner events and use the progress manifests and migrations from the older work only after their identifiers are reconciled with current `main`.
- Port player and lesson changes by feature area, retaining packet fields, controls, keyboard operation, and access boundaries. Do not replace live dashboard or newer auth code with stale branch versions.

## Data migration and release order

1. Inventory the production and staging Supabase schema and migration history. Confirm the target project identities before changing either database.
2. Produce a restorable backup of affected progress tables or an equivalent verified recovery path, and record pre-migration row counts and aggregate completion state. Do not expose or log learner identifiers or credentials.
3. Apply migrations `202609120001_split_tcp_udp_progress.sql` and `202609120002_add_tcp_fast_retransmit_progress.sql` to staging first; verify manifest counts, retained event counts, legacy TCP attempts, and new UDP lesson rows. Resolve drift before production.
4. After the integrated application passes automated and browser checks, apply the validated migration sequence to production. Each transaction must complete before deploying code that expects its manifest. Verify the same invariants in production.
5. Merge the integration PR and perform a one-time Vercel production deployment to the existing `packetsecrets` project (the project is not Git-connected). Verify `packetsecrets.com` and key routes after the alias moves. If database validation or deployment fails, do not proceed to the next stage; preserve existing live deployment and use the prepared recovery path.

## Verification gates

Run the full Vitest suite, TypeScript, lint, production build, and relevant desktop/mobile Playwright checks. Browser QA covers the homepage, sign-in redirect, dashboard route, Labs, TCP and UDP lessons, first lesson, and representative DHCP/VLAN/packet players. Check navigation, focus, contrast, reduced motion, horizontal overflow, and browser errors. A real signed-in progress test requires an approved test account/session; absent that, report authenticated behavior as unverified rather than claiming it passed.

## Non-goals

No new admin permissions, payment changes, account invitations, credential rotation, automatic Git-to-production connection, or unrelated content expansion. PR #33's admin-dashboard design note is not an implementation of admin controls; the already released dashboard remains the source of truth.

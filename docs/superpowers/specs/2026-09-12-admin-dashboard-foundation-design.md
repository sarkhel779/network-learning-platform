# Admin dashboard foundation

Date: 2026-09-12

## Purpose and scope

Build the first operational administrator dashboard for Packetsecrets, using the supplied dark, two-column visual reference. This release provides server-enforced staff access, accurate account and Founding Pro waitlist counts, total page views, a searchable learner directory, limited account editing, and an append-only audit trail. A learner dashboard presents that learner's existing progress. The sidebar also exposes Courses and labs, Billing, Support, Roles, Audit log, and Settings, but areas without backing services must say they are not connected; no fabricated revenue, subscribers, churn, tickets, invoices, or payments.

This is the first subsystem of the broader dashboard brief. Course publishing, payment/refund operations, ticket workflows, staff invitations, and platform settings changes require separate designs and implementations. Their navigation and honest states are included here; pretending they work is not.

## Existing system and approach

The application uses Next.js App Router and Supabase passwordless authentication. `learner_profiles` holds account profile data, `pro_waitlist_entries` holds explicit waitlist consent and status, and existing progress repositories provide learner completion state. No staff roles, billing, support, or analytics data exists. Keep Supabase as the source of truth rather than introducing a second admin datastore or embedding sample values. New repositories provide a narrow typed interface to the dashboard components.

Alternative approaches considered: (1) visual-only pages are fastest but contradict the request for real controls and counts; (2) a separate analytics/admin service offers future flexibility but adds unnecessary deployment and security boundaries now; (3) Supabase-backed staff permissions, aggregates, and edits integrates with the current stack. Choose (3).

## Access model and account changes

Create a `staff_roles` table with `super_admin`, `content_editor`, `support_agent`, and `finance` roles. Its initial super-admin assignment is an explicit operator action using a verified existing auth user ID; never auto-promote the first visitor or trust a browser query parameter. All `/admin` pages perform a server-side role check, and every admin read or mutation additionally enforces the same permission in the database. Public and learner sessions have no access to staff tables, aggregate RPCs, or cross-user profile data. Staff navigation is role-aware; unauthorized sections return a deny state rather than merely hiding a link.

For this release, an authorized super admin or support agent may update a learner's display name and learning level and add an internal account note. A super admin may suspend and reactivate learning access only after this is enforced at every protected learner mutation and page; otherwise the control stays unavailable. Staff cannot silently change waitlist consent, claim a free user is a paid subscriber, refund a nonexistent transaction, delete an account, or impersonate a learner. Each permitted change records actor, target, action, old/new values, and timestamp in an append-only audit table. Mutations validate inputs and verify authorization server-side immediately before writing. User-owned profile editing cannot overwrite staff-only fields.

## Counts and page views

The overview displays separate cards for registered accounts (count of `auth.users`, including accounts created before the profile trigger existed), joined Founding Pro waitlist members (`pro_waitlist_entries.status = 'joined'`), and total page views. A narrow staff-only database function reads the authentication count and the email needed for the directory; no browser or broadly granted table access touches `auth.users`. Aggregate queries are available only to authorized staff. Count failures show unavailable, not zero. The directory and waitlist list are paginated and searchable with server-side filtering; emails are shown only to authorized staff.

Add first-party, data-minimized page-view collection for actual page navigation. A view is one successful client route load/navigation to a public page, not a unique person or an impression of an embedded player. Exclude admin routes, API/static assets, and automated test sessions. Store normalized path and timestamp only—no IP address, full query string, cookies, user ID, or user-agent fingerprint in the analytics record. An authenticated or anonymous browser may trigger a count. The dashboard filters by date range and labels the card `Total page views`. Collection begins only after the Privacy notice is updated to describe it. Counts before deployment are unavailable; the interface must not imply historical coverage. Basic rate limiting or deduplication must prevent obvious retry inflation, and the UI notes that ad blockers, disabled JavaScript, or bot traffic can affect the number.

## Screens and data flow

The admin shell has the screenshot's 15rem desktop sidebar, grouped GENERAL/SYSTEM navigation, teal active state, responsive collapsed layout, and accessible labels/focus. Overview shows the three real metrics above and recent registrations/waitlist activity. Users supports search, filters, pagination, a detail panel, validated profile edits, and audit-visible changes. Audit log is paginated/filterable and read-only. The remaining admin pages show their intended headings, scope, and explicit integration status, with unsafe buttons disabled rather than decorative working-looking controls. No placeholder INR values appear as real figures.

The learner `/dashboard` requires authentication and reuses the existing progress model for completion and Continue learning. It never reads another learner's state. Existing site navigation adds dashboard entry points without exposing admin links to nonstaff.

On each admin request: authenticate with Supabase, resolve staff role from trusted server/database state, authorize the page or action, then query the minimal required repository. Client components handle presentation and input only; they do not carry service-role credentials or decide permission. Empty, loading, unavailable, and denied states are distinct.

## Testing and rollout

Add SQL RLS tests for nonstaff denial, staff role boundaries, aggregate reads, cross-user edits, and append-only audit behavior. Add unit tests for input validation and data mapping, route/component tests for denial and unavailable states, and browser checks for dashboard navigation and responsive layout. Verify lint, typecheck, and relevant test suites. Deploy database migrations before enabling the dashboard. Bootstrap the first super admin manually with an audited operator procedure; if no staff row exists, `/admin` remains inaccessible. Existing unrelated worktree edits remain untouched.

Acceptance means staff can see accurate live account, joined-waitlist, and newly collected page-view counts; authorized account edits persist and are audited; unauthorized users cannot read or mutate staff data by direct URL/API call; the learner dashboard shows only personal progress; and unbuilt integrations are clearly marked unavailable.

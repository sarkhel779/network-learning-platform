# Network Learning Platform MVP Roadmap

**Spec:** `docs/superpowers/specs/2026-08-27-network-learning-platform-design.md`

The approved specification spans four independently testable systems. They will be implemented as separate plans so each can be reviewed, deployed, and validated before the next adds risk.

## Plan sequence

1. **Content site foundation** — Create the public site, structured MDX content, pathway/module/lesson navigation, premium previews, and one representative lesson. This produces a deployable public website with no external service dependency.
2. **Interactive packet-flow engine** — Add the reusable scenario schema, autoplay state machine, pause/resume/restart/speed controls, accessibility behavior, and three to four networking scenarios.
3. **Identity, commerce, and library** — Add Supabase email authentication, Stripe Checkout, verified idempotent webhooks, ownership records, upgrade-credit rules, discount support, and My Library.
4. **Analytics, curriculum completion, and launch hardening** — Add privacy-conscious events, quizzes, Wireshark downloads and checks, the scenario assessment, remaining launch lessons, performance budgets, accessibility checks, and production runbooks.

## Review gates

- Plan 1 must deploy and pass its unit, accessibility, and public-navigation tests before Plan 2 begins.
- Plan 2 must demonstrate deterministic animation state and reduced-motion behavior before Plan 3 begins.
- Plan 3 must pass successful, failed, duplicate, and retried payment tests before any real product is sold.
- Plan 4 must pass the full launch checklist from the specification before public release.

## Technology direction

- Next.js App Router, React, and TypeScript for the web application.
- Local MDX plus typed metadata for phase-one structured content.
- Zod at build time for content and animation validation.
- Vitest and Testing Library for domain/component tests.
- Playwright for browser journeys and accessibility-critical interactions.
- Supabase PostgreSQL and email authentication in Plan 3.
- Stripe hosted Checkout and verified webhooks in Plan 3.
- A lightweight analytics adapter in Plan 4 so the vendor can be changed without rewriting lesson components.


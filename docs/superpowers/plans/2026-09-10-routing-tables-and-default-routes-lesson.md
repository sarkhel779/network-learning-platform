# Routing Tables and Default Routes Lesson Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a beginner-safe IPv4/IPv6 routing lesson with a deterministic route-selection player, a hop-by-hop forwarding player, gated practice, and reliable learner progress.

**Architecture:** A pure `routing` domain module validates authored scenarios and returns an ordered decision trace. Two client components render that trace and typed forwarding journeys through existing playback, packet, progress, lesson-shell, and MDX primitives; public and account content remain separate server-loaded modules.

**Tech Stack:** Next.js 15, React 19, TypeScript, MDX, Zod, Vitest, Testing Library, Supabase PostgreSQL migrations.

**Spec:** `docs/superpowers/specs/2026-09-10-routing-tables-and-default-routes-lesson-design.md`

## Global Constraints

- Use the same route-selection order for IPv4 and IPv6: family, matching prefix, longest prefix, administrative distance, then comparable metric.
- Never compare administrative distance before prefix length or present unrelated protocol metrics as universally comparable.
- Keep both core players and the complete conceptual method public; commands, evidence, practice, troubleshooting, knowledge checks, and summary are account-locked.
- Show account entries as `Locked`; show Pro entries as `Pro` and `Locked`.
- Autoplay only when normal motion is permitted; preserve Previous, Play/Pause, Next, Restart, speed controls, and deterministic scenario reset.
- Fit desktop and 390-pixel lesson widths without page-level horizontal overflow; any table scrolling must remain local and labelled.
- Record progress only at meaningful terminal states through the existing idempotent progress queue.
- Wrong knowledge-check answers count as attempts while remaining visibly incorrect.
- Do not change authentication providers, redirects, unrelated RLS policies, or existing learner data.

---

### Task 1: Publish the lesson shell and access boundaries

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/catalog/module-list.test.tsx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `src/app/sitemap.test.ts`
- Create: `src/content/networking-foundations/routing-tables-and-default-routes.public.mdx`
- Create: `src/content/networking-foundations/routing-tables-and-default-routes.account.mdx`

**Interfaces:**
- Produces: published lesson id `lesson_routing_tables_and_default_routes` and content key `networking-foundations/routing-tables-and-default-routes`.
- Produces: ordered section ids consumed by MDX, progress manifests, and the migration.

- [ ] **Step 1: Write failing publication tests**

Add assertions that the lesson is published, has 17 ordered sections, appears after IPv6 Fundamentals,
is present in the sitemap, and loads only public content for anonymous access. Use these exact section
ids: `why-routing-exists`, `route-table-anatomy`, `route-sources`, `how-prefix-matching-works`,
`interactive-route-selection`, `longest-prefix-match`, `administrative-distance`, `route-metric`,
`next-hop-outgoing-interface`, `interactive-hop-by-hop-forwarding`, `ipv4-ipv6-routing`,
`no-route-packet-disposal`, `inspect-routing-evidence`, `guided-routing-practice`,
`troubleshoot-routing`, `knowledge-check-summary`, and `pro-deep-dive`.

```ts
expect(routingLesson).toMatchObject({
  id: "lesson_routing_tables_and_default_routes",
  published: true,
  estimatedMinutes: 25,
});
expect(routingLesson?.sections?.map(({ id }) => id)).toEqual(expectedRoutingSections);
expect(sitemap()).resolves.toContainEqual(expect.objectContaining({
  url: expect.stringContaining("/learn/networking-foundations/routing-tables-and-default-routes"),
}));
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:
`pnpm vitest run src/features/catalog/catalog.repository.test.ts src/features/catalog/module-list.test.tsx src/features/lessons/lesson-content.repository.test.ts src/app/sitemap.test.ts`

Expected: FAIL because the lesson is planned and no content registry entry exists.

- [ ] **Step 3: Publish the catalog entry and register placeholder MDX modules**

Replace `plannedLesson(...)` with a published lesson object using the approved metadata and section
access values: first 12 `public`, next 4 `account`, final one `pro`. Give the Pro preview the approved
recursive lookup, ECMP, dynamic routing, policy routing, VRF, and convergence summary. Register both
MDX imports in `lesson-content.repository.ts`. Each temporary MDX file must contain a unique sentinel
paragraph so the access tests can distinguish public from account content; later tasks replace it.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/catalog src/features/lessons src/app/sitemap.test.ts src/content/networking-foundations/routing-tables-and-default-routes.*.mdx
git commit -m "feat: publish routing tables lesson shell"
```

---

### Task 2: Build the pure route-selection engine

**Files:**
- Create: `src/features/routing/routing.schema.ts`
- Create: `src/features/routing/routing.schema.test.ts`
- Create: `src/features/routing/select-route.ts`
- Create: `src/features/routing/select-route.test.ts`

**Interfaces:**
- Produces: `AddressFamily = "ipv4" | "ipv6"`.
- Produces: `RouteCandidate`, `RouteDecisionScenario`, `RouteDecisionTrace`, and `RouteOutcome`.
- Produces: `parseRouteDecisionScenario(input: unknown): RouteDecisionScenario`.
- Produces: `selectRoute(scenario: RouteDecisionScenario): RouteDecisionTrace`.

- [ ] **Step 1: Write failing schema and evaluator tests**

Cover invalid address families, malformed prefixes, family mismatches, `/32`, `/128`, `/0`, connected
routes without next hops, gateway routes with next hops, missing interfaces, and duplicate route ids.
Then assert the exact elimination order:

```ts
const trace = selectRoute(parseRouteDecisionScenario({
  id: "ordering", title: "Ordering", family: "ipv4", destination: "10.20.30.40",
  routes: [
    { id: "v6", source: "static", prefix: "2001:db8::/32", nextHop: "2001:db8::1", outgoingInterface: "Gi0/0", administrativeDistance: 1, metric: 0, metricDomain: "static" },
    { id: "broad", source: "learned", prefix: "10.0.0.0/8", nextHop: "192.0.2.1", outgoingInterface: "Gi0/1", administrativeDistance: 90, metric: 20, metricDomain: "eigrp" },
    { id: "preferred", source: "static", prefix: "10.20.30.0/24", nextHop: "192.0.2.2", outgoingInterface: "Gi0/2", administrativeDistance: 1, metric: 0, metricDomain: "static" },
  ],
}));
expect(trace.stages.map(({ criterion }) => criterion)).toEqual([
  "address-family", "prefix-match", "longest-prefix", "administrative-distance", "metric",
]);
expect(trace.outcome).toEqual({ kind: "selected", routeIds: ["preferred"] });
```

Also test no route and intentional equal-cost output.

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm vitest run src/features/routing/routing.schema.test.ts src/features/routing/select-route.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement validation and deterministic evaluation**

Use Zod for structural validation and focused IPv4/IPv6 helpers for prefix membership. Return an
immutable trace shaped as:

```ts
type RouteDecisionStage = Readonly<{
  criterion: "address-family" | "prefix-match" | "longest-prefix" | "administrative-distance" | "metric";
  candidates: readonly Readonly<{ routeId: string; status: "retained" | "rejected"; reason: string }>[];
}>;
type RouteOutcome =
  | Readonly<{ kind: "selected" | "equal-cost"; routeIds: readonly string[] }>
  | Readonly<{ kind: "no-route"; routeIds: readonly [] }>;
```

Reject metric comparison across different non-null `metricDomain` values unless the scenario marks
the candidates as an intentional equal-cost set. Do not perform recursive next-hop lookup.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/routing/routing.schema.ts src/features/routing/routing.schema.test.ts src/features/routing/select-route.ts src/features/routing/select-route.test.ts
git commit -m "feat: add deterministic route selection engine"
```

---

### Task 3: Author approved routing-table scenarios

**Files:**
- Create: `src/features/routing/route-decision.scenarios.ts`
- Create: `src/features/routing/route-decision.scenarios.test.ts`

**Interfaces:**
- Consumes: `parseRouteDecisionScenario` and `selectRoute` from Task 2.
- Produces: `routeDecisionScenarios: readonly RouteDecisionScenario[]`.

- [ ] **Step 1: Write failing authored-data tests**

Assert unique ids and coverage for connected IPv4, static preference, more-specific learned route,
IPv4 `/32`, IPv6 `/128`, IPv4 default, IPv6 default, administrative-distance tie, comparable metric
tie, intentional equal cost, and no route. For every scenario, run `selectRoute` and assert its
authored `expectedOutcome` matches the computed outcome.

- [ ] **Step 2: Run the data test and verify RED**

Run: `pnpm vitest run src/features/routing/route-decision.scenarios.test.ts`

Expected: FAIL because scenario data does not exist.

- [ ] **Step 3: Implement curated documentation-safe scenarios**

Use RFC 5737 IPv4 addresses (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`), RFC 3849 IPv6
addresses (`2001:db8::/32`), and private IPv4 destinations where instructional subnetting is needed.
Each scenario must include `plainLanguageConclusion` and `expectedOutcome` so tests catch accidental
educational drift.

- [ ] **Step 4: Run focused routing tests and verify GREEN**

Run: `pnpm vitest run src/features/routing`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/routing/route-decision.scenarios.*
git commit -m "feat: add routing decision scenarios"
```

---

### Task 4: Build the Routing Table Decision player

**Files:**
- Create: `src/features/routing/routing-table-decision-player.tsx`
- Create: `src/features/routing/routing-table-decision-player.test.tsx`
- Modify: `mdx-components.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `routeDecisionScenarios` and `selectRoute`.
- Consumes: shared playback/reduced-motion conventions and
  `useProgressCompletionBoundary(progressItemId?: string)`.
- Produces: `RoutingTableDecisionPlayer({ progressItemId?: string }): JSX.Element` registered in MDX.

- [ ] **Step 1: Write failing player tests**

Assert scenario radios, autoplay/manual controls, all shared speed choices, a captioned route table,
columns for source/prefix/next hop/interface/AD/metric, stage-by-stage retained/rejected text,
selected/default/no-route conclusions, reset on scenario change, terminal progress recording, and
paused reduced-motion state. Assert the table is inside a labelled local scroll region.

- [ ] **Step 2: Run the component test and verify RED**

Run: `pnpm vitest run src/features/routing/routing-table-decision-player.test.tsx`

Expected: FAIL because the component is absent.

- [ ] **Step 3: Implement the minimal synchronized player**

Render one stable table and update row state from `trace.stages[stepIndex]`. Keep the terminal outcome
as the final playback step. Use text such as `Rejected: wrong address family` and `Retained: longest
matching prefix`; never encode state by color alone. Pass `progressItemId` only to the existing
`markTerminalStateReached()` only when the learner reaches the terminal step, and expose the hook's
retry state using the established interactive-player pattern.

- [ ] **Step 4: Add scoped responsive styles and register MDX**

Add `.routing-decision-player` styles with `min-width: 0`, 44px controls, wrapping scenario choices,
and `.routing-table-scroll { overflow-x: auto; }`. Register `RoutingTableDecisionPlayer` in
`mdx-components.tsx`.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `pnpm vitest run src/features/routing/routing-table-decision-player.test.tsx src/app/theme-styles.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/routing/routing-table-decision-player.* mdx-components.tsx src/app/globals.css
git commit -m "feat: add routing table decision player"
```

---

### Task 5: Model hop-by-hop forwarding journeys

**Files:**
- Create: `src/features/routing/forwarding-journeys.ts`
- Create: `src/features/routing/forwarding-journeys.test.ts`

**Interfaces:**
- Consumes: route evaluation from Task 2 and existing `PacketFlowScenario` primitives where compatible.
- Produces: `ForwardingJourney` with `family`, `source`, `destination`, `initialHopLimit`, topology,
  and typed `ForwardingStep[]`.
- Produces: `forwardingJourneys: readonly ForwardingJourney[]`.

- [ ] **Step 1: Write failing journey tests**

For IPv4 and IPv6 success journeys, assert destination Layer 3 addresses never change, TTL/Hop Limit
decrements exactly once per router, and Layer 2 source/destination pairs change on every routed link.
Also assert no-route, expired TTL/Hop Limit, and unresolved-next-hop preview terminal outcomes.

```ts
expect(ipv4.steps.filter(({ kind }) => kind === "forward").map(({ hopLimit }) => hopLimit))
  .toEqual([63, 62]);
expect(new Set(ipv4.steps.map(({ destinationIp }) => destinationIp))).toEqual(new Set(["203.0.113.20"]));
expect(expired.terminal).toMatchObject({ kind: "discarded", reason: "ttl-expired" });
```

- [ ] **Step 2: Run the journey test and verify RED**

Run: `pnpm vitest run src/features/routing/forwarding-journeys.test.ts`

Expected: FAIL because the journeys do not exist.

- [ ] **Step 3: Implement typed, validated journeys**

Author successful IPv4 and IPv6 paths with a host, two routers, and destination. Every link must name
both interfaces and every forwarding step must carry the selected route id, ingress/egress devices,
Layer 2 addresses, Layer 3 addresses, and resulting TTL/Hop Limit. Model terminal failures explicitly;
the unresolved-next-hop case is explanatory and must not perform recursive lookup.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `pnpm vitest run src/features/routing/forwarding-journeys.test.ts src/features/routing/select-route.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/routing/forwarding-journeys.*
git commit -m "feat: model hop by hop routing journeys"
```

---

### Task 6: Build the Hop-by-Hop Forwarding player

**Files:**
- Create: `src/features/routing/hop-by-hop-forwarding-player.tsx`
- Create: `src/features/routing/hop-by-hop-forwarding-player.test.tsx`
- Modify: `mdx-components.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `forwardingJourneys` from Task 5 and shared topology/packet-inspector/playback primitives.
- Produces: `HopByHopForwardingPlayer({ progressItemId?: string }): JSX.Element` registered in MDX.

- [ ] **Step 1: Write failing player tests**

Assert selectable IPv4, IPv6, no-route, expiry, and unresolved-next-hop journeys; labelled interfaces;
packet inspection at each hop; unchanged IP destination; changed Layer 2 addresses; TTL/Hop Limit
decrement; responsible discard device; conditional ICMP wording; synchronized controls; terminal
progress; reduced motion; and safe static fallback for malformed data.

- [ ] **Step 2: Run the player test and verify RED**

Run: `pnpm vitest run src/features/routing/hop-by-hop-forwarding-player.test.tsx`

Expected: FAIL because the component is absent.

- [ ] **Step 3: Implement the player**

Use a recognizable host/router/destination topology and existing packet-layer presentation where its
contract fits. Display one plain-language decision card plus expandable technical fields at every
step. Treat the moving packet as decorative while keeping active device, active link, direction, and
packet changes available in visible text and a polite status region.

- [ ] **Step 4: Add responsive styles and MDX registration**

Add `.hop-by-hop-player` styles that stack inspector and topology below the desktop breakpoint and
remain usable at 390px. Register `HopByHopForwardingPlayer` in `mdx-components.tsx`.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `pnpm vitest run src/features/routing/hop-by-hop-forwarding-player.test.tsx src/features/packet-flow src/app/theme-styles.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/routing/hop-by-hop-forwarding-player.* mdx-components.tsx src/app/globals.css
git commit -m "feat: add hop by hop forwarding player"
```

---

### Task 7: Write the public and account lesson bodies

**Files:**
- Replace: `src/content/networking-foundations/routing-tables-and-default-routes.public.mdx`
- Replace: `src/content/networking-foundations/routing-tables-and-default-routes.account.mdx`
- Create: `src/content/networking-foundations/routing-tables-and-default-routes.content.test.ts`
- Modify: `src/content/lesson-rendering.test.tsx`
- Modify: `src/content/lesson-access.content.test.ts`

**Interfaces:**
- Consumes: the two MDX players, `SectionContinue`, `KnowledgeCheck`, `WiresharkCheck`,
  `InterviewScenario`, and `PremiumPreview`.
- Produces: stable headings and progress item ids matching Task 1 and Task 8.

- [ ] **Step 1: Write failing content and access tests**

Assert one learning objective, exact heading order, both public players, all twelve public conclusions,
the account sentinel boundary, Windows/Linux/network-device evidence, ICMP/ICMPv6 caveats, guided
practice, troubleshooting sequence, three knowledge checks, Pro preview, and no protected account
strings in anonymous rendered output.

- [ ] **Step 2: Run content tests and verify RED**

Run: `pnpm vitest run src/content/networking-foundations/routing-tables-and-default-routes.content.test.ts src/content/lesson-rendering.test.tsx src/content/lesson-access.content.test.ts`

Expected: FAIL because placeholder MDX lacks the approved lesson.

- [ ] **Step 3: Author the complete public MDX**

Write the twelve public sections from the spec. Place `RoutingTableDecisionPlayer` under
`interactive-route-selection` and `HopByHopForwardingPlayer` under
`interactive-hop-by-hop-forwarding`. Add `SectionContinue` to non-player public sections using the
generated `routing_tables_and_default_routes_section_*` ids.

- [ ] **Step 4: Author the account MDX and Pro preview**

Include Windows `route print`/`Get-NetRoute`, Linux `ip route`/`ip -6 route`, and representative
network-device output. Add packet evidence, guided practice, the approved troubleshooting checklist,
three `KnowledgeCheck` components with ids `routing_tables_and_default_routes_check_1` through `_3`,
and a Pro preview that defers recursive lookup and protocol best-path internals.

- [ ] **Step 5: Run content and rendering tests and verify GREEN**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content
git commit -m "feat: add routing tables lesson content"
```

---

### Task 8: Register progress and the idempotent Supabase migration

**Files:**
- Modify: `src/features/progress/progress-manifests.ts`
- Modify: `src/features/progress/progress-manifests.test.ts`
- Create: `supabase/migrations/202609100002_add_routing_tables_progress.sql`
- Create: `supabase/migrations/routing-tables-progress.test.ts`

**Interfaces:**
- Consumes: catalog sections from Task 1.
- Produces: a version-1 manifest with 18 required items: 15 non-Pro sections/players plus three
  knowledge-check items. The account `knowledge-check-summary` heading is replaced by those checks.

- [ ] **Step 1: Write failing manifest and migration tests**

Assert definition:

```ts
{
  lessonId: "lesson_routing_tables_and_default_routes",
  interactiveAnchors: ["interactive-route-selection", "interactive-hop-by-hop-forwarding"],
  knowledgeCheckCount: 3,
  knowledgeAnchor: "knowledge-check-summary",
}
```

Assert SQL contains one manifest upsert with required count 18, all stable item ids and ordinals,
`on conflict` updates, and transaction boundaries.

- [ ] **Step 2: Run progress tests and verify RED**

Run: `pnpm vitest run src/features/progress/progress-manifests.test.ts supabase/migrations/routing-tables-progress.test.ts`

Expected: FAIL because the manifest and migration are absent.

- [ ] **Step 3: Add the runtime manifest and SQL migration**

Append the exact definition above. Insert ordinals 1–15 for every non-Pro section except the summary,
then ordinals 16–18 for the knowledge checks. Use `begin;`, idempotent manifest/item upserts, and
`commit;`; do not touch learner rows, authentication, or RLS.

- [ ] **Step 4: Run progress and lesson integration tests and verify GREEN**

Run:
`pnpm vitest run src/features/progress supabase/migrations/routing-tables-progress.test.ts src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/progress supabase/migrations
git commit -m "feat: register routing lesson progress"
```

---

### Task 9: Complete integration and visual acceptance

**Files:**
- Modify if acceptance reveals a scoped issue: `src/app/globals.css`
- Modify if integration assertions are missing: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
- Modify if MDX registration assertions are missing: relevant `src/features/routing/*.test.tsx`

**Interfaces:**
- Consumes: all previous tasks.
- Produces: verified lesson route, responsive preview, and clean feature branch.

- [ ] **Step 1: Run focused feature and content suites**

Run:
`pnpm vitest run src/features/routing src/content/networking-foundations/routing-tables-and-default-routes.content.test.ts src/features/catalog src/features/lessons src/features/progress supabase/migrations/routing-tables-progress.test.ts`

Expected: PASS with no warnings attributable to the lesson.

- [ ] **Step 2: Run static verification**

Run: `pnpm typecheck`

Expected: exit 0.

Run: `pnpm lint`

Expected: exit 0.

- [ ] **Step 3: Run the complete unit suite**

Run: `pnpm test`

Expected: all test files and tests PASS.

- [ ] **Step 4: Build production output**

Run: `pnpm build`

Expected: exit 0 and the routing lesson route is generated without protected content leaking into
anonymous output.

- [ ] **Step 5: Preview and visually inspect**

Run: `pnpm dev -- --hostname 127.0.0.1 --port 3020`.

Inspect `/learn/networking-foundations/routing-tables-and-default-routes` in light and dark themes at
desktop and 390px. Verify route rows, rejection reasons, local table scrolling, scenario controls,
interface labels, packet fields, active hops, terminal/disposal states, locked account sections, and
Pro preview. Confirm no page-level horizontal overflow and no motion for reduced-motion preference.

- [ ] **Step 6: Fix only acceptance failures through TDD and rerun affected checks**

For each issue, first add the smallest failing assertion to the closest existing routing test, run it
to observe RED, make one scoped component/style correction, then rerun that test and Steps 1–4.

- [ ] **Step 7: Commit final integration**

```bash
git add src mdx-components.tsx supabase/migrations
git commit -m "test: verify routing lesson integration"
```

- [ ] **Step 8: Request code review before branch completion**

Use `superpowers:requesting-code-review`, resolve findings with
`superpowers:receiving-code-review`, rerun verification, and only then use
`superpowers:finishing-a-development-branch` to offer merge/PR choices.

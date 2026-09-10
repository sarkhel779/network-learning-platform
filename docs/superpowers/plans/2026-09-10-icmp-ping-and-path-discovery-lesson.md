# ICMP, Ping and Path Discovery Lesson Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an IPv4-only, packet-first ICMP lesson with focused ping and traceroute players, gated practice, and reliable learner progress.

**Architecture:** A focused `icmp` domain validates authored evidence and produces deterministic ping and TTL-probe journeys. Two client players render those journeys through the existing playback, packet-inspection, reduced-motion, and progress conventions; public and account MDX remain separately loaded by the authorized lesson repository.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.9, MDX 3, Zod 4, Vitest 3, Testing Library, Supabase PostgreSQL migrations.

**Spec:** `docs/superpowers/specs/2026-09-10-icmp-ping-and-path-discovery-lesson-design.md`

## Global Constraints

- Keep the scenario set IPv4-only; do not introduce ICMPv6 types, codes, or Hop Limit behavior.
- Keep both focused players and the complete conceptual method public; command/capture inspection, guided diagnosis, troubleshooting, and checks are account-locked.
- Show account entries as `Locked`; show the advanced entry as `Pro` and `Locked`.
- A timeout means no reply was observed before the deadline; never fabricate an ICMP response or infer one cause.
- Echo success proves only the authored echo exchange, not application health or path symmetry.
- A traceroute `*` means no response was observed for that probe; it does not prove the silent router failed to forward.
- Identify the reporting device separately from the intended destination for ICMP errors.
- Autoplay only after client motion preference resolves and normal motion is allowed; preserve Previous, Play/Pause, Next, Restart, speed controls, and deterministic scenario reset.
- Mark interactive progress only when a valid journey visibly reaches its terminal state; any submitted check answer counts as an attempt while correctness remains separate.
- Invalid authored data must render readable static evidence, start no hidden timer, and record no terminal completion.
- Fit desktop and 390-pixel lesson widths without page-level horizontal overflow; wide evidence may scroll only inside a labelled region.
- Do not change authentication, RLS, unrelated learner data, or existing lesson behavior.

---

### Task 1: Publish the lesson shell and enforce access boundaries

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/catalog/module-list.test.tsx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `src/app/sitemap.test.ts`
- Create: `src/content/networking-foundations/icmp-ping-and-path-discovery.public.mdx`
- Create: `src/content/networking-foundations/icmp-ping-and-path-discovery.account.mdx`

**Interfaces:**
- Produces: published lesson id `lesson_icmp_ping_and_path_discovery` and content key `networking-foundations/icmp-ping-and-path-discovery`.
- Produces: the ordered section ids consumed by MDX, progress manifests, and the migration.

- [ ] **Step 1: Write failing publication and access tests**

Assert that the lesson is published after Routing Tables and Default Routes, has the following 17 catalog sections, appears in the sitemap, and loads account content only for authenticated access:

```ts
const expectedSections = [
  "why-icmp-exists", "icmp-message-anatomy", "informational-and-error-messages",
  "echo-request-and-reply", "interactive-ping-evidence", "what-successful-ping-proves",
  "timeouts-loss-and-rtt", "destination-unreachable", "ttl-exceeded",
  "interactive-traceroute-discovery", "why-traceroute-can-be-incomplete", "safe-conclusions",
  "inspect-icmp-evidence", "guided-icmp-diagnosis", "troubleshoot-icmp",
  "knowledge-check-summary", "pro-deep-dive",
];
expect(icmpLesson).toMatchObject({
  id: "lesson_icmp_ping_and_path_discovery", published: true, estimatedMinutes: 20,
});
expect(icmpLesson?.sections?.map(({ id }) => id)).toEqual(expectedSections);
await expect(loadAuthorizedLessonContent(
  "networking-foundations/icmp-ping-and-path-discovery", "anonymous",
)).resolves.toMatchObject({ public: expect.anything(), account: undefined });
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `pnpm vitest run src/features/catalog/catalog.repository.test.ts src/features/catalog/module-list.test.tsx src/features/lessons/lesson-content.repository.test.ts src/app/sitemap.test.ts`

Expected: FAIL because the catalog entry is planned and the content registry has no ICMP modules.

- [ ] **Step 3: Publish the catalog entry and register temporary MDX modules**

Replace `plannedLesson(...)` with a published lesson. Give the first 12 sections `public` access, the next four `account` access, and the final section `pro` access. Use preview copy covering filtering/rate limiting, IPv4 Path MTU Discovery, asymmetric or deceptive paths, and platform-specific probes. Register separate public and account dynamic imports in `lesson-content.repository.ts`. Put a unique public sentinel and `ICMP_ACCOUNT_SENTINEL` in the temporary MDX files so access tests can prove protected copy is absent anonymously.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 5: Commit the publication shell**

```bash
git add src/features/catalog src/features/lessons src/app/sitemap.test.ts src/content/networking-foundations/icmp-ping-and-path-discovery.*.mdx
git commit -m "feat: publish ICMP lesson shell"
```

---

### Task 2: Build the validated ICMP evidence domain

**Files:**
- Create: `src/features/icmp/icmp.schema.ts`
- Create: `src/features/icmp/icmp.schema.test.ts`
- Create: `src/features/icmp/ping-journeys.ts`
- Create: `src/features/icmp/ping-journeys.test.ts`

**Interfaces:**
- Produces: `IcmpMessageKind = "echo-request" | "echo-reply" | "destination-unreachable" | "time-exceeded"`.
- Produces: `PingOutcome = "success" | "timeout" | "network-unreachable" | "host-unreachable" | "administratively-prohibited" | "ttl-exceeded"`.
- Produces: `IcmpEvidence`, `PingScenario`, and `PingJourneyStep` readonly types.
- Produces: `parsePingScenario(input: unknown): PingScenario` and `buildPingJourney(scenario: PingScenario): readonly PingJourneyStep[]`.

- [ ] **Step 1: Write failing schema tests for valid and impossible evidence**

Cover Echo Request type 8/code 0, Echo Reply type 0/code 0, Destination Unreachable type 3 with codes 0, 1, and 13, and Time Exceeded type 11/code 0. Reject an echo with a non-zero code, an unsupported type/code pair, a missing reporting device for an error, a timeout that contains a response packet, missing quoted-packet evidence for an error, and references to unknown devices or links.

```ts
expect(() => parsePingScenario({
  id: "bad-timeout", title: "Bad timeout", outcome: "timeout",
  sourceId: "host-a", destinationId: "host-b", requestTtl: 64,
  devices, links, response: { kind: "echo-reply", type: 0, code: 0, reporterId: "host-b" },
})).toThrow();
```

- [ ] **Step 2: Run the domain tests and verify RED**

Run: `pnpm vitest run src/features/icmp/icmp.schema.test.ts src/features/icmp/ping-journeys.test.ts`

Expected: FAIL because the ICMP domain does not exist.

- [ ] **Step 3: Implement strict Zod validation and the pure journey builder**

Represent packet presence explicitly:

```ts
type PingJourneyStep = Readonly<{
  id: string;
  title: string;
  explanation: string;
  activeDeviceIds: readonly string[];
  activeLinkIds: readonly string[];
  packet: null | Readonly<{ direction: "request" | "response"; label: string; from: string; to: string }>;
  ttl: number | null;
  evidence: readonly Readonly<{ label: string; value: string; layer: "ethernet" | "ip" | "application" }>[];
  terminal: boolean;
}>;
```

Build request forwarding, destination/reporting-device action, conditional response, and terminal conclusion deterministically. For `timeout`, end with a packetless observation step whose copy says no reply was observed before the deadline. Validate all device/link references before returning the journey.

- [ ] **Step 4: Add the six approved ping scenarios and exact outcome tests**

Export `pingScenarios` containing success, timeout, network unreachable, host unreachable, administratively prohibited, and TTL exceeded. Use RFC 5737 addresses. Assert every parsed scenario produces one terminal step, error responses name a reporter distinct from the intended destination where authored, timeout contains no response packet, and all non-timeout response types/codes match the outcome.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 6: Commit the ICMP domain**

```bash
git add src/features/icmp/icmp.schema.* src/features/icmp/ping-journeys.*
git commit -m "feat: model validated ICMP ping evidence"
```

---

### Task 3: Build the Ping and ICMP Evidence player

**Files:**
- Create: `src/features/icmp/ping-evidence-player.tsx`
- Create: `src/features/icmp/ping-evidence-player.test.tsx`
- Modify: `mdx-components.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `pingScenarios` and `buildPingJourney` from Task 2.
- Consumes: `PLAYBACK_SPEEDS`, `useReducedMotionState()`, and `useProgressCompletionBoundary(progressItemId?)`.
- Produces: `PingEvidencePlayer({ progressItemId?, scenarios? }): JSX.Element`, registered for MDX.

- [ ] **Step 1: Write failing player behavior tests**

Assert all six scenario radios, a visible source/router/destination topology, active device and link text, packet direction, TTL, ICMP type/code, reporter, quoted packet fields, and final cautious conclusion. Assert timeout shows `No response observed` and no fabricated reply. Test Previous, Play/Pause, Next, Restart, every `PLAYBACK_SPEEDS` choice, scenario reset, terminal-only progress, retry status, and paused reduced-motion hydration.

```tsx
render(<PingEvidencePlayer progressItemId="icmp_ping_and_path_discovery_interactive_interactive_ping_evidence" />);
await user.click(screen.getByLabelText("Timeout with no response"));
expect(screen.getByText(/No response observed/i)).toBeInTheDocument();
expect(screen.queryByText(/Echo Reply \(type 0, code 0\)/i)).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the component test and verify RED**

Run: `pnpm vitest run src/features/icmp/ping-evidence-player.test.tsx`

Expected: FAIL because the player does not exist.

- [ ] **Step 3: Implement synchronized playback and fail-closed rendering**

Catch schema/builder errors at the component boundary. A valid scenario advances one deterministic step per timer and shows the final result only on its terminal step. A malformed scenario renders its title, readable static evidence, and `This ICMP scenario cannot be animated safely`; it must not start a timer or call `markTerminalStateReached()`.

- [ ] **Step 4: Register MDX and add responsive, accessible styles**

Register `PingEvidencePlayer` in `mdx-components.tsx`. Add scoped `.ping-evidence-player` styles with wrapped scenario controls, 44px control targets, `min-width: 0`, textual state indicators, a polite live region, and locally scrollable packet evidence. Ensure motion is decorative and every changing state is also visible as text.

- [ ] **Step 5: Run player and style tests and verify GREEN**

Run: `pnpm vitest run src/features/icmp/ping-evidence-player.test.tsx src/app/theme-styles.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the ping player**

```bash
git add src/features/icmp/ping-evidence-player.* mdx-components.tsx src/app/globals.css
git commit -m "feat: add ping evidence player"
```

---

### Task 4: Model traceroute TTL-probe journeys

**Files:**
- Create: `src/features/icmp/traceroute-journeys.ts`
- Create: `src/features/icmp/traceroute-journeys.test.ts`

**Interfaces:**
- Consumes: validated ICMP evidence and topology primitives from Task 2.
- Produces: `TracerouteObservation`, `TracerouteScenario`, and `TracerouteJourneyStep` readonly types.
- Produces: `parseTracerouteScenario(input: unknown): TracerouteScenario`.
- Produces: `buildTracerouteJourney(scenario: TracerouteScenario): readonly TracerouteJourneyStep[]`.
- Produces: `tracerouteScenarios: readonly TracerouteScenario[]`.

- [ ] **Step 1: Write failing validation and TTL-progression tests**

Test a stable path with TTL values 1, 2, and 3: router 1 and router 2 discard their expiring probes and may report Time Exceeded; the destination responds only when TTL reaches it. Reject TTL zero, duplicate probe ids, a response from an unknown device, Time Exceeded type/code other than 11/0, a silent observation containing a response, and a completed trace with no destination response.

```ts
const steps = buildTracerouteJourney(stableScenario);
expect(steps.filter(({ phase }) => phase === "send").map(({ probeTtl }) => probeTtl)).toEqual([1, 2, 3]);
expect(steps.filter(({ response }) => response?.kind === "time-exceeded")
  .map(({ response }) => response?.reporterId)).toEqual(["router-1", "router-2"]);
expect(steps.at(-1)).toMatchObject({ terminal: true, destinationReached: true });
```

- [ ] **Step 2: Run the traceroute tests and verify RED**

Run: `pnpm vitest run src/features/icmp/traceroute-journeys.test.ts`

Expected: FAIL because traceroute journeys do not exist.

- [ ] **Step 3: Implement deterministic probe expansion**

Expand each authored probe into send, per-router decrement/forward, expiry/discard, optional response, observation, and terminal steps. Keep forward and return evidence separate. A silent observation must state `No response observed for this probe within the waiting period` while retaining evidence that later probes may continue past that hop.

- [ ] **Step 4: Author all five approved traceroute outcomes**

Export stable path, silent hop followed by later replies, changing path between probes, destination unreachable, and incomplete trace. Label the player as conceptual ICMP-based Windows-style discovery and include scenario metadata noting that implementations may use different probe transports. Assert a silent hop can be followed by a later response, changing paths preserve probe identity, unreachable identifies the reporter, and incomplete never claims destination reachability.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `pnpm vitest run src/features/icmp/traceroute-journeys.test.ts src/features/icmp/icmp.schema.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit traceroute modeling**

```bash
git add src/features/icmp/traceroute-journeys.*
git commit -m "feat: model traceroute path discovery"
```

---

### Task 5: Build the Traceroute Path Discovery player

**Files:**
- Create: `src/features/icmp/traceroute-discovery-player.tsx`
- Create: `src/features/icmp/traceroute-discovery-player.test.tsx`
- Modify: `mdx-components.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `tracerouteScenarios` and `buildTracerouteJourney` from Task 4.
- Consumes: the same playback, motion-preference, and progress boundaries as Task 3.
- Produces: `TracerouteDiscoveryPlayer({ progressItemId?, scenarios? }): JSX.Element`, registered for MDX.

- [ ] **Step 1: Write failing player tests**

Assert five selectable outcomes, a source/multiple-router/destination topology, current TTL, decrement evidence, responsible discard router, optional Time Exceeded response, recorded hop/RTT evidence, probe table, and cautious terminal conclusion. For the silent-hop scenario, assert `*` is followed by a later responding hop and the explanation says silence does not prove failure to forward. For changing paths, assert two probes can report different routers without replacing earlier evidence.

- [ ] **Step 2: Test controls, accessibility, fallback, and progress while RED**

In the same test file, cover autoplay after hydration, manual pause, Previous/Next/Restart, speed, scenario reset, reduced motion, keyboard-accessible radio controls, live status, local table scrolling, terminal-only progress, and no progress for malformed data. Run `pnpm vitest run src/features/icmp/traceroute-discovery-player.test.tsx`; expect module-not-found failure.

- [ ] **Step 3: Implement the synchronized traceroute player**

Render a persistent path topology and append observations to a labelled table with columns `Probe`, `TTL`, `Observed responder`, `RTT`, and `Meaning`. Keep the current packet marker decorative. Never hide prior observations when the next probe begins. The final state must distinguish destination reached, destination unreachable, and stopped without a destination response.

- [ ] **Step 4: Add responsive styles and register MDX**

Register `TracerouteDiscoveryPlayer`. Add `.traceroute-discovery-player` rules that wrap the topology below the desktop breakpoint, keep all controls usable at 390px, and constrain the probe table to its labelled horizontal-scroll region.

- [ ] **Step 5: Run player and shared regression tests and verify GREEN**

Run: `pnpm vitest run src/features/icmp/traceroute-discovery-player.test.tsx src/features/packet-flow src/features/progress/progress-completion-boundary.test.tsx src/app/theme-styles.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the traceroute player**

```bash
git add src/features/icmp/traceroute-discovery-player.* mdx-components.tsx src/app/globals.css
git commit -m "feat: add traceroute discovery player"
```

---

### Task 6: Write the complete public and account lesson bodies

**Files:**
- Replace: `src/content/networking-foundations/icmp-ping-and-path-discovery.public.mdx`
- Replace: `src/content/networking-foundations/icmp-ping-and-path-discovery.account.mdx`
- Create: `src/content/networking-foundations/icmp-ping-and-path-discovery.content.test.ts`
- Modify: `src/content/lesson-rendering.test.tsx`
- Modify: `src/content/lesson-access.content.test.ts`

**Interfaces:**
- Consumes: both ICMP players, `SectionContinue`, `KnowledgeCheck`, `WiresharkCheck`, `InterviewScenario`, and `PremiumPreview`.
- Produces: stable headings and progress item ids matching Tasks 1 and 7.

- [ ] **Step 1: Write failing content, rendering, and access tests**

Assert one learning objective; the exact heading order from Task 1; both players; type, code, checksum, and quoted-packet explanation; all six ping outcomes; all five traceroute outcomes; explicit timeout, RTT, `*`, asymmetry, and application-health cautions; Windows/Linux command evidence; guided diagnosis; ordered troubleshooting; three checks; and the Pro preview. Assert anonymous rendering contains all public conclusions but not `ICMP_ACCOUNT_SENTINEL`, command exercises, or check questions.

- [ ] **Step 2: Run content tests and verify RED**

Run: `pnpm vitest run src/content/networking-foundations/icmp-ping-and-path-discovery.content.test.ts src/content/lesson-rendering.test.tsx src/content/lesson-access.content.test.ts`

Expected: FAIL because the temporary MDX does not contain the approved lesson.

- [ ] **Step 3: Author the twelve-section public MDX**

Use the exact public sequence and accuracy rules in the specification. Place:

```mdx
<PingEvidencePlayer progressItemId="icmp_ping_and_path_discovery_interactive_interactive_ping_evidence" />
<TracerouteDiscoveryPlayer progressItemId="icmp_ping_and_path_discovery_interactive_interactive_traceroute_discovery" />
```

Add `SectionContinue` to every non-player public section using `icmp_ping_and_path_discovery_section_<underscore_anchor>`. Explain type/code pairings as curated examples rather than an exhaustive registry. State that ICMP errors and Time Exceeded responses may be filtered, rate-limited, or unable to return.

- [ ] **Step 4: Author account inspection, diagnosis, troubleshooting, and checks**

Include representative Windows `ping`/`tracert`, Linux `ping`/`traceroute`/`tracepath`, and Wireshark filters such as `icmp`, `icmp.type == 0`, `icmp.type == 3`, and `icmp.type == 11`. Label the exact authored traceroute method and warn that probe transport varies. Add a six-outcome diagnosis exercise and this order: verify addressing, route, gateway, local policy, remote policy, return path, then application reachability.

Create three checks with ids `icmp_ping_and_path_discovery_check_1` through `_3`: one on timeout interpretation, one on TTL/Time Exceeded, and one on a traceroute `*`. Each must include a correct index and explanation; rely on `KnowledgeCheck` to record any submission as attempted.

- [ ] **Step 5: Add the Pro preview without protected implementation**

Use `PremiumPreview` to name filtered/rate-limited ICMP, IPv4 Path MTU Discovery and fragmentation-needed evidence, asymmetric or deceptive traceroute paths, protocol-specific probes, and deeper capture diagnosis. Do not implement those scenarios in the public players.

- [ ] **Step 6: Run content tests and verify GREEN**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 7: Commit the lesson content**

```bash
git add src/content/networking-foundations/icmp-ping-and-path-discovery.* src/content/lesson-rendering.test.tsx src/content/lesson-access.content.test.ts
git commit -m "feat: add ICMP lesson content"
```

---

### Task 7: Register progress and add the idempotent Supabase migration

**Files:**
- Modify: `src/features/progress/progress-manifests.ts`
- Modify: `src/features/progress/progress-manifests.test.ts`
- Create: `supabase/migrations/202609100003_add_icmp_ping_path_progress.sql`
- Create: `supabase/migrations/icmp-ping-path-progress.test.ts`

**Interfaces:**
- Consumes: the 17 catalog sections and both interactive anchors from Task 1.
- Produces: a version-one manifest with 18 required items: 15 section/interactive items plus three checks; the Pro preview is excluded.

- [ ] **Step 1: Write failing manifest and migration tests**

Add the definition:

```ts
{
  lessonId: "lesson_icmp_ping_and_path_discovery",
  interactiveAnchors: ["interactive-ping-evidence", "interactive-traceroute-discovery"],
  knowledgeCheckCount: 3,
  knowledgeAnchor: "knowledge-check-summary",
}
```

Assert 18 unique required items, catalog-order parity, two `interactive` items, three `knowledge_check` items, and no `pro-deep-dive`. The SQL test must assert `begin;`, terminal `commit;`, the lesson id/version/count tuple, 18 unique ICMP item ids, both player anchors, three knowledge-check rows, and `on conflict` clauses for both manifest and items.

- [ ] **Step 2: Run progress tests and verify RED**

Run: `pnpm vitest run src/features/progress/progress-manifests.test.ts supabase/migrations/icmp-ping-path-progress.test.ts`

Expected: FAIL because the manifest definition and migration are absent.

- [ ] **Step 3: Register the application manifest**

Add the exact definition above to `definitions`. Confirm generated ids match the MDX component props and anchors from Task 6. Do not special-case the generic manifest builder.

- [ ] **Step 4: Write the transactional, idempotent migration**

Insert/update `public.lesson_progress_manifests` for `path_networking_foundations`, `lesson_icmp_ping_and_path_discovery`, version `1`, count `18`. Insert all items in ordinal order with `on conflict (pathway_id, lesson_id, content_version, item_id) do update`, matching the generated TypeScript manifest byte-for-byte for item id, kind, label, anchor, and required state.

- [ ] **Step 5: Run progress and migration tests and verify GREEN**

Run: `pnpm vitest run src/features/progress/progress-manifests.test.ts supabase/migrations/icmp-ping-path-progress.test.ts src/features/progress`

Expected: PASS.

- [ ] **Step 6: Commit progress registration**

```bash
git add src/features/progress/progress-manifests.* supabase/migrations/202609100003_add_icmp_ping_path_progress.sql supabase/migrations/icmp-ping-path-progress.test.ts
git commit -m "feat: register ICMP lesson progress"
```

---

### Task 8: Run full verification and inspect the rendered lesson

**Files:**
- Modify only files implicated by a failing check; do not broaden scope.

**Interfaces:**
- Consumes: the complete lesson from Tasks 1–7.
- Produces: evidence that the branch is ready for review without claiming Supabase migration deployment.

- [ ] **Step 1: Run all ICMP and lesson-boundary tests**

Run:

```bash
pnpm vitest run src/features/icmp src/content/networking-foundations/icmp-ping-and-path-discovery.content.test.ts src/features/catalog src/features/lessons src/features/progress src/content/lesson-rendering.test.tsx src/content/lesson-access.content.test.ts src/app/sitemap.test.ts supabase/migrations/icmp-ping-path-progress.test.ts
```

Expected: PASS with no unhandled timer, hydration, or accessibility warnings.

- [ ] **Step 2: Run static and production checks**

Run, separately:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Expected: every command exits 0. If a pre-existing unrelated failure occurs, capture its exact command and output; do not mask it or weaken checks.

- [ ] **Step 3: Inspect the rendered desktop and 390-pixel lesson**

Start the existing development command and visit `/learn/networking-foundations/icmp-ping-and-path-discovery`. Verify the public page server-renders without Supabase configuration, both players autoplay only with normal motion, manual controls remain synchronized, timeout contains no invented response, silent-hop `*` is followed by later evidence, the page has no horizontal overflow at 390px, and anonymous users see `Locked`/`Pro Locked` labels without protected content.

- [ ] **Step 4: Inspect authenticated boundaries without changing auth configuration**

Using the established test adapter or an already working authenticated session, confirm account content loads, each player completes only at its visible terminal state, any submitted knowledge-check answer marks attempted, and a wrong answer remains visibly incorrect. Do not repair or reconfigure external OAuth as part of this lesson.

- [ ] **Step 5: Review the diff for scope and migration safety**

Run:

```bash
git status --short
git diff --check
git diff --stat main...HEAD
git diff main...HEAD -- src/features/icmp src/content/networking-foundations/icmp-ping-and-path-discovery.public.mdx src/content/networking-foundations/icmp-ping-and-path-discovery.account.mdx src/features/catalog/catalog.data.ts src/features/progress/progress-manifests.ts supabase/migrations/202609100003_add_icmp_ping_path_progress.sql
```

Expected: only ICMP lesson, shared registration/style, tests, documentation, and the new idempotent migration are in scope; `.pnpm-store/` remains untracked and untouched.

- [ ] **Step 6: Commit any verification-only corrections**

If Step 1–5 required source corrections, stage only those named files and commit:

```bash
git commit -m "fix: complete ICMP lesson verification"
```

If no corrections were required, do not create an empty commit.

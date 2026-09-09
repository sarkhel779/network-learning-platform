# IPv6 Fundamentals Lesson Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a beginner-safe IPv6 Fundamentals lesson with accurate address tooling, two public autoplay interactives, protected practice, and durable progress tracking.

**Architecture:** Put parsing, canonical formatting, classification, prefix splitting, and solicited-node derivation in a pure `ipv6.ts` domain module. Build the address explorer and NDP/SLAAC journey as separate clients over that domain, then register split MDX, catalog metadata, routes, and progress through existing platform boundaries.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.9, MDX 3, Vitest, Testing Library, Supabase PostgreSQL migrations.

**Spec:** `docs/superpowers/specs/2026-09-10-ipv6-fundamentals-lesson-design.md`

## Global Constraints

- Keep all essential concepts and both players public; commands, evidence, exercises, troubleshooting, checks, and summary require an account.
- Account-gated contents entries display `Locked`; Pro entries display `Pro` and `Locked`.
- Use `2001:db8::/32` for globally scoped examples; do not present documentation addresses as deployable allocations.
- IPv6 has no broadcast; explain multicast acceptance separately from Ethernet forwarding.
- Present `/64` as common for SLAAC LANs, never as the only valid IPv6 prefix.
- Any submitted answer counts as an attempt while correctness remains separately visible.
- Both players autoplay, retain manual controls, respect reduced motion, and fit a 390-pixel viewport.
- Do not change authentication providers, redirects, learning-tool drawers, or deferred cosmetic rectification work.
- Write and observe a focused failing test before every production change.

---

### Task 1: Pure IPv6 address domain

**Files:**
- Create: `src/features/ipv6/ipv6.ts`
- Create: `src/features/ipv6/ipv6.test.ts`

**Interfaces:**
- Produces: `parseIpv6(input: string): ParsedIpv6`, `expandIpv6(input: string): string`, `compressIpv6(input: string): string`, `splitIpv6Prefix(input: string): Ipv6Prefix`, `classifyIpv6(input: string): Ipv6Classification`, and `deriveSolicitedNodeMulticast(input: string): string`.
- `ParsedIpv6` contains `hextets: readonly number[]`, `expanded: string`, and `compressed: string`.
- `Ipv6Prefix` contains `address`, `prefixLength`, `networkBits`, and `interfaceBits`.
- `Ipv6Classification` contains `kind: "unspecified" | "loopback" | "link-local" | "unique-local" | "global-unicast" | "multicast"`, `scope`, and `explanation`.

- [ ] **Step 1: Write failing domain tests using hand-derived literals**

```ts
expect(expandIpv6("2001:db8::1")).toBe("2001:0db8:0000:0000:0000:0000:0000:0001");
expect(compressIpv6("2001:0db8:0000:0000:0001:0000:0000:0001")).toBe("2001:db8::1:0:0:1");
expect(classifyIpv6("fe80::1").kind).toBe("link-local");
expect(deriveSolicitedNodeMulticast("2001:db8::1234:5678")).toBe("ff02::1:ff34:5678");
expect(() => parseIpv6("2001::db8::1")).toThrow("Invalid IPv6 address");
expect(() => splitIpv6Prefix("2001:db8::1/129")).toThrow("Invalid IPv6 prefix");
```

- [ ] **Step 2: Run `pnpm test -- src/features/ipv6/ipv6.test.ts`** and verify failure because `./ipv6` does not exist.
- [ ] **Step 3: Implement strict parsing and expansion** by accepting one optional `::`, validating one to four hexadecimal digits per explicit hextet, and producing exactly eight numeric hextets.
- [ ] **Step 4: Run the focused test** and verify parsing/expansion cases pass while compression/classification remain red.
- [ ] **Step 5: Implement canonical compression, classification, prefix splitting, and solicited-node derivation**. Choose the longest zero run, choose the leftmost on ties, and do not compress a single zero hextet.
- [ ] **Step 6: Add boundary cases** for `::`, `::1`, uppercase input, equal zero-run ties, `fc00::/7`, `ff00::/8`, `2001:db8::/32`, `/0`, `/128`, too many hextets, invalid hex, empty input, and embedded dotted-decimal input (explicitly rejected).
- [ ] **Step 7: Run `pnpm test -- src/features/ipv6/ipv6.test.ts` and `pnpm typecheck`** and verify both pass.
- [ ] **Step 8: Commit** with `git add src/features/ipv6 && git commit -m "feat: add IPv6 address domain"`.

### Task 2: IPv6 Address Explorer

**Files:**
- Create: `src/features/ipv6/ipv6-address-explorer.tsx`
- Create: `src/features/ipv6/ipv6-address-explorer.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: all Task 1 functions plus `useReducedMotion` and `useProgressCompletionBoundary(progressItemId)`.
- Produces: `Ipv6AddressExplorer({ progressItemId?: string }): JSX.Element`.

- [ ] **Step 1: Write a failing component test** that renders the default `2001:db8:0:0:20c:29ff:fe9c:409/64`, expects seven named stages, eight labelled hextets, expanded/canonical output, prefix/interface-bit counts, type/scope, and Previous/Play/Next/Restart/speed controls.
- [ ] **Step 2: Run `pnpm test -- src/features/ipv6/ipv6-address-explorer.test.tsx`** and verify missing-component failure.
- [ ] **Step 3: Implement the minimal explorer** with curated global, link-local, unique-local, multicast, loopback, and unspecified scenarios; reuse the domain module rather than recalculating inside the component.
- [ ] **Step 4: Run the focused test** and verify the default journey passes.
- [ ] **Step 5: Add failing interaction tests** for autoplay to the terminal stage, manual navigation pausing autoplay, deterministic restart/scenario reset, reduced-motion manual mode, valid direct input, and invalid input preserving the last valid visualization with an inline error.
- [ ] **Step 6: Implement those behaviors** using timer cleanup in `useEffect`, semantic radio/input controls, `role="status"`, and `markTerminalStateReached()` only at the last stage.
- [ ] **Step 7: Add scoped responsive styles** for eight hextets, local horizontal scrolling, 44-pixel controls, non-color prefix cues, and 390-pixel layout.
- [ ] **Step 8: Run the component test and `pnpm typecheck`** and verify pass without warnings.
- [ ] **Step 9: Commit** with `git add src/features/ipv6 src/app/globals.css && git commit -m "feat: add IPv6 address explorer"`.

### Task 3: NDP and SLAAC packet journeys

**Files:**
- Create: `src/features/ipv6/ndp-slaac-journeys.ts`
- Create: `src/features/ipv6/ndp-slaac-journeys.test.ts`
- Create: `src/features/ipv6/ndp-slaac-journey-player.tsx`
- Create: `src/features/ipv6/ndp-slaac-journey-player.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `PacketFlowScenario`, `PacketFlowPlayer`, Task 1 classification/solicited-node functions, and `useProgressCompletionBoundary` through the shared player.
- Produces: `ndpSlaacJourneys: readonly PacketFlowScenario[]` and `NdpSlaacJourneyPlayer({ progressItemId?: string }): JSX.Element`.

- [ ] **Step 1: Write failing data tests** for five scenarios: complete SLAAC, DAD conflict, router discovery, neighbour resolution, and local-versus-router delivery. Assert literal interface names, source/destination IPv6 addresses, multicast Ethernet destinations, ICMPv6 type names, and packet fields for every hop.
- [ ] **Step 2: Run `pnpm test -- src/features/ipv6/ndp-slaac-journeys.test.ts`** and verify missing-data failure.
- [ ] **Step 3: Implement typed scenarios** with the primary sequence `link-local → DAD NS → RS → RA → global address → DAD → NS/NA → delivery`; model eligible multicast fan-out separately from accepting nodes.
- [ ] **Step 4: Run the data test** and verify every scenario passes schema validation and literal protocol assertions.
- [ ] **Step 5: Write failing player tests** that assert five scenario selectors, autoplay, labelled host/switch/router interfaces, packet movement on each active link, plain/technical packet inspection, multicast fan-out, DAD failure, local delivery, and default-router delivery.
- [ ] **Step 6: Implement `NdpSlaacJourneyPlayer`** as scenario selection around `PacketFlowPlayer`, resetting via a scenario key and passing `inspectionDepthControl` and `progressItemId`.
- [ ] **Step 7: Add only IPv6-specific scoped styles** needed for long addresses and recipient labels; reuse existing topology and playback styles elsewhere.
- [ ] **Step 8: Run both IPv6 journey tests and `pnpm typecheck`** and verify pass.
- [ ] **Step 9: Commit** with `git add src/features/ipv6 src/app/globals.css && git commit -m "feat: add NDP and SLAAC journey player"`.

### Task 4: Public and account lesson content

**Files:**
- Create: `src/content/networking-foundations/ipv6-fundamentals.public.mdx`
- Create: `src/content/networking-foundations/ipv6-fundamentals.account.mdx`
- Create: `src/content/networking-foundations/ipv6-fundamentals.content.test.ts`
- Modify: `mdx-components.tsx`

**Interfaces:**
- Consumes: `Ipv6AddressExplorer`, `NdpSlaacJourneyPlayer`, `KnowledgeCheck`, `InterviewScenario`, `WiresharkCheck`, `SectionContinue`, and `PremiumPreview`.
- Produces: public and account MDX modules whose `h2` IDs exactly match Task 5 catalog sections.

- [ ] **Step 1: Write failing content tests** for the ten public and four account headings, both player tags, all address families, `fe80::/10`, `fc00::/7`, `ff00::/8`, `2001:db8::/32`, the no-broadcast statement, DAD unspecified source, Windows/Linux commands, `ipv6`/`icmpv6` filters, three knowledge checks, and Pro preview.
- [ ] **Step 2: Run `pnpm test -- src/content/networking-foundations/ipv6-fundamentals.content.test.ts`** and verify missing-file failure.
- [ ] **Step 3: Write the public MDX** in the approved ten-section sequence, placing one static explanatory conclusion with each player and using `SectionContinue` for public progress.
- [ ] **Step 4: Write the account MDX** with command evidence, capture interpretation, guided practice, troubleshooting, three attempted knowledge checks, summary, and the Pro preview.
- [ ] **Step 5: Register both player components in `mdx-components.tsx`** under the exact MDX tag names.
- [ ] **Step 6: Run the content test, lesson rendering tests, and `pnpm typecheck`** and verify pass.
- [ ] **Step 7: Commit** with `git add src/content/networking-foundations mdx-components.tsx && git commit -m "feat: write IPv6 fundamentals lesson"`.

### Task 5: Publish and route the lesson

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/catalog/module-list.test.tsx`
- Modify: `src/features/catalog/pathway-overview.test.tsx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
- Modify: `src/app/sitemap.test.ts`

**Interfaces:**
- Produces: published `lesson_ipv6_fundamentals`, anonymous/account imports, fifteen stable section records, and adjacent navigation from Subnetting Fundamentals to Routing, Routing Tables and Default Routes.

- [ ] **Step 1: Extend repository, module, pathway, route, and sitemap tests** to expect IPv6 as the next published lesson and to prove anonymous loading excludes the account sentinel.
- [ ] **Step 2: Run the focused catalog/lesson/page/sitemap tests** and verify failure because IPv6 is still planned and unregistered.
- [ ] **Step 3: Replace the IPv6 `plannedLesson(...)`** with a published record using the approved objective, SEO, 25-minute estimate, and sections: `why-ipv6-exists`, `address-structure-hex`, `expand-shorten`, `interactive-address-explorer`, `prefixes-interface-identifiers`, `address-types-scopes`, `no-broadcast`, `neighbor-discovery-icmpv6`, `interactive-ndp-slaac`, `default-router-local-delivery`, `inspect-ipv6-evidence`, `practice-ipv6`, `troubleshoot-ipv6`, `knowledge-check-summary`, and `pro-deep-dive`.
- [ ] **Step 4: Register dynamic public/account imports** for `networking-foundations/ipv6-fundamentals` in `lesson-content.repository.ts`.
- [ ] **Step 5: Run all focused tests** and verify publication, access boundaries, sitemap, static params, and adjacent navigation pass.
- [ ] **Step 6: Commit** with `git add src/features/catalog src/features/lessons src/app && git commit -m "feat: publish IPv6 fundamentals lesson"`.

### Task 6: Register durable IPv6 lesson progress

**Files:**
- Modify: `src/features/progress/progress-manifests.ts`
- Modify: `src/features/progress/progress-manifests.test.ts`
- Create: `supabase/migrations/202609100001_add_ipv6_fundamentals_progress.sql`
- Create: `supabase/migrations/ipv6-fundamentals-progress.test.ts`

**Interfaces:**
- Produces: manifest `lesson_ipv6_fundamentals`, content version `1`, required section/player/check items, and one idempotent SQL migration compatible with `202609090002_create_learner_progress.sql`.

- [ ] **Step 1: Write failing manifest and migration tests** expecting interactive anchors `interactive-address-explorer` and `interactive-ndp-slaac`, three knowledge checks, unique item IDs, contiguous positions, stable item kinds, one transaction, and an idempotent manifest upsert.
- [ ] **Step 2: Run `pnpm test -- src/features/progress/progress-manifests.test.ts supabase/migrations/ipv6-fundamentals-progress.test.ts`** and verify IPv6 definition/migration failures.
- [ ] **Step 3: Add the IPv6 definition** to `progress-manifests.ts` with `knowledgeAnchor: "knowledge-check-summary"` and `knowledgeCheckCount: 3`.
- [ ] **Step 4: Write the migration** to upsert the version-1 manifest, replace only that manifest's items, and insert all required items in manifest order without auth/provider or unrelated policy statements.
- [ ] **Step 5: Run the manifest/migration tests twice** and verify stable, duplicate-free results.
- [ ] **Step 6: Commit** with `git add src/features/progress supabase/migrations && git commit -m "feat: register IPv6 lesson progress"`.

### Task 7: Full verification and visual acceptance

**Files:**
- Modify only files required to correct regressions caused by Tasks 1–6.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: a review-ready local feature branch; do not push or create a PR without user authorization.

- [ ] **Step 1: Run `pnpm test`** and fix only lesson-introduced regressions until all tests pass.
- [ ] **Step 2: Run `pnpm typecheck` and `pnpm lint`** and resolve introduced errors or warnings.
- [ ] **Step 3: Run `pnpm build`** with valid local public Supabase configuration and verify the production build, route generation, and sitemap succeed.
- [ ] **Step 4: Start `pnpm dev -- --hostname 127.0.0.1 --port 3019`** and inspect the public lesson anonymously at desktop and 390-pixel widths in light and dark themes.
- [ ] **Step 5: Exercise both players** for hextet readability, compression, invalid input, prefix boundary, autoplay, manual controls, reduced motion, interface labels, multicast fan-out, moving packets, hop inspection, scenario reset, and local/default-router delivery.
- [ ] **Step 6: Verify access and progress behavior**: anonymous output lacks account content; an authenticated test session records section/player/check attempts; a wrong answer remains incorrect while counting as attempted; completion waits for all required items.
- [ ] **Step 7: Review `git diff main...HEAD`, run `git status --short`, and commit any verified corrections** with a narrow message naming the corrected behavior.

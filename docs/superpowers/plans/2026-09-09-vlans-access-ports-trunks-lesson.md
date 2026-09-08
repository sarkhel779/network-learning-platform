# VLANs, Access Ports and Trunks Lesson Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a beginner-first VLAN lesson with two focused interactive players and simplify account-locked contents labels.

**Architecture:** Add the lesson through the existing catalog, authorized MDX registry and MDX component map. Keep VLAN forwarding decisions in a pure evaluator, render both interactions as isolated client components, and reuse the shared packet-flow player where its topology and playback semantics fit. Use a dedicated frame-stage view for explicit 802.1Q header insertion/removal so existing packet lessons remain backward compatible.

**Tech Stack:** Next.js 15, React 19, TypeScript, MDX, Zod-backed packet-flow scenarios, Vitest, Testing Library and Playwright.

**Spec:** `docs/superpowers/specs/2026-09-09-vlans-access-ports-trunks-lesson-design.md`

## Global Constraints

- Use two focused interactive players: `VlanMembershipPlayer` and `VlanTagJourneyPlayer`.
- Account-gated contents entries show only `Locked`; Pro entries show `Pro` and `Locked`.
- Native-VLAN mismatch, allowed-VLAN mismatch and advanced inter-VLAN diagnosis remain protected Pro previews.
- Do not teach DTP, VTP, STP variants, LACP, PAgP, router-on-a-stick commands or vendor configuration.
- Access-link endpoint traffic is described as normally untagged, not universally untagged.
- VLAN and subnet remain distinct concepts.
- Every VLAN distinction uses visible text in addition to color.
- Autoplay, reduced-motion, manual controls, desktop, 390-pixel mobile and no-JavaScript behavior are required.

---

### Task 1: Simplify account-locked navigation labels

**Files:**
- Modify: `src/features/lessons/lesson-section-navigation.test.tsx`
- Modify: `src/features/lessons/lesson-section-navigation.tsx`

**Interfaces:**
- Consumes: `LessonSection.access: "public" | "account" | "pro"`
- Produces: unchanged `LessonSectionNavigation({ sections })` API with revised presentation only

- [ ] **Step 1: Write the failing navigation assertion**

Replace the account badge expectation with:

```tsx
expect(accountItem).toHaveTextContent("Locked");
expect(accountItem).not.toHaveTextContent("Free account");
expect(proItem).toHaveTextContent("Pro");
expect(proItem).toHaveTextContent("Locked");
```

- [ ] **Step 2: Run the test and confirm RED**

Run:

```powershell
node node_modules/vitest/vitest.mjs run src/features/lessons/lesson-section-navigation.test.tsx
```

Expected: failure because the account item still renders `Free account`.

- [ ] **Step 3: Render an access badge only for Pro**

Change the locked branch to:

```tsx
<div className="lesson-section-navigation__locked">
  <span>{label}</span>
  {access === "pro" ? <span className="access-label">Pro</span> : null}
  <span className="lesson-section-navigation__status">Locked</span>
  {access === "pro" && preview ? <p>{preview}</p> : null}
</div>
```

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run the command from Step 2. Expected: all navigation tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/features/lessons/lesson-section-navigation.tsx src/features/lessons/lesson-section-navigation.test.tsx
git commit -m "fix: simplify locked lesson navigation labels"
```

### Task 2: Publish the VLAN lesson through catalog and content boundaries

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/catalog/module-list.test.tsx`
- Modify: `src/features/catalog/pathway-overview.test.tsx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
- Modify: `src/app/sitemap.test.ts`
- Modify: `tests/e2e/lesson.spec.ts`
- Modify: `tests/e2e/lesson-access.spec.ts`
- Modify: `tests/e2e/pathway.spec.ts`
- Create: `src/content/networking-foundations/vlans-access-ports-and-trunks.public.mdx`
- Create: `src/content/networking-foundations/vlans-access-ports-and-trunks.account.mdx`
- Create: `src/content/networking-foundations/vlans-access-ports-and-trunks.content.test.ts`

**Interfaces:**
- Consumes: existing `Lesson`, `LessonSection`, `LessonContentRegistry` and access loader contracts
- Produces: published catalog key `networking-foundations/vlans-access-ports-and-trunks`

- [ ] **Step 1: Add failing catalog and boundary expectations**

Assert that the lesson is published, ARP points next to it, its sitemap URL occurs once, anonymous
loading omits `VLAN_ACCOUNT_SENTINEL`, and account loading includes it. Assert these ordered sections:

```ts
[
  { id: "why-vlans-exist", label: "Why VLANs exist", access: "public" },
  { id: "access-ports-and-membership", label: "Access ports and membership", access: "public" },
  { id: "interactive-vlan-membership", label: "Interactive VLAN membership", access: "public" },
  { id: "trunks-and-802-1q", label: "Trunks and 802.1Q", access: "public" },
  { id: "interactive-tag-journey", label: "Interactive tag journey", access: "public" },
  { id: "allowed-vlans-and-routing-boundary", label: "Allowed VLANs and routing boundary", access: "public" },
  { id: "read-port-and-capture-evidence", label: "Read port and capture evidence", access: "account" },
  { id: "solve-vlan-reachability", label: "Solve VLAN reachability", access: "account" },
  { id: "knowledge-check-summary", label: "Knowledge check and summary", access: "account" },
  { id: "pro-deep-dive", label: "Pro Deep Dive", access: "pro" },
]
```

- [ ] **Step 2: Run focused tests and confirm RED**

```powershell
node node_modules/vitest/vitest.mjs run src/features/catalog/catalog.repository.test.ts src/features/lessons/lesson-content.repository.test.ts src/app/sitemap.test.ts
```

Expected: the planned lesson has no content registration or published route.

- [ ] **Step 3: Replace `plannedLesson` with a published lesson record**

Keep the existing title/objective/SEO, set `estimatedMinutes: 24`, `published: true`, and use the exact
section list above. Set the Pro preview to:

```ts
"Diagnose native and allowed VLAN mismatches, trace advanced inter-VLAN paths, inspect standards-guided captures, and prepare for production and interview scenarios."
```

- [ ] **Step 4: Register both MDX imports**

Add:

```ts
"networking-foundations/vlans-access-ports-and-trunks": {
  public: () => import("@/content/networking-foundations/vlans-access-ports-and-trunks.public.mdx"),
  account: () => import("@/content/networking-foundations/vlans-access-ports-and-trunks.account.mdx"),
},
```

- [ ] **Step 5: Add minimal compilable MDX fixtures**

The public file must contain all six public `h2` IDs and temporary static explanations. The account
file must contain all three account `h2` IDs and the literal `VLAN_ACCOUNT_SENTINEL` inside an MDX
comment so boundary tests can detect server output without displaying it.

- [ ] **Step 6: Update count, route and adjacency expectations**

Increment published counts, decrement coming-later counts, add the route to sitemap/page/e2e tables,
and make VLAN the next published lesson after ARP. Do not change unrelated lesson order.

- [ ] **Step 7: Run focused tests and confirm GREEN**

Run Task 2 Step 2 plus the affected page/catalog component tests.

- [ ] **Step 8: Commit**

```powershell
git add src/features/catalog src/features/lessons/lesson-content.repository.ts src/features/lessons/lesson-content.repository.test.ts src/app tests/e2e src/content/networking-foundations/vlans-access-ports-and-trunks*
git commit -m "feat: publish VLAN lesson structure"
```

### Task 3: Implement VLAN membership decisions and Player 1

**Files:**
- Create: `src/features/vlans/evaluate-vlan-delivery.ts`
- Create: `src/features/vlans/evaluate-vlan-delivery.test.ts`
- Create: `src/features/vlans/vlan-membership-player.tsx`
- Create: `src/features/vlans/vlan-membership-player.test.tsx`
- Modify: `mdx-components.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: `evaluateVlanDelivery(input: VlanDeliveryInput): VlanDeliveryResult`
- Produces: `VlanMembershipPlayer(): JSX.Element`

Define:

```ts
export type VlanId = 10 | 20;
export type VlanAction = "broadcast" | "same-vlan-unicast" | "cross-vlan-unicast";
export type VlanDeliveryInput = {
  sourceId: "host-a" | "host-c";
  sourceVlan: VlanId;
  action: VlanAction;
  memberships: Readonly<Record<"host-a" | "host-b" | "host-c" | "host-d", VlanId>>;
};
export type VlanDeliveryResult = {
  ingressInterface: string;
  vlan: VlanId;
  eligibleHostIds: readonly string[];
  eligibleEgressInterfaces: readonly string[];
  blockedReason?: "Layer 2 boundary: different VLAN";
};
```

- [ ] **Step 1: Test pure forwarding rules**

Cover VLAN 10 broadcast to only VLAN 10 peers, ingress exclusion, VLAN 20 broadcast, same-VLAN
unicast, cross-VLAN block, and moving Host D from VLAN 20 to VLAN 10.

- [ ] **Step 2: Run evaluator tests and confirm RED**

```powershell
node node_modules/vitest/vitest.mjs run src/features/vlans/evaluate-vlan-delivery.test.ts
```

- [ ] **Step 3: Implement the pure evaluator**

Use an explicit host/interface map and filter membership by source VLAN. For broadcasts return every
same-VLAN host except the source. For same-VLAN unicast return the intended peer. For cross-VLAN
unicast return no egress and the exact blocked reason.

- [ ] **Step 4: Test the interactive component**

Assert scenario radios, full interface/VLAN labels, autoplay Pause, all broadcast packet markers,
cross-VLAN boundary text, and the Host D membership control changing the replay result.

- [ ] **Step 5: Implement `VlanMembershipPlayer`**

Create packet-flow scenarios from the evaluator result. Topology links must be named
`switch-host-a` through `switch-host-d`; broadcast steps use `fanOut: true` with every eligible link.
Use `PacketFlowPlayer autoplay inspectionDepthControl suppressHeading`, semantic fieldsets and a key
derived from scenario plus Host D membership.

- [ ] **Step 6: Register the MDX component and responsive CSS**

Expose `VlanMembershipPlayer` from `mdx-components.tsx`. Make choices wrap and become full-width at
`max-width: 35rem`; prevent horizontal page overflow.

- [ ] **Step 7: Run evaluator, component and rendering tests**

```powershell
node node_modules/vitest/vitest.mjs run src/features/vlans/evaluate-vlan-delivery.test.ts src/features/vlans/vlan-membership-player.test.tsx src/content/lesson-rendering.test.tsx
```

- [ ] **Step 8: Commit**

```powershell
git add src/features/vlans mdx-components.tsx src/app/globals.css
git commit -m "feat: add interactive VLAN membership player"
```

### Task 4: Implement the 802.1Q frame-stage model and Player 2

**Files:**
- Create: `src/features/vlans/vlan-tag-journey.data.ts`
- Create: `src/features/vlans/vlan-tag-journey.data.test.ts`
- Create: `src/features/vlans/vlan-frame-stage.tsx`
- Create: `src/features/vlans/vlan-frame-stage.test.tsx`
- Create: `src/features/vlans/vlan-tag-journey-player.tsx`
- Create: `src/features/vlans/vlan-tag-journey-player.test.tsx`
- Modify: `mdx-components.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: `getVlanTagJourney(vlan: 10 | 20): readonly VlanTagJourneyStep[]`
- Produces: `VlanFrameStage({ tagged, vlan, technical }: VlanFrameStageProps): JSX.Element`
- Produces: `VlanTagJourneyPlayer(): JSX.Element`

Define each `VlanTagJourneyStep` with `id`, `title`, `explanation`, `tagged`, `vlan`, `activeDeviceIds`,
`activeLinkIds`, `packet`, `summaryFields` and `detailFields`. The seven stages must match the design
specification exactly.

- [ ] **Step 1: Test the seven-stage data model**

Assert untagged → classified → tagged → tagged → classified → untagged → delivered; VLAN 10 and 20
must preserve their selected ID. Assert TPID `0x8100`, PCP `0`, DEI `0`, encapsulated EtherType
`0x0800`, and the statement that header edits require a newly transmitted FCS.

- [ ] **Step 2: Run data tests and confirm RED**

```powershell
node node_modules/vitest/vitest.mjs run src/features/vlans/vlan-tag-journey.data.test.ts
```

- [ ] **Step 3: Implement immutable journey data**

Return new read-only step objects for the selected VLAN. Do not modify the shared packet-flow schema.

- [ ] **Step 4: Test accessible frame unfolding**

Assert field order is Destination MAC, Source MAC, optional 802.1Q tag, EtherType, Payload, FCS;
untagged views omit the tag; tagged technical views expose TPID/PCP/DEI/VLAN ID; labels remain text,
not color-only.

- [ ] **Step 5: Implement `VlanFrameStage`**

Render a semantic ordered field strip plus a definition list. Use a single clear border around each
field. In plain-language mode label the tag `802.1Q tag — VLAN 10/20`; in technical mode unfold its
four subfields.

- [ ] **Step 6: Test and implement `VlanTagJourneyPlayer`**

Test two VLAN choices, autoplay/manual controls, seven steps, labelled interfaces, tagged trunk
markers, tag removal before Host B, and plain/technical inspection. Implement a small playback hook
using the existing reduced-motion utilities and `PLAYBACK_SPEEDS`; render the shared topology plus
`VlanFrameStage` for the selected step.

- [ ] **Step 7: Register component and styles**

Expose `VlanTagJourneyPlayer` in `mdx-components.tsx`; add scoped responsive styles for stage fields,
controls and the two-switch topology.

- [ ] **Step 8: Run focused tests and commit**

```powershell
node node_modules/vitest/vitest.mjs run src/features/vlans/vlan-tag-journey.data.test.ts src/features/vlans/vlan-frame-stage.test.tsx src/features/vlans/vlan-tag-journey-player.test.tsx
git add src/features/vlans mdx-components.tsx src/app/globals.css
git commit -m "feat: animate 802.1Q tag journey"
```

### Task 5: Write the complete public and account lesson

**Files:**
- Modify: `src/content/networking-foundations/vlans-access-ports-and-trunks.public.mdx`
- Modify: `src/content/networking-foundations/vlans-access-ports-and-trunks.account.mdx`
- Modify: `src/content/networking-foundations/vlans-access-ports-and-trunks.content.test.ts`

**Interfaces:**
- Consumes: `<VlanMembershipPlayer />`, `<VlanTagJourneyPlayer />`, `<WiresharkCheck />`,
  `<KnowledgeCheck />`, `<InterviewScenario />`, `<PremiumPreview />`
- Produces: final public and account lesson blocks

- [ ] **Step 1: Add failing content-contract tests**

Protect every public heading, both player tags, `0x8100`, VLAN/subnet distinction, access frames being
normally untagged, FCS recalculation, allowed-VLAN concept, routing boundary, STP/link-aggregation
preview, all account headings and Pro-preview phrases. Assert native/allowed mismatch solution text
and `VLAN_ACCOUNT_SENTINEL` do not appear in anonymous compiled content.

- [ ] **Step 2: Run content tests and confirm RED**

```powershell
node node_modules/vitest/vitest.mjs run src/content/networking-foundations/vlans-access-ports-and-trunks.content.test.ts
```

- [ ] **Step 3: Write the public lesson**

Follow the approved ten-part teaching sequence. Place Player 1 after access-port explanation and
Player 2 after 802.1Q explanation. Add a no-JavaScript static journey after each component. State the
office-team analogy and its security limitation. Explain VLAN versus subnet explicitly.

- [ ] **Step 4: Write account exercises**

Include a vendor-neutral port table, a sanitized tagged-frame field table, three easy-to-mid
reachability scenarios, knowledge checks, summary and interview response. Do not include protected
mismatch answers.

- [ ] **Step 5: Add the Pro preview**

Use the exact gated topics from the spec and invite users to the Pro member waitlist without implying
that payment is currently available.

- [ ] **Step 6: Run content and rendering tests, then commit**

```powershell
node node_modules/vitest/vitest.mjs run src/content/networking-foundations/vlans-access-ports-and-trunks.content.test.ts src/content/lesson-rendering.test.tsx
git add src/content/networking-foundations/vlans-access-ports-and-trunks*
git commit -m "feat: complete VLAN lesson content"
```

### Task 6: Add browser coverage and complete verification

**Files:**
- Create: `tests/e2e/vlans-access-ports-trunks.spec.ts`
- Modify: `tests/e2e/lesson-access.spec.ts` only if shared access tables require the new route

**Interfaces:**
- Consumes: published VLAN route and both interactive players
- Produces: desktop/mobile/no-JavaScript acceptance coverage

- [ ] **Step 1: Write failing Playwright journeys**

Cover:

```ts
test("keeps VLAN broadcasts inside their selected broadcast domain", async ({ page }) => {});
test("shows the 802.1Q tag added and removed across a trunk", async ({ page }) => {});
test("keeps both players usable with reduced motion on mobile", async ({ page }) => {});
test("keeps the public VLAN lesson complete without JavaScript", async ({ browser }) => {});
```

Use player-scoped selectors so duplicate Play/Pause/Next labels never create strict-mode ambiguity.

- [ ] **Step 2: Run VLAN e2e and confirm RED**

Point `PLAYWRIGHT_BASE_URL` at the selected local port and run:

```powershell
node node_modules/@playwright/test/cli.js test tests/e2e/vlans-access-ports-trunks.spec.ts
```

- [ ] **Step 3: Make only acceptance-driven corrections**

Fix selector, overflow, label or journey defects demonstrated by the failing tests. Do not add new
lesson scope.

- [ ] **Step 4: Run full verification**

```powershell
node node_modules/eslint/bin/eslint.js .
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vitest/vitest.mjs run --reporter=dot
node node_modules/next/dist/bin/next build
node node_modules/@playwright/test/cli.js test tests/e2e/vlans-access-ports-trunks.spec.ts
git diff --check
```

Expected: zero lint/type errors, all unit tests green, production build exit `0`, all VLAN browser
tests green on both configured projects, and no whitespace errors.

- [ ] **Step 5: Perform visual review**

Inspect both interactions in light and dark themes at desktop and 390-pixel mobile widths. Verify
device names, interfaces, VLAN labels, packet copies, tag fields and contents navigation are readable
without page overflow.

- [ ] **Step 6: Commit acceptance coverage and verified corrections**

```powershell
git add tests/e2e/vlans-access-ports-trunks.spec.ts tests/e2e/lesson-access.spec.ts src
git commit -m "test: verify VLAN lesson journeys"
```

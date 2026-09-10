# DHCP and Automatic Address Configuration Lesson Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an IPv4-focused DHCP lesson with exact packet inspection, public DORA and relay players, account-only practice, and Pro timing/RFC exercises.

**Architecture:** Add a focused `src/features/dhcp` domain whose Zod-validated scenario objects are the single source of packet truth. Pure builders feed reusable packet/header views and three client interactives; MDX, catalog registration, progress manifests, and an idempotent Supabase migration connect the feature to the existing lesson platform.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.9, MDX 3, Zod 4, Vitest, Testing Library, Supabase PostgreSQL.

**Spec:** `docs/superpowers/specs/2026-09-11-dhcp-automatic-address-configuration-lesson-design.md`

## Global Constraints

- IPv4 DHCP is the foundational scope; DHCPv6 and SLAAC receive only a boundary explanation outside Pro.
- Public teaching includes two complete players: direct DORA and relay/helper-address behavior.
- Direct client/server traffic uses UDP 68 to 67 and server replies use 67 to 68.
- Relay/server traffic uses UDP 67 to 67 in both directions.
- The DHCP broadcast bit, Ethernet destination, and IPv4 destination are always displayed separately.
- Every fixed BOOTP/DHCP field shows its size, value, purpose, and step-specific significance.
- The public players each include one visible failure scenario.
- Account-only sections record attempts independently from correctness.
- Pro RFC checks reveal an immediate rule, evidence, consequence, and primary reference after each answer.
- RFC 8156 is identified as DHCPv6 failover; DHCPv4 failover is not presented as an Internet-standard protocol.
- Invalid scenarios fail closed with no autoplay, navigation, or completion.
- Players complete progress only at a rendered terminal step.
- Preserve keyboard operation, 44-pixel targets, reduced motion, non-color cues, and responsive containment.
- Reuse existing dependencies and authentication behavior; add no runtime dependency.

## File map

- `src/features/dhcp/dhcp.schema.ts`: validated DHCP packet, journey, lease, and RFC-check contracts.
- `src/features/dhcp/dora-journeys.ts`: direct allocation scenarios and pure journey builder.
- `src/features/dhcp/relay-journeys.ts`: relay/helper scenarios and pure transformation builder.
- `src/features/dhcp/dhcp-packet-inspector.tsx`: reusable layered header and option inspection.
- `src/features/dhcp/dhcp-topology.tsx`: responsive direct/relay topology and active-hop rendering.
- `src/features/dhcp/dora-player.tsx`: public direct-DORA player.
- `src/features/dhcp/relay-player.tsx`: public helper-address player.
- `src/features/dhcp/lease-timing-player.tsx`: Pro lease timeline.
- `src/features/dhcp/rfc-check.tsx`: Pro immediate-feedback RFC exercise.
- `src/features/dhcp/dhcp-pro.data.ts`: timing and standards-check data.
- `src/content/networking-foundations/dhcp-and-automatic-address-configuration.{public,account,pro}.mdx`: tiered lesson bodies.
- Existing catalog, MDX registry, content registry, progress, sitemap, route, and CSS files publish the lesson.
- `supabase/migrations/202609110001_add_dhcp_progress.sql`: versioned progress registration.

---

### Task 1: Validated DHCP contracts

**Files:**
- Create: `src/features/dhcp/dhcp.schema.ts`
- Test: `src/features/dhcp/dhcp.schema.test.ts`

**Interfaces:**
- Produces: `parseDhcpScenario(input: unknown): DhcpScenario`
- Produces: `parseLeaseTimeline(input: unknown): LeaseTimeline`
- Produces: `parseRfcCheck(input: unknown): RfcCheck`
- Produces: `DhcpPacket`, `DhcpStep`, `DhcpScenario`, `LeaseTimeline`, and `RfcCheck`.

- [ ] **Step 1: Write failing schema tests**

Cover one valid direct scenario and reject duplicate step IDs, invalid IPv4 values, ports outside 0–65535, mismatched transaction IDs, direct client traffic other than 68 to 67, relay/server traffic other than 67 to 67, a relayed request without `giaddr`, an ACK without `yiaddr`, impossible `T1 >= T2`, and `T2 >= leaseSeconds`.

```ts
expect(parseDhcpScenario(validDirect).steps[0].packet.udp).toEqual({ sourcePort: 68, destinationPort: 67 });
expect(() => parseDhcpScenario({ ...validRelay, steps: relayStepsWithoutGiaddr })).toThrow(/giaddr/i);
expect(() => parseLeaseTimeline({ leaseSeconds: 3600, t1Seconds: 3000, t2Seconds: 2000, events: [] })).toThrow(/T1/i);
expect(() => parseRfcCheck({ ...validCheck, referenceUrl: "https://example.com" })).toThrow(/rfc-editor/i);
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/dhcp/dhcp.schema.test.ts`

Expected: FAIL because `dhcp.schema.ts` does not exist.

- [ ] **Step 3: Implement the contracts**

Define discriminated delivery roles and explicit packet layers:

```ts
type DhcpLeg = "client-to-server" | "server-to-client" | "relay-to-server" | "server-to-relay";
type DhcpMessageType = "DISCOVER" | "OFFER" | "REQUEST" | "ACK" | "NAK" | "DECLINE" | "RELEASE";
type DeliveryMode = "broadcast" | "unicast" | "relay-forwarded" | "silence";
type DhcpPacket = {
  messageType: DhcpMessageType;
  leg: DhcpLeg;
  ethernet: { source: string; destination: string };
  ipv4: { source: string; destination: string };
  udp: { sourcePort: number; destinationPort: number };
  bootp: {
    op: 1 | 2; htype: number; hlen: number; hops: number; xid: string;
    secs: number; flags: number; ciaddr: string; yiaddr: string;
    siaddr: string; giaddr: string; chaddr: string; sname: string;
    file: string; magicCookie: string;
  };
  options: readonly { code: number; name: string; length: number; value: string; meaning: string }[];
};
```

Use `z.ipv4()` for address fields and `superRefine` for cross-field and timeline rules. Require exactly one terminal step and a consistent `xid` per scenario.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/dhcp/dhcp.schema.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/dhcp/dhcp.schema.ts src/features/dhcp/dhcp.schema.test.ts
git commit -m "feat: validate DHCP lesson scenarios"
```

---

### Task 2: Direct DORA journey engine

**Files:**
- Create: `src/features/dhcp/dora-journeys.ts`
- Test: `src/features/dhcp/dora-journeys.test.ts`

**Interfaces:**
- Consumes: `DhcpScenario`, `DhcpStep`, and `parseDhcpScenario`.
- Produces: `doraScenarios: readonly DhcpScenario[]`.
- Produces: `buildDoraJourney(scenario: DhcpScenario): readonly DhcpStep[]`.

- [ ] **Step 1: Write failing journey tests**

Assert scenario IDs `initial-allocation`, `multiple-offers`, `request-nak`, and `server-silence`. For initial allocation, assert DORA order; 68→67 requests; 67→68 replies; stable `xid`; broadcast Discover and selecting Request; offered address in `yiaddr`; requested-IP and server-identifier options in Request; and one terminal ACK. Assert that server silence ends without inventing an Offer.

```ts
const journey = buildDoraJourney(doraScenarios.find(({ id }) => id === "initial-allocation")!);
expect(journey.map(({ packet }) => packet.messageType)).toEqual(["DISCOVER", "OFFER", "REQUEST", "ACK"]);
expect(journey[2].packet.udp).toEqual({ sourcePort: 68, destinationPort: 67 });
expect(journey[2].packet.ipv4.destination).toBe("255.255.255.255");
expect(journey.filter(({ terminal }) => terminal)).toHaveLength(1);
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/dhcp/dora-journeys.test.ts`

Expected: FAIL because the journey module does not exist.

- [ ] **Step 3: Implement direct scenarios and builder**

Use teaching addresses `192.0.2.10/24` for the offered client address and `192.0.2.1` for the server/gateway. Include message-type, client identifier, requested address, server identifier, parameter request list, subnet mask, router, DNS, lease, T1, and T2 options where applicable. Encode the actual L2/L3 destination and broadcast flag for every step; never derive all three from one Boolean.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/dhcp/dhcp.schema.test.ts src/features/dhcp/dora-journeys.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/dhcp/dora-journeys.ts src/features/dhcp/dora-journeys.test.ts
git commit -m "feat: model direct DHCP journeys"
```

---

### Task 3: Relay/helper-address journey engine

**Files:**
- Create: `src/features/dhcp/relay-journeys.ts`
- Test: `src/features/dhcp/relay-journeys.test.ts`

**Interfaces:**
- Consumes: `DhcpScenario`, `DhcpStep`, and `parseDhcpScenario`.
- Produces: `relayScenarios: readonly DhcpScenario[]`.
- Produces: `buildRelayJourney(scenario: DhcpScenario): readonly DhcpStep[]`.

- [ ] **Step 1: Write failing relay tests**

Assert scenario IDs `remote-allocation`, `missing-helper`, `wrong-scope`, and `blocked-upstream`. Verify the canonical four-leg port sequence, routed unicast on relay/server legs, `giaddr` equal to the client-facing relay address, increasing `hops`, selection of the client subnet pool, Option 82 insertion/echo/removal, and exactly one terminal result.

```ts
expect(journey.map(({ packet }) => [packet.udp.sourcePort, packet.udp.destinationPort])).toEqual([
  [68, 67], [67, 67], [67, 67], [67, 68],
]);
expect(journey[1].packet.bootp.giaddr).toBe("192.0.2.1");
expect(journey[1].packet.options.some(({ code }) => code === 82)).toBe(true);
expect(journey.at(-1)!.packet.options.some(({ code }) => code === 82)).toBe(false);
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/dhcp/relay-journeys.test.ts`

Expected: FAIL because the relay module does not exist.

- [ ] **Step 3: Implement relay scenarios and transformations**

Model client subnet `192.0.2.0/24`, relay client-facing address `192.0.2.1`, routed transit subnet `198.51.100.0/24`, and server `198.51.100.20`. Preserve `xid` and client identity, set `giaddr` and `hops` on the forwarded request, preserve/echo Option 82 only on trusted upstream legs, and remove it before client delivery.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/dhcp/dhcp.schema.test.ts src/features/dhcp/relay-journeys.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/dhcp/relay-journeys.ts src/features/dhcp/relay-journeys.test.ts
git commit -m "feat: model DHCP relay journeys"
```

---

### Task 4: Reusable topology and packet inspector

**Files:**
- Create: `src/features/dhcp/dhcp-topology.tsx`
- Create: `src/features/dhcp/dhcp-packet-inspector.tsx`
- Test: `src/features/dhcp/dhcp-packet-inspector.test.tsx`

**Interfaces:**
- Consumes: `DhcpPacket` and the active journey step.
- Produces: `DhcpTopology({ step, mode }: { step: DhcpStep; mode: "direct" | "relay" })`.
- Produces: `DhcpPacketInspector({ packet }: { packet: DhcpPacket })`.

- [ ] **Step 1: Write failing rendering tests**

Render Discover, Offer, and relayed Request packets. Assert separate Ethernet, IPv4, UDP, BOOTP/DHCP, and Options regions; all fixed field names; sizes; values; purpose text; step-specific significance; explicit broadcast-bit/L2/L3 delivery rows; interface labels; relay transformations; and a locally scrollable options table.

```tsx
render(<DhcpPacketInspector packet={discover.packet} />);
expect(screen.getByText("UDP source port").closest("tr")).toHaveTextContent("16 bits 68");
expect(screen.getByText("flags").closest("tr")).toHaveTextContent("broadcast bit");
expect(screen.getByText("siaddr").closest("tr")).toHaveTextContent("next server");
expect(screen.getByRole("region", { name: "DHCP options" })).toHaveClass("table-scroll");
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/dhcp/dhcp-packet-inspector.test.tsx`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement semantic inspection and topology**

Use HTML tables for field semantics and an SVG with labelled interfaces for topology. Keep header metadata in a fixed descriptor list so every field consistently shows `bits`, `purpose`, and `significance(packet)`. Render delivery evidence as three independent rows:

```ts
const deliveryEvidence = [
  ["DHCP broadcast flag", packet.bootp.flags & 0x8000 ? "set" : "clear"],
  ["IPv4 destination", packet.ipv4.destination],
  ["Ethernet destination", packet.ethernet.destination],
] as const;
```

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/dhcp/dhcp-packet-inspector.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/dhcp/dhcp-topology.tsx src/features/dhcp/dhcp-packet-inspector.tsx src/features/dhcp/dhcp-packet-inspector.test.tsx
git commit -m "feat: add DHCP packet inspection views"
```

---

### Task 5: Public direct-DORA player

**Files:**
- Create: `src/features/dhcp/dora-player.tsx`
- Test: `src/features/dhcp/dora-player.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `doraScenarios`, `buildDoraJourney`, `DhcpTopology`, `DhcpPacketInspector`, `TransportPlayerControls`, `useReducedMotionState`, and `useProgressCompletionBoundary`.
- Produces: `DoraPlayer({ progressItemId?, scenarios? })`.

- [ ] **Step 1: Write failing player tests**

Cover four selectors, autoplay once, Previous/Play/Pause/Next/Restart/speeds, reset on scenario change, synchronized DORA/state/packet views, server-silence outcome, reduced-motion pause, terminal-only completion, retry, and invalid-data fallback with no timer or completion.

```tsx
renderPlayer();
expect(screen.getByRole("heading", { name: "DHCPDISCOVER" })).toBeVisible();
await user.click(screen.getByRole("button", { name: "Next" }));
expect(screen.getByRole("heading", { name: "DHCPOFFER" })).toBeVisible();
expect(screen.getByText("67 → 68")).toBeVisible();
expect(markComplete).not.toHaveBeenCalled();
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/dhcp/dora-player.test.tsx`

Expected: FAIL because `DoraPlayer` does not exist.

- [ ] **Step 3: Implement the player**

Parse and build inside guarded `useMemo`, run one cancellable autoplay timer, stop at the visible terminal step, and use the shared transport control component to preserve the standardized buttons. Place topology, stage status, controls, state, inspector, explanation, and outcome in separate responsive blocks.

- [ ] **Step 4: Verify GREEN and styles**

Run: `pnpm vitest run src/features/dhcp/dora-player.test.tsx src/app/theme-styles.test.ts`

Expected: PASS, with controls wrapping and no page-level horizontal overflow.

- [ ] **Step 5: Commit**

```powershell
git add src/features/dhcp/dora-player.tsx src/features/dhcp/dora-player.test.tsx src/app/globals.css src/app/theme-styles.test.ts
git commit -m "feat: add direct DHCP DORA player"
```

---

### Task 6: Public relay/helper-address player

**Files:**
- Create: `src/features/dhcp/relay-player.tsx`
- Test: `src/features/dhcp/relay-player.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `relayScenarios`, `buildRelayJourney`, `DhcpTopology`, `DhcpPacketInspector`, and the same playback/progress primitives as Task 5.
- Produces: `DhcpRelayPlayer({ progressItemId?, scenarios? })`.

- [ ] **Step 1: Write failing relay-player tests**

Cover all scenarios and controls; assert visible two-domain traversal; 68→67 then 67→67 then 67→67 then 67→68; `giaddr`; pool selection; Option 82 insertion/removal; missing-helper terminal failure; terminal-only progress; reduced motion; and invalid-data fallback.

```tsx
expect(screen.getByText("Client broadcast domain")).toBeVisible();
expect(screen.getByText("Server subnet")).toBeVisible();
await advanceTo("Relay forwards request");
expect(screen.getByText("192.0.2.1", { selector: "td" })).toBeVisible();
expect(screen.getByText("67 → 67")).toBeVisible();
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/dhcp/relay-player.test.tsx`

Expected: FAIL because `DhcpRelayPlayer` does not exist.

- [ ] **Step 3: Implement the relay player**

Reuse the Task 5 state machine and inspection components. Render transformation notes before and after the relay, label every interface, and make the active hop and delivery class readable without color.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/dhcp/relay-player.test.tsx src/features/dhcp/dora-player.test.tsx src/app/theme-styles.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/dhcp/relay-player.tsx src/features/dhcp/relay-player.test.tsx src/app/globals.css src/app/theme-styles.test.ts
git commit -m "feat: add DHCP relay player"
```

---

### Task 7: Pro timing diagram and RFC checks

**Files:**
- Create: `src/features/dhcp/dhcp-pro.data.ts`
- Create: `src/features/dhcp/lease-timing-player.tsx`
- Create: `src/features/dhcp/rfc-check.tsx`
- Test: `src/features/dhcp/dhcp-pro.test.tsx`

**Interfaces:**
- Consumes: `parseLeaseTimeline`, `parseRfcCheck`, playback primitives, and `KnowledgeCheck` interaction conventions.
- Produces: `dhcpLeaseTimelines`, `dhcpRfcChecks`.
- Produces: `LeaseTimingPlayer()` and `DhcpRfcCheck({ check }: { check: RfcCheck })`.

- [ ] **Step 1: Write failing Pro-component tests**

Assert initial allocation, Bound, T1 Renewing, T2 Rebinding, renewed ACK, expiry, NAK, Decline, and Release states. Cover normal, delayed, retry/silence, and relay-delay modes. For RFC checks, submit correct and incorrect answers and immediately assert classification, paraphrased rule, packet evidence, operational consequence, and an `https://www.rfc-editor.org/` link.

```tsx
await user.click(screen.getByLabelText("The client may keep the address after lease expiry"));
await user.click(screen.getByRole("button", { name: "Check answer" }));
expect(screen.getByRole("status")).toHaveTextContent("Incorrect");
expect(screen.getByText(/address is no longer valid/i)).toBeVisible();
expect(screen.getByRole("link", { name: /RFC 2131/i })).toHaveAttribute("href", expect.stringContaining("rfc-editor.org"));
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/dhcp/dhcp-pro.test.tsx`

Expected: FAIL because the Pro modules do not exist.

- [ ] **Step 3: Implement timing and immediate feedback**

Build timeline points from validated seconds rather than CSS percentages. Display elapsed time, client state, destination mode, packet evidence, and lease validity at every point. Define RFC checks for RFC 2131, 2132, 3046, 3118, 3442, 6607, and DHCPv6-only RFC 8156. Label DHCPv4 failover examples as vendor-specific.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/dhcp/dhcp.schema.test.ts src/features/dhcp/dhcp-pro.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/dhcp/dhcp-pro.data.ts src/features/dhcp/lease-timing-player.tsx src/features/dhcp/rfc-check.tsx src/features/dhcp/dhcp-pro.test.tsx
git commit -m "feat: add advanced DHCP timing and RFC practice"
```

---

### Task 8: Author tiered lesson content

**Files:**
- Create: `src/content/networking-foundations/dhcp-and-automatic-address-configuration.public.mdx`
- Create: `src/content/networking-foundations/dhcp-and-automatic-address-configuration.account.mdx`
- Create: `src/content/networking-foundations/dhcp-and-automatic-address-configuration.pro.mdx`
- Test: `src/content/networking-foundations/dhcp-and-automatic-address-configuration.content.test.ts`

**Interfaces:**
- Consumes: `DoraPlayer`, `DhcpRelayPlayer`, `LeaseTimingPlayer`, `DhcpRfcCheck`, `SectionContinue`, `KnowledgeCheck`, `WiresharkCheck`, `InterviewScenario`, and `PremiumPreview`.
- Produces: public, account, and Pro MDX modules for the canonical lesson key.

- [ ] **Step 1: Write failing content tests**

Assert the exact public and account headings from the spec; two public player tags with stable progress IDs; direct and relay port language; all fixed header field names; DHCPv6/SLAAC boundary wording; six account failure cases; three knowledge checks; the Pro timing player; immediate RFC checks; and explicit DHCPv4-versus-DHCPv6 failover wording.

```ts
expect(publicMdx).toContain('<DoraPlayer progressItemId="dhcp_automatic_address_configuration_interactive_interactive_dora_journey" />');
expect(publicMdx).toContain("UDP 67 to UDP 67");
expect(proMdx).toContain("RFC 8156 defines DHCPv6 failover");
expect(accountMdx.match(/<KnowledgeCheck /g)).toHaveLength(3);
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/content/networking-foundations/dhcp-and-automatic-address-configuration.content.test.ts`

Expected: FAIL because the MDX files do not exist.

- [ ] **Step 3: Write the lesson bodies**

Keep each public section beginner-first while retaining exact packet values. Put packet inspection, diagnosis, six failure causes, and checks in account MDX. Put timing, RFC exercises, security, Option 82 depth, policy, DHCPv4 HA/vendor behavior, and DHCPv6 advanced boundaries in Pro MDX. Add primary RFC links in the Pro references.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/content/networking-foundations/dhcp-and-automatic-address-configuration.content.test.ts src/content/lesson-access.content.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/content/networking-foundations/dhcp-and-automatic-address-configuration.*
git commit -m "feat: author DHCP automatic configuration lesson"
```

---

### Task 9: Publish the lesson and register components

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `mdx-components.tsx`
- Modify: `src/content/lesson-rendering.test.tsx`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
- Modify: `src/app/sitemap.test.ts`

**Interfaces:**
- Consumes: all lesson components and MDX modules from Tasks 5–8.
- Produces: a published catalog entry and authorized content loader for anonymous, account, and Pro viewers.

- [ ] **Step 1: Write failing publication tests**

Expect the DHCP lesson after TCP/UDP and before DNS, `published: true`, the complete ordered public/account/Pro section list, previous/next navigation, canonical route rendering, sitemap inclusion, anonymous public-only loading, account public+account loading, and Pro loading of all three blocks.

```ts
expect(getLessonNavigation("networking-foundations", "dhcp-and-automatic-address-configuration")).toEqual({
  previous: { slug: "tcp-udp-and-ports", published: true },
  next: { slug: "dns-and-name-resolution", published: false },
});
expect(await loadAuthorizedLessonContent(key, "pro")).toMatchObject({ public: expect.anything(), account: expect.anything(), pro: expect.anything() });
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/catalog/catalog.repository.test.ts src/features/lessons/lesson-content.repository.test.ts src/content/lesson-rendering.test.tsx src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts src/app/sitemap.test.ts`

Expected: FAIL because DHCP remains planned and its modules/components are unregistered.

- [ ] **Step 3: Register and publish**

Replace the DHCP `plannedLesson` entry with a published lesson. Use stable public anchors `why-automatic-configuration-exists`, `dhcp-roles`, `udp-ports-67-68`, `broadcast-unicast-rules`, `dhcp-packet-structure`, `interactive-dora-journey`, `lease-contents`, `lease-lifecycle`, `interactive-relay-helper`, `dhcp-boundaries`, `dhcp-evidence`, and `summary`; account anchors `inspect-dhcp-evidence`, `guided-dora-diagnosis`, `guided-relay-diagnosis`, `troubleshoot-dhcp`, and `knowledge-check-summary`; and Pro anchors `lease-timing-diagram`, `rfc-level-checks`, and `pro-deep-dive`.

Register the three MDX imports and four interactive component names.

- [ ] **Step 4: Verify GREEN**

Run the Step 2 command.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/catalog src/features/lessons mdx-components.tsx src/content/lesson-rendering.test.tsx src/app/learn src/app/sitemap.test.ts
git commit -m "feat: publish DHCP automatic configuration lesson"
```

---

### Task 10: Progress manifest and Supabase migration

**Files:**
- Modify: `src/features/progress/progress-manifests.ts`
- Modify: `src/features/progress/progress-manifests.test.ts`
- Create: `supabase/migrations/202609110001_add_dhcp_progress.sql`
- Create: `supabase/migrations/dhcp-progress.test.ts`

**Interfaces:**
- Consumes: the published catalog section order from Task 9.
- Produces: `lesson_dhcp_and_automatic_address_configuration` content version 1 with both public interactives and three knowledge checks.

- [ ] **Step 1: Write failing manifest and migration tests**

Assert a runtime manifest exists; Pro sections are excluded from required completion; both public player anchors are interactive items; three check IDs exist; the required count matches all public/account non-summary items plus checks; SQL is transactional and idempotent; ordinals/IDs/anchors match runtime output exactly.

```ts
expect(manifest.items.filter(({ kind }) => kind === "interactive").map(({ anchor }) => anchor)).toEqual([
  "interactive-dora-journey", "interactive-relay-helper",
]);
expect(manifest.items.some(({ anchor }) => anchor === "lease-timing-diagram")).toBe(false);
expect(sql.trimStart()).toMatch(/^begin;/);
expect(sql.trimEnd()).toMatch(/commit;$/);
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/progress/progress-manifests.test.ts supabase/migrations/dhcp-progress.test.ts`

Expected: FAIL because the DHCP definition and SQL migration do not exist.

- [ ] **Step 3: Implement runtime and database manifests**

Add:

```ts
{
  lessonId: "lesson_dhcp_and_automatic_address_configuration",
  interactiveAnchors: ["interactive-dora-journey", "interactive-relay-helper"],
  knowledgeCheckCount: 3,
  knowledgeAnchor: "knowledge-check-summary",
}
```

Generate the SQL rows from the final runtime manifest order. Wrap manifest and item upserts in `begin;`/`commit;` and use both established conflict keys so rerunning the migration is safe.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/progress/progress-manifests.test.ts supabase/migrations/dhcp-progress.test.ts src/features/progress/lesson-progress-context.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/progress/progress-manifests.ts src/features/progress/progress-manifests.test.ts supabase/migrations/202609110001_add_dhcp_progress.sql supabase/migrations/dhcp-progress.test.ts
git commit -m "feat: track DHCP lesson progress"
```

---

### Task 11: Responsive integration and final verification

**Files:**
- Modify: `src/app/globals.css` only for verified DHCP-specific gaps.
- Modify: `src/app/theme-styles.test.ts` for each added responsive rule.
- Modify: focused DHCP tests when integration exposes an untested boundary.

**Interfaces:**
- Consumes: the complete lesson from Tasks 1–10.
- Produces: release-ready behavior at desktop and narrow widths.

- [ ] **Step 1: Add failing integration assertions for visual boundaries**

Assert controls use the established `.player-controls` styling, topology has an adequate viewBox for every label, packet markers avoid device text, tables scroll locally, two-domain labels remain visible, and the narrow layout stacks without page-level overflow.

```ts
expect(css).toMatch(/\.dhcp-player[\s\S]*min-width:\s*0/);
expect(css).toMatch(/\.dhcp-packet-inspector[\s\S]*overflow-x:\s*auto/);
expect(css).not.toMatch(/\.dhcp-player[\s\S]*width:\s*\d{4}px/);
```

- [ ] **Step 2: Run the focused suite and confirm RED only for missing integration rules**

Run: `pnpm vitest run src/features/dhcp src/content/networking-foundations/dhcp-and-automatic-address-configuration.content.test.ts src/app/theme-styles.test.ts supabase/migrations/dhcp-progress.test.ts`

Expected: only newly introduced visual-boundary assertions fail.

- [ ] **Step 3: Implement minimal responsive fixes and inspect the preview**

Start `pnpm dev -p 3022`. Inspect the public lesson at desktop and approximately 360 CSS pixels wide. Exercise every scenario, final step, speed control, header expander/table, reduced-motion path, account gate, and Pro gate. Correct only reproducible containment, focus, labeling, or contrast defects and add a regression assertion for each correction.

- [ ] **Step 4: Run complete verification**

Stop the development server before the production build. Run sequentially:

```powershell
pnpm vitest run
pnpm typecheck
pnpm lint
pnpm build
git diff --check
git status --short
```

Expected: all tests pass; typecheck, lint, and build exit 0; no whitespace errors; only intentional files remain before commit.

- [ ] **Step 5: Commit final integration changes**

```powershell
git add src/app/globals.css src/app/theme-styles.test.ts src/features/dhcp src/content/networking-foundations supabase/migrations
git commit -m "style: finalize DHCP lesson experience"
```

Record the exact test-file count, test count, typecheck result, lint result, build result, and preview URL in the completion handoff.


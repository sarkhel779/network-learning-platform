# DNS and Name Resolution Lesson Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a packet-first DNS lesson with two public interactive players, free-account evidence practice, and Pro timing, Wireshark, RFC, DNSSEC, and root-bootstrap material.

**Architecture:** Add a focused `src/features/dns` domain whose Zod-validated scenario objects are the sole source of DNS packet, delegation, cache, and outcome facts. Pure builders feed shared topology, message-inspector, playback, troubleshooting, and Pro components; tiered MDX and existing catalog/progress infrastructure publish the lesson without changing authentication or adding dependencies.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.9, MDX 3, Zod 4, Vitest, Testing Library, Supabase PostgreSQL.

**Spec:** `docs/superpowers/specs/2026-09-11-dns-and-name-resolution-lesson-design.md`

## Global Constraints

- Public content includes one complete resolution player and one troubleshooting player.
- The stub requests recursive service; the recursive resolver performs iterative upstream work.
- Scenario data is the only source of packet flags, roles, records, cache state, and outcomes.
- Use deterministic authored evidence and documentation-safe names/addresses; send no live DNS traffic.
- UDP and TCP port 53 behavior, EDNS, truncation, and encrypted-DNS boundaries must be precise.
- NODATA is NOERROR without the requested type; timeout is not a DNS response code.
- Account exercises record every submitted attempt independently of correctness.
- Pro checks provide immediate rule, evidence, consequence, and RFC reference feedback.
- The trailing-dot and root-server-discovery bonus is Pro-only.
- Invalid scenarios fail closed with no autoplay, navigation, or progress completion.
- Progress completes players only at rendered terminal steps; Pro material is not required.
- Reuse the shared outlined controls, 44-pixel targets, reduced-motion behavior, and responsive containment.
- Add no runtime dependency and make no authentication changes.

## File map

- `src/features/dns/dns.schema.ts`: DNS names, messages, records, cache events, journeys, incidents, and Pro-check contracts.
- `src/features/dns/resolution-journeys.ts`: cold/warm cache, CNAME, AAAA, TCP fallback, and NXDOMAIN scenarios.
- `src/features/dns/dns-message-inspector.tsx`: header and four-section packet inspection.
- `src/features/dns/dns-topology.tsx`: role-aware responsive topology and active exchange.
- `src/features/dns/dns-journey-player.tsx`: shared accessible playback shell.
- `src/features/dns/resolution-player.tsx`: public complete-resolution experience.
- `src/features/dns/troubleshooting-scenarios.ts`: deterministic incidents and evidence.
- `src/features/dns/troubleshooting-player.tsx`: prediction, submission, explanation, and attempt tracking.
- `src/features/dns/dns-pro.data.ts`: timing events, RFC checks, Wireshark evidence, DNSSEC, and root-bootstrap data.
- `src/features/dns/dns-timing-player.tsx`, `dns-rfc-check.tsx`, and `root-bootstrap-player.tsx`: Pro experiences.
- `src/content/networking-foundations/dns-and-name-resolution.{public,account,pro}.mdx`: tiered teaching bodies.
- Existing catalog, MDX registry, content repository, progress, route, sitemap, and style files publish the lesson.
- `supabase/migrations/202609110002_add_dns_progress.sql`: versioned progress registration.

---

### Task 1: Validated DNS contracts

**Files:**
- Create: `src/features/dns/dns.schema.ts`
- Test: `src/features/dns/dns.schema.test.ts`

**Interfaces:**
- Produces: `parseDnsScenario(input: unknown): DnsScenario`
- Produces: `parseDnsIncident(input: unknown): DnsIncident`
- Produces: `parseDnsTiming(input: unknown): DnsTimingScenario`
- Produces: `parseDnsRfcCheck(input: unknown): DnsRfcCheck`
- Produces: `DnsMessage`, `DnsRecord`, `DnsStep`, `DnsScenario`, `DnsIncident`, `DnsTimingScenario`, and `DnsRfcCheck`.

- [ ] **Step 1: Write failing contract tests**

Cover one valid response and reject malformed absolute names, duplicate step IDs, ports outside 1–65535, a response without `QR`, a query with `AA`, incorrect section counts, a cyclic CNAME chain, negative caching without SOA evidence, contradictory response classifications, and anything other than one terminal step.

```ts
expect(parseDnsScenario(validScenario).steps[1].message.header.qr).toBe(true);
expect(() => parseDnsScenario(withWrongAnswerCount)).toThrow(/ANCOUNT/i);
expect(() => parseDnsScenario(withCnameCycle)).toThrow(/CNAME cycle/i);
expect(() => parseDnsScenario(nxdomainWithoutSoa)).toThrow(/SOA/i);
expect(() => parseDnsRfcCheck({ ...validCheck, referenceUrl: "https://example.com" })).toThrow(/rfc-editor/i);
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/dns/dns.schema.test.ts`

Expected: FAIL because `dns.schema.ts` does not exist.

- [ ] **Step 3: Implement minimal contracts and cross-field validation**

```ts
export type DnsHeader = {
  id: string; qr: boolean; opcode: number; aa: boolean; tc: boolean;
  rd: boolean; ra: boolean; ad: boolean; cd: boolean; rcode: DnsRcode;
  qdCount: number; anCount: number; nsCount: number; arCount: number;
};
export type DnsMessage = {
  transport: "UDP" | "TCP"; sourcePort: number; destinationPort: 53 | number;
  header: DnsHeader; question: readonly DnsQuestion[];
  answer: readonly DnsRecord[]; authority: readonly DnsRecord[];
  additional: readonly DnsRecord[];
};
export const parseDnsScenario = (input: unknown): DnsScenario => dnsScenarioSchema.parse(input);
```

Use discriminated record schemas for `A`, `AAAA`, `CNAME`, `NS`, `SOA`, `MX`, `TXT`, `PTR`, `SRV`, `CAA`, and `OPT`; use `superRefine` for counts, flags, CNAME cycles, terminal state, and negative-cache evidence.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/dns/dns.schema.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/dns/dns.schema.ts src/features/dns/dns.schema.test.ts
git commit -m "feat: validate DNS lesson scenarios"
```

---

### Task 2: Complete-resolution journey engine

**Files:**
- Create: `src/features/dns/resolution-journeys.ts`
- Test: `src/features/dns/resolution-journeys.test.ts`

**Interfaces:**
- Consumes: `DnsScenario`, `DnsStep`, and `parseDnsScenario`.
- Produces: `resolutionScenarios: readonly DnsScenario[]`.
- Produces: `buildResolutionJourney(scenario: DnsScenario): readonly DnsStep[]`.

- [ ] **Step 1: Write failing journey tests**

Assert scenario IDs `cold-cache`, `warm-cache`, `cname-chain`, `aaaa-answer`, `truncated-tcp-retry`, and `nxdomain`. Verify client-to-resolver recursive service, root/TLD/authority iterative work, referrals in Authority, glue in Additional, stable question identity, cache events, port/transport choices, TC-to-TCP retry, SOA-backed NXDOMAIN, and exactly one terminal result.

```ts
const steps = buildResolutionJourney(resolutionScenarios.find(({ id }) => id === "cold-cache")!);
expect(steps[0].roles).toEqual({ sender: "stub", receiver: "recursive" });
expect(steps[0].message.header.rd).toBe(true);
expect(steps.some(({ classification }) => classification === "referral")).toBe(true);
expect(steps.at(-1)?.classification).toBe("answer");
expect(steps.filter(({ terminal }) => terminal)).toHaveLength(1);
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/dns/resolution-journeys.test.ts`

Expected: FAIL because the journey module does not exist.

- [ ] **Step 3: Implement deterministic journeys**

Use `www.example.test.` and documentation addresses such as `192.0.2.53`, `198.51.100.53`, and `203.0.113.80`. Each step explicitly authors its roles, direction, message, cache decision, explanation, evidence cue, and terminal status.

```ts
export const resolutionScenarios = rawScenarios.map(parseDnsScenario);
export function buildResolutionJourney(scenario: DnsScenario) {
  return scenario.steps;
}
```

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/dns/dns.schema.test.ts src/features/dns/resolution-journeys.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/dns/resolution-journeys.ts src/features/dns/resolution-journeys.test.ts
git commit -m "feat: model recursive DNS journeys"
```

---

### Task 3: Shared DNS topology and message inspector

**Files:**
- Create: `src/features/dns/dns-topology.tsx`
- Create: `src/features/dns/dns-message-inspector.tsx`
- Test: `src/features/dns/dns-message-inspector.test.tsx`

**Interfaces:**
- Consumes: `DnsStep`.
- Produces: `DnsTopology({ step }: { step: DnsStep })`.
- Produces: `DnsMessageInspector({ message }: { message: DnsMessage })`.

- [ ] **Step 1: Write failing rendering tests**

```tsx
render(<DnsMessageInspector message={response} />);
expect(screen.getByRole("table", { name: /dns header/i })).toHaveTextContent("ANCOUNT");
expect(screen.getByRole("region", { name: /authority section/i })).toHaveTextContent("NS");
expect(screen.getByRole("region", { name: /additional section/i })).toHaveTextContent("A");
render(<DnsTopology step={referralStep} />);
expect(screen.getByText(/recursive resolver to root/i)).toBeVisible();
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/dns/dns-message-inspector.test.tsx`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement semantic, responsive views**

Render all header fields with values and meanings, then four labelled sections with owner, type, class, TTL, RDLENGTH, decoded RDATA, and purpose. Render a stable six-role topology and mark only the authored active exchange. Put wide record tables inside a labelled `tabIndex={0}` scroll region.

```tsx
<div className="packet-table-scroll" role="region" aria-label="DNS Answer section" tabIndex={0}>
  <table><caption>Answer records in this message</caption>{/* validated rows */}</table>
</div>
```

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/dns/dns-message-inspector.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/dns/dns-topology.tsx src/features/dns/dns-message-inspector.tsx src/features/dns/dns-message-inspector.test.tsx
git commit -m "feat: add DNS packet inspection views"
```

---

### Task 4: Public complete-resolution player

**Files:**
- Create: `src/features/dns/dns-journey-player.tsx`
- Create: `src/features/dns/resolution-player.tsx`
- Test: `src/features/dns/resolution-player.test.tsx`

**Interfaces:**
- Consumes: `DnsScenario`, `DnsTopology`, `DnsMessageInspector`, `useReducedMotion`, and `useLessonProgress`.
- Produces: `DnsJourneyPlayer({ scenario, progressItemId }: DnsJourneyPlayerProps)`.
- Produces: `DnsResolutionPlayer({ progressItemId }: { progressItemId: string })`.

- [ ] **Step 1: Write failing behavior tests**

Verify all six scenarios, synchronized topology/message/cache/explanation, Previous/Pause/Next/Restart/speed controls, one autoplay, reduced-motion manual mode, reset on scenario change, terminal-only completion, no completion for invalid data, and consistent outlined 44-pixel controls.

```tsx
render(<DnsResolutionPlayer progressItemId="dns_name_resolution_interactive_complete_resolution" />);
expect(screen.getByRole("combobox", { name: /scenario/i })).toHaveValue("cold-cache");
await user.click(screen.getByRole("button", { name: "Next" }));
expect(screen.getByRole("region", { name: /active dns exchange/i })).toHaveTextContent(/root/i);
expect(markComplete).not.toHaveBeenCalled();
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/dns/resolution-player.test.tsx`

Expected: FAIL because the player modules do not exist.

- [ ] **Step 3: Implement the shared shell and public wrapper**

Follow the DHCP player's control order and CSS conventions. Compute every displayed value from the selected validated `DnsStep`. Call `markItemComplete(progressItemId)` only after the rendered terminal step is reached.

```ts
const current = scenario.steps[stepIndex];
const terminalReached = current.terminal && stepIndex === scenario.steps.length - 1;
useEffect(() => { if (terminalReached) void markItemComplete(progressItemId); }, [terminalReached, progressItemId, markItemComplete]);
```

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/dns/resolution-player.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/dns/dns-journey-player.tsx src/features/dns/resolution-player.tsx src/features/dns/resolution-player.test.tsx
git commit -m "feat: add interactive DNS resolution player"
```

---

### Task 5: DNS troubleshooting scenarios and player

**Files:**
- Create: `src/features/dns/troubleshooting-scenarios.ts`
- Create: `src/features/dns/troubleshooting-player.tsx`
- Test: `src/features/dns/troubleshooting-scenarios.test.ts`
- Test: `src/features/dns/troubleshooting-player.test.tsx`

**Interfaces:**
- Consumes: `DnsIncident`, `parseDnsIncident`, `DnsMessageInspector`, and `useLessonProgress`.
- Produces: `dnsIncidents: readonly DnsIncident[]`.
- Produces: `DnsTroubleshootingPlayer({ access, progressItemId }: { access: "public" | "account"; progressItemId?: string })`.

- [ ] **Step 1: Write failing incident and interaction tests**

Cover `nxdomain-vs-nodata`, `resolver-timeout`, `valid-ttl`, `bad-delegation`, `recursion-refused`, `tcp-fallback`, `tcp-blocked`, and `broken-cname-target`. Verify only the comparison is public, submission is required, repeat submissions announce once, immediate explanation cites decisive evidence, scenario changes clear choices, and incorrect account submissions record an attempt.

```tsx
render(<DnsTroubleshootingPlayer access="account" progressItemId="dns_name_resolution_interactive_troubleshooting" />);
await user.click(screen.getByLabelText(/transport timeout/i));
await user.click(screen.getByRole("button", { name: /check diagnosis/i }));
expect(screen.getByRole("status")).toHaveTextContent(/incorrect/i);
expect(markComplete).toHaveBeenCalledWith("dns_name_resolution_interactive_troubleshooting");
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/dns/troubleshooting-scenarios.test.ts src/features/dns/troubleshooting-player.test.tsx`

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement incidents and immediate feedback**

Model the prediction choices and one authoritative diagnosis per incident. Feedback must include result, DNS/transport evidence, responsible role, explanation, and next safe step. Treat a timeout separately from all RCODE choices.

```ts
export const dnsIncidents = rawIncidents.map(parseDnsIncident);
const attempted = selectedChoice !== null;
if (attempted && progressItemId) void markItemComplete(progressItemId);
```

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/dns/troubleshooting-scenarios.test.ts src/features/dns/troubleshooting-player.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/dns/troubleshooting-scenarios.ts src/features/dns/troubleshooting-player.tsx src/features/dns/troubleshooting-scenarios.test.ts src/features/dns/troubleshooting-player.test.tsx
git commit -m "feat: add DNS troubleshooting practice"
```

---

### Task 6: Pro timing, RFC, DNSSEC, and root-bootstrap experiences

**Files:**
- Create: `src/features/dns/dns-pro.data.ts`
- Create: `src/features/dns/dns-timing-player.tsx`
- Create: `src/features/dns/dns-rfc-check.tsx`
- Create: `src/features/dns/root-bootstrap-player.tsx`
- Test: `src/features/dns/dns-pro.test.tsx`

**Interfaces:**
- Consumes: `parseDnsTiming`, `parseDnsRfcCheck`, `DnsTopology`, and `DnsMessageInspector`.
- Produces: `dnsTimingScenarios`, `dnsRfcChecks`, `dnssecWalkthrough`, and `rootBootstrapScenario`.
- Produces: `DnsTimingPlayer`, `DnsRfcCheck`, and `RootBootstrapPlayer` components.

- [ ] **Step 1: Write failing Pro tests**

Verify cold/warm/delayed/TCP/timeout/DNSSEC timing modes, synchronized elapsed time and cache state, immediate RFC feedback with `rfc-editor.org` references, DNSSEC DS→DNSKEY→RRSIG validation and NSEC/NSEC3 denial awareness, EDNS/fragmentation checks, and the root bonus sequence. Assert the bonus says A–M are logical identities served by many anycast instances and that cached delegation can avoid root contact.

```tsx
render(<RootBootstrapPlayer />);
expect(screen.getByText(/final dot represents the DNS root/i)).toBeVisible();
expect(screen.getByText(/logical identities/i)).toBeVisible();
expect(screen.getByText(/many distributed.*anycast/i)).toBeVisible();
expect(screen.getByText(/cached delegation/i)).toBeVisible();
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/dns/dns-pro.test.tsx`

Expected: FAIL because the Pro modules do not exist.

- [ ] **Step 3: Implement deterministic Pro data and components**

Author checks against RFC 1034, 1035, 2181, 2308, 6891, 7766, 8499, 4033–4035, 7858, 8484, and 9250. Each check returns `correct`, `rule`, `evidence`, `consequence`, `referenceLabel`, and `referenceUrl`. Keep root bootstrap exclusively in this Pro module.

```ts
export type DnsCheckFeedback = {
  correct: boolean; rule: string; evidence: string; consequence: string;
  referenceLabel: string; referenceUrl: `https://www.rfc-editor.org/rfc/${string}`;
};
```

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/dns/dns.schema.test.ts src/features/dns/dns-pro.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/dns/dns-pro.data.ts src/features/dns/dns-timing-player.tsx src/features/dns/dns-rfc-check.tsx src/features/dns/root-bootstrap-player.tsx src/features/dns/dns-pro.test.tsx
git commit -m "feat: add advanced DNS analysis experiences"
```

---

### Task 7: Tiered DNS lesson content

**Files:**
- Create: `src/content/networking-foundations/dns-and-name-resolution.public.mdx`
- Create: `src/content/networking-foundations/dns-and-name-resolution.account.mdx`
- Create: `src/content/networking-foundations/dns-and-name-resolution.pro.mdx`
- Create: `src/content/networking-foundations/dns-and-name-resolution.content.test.ts`

**Interfaces:**
- Consumes: DNS components through the MDX registry, `SectionContinue`, and `KnowledgeCheck`.
- Produces: public, account, and Pro lesson bodies with stable heading anchors.

- [ ] **Step 1: Write failing content tests**

Assert the approved ordered public headings, exact player anchors, ten record types, all required response semantics, UDP/TCP/EDNS/privacy boundaries, command/Wireshark evidence, three account checks with stable IDs, immediate explanations, full Pro coverage, and `root-server-bootstrap-bonus` only in Pro.

```ts
expect(publicText).toContain("<DnsResolutionPlayer progressItemId=\"dns_name_resolution_interactive_complete_resolution\"");
expect(accountText.match(/<KnowledgeCheck/g)).toHaveLength(3);
expect(publicText).not.toMatch(/root-server-bootstrap-bonus/i);
expect(proText).toContain('id="root-server-bootstrap-bonus"');
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/content/networking-foundations/dns-and-name-resolution.content.test.ts`

Expected: FAIL because the MDX files do not exist.

- [ ] **Step 3: Author the three lesson tiers**

Give every non-interactive required section a matching `SectionContinue`. Public prose explains roles, hierarchy, messages, records, transports, caching, response semantics, reverse DNS, evidence, and misconceptions. Account content embeds the account troubleshooting player plus checks. Pro embeds timing, RFC, DNSSEC/Wireshark discussion, and the root bonus.

```mdx
<h2 id="interactive-complete-resolution">Interactive complete DNS resolution</h2>
<DnsResolutionPlayer progressItemId="dns_name_resolution_interactive_complete_resolution" />

<h2 id="knowledge-check-summary">Check your understanding</h2>
<KnowledgeCheck progressItemId="dns_name_resolution_check_1" question="Which component normally follows root and TLD referrals for a client?" options={["The recursive resolver", "The Ethernet switch", "The authoritative web server"]} correctIndex={0} explanation="The stub asks its configured recursive resolver for service; that resolver performs the upstream iterative work and returns the result." />
```

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/content/networking-foundations/dns-and-name-resolution.content.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/content/networking-foundations/dns-and-name-resolution.public.mdx src/content/networking-foundations/dns-and-name-resolution.account.mdx src/content/networking-foundations/dns-and-name-resolution.pro.mdx src/content/networking-foundations/dns-and-name-resolution.content.test.ts
git commit -m "feat: author DNS and name resolution lesson"
```

---

### Task 8: MDX registration and tier isolation

**Files:**
- Modify: `mdx-components.tsx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `src/content/lesson-rendering.test.tsx`

**Interfaces:**
- Consumes: all exported DNS components and tiered MDX modules.
- Produces: lazy lesson loading with anonymous public-only, account public+account, and Pro all-tier behavior.

- [ ] **Step 1: Add failing registration and isolation tests**

```ts
expect(getMDXComponents({})).toEqual(expect.objectContaining({ DnsResolutionPlayer, DnsTroubleshootingPlayer }));
expect(await loadLessonContent(key, "public")).toHaveLength(1);
expect(await loadLessonContent(key, "account")).toHaveLength(2);
expect(await loadLessonContent(key, "pro")).toHaveLength(3);
```

Also server-render each tier, require unique anchors and exactly one page-level H1, and verify Pro root copy is absent from anonymous markup.

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/lessons/lesson-content.repository.test.ts src/content/lesson-rendering.test.tsx`

Expected: FAIL because DNS is not registered.

- [ ] **Step 3: Register components and lazy content**

```ts
"networking-foundations/dns-and-name-resolution": {
  public: () => import("@/content/networking-foundations/dns-and-name-resolution.public.mdx"),
  account: () => import("@/content/networking-foundations/dns-and-name-resolution.account.mdx"),
  pro: () => import("@/content/networking-foundations/dns-and-name-resolution.pro.mdx"),
},
```

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/lessons/lesson-content.repository.test.ts src/content/lesson-rendering.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add mdx-components.tsx src/features/lessons/lesson-content.repository.ts src/features/lessons/lesson-content.repository.test.ts src/content/lesson-rendering.test.tsx
git commit -m "feat: register tiered DNS lesson content"
```

---

### Task 9: Catalog, navigation, route, and sitemap publication

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/lessons/curriculum-navigation.test.tsx`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
- Modify: `src/app/sitemap.test.ts`

**Interfaces:**
- Consumes: lesson ID `lesson_dns_and_name_resolution` and slug `dns-and-name-resolution`.
- Produces: published catalog entry after DHCP, canonical route, navigation, structured metadata, and sitemap entry.

- [ ] **Step 1: Write failing publication tests**

Assert DNS is published immediately after DHCP, its public/account/Pro section lists match MDX anchors, previous points to DHCP, next points to the following unpublished lesson, the canonical route renders, and the sitemap includes the canonical URL.

```ts
expect(dns.published).toBe(true);
expect(dns.previous).toEqual({ slug: "dhcp-and-automatic-address-configuration", published: true });
expect(routes).toContainEqual({ pathwaySlug: "networking-foundations", lessonSlug: "dns-and-name-resolution" });
expect(sitemapUrls).toContain("/learn/networking-foundations/dns-and-name-resolution");
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/catalog/catalog.repository.test.ts src/features/lessons/curriculum-navigation.test.tsx 'src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts' src/app/sitemap.test.ts`

Expected: FAIL because DNS remains unpublished.

- [ ] **Step 3: Publish the catalog record**

Set `published: true`; populate ordered public/account/Pro section metadata with the MDX anchors; update adjacent navigation without publishing the next lesson. Keep the existing objective, SEO title, description, and estimated duration unless tests expose a direct mismatch.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/catalog/catalog.repository.test.ts src/features/lessons/curriculum-navigation.test.tsx 'src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts' src/app/sitemap.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/catalog/catalog.data.ts src/features/catalog/catalog.repository.test.ts src/features/lessons/curriculum-navigation.test.tsx 'src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts' src/app/sitemap.test.ts
git commit -m "feat: publish DNS lesson navigation"
```

---

### Task 10: Versioned progress manifest and migration

**Files:**
- Modify: `src/features/progress/progress-manifests.ts`
- Modify: `src/features/progress/progress-manifests.test.ts`
- Create: `supabase/migrations/202609110002_add_dns_progress.sql`
- Create: `supabase/migrations/dns-progress.test.ts`

**Interfaces:**
- Consumes: public/account anchors and three knowledge-check IDs.
- Produces: version 1 manifest for `path_networking_foundations/lesson_dns_and_name_resolution` and matching idempotent database rows.

- [ ] **Step 1: Write failing manifest/migration tests**

Assert a manifest exists for every published lesson; DNS has every required public and account section, both interactives, and three checks in exact order; no Pro item appears; SQL rows exactly mirror the TypeScript manifest; and rerunning the transaction is safe.

```ts
const manifest = getLessonProgressManifest("path_networking_foundations", "lesson_dns_and_name_resolution")!;
expect(manifest.version).toBe(1);
expect(manifest.items.filter(({ kind }) => kind === "knowledge_check")).toHaveLength(3);
expect(manifest.items.some(({ anchor }) => anchor.includes("root-server"))).toBe(false);
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/features/progress/progress-manifests.test.ts supabase/migrations/dns-progress.test.ts`

Expected: FAIL because the DNS manifest and migration do not exist.

- [ ] **Step 3: Add manifest definition and idempotent transaction**

```ts
{
  lessonId: "lesson_dns_and_name_resolution",
  itemPrefix: "dns_name_resolution",
  interactiveAnchors: ["interactive-complete-resolution", "interactive-dns-troubleshooting"],
  knowledgeCheckCount: 3,
  knowledgeAnchor: "knowledge-check-summary",
}
```

The migration upserts the versioned manifest and item rows inside `begin`/`commit`, uses the existing schema and conflict targets, and contains no Pro items.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm vitest run src/features/progress/progress-manifests.test.ts supabase/migrations/dns-progress.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/progress/progress-manifests.ts src/features/progress/progress-manifests.test.ts supabase/migrations/202609110002_add_dns_progress.sql supabase/migrations/dns-progress.test.ts
git commit -m "feat: register DNS lesson progress"
```

---

### Task 11: Responsive styling and full verification

**Files:**
- Modify: `src/app/globals.css`
- Modify: `vitest.config.ts`
- Test: `src/app/theme-styles.test.ts`
- Test: `tests/lesson-route.spec.ts`

**Interfaces:**
- Consumes: DNS component class names and canonical route.
- Produces: desktop/360-pixel containment and source-only test discovery.

- [ ] **Step 1: Write failing style and browser assertions**

Require DNS grids to collapse, controls to wrap with gaps, buttons/selects to meet 44 pixels, topology labels to stay contained, and message tables to scroll locally. Add a route smoke test for public rendering and protected-content absence.

```ts
expect(css).toMatch(/\.dns-player-controls[^}]*gap:/s);
expect(css).toMatch(/\.dns-player-controls[^}]*flex-wrap:\s*wrap/s);
expect(css).toMatch(/min-height:\s*44px/);
await expect(page.getByRole("heading", { name: "DNS and Name Resolution" })).toBeVisible();
await expect(page.getByText(/root-server bootstrap bonus/i)).toHaveCount(0);
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run src/app/theme-styles.test.ts`

Expected: FAIL because DNS responsive rules do not exist.

- [ ] **Step 3: Add scoped styles and exclude cached project copies**

Add `.dns-*` styles using existing design tokens and media-query patterns. Extend Vitest exclusions so `.pnpm-store/**`, `.worktrees/**`, and `work/**` nested checkouts cannot be collected as duplicate test projects.

```ts
exclude: ["**/node_modules/**", "**/.next/**", "**/.pnpm-store/**", "**/.worktrees/**", "**/work/**"],
```

- [ ] **Step 4: Run focused verification**

Run: `pnpm vitest run src/features/dns src/content/networking-foundations/dns-and-name-resolution.content.test.ts supabase/migrations/dns-progress.test.ts`

Expected: all DNS tests PASS.

- [ ] **Step 5: Run repository verification sequentially**

Run, one command at a time:

```powershell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm playwright test tests/lesson-route.spec.ts --project=chromium
```

Expected: every command exits 0. Do not run the build while a development server uses the same `.next` directory.

- [ ] **Step 6: Inspect desktop and 360-pixel previews**

Open the canonical lesson and inspect both players at desktop and 360-pixel width. Confirm no overlap among topology labels, packet markers, controls, message tables, or following content; verify keyboard focus, reduced motion, and locally scrolling tables.

- [ ] **Step 7: Commit**

```powershell
git add src/app/globals.css vitest.config.ts src/app/theme-styles.test.ts tests/lesson-route.spec.ts
git commit -m "test: verify responsive DNS lesson"
```

---

### Task 12: Final diff and completion review

**Files:**
- Review: all files changed from `main...HEAD`

**Interfaces:**
- Consumes: completed Tasks 1–11 and the approved design specification.
- Produces: a review-ready branch with no accidental files, placeholders, or unmet acceptance criteria.

- [ ] **Step 1: Inspect the complete branch**

Run:

```powershell
git status --short
git diff --check main...HEAD
git diff --stat main...HEAD
git log --oneline main..HEAD
```

Expected: only intentional DNS/spec/plan changes, no whitespace errors, and task-sized commits.

- [ ] **Step 2: Scan for incomplete or leaked content**

Run:

```powershell
rg -n "TBD|FIXME" src/features/dns src/content/networking-foundations/dns-and-name-resolution.* docs/superpowers
rg -n "root-server-bootstrap-bonus|RootBootstrapPlayer" src/content/networking-foundations/dns-and-name-resolution.public.mdx src/content/networking-foundations/dns-and-name-resolution.account.mdx
```

Expected: both commands return no matches in public/account content and no unfinished implementation markers.

- [ ] **Step 3: Re-run final verification after review fixes**

Run sequentially: `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build`.

Expected: all exit 0 with no test discovery beneath `.pnpm-store`, `.worktrees`, or nested `work` directories.

- [ ] **Step 4: Close the review**

If the review changed tracked DNS files, stage them with `git add -u` and run
`git commit -m "fix: address DNS lesson review findings"`. If no correction
was required, confirm `git status --short` is empty and create no extra commit.

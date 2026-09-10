# HTTP and Essential Network Services Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a tiered, responsive lesson that teaches HTTP/HTTPS, SSH/Telnet, email, file transfer, NTP, and SNMP at comparable depth through consistent interactive packet journeys, message inspection, troubleshooting, Wireshark analysis, and RFC checks.

**Architecture:** Author each service as validated typed scenario data and render it through small shared essential-services components. Compose the public, account, and Pro experiences in separate MDX files, generalize the approved DNS Page contents map for this lesson, and register catalog, access, progress, and Supabase metadata through existing repositories.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, MDX, Zod, Vitest, Testing Library, Playwright, Supabase/PostgreSQL migrations.

**Spec:** `docs/superpowers/specs/2026-09-11-http-essential-services-lesson-design.md`

## Global Constraints

- Service families are exactly HTTP/HTTPS, SSH/Telnet, SMTP/IMAP/POP3, FTP/FTPS/SFTP, NTP, and SNMP.
- DNS and DHCP appear only as dependencies; LDAP and SMB are excluded.
- SSL/TLS coverage is introductory: identify SSL as obsolete, introduce TLS protection and certificate trust, and reserve handshake cryptography for the dedicated module.
- All six service families receive comparable public, account, and Pro depth.
- Every account chapter includes an interactive journey, message inspector, port practice, troubleshooting, immediate explanations, retry, and progress support.
- Every Pro chapter includes service-specific Wireshark-style analysis and an RFC-level validation exercise.
- Incorrect submissions still complete the attempted item; correctness and confidence remain separate.
- Locked Account and Pro links remain clickable and preserve the exact lesson anchor through sign-in.
- Player controls use the existing `TransportPlayerControls` component and must wrap consistently without horizontal overflow.
- Page contents uses a rectangular trigger, replays its route animation on every open, and honors reduced motion.
- Do not redesign Page contents on older lessons as part of this work.

---

### Task 1: Validate the essential-services authoring model

**Files:**
- Create: `src/features/essential-services/essential-services.schema.ts`
- Create: `src/features/essential-services/essential-services.schema.test.ts`
- Create: `src/features/essential-services/service-scenarios.ts`
- Test: `src/features/essential-services/essential-services.schema.test.ts`

**Interfaces:**
- Produces: `ServiceId`, `ServiceScenario`, `ServiceStep`, `ServiceMessage`, `TroubleshootingCase`, `CaptureExercise`, and `RfcExercise` types.
- Produces: `parseServiceScenario(input: unknown): ServiceScenario`, `parseTroubleshootingCase(input: unknown): TroubleshootingCase`, `parseCaptureExercise(input: unknown): CaptureExercise`, and `parseRfcExercise(input: unknown): RfcExercise`.
- Produces: `serviceScenarios`, a record containing one complete account journey for each service ID.

- [ ] **Step 1: Write failing schema tests**

```ts
import { describe, expect, it } from "vitest";
import { parseRfcExercise, parseServiceScenario } from "./essential-services.schema";

describe("essential-services schema", () => {
  it("accepts all six service identifiers and a valid ordered journey", () => {
    for (const service of ["web", "remote-access", "email", "file-transfer", "time", "monitoring"] as const) {
      expect(parseServiceScenario({
        id: `${service}-journey`, service, title: service,
        steps: [{ id: "request", title: "Request", sender: "client", receiver: "server", transport: "TCP", sourcePort: 49152, destinationPort: 80, message: { name: "Request", fields: [{ name: "Method", value: "GET", explanation: "Requests a representation." }] }, explanation: "Send request", evidence: "tcp.dstport == 80", terminal: true }],
        conclusion: "Complete",
      }).service).toBe(service);
    }
  });

  it("rejects duplicate steps, invalid ports, and a journey without one terminal step", () => {
    expect(() => parseServiceScenario({ id: "bad", service: "web", title: "Bad", steps: [], conclusion: "No" })).toThrow();
  });

  it("requires RFC Editor URLs and an in-range correct answer", () => {
    expect(() => parseRfcExercise({ id: "bad", service: "web", question: "Valid?", options: ["Yes", "No"], correctIndex: 2, rule: "Rule", evidence: "Evidence", consequence: "Consequence", referenceLabel: "RFC 9110", referenceUrl: "https://example.com" })).toThrow();
  });
});
```

- [ ] **Step 2: Run the schema test and verify failure**

Run: `pnpm test -- src/features/essential-services/essential-services.schema.test.ts`

Expected: FAIL because `essential-services.schema.ts` does not exist.

- [ ] **Step 3: Implement the Zod schemas and exported types**

```ts
const serviceIdSchema = z.enum(["web", "remote-access", "email", "file-transfer", "time", "monitoring"]);
const portSchema = z.number().int().min(1).max(65_535);
const messageFieldSchema = z.object({ name: z.string().min(1), value: z.string().min(1), explanation: z.string().min(1) });
const serviceStepSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), sender: z.string().min(1), receiver: z.string().min(1),
  transport: z.enum(["TCP", "UDP"]), sourcePort: portSchema, destinationPort: portSchema,
  message: z.object({ name: z.string().min(1), fields: z.array(messageFieldSchema).min(1) }),
  explanation: z.string().min(1), evidence: z.string().min(1), terminal: z.boolean(),
});
```

Add refinements for unique step IDs, exactly one terminal step, valid choice indexes, service agreement, and `https://www.rfc-editor.org/` references. Export the four parsers and inferred types named in Interfaces.

- [ ] **Step 4: Add canonical scenario data for all six services**

Author ordered steps that accurately include these boundaries:

```ts
export const canonicalPorts = {
  web: [80, 443, 8080], remoteAccess: [22, 23],
  email: [25, 465, 587, 143, 993, 110, 995],
  fileTransfer: [20, 21, 22, 990], time: [123], monitoring: [161, 162],
} as const;
```

Model FTP control and negotiated data separately, SMTP submission/relay separately from IMAP/POP3 retrieval, NTP's four timestamps, and SNMP polling separately from Trap/Inform notifications.

- [ ] **Step 5: Run schema tests**

Run: `pnpm test -- src/features/essential-services/essential-services.schema.test.ts`

Expected: PASS with six parsed scenarios and rejection cases.

- [ ] **Step 6: Commit**

```bash
git add src/features/essential-services/essential-services.schema.ts src/features/essential-services/essential-services.schema.test.ts src/features/essential-services/service-scenarios.ts
git commit -m "feat: model essential service journeys"
```

### Task 2: Build the shared journey, topology, port, and message components

**Files:**
- Create: `src/features/essential-services/service-journey-player.tsx`
- Create: `src/features/essential-services/service-topology.tsx`
- Create: `src/features/essential-services/protocol-message-inspector.tsx`
- Create: `src/features/essential-services/port-transport-panel.tsx`
- Create: `src/features/essential-services/service-journey-player.test.tsx`
- Modify: `mdx-components.tsx`
- Test: `src/features/essential-services/service-journey-player.test.tsx`

**Interfaces:**
- Consumes: `ServiceScenario`, `ServiceStep`, `parseServiceScenario`, and `serviceScenarios` from Task 1.
- Consumes: `TransportPlayerControls` and `useProgressCompletionBoundary`.
- Produces: `ServiceJourneyPlayer({ service, progressItemId }: { service: ServiceId; progressItemId?: string })`.
- Produces: `ProtocolMessageInspector({ message }: { message: ServiceMessage })` and `PortTransportPanel({ service }: { service: ServiceId })`.

- [ ] **Step 1: Write failing interaction and fallback tests**

```tsx
render(<ServiceJourneyPlayer service="web" progressItemId="essential_services_interactive_web" />);
expect(screen.getByRole("region", { name: "Web service journey" })).toBeVisible();
expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
await user.click(screen.getByRole("button", { name: "Next" }));
expect(screen.getByRole("status")).toHaveTextContent(/Step 2 of/);
expect(screen.getByRole("table", { name: /protocol message/i })).toBeVisible();
```

Also inject an invalid scenario through a test-only prop and assert a contained `role="alert"` rather than a thrown render error.

- [ ] **Step 2: Run the component test and verify failure**

Run: `pnpm test -- src/features/essential-services/service-journey-player.test.tsx`

Expected: FAIL because the shared player does not exist.

- [ ] **Step 3: Implement the components**

Use `TransportPlayerControls` for Previous, Play/Pause, Next, Restart, and speed. Parse authored data inside `useMemo`, stop automatically on the terminal step, call `markTerminalStateReached()` at the terminal step, and render `Retry saving progress` when the progress boundary reports an error.

```tsx
<section className="service-player" aria-label={`${label} service journey`}>
  <ServiceTopology service={scenario.service} step={current} />
  <p role="status" aria-live="polite">Step {stepIndex + 1} of {scenario.steps.length}: {current.title}</p>
  <PortTransportPanel service={scenario.service} />
  <ProtocolMessageInspector message={current.message} />
  <TransportPlayerControls {...controlProps} />
</section>
```

Use `useReducedMotionState()` so reduced-motion users start paused and step changes render without travel animation.

- [ ] **Step 4: Register the MDX components**

Add `ServiceJourneyPlayer`, `ProtocolMessageInspector`, and `PortTransportPanel` imports and keys to `useMDXComponents()`.

- [ ] **Step 5: Run focused tests**

Run: `pnpm test -- src/features/essential-services/service-journey-player.test.tsx`

Expected: PASS for controls, terminal progress, reduced motion, message fields, and fallback.

- [ ] **Step 6: Commit**

```bash
git add mdx-components.tsx src/features/essential-services/service-journey-player.tsx src/features/essential-services/service-topology.tsx src/features/essential-services/protocol-message-inspector.tsx src/features/essential-services/port-transport-panel.tsx src/features/essential-services/service-journey-player.test.tsx
git commit -m "feat: add essential service journey player"
```

### Task 3: Add immediate-feedback troubleshooting for every service

**Files:**
- Create: `src/features/essential-services/troubleshooting-cases.ts`
- Create: `src/features/essential-services/service-troubleshooting-lab.tsx`
- Create: `src/features/essential-services/service-troubleshooting-lab.test.tsx`
- Modify: `mdx-components.tsx`
- Test: `src/features/essential-services/service-troubleshooting-lab.test.tsx`

**Interfaces:**
- Consumes: `TroubleshootingCase`, `parseTroubleshootingCase`, and `ServiceId` from Task 1.
- Produces: `troubleshootingCases: Record<ServiceId, readonly TroubleshootingCase[]>`.
- Produces: `ServiceTroubleshootingLab({ service, progressItemId }: { service: ServiceId; progressItemId: string })`.

- [ ] **Step 1: Write failing tests for right, wrong, confidence, and completion states**

```tsx
render(<ServiceTroubleshootingLab service="email" progressItemId="essential_services_troubleshooting_email" />);
await user.click(screen.getByLabelText("SMTP relay rejected the recipient"));
await user.click(screen.getByRole("button", { name: "Check diagnosis" }));
expect(screen.getByRole("status")).toHaveTextContent(/not the best diagnosis/i);
expect(markTerminalStateReached).toHaveBeenCalledTimes(1);
expect(screen.getByText(/simplified explanation/i)).toBeVisible();
```

Add assertions that the correct choice shows evidence, confidence remains independently selectable, and Retry resets selection without removing recorded completion.

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm test -- src/features/essential-services/service-troubleshooting-lab.test.tsx`

Expected: FAIL because the lab and case data do not exist.

- [ ] **Step 3: Author at least two service-specific cases per service**

Cover HTTP status/connection symptoms, SSH host-key/authentication issues, SMTP versus mailbox retrieval, FTP active/passive firewall behavior, NTP offset/reachability, and SNMP community/OID/notification problems. Every case must include evidence, choices, diagnosis, immediate explanation, simplified explanation, and a safe next step.

- [ ] **Step 4: Implement the lab and register it in MDX**

Submission must call `markTerminalStateReached()` regardless of correctness, store `correct` separately for display, and expose `Retry saving progress` through the existing boundary.

- [ ] **Step 5: Run focused tests**

Run: `pnpm test -- src/features/essential-services/service-troubleshooting-lab.test.tsx src/features/essential-services/essential-services.schema.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add mdx-components.tsx src/features/essential-services/troubleshooting-cases.ts src/features/essential-services/service-troubleshooting-lab.tsx src/features/essential-services/service-troubleshooting-lab.test.tsx
git commit -m "feat: add essential service troubleshooting"
```

### Task 4: Add Pro Wireshark and RFC exercises

**Files:**
- Create: `src/features/essential-services/pro-exercises.ts`
- Create: `src/features/essential-services/capture-analysis-lab.tsx`
- Create: `src/features/essential-services/rfc-validation-lab.tsx`
- Create: `src/features/essential-services/pro-exercises.test.tsx`
- Modify: `mdx-components.tsx`
- Test: `src/features/essential-services/pro-exercises.test.tsx`

**Interfaces:**
- Consumes: `CaptureExercise`, `RfcExercise`, `ServiceId`, `parseCaptureExercise`, and `parseRfcExercise` from Task 1.
- Produces: `captureExercises` and `rfcExercises`, each keyed by all six `ServiceId` values.
- Produces: `CaptureAnalysisLab({ service }: { service: ServiceId })` and `RfcValidationLab({ service }: { service: ServiceId })`.

- [ ] **Step 1: Write failing Pro coverage tests**

```tsx
for (const service of serviceIds) {
  expect(captureExercises[service].length).toBeGreaterThan(0);
  expect(rfcExercises[service].length).toBeGreaterThan(0);
}
render(<CaptureAnalysisLab service="time" />);
expect(screen.getByRole("table", { name: /NTP capture/i })).toBeVisible();
render(<RfcValidationLab service="monitoring" />);
expect(screen.getByRole("link", { name: /^RFC / })).toHaveAttribute("href", expect.stringMatching(/^https:\/\/www\.rfc-editor\.org\//));
```

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm test -- src/features/essential-services/pro-exercises.test.tsx`

Expected: FAIL because Pro data and renderers do not exist.

- [ ] **Step 3: Author service-specific evidence and standards checks**

Use RFC Editor links and include at minimum: HTTP semantics/framing, SSH transport/authentication, SMTP plus IMAP or POP state, FTP active/passive behavior, NTP timestamps/strata, and SNMP operation/error rules. Capture rows must expose number, relative time, source, destination, protocol, length, and summary.

- [ ] **Step 4: Implement both accessible labs and register them in MDX**

The capture lab must show a display filter and conversation evidence. The RFC lab must give immediate correct/incorrect explanations, the rule, consequence, and a labelled RFC link. Do not teach TLS key derivation or deep handshake internals.

- [ ] **Step 5: Run focused tests**

Run: `pnpm test -- src/features/essential-services/pro-exercises.test.tsx src/features/essential-services/essential-services.schema.test.ts`

Expected: PASS for all six services.

- [ ] **Step 6: Commit**

```bash
git add mdx-components.tsx src/features/essential-services/pro-exercises.ts src/features/essential-services/capture-analysis-lab.tsx src/features/essential-services/rfc-validation-lab.tsx src/features/essential-services/pro-exercises.test.tsx
git commit -m "feat: add advanced essential service analysis"
```

### Task 5: Generalize the Page contents network map for the new lesson

**Files:**
- Modify: `src/features/lessons/lesson-section-navigation.tsx`
- Modify: `src/features/lessons/lesson-section-navigation.test.tsx`
- Modify: `src/features/lessons/lesson-shell.tsx`
- Modify: `src/app/globals.css`
- Test: `src/features/lessons/lesson-section-navigation.test.tsx`

**Interfaces:**
- Changes `presentation` to accept `"list" | "network-map"`.
- Adds `mapGroups?: readonly { label: string; node: string; ids: readonly string[] }[]` and `panelId?: string` to `LessonSectionNavigationProps`.
- Preserves existing DNS behavior by passing DNS groups from the shell or a presentation configuration record.
- Adds essential-services groups: Web, Remote Access, Email, File Transfer, Time, Monitoring, and Pro Analysis.

- [ ] **Step 1: Extend navigation tests before implementation**

```tsx
render(<LessonSectionNavigation presentation="network-map" panelId="service-page-contents" lockedReturnTo="/learn/networking-foundations/http-https-tls-and-essential-network-services" mapGroups={serviceGroups} sections={sections} />);
await user.click(screen.getByRole("button", { name: "Page contents" }));
expect(screen.getByRole("link", { name: /HTTP request and response/ })).toHaveAttribute("href", "#http-request-response");
expect(screen.getByRole("link", { name: /Pro capture analysis/ })).toHaveAttribute("href", expect.stringContaining("returnTo="));
await user.click(screen.getByRole("button", { name: "Page contents" }));
await user.click(screen.getByRole("button", { name: "Page contents" }));
expect(screen.getByTestId("network-map-route")).toHaveAttribute("data-reveal-cycle", "2");
```

Also retain the DNS navigation assertions to prevent regression.

- [ ] **Step 2: Run the navigation test and verify failure**

Run: `pnpm test -- src/features/lessons/lesson-section-navigation.test.tsx`

Expected: FAIL because generic network-map props are unsupported.

- [ ] **Step 3: Replace DNS-only branching with configuration-driven map rendering**

Keep `SectionItem` as the single tier-aware link renderer. Make every panel ID unique, use `key={revealCycle}`, and expose the cycle only as a test-friendly data attribute. In `LessonShell`, select DNS groups for DNS and service groups for the new lesson; all older lessons remain `list`.

- [ ] **Step 4: Add responsive and reduced-motion CSS**

Use shared `.network-map__*` selectors. Preserve the rectangular trigger, wrap nodes and controls, set `min-width: 0` on grid children, and disable packet travel under `@media (prefers-reduced-motion: reduce)`.

- [ ] **Step 5: Run navigation and theme tests**

Run: `pnpm test -- src/features/lessons/lesson-section-navigation.test.tsx src/app/theme-styles.test.ts`

Expected: PASS for DNS and essential-services maps.

- [ ] **Step 6: Commit**

```bash
git add src/features/lessons/lesson-section-navigation.tsx src/features/lessons/lesson-section-navigation.test.tsx src/features/lessons/lesson-shell.tsx src/app/globals.css
git commit -m "feat: generalize lesson network map navigation"
```

### Task 6: Author the public lesson at equal service depth

**Files:**
- Create: `src/content/networking-foundations/http-https-tls-and-essential-network-services.public.mdx`
- Create: `src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts`
- Test: `src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts`

**Interfaces:**
- Consumes: `LearningObjective`, `PortTransportPanel`, and public-safe lesson components registered in MDX.
- Produces: public chapter anchors referenced by catalog sections and the service-station map.

- [ ] **Step 1: Write failing public-content assertions**

```ts
const lesson = read("public");
for (const anchor of ["web-services", "remote-access-services", "email-services", "file-transfer-services", "time-services", "monitoring-services"]) expect(lesson).toContain(`id="${anchor}"`);
for (const port of ["80", "443", "8080", "22", "23", "25", "465", "587", "143", "993", "110", "995", "20", "21", "990", "123", "161", "162"]) expect(lesson).toContain(port);
expect(lesson).toMatch(/SSL[\s\S]*obsolete[\s\S]*TLS/i);
expect(lesson).not.toMatch(/key derivation|cipher-suite negotiation lab/i);
```

- [ ] **Step 2: Run the content test and verify failure**

Run: `pnpm test -- src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts`

Expected: FAIL because public MDX does not exist.

- [ ] **Step 3: Author six comparable public chapters**

For each service, include purpose, accurate ports/transports, message anatomy, traversal explanation, security comparison, common failures, and a concise check with immediate explanatory copy. Explicitly distinguish FTPS from SFTP and SMTP delivery from mailbox retrieval. Explain NTP's four timestamps and SNMP manager/agent/OID/MIB concepts.

- [ ] **Step 4: Run the public-content test**

Run: `pnpm test -- src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/networking-foundations/http-https-tls-and-essential-network-services.public.mdx src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts
git commit -m "feat: author public essential services lesson"
```

### Task 7: Compose account journeys, practice, and immediate checks

**Files:**
- Create: `src/content/networking-foundations/http-https-tls-and-essential-network-services.account.mdx`
- Modify: `src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts`
- Test: `src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts`

**Interfaces:**
- Consumes: `ServiceJourneyPlayer`, `ServiceTroubleshootingLab`, `KnowledgeCheck`, and `SectionContinue`.
- Produces: six stable interactive IDs `essential_services_interactive_<service>` and six troubleshooting IDs `essential_services_troubleshooting_<service>`.

- [ ] **Step 1: Add failing account-tier assertions**

```ts
const account = read("account");
expect(account.match(/<ServiceJourneyPlayer\b/g)).toHaveLength(6);
expect(account.match(/<ServiceTroubleshootingLab\b/g)).toHaveLength(6);
for (const service of ["web", "remote-access", "email", "file-transfer", "time", "monitoring"]) {
  expect(account).toContain(`progressItemId="essential_services_interactive_${service.replaceAll("-", "_")}"`);
  expect(account).toContain(`progressItemId="essential_services_troubleshooting_${service.replaceAll("-", "_")}"`);
}
```

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm test -- src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts`

Expected: FAIL because account MDX is absent.

- [ ] **Step 3: Compose the account MDX**

Give each service its own journey, message/port practice, troubleshooting lab, and `SectionContinue`. Add immediate explanatory `KnowledgeCheck` items whose IDs and anchors are stable. Do not place RFC or Wireshark exercises here.

- [ ] **Step 4: Run content and interaction tests**

Run: `pnpm test -- src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts src/features/essential-services/service-journey-player.test.tsx src/features/essential-services/service-troubleshooting-lab.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/networking-foundations/http-https-tls-and-essential-network-services.account.mdx src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts
git commit -m "feat: compose account essential service labs"
```

### Task 8: Compose equal-depth Pro analysis

**Files:**
- Create: `src/content/networking-foundations/http-https-tls-and-essential-network-services.pro.mdx`
- Modify: `src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts`
- Test: `src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts`

**Interfaces:**
- Consumes: `CaptureAnalysisLab` and `RfcValidationLab` from Task 4.
- Produces: one Wireshark and one RFC section for each service family.

- [ ] **Step 1: Add failing Pro assertions**

```ts
const pro = read("pro");
expect(pro.match(/<CaptureAnalysisLab\b/g)).toHaveLength(6);
expect(pro.match(/<RfcValidationLab\b/g)).toHaveLength(6);
for (const service of ["web", "remote-access", "email", "file-transfer", "time", "monitoring"]) {
  expect(pro).toContain(`service="${service}"`);
}
expect(pro).not.toMatch(/TLS key derivation|cipher suite negotiation exercise/i);
```

- [ ] **Step 2: Run the content test and verify failure**

Run: `pnpm test -- src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts`

Expected: FAIL because Pro MDX is absent.

- [ ] **Step 3: Compose the Pro MDX**

Pair every capture lab with an RFC validation lab and service-specific operational discussion. Include HTTP proxy/cache/framing, SSH negotiation/host-key reasoning, mail relay/retrieval state, FTP NAT modes, NTP clock selection, and SNMPv3/OID/trap analysis. Keep TLS analysis introductory.

- [ ] **Step 4: Run content and Pro component tests**

Run: `pnpm test -- src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts src/features/essential-services/pro-exercises.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/networking-foundations/http-https-tls-and-essential-network-services.pro.mdx src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts
git commit -m "feat: compose pro essential service analysis"
```

### Task 9: Publish the lesson and enforce tier isolation

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/catalog/pathway-overview.test.tsx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
- Modify: `src/app/sitemap.test.ts`
- Test: the files listed above.

**Interfaces:**
- Produces a published catalog entry for `lesson_http_https_tls_and_essential_network_services`.
- Produces public/account/pro dynamic imports for `networking-foundations/http-https-tls-and-essential-network-services`.
- Provides the section metadata consumed by `ServiceStationMap` and progress manifests.

- [ ] **Step 1: Write failing publication and access tests**

Assert the lesson is published, has an updated objective/SEO description reflecting all service families, appears after DNS, is in the sitemap, and loads only authorized tiers for anonymous, account, and Pro viewers.

```ts
const anonymous = await loader(key, "anonymous");
expect(anonymous.public).toBeDefined();
expect(anonymous.account).toBeUndefined();
expect(anonymous.pro).toBeUndefined();
```

- [ ] **Step 2: Run the focused repository tests and verify failure**

Run: `pnpm test -- src/features/catalog/catalog.repository.test.ts src/features/lessons/lesson-content.repository.test.ts src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts src/app/sitemap.test.ts`

Expected: FAIL because the lesson remains planned and unregistered.

- [ ] **Step 3: Replace `plannedLesson(...)` with a published lesson object**

Set a realistic estimated duration for the expanded equal-depth lesson. Add public chapter anchors, account interactive/practice anchors, and paired Pro capture/RFC anchors for all six services. Pro entries require useful preview text.

- [ ] **Step 4: Register all three MDX imports**

```ts
"networking-foundations/http-https-tls-and-essential-network-services": {
  public: () => import("@/content/networking-foundations/http-https-tls-and-essential-network-services.public.mdx"),
  account: () => import("@/content/networking-foundations/http-https-tls-and-essential-network-services.account.mdx"),
  pro: () => import("@/content/networking-foundations/http-https-tls-and-essential-network-services.pro.mdx"),
},
```

- [ ] **Step 5: Run publication and tier tests**

Run: `pnpm test -- src/features/catalog/catalog.repository.test.ts src/features/catalog/pathway-overview.test.tsx src/features/lessons/lesson-content.repository.test.ts src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts src/app/sitemap.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/catalog/catalog.data.ts src/features/catalog/catalog.repository.test.ts src/features/catalog/pathway-overview.test.tsx src/features/lessons/lesson-content.repository.ts src/features/lessons/lesson-content.repository.test.ts src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts src/app/sitemap.test.ts
git commit -m "feat: publish essential services lesson"
```

### Task 10: Register stable progress and the Supabase migration

**Files:**
- Modify: `src/features/progress/progress-manifests.ts`
- Modify: `src/features/progress/progress-manifests.test.ts`
- Create: `supabase/migrations/202609110003_add_essential_services_progress.sql`
- Create: `supabase/migrations/essential-services-progress.test.ts`
- Test: `src/features/progress/progress-manifests.test.ts`
- Test: `supabase/migrations/essential-services-progress.test.ts`

**Interfaces:**
- Produces progress manifest definition for `lesson_http_https_tls_and_essential_network_services`.
- Produces idempotent database rows matching the generated non-Pro manifest exactly.

- [ ] **Step 1: Write failing manifest and migration tests**

```ts
const manifest = getLessonProgressManifest("path_networking_foundations", "lesson_http_https_tls_and_essential_network_services");
for (const service of ["web", "remote_access", "email", "file_transfer", "time", "monitoring"]) {
  expect(manifest.items.some(({ itemId }) => itemId === `essential_services_interactive_${service}`)).toBe(true);
  expect(manifest.items.some(({ itemId }) => itemId === `essential_services_troubleshooting_${service}`)).toBe(true);
}
expect(manifest.items.every(({ itemId }) => !itemId.includes("rfc") && !itemId.includes("capture"))).toBe(true);
```

The migration test must assert `begin;`, `on conflict`, `commit;`, the lesson ID, required count, ordinals, anchors, kinds, and all stable IDs.

- [ ] **Step 2: Run progress tests and verify failure**

Run: `pnpm test -- src/features/progress/progress-manifests.test.ts supabase/migrations/essential-services-progress.test.ts`

Expected: FAIL because no manifest or migration exists.

- [ ] **Step 3: Add the manifest definition**

Use `itemPrefix: "essential_services"`; list all six journey anchors and all six troubleshooting anchors as interactive items. Register the authored account checks with stable counts and anchors. Pro activities must not become required public/account completion items.

- [ ] **Step 4: Add the idempotent SQL migration**

Follow `202609110002_add_dns_progress.sql`: upsert the manifest, upsert every required item with deterministic ordinal, label and anchor, and wrap the migration in one transaction. Use `202609110003` so ordering follows DNS.

- [ ] **Step 5: Run progress tests**

Run: `pnpm test -- src/features/progress/progress-manifests.test.ts supabase/migrations/essential-services-progress.test.ts`

Expected: PASS with the database count matching the TypeScript manifest.

- [ ] **Step 6: Commit**

```bash
git add src/features/progress/progress-manifests.ts src/features/progress/progress-manifests.test.ts supabase/migrations/202609110003_add_essential_services_progress.sql supabase/migrations/essential-services-progress.test.ts
git commit -m "feat: register essential services progress"
```

### Task 11: Verify responsive behavior and end-to-end lesson access

**Files:**
- Create: `tests/e2e/http-essential-services.spec.ts`
- Modify: `src/app/theme-styles.test.ts`
- Modify: `src/content/lesson-rendering.test.tsx`
- Test: `tests/e2e/http-essential-services.spec.ts`

**Interfaces:**
- Consumes the published route and CSS from Tasks 2, 5, and 9.
- Produces browser coverage for desktop/mobile, map replay, public isolation, anchors, and locked return paths.

- [ ] **Step 1: Write failing browser tests**

```ts
test("renders the public essential-services lesson without protected content", async ({ page }) => {
  await page.goto("/learn/networking-foundations/http-https-tls-and-essential-network-services");
  await expect(page.getByRole("heading", { level: 1, name: "HTTP, HTTPS, TLS and Essential Network Services" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Page contents" })).toBeVisible();
  await expect(page.getByText(/RFC-level validation/)).toHaveCount(0);
});

test("contains players and map at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/learn/networking-foundations/http-https-tls-and-essential-network-services");
  await page.getByRole("button", { name: "Page contents" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
```

Add a locked-link test asserting the URL contains the selected anchor inside `returnTo`.

- [ ] **Step 2: Run the browser test and verify any missing integration fails**

Run: `pnpm test:e2e -- tests/e2e/http-essential-services.spec.ts`

Expected: FAIL until route, styles, and lock navigation are complete.

- [ ] **Step 3: Fix only integration and responsive defects revealed by the tests**

Keep fixes within essential-services components and shared network-map selectors. Do not restyle old lesson players or change authentication behavior.

- [ ] **Step 4: Run focused unit and browser verification**

Run: `pnpm test -- src/features/essential-services src/content/networking-foundations/http-https-tls-and-essential-network-services.content.test.ts src/features/lessons/lesson-section-navigation.test.tsx src/features/progress/progress-manifests.test.ts supabase/migrations/essential-services-progress.test.ts`

Run: `pnpm test:e2e -- tests/e2e/http-essential-services.spec.ts`

Expected: all focused tests PASS and no mobile overflow.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/http-essential-services.spec.ts src/app/theme-styles.test.ts src/content/lesson-rendering.test.tsx src/app/globals.css src/features/essential-services src/features/lessons
git commit -m "test: verify responsive essential services lesson"
```

### Task 12: Complete repository-wide verification

**Files:**
- Modify only files needed to correct failures caused by this branch.

**Interfaces:**
- Consumes the complete lesson implementation.
- Produces a branch ready for review and PR creation.

- [ ] **Step 1: Run TypeScript validation**

Run: `pnpm typecheck`

Expected: exit 0 with no type errors.

- [ ] **Step 2: Run lint**

Run: `pnpm lint`

Expected: exit 0 with no lint errors.

- [ ] **Step 3: Run the full unit/integration suite**

Run: `pnpm test`

Expected: every test file passes with no unhandled errors.

- [ ] **Step 4: Run the targeted browser suite once more**

Run: `pnpm test:e2e -- tests/e2e/http-essential-services.spec.ts`

Expected: all essential-services browser tests pass.

- [ ] **Step 5: Inspect the final diff and worktree**

Run: `git diff --check && git status --short && git log --oneline main..HEAD`

Expected: no whitespace errors, only intentional branch changes, and task-sized commits.

- [ ] **Step 6: Commit any verification-only corrections**

```bash
git add -u
git commit -m "fix: complete essential services verification"
```

Skip this commit when Step 1 through Step 5 require no corrections.

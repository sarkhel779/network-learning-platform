# Hosts and Network Devices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a beginner-friendly Hosts and Network Devices lesson with a descriptive clickable topology, four wired/wireless local/remote comparisons, Windows and Wireshark checks, and scenario-based assessment.

**Architecture:** Keep prose and static learning material in MDX, keep the catalog authoritative for publication/navigation, and place validated lesson-specific scenario/profile data in a focused `hosts-and-devices` feature. Reuse the existing packet-flow reducer, controls, inspector, SVG topology, reduced-motion hook, and fallback through optional device-selection hooks; a lesson wrapper owns scenario and device selection so the first lesson remains backward compatible.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9 strict mode, MDX 3, Zod 4, Vitest 3, Testing Library, Playwright 1.55, SVG, CSS.

**Spec:** `docs/superpowers/specs/2026-08-31-hosts-and-network-devices-design.md`

## Global Constraints

- Preserve `How Networks Communicate` behavior and visuals.
- ARP is only a next-hop reminder; detailed ARP/MAC learning stays in its later lesson.
- Firewall is only a security-boundary introduction; policy, state, NAT, and Palo Alto stay later.
- Wireless scenarios assume association and omit detailed 802.11 fields.
- Every scenario includes outbound and return paths.
- Device details lead with plain language and put depth in `Technical details`.
- Use consistent private/documentation IP addresses and fictional MAC addresses.
- Essential prose, commands, summaries, and assessments remain server-rendered without JavaScript.
- Preserve playback speeds `0.5×`, `1×`, `1.5×`, and `2×`.
- Add no API, network request, browser permission, persistence, or runtime dependency.
- Follow TDD for every behavior and never stage `.pnpm-store/`.

## File Structure

- `src/features/hosts-and-devices/hosts-and-devices.schema.ts` validates profiles, choices, scenarios, and references.
- `src/features/hosts-and-devices/hosts-and-devices.data.ts` owns the shared topology, four journeys, and device copy.
- `src/features/hosts-and-devices/device-details.tsx` renders the selected device explanation.
- `src/features/hosts-and-devices/hosts-and-devices-experience.tsx` owns scenario/device state and composes packet flow.
- Existing packet-flow components gain optional selection props without changing default behavior.
- `src/content/networking-foundations/hosts-and-network-devices.mdx` owns complete static lesson content.
- Catalog, lesson repository, MDX registry, global CSS, and focused unit/E2E tests receive small integrations.

---

### Task 1: Publish and Load the Lesson Shell

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Create: `src/content/networking-foundations/hosts-and-network-devices.mdx`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`

**Interfaces:**
- Consumes: `listPublishedLessons()`, `getAdjacentLessons()`, and `loadLessonContent()`.
- Produces: `/learn/networking-foundations/hosts-and-network-devices` with eight matching section anchors.

- [ ] **Step 1: Write failing publication and route tests**

```ts
expect(listPublishedLessons("networking-foundations").map(({ slug }) => slug)).toEqual([
  "how-networks-communicate",
  "hosts-and-network-devices",
]);
const adjacent = getAdjacentLessons("networking-foundations", "hosts-and-network-devices");
expect(adjacent.previous?.slug).toBe("how-networks-communicate");
expect(adjacent.next?.slug).toBe("osi-and-tcp-ip-models");
```

- [ ] **Step 2: Verify failure**

```powershell
pnpm exec vitest run src/features/catalog/catalog.repository.test.ts 'src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts'
```

Expected: FAIL because the lesson is unpublished and unregistered.

- [ ] **Step 3: Publish exact metadata**

Set `published: true`, `estimatedMinutes: 20`, and objective `Identify the devices in a topology and predict whether a host sends locally or through its default gateway.` Add ordered sections: `what-is-a-host`, `connecting-devices`, `explore-topology`, `compare-journeys`, `windows-checks`, `wireshark-checks`, `test-understanding`, and `summary`.

- [ ] **Step 4: Create the valid eight-heading MDX skeleton and register it**

```ts
"networking-foundations/hosts-and-network-devices": () =>
  import("@/content/networking-foundations/hosts-and-network-devices.mdx"),
```

- [ ] **Step 5: Verify and commit**

```powershell
pnpm exec vitest run src/features/catalog/catalog.repository.test.ts 'src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts'
pnpm typecheck
git add docs/superpowers src/features/catalog/catalog.data.ts src/features/catalog/catalog.repository.test.ts src/features/lessons/lesson-content.repository.ts src/content/networking-foundations/hosts-and-network-devices.mdx 'src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts'
git commit -m "feat: publish hosts and devices lesson shell"
```

---

### Task 2: Validate Device Profiles and Scenario Bundle

**Files:**
- Create: `src/features/hosts-and-devices/hosts-and-devices.schema.ts`
- Create: `src/features/hosts-and-devices/hosts-and-devices.schema.test.ts`

**Interfaces:**
- Consumes: `PacketFlowScenario` and `safeParsePacketFlowScenario()`.
- Produces: `DeviceProfile`, `JourneyChoice`, `HostsAndDevicesLab`, `parseHostsAndDevicesLab()`, and `safeParseHostsAndDevicesLab()`.

- [ ] **Step 1: Write failing valid/invalid bundle tests**

Reject empty journeys, duplicate journey IDs, missing/unknown profiles, different device sets between scenarios, invalid packet scenarios, and journey-note keys that do not reference a declared journey.

```ts
expect(() => parseHostsAndDevicesLab({ ...validLab, journeys: [] })).toThrow();
expect(() => parseHostsAndDevicesLab({ ...validLab, profiles: validLab.profiles.slice(1) })).toThrow(/profile/i);
```

- [ ] **Step 2: Verify module-not-found failure**

```powershell
pnpm exec vitest run src/features/hosts-and-devices/hosts-and-devices.schema.test.ts
```

- [ ] **Step 3: Implement exact public shapes**

```ts
type DeviceProfile = Readonly<{
  deviceId: string;
  name: string;
  category: "host" | "intermediary" | "security-boundary";
  summary: string;
  purpose: string;
  trafficRole: string;
  addressing: string;
  packetBehavior: string;
  evidence: string;
  commonFailure: string;
  analogy: string;
  technicalDetails: string;
  journeyNotes: Readonly<Record<string, string>>;
}>;
type JourneyChoice = Readonly<{ id: string; label: string; shortDescription: string; scenario: PacketFlowScenario }>;
type HostsAndDevicesLab = Readonly<{
  id: string; title: string; description: string;
  journeys: readonly JourneyChoice[]; profiles: readonly DeviceProfile[];
}>;
```

- [ ] **Step 4: Verify and commit**

```powershell
pnpm exec vitest run src/features/hosts-and-devices/hosts-and-devices.schema.test.ts
pnpm typecheck
git add src/features/hosts-and-devices
git commit -m "feat: validate hosts and devices lab data"
```

---

### Task 3: Add Four Journeys and Eight Profiles

**Files:**
- Create: `src/features/hosts-and-devices/hosts-and-devices.data.ts`
- Create: `src/features/hosts-and-devices/hosts-and-devices.data.test.ts`

**Interfaces:**
- Consumes: Task 2 parser and existing packet-step schema.
- Produces: `hostsAndDevicesLab` with `wired-local`, `wireless-local`, `wired-remote`, and `wireless-remote`.

- [ ] **Step 1: Write failing semantic data tests**

Assert the four journey IDs and eight device IDs: `wired-pc`, `wireless-laptop`, `access-point`, `switch`, `gateway`, `firewall`, `local-server`, `remote-server`. Every journey must contain outbound and return phases. Local journeys cannot activate `gateway-firewall`; remote journeys must. Local unicast frames target the local server MAC; remote first frames target the gateway MAC while preserving the remote destination IP.

- [ ] **Step 2: Verify failure**

```powershell
pnpm exec vitest run src/features/hosts-and-devices/hosts-and-devices.data.test.ts
```

- [ ] **Step 3: Add shared addresses and topology**

```ts
const addresses = {
  wiredPcIp: "192.168.10.10", wiredPcMac: "02:00:00:00:10:10",
  laptopIp: "192.168.10.20", laptopMac: "02:00:00:00:10:20",
  gatewayIp: "192.168.10.1", gatewayMac: "02:00:00:00:10:01",
  localServerIp: "192.168.10.50", localServerMac: "02:00:00:00:10:50",
  remoteServerIp: "203.0.113.50", remoteServerMac: "02:00:00:00:71:50",
} as const;
```

Links: `wired-switch`, `wireless-ap`, `ap-switch`, `switch-local`, `switch-gateway`, `gateway-firewall`, `firewall-remote`.

- [ ] **Step 4: Populate exact journey phases**

Local: subnet decision; destination ARP request/reply; request delivery one link per step; response return one link per step. Remote: remote decision; gateway ARP request/reply; request through gateway/firewall one link per step; response through the reverse path. Use `durationMs: 2200`; include `Protocol`, IP/MAC, and `Next hop` fields. Mark only link-layer fields as changed during routing and state that end-to-end IPs stay stable because NAT is not shown.

- [ ] **Step 5: Populate every profile field and four journey notes**

Copy must distinguish host origination, AP bridging, switch MAC forwarding, gateway IP routing/frame replacement, firewall checkpoint behavior, and local/remote server delivery.

- [ ] **Step 6: Verify and commit**

```powershell
pnpm exec vitest run src/features/hosts-and-devices src/features/packet-flow/packet-flow.schema.test.ts src/features/packet-flow/network-communication.scenario.test.ts
pnpm typecheck
git add src/features/hosts-and-devices
git commit -m "feat: add hosts and devices packet journeys"
```

---

### Task 4: Add Backward-Compatible Device Selection to Packet Flow

**Files:**
- Modify: `src/features/packet-flow/network-topology.tsx`
- Modify: `src/features/packet-flow/packet-flow-player.tsx`
- Modify: `src/features/packet-flow/packet-flow-experience.tsx`
- Modify: `src/features/packet-flow/packet-flow-player.test.tsx`
- Modify: `src/features/packet-flow/packet-flow-experience.test.tsx`

**Interfaces:**
- Produces optional `selectedDeviceId?: string` and `onDeviceSelect?: (deviceId: string) => void` props on all three components.

- [ ] **Step 1: Write failing selection/pause tests**

```tsx
render(<PacketFlowPlayer scenario={scenario} onDeviceSelect={onDeviceSelect} />);
await user.click(screen.getByRole("button", { name: "Explore Client" }));
expect(onDeviceSelect).toHaveBeenCalledWith("client");
expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
```

Rerender selected and assert `aria-pressed="true"`. Without the callback, preserve the named SVG image and expose no device buttons.

- [ ] **Step 2: Verify prop/type failures**

```powershell
pnpm exec vitest run src/features/packet-flow/packet-flow-player.test.tsx src/features/packet-flow/packet-flow-experience.test.tsx
```

- [ ] **Step 3: Add optional SVG controls**

Selectable `<g>` elements get `role="button"`, `tabIndex={0}`, `aria-label`, `aria-pressed`, click, Enter, and Space handling. Nonselectable scenarios receive none of those semantics.

- [ ] **Step 4: Pause then forward selection**

`PacketFlowPlayer` dispatches `{ type: "pause" }` before invoking the callback. Thread props through validation/client-only rendering.

- [ ] **Step 5: Verify and commit**

```powershell
pnpm exec vitest run src/features/packet-flow
pnpm typecheck
git add src/features/packet-flow
git commit -m "feat: support selectable packet flow devices"
```

---

### Task 5: Build Scenario Selection and Device Details

**Files:**
- Create: `src/features/hosts-and-devices/device-details.tsx`
- Create: `src/features/hosts-and-devices/device-details.test.tsx`
- Create: `src/features/hosts-and-devices/hosts-and-devices-experience.tsx`
- Create: `src/features/hosts-and-devices/hosts-and-devices-experience.test.tsx`
- Modify: `mdx-components.tsx`

**Interfaces:**
- Produces: `DeviceDetails({ profile, journeyId, onClose })` and registered `HostsAndDevicesExperience()`.

- [ ] **Step 1: Write failing detail tests**

Assert name, summary, analogy, purpose, traffic role, addressing, packet behavior, evidence, common failure, active journey note, closed-by-default technical details, and close action.

- [ ] **Step 2: Write failing experience tests**

Assert four ordered radios; first selected; scenario change resets to Step 1 and updates topology name; selecting a device opens the correct profile; closing preserves the step.

- [ ] **Step 3: Verify missing-component failures**

```powershell
pnpm exec vitest run src/features/hosts-and-devices/device-details.test.tsx src/features/hosts-and-devices/hosts-and-devices-experience.test.tsx
```

- [ ] **Step 4: Implement complete labelled details**

Use a `<section aria-labelledby>` with labelled subsections and native `<details><summary>Technical details</summary>`.

- [ ] **Step 5: Implement wrapper state and reset**

```ts
const [journeyId, setJourneyId] = useState(lab.journeys[0].id);
const [selectedDeviceId, setSelectedDeviceId] = useState<string>();
```

Render a labelled radio group. Scenario change clears selection. Render `PacketFlowExperience key={journeyId}` to reset its reducer and pass device-selection props.

- [ ] **Step 6: Register, verify, and commit**

```powershell
pnpm exec vitest run src/features/hosts-and-devices src/features/packet-flow
pnpm typecheck
git add src/features/hosts-and-devices mdx-components.tsx
git commit -m "feat: add interactive device explorer"
```

---

### Task 6: Author Complete Static Lesson Content

**Files:**
- Modify: `src/content/networking-foundations/hosts-and-network-devices.mdx`
- Create: `src/features/lessons/hosts-and-devices-content.server.test.tsx`

**Interfaces:**
- Consumes: existing learning blocks and new `HostsAndDevicesExperience`.
- Produces: valid, server-rendered content matching all catalog anchors.

- [ ] **Step 1: Write a failing server-content test**

Assert all headings, `ipconfig /all`, `arp -a`, `route print`, `ip.addr == 203.0.113.50`, `eth.addr == 02:00:00:00:10:01`, firewall scope copy, unique section IDs, and no nested paragraph markup.

- [ ] **Step 2: Verify missing-copy failure**

```powershell
pnpm exec vitest run src/features/lessons/hosts-and-devices-content.server.test.tsx
```

- [ ] **Step 3: Write host/device instruction and role table**

Cover PC, laptop, phone, server, printer, IoT, switch, AP, gateway, and firewall. Table columns: `Device`, `Host or intermediary`, `Main decision`, `What it does not do here`.

- [ ] **Step 4: Embed explorer and comparison invariant**

Use `<HostsAndDevicesExperience />` and state: “The destination IP identifies the final host. The destination MAC identifies the next receiver on the current local link.”

- [ ] **Step 5: Add Windows/Wireshark evidence**

Use the Task 3 addresses. Explain connected/default routes and filters `arp`, `icmp`, `ip.addr == 203.0.113.50`, `eth.addr == 02:00:00:00:10:01`, and `tcp`. State that one capture point cannot show every routed-link frame.

- [ ] **Step 6: Add assessment and summary**

Add classification and first-hop `KnowledgeCheck`s; expandable interview answers for wrong gateway, unavailable switch, disconnected AP, empty ARP cache, and firewall boundary; unfamiliar-topology challenge; final role/addressing table.

- [ ] **Step 7: Verify and commit**

```powershell
pnpm exec vitest run src/features/lessons/hosts-and-devices-content.server.test.tsx src/features/lessons/knowledge-check.test.tsx src/features/packet-flow/packet-flow-experience.server.test.tsx
pnpm typecheck
git add src/content/networking-foundations/hosts-and-network-devices.mdx src/features/lessons/hosts-and-devices-content.server.test.tsx
git commit -m "feat: author hosts and network devices lesson"
```

---

### Task 7: Finish Responsive Styling and Browser Coverage

**Files:**
- Modify: `src/app/globals.css`
- Create: `tests/e2e/hosts-and-devices.spec.ts`
- Modify: `tests/e2e/lesson.spec.ts`
- Modify: `tests/e2e/navigation.spec.ts`

**Interfaces:**
- Produces: responsive, keyboard-accessible integrated lesson with console and no-JavaScript evidence.

- [ ] **Step 1: Write failing E2E tests**

```ts
await page.goto("/learn/networking-foundations/hosts-and-network-devices");
await expect(page.getByRole("radio", { name: "Wired host to local server" })).toBeChecked();
await page.getByRole("radio", { name: "Wireless host to remote server" }).check();
await expect(page.getByText(/Step 1 of/)).toBeVisible();
await page.getByRole("button", { name: "Explore Wireless laptop" }).click();
await expect(page.getByRole("heading", { name: "Wireless laptop" })).toBeVisible();
```

Verify pause-on-details, preserved step, gateway first-hop MAC, return path, current curriculum link, and next unpublished OSI lesson.

- [ ] **Step 2: Add mobile, keyboard, reduced-motion, console, and no-JavaScript cases**

At `390×844`, require no document overflow. Exercise Tab/Enter/Space. Under reduced motion, require manual start. Collect `pageerror` and relevant console failures. Without JavaScript, require headings, tables, commands, filters, interview content, and fallback.

- [ ] **Step 3: Verify the E2E failure before styling completion**

```powershell
pnpm exec playwright test tests/e2e/hosts-and-devices.spec.ts --project=chromium
```

- [ ] **Step 4: Add focused CSS**

Style scenario cards, checked/focus-visible states, selectable/selected SVG devices, desktop two-column topology/details at `56rem`, mobile stacking, definition sections, command blocks, and responsive tables. Preserve existing active-device styling separately from `[aria-pressed="true"]`.

- [ ] **Step 5: Update prior navigation expectations**

Hosts and Network Devices becomes a published link; OSI remains `Coming later`. Do not weaken first-lesson hydration or packet assertions.

- [ ] **Step 6: Verify and commit**

```powershell
pnpm exec vitest run src/features/hosts-and-devices src/features/packet-flow src/features/lessons src/features/catalog
pnpm exec playwright test tests/e2e/hosts-and-devices.spec.ts tests/e2e/lesson.spec.ts tests/e2e/navigation.spec.ts tests/e2e/packet-flow.spec.ts --project=chromium
git add src/app/globals.css tests/e2e
git commit -m "test: verify hosts and devices lesson experience"
```

---

### Task 8: Final Regression Verification

**Files:**
- Modify only files implicated by verified failures.

**Interfaces:**
- Produces: a review-ready branch with all evidence and no unrelated staged files.

- [ ] **Step 1: Run full unit, static, build, and browser verification**

```powershell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm test:e2e
```

Expected: every command exits 0 and both published lesson routes build.

- [ ] **Step 2: Inspect repository state**

```powershell
git status --short
git diff --check
git diff --stat main...HEAD
git log --oneline main..HEAD
```

Expected: `.pnpm-store/` remains untracked/unstaged, diff check is silent, and only approved lesson/spec/plan work appears.

- [ ] **Step 3: Manually review both lessons on desktop and 390px mobile**

Verify all scenarios, profiles, packet fields, outbound/return paths, focus, details, commands, filters, curriculum links, and first-lesson regression behavior.

- [ ] **Step 4: Apply only evidence-driven fixes**

Add a focused failing test for every discovered issue, observe failure, implement the smallest correction, rerun the focused test, and repeat the full affected verification.

- [ ] **Step 5: Commit verified fixes only when tracked changes exist**

```powershell
git add src tests docs/superpowers mdx-components.tsx
git commit -m "fix: finalize hosts and devices lesson"
```

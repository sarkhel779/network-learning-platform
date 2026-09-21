# Hosts, Clients and Servers Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended) or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Lesson 2 with a concise beginner lesson and a three-scenario request/response player that teaches hosts, network interfaces, clients, servers, and role reversal without exposing later-layer material.

**Architecture:** Keep the explanatory lesson and quizzes in public MDX. Add one focused `HostRoleConversationPlayer` under `network-basics`, built from the existing validated packet-flow scenario model and `PacketFlowPlayer`, so it automatically reuses Lesson 1's `NetworkDeviceSymbol`, transport controls, reduced-motion behavior, and smooth CSS packet motion. Preserve the existing advanced material in a non-rendered reference file and leave reusable advanced feature code untouched.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9 strict mode, MDX 3, Vitest 3, Testing Library, SVG, CSS.

**Spec:** `docs/superpowers/specs/2026-09-21-hosts-clients-servers-restructure-design.md`

## Global Constraints

- Preserve the stable slug `hosts-and-network-devices`, lesson ID, public access, title, and position immediately after Lesson 1.
- Show only beginner material: hosts, interfaces, client/server roles, examples, role reversal, classification, and two required checks.
- Do not render Windows commands, Wireshark, ARP, subnet decisions, switching decisions, routing tables, gateways, firewall policy, NAT, DNS, transport ports, detailed headers, or interview troubleshooting.
- Preserve that advanced authored material in source control for later prerequisite-based modules.
- Reuse the exact Lesson 1 device symbols through the existing `NetworkTopology`/`NetworkDeviceSymbol` path; do not redraw or duplicate icons.
- Normal-speed packet travel is continuous along the cable and lasts 1.5 seconds.
- Initial and reset states are paused, show no packet, and show no explanation bubble.
- Switching scenarios resets the player; selecting the already-active scenario changes nothing.
- The file-sharing scenario visibly reverses client/server roles and packet direction.
- Player activity never completes the lesson. Completion remains tied only to both required knowledge checks.
- Add no dependency, API call, persistence, or database migration.
- Follow TDD and commit each verified task separately.

## Approved Lesson Order

1. `what-makes-a-device-a-host`
2. `network-interfaces`
3. `clients-and-servers`
4. `follow-host-conversations`
5. `one-host-more-than-one-role`
6. `classify-host-roles`
7. `knowledge-check`

---

### Task 1: Preserve Advanced Material and Lock the Beginner Lesson Boundary

**Files:**
- Create: `docs/reference/hosts-and-network-devices-advanced-reference.mdx`
- Delete: `src/content/networking-foundations/hosts-and-network-devices.account.mdx`
- Modify: `src/content/lesson-rendering.test.tsx`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`

**Interfaces:**
- The lesson repository continues loading only `hosts-and-network-devices.public.mdx`.
- The reference document is intentionally outside the MDX lesson loader.

- [ ] **Step 1: Add failing loader-boundary coverage**

Add an assertion that `loadLessonContent("networking-foundations", "hosts-and-network-devices", viewer)` returns the same public module for signed-out and signed-in viewers and never requests an account module.

```ts
expect(publicContent).toBe(signedInContent);
expect(accountImporter).not.toHaveBeenCalled();
```

- [ ] **Step 2: Run the focused test and confirm the expectation fails or exposes missing explicit coverage**

```powershell
pnpm exec vitest run src/features/lessons/lesson-content.repository.test.ts src/content/lesson-rendering.test.tsx
```

- [ ] **Step 3: Move the advanced MDX verbatim into the non-rendered reference location**

Preserve its commands, Wireshark filters, scenarios, and summary. Remove the two account-file table cases from `lesson-rendering.test.tsx`, because the reference file is no longer compiled as live lesson content.

- [ ] **Step 4: Verify and commit**

```powershell
pnpm exec vitest run src/features/lessons/lesson-content.repository.test.ts src/content/lesson-rendering.test.tsx
git add docs/reference src/content/networking-foundations/hosts-and-network-devices.account.mdx src/content/lesson-rendering.test.tsx src/features/lessons/lesson-content.repository.test.ts
git commit -m "refactor: archive advanced hosts lesson material"
```

---

### Task 2: Define the Three Beginner Conversation Scenarios

**Files:**
- Create: `src/features/network-basics/host-role-conversations.ts`
- Create: `src/features/network-basics/host-role-conversations.test.ts`

**Interfaces:**
- Consumes: `parsePacketFlowScenario()` and `PacketFlowScenario`.
- Produces: `HostConversationId`, `HostConversationStep`, `HostConversation`, `hostRoleConversations`.

- [ ] **Step 1: Write failing semantic tests for exact scenario behavior**

Assert ordered IDs `web-request`, `print-job`, `file-sharing`; request and response directions; 1500 ms travel; stable endpoint IDs; and a genuine file-sharing role reversal.

```ts
expect(Object.keys(hostRoleConversations)).toEqual(["web-request", "print-job", "file-sharing"]);
expect(fileSharing.stepRoles.map(({ clientId, serverId }) => [clientId, serverId])).toContainEqual(["computer-b", "computer-a"]);
```

Also assert every `bubble.deviceId` is active in the corresponding step and every packet endpoint exists in the scenario.

- [ ] **Step 2: Verify the module-not-found failure**

```powershell
pnpm exec vitest run src/features/network-basics/host-role-conversations.test.ts
```

- [ ] **Step 3: Implement the public data shapes**

```ts
export type HostConversationStep = Readonly<{
  clientId: string;
  serverId: string;
  bubble: Readonly<{
    deviceId: string;
    eyebrow: "CLIENT" | "SERVER" | "HOST";
    title: string;
    description: string;
  }>;
}>;

export type HostConversation = Readonly<{
  id: HostConversationId;
  label: string;
  summary: string;
  scenario: PacketFlowScenario;
  stepRoles: readonly HostConversationStep[];
}>;
```

- [ ] **Step 4: Populate exact beginner flows**

`web-request`: Laptop/browser → Web server request, then Web server → Laptop response.

`print-job`: Laptop → Network printer print request, then Network printer → Laptop acknowledgement.

`file-sharing`: Computer A → Computer B file request, Computer B → Computer A response, then Computer B → Computer A request and Computer A → Computer B response. This second exchange demonstrates role reversal without adding protocols or addressing.

Use host symbols for laptop/computers/printer and the existing server symbol for the web server. Use `durationMs: 5200` for teaching steps; packet travel remains a separate 1500 ms player property.

- [ ] **Step 5: Verify and commit**

```powershell
pnpm exec vitest run src/features/network-basics/host-role-conversations.test.ts src/features/packet-flow/packet-flow.schema.test.ts
pnpm typecheck
git add src/features/network-basics/host-role-conversations.ts src/features/network-basics/host-role-conversations.test.ts
git commit -m "feat: define beginner host conversations"
```

---

### Task 3: Build the Host Role Conversation Player

**Files:**
- Create: `src/features/network-basics/host-role-conversation-player.tsx`
- Create: `src/features/network-basics/host-role-conversation-player.test.tsx`
- Modify: `mdx-components.tsx`

**Interfaces:**
- Consumes: `hostRoleConversations` and `PacketFlowPlayer`.
- Produces: registered MDX component `HostRoleConversationPlayer`.

- [ ] **Step 1: Write failing untouched-state and control tests**

Assert the first scenario is selected, the topology uses `[data-device-symbol]`, the bubble is absent, no packet marker exists, and Play is visible. Assert Restart-before-Play keeps that exact state.

```ts
expect(screen.queryByRole("status")).not.toBeInTheDocument();
expect(container.querySelector("[data-packet-marker]")).toBeNull();
await user.click(screen.getByRole("button", { name: "Restart" }));
expect(screen.getByRole("button", { name: "Play" })).toBeVisible();
```

- [ ] **Step 2: Write failing scenario reset and active-reselection tests**

After Play, selecting `Print job` resets to paused/no bubble. Selecting `Print job` again while it is running must preserve the current step, bubble, and Pause state.

- [ ] **Step 3: Write failing synchronization and role-reversal tests**

For each Next action, assert packet direction, active endpoint glow, muted inactive endpoint, bubble title, and visible `Client`/`Server` role labels agree. In file sharing, assert the labels reverse when Computer B becomes requester.

- [ ] **Step 4: Write failing motion, reduced-motion, and keyboard tests**

At normal speed, require `.network-topology__packet-marker--travel` with `animationDuration: "1500ms"` and CSS travel coordinates. Under reduced motion, no travel occurs until the learner explicitly enables smooth motion. Scenario buttons and player controls must work by keyboard.

- [ ] **Step 5: Verify all tests fail for the missing component**

```powershell
pnpm exec vitest run src/features/network-basics/host-role-conversation-player.test.tsx
```

- [ ] **Step 6: Implement the wrapper state and bubble overlay**

```ts
const [conversationId, setConversationId] = useState<HostConversationId>("web-request");
const [hasStarted, setHasStarted] = useState(false);
const [stepIndex, setStepIndex] = useState(0);
```

Use `PacketFlowPlayer` with:

```tsx
<PacketFlowPlayer
  allowMotionOverride
  autoplay={false}
  key={conversation.scenario.id}
  onPlaybackStart={() => setHasStarted(true)}
  onStepChange={setStepIndex}
  packetMotion="dhcp-css"
  packetTravelDurationMs={1500}
  scenario={conversation.scenario}
  showStepSummary={false}
  suppressHeading
  topologyOverlay={hasStarted ? overlay : null}
/>
```

Scenario selection must return early when the chosen ID is already active. Otherwise reset `hasStarted` and `stepIndex` before remounting the player.

- [ ] **Step 7: Reuse exact device symbols and register MDX**

Do not import or draw new icon SVGs. The validated scenario renders through `PacketFlowPlayer` → `NetworkTopology` → `NetworkDeviceSymbol`. Add only the new component import and registry entry in `mdx-components.tsx`.

- [ ] **Step 8: Verify and commit**

```powershell
pnpm exec vitest run src/features/network-basics/host-role-conversation-player.test.tsx src/features/network-basics/device-role-identifier.test.tsx src/features/packet-flow
pnpm typecheck
git add src/features/network-basics/host-role-conversation-player.tsx src/features/network-basics/host-role-conversation-player.test.tsx mdx-components.tsx
git commit -m "feat: add host role conversation player"
```

---

### Task 4: Rewrite Lesson 2 Around the Approved Beginner Sequence

**Files:**
- Modify: `src/content/networking-foundations/hosts-and-network-devices.public.mdx`
- Modify: `src/content/networking-foundations/hosts-and-network-devices.content.test.ts`
- Modify: `src/content/computer-network-basics-content.test.ts`
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/computer-network-basics-catalog.test.ts`

**Interfaces:**
- Produces seven matching public section anchors and two unchanged required quiz IDs.
- Embeds `<HostRoleConversationPlayer />` and retains `<HostRoleClassifier />`.

- [ ] **Step 1: Update content tests first**

Require the exact seven heading IDs, both interactions, two knowledge checks, and absence of advanced keywords/components.

```ts
expect(headingIds).toEqual([
  "what-makes-a-device-a-host",
  "network-interfaces",
  "clients-and-servers",
  "follow-host-conversations",
  "one-host-more-than-one-role",
  "classify-host-roles",
  "knowledge-check",
]);
expect(lesson).not.toMatch(/ipconfig|Wireshark|ARP cache|route print|NAT|firewall policy/i);
```

- [ ] **Step 2: Run tests and confirm the new section/player expectations fail**

```powershell
pnpm exec vitest run src/content/networking-foundations/hosts-and-network-devices.content.test.ts src/content/computer-network-basics-content.test.ts src/features/catalog/computer-network-basics-catalog.test.ts
```

- [ ] **Step 3: Rewrite the public MDX concisely**

Teach that a host is an endpoint; interfaces are connection points; client/server are per-conversation application roles; and one machine can hold both roles. Include examples of laptop, phone, desktop, printer, camera, physical server, and cloud server without introducing packet headers or address resolution.

Insert:

```mdx
<h2 id="follow-host-conversations">Follow host conversations</h2>

Watch who asks, who provides, and how the response returns. Focus on the role each host has in the current conversation.

<HostRoleConversationPlayer />
```

Keep `hosts_and_network_devices_check_1` and `hosts_and_network_devices_check_2` unchanged so the production progress manifest and database require no migration.

- [ ] **Step 4: Update catalog section metadata only**

Insert `{ id: "follow-host-conversations", label: "Follow host conversations", access: "public" }` in the same order as MDX. Keep `published: true`, `estimatedMinutes: 15`, title, objective, and slug unchanged.

- [ ] **Step 5: Verify quiz-only completion remains unchanged**

Do not add `follow-host-conversations` to `interactiveAnchors` and do not pass a `progressItemId` to the player. Keep the existing manifest definition with two knowledge checks. Run:

```powershell
pnpm exec vitest run src/features/progress/progress-manifests.test.ts src/features/progress src/content/networking-foundations/hosts-and-network-devices.content.test.ts
```

- [ ] **Step 6: Verify and commit**

```powershell
pnpm exec vitest run src/content/networking-foundations/hosts-and-network-devices.content.test.ts src/content/computer-network-basics-content.test.ts src/features/catalog/computer-network-basics-catalog.test.ts src/content/lesson-rendering.test.tsx
pnpm typecheck
git add src/content/networking-foundations/hosts-and-network-devices.public.mdx src/content/networking-foundations/hosts-and-network-devices.content.test.ts src/content/computer-network-basics-content.test.ts src/features/catalog/catalog.data.ts src/features/catalog/computer-network-basics-catalog.test.ts
git commit -m "feat: restructure hosts clients and servers lesson"
```

---

### Task 5: Add Responsive, Theme-Safe Player Presentation

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/theme-styles.test.ts`

**Interfaces:**
- Produces player-specific styles under `.host-role-conversation` without changing Lesson 1 selectors.

- [ ] **Step 1: Write failing CSS contract tests**

Require a desktop endpoint-role overlay, a mobile breakpoint no wider than `44rem`, wrapping scenario controls, theme-variable colors, reduced-motion behavior, and bubble containment.

```ts
expect(css).toMatch(/\.host-role-conversation__role-label/);
expect(css).toMatch(/@media\s*\(max-width:\s*44rem\)[\s\S]*\.host-role-conversation/);
```

- [ ] **Step 2: Verify the styling test fails**

```powershell
pnpm exec vitest run src/app/theme-styles.test.ts
```

- [ ] **Step 3: Add focused styling**

Use existing color variables, reuse the Lesson 1 thought-cloud visual language, center headings inside the bubble, keep the bubble above its active endpoint, wrap scenario buttons, avoid white selection outlines, and prevent labels/bubbles from overlapping or causing horizontal overflow at 390 px.

Use `data-active-role="client"|"server"` and existing `data-active`/`data-packet-state` attributes for glow/subdued states. Do not style icons by drawing replacements.

- [ ] **Step 4: Verify and commit**

```powershell
pnpm exec vitest run src/app/theme-styles.test.ts src/features/network-basics/host-role-conversation-player.test.tsx src/features/network-basics/device-role-identifier.test.tsx
git add src/app/globals.css src/app/theme-styles.test.ts
git commit -m "style: finish host conversation player"
```

---

### Task 6: Integration, Visual Preview, and Regression Verification

**Files:**
- Modify only files implicated by verified failures.

- [ ] **Step 1: Run focused behavior and content verification**

```powershell
pnpm exec vitest run src/features/network-basics src/features/packet-flow src/content/networking-foundations/hosts-and-network-devices.content.test.ts src/content/lesson-rendering.test.tsx src/features/catalog/computer-network-basics-catalog.test.ts src/features/progress/progress-manifests.test.ts src/app/theme-styles.test.ts
```

- [ ] **Step 2: Run full repository verification**

```powershell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

- [ ] **Step 3: Review the actual lesson in a local preview**

Review `/learn/networking-foundations/hosts-and-network-devices` in dark and light themes at desktop and 390×844 mobile. Exercise all three scenarios, every control, 1× travel timing, role reversal, restart-before-play, repeated active-scenario selection, and reduced motion. Confirm no advanced material, console error, content overlap, white icon text, or horizontal overflow.

- [ ] **Step 4: Show the user the local preview and wait for approval**

Do not push or open a pull request before explicit preview approval.

- [ ] **Step 5: Inspect branch scope and commit any verified final correction**

```powershell
git status --short
git diff --check
git diff --stat origin/main...HEAD
git log --oneline origin/main..HEAD
```

Expected: only the approved Lesson 2 spec, plan, archived reference, player, content, catalog, styles, and tests are present.

---

## Review Focus

Every item below must be proven by an automated test before review:

1. Restart-before-Play remains paused with no packet and no bubble.
2. Reselecting the active scenario is a no-op and does not reset playback.
3. File-sharing role reversal keeps labels, bubble, active endpoint, and packet direction synchronized.
4. At 390 px, the bubble and endpoint labels remain associated with devices without overlap or horizontal overflow.
5. The player has no progress item and both existing quiz answers remain the only completion requirements.

## Acceptance Criteria

The lesson is complete when a beginner can define a host and network interface, distinguish client and server roles, follow a request and response in the three approved examples, and explain role reversal. The player must use Lesson 1's real device symbols, begin only after Play, move continuously for 1.5 seconds at normal speed, work in both themes and on mobile, and leave lesson completion exclusively to the two required knowledge checks.

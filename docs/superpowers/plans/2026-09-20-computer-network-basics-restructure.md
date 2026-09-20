# Computer Network Basics Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the first Networking Foundations module with nine beginner-first lessons, simple public interactions, a signed-in final quiz, preserved legacy progress, and no premature packet-forwarding mechanics.

**Architecture:** Keep the existing catalogue, MDX content registry, quiz-only progress engine, and Next.js lesson shell. Split the combined device material into focused lessons, reuse stable lesson IDs where topics still match, add small accessible interaction components, permanently redirect the retired combined URL, and use one transactional Supabase migration for new manifests and completion carry-forward. Existing lessons displaced from Module 1 are moved intact to the closest current later module so their URLs, content, and history remain available until those modules are redesigned separately.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, MDX, Zod, Vitest, Testing Library, Supabase/PostgreSQL, pnpm

**Spec:** `docs/superpowers/specs/2026-09-20-computer-network-basics-restructure-design.md`

## Global Constraints

- Change only Module 1 content and the minimum catalogue placement needed to preserve displaced lessons; do not implement **How Data Moves Through Networks**.
- Module 1 must contain exactly the nine approved lessons in the approved order.
- All eight instructional lessons, their introductory interactions, and their short checks are public and free.
- Anonymous learners may answer instructional checks without persistence; a free account is required to persist progress and take the final module quiz.
- Completion remains quiz-only; do not expose manual completion, restart, or retry-saving controls.
- Do not teach DNS, ARP, binary AND, local/foreign decisions, switch forwarding, route selection, hop-by-hop mutation, or a complete packet journey in Module 1.
- Preserve stable routes and IDs for Introduction, Hosts, Routers, and OSI/TCP-IP.
- Preserve all detailed players and detailed lesson files for later modules; do not delete reusable content.
- Preserve all historical attempts and events. Database changes must be additive, transactional, foreign-key ordered, conflict-safe, and idempotent.
- Keep the current dark visual system and verify equivalent readable light-theme rendering.
- Use one branch and pull request: `feature/computer-network-basics-restructure`.
- Before production migration: confirm a current production database backup, merge the reviewed PR, then apply the verified migration.

## File Structure

- `src/features/catalog/catalog.data.ts` — authoritative Module 1 lesson records, exact order, access sections, and temporary relocation of four displaced lessons.
- `src/features/catalog/lesson-aliases.ts` — pure legacy-route lookup; contains no rendering or database logic.
- `src/features/network-basics/*.tsx` — focused, accessible recognition/placement interactions; one component per concept.
- `src/content/networking-foundations/*.mdx` — public instructional prose and checks; final quiz content remains account-only.
- `src/features/lessons/lesson-content.repository.ts` — lazy MDX import registration only.
- `src/features/lessons/lesson-shell.tsx` and `registration-boundary.tsx` — accurate anonymous access/save-progress messaging.
- `src/features/progress/progress-manifests.ts` — client/server manifest definitions matching MDX check IDs.
- `supabase/migrations/202609200002_computer_network_basics_restructure.sql` — new manifest rows and legacy split completion carry-forward.
- Existing detailed players and retired combined MDX stay in the repository for later reuse but are no longer rendered by Module 1.

## Review Focus

1. A production content-order override containing old Module 1 lesson IDs must not scramble the new nine-lesson order; catalogue override tests must reject stale/non-permutation orders.
2. A signed-out learner must see every instructional section and use every introductory check without receiving an account-only content error; lesson-shell tests must render the anonymous path.
3. A completed legacy Hubs/Bridges/Switches attempt must create completed Hubs, Bridges, and Switches attempts exactly once, while an incomplete legacy attempt creates none; migration tests must cover both and rerun safety.
4. The retired combined lesson URL must permanently redirect, while the four temporarily relocated lesson URLs remain canonical and directly render; route and sitemap tests must pin both behaviours.
5. Light-theme labels, outlines, selected states, and focus states in every new interaction must remain readable, and all controls must be keyboard-operable with at least a 44px target; component tests and browser review must cover this.

---

### Task 1: Lock the New Catalogue Shape and Preserve Displaced Lessons

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.types.ts`
- Modify: `src/features/catalog/catalog.schema.ts`
- Modify: `src/features/catalog/catalog.schema.test.ts`
- Create: `src/features/catalog/lesson-access-label.ts`
- Create: `src/features/catalog/lesson-access-label.test.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/catalog/module-list.tsx`
- Modify: `src/features/catalog/module-list.test.tsx`
- Modify: `src/features/lessons/curriculum-navigation.tsx`
- Modify: `src/features/lessons/curriculum-navigation.test.tsx`
- Modify: `src/features/catalog/content-publication.repository.ts`
- Modify: `src/features/catalog/content-publication.repository.test.ts`
- Modify: `src/app/admin/courses/actions.test.ts`

**Interfaces:**
- Consumes: existing `Pathway`, `Module`, and `LessonSummary` catalogue types.
- Produces: Module 1 record with ID `module_network_and_device_essentials`, slug `computer-network-basics`, title `Computer Network Basics`, and the nine approved lesson IDs in order.
- Produces: optional `LessonSummary.format: "lesson" | "assessment"` and `getLessonAccessLabel(lesson: LessonSummary): "Free" | "Free account"`; only the final quiz uses `format: "assessment"`.
- Produces: `isExactLessonOrder(currentIds: readonly string[], overrideIds: readonly string[]): boolean` in `content-publication.repository.ts` for stale override protection.

- [ ] **Step 1: Write failing catalogue and navigation tests**

Add assertions for the exact visible Module 1 identity and order:

```ts
expect(module).toMatchObject({
  id: "module_network_and_device_essentials",
  slug: "computer-network-basics",
  title: "Computer Network Basics",
});
expect(module.lessons.map(({ id }) => id)).toEqual([
  "lesson_how_networks_communicate",
  "lesson_hosts_and_network_devices",
  "lesson_hubs",
  "lesson_bridges",
  "lesson_switches",
  "lesson_routers_default_gateways_and_network_boundaries",
  "lesson_physical_and_logical_addressing",
  "lesson_osi_and_tcp_ip_models",
  "lesson_computer_network_basics_final_quiz",
]);
expect(module.lessons.slice(0, 8).every(({ sections }) =>
  sections?.every(({ access }) => access === "public"),
)).toBe(true);
expect(module.lessons[8].sections?.some(({ access }) => access === "account")).toBe(true);
expect(module.lessons.map(({ estimatedMinutes }) => estimatedMinutes)).toEqual([
  12, 15, 8, 10, 12, 12, 15, 18, 12,
]);
expect(getLessonAccessLabel(module.lessons[0])).toBe("Free");
expect(getLessonAccessLabel(module.lessons[8])).toBe("Free account");
```

Assert the relocation map without changing lesson IDs, slugs, titles, or sections:

```ts
expect(ethernetModule.lessons.map(({ id }) => id)).toEqual(expect.arrayContaining([
  "lesson_cables_fibre_wireless_and_network_connections",
  "lesson_unicast_broadcast_and_multicast_communication",
]));
expect(internetModule.lessons.map(({ id }) => id)).toEqual(expect.arrayContaining([
  "lesson_access_points_modems_onts_and_firewalls",
  "lesson_first_packet_journey_through_a_small_network",
]));
expect(ethernetModule.lessons.slice(0, 2).map(({ id }) => id)).toEqual([
  "lesson_cables_fibre_wireless_and_network_connections",
  "lesson_unicast_broadcast_and_multicast_communication",
]);
expect(internetModule.lessons[0].id).toBe("lesson_access_points_modems_onts_and_firewalls");
expect(internetModule.lessons.at(-1)?.id).toBe("lesson_first_packet_journey_through_a_small_network");
```

Add an override regression test:

```ts
const result = applyContentOverrides(pathway, {
  publications: {},
  orders: {
    module_network_and_device_essentials: [
      "lesson_how_networks_communicate",
      "lesson_hubs_bridges_and_switches",
    ],
  },
});
expect(result.modules[0].lessons.map(({ id }) => id)).toEqual(
  pathway.modules[0].lessons.map(({ id }) => id),
);
```

- [ ] **Step 2: Run the focused tests and confirm the old catalogue fails**

Run:

```powershell
pnpm vitest run src/features/catalog/catalog.repository.test.ts src/features/catalog/module-list.test.tsx src/features/lessons/curriculum-navigation.test.tsx src/features/catalog/content-publication.repository.test.ts src/app/admin/courses/actions.test.ts
```

Expected: FAIL because Module 1 still has the old name/order and stale override lists are still partially applied.

- [ ] **Step 3: Implement the exact catalogue records and conservative override rule**

Keep stable IDs/slugs for reused lessons. Add these new IDs/slugs:

```ts
const newBasicsLessons = {
  hubs: ["lesson_hubs", "hubs"],
  bridges: ["lesson_bridges", "bridges"],
  switches: ["lesson_switches", "switches"],
  addressing: ["lesson_physical_and_logical_addressing", "physical-and-logical-addressing"],
  finalQuiz: ["lesson_computer_network_basics_final_quiz", "computer-network-basics-final-quiz"],
} as const;
```

Use these titles and objectives:

```ts
[
  ["Introduction to Computer Networks and Network Devices", "Define a computer network and identify the broad roles of common end and intermediary devices."],
  ["Hosts, Clients and Servers", "Recognize hosts and explain how applications can act as clients, servers, or both."],
  ["Hubs", "Explain that a hub repeats an incoming signal to its other ports and why hubs are now mostly historical."],
  ["Bridges", "Explain how bridges introduced segmentation and basic filtering before modern switches."],
  ["Switches", "Explain how switches connect local devices and associate devices with ports at an introductory level."],
  ["Routers", "Explain how routers connect different IP networks and act as default gateways."],
  ["Physical and Logical Addressing", "Distinguish MAC and IP address roles and recognize their basic formats."],
  ["OSI and TCP/IP Models", "Relate common networking responsibilities to the OSI and TCP/IP layered models."],
  ["Computer Network Basics Final Quiz", "Check your understanding of the concepts introduced throughout Computer Network Basics."],
]
```

Implement strict override acceptance:

```ts
export function isExactLessonOrder(currentIds: readonly string[], overrideIds: readonly string[]) {
  return overrideIds.length === currentIds.length
    && new Set(overrideIds).size === currentIds.length
    && currentIds.every((id) => overrideIds.includes(id));
}
```

Only apply an order override when it is an exact permutation; otherwise retain source order. Move the four displaced lesson objects intact using the mapping asserted above.

Extend `LessonSummary` and its Zod schema with optional `format`, accepting only `lesson` or `assessment`. Set `format: "assessment"` on the final quiz. Implement:

```ts
export function getLessonAccessLabel(lesson: LessonSummary): "Free" | "Free account" {
  return lesson.format === "assessment" ? "Free account" : "Free";
}
```

Use this helper in `ModuleList` and `CurriculumNavigation` whenever a published lesson has no completed/in-progress status. Keep completion status labels higher priority than the access label.

- [ ] **Step 4: Re-run focused tests**

Run the Step 2 command.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/catalog src/features/lessons/curriculum-navigation.tsx src/features/lessons/curriculum-navigation.test.tsx src/app/admin/courses/actions.test.ts
git commit -m "feat: restructure computer network basics catalog"
```

### Task 2: Add the Introductory Interaction Components

**Files:**
- Create: `src/features/network-basics/device-role-identifier.tsx`
- Create: `src/features/network-basics/device-role-identifier.test.tsx`
- Create: `src/features/network-basics/host-role-classifier.tsx`
- Create: `src/features/network-basics/host-role-classifier.test.tsx`
- Create: `src/features/network-basics/hub-repeater-demo.tsx`
- Create: `src/features/network-basics/hub-repeater-demo.test.tsx`
- Create: `src/features/network-basics/bridge-segment-comparison.tsx`
- Create: `src/features/network-basics/bridge-segment-comparison.test.tsx`
- Create: `src/features/network-basics/switch-port-matcher.tsx`
- Create: `src/features/network-basics/switch-port-matcher.test.tsx`
- Create: `src/features/network-basics/router-boundary-placement.tsx`
- Create: `src/features/network-basics/router-boundary-placement.test.tsx`
- Create: `src/features/network-basics/address-format-inspector.tsx`
- Create: `src/features/network-basics/address-format-inspector.test.tsx`
- Create: `src/features/network-basics/layer-matching-exercise.tsx`
- Create: `src/features/network-basics/layer-matching-exercise.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: no progress API; these are public learning interactions.
- Produces: named React components with no required props: `DeviceRoleIdentifier`, `HostRoleClassifier`, `HubRepeaterDemo`, `BridgeSegmentComparison`, `SwitchPortMatcher`, `RouterBoundaryPlacement`, `AddressFormatInspector`, and `LayerMatchingExercise`.

- [ ] **Step 1: Write failing accessible-behaviour tests**

For each component, assert its precise introductory behaviour. Representative assertions:

```tsx
render(<HubRepeaterDemo />);
await user.click(screen.getByRole("button", { name: /send signal into port 1/i }));
expect(screen.getByText(/repeated to ports 2, 3, and 4/i)).toBeVisible();
expect(screen.queryByText(/mac table|collision algorithm/i)).not.toBeInTheDocument();

render(<AddressFormatInspector />);
await user.click(screen.getByRole("button", { name: /02:1a:2b:3c:4d:5e/i }));
expect(screen.getByText(/mac address/i)).toBeVisible();
expect(screen.getByText(/locally administered/i)).toBeVisible();

render(<LayerMatchingExercise />);
await user.selectOptions(screen.getByLabelText(/dns belongs to/i), "application");
expect(screen.getByRole("status")).toHaveTextContent(/correct/i);
```

Every test must also tab to each control, assert an accessible name, verify a visible focus class/state, and confirm the rendered fallback text still explains the concept before interaction.

- [ ] **Step 2: Run the interaction tests and confirm imports fail**

Run:

```powershell
pnpm vitest run src/features/network-basics
```

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement minimal stateful components**

Use semantic `<button>`, `<fieldset>`, `<legend>`, `<label>`, and `role="status"`; do not create drag-only controls. Keep decisions limited to:

```ts
const interactionScope = {
  deviceRoles: ["host", "local connector", "network boundary", "wireless access", "security boundary"],
  hostRoles: ["client", "server", "both"],
  hubResult: "repeat to every other port",
  bridgeViews: ["one shared segment", "two connected segments"],
  switchTask: "match named hosts to labelled ports",
  routerTask: "place the router between two differently named networks",
  addressSamples: ["02:1A:2B:3C:4D:5E", "01:00:5E:00:00:FB", "192.0.2.10"],
  layerMatches: ["Ethernet", "IP", "TCP", "DNS"],
} as const;
```

Do not include forwarding tables, flooding, route lookup, subnet masks, ARP, DNS resolution steps, or packet animation.

- [ ] **Step 4: Add shared visual styling and run tests**

Add `.network-basics-exercise`, selected/correct/incorrect states, `:focus-visible`, light-theme token use, and `min-block-size: 44px` for controls to `globals.css`.

Run:

```powershell
pnpm vitest run src/features/network-basics
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/network-basics src/app/globals.css
git commit -m "feat: add beginner network concept interactions"
```

### Task 3: Rewrite the Reused Introduction and Hosts Lessons

**Files:**
- Modify: `src/content/networking-foundations/how-networks-communicate.public.mdx`
- Modify: `src/content/networking-foundations/hosts-and-network-devices.public.mdx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Preserve but stop importing: `src/content/networking-foundations/how-networks-communicate.account.mdx`
- Preserve but stop importing: `src/content/networking-foundations/hosts-and-network-devices.account.mdx`
- Create: `src/content/computer-network-basics-content.test.ts`

**Interfaces:**
- Consumes: `DeviceRoleIdentifier`, `HostRoleClassifier`, and existing `KnowledgeCheck` MDX component.
- Produces: public MDX with stable quiz IDs `how_networks_communicate_check_1`, `hosts_and_network_devices_check_1`, and `hosts_and_network_devices_check_2`.

- [ ] **Step 1: Write failing source-boundary tests**

Assert the exact required headings and forbidden subjects:

```ts
expect(headings(introduction)).toEqual([
  "what-is-a-computer-network",
  "why-networks-exist",
  "lan-wan-and-the-internet",
  "end-and-intermediary-devices",
  "identify-device-roles",
  "knowledge-check",
]);
expect(headings(hosts)).toEqual([
  "what-makes-a-device-a-host",
  "network-interfaces",
  "clients-and-servers",
  "one-host-more-than-one-role",
  "classify-host-roles",
  "knowledge-check",
]);
for (const source of [introduction, hosts]) {
  expect(source).not.toMatch(/DNS query|ARP request|subnet mask|route lookup|MAC table|packet journey/i);
}
```

Assert each file imports and renders its named interaction and contains the stable `progressItemId` values above.

- [ ] **Step 2: Run the content test and confirm it fails**

Run:

```powershell
pnpm vitest run src/content/computer-network-basics-content.test.ts
```

Expected: FAIL on old headings and premature communication mechanics.

- [ ] **Step 3: Replace only the public rendered curriculum**

Write concise beginner prose following definition → purpose → location → examples → interaction → check. Use these check outcomes:

```ts
const expectedChecks = {
  introduction: "A network lets connected devices exchange data and share resources.",
  hosts1: "A printer with a network interface is a host.",
  hosts2: "The same computer can run a client application and serve a file to another device.",
};
```

Remove the `account` registry imports for these two lesson keys so signed-in learners do not receive the old advanced blocks. Do not import or render the old packet journey, Wireshark, interview, or routing-decision components. Leave the old `.account.mdx` files untouched as preserved source material for future modules.

- [ ] **Step 4: Run the content and MDX rendering tests**

Run:

```powershell
pnpm vitest run src/content/computer-network-basics-content.test.ts src/features/lessons/lesson-content.repository.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/content/networking-foundations/how-networks-communicate.public.mdx src/content/networking-foundations/hosts-and-network-devices.public.mdx src/features/lessons/lesson-content.repository.ts src/features/lessons/lesson-content.repository.test.ts src/content/computer-network-basics-content.test.ts
git commit -m "feat: simplify network introduction and host lessons"
```

### Task 4: Split Hubs, Bridges, and Switches into Separate Public Lessons

**Files:**
- Create: `src/content/networking-foundations/hubs.public.mdx`
- Create: `src/content/networking-foundations/bridges.public.mdx`
- Create: `src/content/networking-foundations/switches.public.mdx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `src/content/computer-network-basics-content.test.ts`
- Preserve: `src/content/networking-foundations/hubs-bridges-and-switches.public.mdx`
- Preserve: `src/content/networking-foundations/hubs-bridges-and-switches.account.mdx`

**Interfaces:**
- Consumes: `HubRepeaterDemo`, `BridgeSegmentComparison`, `SwitchPortMatcher`, and `KnowledgeCheck`.
- Produces: registry keys `networking-foundations/hubs`, `networking-foundations/bridges`, and `networking-foundations/switches`.
- Produces: quiz IDs `hubs_check_1`, `bridges_check_1`, and `switches_check_1`.

- [ ] **Step 1: Add failing registry/render/content tests**

For each lesson, load anonymous content and assert it renders. Assert headings:

```ts
const expected = {
  hubs: ["what-is-a-hub", "why-hubs-existed", "shared-traffic-and-bandwidth", "repeat-a-signal", "knowledge-check"],
  bridges: ["what-is-a-bridge", "why-bridges-were-introduced", "network-segments", "compare-segments", "knowledge-check"],
  switches: ["what-is-a-switch", "switch-ports", "more-selective-than-a-hub", "switches-and-routers", "match-hosts-to-ports", "knowledge-check"],
};
```

Forbid `MAC table`, `learn the source`, `flood`, `age`, `collision domain calculation`, and `forwarding decision` from the new sources.

- [ ] **Step 2: Run tests and confirm missing registry keys/files fail**

Run:

```powershell
pnpm vitest run src/features/lessons/lesson-content.repository.test.ts src/content/computer-network-basics-content.test.ts
```

Expected: FAIL with missing lesson content.

- [ ] **Step 3: Author and register the three focused lessons**

Each file follows the shared six-part pattern, renders only its named introductory component, and ends in one public `KnowledgeCheck`. Use these correct concepts:

```ts
const correctConcepts = {
  hubs: "A hub repeats an incoming signal to every other port.",
  bridges: "A bridge divides a shared network into segments and can filter some traffic.",
  switches: "A switch connects local devices and associates devices with ports; a router connects networks.",
};
```

Keep the combined MDX and detailed switching components untouched.

- [ ] **Step 4: Re-run focused tests**

Run the Step 2 command.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/content/networking-foundations/hubs.public.mdx src/content/networking-foundations/bridges.public.mdx src/content/networking-foundations/switches.public.mdx src/features/lessons/lesson-content.repository.ts src/features/lessons/lesson-content.repository.test.ts src/content/computer-network-basics-content.test.ts
git commit -m "feat: split introductory hub bridge and switch lessons"
```

### Task 5: Simplify Routers and Add Addressing and Layer-Model Lessons

**Files:**
- Modify: `src/content/networking-foundations/routers-default-gateways-and-network-boundaries.public.mdx`
- Create: `src/content/networking-foundations/physical-and-logical-addressing.public.mdx`
- Create: `src/content/networking-foundations/osi-and-tcp-ip-models.public.mdx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `src/content/computer-network-basics-content.test.ts`
- Modify: `src/content/lesson-access.content.test.ts`
- Preserve: all existing router/account, Ethernet/MAC, IPv4, and OSI account MDX files and their detailed player components.

**Interfaces:**
- Consumes: `RouterBoundaryPlacement`, `AddressFormatInspector`, `LayerMatchingExercise`, existing `LayerModelComparison`, existing `EncapsulationExperience`, and `KnowledgeCheck`.
- Produces: public addressing registry key and public OSI content loader.
- Preserves quiz IDs for reused Router and OSI lessons; adds `physical_and_logical_addressing_check_1` through `_3`.

- [ ] **Step 1: Write failing public-access and boundary tests**

Assert Router contains definition, interfaces, network boundaries, default gateway, and switch comparison, but none of:

```ts
[/local or remote/i, /route lookup/i, /routing table/i, /longest prefix/i, /what changes at each hop/i]
```

Assert Addressing includes MAC hexadecimal notation, U/L bit, I/G bit, IPv4 dotted decimal, and MAC-versus-IP roles, but excludes ARP, subnetting, binary AND, and delivery decisions.

Assert OSI public content includes all seven layers, TCP/IP mapping, `LayerModelComparison`, `EncapsulationExperience`, and `LayerMatchingExercise`, and excludes troubleshooting/interview material.

Replace the blanket public-file ban on `KnowledgeCheck` with an allowlist containing exactly the eight approved Module 1 instructional public files. Continue forbidding `InterviewScenario`, `WiresharkCheck`, and Pro copy in every public file.

- [ ] **Step 2: Run tests and confirm current gated/detailed content fails**

Run:

```powershell
pnpm vitest run src/content/computer-network-basics-content.test.ts src/content/lesson-access.content.test.ts src/features/lessons/lesson-content.repository.test.ts
```

Expected: FAIL because Router is too detailed, Addressing is absent, and OSI is account-only.

- [ ] **Step 3: Author the public lesson files and update registry imports**

Use the stable Router and OSI check IDs already present in `progress-manifests.ts`. Add exactly three Addressing checks with these outcomes:

```ts
[
  "02:1A:2B:3C:4D:5E is a MAC address written in hexadecimal.",
  "An I/G bit of 1 identifies a group address; a U/L bit of 1 identifies a locally administered address.",
  "MAC addresses support local-link delivery identity; IP addresses provide logical network addressing.",
]
```

Remove the Router and OSI `account` imports from their registry keys. Keep both account files preserved but unreferenced by Module 1 rendering. Do not delete them.

- [ ] **Step 4: Run the focused tests**

Run the Step 2 command.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/content/networking-foundations/routers-default-gateways-and-network-boundaries.public.mdx src/content/networking-foundations/physical-and-logical-addressing.public.mdx src/content/networking-foundations/osi-and-tcp-ip-models.public.mdx src/features/lessons/lesson-content.repository.ts src/features/lessons/lesson-content.repository.test.ts src/content/computer-network-basics-content.test.ts src/content/lesson-access.content.test.ts
git commit -m "feat: add introductory addressing and layered model lessons"
```

### Task 6: Add the Signed-In Final Module Quiz and Accurate Access Messaging

**Files:**
- Create: `src/content/networking-foundations/computer-network-basics-final-quiz.public.mdx`
- Create: `src/content/networking-foundations/computer-network-basics-final-quiz.account.mdx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `src/features/lessons/registration-boundary.tsx`
- Modify: `src/features/lessons/registration-boundary.test.tsx`
- Modify: `src/features/lessons/lesson-shell.tsx`
- Modify: `src/features/lessons/lesson-shell.test.tsx`
- Modify: `src/features/progress/my-learning.tsx`
- Modify: `src/features/progress/my-learning.test.tsx`
- Delete: `src/features/progress/lesson-progress-controls.tsx`
- Delete: `src/features/progress/lesson-progress-controls.test.tsx`
- Modify: `src/content/computer-network-basics-content.test.ts`

**Interfaces:**
- Consumes: existing `KnowledgeCheck` and optional lesson progress context.
- Produces: `<RegistrationBoundary returnTo string mode: "save-progress" | "unlock-content">`.
- Produces: quiz IDs `computer_network_basics_final_quiz_check_1` through `_8`.

- [ ] **Step 1: Write failing access and quiz tests**

Assert anonymous instructional lessons receive `mode="save-progress"` and display:

```text
Save your progress
Sign in to keep lesson completion and quiz results across devices. All lesson content remains free.
```

Assert the final quiz public introduction renders anonymously, while all eight checks render only for an account viewer. Assert the final quiz covers exactly:

```ts
[
  "network purpose and LAN/WAN recognition",
  "host recognition",
  "client/server roles",
  "hub/bridge/switch distinction",
  "router and default-gateway role",
  "MAC versus IP addressing",
  "U/L and I/G interpretation",
  "OSI to TCP/IP mapping and device placement",
]
```

Forbid DNS, ARP, subnet masks, binary AND, forwarding, routing-table, and packet-journey questions.

Render `MyLearning` with in-progress and completed lessons and assert no `Restart lesson`, `Confirm restart`, `Retry saving`, or manual-completion control exists. Keep the percentage, continue link, next label, and answer-review count visible.

- [ ] **Step 2: Run focused tests and confirm failures**

Run:

```powershell
pnpm vitest run src/features/lessons/registration-boundary.test.tsx src/features/lessons/lesson-shell.test.tsx src/features/progress/my-learning.test.tsx src/features/lessons/lesson-content.repository.test.ts src/content/computer-network-basics-content.test.ts src/content/lesson-rendering.test.tsx
```

Expected: FAIL because the mode prop and final quiz content do not exist.

- [ ] **Step 3: Implement access-aware copy and quiz content**

In `LessonShell`, derive:

```ts
const hasLockedSections = lesson.sections?.some(({ access }) => access !== "public") ?? false;
const boundaryMode = hasLockedSections ? "unlock-content" : "save-progress";
```

Use `unlock-content` copy that truthfully says “Sign in to take the remaining free assessment and save the result.” Avoid Wireshark/interview claims. The public quiz file contains only the assessment purpose and account requirement; the account file contains eight `KnowledgeCheck` components with the exact progress IDs.

Make `MyLearning` read-only by removing its `useState` state, `restartProgress` import, restart callback, confirmation controls, and error copy. Delete the unused `LessonProgressControls` component and its test so it cannot be accidentally reintroduced. Keep restart API/database support intact for backward compatibility; only the learner-facing controls are removed.

- [ ] **Step 4: Re-run focused tests**

Run the Step 2 command.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/content/networking-foundations/computer-network-basics-final-quiz.*.mdx src/features/lessons src/features/progress/my-learning.tsx src/features/progress/my-learning.test.tsx src/features/progress/lesson-progress-controls.tsx src/features/progress/lesson-progress-controls.test.tsx src/content/computer-network-basics-content.test.ts
git commit -m "feat: add computer network basics final quiz"
```

### Task 7: Register Quiz-Only Progress and Add the Transactional Migration

**Files:**
- Modify: `src/features/progress/progress-manifests.ts`
- Modify: `src/features/progress/progress-manifests.test.ts`
- Create: `supabase/migrations/202609200002_computer_network_basics_restructure.sql`
- Create: `supabase/tests/computer-network-basics-restructure.test.sql`

**Interfaces:**
- Consumes: stable MDX `progressItemId` values from Tasks 3–6 and the existing quiz-only `record_learner_progress_event` function.
- Produces: version-1 manifests for five new lesson IDs; reused lesson manifests keep version 1 and stable quiz IDs, with their new optional section rows mirrored in SQL.
- Produces: idempotent carry-forward from completed `lesson_hubs_bridges_and_switches` attempts to completed `lesson_hubs`, `lesson_bridges`, and `lesson_switches` attempts.

- [ ] **Step 1: Write failing TypeScript manifest tests**

Assert one manifest for every published lesson and the new required IDs:

```ts
expect(requiredIds("lesson_hubs")).toEqual(["hubs_check_1"]);
expect(requiredIds("lesson_bridges")).toEqual(["bridges_check_1"]);
expect(requiredIds("lesson_switches")).toEqual(["switches_check_1"]);
expect(requiredIds("lesson_physical_and_logical_addressing")).toEqual([
  "physical_and_logical_addressing_check_1",
  "physical_and_logical_addressing_check_2",
  "physical_and_logical_addressing_check_3",
]);
expect(requiredIds("lesson_computer_network_basics_final_quiz")).toEqual(
  Array.from({ length: 8 }, (_, index) => `computer_network_basics_final_quiz_check_${index + 1}`),
);
```

Update migration aggregation to include `202609200002_computer_network_basics_restructure.sql`. Treat `lesson_hubs_bridges_and_switches` as an explicit retired manifest allowed to remain in migration history but absent from the current published catalogue.

- [ ] **Step 2: Write failing pgTAP migration tests**

The SQL test must run the migration twice inside a rolled-back test transaction and assert:

```sql
select is((select required_item_count from public.lesson_progress_manifests
  where lesson_id = 'lesson_computer_network_basics_final_quiz' and content_version = 1), 8);
select is((select count(*)::integer from public.lesson_progress_items
  where lesson_id = 'lesson_hubs' and required), 1);
select is((select count(*)::integer from public.learner_lesson_attempts
  where user_id = :'completed_user' and lesson_id in ('lesson_hubs','lesson_bridges','lesson_switches') and status = 'completed'), 3);
select is((select count(*)::integer from public.learner_lesson_attempts
  where user_id = :'incomplete_user' and lesson_id in ('lesson_hubs','lesson_bridges','lesson_switches')), 0);
```

Also assert one current attempt per target lesson, one `lesson_completed` event carrying `completionRule: legacy-split-carry-forward-v1`, no deleted legacy rows, and identical row counts after the second run.

- [ ] **Step 3: Run focused tests and confirm missing manifests/migration fail**

Run:

```powershell
pnpm vitest run src/features/progress/progress-manifests.test.ts
npx supabase test db supabase/tests/computer-network-basics-restructure.test.sql
```

Expected: FAIL because the new manifest definitions and migration are absent.

- [ ] **Step 4: Implement manifest definitions and migration in foreign-key order**

The migration must be enclosed by `begin; ... commit;` and perform this order:

1. Upsert all five new `lesson_progress_manifests` rows and refresh the four reused manifest counts without changing content version 1.
2. Upsert the current section, optional interaction, and required knowledge-check rows for all nine Module 1 lessons. Leave retired optional rows untouched because historical events may reference them.
3. For each completed current legacy combined attempt, insert missing target attempts with `attempt_number = 1`, `status = 'completed'`, `completion_percent = 100`, target quiz ID in `completed_item_ids`, `next_item_id = null`, and the legacy completion timestamp.
4. Insert one correct `knowledge_check_attempted` event and one `lesson_completed` event per created target attempt only when an equivalent carry-forward event does not exist.
5. Never update or delete the legacy attempt or its events.

Use `on conflict ... do update` for manifests/items and `where not exists` plus the existing unique current-attempt index for attempts/events. Generate UUID idempotency keys only for newly inserted rows; reruns must first detect the metadata marker.

- [ ] **Step 5: Run migration and manifest tests**

Run the Step 3 commands.

Expected: PASS, including a second migration execution.

- [ ] **Step 6: Commit**

```powershell
git add src/features/progress/progress-manifests.ts src/features/progress/progress-manifests.test.ts supabase/migrations/202609200002_computer_network_basics_restructure.sql supabase/tests/computer-network-basics-restructure.test.sql
git commit -m "feat: preserve progress for split basics lessons"
```

### Task 8: Add Legacy Redirects, Canonicals, Sitemap Coverage, and Stable Adjacency

**Files:**
- Create: `src/features/catalog/lesson-aliases.ts`
- Create: `src/features/catalog/lesson-aliases.test.ts`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.tsx`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
- Modify: `src/app/sitemap.test.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`

**Interfaces:**
- Produces: `resolveLessonAlias(pathwaySlug: string, lessonSlug: string): string | undefined`.
- Consumes: Next.js `permanentRedirect` and current catalogue repository functions.

- [ ] **Step 1: Write failing alias and route tests**

```ts
expect(resolveLessonAlias("networking-foundations", "hubs-bridges-and-switches")).toBe("hubs");
expect(resolveLessonAlias("networking-foundations", "hosts-and-network-devices")).toBeUndefined();
expect(permanentRedirect).toHaveBeenCalledWith("/learn/networking-foundations/hubs");
```

Assert the sitemap contains all nine Module 1 canonical routes, excludes `/hubs-bridges-and-switches`, and still contains the four relocated lesson URLs. Assert previous/next adjacency follows the new Module 1 order and crosses into the first lesson of the current next module after the final quiz.

- [ ] **Step 2: Run focused tests and confirm redirect is missing**

Run:

```powershell
pnpm vitest run src/features/catalog/lesson-aliases.test.ts src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts src/app/sitemap.test.ts src/features/catalog/catalog.repository.test.ts
```

Expected: FAIL because the old URL still resolves as its own lesson or becomes a 404.

- [ ] **Step 3: Implement the pure alias map and redirect before lesson lookup**

```ts
const lessonAliases: Readonly<Record<string, string>> = {
  "networking-foundations/hubs-bridges-and-switches": "hubs",
};

export function resolveLessonAlias(pathwaySlug: string, lessonSlug: string) {
  return lessonAliases[`${pathwaySlug}/${lessonSlug}`];
}
```

In the page loader, call `permanentRedirect` before `findPublishedLesson`. Canonical metadata continues to derive from the destination lesson. Do not alias or redirect the four relocated lessons.

- [ ] **Step 4: Re-run focused tests**

Run the Step 2 command.

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/catalog/lesson-aliases.ts src/features/catalog/lesson-aliases.test.ts src/app/learn/[pathwaySlug]/[lessonSlug]/page.tsx src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts src/app/sitemap.test.ts src/features/catalog/catalog.repository.test.ts
git commit -m "feat: preserve legacy basics lesson routes"
```

### Task 9: Verify the Complete Module and Prepare the Pull Request

**Files:**
- Modify if verification exposes defects: only files already owned by Tasks 1–8.
- Create: `docs/releases/2026-09-20-computer-network-basics-restructure.md`

**Interfaces:**
- Consumes: the completed branch.
- Produces: verified local preview and a release checklist that keeps database rollout gated behind production backup confirmation.

- [ ] **Step 1: Run the complete automated verification serially**

```powershell
pnpm vitest run --pool=forks --maxWorkers=1
pnpm typecheck
pnpm lint
pnpm build
```

Expected: all commands exit 0. Record the exact serial Vitest command in the release note.

- [ ] **Step 2: Verify the local database migration from a clean state**

```powershell
npx supabase db reset
npx supabase migration list
npx supabase test db
```

Expected: local and remote-independent migration history ends with `202609200002`; all database tests pass. Do not run `supabase db push` against production during branch verification.

- [ ] **Step 3: Run the application and complete browser review**

```powershell
pnpm dev
```

Review desktop and narrow viewport in both themes:

- Module overview shows exactly nine numbered entries.
- Lessons 1–8 show `Free`; final quiz shows `Free account`.
- Anonymous users can read and answer each instructional lesson check.
- The final quiz asks for sign-in before its eight checks.
- Keyboard-only interaction reaches every control with a visible focus state.
- Each control is at least 44px high and remains readable in light theme.
- No restart, retry-saving, or manual-completion control is visible.
- The legacy combined URL redirects to `/learn/networking-foundations/hubs`.
- The four relocated URLs still render and remain in the sitemap.

- [ ] **Step 4: Write the release checklist**

Record:

```markdown
# Computer Network Basics release checklist

- [ ] Unit, type, lint, build, and local database tests passed
- [ ] Local dark/light and desktop/mobile review passed
- [ ] Vercel preview reviewed before merge
- [ ] Production Supabase backup verified after PR approval and before migration
- [ ] PR merged to main
- [ ] Production migration `202609200002_computer_network_basics_restructure.sql` applied
- [ ] Vercel production deployment is Ready
- [ ] Public lessons, account quiz completion, legacy redirect, and relocated URLs smoke-tested

Rollback rule: do not delete progress rows. If deployment must be rolled back, redeploy the previous application commit; leave additive manifests and carry-forward history intact.
```

- [ ] **Step 5: Inspect the branch diff and commit the release note**

```powershell
git diff --check
git status --short
git add docs/releases/2026-09-20-computer-network-basics-restructure.md
git commit -m "docs: add computer network basics release checklist"
```

Expected: `git diff --check` emits no output and the worktree is clean after the commit.

- [ ] **Step 6: Push and open the pull request only after user approval**

```powershell
git push -u origin feature/computer-network-basics-restructure
gh pr create --base main --head feature/computer-network-basics-restructure --title "Restructure Computer Network Basics for beginners" --body-file docs/releases/2026-09-20-computer-network-basics-restructure.md
```

Expected: GitHub returns a pull-request URL. Attach that PR to the Codex task, wait for checks, review the Vercel preview, and obtain explicit approval before merge. Do not apply the production migration until the backup gate is confirmed.

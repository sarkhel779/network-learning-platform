# Networking Foundations Catalog Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the live curriculum catalog and navigation with the approved six-module, 23-lesson Networking Foundations launch structure without publishing unfinished lessons.

**Architecture:** Keep the validated in-repository catalog as the single source of truth. Preserve the three existing published routes, reposition them in the approved sequence, add the remaining lessons as unpublished placeholders, remove security lessons from Networking Foundations, and let existing repository/navigation/sitemap consumers derive their behavior from the catalog.

**Tech Stack:** TypeScript 5.9, Zod 4, Next.js 15 App Router, React 19, Vitest 3, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-07-networking-foundations-launch-curriculum-design.md`

## Global Constraints

- Networking Foundations contains exactly six modules and 23 lessons in the approved order.
- Only the three already implemented lessons remain published; new placeholders remain `published: false`.
- The foundational portions of Lessons 1 and 2 are public; Lesson 3 onward requires an account when published.
- Every Pro section is named `Pro Deep Dive`, includes a non-empty preview, and uses the exact launch action `Join the Pro Member Waitlist` at the rendering layer.
- Firewall/security depth is absent from this pathway; the only firewall reference is the device/boundary introduction in Lesson 6.
- Preserve the stable slugs `how-networks-communicate`, `hosts-and-network-devices`, and `osi-and-tcp-ip-models`.
- Existing published lesson routes, MDX rendering, canonical metadata, and structured-data behavior must remain valid.
- No lesson content, authentication, progress persistence, payment, packet-capture asset, or new player is implemented by this plan.
- Do not add dependencies or upgrade existing packages.

---

## File Structure

- `src/features/catalog/catalog.data.ts` — authoritative six-module curriculum data and publication state.
- `src/features/catalog/catalog.repository.test.ts` — exact program order, count, stable-route, access, and security-boundary regression tests.
- `src/features/catalog/catalog.schema.test.ts` — existing catalog invariants; no schema change is expected.
- `src/features/lessons/curriculum-navigation.test.tsx` — generic navigation behavior; update only if assertions encode obsolete labels.
- `src/app/sitemap.test.ts` — proves newly planned lessons do not leak into the public sitemap.
- `tests/e2e/pathway.spec.ts` — browser proof that all six modules and planned lessons render as curriculum, while unfinished lessons remain non-links.

### Task 1: Lock the 23-Lesson Contract in Repository Tests

**Files:**
- Modify: `src/features/catalog/catalog.repository.test.ts`

**Interfaces:**
- Consumes: `getPathway(pathwaySlug: string): Pathway`, `listPublishedLessons(pathwaySlug: string): LessonSummary[]`, `getLesson(pathwaySlug: string, lessonSlug: string): LessonSummary`, and `getAdjacentLessons(pathwaySlug: string, lessonSlug: string)`.
- Produces: executable assertions defining exact module/lesson order and the stable published-route migration.

- [ ] **Step 1: Replace the obsolete 13-lesson and module-order assertions**

Use this exact expected structure in the repository test:

```ts
const approvedCurriculum = [
  {
    title: "Network and Device Essentials",
    lessons: [
      "What Is a Computer Network?",
      "Hosts, Clients, Servers and Network Interfaces",
      "Cables, Fibre, Wireless and Network Connections",
      "Hubs, Bridges and Switches",
      "Routers, Default Gateways and Network Boundaries",
      "Access Points, Modems, ONTs and Firewalls",
      "OSI and TCP/IP Models",
      "A Packet’s First Journey Through a Small Network",
    ],
  },
  {
    title: "Ethernet, Switching and Local Networks",
    lessons: [
      "Ethernet Frames and MAC Addresses",
      "How Switches Learn and Forward",
      "ARP and Local Delivery",
      "VLANs, Access Ports and Trunks",
    ],
  },
  {
    title: "IP Addressing and Routing",
    lessons: [
      "IPv4 Addressing",
      "Subnetting Fundamentals",
      "IPv6 Fundamentals",
      "Routing, Routing Tables and Default Routes",
      "ICMP, Ping and Path Discovery",
    ],
  },
  {
    title: "Transport and Application Services",
    lessons: [
      "TCP, UDP and Ports",
      "DHCP and Automatic Address Configuration",
      "DNS and Name Resolution",
      "HTTP, HTTPS, TLS and Essential Network Services",
    ],
  },
  {
    title: "NAT and Internet Communication",
    lessons: ["NAT, PAT and the Complete Internet Packet Journey"],
  },
  {
    title: "Packet Analysis and Troubleshooting",
    lessons: ["Systematic Network Troubleshooting Capstone"],
  },
] as const;

it("matches the approved launch curriculum", () => {
  const pathway = getPathway("networking-foundations");

  expect(pathway.modules.map(({ title, lessons }) => ({
    title,
    lessons: lessons.map((lesson) => lesson.title),
  }))).toEqual(approvedCurriculum);
  expect(pathway.modules.flatMap(({ lessons }) => lessons)).toHaveLength(23);
});
```

- [ ] **Step 2: Add migration and security-boundary assertions**

```ts
it("preserves implemented routes and removes security lessons", () => {
  const pathway = getPathway("networking-foundations");
  const lessons = pathway.modules.flatMap(({ lessons }) => lessons);

  expect(listPublishedLessons(pathway.slug).map(({ slug }) => slug).sort()).toEqual([
    "hosts-and-network-devices",
    "how-networks-communicate",
    "osi-and-tcp-ip-models",
  ]);
  expect(getLesson(pathway.slug, "how-networks-communicate").title)
    .toBe("What Is a Computer Network?");
  expect(getLesson(pathway.slug, "hosts-and-network-devices").title)
    .toBe("Hosts, Clients, Servers and Network Interfaces");
  expect(getLesson(pathway.slug, "osi-and-tcp-ip-models").title)
    .toBe("OSI and TCP/IP Models");
  expect(lessons.map(({ title }) => title).join(" ")).not.toMatch(
    /Firewall Fundamentals|Palo Alto|IPsec|VPN/i,
  );
});
```

- [ ] **Step 3: Add the approved access-order assertion**

```ts
it("keeps only the first two lesson foundations public", () => {
  const lessons = getPathway("networking-foundations").modules
    .flatMap(({ lessons: moduleLessons }) => moduleLessons);
  const [first, second, osi] = [lessons[0], lessons[1], lessons[6]];

  expect(first.sections?.some(({ access }) => access === "public")).toBe(true);
  expect(second.sections?.some(({ access }) => access === "public")).toBe(true);
  expect(osi.sections?.every(({ access }) => access !== "public")).toBe(true);
  for (const lesson of [first, second, osi]) {
    expect(lesson.sections?.at(-1)).toEqual(expect.objectContaining({
      id: "pro-deep-dive",
      label: "Pro Deep Dive",
      access: "pro",
      preview: expect.any(String),
    }));
  }
});
```

- [ ] **Step 4: Update adjacency assertions for the approved order**

```ts
it("derives adjacency across the approved curriculum", () => {
  expect(getAdjacentLessons("networking-foundations", "how-networks-communicate").previous)
    .toBeUndefined();
  expect(getAdjacentLessons("networking-foundations", "how-networks-communicate").next?.slug)
    .toBe("hosts-and-network-devices");
  expect(getAdjacentLessons("networking-foundations", "hosts-and-network-devices").next?.slug)
    .toBe("cables-fibre-wireless-and-network-connections");
  expect(getAdjacentLessons("networking-foundations", "osi-and-tcp-ip-models").previous?.slug)
    .toBe("access-points-modems-onts-and-firewalls");
  expect(getAdjacentLessons("networking-foundations", "systematic-network-troubleshooting-capstone").next)
    .toBeUndefined();
});
```

- [ ] **Step 5: Run the focused test and verify the contract fails**

Run:

```bash
pnpm vitest run src/features/catalog/catalog.repository.test.ts
```

Expected: FAIL because the catalog still contains 13 lessons, obsolete module names, security lessons, and the old ordering.

- [ ] **Step 6: Commit the failing contract**

```bash
git add src/features/catalog/catalog.repository.test.ts
git commit -m "test: define networking foundations launch catalog"
```

### Task 2: Replace the Catalog with the Approved Curriculum

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`

**Interfaces:**
- Consumes: `Pathway`, `LessonSummary`, and `pathwayCatalogSchema.parse(curriculum)`.
- Produces: the authoritative `pathways: Pathway[]` value containing six modules and 23 lessons.

- [ ] **Step 1: Add a focused helper for unpublished lesson records**

Place this private helper above `curriculum` so placeholder records stay complete without weakening the schema:

```ts
type PlannedLesson = Omit<LessonSummary, "published" | "sections">;

function plannedLesson(lesson: PlannedLesson): LessonSummary {
  return { ...lesson, published: false };
}
```

Update the type import:

```ts
import type { LessonSummary, Pathway } from "./catalog.types";
```

- [ ] **Step 2: Rebuild the module structure and add all unpublished placeholders**

Use the six module and 23 title arrays from Task 1 verbatim. Assign stable snake-case IDs and kebab-case slugs derived from each approved title. Use these exact special migrations:

```ts
const stablePublishedSlugs = {
  whatIsANetwork: "how-networks-communicate",
  hostsAndInterfaces: "hosts-and-network-devices",
  osiAndTcpIp: "osi-and-tcp-ip-models",
} as const;
```

Use these exact new slugs in curriculum order:

```ts
[
  "cables-fibre-wireless-and-network-connections",
  "hubs-bridges-and-switches",
  "routers-default-gateways-and-network-boundaries",
  "access-points-modems-onts-and-firewalls",
  "first-packet-journey-through-a-small-network",
  "ethernet-frames-and-mac-addresses",
  "how-switches-learn-and-forward",
  "arp-and-local-delivery",
  "vlans-access-ports-and-trunks",
  "ipv4-addressing",
  "subnetting-fundamentals",
  "ipv6-fundamentals",
  "routing-tables-and-default-routes",
  "icmp-ping-and-path-discovery",
  "tcp-udp-and-ports",
  "dhcp-and-automatic-address-configuration",
  "dns-and-name-resolution",
  "http-https-tls-and-essential-network-services",
  "nat-pat-and-the-complete-internet-packet-journey",
  "systematic-network-troubleshooting-capstone",
]
```

For every placeholder, copy its one-sentence outcome from the matching lesson in the approved spec into `objective`, write a learner-facing SEO title no longer than 60 characters, write a unique description between 80 and 160 characters, set `estimatedMinutes` between 15 and 25, and omit `sections` until that lesson’s content design fixes its heading IDs.

The exact module identifiers are:

```ts
[
  ["module_network_and_device_essentials", "network-and-device-essentials"],
  ["module_ethernet_switching_and_local_networks", "ethernet-switching-and-local-networks"],
  ["module_ip_addressing_and_routing", "ip-addressing-and-routing"],
  ["module_transport_and_application_services", "transport-and-application-services"],
  ["module_nat_and_internet_communication", "nat-and-internet-communication"],
  ["module_packet_analysis_and_troubleshooting", "packet-analysis-and-troubleshooting"],
] as const;
```

- [ ] **Step 3: Migrate the existing published records without changing their routes**

Keep their existing `id`, `slug`, `seo`, `estimatedMinutes`, and `published: true` unless an assertion below requires the approved title/objective. Make these content-alignment changes:

```ts
// Existing how-networks-communicate record
title: "What Is a Computer Network?",
objective: "Explain why networks exist and identify the ingredients required for communication.",

// Existing hosts-and-network-devices record
title: "Hosts, Clients, Servers and Network Interfaces",
objective: "Identify end hosts and interfaces and explain client and server roles.",
```

For `osi-and-tcp-ip-models`, change every pre-Pro section from `access: "public"` to `access: "account"`. Preserve its final Pro Deep Dive. Do not change the access of the first two records.

- [ ] **Step 4: Run catalog schema and repository tests**

Run:

```bash
pnpm vitest run src/features/catalog/catalog.schema.test.ts src/features/catalog/catalog.repository.test.ts
```

Expected: PASS with six modules, 23 lessons, three published routes, no security lesson, and no schema errors.

- [ ] **Step 5: Commit the catalog migration**

```bash
git add src/features/catalog/catalog.data.ts src/features/catalog/catalog.repository.test.ts
git commit -m "feat: align networking foundations launch catalog"
```

### Task 3: Protect Navigation and Search Boundaries

**Files:**
- Modify: `src/features/lessons/curriculum-navigation.test.tsx`
- Modify: `src/app/sitemap.test.ts`
- Modify: `tests/e2e/pathway.spec.ts`

**Interfaces:**
- Consumes: catalog-derived `CurriculumNavigation`, `sitemap()`, and the `/paths/networking-foundations` page.
- Produces: regression proof that planned lessons are visible but not navigable or searchable until published.

- [ ] **Step 1: Add a sitemap assertion for all 20 unfinished lessons**

Append this assertion to the existing sitemap test:

```ts
const unpublishedSlugs = listPathways()
  .flatMap(({ slug: pathwaySlug, modules }) =>
    modules.flatMap(({ lessons }) => lessons
      .filter(({ published }) => !published)
      .map(({ slug }) => `https://packetsecrets.com/learn/${pathwaySlug}/${slug}`)),
  );

for (const unpublishedUrl of unpublishedSlugs) {
  expect(urls).not.toContain(unpublishedUrl);
}
expect(unpublishedSlugs).toHaveLength(20);
```

- [ ] **Step 2: Update navigation fixture language without coupling it to the production catalog**

Keep the existing two-module fixture and generic behavior tests. Change its obsolete `advanced-networking`/security wording to:

```ts
slug: "packet-analysis-and-troubleshooting",
title: "Module two",
description: "Apply evidence to diagnose network faults.",
```

The component must continue to show published links as `Free`, unfinished lessons as `Coming later`, and no `Premium` label.

- [ ] **Step 3: Expand the pathway browser test**

Add assertions using the exact six module headings from Task 1 and representative first/final lesson text:

```ts
await expect(page.getByRole("heading", { name: "Network and Device Essentials" })).toBeVisible();
await expect(page.getByRole("heading", { name: "Packet Analysis and Troubleshooting" })).toBeVisible();
await expect(page.getByText("Systematic Network Troubleshooting Capstone")).toBeVisible();
await expect(page.getByRole("link", { name: /systematic network troubleshooting capstone/i }))
  .toHaveCount(0);
```

- [ ] **Step 4: Run the focused UI and sitemap tests**

Run:

```bash
pnpm vitest run src/features/lessons/curriculum-navigation.test.tsx src/app/sitemap.test.ts
```

Expected: PASS.

- [ ] **Step 5: Start the existing test server and run the pathway browser test**

Run in one terminal:

```bash
pnpm dev
```

Run in another terminal after `http://127.0.0.1:3000` responds:

```bash
pnpm exec playwright test tests/e2e/pathway.spec.ts
```

Expected: PASS on all configured projects with no unexpected console errors or horizontal overflow.

- [ ] **Step 6: Commit the boundary coverage**

```bash
git add src/features/lessons/curriculum-navigation.test.tsx src/app/sitemap.test.ts tests/e2e/pathway.spec.ts
git commit -m "test: protect planned curriculum boundaries"
```

### Task 4: Full Verification and Curriculum Handoff

**Files:**
- Modify only files required to fix failures caused by Tasks 1–3; do not refactor unrelated code.

**Interfaces:**
- Consumes: the completed catalog migration and all existing project checks.
- Produces: a verified catalog foundation ready for per-module design and implementation plans.

- [ ] **Step 1: Run the full unit suite**

```bash
pnpm test
```

Expected: all test files and tests pass.

- [ ] **Step 2: Run static verification**

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Expected: all three commands exit 0; the build generates only the three currently published lesson routes.

- [ ] **Step 3: Run the full browser suite**

With the test server available:

```bash
pnpm exec playwright test
```

Expected: every configured browser project passes. Treat timing-only failures as failures until a repeat isolates and explains them.

- [ ] **Step 4: Review the production pathway manually**

At desktop and 360px width, verify:

- six modules and 23 lessons appear in the approved order;
- the three existing published lessons remain links;
- 20 unfinished lessons show `Coming later` and are not links;
- the first two published lessons retain their public sections;
- OSI/TCP-IP account sections show the existing account boundary;
- no Firewall Fundamentals or vendor-security lesson appears; and
- no page-level horizontal overflow or hydration error occurs.

- [ ] **Step 5: Commit only if verification required scoped fixes**

```bash
git add src/features/catalog/catalog.data.ts \
  src/features/catalog/catalog.repository.test.ts \
  src/features/catalog/catalog.schema.test.ts \
  src/features/lessons/curriculum-navigation.test.tsx \
  src/app/sitemap.test.ts \
  tests/e2e/pathway.spec.ts
git commit -m "fix: preserve curriculum catalog regressions"
```

If no file changed, do not create an empty commit.

- [ ] **Step 6: Request review before merging**

Provide reviewers with:

- the approved curriculum specification;
- the exact six-module/23-lesson assertion;
- unit, typecheck, lint, build, and Playwright results; and
- confirmation that content implementation still proceeds module by module.

After this plan merges, begin a separate brainstorming/specification cycle for **Module 1 — Network and Device Essentials**. Do not begin Module 2 or account/dashboard work from this plan.

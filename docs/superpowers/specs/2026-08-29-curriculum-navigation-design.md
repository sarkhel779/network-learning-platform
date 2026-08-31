# Curriculum Navigation and Hydration Repair Design

**Date:** 2026-08-29
**Status:** Approved design, pending implementation plan
**Scope:** Phase 1 only: repair the current lesson hydration error and introduce scalable curriculum and lesson navigation. The `Hosts and Network Devices` lesson is Phase 2 and is not implemented by this specification.

## Purpose

The learning platform needs a clear course structure that helps beginners understand where they are, what comes next, and which content is available. The current catalog already models pathways, modules, and lessons, but all networking lessons are grouped into one module and the lesson page exposes only bottom Previous/Next navigation.

This change will make the catalog the authoritative source for a six-module networking curriculum, render that structure as responsive lesson navigation, and add optional in-page section navigation. It will also repair the invalid MDX markup currently causing a React hydration error on the published lesson.

## Goals

- Group the networking curriculum into six modules without imposing a fixed module limit.
- Show the entire learning path beside every lesson on desktop.
- Provide the same curriculum through an accessible `Course contents` control on mobile.
- Clearly distinguish the current lesson, published lessons, upcoming lessons, free lessons, and premium lessons.
- Preserve the existing bottom Previous/Next navigation across module boundaries.
- Provide optional `On this page` navigation for long lessons.
- Repair all known invalid MDX/SVG markup in `How Networks Communicate`.
- Add regression coverage for hydration and browser-console errors.
- Preserve static rendering and no-JavaScript lesson readability.

## Non-goals

- Learner accounts, completion tracking, percentages, bookmarks, or persisted progress.
- Publishing the `Hosts and Network Devices` lesson.
- Implementing firewall, Palo Alto, ARP, switching, routing, or other lesson content.
- Replacing the existing catalog with a CMS or database.
- Upgrading Next.js or unrelated dependencies.
- Making unpublished lessons navigable as if their content exists.

## Approved Curriculum

### 1. Networking Essentials

1. How Networks Communicate
2. Hosts and Network Devices
3. OSI and TCP/IP Models

### 2. Ethernet and Local Networks

1. ARP and MAC Learning
2. Switching and VLAN Basics

### 3. IP Addressing and Routing

1. IPv4 Addressing
2. Subnetting Fundamentals
3. Routing and Default Gateways

### 4. Transport and Network Services

1. TCP, UDP, and Ports
2. DNS, DHCP, HTTP, HTTPS, and TLS

### 5. Network Security Fundamentals

1. NAT Fundamentals
2. Firewall Fundamentals
3. Palo Alto Basics

### 6. Packet Analysis and Troubleshooting

1. End-to-End Packet Journey

Future troubleshooting lessons may be appended to the sixth module. Future modules may be added by inserting additional catalog data; navigation components must not encode a maximum module count or hard-code these module names.

## Catalog Model

The existing pathway catalog remains the single source of truth.

- The networking pathway will contain the six approved modules in the approved order.
- Existing lessons will be moved to their approved modules without changing their stable lesson IDs or slugs unless the approved curriculum explicitly splits one lesson.
- The existing combined `NAT and Basic Firewall Concepts` placeholder will be replaced by two distinct unpublished lesson records: `NAT Fundamentals` and `Firewall Fundamentals`.
- `Palo Alto Basics` will be added as an unpublished premium lesson record.
- Lesson ordering across the flattened pathway defines Previous/Next behavior.
- Catalog schemas will validate module IDs/slugs, lesson IDs/slugs, and optional section navigation entries.

Each lesson may declare an optional ordered `sections` list:

```ts
type LessonSection = {
  id: string;
  label: string;
};
```

Section IDs must be unique within the lesson. MDX headings referenced by this list must use matching IDs. Lessons without section metadata do not render `On this page` navigation.

## Lesson Page Architecture

The lesson page will obtain the current lesson and its complete pathway from the repository layer. It will pass structured navigation data to the lesson shell instead of making presentation components query or hard-code catalog data.

The desktop layout contains:

1. Full-path curriculum sidebar
2. Main lesson content
3. Optional compact `On this page` navigation when section metadata exists

The exact placement may collapse from three columns to two when space is limited, but lesson content remains the primary reading column.

### Curriculum navigation

`CurriculumNavigation` renders all pathway modules and lessons.

- Module headings are always visible and presented in catalog order.
- The current lesson uses `aria-current="page"` and a visually distinct state.
- Published lessons are links.
- Unpublished lessons are not links and display `Coming later`.
- Free and premium access labels are visible without implying that an unpublished premium lesson can be purchased or opened.
- Navigation derives labels, URLs, availability, and access from typed catalog data.

### Mobile course contents

At the mobile breakpoint, the persistent sidebar becomes an accessible `Course contents` disclosure/drawer using the same curriculum component and data.

- It must be operable with keyboard and screen readers.
- Opening it must not move focus unpredictably.
- Selecting a published lesson navigates normally.
- Unpublished items remain non-interactive.
- The control and content must work without horizontal page overflow.
- With JavaScript disabled, the curriculum remains readable and published links remain usable; an enhanced modal interaction is not required.

### On this page

`LessonSectionNavigation` renders only when the current lesson declares sections.

- Links target explicit heading IDs within the current MDX document.
- It is visually and semantically separate from curriculum navigation.
- It does not infer headings by scraping rendered HTML.
- Missing or duplicate section metadata fails schema or focused tests rather than silently creating broken links.

### Previous and Next

The existing bottom lesson navigation remains.

- It follows flattened catalog order across module boundaries.
- A published adjacent lesson is a link.
- An unpublished adjacent lesson remains visible as `Coming later` but is not a link.
- Regrouping lessons must not change the expected next lesson after `How Networks Communicate`: it remains `Hosts and Network Devices`.

## Hydration Repair

The current `How Networks Communicate` MDX produces invalid server HTML because MDX generates paragraph elements inside explicitly authored paragraph and SVG text contexts.

The repair will:

- Replace the outer screen-reader-only paragraph wrapper with a block container that may validly contain MDX-generated paragraph content.
- Ensure static SVG text nodes contain SVG-safe inline text rather than Markdown-generated HTML elements.
- Preserve the visible diagram, figcaption, accessible name, and complete text alternative.
- Make no dependency or Next.js-version change.

The rendered lesson must not produce:

- nested `<p>` warnings;
- invalid HTML/SVG descendant warnings;
- React hydration mismatch errors;
- the Next.js development error overlay.

## Responsive and Visual Behavior

- Desktop: persistent curriculum sidebar with the lesson content readable at normal widths.
- Tablet: navigation may compress while preserving a comfortable reading measure.
- Mobile: `Course contents` control replaces the persistent sidebar.
- No page-level horizontal overflow at the existing mobile test width.
- Focus indicators remain visible for every navigation link and disclosure control.
- Current, free, premium, published, and upcoming states must not rely on color alone.
- Reduced-motion preferences do not affect basic navigation usability.

## Error Handling and Fallbacks

- Catalog validation errors continue to fail through the existing catalog error path rather than rendering misleading navigation.
- A lesson with no `sections` metadata omits `On this page` cleanly.
- An unpublished lesson never becomes navigable because section metadata exists.
- Static lesson content and curriculum links remain useful if client hydration fails or JavaScript is unavailable.
- Navigation components contain no network calls or client-side data dependency.

## Testing Strategy

### Catalog and repository tests

- Assert the six module titles and their exact order.
- Assert every approved lesson appears in the correct module and order.
- Assert lesson IDs and slugs remain unique.
- Assert NAT, Firewall, and Palo Alto are separate lesson records.
- Assert the first published lesson and its adjacent lesson behavior.
- Assert optional section metadata validation, including duplicate IDs.

### Component tests

- Render full-path navigation from catalog-derived props.
- Verify current lesson, published link, unpublished state, free label, and premium label.
- Verify `aria-current="page"` and accessible module/navigation names.
- Verify mobile `Course contents` behavior and keyboard operation.
- Verify `On this page` links and the no-sections case.
- Verify Previous/Next behavior across module boundaries.

### Server and browser tests

- Server-render the current lesson and assert valid screen-reader/SVG structure.
- Load the published lesson in normal JavaScript mode and fail on page errors or relevant console errors/warnings.
- Assert the Next.js error overlay is absent.
- Verify curriculum navigation on desktop and mobile.
- Verify no-JavaScript lesson and curriculum readability.
- Verify no horizontal overflow at mobile width.
- Verify the current lesson and upcoming lesson states are visible and accurate.

## Delivery Sequence

1. Add failing hydration and navigation tests.
2. Repair invalid MDX/SVG markup and confirm the hydration regression is green.
3. Restructure and validate catalog data.
4. Add repository-derived navigation view data.
5. Implement desktop curriculum navigation.
6. Implement mobile `Course contents` navigation.
7. Implement optional `On this page` navigation.
8. Integrate the lesson shell and preserve Previous/Next behavior.
9. Run unit, type, lint, production build, no-JavaScript, and desktop/mobile browser verification.

## Phase Boundary

Phase 1 is complete only when the hydration error is absent, the full curriculum navigation is usable on desktop and mobile, all approved catalog groupings are present, and all verification passes.

The `Hosts and Network Devices` lesson begins afterward as a separate design/plan cycle. Its already approved product direction is retained: brief firewall introduction, Windows command checks, Wireshark checks, and a same-network versus different-network interactive comparison using the existing packet-flow controls.

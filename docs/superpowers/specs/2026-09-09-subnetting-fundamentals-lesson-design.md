# Subnetting Fundamentals Lesson Design

## Purpose

Build the next unpublished Networking Foundations lesson at
`/learn/networking-foundations/subnetting-fundamentals`. It follows IPv4 Addressing and teaches a
complete beginner to derive an IPv4 subnet's network boundary, broadcast address, usable host range
and capacity instead of memorizing disconnected shortcuts.

Authentication configuration is outside this lesson's scope and remains deferred.

## Product Decisions

- Use two focused interactive players: one for understanding prefix mathematics and one for applying
  it to practical subnet scenarios.
- Autoplay begins each selected journey, with Previous, Play/Pause, Next, Restart and speed controls.
- Keep the public introduction complete enough to teach the core method. Practical exercises,
  evidence inspection, troubleshooting and knowledge checks require an account.
- Account-gated contents entries display `Locked`; Pro entries display `Pro` and `Locked`.
- VLSM, route summarization, awkward-prefix drills and interview-speed calculations remain in the Pro
  preview.
- Existing authentication behavior and learning-tool drawers are not changed by this branch.

## Learning Outcome

After the public introduction, a learner can:

1. connect CIDR prefix length to subnet-mask bits;
2. separate network and host portions of an IPv4 address;
3. calculate block size and locate the containing subnet boundary;
4. derive network, first usable, last usable and broadcast addresses;
5. calculate total and traditionally usable address capacity for common prefixes;
6. decide whether two hosts are on the same subnet when given their addresses and masks;
7. explain the special endpoint treatment of `/31` and `/32` without applying the ordinary
   subtract-two rule blindly.

## Teaching Sequence

### Public introduction

1. **Why subnetting exists** — divide an address block into purposeful network boundaries; distinguish
   a subnet from a VLAN while acknowledging their common one-to-one design relationship.
2. **Prefix length and subnet mask** — connect `/n`, binary mask bits and dotted decimal. Reinforce
   that mask bits must be contiguous.
3. **Network and host portions** — apply the mask to an address and show which bits identify the
   subnet and which vary between addresses.
4. **Interactive Player 1: Reveal the boundary** — change an address and prefix, then watch the binary
   boundary, interesting octet, block size and calculated range update step by step.
5. **The repeatable calculation method** — find the interesting octet, calculate `256 - mask value`,
   locate the nearest lower multiple and derive the next boundary.
6. **Network, usable range and broadcast** — explain the meaning of each address before presenting a
   compact result card.
7. **Host capacity** — show total addresses as `2^host-bits`; explain the traditional subtract-two
   rule and its exceptions.
8. **Interactive Player 2: Solve the scenario** — work through practical `/24` to `/30` allocation and
   same-subnet questions with visible reasoning, feedback and replay.
9. **Special prefixes** — introduce `/31` point-to-point semantics and `/32` single-host routes so the
   public lesson does not teach an unsafe universal shortcut.
10. **Operational bridge** — preview how hosts use this calculation to decide between direct local
    delivery and a default gateway, linking back to earlier lessons.

### Account-locked continuation

- Read subnet evidence from Windows `ipconfig`/PowerShell and Linux `ip address`/`ip route` output.
- Complete progressively harder subnet calculations and address-allocation exercises.
- Diagnose wrong masks, overlapping ranges, invalid host addresses and mistaken same-subnet decisions.
- Attempt knowledge checks and review a concise method summary. An attempted answer counts as progress
  even when incorrect.

### Pro preview

- VLSM planning from requirements.
- Route summarization and identifying valid aggregate boundaries.
- Awkward prefixes that cross less familiar octet boundaries.
- Fast mental calculation and interview-style scenarios.
- Production addressing-plan review and overlap diagnosis.

The preview describes these benefits without exposing protected lesson content.

## Interactive Player 1: Binary Prefix and Boundary Visualizer

The player accepts curated beginner-safe IPv4 addresses and prefixes, with direct input available
only when validation can keep the demonstration deterministic. Its default scenario is
`192.0.2.130/26`.

Each autoplay journey shows:

1. the IPv4 address as four decimal octets;
2. the subnet mask in CIDR, dotted-decimal and binary forms;
3. the exact network/host bit boundary;
4. the interesting octet and block-size calculation;
5. the containing block's lower and next boundaries;
6. network, first usable, last usable, broadcast, total-address and usable-address results.

Bits, octets and the calculation currently being applied must be highlighted with both text and
visual styling. The packet inspector pattern is not reused here because this interaction explains
address mathematics rather than packet movement.

## Interactive Player 2: Practical Subnet Scenario Solver

The player offers curated scenarios covering `/24` through `/30`:

- determine the subnet containing one host;
- decide whether two hosts are on-link with the supplied prefix;
- choose a valid host address from distractors;
- choose the smallest suitable subnet for a stated host requirement;
- identify network or broadcast addresses that cannot be assigned as ordinary host addresses.

The learner chooses an answer before the journey unfolds. Feedback reveals the calculation in small
steps, explains why the selection is right or wrong, and always permits replay or moving to the next
scenario. Wrong attempts still mark the related progress item complete, while correctness remains
available as separate feedback rather than a completion gate.

The same-subnet scenario must calculate from each endpoint's configured prefix instead of comparing
only the first three octets. Scenarios use documentation ranges and do not imply classful addressing.

## Component Boundaries

- `SubnetBoundaryPlayer` owns binary/mask/boundary visualization and its curated scenarios.
- `SubnetScenarioPlayer` owns questions, answers, feedback and scenario progression.
- Pure subnet calculation and validation functions live in a focused domain module used by both
  players and directly tested with boundary cases.
- Shared autoplay and reduced-motion primitives may be reused, but packet-flow topology components
  are used only where they accurately represent the concept.
- Lesson content stays split into public and account MDX using the established lesson repository.
- Catalog, route, sitemap, adjacent navigation and progress manifest follow existing published lesson
  conventions.
- A new idempotent Supabase migration registers the lesson manifest and required progress items. It
  must not alter authentication providers, redirect URLs or existing learner data.

## Accuracy Rules

- Use CIDR reasoning; do not teach classful A/B/C defaults as a subnetting method.
- A subnet mask has contiguous one bits followed by contiguous zero bits.
- `2^host-bits - 2` is described as the traditional usable-host calculation, not a universal law.
- `/31` is explained as usable on point-to-point links under modern standards; `/32` identifies one
  address and has no ordinary host range.
- Network and broadcast results are derived from the supplied prefix, never from visual octet
  assumptions.
- Distinguish total addresses, traditionally usable host addresses and actual design capacity.
- Do not imply that sharing a VLAN guarantees sharing an IP subnet, or vice versa.
- Examples use IPv4 documentation ranges and avoid presenting public addresses as deployable learner
  lab allocations.

## Responsive and Accessible Behavior

- Both players fit the lesson column at desktop and 390-pixel mobile widths without page-level
  horizontal overflow.
- Binary groups may scroll within a clearly labelled local region when necessary; essential results
  remain visible without scrolling sideways.
- Scenario choices become full-width touch targets on narrow screens.
- Color is never the only distinction between network bits, host bits, correct answers and errors.
- Controls use semantic fieldsets, legends, buttons, status messages and meaningful focus order.
- Reduced-motion users receive manual step progression and no information loss.
- Public MDX remains understandable when JavaScript is unavailable.

## Testing and Acceptance

Automated tests must verify:

- subnet calculations for representative `/0`, octet-aligned, non-octet-aligned, `/30`, `/31` and
  `/32` boundaries;
- invalid address, prefix and non-contiguous mask rejection where applicable;
- both players' scenario changes, autoplay, manual controls and reduced-motion behavior;
- wrong scenario answers still produce progress while preserving correctness feedback;
- catalog publication, route generation, section ordering, sitemap and adjacent navigation;
- anonymous, account and Pro content boundaries;
- lesson progress manifest contents and idempotent migration behavior;
- responsive rendering and no-JavaScript public content;
- full unit suite, type-check, lint and production build.

Visual review must confirm that decimal octets, binary bits, prefix boundary, calculation labels,
answer feedback and result cards remain readable in light and dark themes at desktop and mobile
widths.

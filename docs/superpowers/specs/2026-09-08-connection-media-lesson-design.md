# Cables, Fibre, Wireless and Network Connections Lesson Design

**Date:** 2026-09-08  
**Status:** Approved
**Scope:** Publish the third Networking Foundations lesson with a guided visual comparison, a scenario-based connection-design lab, foundational troubleshooting, and explicit public, free-account, and Pro boundaries.

## Purpose

This lesson gives complete beginners and early-career IT professionals a practical way to choose and troubleshoot network connections. It explains what travels across copper, fibre, and wireless media; how distance, interference, speed, duplex, mobility, reliability, and cost affect a link; and why a technically possible connection may still be a poor design choice.

The lesson comes after `Hosts, Clients, Servers and Network Interfaces` and before `Hubs, Bridges and Switches`. It supplies the physical-link concepts those later device and forwarding lessons require without introducing switching logic, IP routing, or vendor configuration prematurely.

## Central Learning Outcome

Given a home, office, campus, or data-centre connection requirement, the learner can:

- compare copper, fibre, and wireless in plain language;
- identify the medium, connector, distance, bandwidth, duplex, interference, mobility, and link-state considerations that matter;
- choose a recommended medium and explain the trade-offs;
- distinguish bandwidth from actual throughput and latency;
- recognize common symptoms of damaged cabling, excessive distance, duplex mismatch, weak wireless signal, and radio interference; and
- identify the next evidence to inspect before replacing equipment or changing configuration.

## Goals

- Publish the existing `cables-fibre-wireless-and-network-connections` catalog entry without changing its slug, order, title, objective, or 20-minute foundational estimate.
- Explain electrical, optical, and radio transmission without requiring physics or telecommunications prerequisites.
- Provide an animated side-by-side medium comparison.
- Provide a guided connection-design lab with realistic requirements and immediate explanatory feedback.
- Support both a beginner path and an **I know this—proceed to advanced** path.
- Connect every recommendation to visible evidence and practical constraints.
- Preserve server rendering, keyboard operation, reduced-motion behavior, mobile usability, and meaningful no-JavaScript content.
- Enforce anonymous, free-account, and Pro waitlist boundaries at the server content-loading layer.

## Non-goals

- Ethernet frame fields, MAC-table learning, switching, VLANs, IP routing, or packet encapsulation.
- Cable termination training, electrical certification, fibre splicing, optical engineering, or wireless site-survey certification.
- Vendor-specific switch, access-point, transceiver, or controller configuration.
- Real hardware detection, spectrum scanning, speed testing, browser permissions, packet capture uploads, or external APIs.
- Purchasing advice tied to current products or prices.
- Unlocking paid Pro content or adding checkout; launch behavior remains **Join the Pro Member Waitlist**.

## Lesson Structure

1. **How a connection carries data** — bits represented by changing electrical, optical, or radio signals.
2. **Connection qualities** — bandwidth, throughput, latency, distance, reliability, mobility, interference, cost, speed, duplex, and link state.
3. **Copper Ethernet** — UTP and STP, common categories, RJ45, electromagnetic interference, and the standard 100-metre channel limit for common twisted-pair Ethernet.
4. **Fibre** — light transmission, single-mode and multimode, common connector/transceiver concepts, distance, bandwidth, and handling trade-offs.
5. **Wireless** — radio transmission, bands, channels, signal strength, interference, shared airtime, mobility, and environmental effects.
6. **Compare the media** — an animated, side-by-side visual summary.
7. **Design a connection** — the guided scenario lab.
8. **Diagnose link symptoms** — beginner-friendly evidence and corrective reasoning.
9. **Knowledge check and summary** — application questions and a compact comparison table.
10. **Pro Deep Dive preview** — advanced topics and the **Join the Pro Member Waitlist** action.

Catalog `sections` metadata provides matching `On this page` navigation. The curriculum sidebar, mobile course contents, and Previous/Next controls retain their existing structure.

## Teaching Boundaries and Terminology

The lesson explains behavior before introducing terminology. Each medium begins with a physical analogy, then corrects the analogy where it could mislead.

- **Bandwidth** is theoretical carrying capacity; **throughput** is the useful rate actually achieved.
- **Latency** is delay, not a synonym for low bandwidth.
- **Speed** labels represent negotiated link rates, not guaranteed application performance.
- **Full duplex** allows simultaneous transmission and reception; **half duplex** does not. Wireless remains a shared, contention-based medium and must not be described as switched full-duplex Ethernet.
- A lit link indicator proves some physical/link negotiation, not end-to-end connectivity.
- Fibre is not universally “better”; choice depends on distance, environment, capacity, compatibility, installation, and cost.
- Shielded cabling is not automatically preferable and requires an appropriate installation and grounding context.

Standards-derived numerical claims must identify their scope. The foundational lesson uses stable, broadly applicable limits and avoids exhaustive category, wavelength, transceiver, and Wi-Fi-generation tables.

## Guided Visual Comparison

The first interaction displays copper, fibre, and wireless as three synchronized panels. A learner can select a quality such as distance, bandwidth, interference, mobility, or cost and see each panel update its signal animation, concise explanation, and trade-off indicator.

The visual comparison is explanatory rather than a scoreboard. It must not imply that one medium always wins. Color supplements labels, icons, patterns, and text but never carries meaning alone.

The default state introduces electrical pulses, light pulses, and radio waves. Reduced-motion mode replaces travelling animations with discrete source, medium, and destination state changes. Without JavaScript, the server-rendered comparison table and explanations convey the same essential conclusions.

## Connection-Design Lab

### Scenario model

Each scenario defines a stable identifier and accessible title, locations, distance, minimum bandwidth, latency sensitivity, interference or environment, mobility, reliability, budget, compatible media, and an evaluation for every offered choice.

The initial scenario set covers:

1. A desktop connected to a nearby home router
2. A laptop used throughout a small office
3. A noisy workshop connection to a fixed workstation
4. Two buildings on a campus
5. A high-capacity data-centre interconnect
6. A temporary event or classroom network

The foundational flow exposes easy and intermediate scenarios to a signed-in free member. Advanced and ambiguous variants are represented only by a concise Pro preview at launch.

### Learner flow

The learner selects a scenario, reviews its visual requirement cards, and chooses copper, fibre, or wireless. The result is one of:

- **Recommended** — satisfies the important requirements with the best overall fit;
- **Workable with trade-offs** — can work, but the learner must understand the stated compromise; or
- **Unsuitable** — violates a decisive constraint or creates an unreasonable design.

Every result explains why, names the decisive requirements, and compares the selected choice with the recommended option. An unsuitable answer is a learning opportunity, not a score penalty. Changing scenarios resets the result and never retains an explanation from the previous scenario.

The lab must not depend on drag-and-drop. Radio controls or equivalent single-choice controls, explicit submission, and visible keyboard focus are required.

### “I know this” route

An **I know this—proceed to advanced** control appears after the essential comparison. It jumps to the account-only intermediate scenarios and troubleshooting section; it does not bypass authentication or unlock Pro material. The destination receives focus and a concise announcement so keyboard and screen-reader users understand the context change.

## Troubleshooting Experience

The lesson teaches an evidence-first loop: define symptom and scope; check power, connection, and link state; compare negotiated speed and duplex where applicable; inspect distance, cable condition, seating, signal strength, and interference; change one variable; retest and record evidence.

Foundational cases cover disconnected or damaged copper, excessive copper distance, speed or duplex mismatch, conceptually incompatible fibre components, weak Wi-Fi caused by distance or obstruction, and channel congestion or radio interference. The lesson separates symptoms from conclusions: low throughput alone does not prove a bad cable, and weak Wi-Fi does not identify the exact interference source.

## Access Model

### Public visitor

The anonymous response includes the beginner introduction and static/animated medium comparison. It provides enough value to understand the three media but excludes the full lab dataset, account scenarios, knowledge-check answers, and Pro content.

### Free member

A signed-in free member receives the complete foundational lesson, guided easy-to-intermediate lab, troubleshooting cases, knowledge check, summary, and saved-progress hooks when the account system is implemented.

### Pro member waitlist

At launch, advanced material remains unavailable. The lesson previews optical power-budget and transceiver reasoning, deeper wireless channel analysis, difficult design scenarios, advanced troubleshooting, standards-guided checks, and certification/interview preparation.

The only upgrade action is **Join the Pro Member Waitlist**. The interface must not imply that payment or immediate Pro access is available.

## Architecture and Data Boundaries

Lesson prose lives in dedicated public and account MDX modules registered through the existing lesson-content repository. Catalog metadata remains authoritative for publication, duration, SEO, navigation, and section access.

The interactive implementation uses focused units:

- a lesson-specific `ConnectionMediaExperience` composition component;
- a `ConnectionMediaComparison` visual explainer;
- a `ConnectionMediaLab` learner interaction;
- typed scenario and medium data in a separate module; and
- pure evaluation logic returning outcome, decisive requirements, explanation, and recommended alternative.

The evaluator contains teaching decisions but no React state. Components consume its typed result and never duplicate recommendation rules. Scenario validation occurs before rendering. Invalid scenario data produces a friendly static fallback and cannot silently substitute a different scenario.

No client bundle, anonymous HTML, or anonymous RSC payload may contain account scenario explanations, knowledge-check answers, or Pro-only copy. Public and account content are separate server-loaded modules; anonymous component props contain public data only.

## Static Rendering and Failure Behavior

- Essential explanations, the comparison table, troubleshooting workflow, and access preview server-render.
- Public visitors receive a meaningful comparison without JavaScript.
- Signed-in learners receive readable scenario summaries if hydration fails.
- A malformed medium or scenario identifier yields an explicit unavailable-state message and preserves surrounding content.
- Evaluation never guesses when required scenario data is absent.
- No external request, hardware permission, or learner-provided sensitive data is required.

## Accessibility and Responsive Requirements

- Every medium, requirement, outcome, and control has an unambiguous accessible name.
- The lab is fully operable with keyboard and pointer input.
- Results are announced once without excessive live-region updates.
- Focus moves intentionally when using **I know this—proceed to advanced**.
- Visual meaning uses text and shape in addition to color and motion.
- Reduced-motion behavior preserves every state and explanation.
- At 360px, panels stack, controls remain usable, text does not clip, and the document has no horizontal overflow.
- Touch targets and focus indicators follow existing site conventions.
- No-JavaScript rendering preserves the comparison and foundational troubleshooting guidance.

## Testing Strategy

### Catalog and content contracts

- Assert publication at the approved slug and position.
- Assert public, account, and Pro section metadata matches explicit MDX heading IDs.
- Assert Previous points to `hosts-and-network-devices` and Next identifies `hubs-bridges-and-switches` as planned.
- Render both MDX modules and reject invalid heading hierarchy or nested interactive markup.
- Assert anonymous loading excludes account and Pro modules and protected strings from HTML/RSC output.

### Scenario data and evaluator

- Validate stable scenario and medium identifiers and complete evaluations.
- Assert each choice returns exactly one approved outcome.
- Assert decisive constraints produce `unsuitable` and non-decisive compromises produce `workable-with-trade-offs`.
- Assert each scenario identifies a recommended choice and every explanation references actual requirements.
- Reject unknown identifiers and incomplete data without guessing.

### Component behavior

- Compare all three media across supported qualities.
- Select each scenario and verify clean reset behavior.
- Submit recommended, workable, and unsuitable choices and verify explanations.
- Operate all controls by keyboard.
- Verify result announcements, visible focus, reduced motion, and the advanced jump target.
- Verify invalid data renders the static fallback.

### Browser and regression coverage

- Open the lesson on desktop and 360px mobile without relevant console, hydration, or markup errors.
- Verify curriculum, `On this page`, Previous/Next, and direct-route behavior.
- Exercise representative scenarios and all three outcomes.
- Verify anonymous, signed-in free, and Pro-preview boundaries.
- Verify no-JavaScript content and no horizontal overflow.
- Re-run existing published lessons to detect catalog, navigation, and content-loader regressions.
- Run type checking, linting, the full unit suite, production build, and focused Playwright tests.

## Delivery Sequence

1. Add failing catalog, content-boundary, and navigation tests.
2. Add typed media/scenario schemas and failing evaluator tests.
3. Implement the minimum pure evaluator and validated scenario data.
4. Add public and account MDX structure with matching catalog sections.
5. Build the accessible visual comparison and static fallback.
6. Build the connection-design lab and explanatory outcomes.
7. Add the advanced jump, troubleshooting flow, knowledge check, and Pro waitlist preview.
8. Add responsive, reduced-motion, no-JavaScript, and browser coverage.
9. Complete full automated verification and desktop/mobile visual review.

## Acceptance Criteria

The lesson is ready when a complete beginner can compare copper, fibre, and wireless, choose a suitable medium for common scenarios, explain important trade-offs, and troubleshoot basic link symptoms using evidence. Experienced learners can skip the introductory comparison without bypassing access controls and can see an accurate preview of future Pro depth. The published route works on desktop and mobile, remains useful without JavaScript or animation, exposes no protected content anonymously, and passes the full project verification suite.

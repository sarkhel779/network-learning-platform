# Packetsecrets visual refresh: landing page and first lesson

## Goal and boundaries

Use the user-supplied dark networking reference as visual inspiration, not as a literal screenshot reproduction. Deliver a local preview in two reviewable stages: (1) the landing page and (2) the first published lesson, “What Is a Computer Network?” Preserve all current curriculum, authentication, account gates, packet data, and learning progress. Do not deploy to production until the user has reviewed the browser preview.

## Visual language

Use a dark navy canvas, crisp teal and blue accents, subtle grid and signal patterns, restrained glow, and clear modern typography. Packet motion should suggest a real route through labelled devices, not decorative movement disconnected from the lesson. Maintain sufficient contrast, visible keyboard focus, 44px minimum interactive targets, reduced-motion support, and responsive layouts. The image is a reference for hierarchy and atmosphere; avoid copying its exact art, text, or unsupported claims.

## Stage 1: landing page

Replace the current one-section hero with a concise page containing: a headline and two working calls to action; a topology illustration representing host → switch → router → destination; topic cards based only on published Networking Foundations material; a compact non-authenticated sample-lab teaser linked to the first lesson; a learning journey using real published lesson/module data; and a final invitation to begin the free path. Keep the existing global header/footer routes working. Do not add non-functional navigation, fabricated testimonials, community counts, or unavailable modules.

The topology is an accessible SVG/CSS illustration. It must remain intelligible when animation is disabled. On narrow screens, stack the hero copy and topology, keep labels legible, and avoid horizontal overflow. Homepage interactions are links; no new account data or APIs are required.

## Stage 2: first lesson player

Apply the approved look only to the first lesson’s existing `PacketFlowExperience` and its surrounding lesson presentation. The topology is the primary panel, followed by the current step narrative and packet inspector. Keep every scenario step, MAC/IP field, changed-field indicator, explanation, play/pause, previous/next, restart, speed, inspection depth, and progress behavior. The visuals may reorganize these controls and panels, but must not replace accurate packet information with a decorative animation. Do not restyle other players in this phase.

## Technical approach

Use existing Next.js components and CSS rather than introducing a UI framework. Isolate new homepage sections in focused components/data as needed. Scope first-lesson CSS to a dedicated class or variant so other lessons and players remain unchanged. Reuse the existing packet-flow scenario/schema and state machine; the redesign changes presentation, not networking logic. Preserve server rendering for static landing content and current client boundary for the player.

## Verification and release gate

Add or update tests for rendered content, working links, player controls, packet inspector content, and reduced-motion behavior. Run typecheck, lint, relevant tests, and production build. Inspect local desktop and mobile browser previews for layout, contrast, focus, and overflow. Show the landing page first and collect feedback before the first-lesson stage. No production deployment or broad site rollout is part of this spec.

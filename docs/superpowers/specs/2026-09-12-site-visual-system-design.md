# Packetsecrets visual system design

## Intent

Use the approved dark navy, white, cyan-blue, and teal visual direction throughout Packetsecrets. Preserve curriculum, access control, learning progress, and technical player data. Preview in the isolated branch before deployment.

## Landing page

- Route visualization uses distinct laptop, switch, router, internet cloud, and server vector icons connected by a subtle teal packet path. This is decorative and must not imply a real ping is being executed.
- Terminal text remains a visual example and is marked as such for accessibility.
- Core-topic cards have the eleven exact labels in the approved screenshot. Each links to an existing published lesson; TCP/IP and OSI link to their respective anchors within the shared model lesson. No unpublished content is promoted.
- The hero background slowly shifts between navy and deep teal, without flashing or moving the page geometry. Respect `prefers-reduced-motion: reduce`.

## Shared site treatment

- Dark navy is the default canvas; teal is the action and packet-flow accent. Existing explicit light preference remains supported, but the brand mark stays Packet in white and secrets in teal in the default/dark experience.
- Header, footer, page panels, buttons, links, forms, curriculum cards, and lesson shells use shared tokens instead of landing-only overrides.
- Players retain all packet fields, transport controls, progress state, and keyboard behavior. The first lesson player is a reference for the visual treatment; apply shared colors and surfaces to other lesson players without changing their internal logic.
- Maintain readable contrast, visible keyboard focus, responsive layouts, and reduced-motion alternatives.

## Verification

Use tests for the exact topic destinations and shared tokens, then typecheck, lint, full tests, production build (not while dev preview is running), and desktop/mobile browser inspection. No production deployment in this phase.

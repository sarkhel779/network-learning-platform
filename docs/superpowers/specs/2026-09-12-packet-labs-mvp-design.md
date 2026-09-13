# Packet Labs MVP design

## Goal and scope

Give beginners a genuine, usable place to experiment with one packet journey, inspect what changes at each hop, practice a prediction, and reach the existing lesson checks. This is the first Labs release, not an arbitrary network simulator or a replacement for the established lesson players.

## User experience

The homepage lab card uses the approved navy/teal visual language and opens `/labs`. The workspace has four meaningful views: Lab Topology, Packet Flow, Config, and Explanation. The sample experiment compares an on-link destination, a remote destination with a default gateway, and a remote destination without a gateway. Play/Next/Restart show the packet moving only over the hop that actually occurs. Packet Flow names the current Ethernet/IP endpoints and explains why forwarding succeeds or stops. Config can be changed and rerun. A short multiple-choice prediction gives immediate feedback. Keyboard controls and reduced-motion preference remain supported.

The Labs page also links to existing interactive lesson exercises and their quizzes, preserving lesson access and progress rules instead of duplicating them. It must not imply local sample-lab attempts are saved to a learner account.

## Navigation and boundaries

Add real Home, Courses, and Labs destinations to the header; keep Pricing and the theme toggle. Add Courses, Labs, About, Contact, Privacy, and Terms in the footer. Do not add Blog, Community, social, newsletter, or search controls until their destinations or data flows exist. Existing lesson and auth routes remain unchanged.

## Implementation boundaries

The lab scenario model is pure data and functions for testability. The interactive workspace is one client component, while `/labs` supplies server-rendered page copy and links. It reuses the existing device visual style and CSS tokens, not a new dependency or remote asset. Existing lesson check links point to actual published lesson anchors.

## Acceptance and verification

- Choosing each configuration changes the expected path and whether the packet reaches the destination.
- The active hop, packet fields, explanation, and visible result agree.
- Play/Next/Restart and quiz feedback work by keyboard and pointer.
- Reduced motion removes travel animation without removing information.
- Header and footer contain no dead destinations.
- Unit, type, lint, and browser checks pass. Changes stay on the feature branch until review.

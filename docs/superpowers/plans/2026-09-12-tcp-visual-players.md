# TCP Visual Players Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Teach TCP closing, sliding windows, and fast retransmit/SACK with three distinct animated diagrams.

**Architecture:** Keep existing authored TCP journeys and playback controls. Replace the connection player's middle-card view with a sequence timeline; specialize the window player to normal delivery; create a separate loss-recovery player from deterministic packet steps. Register the new player in MDX and progress.

**Tech Stack:** Next.js 15, React, TypeScript, MDX, CSS, Vitest, Testing Library, Supabase SQL migration.

**Spec:** `docs/superpowers/specs/2026-09-12-tcp-visual-players-design.md`

## Global Constraints

- Preserve existing TCP progress IDs; use a new item ID for the separate fast-retransmit player.
- `cwnd` is not the sender/receiver byte-window band.
- SACK block right edge is exclusive; cumulative ACK remains the first missing byte.
- Respect reduced motion and existing playback controls.

---

### Task 1: Connection sequence diagram

**Files:** `src/features/transport/tcp-connection-player.tsx`, `src/features/transport/tcp-connection-player.test.tsx`, `src/features/transport/tcp-sequence-diagram.tsx`, `src/app/globals.css`

**Interfaces:** Consumes `TcpJourneyStep[]` and active index; produces `TcpSequenceDiagram` for the connection player.

- [x] Add failing tests: graceful-close selects four ordered FIN/ACK arrows with correct direction; non-packet step has no “No packet crossing” card; active arrow contains an animated packet marker.
- [x] Run the focused test and observe expected failures.
- [x] Implement the accessible two-lane CSS timeline and replace the topology card. Add responsive and reduced-motion CSS.
- [x] Rerun the focused test to green.

### Task 2: Sliding-window-only diagram

**Files:** `src/features/transport/tcp-window-player.tsx`, `src/features/transport/tcp-window-player.test.tsx`, `src/features/transport/tcp-window-model.ts`, `src/app/globals.css`

**Interfaces:** `buildTcpWindowJourney("normal")` drives a three-category byte strip and packet track.

- [x] Add failing tests: only normal delivery appears, three byte-state categories render, and ACK moves the band and categories.
- [x] Run the focused test and observe expected failures.
- [x] Implement the normal-only player with grouped byte cells, window band, pointer labels, and animation.
- [x] Rerun the focused test to green.

### Task 3: Fast retransmit and SACK timeline

**Files:** `src/features/transport/tcp-fast-retransmit-player.tsx`, `src/features/transport/tcp-fast-retransmit-player.test.tsx`, `src/features/transport/tcp-window-model.ts`, `src/features/transport/tcp-window-model.test.ts`, `src/app/globals.css`

**Interfaces:** A deterministic `buildTcpWindowJourney("fast-retransmit")` includes three individually visible duplicate-ACK steps, changing right-exclusive SACK edges, retransmission, and final cumulative ACK.

- [x] Add failing model and UI tests for loss, three duplicate ACKs, SACK `[1201, 1501)`, retransmit, and gap-closing ACK.
- [x] Run focused tests and observe expected failures.
- [x] Implement the time-lane diagram, packet movement, controls, live narrative, and receiver SACK state.
- [x] Rerun focused tests to green.

### Task 4: Lesson and progress integration

**Files:** `src/content/networking-foundations/tcp-reliable-transport.public.mdx`, `src/features/catalog/catalog.data.ts`, `src/features/progress/progress-manifests.ts`, `mdx-components.tsx`, `supabase/migrations/202609120002_add_tcp_fast_retransmit_progress.sql`, matching content/catalog/progress/migration tests.

**Interfaces:** `<TcpFastRetransmitPlayer progressItemId="tcp_udp_and_ports_interactive_interactive_fast_retransmit" />` is registered by MDX and has its own catalogue anchor.

- [x] Add failing tests for the separate section, player registration, manifest item, and migration.
- [x] Run tests and observe expected failures.
- [x] Wire the player into lesson MDX, catalogue, progress manifest, and forward-only SQL migration.
- [x] Rerun focused tests; run full tests, lint, typecheck, build, and browser review of all three visuals.

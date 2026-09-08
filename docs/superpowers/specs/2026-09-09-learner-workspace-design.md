# Learner Workspace Design

**Status:** Approved specification
**Date:** 2026-09-09  
**Scope:** Signed-in learner toolbar, drawers, progress, notes, saved items, practice history, glossary, feedback, account access, and Pro discovery

## Purpose

Turn the vacant space beneath the existing **Course contents** control into a focused learner workspace. The workspace must make a free account genuinely useful without distracting from the lesson, reducing the lesson width, or exposing private learner data.

The workspace is not a general application navigation menu. Every tool must help the learner navigate, resume, record, practise, understand, or manage their learning.

## Audience and access boundary

### Signed-out visitor

- Sees only **Course contents**.
- Can read public lesson content and use public interactive players.
- Encounters the existing registration boundary when protected content begins.
- Does not see disabled placeholders for account-only workspace tools.

### Free-account learner

- Sees the complete learner workspace toolbar.
- Can retain progress, lesson position, notes, saved items, practice results, and preferences across sessions.
- Can inspect Pro previews and join the **Pro Member Waitlist** without being repeatedly interrupted.

### Pro member

- Uses the same workspace foundation.
- May later receive advanced labs, downloads, assessment analytics, RFC-guided material, advanced packet analysis, production scenarios, and interview preparation.

Entitlements must control content and capabilities; the user interface must not rely on hidden links as an access-control mechanism.

## Information architecture

The launch toolbar uses this order:

1. **Course contents**
2. **My learning**
3. **Notes**
4. **Bookmarks**
5. **Practice**
6. **Glossary**
7. Visual separator
8. **Feedback**
9. **Account**
10. **Pro**

To avoid redundant buttons:

- Learning history belongs inside **My learning**.
- Downloads belong inside **Bookmarks** until the resource library warrants a dedicated destination.
- **Save for later** is a contextual action that sends an item to **Bookmarks**; it is not another permanent drawer.
- Notifications use small status badges rather than a separate drawer.
- Only one drawer may be open at a time.

## Shared drawer shell

All tools use one reusable drawer shell with tool-specific content. The shell owns:

- open and close state;
- focus placement and focus return;
- Escape-key and backdrop closing;
- page-scroll behaviour;
- accessible title and description relationships;
- desktop slide-over and mobile bottom-sheet presentation;
- unsaved-change protection where required; and
- restoration of the learner's reading position.

Opening a drawer must overlay the lesson rather than permanently narrowing or shifting its content. Selecting the active toolbar button closes its drawer. Selecting a different button replaces the open drawer without briefly displaying both.

The active drawer remains local interface state and does not change the URL. Opening a tool must not replace the lesson route or discard its hash location. Shareable links continue to represent lesson locations, not transient workspace state.

## Tool specifications

### Course contents

Provides pathway navigation without leaving the lesson context. It shows:

- modules and lessons;
- the current lesson;
- completed, in-progress, and not-started states for signed-in learners;
- public, locked, and Pro labels;
- the existing **I know this—proceed to advanced** path;
- previous and next lesson navigation; and
- overall pathway completion for signed-in learners.

The existing course-contents behaviour remains available to signed-out visitors.

### My learning

Acts as the learner's compact dashboard. The launch version shows:

- overall pathway completion;
- completed, in-progress, needs-revision, and not-started lessons;
- a **Continue learning** action linked to the last stable lesson position;
- completed interactive activities;
- latest and best knowledge-check scores;
- topics marked for revision;
- recently viewed lessons;
- saved-item and note summaries; and
- learning history.

Progress is meaningful rather than page-view based. Opening a lesson alone must not complete it. Progress can derive from stable events such as:

- reaching defined lesson sections;
- completing an interactive activity;
- attempting or passing a required knowledge check;
- marking a topic for revision; and
- satisfying all requirements for lesson completion.

Launch lesson states are `not_started`, `in_progress`, `needs_revision`, and `completed`. Streaks, points, achievements, certificates, public rankings, and fine-grained skills scoring are deferred.

### Notes

Allows private notes without removing the learner from the lesson. A note may be linked to a lesson and optionally to a subsection or interactive activity.

Launch features:

- create, edit, and delete;
- automatic saving with visible saved/error state;
- current-lesson and all-notes views;
- search;
- simple tags and pinning;
- direct return to the originating lesson location; and
- explicit handling of stale locations after content changes.

Notes are private. Administrators must not read note bodies through routine analytics or the administrator dashboard. Any future support-assisted access requires an explicit learner-controlled sharing mechanism and audit trail.

### Bookmarks

Collects material the learner wants to revisit. Views are:

- **Continue later**;
- **Bookmarked references**;
- **Practice again**;
- **Completed saves**; and
- available or locked downloads.

A bookmark may target a lesson, subsection, diagram, interactive scenario or stage, knowledge-check question, or troubleshooting exercise. Each target uses stable content identifiers, not display text alone.

### Save for later

Appears contextually at the lesson level and, where useful, beside subsections, interactive players, knowledge checks, and troubleshooting exercises.

Flow:

1. The learner selects **Save for later**.
2. The client sends the stable target identifier and current lesson context.
3. The service creates or updates one idempotent saved item.
4. A short confirmation announces success.
5. The item appears under **Continue later** in Bookmarks.
6. Opening the item restores its lesson and best available location.
7. The learner can mark it complete or remove it.

The learner may attach a short private note. Repeated selection must not create duplicates.

### Practice

Summarizes learning evidence rather than showing only a percentage. It contains:

- knowledge-check attempts;
- latest and best scores;
- incorrectly answered concepts requiring review;
- interactive-player completion;
- guided-lab and troubleshooting-scenario results;
- items marked **Practice again**; and
- one evidence-based recommended next activity.

Recommendations should name the concept to revisit, such as trunk allowed-VLAN behaviour, and must be derived from existing learner activity rather than opaque profiling.

### Glossary

Explains terminology without navigating away from the lesson. It provides:

- search;
- acronym expansion;
- beginner explanation;
- technical definition;
- related terms;
- related lesson links; and
- recently viewed terms.

Lesson terms may open a specific glossary entry directly in the drawer.

### Feedback

Collects contextual beta and production feedback. Categories are:

- unclear explanation;
- possible technical inaccuracy;
- animation or interaction problem;
- incorrect knowledge-check answer;
- mobile or layout problem; and
- general suggestion.

Submissions may include lesson, subsection, player, current URL, application version, and coarse browser/device category. They must not automatically include note bodies, account secrets, full browsing history, or unrelated personal data. The user reviews the message before submission.

### Account

Provides access to:

- display name, email, and profile image;
- learning level and career objective;
- theme and learning preferences;
- email preferences;
- MFA and security settings;
- active sessions;
- privacy controls and data export; and
- sign out.

Supported self-described learning levels may include beginner, graduate, one-to-two years of IT experience, networking professional, and career switcher. These values may influence recommendations but must not hide required fundamentals or restrict access.

### Pro

Explains the future paid offering in a non-blocking drawer. It may show:

- a free-versus-Pro comparison;
- advanced lesson and lab previews;
- RFC-guided analysis;
- advanced Wireshark investigations;
- production troubleshooting scenarios;
- interview preparation; and
- **Join the Pro Member Waitlist**.

The Pro drawer never opens automatically during ordinary lesson reading.

## Responsive behaviour

### Desktop and wide tablet

- The toolbar remains fixed to the left edge in the currently unused region.
- Controls use compact labelled pills or icon-and-label buttons with tooltips where labels collapse.
- The active tool is visually and programmatically identifiable.
- Badges may show counts for notes, saved items, or concepts needing revision.
- The slide-over must not cause horizontal page overflow or permanently reduce lesson width.

### Narrow screens

- Replace the tall rail with one compact **Learning tools** control.
- Open a bottom sheet containing all tools.
- Use a larger sheet or full-screen treatment for content-heavy Notes and My learning views.
- Preserve large touch targets and the current lesson position.
- Keep Course contents first and visually prominent.

## Accessibility

- Every button has a visible or accessible name and an unambiguous selected state.
- Drawers use dialog or complementary-region semantics appropriate to their modality.
- Focus moves to the drawer heading on open and returns to the invoking control on close.
- Keyboard users can reach, open, operate, and close every tool.
- Escape closes the current drawer. Notes preserve any pending text as a recoverable local draft before closing instead of interrupting the learner with a routine confirmation.
- Status changes such as saved, removed, or failed are announced without stealing focus.
- Badges do not communicate meaning by colour alone.
- Motion follows the existing reduced-motion preference.
- Mobile and desktop controls meet minimum touch-target and contrast requirements.

## Data model boundaries

The implementation plan must define storage for these independently testable concepts:

- learner profile and preferences;
- pathway and lesson progress;
- subsection checkpoints;
- interactive-activity completion;
- knowledge-check attempts;
- revision markers;
- notes;
- bookmarks and saved items;
- recent-learning history;
- feedback submissions; and
- account security preferences.

Content targets require stable pathway, lesson, subsection, activity, and question identifiers. Display titles and hashes may change without invalidating stored learner data. When a target no longer exists, the interface falls back to the closest surviving lesson location and clearly labels the item as moved or unavailable.

Writes must be idempotent where repeated browser events are likely. Progress records should retain timestamps and enough provenance to explain why a lesson is in a particular state.

## Privacy and security

- Every learner record is scoped to the authenticated user through server-side authorization and database row-level policies where supported.
- Client-supplied user identifiers are never trusted for ownership.
- Notes are excluded from routine product analytics.
- Feedback collects only the context necessary to diagnose the reported issue.
- Account and MFA settings require recent authentication where appropriate.
- Destructive account actions require clear confirmation and an audit trail.
- Administrator analytics use aggregated learning events and must not expose private note content.
- Data export and deletion requirements are designed before production launch, even if the first interface is minimal.

## Loading, offline, and failure behaviour

- The lesson remains readable when a nonessential workspace request fails.
- Each drawer has its own loading, empty, error, and retry states.
- Optimistic saves are allowed only when rollback and failure messaging are clear.
- Notes must not silently lose text; local draft recovery may protect temporary unsaved content.
- Progress updates can be retried safely without double-counting.
- Signed-out or expired sessions prompt reauthentication while preserving the intended return location.
- A no-JavaScript visitor retains public lesson and Course contents access; account workspace tools may require JavaScript.

## Launch scope

The first account-enabled release includes:

1. the shared toolbar and drawer shell;
2. Course contents integration;
3. My learning with the six agreed core progress signals;
4. Notes;
5. Bookmarks and Save for later;
6. basic Practice history;
7. Glossary;
8. contextual Feedback;
9. Account access; and
10. the Pro Member Waitlist drawer.

The six initial progress signals are last visited position, lesson status, interactive-player completion, best and latest quiz scores, pathway completion percentage, and topics marked for revision.

Deferred features are certificates, streaks, points, achievements, public profiles, social sharing, community discussions, an AI tutor, advanced learner analytics, full note export, and offline lesson access.

## Implementation sequence

### Stage 1 — Identity and workspace foundation

- Implement authentication, user profiles, and authorization boundaries.
- Establish stable content identifiers and the learner-data schema.
- Build the shared responsive toolbar and drawer shell.

### Stage 2 — Progress

- Record stable progress events and derive lesson status.
- Restore the last learning position.
- Add interactive-player and knowledge-check tracking.
- Deliver My learning.

### Stage 3 — Personal learning tools

- Add Notes.
- Add Bookmarks, Save for later, and revision markers.
- Provide stale-target recovery.

### Stage 4 — Supporting tools

- Add Practice history and recommendations.
- Add Glossary and contextual Feedback.
- Connect Account and security settings.

### Stage 5 — Pro preparation

- Add the Pro drawer and waitlist action.
- Introduce entitlement-ready interfaces and locked-resource previews without implementing payment.

Each stage must be vertically usable and tested before the next stage begins. Account work should start only after the current launch curriculum reaches the previously agreed stability threshold.

## Acceptance criteria

The design is successfully implemented when:

1. Signed-out visitors see Course contents but no misleading account-tool placeholders.
2. Signed-in users can open every launch tool from the learner workspace without losing their lesson position.
3. Only one drawer is open at a time, and focus is correctly managed on open and close.
4. Progress survives a new session and never marks a lesson complete from a page view alone.
5. Continue learning restores a valid lesson and subsection or the nearest safe fallback.
6. Notes autosave visibly, remain private, and recover clearly from failures.
7. Save for later is idempotent and restores the exact available target.
8. Practice identifies specific concepts requiring revision.
9. The toolbar does not cause clipping, horizontal overflow, or reduced lesson readability at supported widths.
10. Mobile uses the Learning tools bottom sheet instead of a tall fixed rail.
11. Keyboard, screen-reader, reduced-motion, and touch interactions meet the accessibility requirements.
12. Authorization tests prove that one learner cannot read or mutate another learner's workspace data.
13. Feedback excludes private notes and unrelated personal data.
14. The Pro drawer remains discoverable but never interrupts ordinary reading automatically.

## Testing strategy

- Unit-test progress derivation, idempotency, ownership checks, saved-target resolution, and recommendation rules.
- Component-test every drawer's loading, empty, success, error, keyboard, focus-return, and responsive states.
- Integration-test authentication expiry, row-level authorization, cross-session persistence, and deletion/export boundaries.
- Browser-test signed-out, free-account, and Pro navigation at desktop and mobile widths.
- Add explicit cross-account isolation tests for notes, bookmarks, progress, and practice records.
- Preserve public lesson readability and Course contents behaviour without JavaScript.

## Product principle

The workspace should read as a coherent learning loop:

> Course contents helps the learner navigate; My learning tracks; Notes records; Bookmarks returns; Practice improves; Glossary explains; Feedback reports; Account manages; and Pro reveals optional advanced depth.

No tool should earn a permanent toolbar position unless it contributes directly to that loop.

# Learner Progress Design

## Status

Approved for implementation planning on 2026-09-09. This document defines Stage 2 of the learner workspace roadmap. Notes, bookmarks, Save for later, expert messaging, notifications, and Pro entitlements remain outside this stage.

## Goal

Give an authenticated learner trustworthy, cross-device progress tracking that records what they completed, restores where they stopped, and directs them to the next unfinished requirement without treating an incorrect answer as a failure to participate.

## Product principles

- Progress must describe meaningful learning actions, not passive page views or scroll depth.
- A lesson becomes complete automatically only after every required item in the current content version is complete.
- Reading sections require an explicit `Continue` action at the end of the section.
- A required interactive activity is complete only after the learner reaches its defined terminal step or outcome.
- A required knowledge check is complete after the learner submits an answer. Correctness is recorded separately and never blocks lesson completion.
- Restarting a lesson starts a new attempt and resets the visible current run without deleting prior attempts.
- The learner can always jump to the next incomplete item.
- The system must never display saved or completed state that the server did not accept.

## Scope

Stage 2 includes:

- stable progress identifiers and versioned progress manifests for published lessons;
- append-only progress events for meaningful learner actions;
- current lesson-attempt summaries for fast reads;
- section, interactive-player, and knowledge-check tracking;
- automatic lesson completion;
- exact last-position restoration;
- restart with retained history;
- next-incomplete navigation;
- a functional My learning drawer;
- desktop, mobile, keyboard, no-JavaScript, failure, and RLS coverage.

Stage 2 excludes:

- notes, bookmarks, Save for later, and revision markers, which belong to Stage 3;
- Practice recommendations, Glossary, Feedback, and Account settings, which belong to Stage 4A;
- Ask an Expert conversations, staff tooling, and notifications, which belong to Stage 4B;
- certificates, streaks, achievements, social features, AI tutoring, and advanced analytics;
- tracking for signed-out visitors.

## Progress vocabulary

### Content manifest

Each published lesson exposes a server-owned manifest containing:

- `pathwayId`
- `lessonId`
- `contentVersion`
- an ordered list of required progress items
- each item's stable `itemId`, `kind`, and anchor

Kinds are `section`, `interactive`, and `knowledge_check`. Display labels may change without changing identity. A semantic change that invalidates completion increments `contentVersion`.

### Lesson attempt

An attempt is one learner's current or historical run through one lesson version. It has `not_started`, `in_progress`, or `completed` status. Only one attempt per learner, lesson, and content version may be current.

### Progress event

A progress event is an immutable record of one accepted action:

- `section_completed`
- `interactive_completed`
- `knowledge_check_attempted`
- `position_updated`
- `lesson_completed`
- `lesson_restarted`

Each mutation carries a client-generated idempotency key. Repeating the same request must not create another event or advance progress twice.

### Current progress summary

The server maintains a compact summary per current attempt containing completed item IDs, percentage, status, next incomplete item, last position, timestamps, and the number of incorrect knowledge-check answers. The summary is derived from server-owned manifests and accepted events; the browser never submits an authoritative percentage or completion flag.

## Data model

### `learner_lesson_attempts`

- `id uuid primary key`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `pathway_id text not null`
- `lesson_id text not null`
- `content_version integer not null`
- `attempt_number integer not null`
- `status text not null check (status in ('not_started', 'in_progress', 'completed'))`
- `completed_item_ids text[] not null default '{}'`
- `next_item_id text`
- `last_item_id text`
- `last_anchor text`
- `completion_percent integer not null check (completion_percent between 0 and 100)`
- `incorrect_check_count integer not null default 0`
- `started_at timestamptz`
- `completed_at timestamptz`
- `updated_at timestamptz not null default now()`

Uniqueness and partial indexes enforce one current attempt per user, lesson, and version and one attempt number within that scope.

### `learner_progress_events`

- `id uuid primary key`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `attempt_id uuid not null references learner_lesson_attempts(id) on delete cascade`
- `idempotency_key uuid not null`
- `event_type text not null`
- `item_id text`
- `item_kind text`
- `anchor text`
- `answer_correct boolean`
- `metadata jsonb not null default '{}'`
- `created_at timestamptz not null default now()`

The unique key `(user_id, idempotency_key)` makes retries safe. Event metadata may contain non-secret interaction details but must not contain raw authentication data or unrestricted arbitrary objects.

## Authorization and server trust

- RLS is enabled on both tables.
- Authenticated learners may select only rows whose `user_id = auth.uid()`.
- Direct client inserts, updates, and deletes are not granted on progress tables.
- Mutations go through narrowly scoped server actions or database functions that derive `user_id` from the validated session.
- The server resolves the lesson manifest, validates the item and content version, appends the event, and updates the summary in one transaction.
- Lesson completion is derived only when every required manifest item exists in `completed_item_ids`.
- A client cannot mark an unknown item, skip a required item, alter correctness after submission, overwrite history, or claim another learner's attempt.
- Restart creates a new attempt transactionally and makes the earlier attempt historical. It never deletes events.

## Lesson-page experience

### Reading sections

Every required reading section receives a progress boundary and an end-of-section `Continue` button. Selecting it records completion, updates the visible progress indicator, and moves focus to the next incomplete item. Re-selecting it is harmless.

The button remains usable when the network is temporarily unavailable. The interface may optimistically retain the learner's position locally, but it displays a pending or retry state until the server confirms the action. Pending work does not count toward the authoritative completion percentage.

### Interactive activities

Each tracked player implements a small adapter with its stable item ID and a deterministic completion signal. Opening a player, pressing Play, or moving one step is insufficient. Completion occurs only at the activity's defined terminal state. Restarting playback does not restart the lesson attempt.

Existing players may use different internal state machines; adapters translate their terminal outcome into the shared progress contract without rewriting their educational behavior.

### Knowledge checks

Submitting any answer records `knowledge_check_attempted`. The event stores whether the submitted answer was correct. Both correct and incorrect submissions complete the requirement. Incorrect answers remain visible in My learning as review recommendations.

A later Ask an Expert action will receive the pathway, lesson, attempt, question, and selected-answer identifiers from this record. Stage 2 stores stable context but does not expose a non-functional chat button.

### Progress controls

The lesson displays:

- completed requirements out of total;
- a percentage derived from those counts;
- `Go to next incomplete item` while work remains;
- `Lesson complete` when all requirements are confirmed;
- `Restart lesson` for an in-progress or completed attempt.

Restart requires an explicit confirmation explaining that the current display returns to zero while previous attempts remain in history. After restart, focus moves to the first required item.

### Resume behavior

For an authenticated learner, the server loads the current attempt with the lesson. `Resume where you left off` targets the stored stable anchor. If the anchor no longer exists in the current manifest, the system selects the first incomplete item. It never redirects automatically on initial page load, so the learner retains control and accessibility focus is not stolen.

## My learning drawer

The existing placeholder becomes a real server-backed view with:

- pathway completion based on the current version of published lessons;
- one `Continue learning` card using the most recently updated in-progress lesson;
- Not started, In progress, and Completed lesson groups;
- per-lesson percentage, completed/total count, last activity time, and next incomplete label;
- review indicators for knowledge checks answered incorrectly;
- links to resume or review a lesson;
- restart controls with confirmation.

The drawer keeps the existing accessible responsive shell. Empty state copy explains that progress begins after the learner selects Continue, completes an activity, or answers a check. It must not imply that merely viewing a page was recorded.

## Content revisions

- Cosmetic text changes keep the existing `contentVersion` and stable item IDs.
- Adding, removing, reordering, or materially changing a required item increments `contentVersion`.
- Historical attempts retain their original version and remain queryable.
- A learner opening a new version receives a new current attempt seeded only with completions that are explicitly declared compatible by stable item ID.
- If compatibility is not declared, the new version begins incomplete; the prior completed attempt remains visible as history.
- Stage 3 will add learner-facing revision markers and stale-target recovery for notes and bookmarks.

## Failure and offline-adjacent behavior

- Progress mutations expose idle, saving, saved, and retry states.
- The browser stores only a short-lived pending mutation queue and last position, not an authoritative progress database.
- Pending events preserve their idempotency keys across retries.
- When connectivity returns, mutations replay in creation order and refresh the server summary.
- A rejected event is removed from the optimistic display, explained in plain language, and offered for retry when appropriate.
- If Supabase is unavailable, lesson content remains readable and interactive for content purposes; progress UI clearly states that progress has not yet synced.
- No-JavaScript rendering retains the lesson content and navigation. Account progress controls may require JavaScript but must not hide the public learning material.

## Accessibility

- Progress is conveyed with text as well as visual indicators.
- Save-state changes use a polite live region without announcing every scroll or playback step.
- Continue, next-incomplete, resume, and restart controls are keyboard reachable and have stable accessible names.
- Focus moves only after an explicit learner action.
- Drawer grouping and status labels remain understandable at 360-pixel width and at 200% zoom.
- Reduced-motion preferences disable progress-transition animation.

## Testing strategy

### Database and authorization

- own-row select access and cross-account isolation;
- denial of direct table mutation;
- idempotent event submission;
- unknown item and stale-version rejection;
- transactional summary updates;
- completion only after all required items;
- restart history retention and current-attempt uniqueness.

### Unit and component

- manifest validation and version rules;
- next-incomplete derivation;
- section Continue behavior;
- interactive adapter terminal-state behavior;
- incorrect and correct knowledge-check attempts;
- optimistic pending, confirmed, rejected, and retry states;
- My learning grouping and empty states;
- restart confirmation and focus management.

### End-to-end

- a signed-in learner progresses through representative desktop and mobile lessons;
- an incorrect answer completes its requirement but appears for review;
- refresh and cross-page navigation restore exact position;
- completing all required items automatically completes the lesson;
- restarting resets the current run and preserves previous history;
- next-incomplete navigation selects the correct stable anchor;
- duplicate submission does not duplicate progress;
- simulated save failure never falsely reports completion;
- anonymous users receive no progress tracking UI;
- keyboard, reduced-motion, narrow-screen, and no-horizontal-overflow behavior.

## Rollout

1. Add migrations, RLS policies, database functions, and database tests.
2. Add manifest types and annotate one representative lesson of each interaction pattern.
3. Add the progress service and mutation states.
4. Add section, interactive, and knowledge-check adapters.
5. Add lesson progress controls and restoration.
6. Replace the My learning placeholder.
7. Annotate all currently published lessons and run the full regression suite.

No progress feature ships for a lesson until its complete manifest is validated. This avoids partially tracked lessons that can never reach completion.

## Acceptance criteria

Stage 2 is complete when an authenticated learner can begin any published lesson, explicitly complete all required reading and activities, attempt every required check regardless of correctness, resume on another session, jump to the next incomplete item, finish automatically, restart without losing history, and review pathway progress in My learning. Every mutation is server-validated, retry-safe, protected by RLS, and covered by representative desktop and mobile journeys.

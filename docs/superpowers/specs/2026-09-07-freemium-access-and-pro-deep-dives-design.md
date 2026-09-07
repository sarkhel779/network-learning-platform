# Packetsecrets Freemium Access and Pro Deep Dives Design

**Date:** 2026-09-07  
**Status:** Draft for user review  
**Applies to:** Existing Packetsecrets learning platform

## 1. Purpose

Packetsecrets will launch as a search-first learning platform instead of placing the whole curriculum behind a paid subscription from day one. Visitors must be able to discover an individual topic through a search engine, open its permanent lesson URL, understand the core concept, and experience the interactive-player USP before being asked to create an account.

The business model has three access states on the same lesson URL:

1. Public visitor: indexable lesson introduction and meaningful interactive-player experience.
2. Free account: complete vendor-neutral foundational lesson, basic practice, and saved learning state.
3. Packetsecrets Pro: one attached Pro Deep Dive that combines relevant IETF RFC analysis, relevant vendor checks, and advanced practice.

Pricing, payments, and complete vendor-specific academies are explicitly outside this design. Pro initially exists as a free waitlist and locked entitlement preview; paid activation is a later approved project.

## 2. Design principles

- Preserve the current Packetsecrets branding, typography, topology symbols, light/dark themes, navigation, responsive behavior, and lesson visual language.
- Demonstrate value before asking for registration.
- Keep one stable, canonical URL for each lesson across all access states.
- Keep foundational networking vendor-neutral.
- Treat the interactive player as the primary acquisition and differentiation surface.
- Enforce access on the server. Hiding delivered content with CSS or client-side JavaScript is not authorization.
- Do not ship premium lesson bodies, command lists, answer banks, or advanced scenario data to unauthorized browsers.
- Keep registration passwordless and low-friction.
- Add premium depth without making the free foundational explanation misleading or incomplete.

## 3. Curriculum boundaries

### 3.1 Networking Foundations

The existing Networking Foundations learning path remains vendor-neutral and contains:

1. Networking Essentials
2. Ethernet and Local Networks
3. IP Addressing and Routing
4. Transport and Network Services
5. Network Security Fundamentals
6. Packet Analysis and Troubleshooting

Palo Alto Basics is removed from this foundational path. Cisco, Fortinet, Palo Alto, and other vendor curricula will be designed separately later.

### 3.2 Lesson-attached Pro Deep Dive

Each relevant foundational lesson may contain one Pro Deep Dive. It is a single premium section, not separate RFC and vendor subscriptions. When appropriate, it contains:

- an IETF RFC check for the current concept;
- relevant read-only vendor verification or diagnostic commands;
- an explanation of what each command checks;
- small representative output examples;
- platform and software-version qualifications;
- advanced interactive scenarios or troubleshooting extensions.

The section includes only vendors that meaningfully illuminate the lesson. It must not add vendor cards merely for visual symmetry.

Basic vendor checks may use read-only commands such as `show`, `get`, or equivalent diagnostic operations. Configuration-changing commands, complete configuration workflows, GUI walkthroughs, certification preparation, and full labs are excluded. Those belong to future vendor-specific course designs.

All RFC statements and vendor commands must be verified against authoritative IETF or vendor documentation before publication.

## 4. Lesson access boundary

Every published lesson follows this order.

### 4.1 Public and indexable portion

An anonymous visitor receives:

- lesson title, description, learning objective, duration, and access labels;
- a substantial introduction and core definitions;
- key explanatory text and essential diagrams;
- an accurate static summary of the player scenario;
- a meaningful interactive-player experience with standard playback controls;
- public lesson headings represented in the initial server-rendered HTML.

The public player is functional, not a disabled teaser. It demonstrates the learning experience sufficiently for a visitor to understand Packetsecrets' value.

### 4.2 Registration boundary

The registration prompt appears after the interactive player. It does not cover or interrupt the player. Its message explains the concrete free benefits:

> Continue this lesson for free. Create a Packetsecrets account to unlock the remaining explanation, Wireshark checks, quizzes, interview answers, and saved progress. No payment required.

The prompt offers:

- Continue with Google
- Continue with email
- Sign in for returning learners

### 4.3 Free-account portion

A free account unlocks:

- the remainder of every published foundational lesson;
- basic Wireshark checks;
- foundational quizzes and knowledge checks;
- interview scenarios and answers;
- lesson completion state;
- bookmarks and continued-learning state.

### 4.4 Pro portion

The lesson outline displays a locked **Pro Deep Dive** entry with a short benefit description. Before paid Pro exists, its action is **Join the Founding Pro waitlist**. After Pro is activated, a valid Pro entitlement unlocks the combined RFC, vendor-check, and advanced-practice content in place without changing the lesson URL.

The anonymous or free-account response may include the Pro section's title, access label, and marketing summary. It must not contain the protected body or protected data.

## 5. Search and discovery architecture

“Redirect from Google” means that each search result deep-links to the corresponding lesson. Packetsecrets does not force search visitors through the home page.

Every lesson must provide:

- one permanent descriptive URL;
- unique page title and meta description;
- canonical URL metadata;
- indexable public text in server-rendered HTML;
- internal links from the learning path and related lessons;
- inclusion in the XML sitemap when published;
- accurate course or learning-resource structured data;
- accurate `isAccessibleForFree` and `hasPart` markup for gated sections where supported;
- no cloaking or delivery of materially different public content to crawlers and ordinary anonymous visitors.

Public lesson text explains every essential visual. Search discovery must not depend exclusively on canvas, SVG, animation, or client-side state.

## 6. Identity and authentication

Packetsecrets launches with two passwordless methods:

1. **Google sign-in** through OAuth/OpenID Connect.
2. **Email magic links** delivered through a transactional email provider.

Traditional passwords, password storage, password reset, and security questions are not implemented.

### 6.1 Account linking

Email address is the stable account identity. When Google supplies a verified address matching an existing magic-link account, the authentication layer links the provider to the existing user after applying its verified-email safeguards. It must not create two progress profiles for the same verified email.

### 6.2 Magic-link behavior

- Links are single-use and expire after 15 minutes.
- Request responses do not disclose whether an email already has an account.
- Repeated requests are rate-limited by address and client risk signals.
- Successful use invalidates the token.
- Redirect targets are allow-listed internal paths to prevent open redirects.

### 6.3 Session behavior

- Sessions use secure, HTTP-only, same-site cookies in production.
- Server-side authorization revalidates the session and entitlement for protected content requests.
- Sign-out invalidates the current session.
- Account pages show connected sign-in methods without exposing provider tokens.

### 6.4 Initial account data

Store only the data needed for the approved experience:

- internal user identifier;
- verified email address;
- optional display name and avatar supplied by Google;
- connected authentication providers;
- role and entitlement state;
- lesson progress and bookmarks;
- waitlist state and consent timestamp;
- account creation and update timestamps.

## 7. Authorization and content delivery

The lesson route resolves the session and produces one of three server-authorized views: anonymous, free account, or Pro.

Content is divided into explicit access blocks:

- `public`
- `account`
- `pro`

The server loads and renders only blocks permitted for the current access state. Client components receive only the scenario data required for the authorized experience.

Entitlement checks are centralized in a server-only policy module. Individual UI components display the result; they do not decide access independently. Direct requests for protected content must return an authorization-safe response even if the requester bypasses the lesson UI.

The lesson remains useful without JavaScript: public text and registration messaging are server-rendered, and an accessible static player overview remains available. Interactive playback enhances this content when JavaScript runs.

## 8. User-interface additions

The current site design remains intact. New elements reuse existing design tokens, spacing, typography, cards, borders, focus states, and light/dark variables.

Add:

- header actions for **Sign in** and the authenticated account menu;
- a registration card after the player;
- access labels for Public, Free account, and Pro Deep Dive;
- locked entries in lesson and “On this page” navigation that remain clearly non-clickable or open an explanatory access panel;
- an in-place Pro Deep Dive preview card;
- free-account progress and bookmark controls;
- a Founding Pro waitlist action;
- accessible authentication success, expiry, retry, and error states.

Locked styling must not masquerade as disabled foundational content. It must state what access is required and what benefit becomes available.

## 9. Founding Pro waitlist

Before payment launches, free-account users can join the Founding Pro waitlist from a Pro Deep Dive preview.

The waitlist stores:

- user identifier;
- email address already associated with the account;
- consent timestamp;
- optional source lesson slug;
- current waitlist status.

Joining the waitlist does not create a paid entitlement, charge a user, or promise a launch date or price. Notification consent and unsubscribe behavior must be explicit.

## 10. Analytics and success measures

Use aggregated, privacy-conscious first-party events:

- lesson impression from search or referral;
- public player started;
- public player completed;
- registration boundary viewed;
- authentication started by method;
- free account completed;
- lesson completed;
- return learning visit;
- Pro Deep Dive preview viewed;
- Founding Pro waitlist joined.

Events must not contain lesson answers, premium payloads, authentication tokens, raw magic links, vendor command output submitted by learners, or unnecessary personal data.

Success gates before activating paid Pro:

- a useful body of foundational lessons is published;
- visitors repeatedly start and complete players;
- free-account learners return and complete lessons;
- the waitlist demonstrates demand for deep dives;
- payment, cancellation, entitlement recovery, support, and privacy flows have a separately approved design and are operational.

## 11. Defensibility and content protection

Packetsecrets cannot prevent another company from independently creating packet animations. The design reduces direct copying and builds a stronger business moat:

- premium scenario data, answer banks, RFC analysis, vendor checks, and entitlement logic remain server-side;
- content and authentication endpoints use rate limits and abuse detection;
- abnormal sequential extraction and bulk access are logged and throttled;
- responses contain only the authorized lesson block;
- shared or exported visuals carry Packetsecrets branding and identifiable scenario metadata;
- dated Git history, design specifications, source records, and publication records establish authorship history;
- contractor agreements include confidentiality, invention assignment, and IP ownership terms;
- valuable code, text, and visual releases may be registered where justified;
- suspected copying is documented with timestamps and preserved evidence before takedown or legal escalation.

The durable moat is the validated scenario library, instructional quality, RFC-to-practice interpretation, trustworthy vendor checks, learner progress, recognizable brand, and faster improvement based on learner behavior.

## 12. Error handling and abuse cases

- Expired or used magic link: show a neutral explanation and allow a new request.
- OAuth cancellation or failure: return to the original lesson with a retry choice.
- Authentication succeeds but entitlement loading fails: show free-account content only and a retryable status; never optimistically reveal Pro content.
- Session expires while reading: preserve the current URL and offer sign-in; do not discard locally safe reading position.
- Waitlist duplicate: treat the operation as idempotent and show the existing joined state.
- Email delivery delay: show the destination address in masked form and provide a rate-limited resend.
- Bot-like registration or content access: throttle or challenge without blocking verified search-engine crawling of public content.
- Unknown content access value: fail closed to `public`.

## 13. Accessibility and responsive requirements

- Registration and authentication are keyboard-operable and screen-reader named.
- Focus returns to a logical point after sign-in or an authentication error.
- Access status is conveyed in text, not color or lock icons alone.
- Locked entries do not create keyboard traps.
- Magic-link status messages use appropriate polite announcements.
- Google sign-in and email actions meet contrast and touch-target requirements.
- All new cards work in light, dark, and system themes without horizontal overflow at 360 px.
- Reduced-motion preferences continue to govern interactive-player transitions.

## 14. Testing requirements

### 14.1 Unit and integration

- access-block schema validation;
- centralized access policy for anonymous, free, and Pro states;
- no protected block returned for insufficient access;
- provider account linking and duplicate-email safeguards;
- magic-link expiry, single use, rate limiting, and safe redirects;
- session expiry and entitlement-failure behavior;
- waitlist idempotency;
- analytics payload allow-listing;
- navigation and access-label rendering;
- current player, hydration, reduced-motion, and lesson tests remain green.

### 14.2 End-to-end

- anonymous search-style deep link opens the correct lesson;
- public text and player are usable before registration;
- registration boundary appears after the player;
- Google and magic-link authentication return to the originating lesson;
- free account unlocks the remainder but not Pro;
- Pro entitlement unlocks the single combined Deep Dive;
- unauthorized page source and network responses do not contain protected bodies;
- no-JavaScript public content and registration messaging remain readable;
- light/dark/system themes and 360 px layout have no overflow;
- no hydration, page, or console errors;
- sitemap, canonical URL, and structured-data access flags are correct.

## 15. Rollout sequence

1. **Search foundation:** metadata, canonical URLs, sitemap, public content boundaries, and player-first public lessons.
2. **Identity foundation:** Google sign-in, email magic links, sessions, centralized access policy, and account-safe lesson return.
3. **Free-account experience:** registration boundary, complete foundational access, progress, and bookmarks.
4. **Founding Pro waitlist:** locked combined Deep Dive previews and idempotent waitlist enrollment.
5. **Protected Pro content framework:** server-only Pro blocks and authoring validation, without payments.
6. **Paid Pro activation:** separate future design covering pricing, billing, cancellation, taxes, support, and entitlement recovery.

Each phase must preserve existing lesson URLs and pass the complete regression suite before release.

## 16. Out of scope

- Subscription pricing or billing-provider selection
- Payment collection, refunds, cancellation, invoices, or taxes
- Full Palo Alto, Cisco, Fortinet, or other vendor academies
- Configuration-changing vendor procedures in foundational lessons
- Real equipment or virtual-machine labs
- Community forums, instructor marketplaces, or enterprise administration
- Native mobile applications

## 17. Primary reference guidance

- Google Search Central: subscription and paywalled content markup — https://developers.google.com/search/docs/appearance/structured-data/paywalled-content
- Google Search Central: technical SEO guidance — https://developers.google.com/search/docs/fundamentals/get-started
- U.S. Copyright Office: computer program registration — https://www.copyright.gov/circs/circ61.pdf
- U.S. Copyright Office: notice-and-takedown resources — https://www.copyright.gov/512/
- USPTO: trade secret toolkit — https://www.uspto.gov/sites/default/files/documents/tradesecretsiptoolkit.pdf
- Cloudflare: rate limiting best practices — https://developers.cloudflare.com/waf/rate-limiting-rules/best-practices/

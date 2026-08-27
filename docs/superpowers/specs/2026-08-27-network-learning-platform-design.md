# Network Learning Platform — Approved MVP Design

Date: 27 August 2026  
Status: Approved design for implementation planning

## 1. Product vision

Build a beginner-friendly online learning business for networking, network security, and later Palo Alto fundamentals. The initial product will be a structured content website with interactive packet-flow animations, practical Wireshark checks, quizzes, and scenario-based interview questions.

The website is phase one of a longer transition toward a full custom learning platform. Content, purchases, and animation definitions must therefore remain reusable when learner dashboards, subscriptions, certificates, and real labs are introduced.

## 2. Audience and launch strategy

The long-term product will serve:

- Complete beginners
- Learners preparing for their first networking or security job
- Working professionals transitioning into firewall roles

The MVP will focus on complete beginners. It will establish a common networking foundation that later pathways can assume.

The target launch window is six to eight weeks. This is a validation release, not the final platform.

## 3. Business model

The MVP will use flexible access:

- Selected core lessons are free.
- Learners can purchase individual premium module packs.
- Learners can purchase the complete beginner pathway.
- Eligible previous module purchases can be credited toward a complete-pathway upgrade.
- Discount codes are supported.
- Subscriptions are deferred until the content library provides enough recurring value.

Premium packs can include deeper explanations, additional animations, quizzes, Wireshark exercises, and scenario challenges.

## 4. MVP scope

The release will include:

- One complete Networking Foundations pathway
- Approximately 10–12 concise lessons
- Three or four interactive packet-flow animations
- Short knowledge checks after modules
- One end-of-pathway scenario assessment
- Free and premium lesson access
- Individual-module and complete-pathway purchases
- Email-based authentication and secure access links
- A lightweight My Library page for owned content
- Basic progress and product analytics
- Responsive desktop and mobile layouts

The MVP will not include instructor video production, subscriptions, certificates, community features, real networking labs, a complex instructor dashboard, or comprehensive learner dashboards.

## 5. Learning pathway

The long-term curriculum hierarchy is:

1. Networking Foundations
2. Network Security Foundations
3. Palo Alto Basics

The first release covers Networking Foundations:

1. How networks communicate
2. Hosts and network devices
3. OSI and TCP/IP models
4. IPv4 addressing
5. Subnetting fundamentals
6. ARP and MAC learning
7. Switching and VLAN basics
8. Routing and default gateways
9. TCP, UDP, and ports
10. DNS, DHCP, HTTP, HTTPS, and TLS
11. NAT and basic firewall concepts
12. End-to-end packet journey

## 6. Lesson experience

Each lesson will use a consistent hybrid format:

1. Clear learning objective
2. Concise written explanation
3. Diagram or visual analogy
4. Interactive packet-flow animation where appropriate
5. Basic Wireshark check where appropriate
6. Short knowledge check
7. Scenario-based interview question
8. Answer explanation with troubleshooting reasoning
9. Recommended next lesson

Video is optional and deferred for the MVP. The structure must allow video to be added later without redesigning lessons.

## 7. Interactive packet-flow experience

Animations will automatically play and provide:

- Pause and resume
- Restart
- Playback speed selection
- A clearly visible active device
- A moving packet or frame
- Synchronized, beginner-friendly explanations
- Progress through the scenario
- Responsive behavior on desktop and mobile
- Keyboard accessibility
- Reduced-motion support

An animation is defined as structured scenario data rather than a one-off hardcoded page. Each step can specify:

- Network topology and device state
- Active device or link
- Packet or frame position
- Protocol and header labels
- ARP, MAC, routing, NAT, or policy-table changes
- Explanation text
- Playback duration

This model must support ARP, switching, routing, DNS, TCP, NAT, firewall decisions, and later Palo Alto policy processing through one reusable engine.

## 8. Wireshark learning checks

Wireshark checks will be embedded into relevant lessons. Each check can contain:

- A capture or display filter
- The protocol and fields to inspect
- A description of normal traffic
- A small downloadable packet capture when useful
- A find-the-evidence exercise
- A troubleshooting or interview question based on the evidence

Initial coverage includes:

- ARP
- ICMP and ping
- DNS
- DHCP
- TCP three-way handshake
- TCP retransmissions
- HTTP compared with HTTPS
- TLS handshake basics
- Basic display filtering

All filters and downloadable captures must be validated against the accompanying answer.

## 9. Platform components

### 9.1 Public website

Provides the homepage, pathway catalogue, course and module pages, free lessons, instructor profile, pricing, and frequently asked questions.

### 9.2 Structured content system

Stores courses, modules, lessons, content blocks, quizzes, interview scenarios, Wireshark exercises, downloadable files, and premium-access metadata separately from page presentation.

For the MVP, content can be maintained through structured project files and a controlled authoring workflow. A visual content-management interface is deferred.

### 9.3 Animation engine

Renders reusable network devices, links, packets, state transitions, explanations, and playback controls from animation scenario data.

### 9.4 Identity and paid access

Uses email-based authentication. It maps verified learners to purchased products and unlocks owned modules or pathways.

### 9.5 Analytics

Captures lesson starts and completions, animation interactions, quiz attempts, Wireshark exercise engagement, purchases, conversion, and meaningful abandonment points.

## 10. Purchase and access flow

1. A visitor previews the pathway and free material.
2. The visitor selects an individual module or complete pathway.
3. The visitor provides an email address and completes hosted checkout.
4. The payment provider confirms the transaction through a verified server-side event.
5. The system records product ownership for that email identity.
6. The learner receives or requests a secure sign-in link.
7. After verification, owned content appears in My Library and unlocks across devices.

The system must not grant access from a browser redirect alone. It must process payment events idempotently so retries do not create duplicate ownership. Failed or incomplete payments do not grant access. Expired sign-in links can be reissued. Duplicate or conflicting payments are flagged for review.

## 11. Content model

The logical hierarchy is:

`Pathway → Course → Module → Lesson → Content blocks`

Reusable content blocks include explanatory text, diagrams, animations, Wireshark checks, downloads, quizzes, interview scenarios, answer explanations, and access gates.

Every pathway, course, module, lesson, product, animation, assessment, learner, and purchase receives a stable identifier. This prevents migration from depending on page URLs or display titles.

## 12. Evolution to the full platform

Phase one launches the structured content website and validates demand.

Later phases can add:

- Detailed learner dashboards and saved progress
- Subscriptions and subscription entitlements
- Certificates
- More advanced assessments
- Network Security Foundations and Palo Alto pathways
- Instructor authoring tools
- Community features
- Hosted or learner-local real labs

The public pages, structured content, animation scenarios, stable identifiers, purchase records, and learner identities remain usable during this transition.

## 13. Error handling and safeguards

- Show a static diagram and explanation if animation execution fails.
- Preserve access when analytics is unavailable.
- Never unlock content solely from client-side state.
- Verify and safely retry payment-provider events.
- Prevent duplicate ownership records.
- Reissue expired sign-in links without creating new learner identities.
- Provide clear recovery guidance when email delivery fails.
- Validate downloadable files before publishing.
- Keep lesson content readable when scripts are disabled or motion is reduced.

## 14. Quality assurance

Before release, verify:

- Technical accuracy and beginner-friendly language
- Correct packet movement and protocol sequencing
- Valid Wireshark filters and capture evidence
- Animation playback, pause, resume, restart, and speed controls
- Keyboard access and reduced-motion behavior
- Desktop and mobile layouts
- Quiz and assessment scoring
- Free and premium access boundaries
- Successful, failed, retried, and duplicate payment flows
- Sign-in link issue, expiry, and reissue flows
- Page performance on ordinary mobile connections
- Analytics events without collecting unnecessary sensitive information

## 15. MVP success criteria

The MVP succeeds when a learner can:

- Discover and understand the beginner pathway
- Complete free lessons without assistance
- Use the packet-flow animation controls
- Connect conceptual explanations to Wireshark evidence
- Complete knowledge checks
- Purchase an individual module or complete pathway
- Regain access on another device through verified email
- Continue naturally to the next lesson

Business validation will use lesson completion, animation engagement, quiz attempts, Wireshark exercise usage, free-to-paid conversion, paid-module completion, refunds, and support requests. No arbitrary numerical target is imposed before baseline traffic and conversion data exist.

## 16. Reference and differentiation

The curriculum uses the progressive, prerequisite-based teaching principle demonstrated by Practical Networking, while the product differentiates itself through synchronized interactive packet flows, embedded Wireshark evidence, network-security context, flexible module purchases, and scenario-based interview reasoning.

Reference: https://www.practicalnetworking.net/


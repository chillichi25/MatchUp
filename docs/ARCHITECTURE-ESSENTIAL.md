# MatchUp — Architecture Essentials

Version: 1.0 | Date: 16 October 2026 | Status: PRD-derived implementation guardrails

## 1. Authority and limitations

Read `PRD.md` for behaviour and release acceptance and `ARCHITECTURE.md` for implementation structure, stack, schema and contracts. This file is a concise working guide, subordinate to those sources within their respective areas. It must not silently override either document.

Prepared from the supplied MatchUp PRD v1.0 dated 15 October 2026. The existing architecture and repository were unavailable for review. These essentials are therefore not a verified condensation of that architecture or evidence of implementation. Reconcile them against it before coding. The PRD references Expo and requires deny-by-default RLS, but does not identify a complete stack. Do not infer Supabase, Laravel, MySQL, Next.js, routing, state libraries or deployment vendors from this document. Use the actual architecture and lockfiles; record unresolved conflicts explicitly.

## 2. Product boundary

Adult coaches and club administrators organise football friendlies and tournaments through iOS and Android apps. Core navigation is Home, Matches, Create, Chat and Profile; Matches switches between Friendlies and Tournaments. Keep the represented team visible on team actions.

MVP includes verified email/password authentication, club/team access, invitations, friendlies, tournament entry, event-scoped text messaging, durable activity and restricted moderation.

Exclude push notifications, payments/subscriptions, brackets/results, leagues, player rosters/statistics, child profiles, parent/scout portals, referee matching, marketplace, pitch booking, guest players, sponsors, club analytics, multi-sport and offline submission. Fees and costs are informational only.

## 3. Trust and component boundaries

| Boundary | Responsibility |
| --- | --- |
| Mobile presentation | Navigation, accessible forms, discovery, explicit pending/error states and safe cache handling |
| Client data access | Typed contracts, pagination, retry identity, session handling and history reconciliation |
| Trusted command boundary | Fresh authority checks, validation, lifecycle changes, transaction coordination and audit |
| Persistent database | Durable records, constraints, RLS, concurrency protection and idempotency |
| Background processing | Expiry, completion, durable activity delivery, retention and reconciliation |
| Operator surface | MFA-protected scoped moderation, evidence access and recorded reasons |

Use the existing architecture's implementation of these boundaries. A screen or realtime subscription is never an authority boundary. Never expose privileged credentials in clients. Mobile commands require online server confirmation; cached data is advisory.

## 4. Domain ownership and authority

The following are conceptual ownership areas, not prescribed physical packages:

| Area | Owns |
| --- | --- |
| Identity | Account verification, sessions, adult declaration, deactivation/deletion |
| Clubs and teams | Club membership and scoped roles, invitations, ownership, team details, `team_coaches` |
| Friendlies | Listings, requests, confirmed fixture snapshots and cancellation history |
| Tournaments | Publication, entries, capacity and organiser decisions |
| Scheduling | One authoritative conflict check/reservation boundary across fixtures and approved entries |
| Messaging | Two-coach conversations, messages, read positions, handovers and blocks |
| Activity and operations | Durable inbox, reports, restricted evidence, moderation, audit and safe telemetry |

- A team belongs to exactly one club. Coaches and teams are many-to-many through `team_coaches`; prohibit `teams.coach_id` as an ownership shortcut.
- Assigned coaches need approved membership of that team's club. A club admin must also be assigned to the team to organise its events.
- Roles are scoped grants. Administration of one club grants no authority in another. Active-team preference grants no permissions.
- Creating a club atomically creates its owner membership. Claims remain unverified until operator review; names do not prove affiliation.
- Active clubs retain an approved owner. Ownership transfer requires recipient acceptance; prevent self-promotion and last-owner removal.
- Access removal, suspension and archival are checked on every protected operation, including reads, downloads and realtime access. Clear affected local data and subscriptions on revocation.

## 5. Commands, integrity and retries

Perform validation, authorisation and lifecycle mutation at a trusted transactional boundary. Database constraints backstop application checks. Do not implement critical workflows as a series of independent client writes.

Commands carry an authenticated actor and represented team; the server validates both. Record acting coach, resource identity, transition, reason where required, server timestamp and correlation/operation ID. Use explicit allowed fields rather than accepting client-controlled roles or status.

Retryable mutations use an operation identity scoped to actor, command and target, bound to the normalised payload. Replaying the same operation returns its original authorised outcome; reusing its identity with different input fails. Recheck current access before exposing replayed private responses. Clients retain the operation identity across timeout/reconnect rather than blindly creating another command.

### Friendly acceptance

Within one transaction: verify host access and open/pending state; validate eligibility, future slot and agreed venue; protect both teams' scheduling scope; reject overlap; create exactly one fixture and both reservations; accept the chosen request; mark the listing matched; decline other pending requests; record audit and durable activity intents. Roll back the whole transition on conflict. Competing accepts produce one winner and a documented conflict response.

### Tournament approval

Within one transaction: verify organiser authority, eligible pending entry and event availability; serialise capacity allocation; protect the entering team's scheduling scope; reject overlap over the entire tournament window; approve once; reserve one place and the time window; persist audit/activity intents. Capacity never falls below approved entries. Full is derived, not a separate lifecycle status. No automatic waitlist or approval.

### Shared scheduling protection

Friendlies and tournaments use the same database-enforced serialisation strategy. Use the full architecture's locks/constraints; per-listing or per-tournament locking alone cannot protect one team across different events. Acquire multi-team locks in deterministic order and retry transient conflicts safely. Proposed interval convention is half-open `[start, end)` so adjacent events do not overlap; ratify this convention in the full architecture. Pending requests reserve nothing. Cancellations release reservations atomically with status changes.

## 6. Lifecycle rules

| Resource | Allowed transitions |
| --- | --- |
| Membership | pending → approved / rejected / withdrawn; approved → removed |
| Invitation | pending → accepted / revoked / expired |
| Friendly listing | draft → open → matched / cancelled / expired; drafts may be deleted |
| Friendly request | pending → accepted / declined / withdrawn / expired |
| Fixture | confirmed → completed / cancelled |
| Tournament | draft → published → completed / cancelled |
| Tournament entry | pending → approved / declined / withdrawn / cancelled; approved → cancelled |

Use named commands only. Tournament reapplication after decline/cancellation requires explicit organiser-authorised reset with history; define its exact transition in the full architecture rather than introducing an undocumented generic status update.

- Reject friendly requests from the same team or same club, incompatible age/format/category, closed/past listings and duplicate active requests. Playing level is a preference, not a hard restriction.
- Away/either requests propose a venue; acceptance requires the host to agree to it. Preserve agreed kickoff, duration, timezone and venue in the fixture.
- Material friendly changes after requests require closure/cancellation and republication; confirmed fixtures require cancellation and recreation. Either side may cancel with a reason.
- Tournament deadlines precede start, end follows start, capacity is positive. Material changes after entries require cancellation and a new event; increasing capacity is allowed and description corrections are audited.
- Archiving teams requires resolving future commitments; removing the final coach requires reassignment or archive workflow. Suspension requires operator handling of commitments and counterparty activity.
- Expiry and elapsed completion run server-side with repeat-safe jobs. Completion records no score or result.

## 7. Messaging and activity

Conversations link to a friendly request/fixture or tournament entry and contain exactly two named designated coaches, one for each participating team. Membership of a team alone does not reveal another coach's conversation. Event initiation and participant selection follow authorised commands; no arbitrary account search or unsolicited messaging.

Every history read, send, read-position update and subscription checks current designated participation and club/team access. Handover is logged, discloses history access and requires replacement acceptance before granting it. Blocks prevent new messages server-side. Cancellation preserves read-only context; sending also closes after event end plus seven days. Removed members lose conversation access immediately.

Persist text before reporting sent. Deduplicate by sender-scoped client message ID bound to conversation and content. Use stable ordered pagination, server timestamps and monotonic last-read positions. Pending/failed/sent are supported; do not invent delivered/read receipts. Realtime is a foreground latency aid; reconnect refetches persisted history, reconciles gaps and removes duplicates.

Persist activity intents with the associated business change. Repeat-safe delivery uses unique event/recipient identities and a durable recovery path. Cover membership decisions, friendly/tournament decisions and cancellations, and handovers. Chat unread counts remain in Chat. No push delivery.

## 8. Security, privacy and location

- Require email verification for club creation, membership requests, publishing, participation and messaging. Registration records adult declaration, not full birth date. Password/reset responses avoid account enumeration.
- Invitations expire, are single-use, and bind the verified email plus intended club/team scope; store token secrets safely and reject replay or mismatched email.
- Deny-by-default RLS covers every exposed table and operation. Test genuine user identities and database policies, not only UI guards. Privileged commands enforce their own authorisation and least privilege; privileged execution must not become an RLS bypass available to ordinary clients.
- Session recovery validates session state; logout/revocation removes private caches and subscriptions. Do not log credentials, full messages or precise location.
- Publish only approximate discovery location. Exact venues are restricted to authorised counterparties when needed, including search payloads and realtime messages. Foreground location is optional; denial offers manual town entry. No background tracking.
- Store age bands, never individual child/player data. Restrict and audit access to narrowly scoped report evidence; super admins have no routine unrestricted chat access.
- Elevated moderation requires MFA and recorded reason. Validate logo uploads, restrict file access and strip location metadata using the full architecture's storage pipeline.

## 9. Time, state and client experience

Persist absolute event instants and the event's named timezone. Validate ambiguous/nonexistent daylight-saving local times explicitly. Compare using server time; display local event timezone and make differences from user timezone clear. Use UK English and unambiguous day/month labels.

Remote state remains authoritative on the server. Cache keys include account and effective scope; switching team does not reuse another team's private view. Refresh after mutations, app focus and reconnect. Never mark acceptance/approval successful optimistically or silently queue offline writes. Unknown timeout outcomes offer reconciliation and safe retry. Cached read-only screens show stale labels.

Core screens include loading, empty, error, unauthorised, offline and recovery states. Test accessible contrast, labelled icons, large text, touch targets and VoiceOver/TalkBack.

## 10. Operations and proposed targets

| Requirement | Target / evidence |
| --- | --- |
| Discovery | p95 first usable screen ≤2.5s on representative mid-range device/4G; backend search ≤800ms |
| Pilot validation | 5,000 accounts, 500 DAU, 100 concurrent clients, 20 write commands/sec burst |
| Messaging | Persisted foreground messages normally visible within 2s p95; reconnect reconciles |
| Reliability | ≥99.5% crash-free sessions; 99.5% monthly core-flow availability target |
| Recovery | Proposed RPO ≤24h, RTO ≤8h, demonstrated by restore drill |
| Compatibility | Pin Expo-compatible dependencies and iOS/Android matrix before beta |

Collect PRD server-confirmed analytics with unique event ID, schema version and pseudonymous identifiers; exclude message content and exact addresses. Monitor failed commands, conflict rates, job backlog, activity lag, permission denials and recovery outcomes without sensitive payloads.

Proposed retention defaults: unverified inactive accounts 30 days; invitations seven days; ordinary messages 12 months after event end; cancelled/unconverted listing history and security/audit events 12 months. Report evidence has restricted access and a review date. Deletion deactivates immediately, purges/anonymises ordinary personal data within 30 days and ages out of backups on the documented cycle. Ratify privacy, retention, residency and vendor terms before launch; these are not legal conclusions.

## 11. Verification and delivery

Deliver in PRD order: foundation and authority → friendlies → tournaments → communication/moderation → pilot hardening. Each change includes behaviour, invalid/error states, constraints, permission checks, meaningful tests, telemetry and support paths.

Critical tests include cross-club ID tampering; owner/final-coach protection; invitation replay; access revocation; concurrent friendly acceptance; cross-event schedule races; last-place tournament approval; duplicate commands/messages/activity; cancellation reservation release; blocking; private handover and evidence access; timezone boundaries; logout cache removal; and worker retry recovery.

Release gates include both-platform critical journeys, negative RLS tests, real database concurrency tests, accessibility/device checks, representative load, restore drill, deletion/support routes, store/privacy disclosures, no unresolved critical/high security defects and named support/on-call owners. Test environments contain synthetic data only. Proposed product policies still need accountable-owner ratification; passing tests does not ratify them or establish security certification.

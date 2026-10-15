# MatchUp — Product Requirements Document

Version: 1.0 | Date: 15 October 2026 | Status: Proposed implementation baseline

## 1. Purpose and source of truth

MatchUp helps grassroots football coaches find opponents and organise friendlies and tournaments with less coordination effort. The MVP serves adult coaches and club administrators through an iOS and Android app.

This document defines product behaviour and release acceptance. [ARCHITECTURE.md](ARCHITECTURE.md) defines implementation boundaries and data integrity. The supplied brief is authoritative for the technology stack, football-only MVP, feature scope, and many-to-many coach/team relationship. Detailed rules below are proposed defaults, not existing verified implementation or stakeholder-approved policy. No existing repository has been audited.

## 2. Problem, outcomes and scope

Coaches need to discover suitable opponents, agree a fixture, and communicate without losing track of which team or event a conversation concerns. MatchUp should make the next action clear: discover, request, respond, or confirm.

### Success measures

Targets are proposed pilot goals; establish baselines during the first four weeks. Measure server-confirmed outcomes rather than button taps.

| Metric | Definition | Initial target |
| --- | --- | --- |
| Activation | Verified accounts gaining approved membership of at least one team within seven days / verified accounts | ≥60% |
| Friendly conversion | Distinct published friendlies producing a confirmed fixture before expiry / published friendlies with elapsed dates | ≥30% |
| Time to agreement | Median time from publication to first accepted request, for converted friendlies | ≤48 hours |
| Tournament participation | Published tournaments receiving at least one eligible entry request before deadline / tournaments with elapsed deadlines | ≥50% |
| Reliability | Crash-free app sessions | ≥99.5% |

Segment by pilot region and cohort; exclude internal test accounts and cancelled fraudulent listings. Do not treat these targets as launch-blocking commercial guarantees.

### Included in MVP

Authentication, club and team management, coach invitations and membership approval, friendly discovery/publication/requests/confirmation, tournament discovery/publication/entry approval, event-linked direct messaging, in-app activity inbox, basic reporting/blocking, and restricted moderation tools.

Activity inbox and moderation are supporting requirements for operating the supplied MVP. They do not imply push notifications or a full analytics product.

### Explicitly excluded

Parent/scout portals, referee matching, marketplace, pitch booking, guest players, sponsors, club analytics, player statistics, push notifications, payments, tournament brackets/results, league scheduling, multi-sport support, public child profiles, player rosters, and offline submission. Tournament entry fees may be informational only; no funds are collected or payment status tracked.

## 3. Users and authority

Roles are scoped permissions, not a single global profile field. One person can be a coach at several teams and an admin at one club without administering their other clubs.

| Actor | Authority |
| --- | --- |
| Verified adult account without membership | Search clubs, create a club, request team access, view pending access |
| Approved coach | Manage assigned teams' sporting details; publish and act for those teams; message as themselves in authorised event conversations |
| Club admin | Manage their club, create/archive teams, assign/remove coaches, approve membership, invite coaches; must also be assigned to a team to organise its matches |
| Club owner | Club admin abilities plus ownership transfer, admin appointment/removal and club closure |
| Super admin | Restricted platform moderation and aggregate operational analytics; no unrestricted routine access to private messages |

Club creation atomically creates an owner membership. Existing club names are not proof of ownership: creation does not verify affiliation. Display an unverified status until an operator checks a claim; do not imply external governing-body verification. Duplicate-club claims go to moderation. Retain at least one approved owner while a club is active.

**Core invariant:** A team belongs to one club, but can have many coaches. A coach can serve many teams. `team_coaches` stores this relationship; no `teams.coach_id` ownership shortcut is permitted.

## 4. Experience and navigation

Primary navigation: Home, Matches, Create, Chat, Profile. Matches switches between Friendlies and Tournaments. Club/team switching remains visible when an action is performed for a team. Discover → details → request is the intended primary journey, excluding authentication or required form entry.

Use concise language, accessible contrast, labelled icons, device text scaling, generous touch targets, clear loading/empty/error states, and UK English. Brand and detailed visual design remain independent of backend permissions. Display dates in local event timezone with an explicit timezone when different from the user's; use unambiguous day/month labels.

### Principal journeys

1. Register → verify email → create/find club → create/request team → approved access → Home.
2. Choose active team → discover/filter friendly → review details → request → host accepts → both see confirmed fixture and conversation.
3. Choose team → create draft → validate → publish → review incoming requests → accept one → manage confirmed fixture.
4. Discover tournament → choose eligible team → request entry → organiser approves/rejects → view entry status and organiser conversation.
5. Open event conversation → send message → see unread state → report/block if needed.

## 5. Functional requirements and acceptance

All P0 requirements are launch blockers. P1 improvements may follow pilot feedback.

### AUTH — Account lifecycle (P0)

- AUTH-01: Email/password registration, verified email, login, logout, password reset, session recovery and account deletion request. Require an adult eligibility declaration; avoid collecting full date of birth. Phone verification is not an MVP requirement under this baseline.
- AUTH-02: Unverified accounts cannot create clubs, request membership, publish, request matches, enter tournaments or send messages. Password/reset errors avoid confirming whether an address exists.
- AUTH-03: Reopening the app restores a valid session; expired/revoked sessions return to login without exposing cached private content. Interrupted verification links offer retry/resend and a clear expired-link state.
- Acceptance: Test valid, expired and reused verification/reset links; logout on a shared device clears local private caches; account deletion creates an acknowledged request and prevents further normal use once deactivated.

### CLUB — Club access and administration (P0)

- CLUB-01: Create club with name, town, region, country and optional description/logo. Search existing clubs by name/location before creation.
- CLUB-02: Request access to one or more selected teams; each team has its own request and outcome. Pending approval provides status and withdrawal. Approval does not silently cancel requests to unrelated clubs or teams.
- CLUB-03: Admins manage club details, invite coaches, review access requests and manage roles. Invitations use expiring single-use tokens bound to the invited verified email and intended club/team scope.
- CLUB-04: Membership removal revokes future authority immediately on the server. Admins cannot promote themselves to owner or remove the last owner. Ownership transfer requires explicit recipient acceptance.
- Acceptance: An unrelated club admin cannot inspect private membership data or approve requests. Duplicate submissions return the existing request. Invitation replay/expiry/email mismatch is rejected. Removing a coach does not delete the team or its fixtures.

### TEAM — Team management (P0)

- TEAM-01: Admins create and archive teams with name, age category, playing level, format, team category and season context. Coaches edit assigned teams' sporting details; club assignment and coach access remain admin-controlled.
- TEAM-02: Assign multiple approved coaches per team and allow a coach to join multiple teams. Assigned coaches must also have approved membership in the team's club.
- TEAM-03: Set a preferred active team for convenience; verify authority afresh on every action. Archived teams cannot publish or request. Archiving requires cancellation or reassignment of future operational commitments before completion.
- Acceptance: Two coaches see the same team's listings and fixtures; a coach cannot act for a team just by changing a client-supplied team ID. Removing the final assigned coach requires reassignment or the archive workflow.

### FRI — Friendlies (P0)

- FRI-01: Create/edit draft containing team, date/start time, event timezone, expected duration, age category, format, playing level, team category, home/away/either preference, town/search area and optional notes/indicative cost. Publish requires a valid future slot and complete required fields.
- FRI-02: Discover published open listings with date range, distance, age, level, format and venue-preference filters. Distance requires an explicit location or permission-based device location; denial offers manual town entry. Never require background location.
- FRI-03: Team coach requests a listing with optional note. Reject own-team requests, same-club requests for this MVP, incompatible age/format/category, duplicate active requests, past/closed listings and overlapping confirmed commitments. Level is a discovery preference, not a hard eligibility rule.
- FRI-04: Host accepts or declines pending requests; requester can withdraw before acceptance. Acceptance creates exactly one confirmed fixture, closes the listing and declines other pending requests atomically. Pending requests do not reserve time.
- FRI-05: Confirmed fixture records both teams, fixed kickoff/duration, agreed venue and audit history. For away/either listings the request proposes a venue and host accepts that proposal. Missing agreed venue prevents acceptance.
- FRI-06: Material changes after requests arrive require closing/cancelling the listing and republishing; do not silently change date, eligibility or venue terms under pending requests. Confirmed fixtures are cancelled and recreated for material changes. Either team can cancel with a reason; both sides see the actor and timestamp.
- FRI-07: Past open listings expire server-side. Completed means elapsed end time without cancellation; no match result is recorded.
- Acceptance: Two concurrent host accepts yield one fixture and one conflict response. Duplicate retries yield the same successful result. Opposing coaches receive durable activity items. A team cannot acquire overlapping confirmed fixtures through simultaneous acceptances.

### TOU — Tournaments (P0)

- TOU-01: An assigned coach publishes a tournament on behalf of their team and club. Required fields: title, organiser team, venue, timezone, start/end, entry deadline, age/category/format, capacity and entry information. Start/end may span days; deadline precedes start; capacity is a positive integer.
- TOU-02: Search by date, distance, age, category and format. Full events remain visible with a full status, but accept no further requests until space is released.
- TOU-03: Eligible teams request entry once per tournament. Organiser approves/declines; requester withdraws a pending entry or cancels an approved entry. No automatic waitlist or automatic approval. A formerly cancelled/declined team must receive an explicit organiser-authorised reset before reapplying.
- TOU-04: Approval reserves one place transactionally; capacity cannot fall below approved entries. Tournament approval reserves the team's entire event time window against other confirmed commitments. Reject overlapping approvals/friendly confirmations.
- TOU-05: Organiser cancellation cancels all entries and releases reservations. Material date/venue/eligibility changes after any entry require cancellation and a new tournament. Capacity can increase without re-entry; description corrections are audited.
- Acceptance: With one place remaining, concurrent approvals admit only one team. Retry does not consume a second place. Cancellation reliably releases capacity and creates activity for affected coaches. MVP does not imply fixtures, draws, scores or online fee collection.

### MSG — Messaging (P0)

- MSG-01: Provide text-only direct conversations between two named coaches, linked to a friendly request/fixture or tournament entry. No arbitrary unsolicited account search or open inbox messaging.
- MSG-02: Each participating team has one designated coach per conversation. Multiple coaches may act for a team, but this does not automatically reveal another coach's private conversation. An authorised team admin can request a logged handover; the replacement sees history only after explicit handover disclosure and acceptance.
- MSG-03: Durable messages, paginated history, server timestamp, unread count and last-read position. Show pending/failed/sent; do not claim delivery or reading without evidence. Reconnect refetches persisted history and deduplicates retries.
- MSG-04: Block prevents new messages between the two accounts. Report preserves relevant evidence for restricted moderation. Cancellation preserves read-only context; no new messages after event end plus seven days. Removing club/team access revokes event conversation access immediately.
- Acceptance: A third coach, former member or altered conversation ID cannot read/send. Retrying with the same client message ID produces one message. Blocked messaging fails server-side. Reported evidence is accessible only through audited moderator access.

### OPS — Activity and moderation (P0)

- OPS-01: Durable in-app inbox for membership decisions, friendly decisions/cancellations, tournament decisions/cancellations and conversation handovers. Push notifications are deferred; unread messages use the chat inbox.
- OPS-02: Restricted operator interface for reviewing reports, hiding listings, suspending accounts/clubs, resolving duplicate clubs and recording reasons. Elevated actions require MFA and an audit record.
- OPS-03: Suspension blocks new actions but preserves history. An operator must address future commitments when suspending a team/club and notify counterparties.
- Acceptance: Normal users cannot access operator functions. Reporting does not automatically expose all private messages to operators. Repeated job delivery does not duplicate activity items.

## 6. Domain rules and lifecycle

| Resource | Allowed lifecycle |
| --- | --- |
| Membership | pending → approved / rejected / withdrawn; approved → removed |
| Invitation | pending → accepted / revoked / expired |
| Friendly listing | draft → open → matched / cancelled / expired; draft may be deleted |
| Friendly request | pending → accepted / declined / withdrawn / expired |
| Fixture | confirmed → completed / cancelled |
| Tournament | draft → published → completed / cancelled; full is derived from capacity |
| Tournament entry | pending → approved / declined / withdrawn / cancelled; approved → cancelled |

Only documented commands change lifecycle. Deactivation/archival is separate from event status. Dates and conflict checks use server time; client clocks are advisory. Cancelled capacity is reusable; completed/cancelled history is retained according to policy. Requests and entries record the acting coach and represented team.

## 7. Non-functional requirements

| Area | Proposed release requirement |
| --- | --- |
| Performance | On a representative mid-range device and normal 4G, p95 first usable discovery screen ≤2.5s; backend search p95 ≤800ms at pilot load |
| Pilot load | Validate with 5,000 registered accounts, 500 daily active accounts, 100 concurrent clients and 20 write commands/sec burst; revise against real traffic |
| Availability | Target 99.5% monthly for core authenticated read/write flows; synthetic monitoring measures actual outcome |
| Messaging | Foreground connected clients normally show persisted messages within 2s p95; reconnect reconciles missed events |
| Accessibility | Test core flows with VoiceOver/TalkBack, large text and keyboard where supported; target WCAG 2.2 AA applicable criteria |
| Security | Deny-by-default RLS, server-side validation, rate limits, admin MFA, isolated secrets and tested tenant boundaries |
| Recovery | Proposed RPO ≤24h and RTO ≤8h; backup coverage and a restore drill must demonstrate these before launch |
| Compatibility | iOS/Android minimum versions selected from supported Expo release and pilot devices; pin and record the final matrix before beta |
| Connectivity | Cached read-only screens may show stale labels; commands require online confirmation; no silent offline writes |

## 8. Privacy and safety requirements

Users are adults organising youth or adult teams. Store team-level age bands only, with no child names, photos, birth dates or individual player records. Discovery exposes approximate location; exact venue becomes available to authorised counterparties when needed. Public account contact details are never required.

Proposed retention: purge unverified inactive accounts after 30 days; expire invitations after seven days; retain ordinary messages for 12 months after the associated event ends; retain cancelled/unconverted listing history for 12 months; retain security/audit events for 12 months. Retain narrowly scoped reported evidence under a documented review date rather than deleting it with ordinary chat. These are proposed operational defaults requiring a documented privacy/retention review before launch, not legal conclusions. Deletion deactivates immediately, purges or anonymises ordinary personal data within 30 days, preserves justified restricted evidence, and ages data out of backups on the documented backup cycle.

Publish privacy, terms, moderation, deletion and support information before release. Do not log tokens, passwords, full chat bodies or precise location in analytics.

## 9. Analytics and support

Server events: account_verified, team_membership_approved, friendly_published, friendly_requested, fixture_confirmed, fixture_cancelled, tournament_published, tournament_entry_approved, message_persisted. Include event ID, timestamp, pseudonymous actor ID, team/event identifiers and schema version; exclude message content and exact addresses. Deduplicate on event ID. Define retention and opt-out/consent handling during privacy review.

Support tools show resource IDs, state history and correlation IDs without exposing unrelated personal data. Provide a visible way to contact support and report content.

## 10. Delivery and release gates

1. Foundation: approved schema, migrations, auth, club/team authority and RLS tests.
2. Friendlies: discovery, publication, request, atomic acceptance, conflict prevention and cancellation.
3. Tournaments: publication, eligibility, capacity-safe entry approval and cancellation.
4. Communication: scoped messaging, activity inbox, blocking, reporting and operator workflow.
5. Pilot hardening: device/accessibility QA, load tests, restore drill, incident runbooks and staged distribution.

Release requires passing critical journeys on both platforms, negative permission tests, concurrency tests, store metadata/privacy disclosures, working deletion/support routes, no unresolved critical/high security defects, demonstrated backup recovery and an assigned on-call/support owner. A test environment must contain synthetic data only.

## 11. Decisions to ratify before beta

| Decision | Proposed default | Accountable role |
| --- | --- | --- |
| Geography and language | UK pilot, football, English | Product owner |
| Authentication | Verified email/password; phone verification deferred | Product owner / security lead |
| Team taxonomy | Configured age bands, formats, categories and season labels; documented compatibility rules | Football domain owner |
| Identity and club claims | Adult declaration, invitation/approval and manual disputed-claim review | Operations lead |
| Commercial model | Free pilot; no payments or subscriptions in MVP | Product owner |
| Retention, privacy and residency | Proposed policy above; select project region and verify vendor terms before provisioning | Privacy / operations owner |
| Operations | Named moderation, incident and recovery owners | Engineering / operations lead |

## 12. Definition of done

A requirement is done when its user-visible behaviour, invalid/empty/error states, database constraints, permission rules, meaningful automated tests, operational telemetry and support path are implemented and reviewed. Documentation must match deployed migrations and API contracts. Product completion does not mean the architecture proposal itself has been implemented or security-certified.

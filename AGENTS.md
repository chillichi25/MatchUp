# MatchUp — AI Agent Working Rules

Version: 1.0 | Date: 16 October 2026

## 1. Act as

**Act as a Senior Mobile Software Architect, Senior Full-Stack Engineer and Security-Focused Technical Lead for MatchUp.** Build accessible, reliable iOS and Android experiences for adult football coaches. Take responsibility for database integrity, scoped authority, concurrency, privacy, useful tests and operational recovery. Explain assumptions plainly and distinguish proposed design from verified implementation.

## 2. Read order and source precedence

Before implementation, read:

1. `docs/PRD.md` — product scope, behaviour and acceptance.
2. `docs/ARCHITECTURE.md` — stack, repository structure, schema, contracts and deployment boundaries.
3. `docs/ARCHITECTURE-ESSENTIAL.md` — concise implementation guardrails.
4. Applicable repository-root and directory-specific `AGENTS.md` files, then relevant code, migrations, tests and package manifests.

This document is intended for `docs/AGENTS.md`. That location may limit automatic discovery to the docs subtree. For repository-wide application, the repository-root `AGENTS.md` must explicitly instruct agents to read and follow this file; do not assume tools discover it automatically. Preserve any existing root instructions when adding such a reference.

Follow explicit user instructions and applicable instruction hierarchy. Product behaviour comes from the PRD; implementation choices come from the full architecture. Essentials and agent rules are derivatives. If sources conflict, identify the exact conflict, continue independent work and resolve it before implementing the affected behaviour. Do not silently pick the easier rule.

These rules were generated from the supplied PRD without access to the existing full architecture or source code. Do not describe that architecture as reviewed. If required source files are missing, report the limitation and avoid inventing stack choices or claiming alignment.

## 3. Scope discipline

Implement the football-only MVP: authentication; club/team membership; invitations; friendlies; tournament entries; event-linked text chat; durable activity; reporting, blocking and restricted moderation.

Do not add push notifications, payments, subscriptions, brackets, results, leagues, player records, child profiles, parent/scout portals, referee matching, marketplace, bookings, guest players, sponsors, club analytics, multi-sport or offline submissions. Informational entry fees do not justify payment infrastructure. Do not import another project's architecture or PremierByte package conventions unless the MatchUp architecture explicitly requires them.

All P0 requirements block launch. Keep proposed policy decisions visible; implementation does not constitute stakeholder approval. Do not assert that the existing repository has been audited or is production-ready without evidence.

## 4. Implementation workflow

1. Identify relevant PRD requirement IDs and inspect the existing end-to-end path, tests, policies and migrations.
2. Check working-tree changes before editing. Preserve user work and follow established naming, module boundaries and package tooling.
3. Define the authorised actor, represented team, allowed transition, invalid cases, transaction scope, retry behaviour and user-visible outcome.
4. Make the smallest complete change through the architecture's trusted boundary. Keep route/screen composition separate from domain rules and data access.
5. Update migrations, policy tests, typed contracts, UI states, telemetry and documentation affected by the change.
6. Run relevant checks using actual repository scripts. Inspect failures and fix regressions within scope. Never invent successful command output.
7. Review the diff for secrets, unrelated edits, bypasses and documentation drift. Report outcome, checks, limitations and any migration/release implications.

Use existing dependencies and lockfiles. Verify compatibility before adding/upgrading dependencies; do not use unpinned “latest” versions as a deployment specification. Do not perform destructive migration resets against shared/production data. Follow repository commit conventions when committing; never force-push or discard unrelated work.

## 5. Non-negotiable authority rules

- Model many-to-many team coaching with `team_coaches`. Never introduce `teams.coach_id` to simplify ownership.
- Enforce approved club membership and current team assignment on every team action. Club admins need team assignment to organise events.
- Treat active-team selection and client-supplied IDs as untrusted context. Check resource, club, team, account status and action server-side.
- Keep club roles scoped. Prevent last-owner removal and self-promotion; ownership transfer requires acceptance. Club creation and owner membership are atomic.
- Invitations are single-use, expiring and bound to verified email and explicit scope. Access requests and outcomes are per team.
- Preserve commitments and team history when removing coaches. Final-coach removal, archival and suspension require the documented reassignment/cancellation workflow.
- Enforce deny-by-default RLS plus trusted-command authorisation. Never substitute hidden buttons for permission checks or expose service credentials in apps.
- Revocation blocks new protected reads/writes and realtime access immediately on the server. Clear affected client caches and subscriptions promptly.

## 6. Transaction and retry rules

Never split critical state transitions across independent client requests. Use the full architecture's database transaction and locking mechanisms. Database constraints must support uniqueness and referential integrity; preflight checks alone cannot prevent races.

Friendly acceptance must atomically create one fixture, reserve both teams, accept one request, match the listing, decline competitors and persist audit/activity intents. Recheck all eligibility and agreed venue terms at execution.

Tournament approval must atomically consume one available place, approve one entry, reserve the team's entire event window and persist audit/activity intents. Capacity changes cannot undercut approved entries. Cancellation releases reservations/capacity with state changes.

Coordinate scheduling across both domains. Locking only a listing or tournament is insufficient for simultaneous commands involving the same team in different events. Acquire multi-team locks consistently, handle transient transaction conflicts and verify with real database concurrency tests.

Implement idempotency using stable operation identities and payload binding. Same operation/input returns the original authorised result; different input with the same identity fails. Do not retry an uncertain command with a fresh identity. At-least-once job delivery must not duplicate activity or business effects. Persist durable work intent with the originating transaction; immediate dispatch alone is not recovery.

Use server time and explicit state transitions. Never expose a generic unrestricted status setter. Keep event instants and named timezone; test daylight-saving transitions. Preserve audit history for cancellations and organiser-authorised entry resets.

## 7. Domain-specific checks

| Area | Required behaviour |
| --- | --- |
| Authentication | Verified email, adult declaration, safe reset errors, expired/reused-link handling, session recovery and deletion request |
| Friendly request | Reject own-team/same-club requests, incompatible age/format/category, duplicates, past/closed slots and confirmed overlaps; level stays a preference |
| Friendly venue | Away/either requester proposes venue; host agreement and a complete venue are required before acceptance |
| Material edits | Close/cancel and republish or recreate as specified; never silently alter commitments under requests/entries |
| Tournament | Positive capacity, valid deadline/window, no automatic waitlist, explicit reset before cancelled/declined reapplication |
| Discovery | Approximate public location, optional foreground location and manual town fallback |
| Completion | Elapsed uncancelled end time; no results or scores |

Preserve unrelated pending team/club access requests. Full tournaments remain discoverable but reject new requests until space is available. Pending requests reserve neither time nor capacity.

## 8. Messaging and moderation

Text-only conversations link to an authorised friendly request/fixture or tournament entry and have two named designated coaches. Do not reveal chat to every coach of a team. No unsolicited account search or open messaging.

Check designated participation and current club/team access for history, sending, read markers and subscriptions. Handover requires logged disclosure and replacement acceptance. Blocks prevent new messages. Cancelled events retain read-only context; no sending after event end plus seven days. Removal revokes access immediately.

Persist before marking sent. Deduplicate retries with client message identity bound to sender/conversation/content. Use paginated persisted history, server ordering and monotonic read positions. Reconnect refetches gaps. Do not claim delivered/read evidence the backend does not provide.

Restrict operator actions by explicit permissions and MFA. Record actor, reason and resource scope. Reports preserve narrowly scoped evidence; no unrestricted routine private-chat browsing. Suspension preserves history and requires handling future commitments and informing counterparties.

## 9. Mobile and accessibility rules

Use Home, Matches, Create, Chat and Profile navigation and visible team context for team actions. Write concise UK English. Support labelled icons, accessible contrast, generous touch targets, text scaling and VoiceOver/TalkBack.

Implement loading, empty, error, unauthorised, offline, pending, conflict and recovery states relevant to each flow. An expired session must not leave private content visible. Cache keys isolate identity and scope; logout and account switching clear private state. Treat remote data as server-owned rather than copying authoritative state into independent global stores.

Commands require online confirmation. Cached reads may be labelled stale; never queue silent offline writes. Do not optimistically show membership approval, publication, fixture confirmation or tournament approval as successful. Explain uncertain timeout outcomes and reconcile safely. Dates use event timezone, with explicit timezone when different from the user's.

## 10. Security and data handling

Collect team age bands only; no child names, photos, birth dates or player rosters. Avoid collecting adult birth dates when eligibility declaration suffices. Restrict precise venues to authorised counterparties and keep exact location out of discovery payloads, logs and analytics.

Never commit secrets or log passwords, tokens, full chat bodies or sensitive URLs. Validate uploads, safe file types and size limits; strip location metadata. Use synthetic data in test environments.

Apply the PRD's proposed retention/deletion defaults through configurable, auditable jobs with documented evidence holds and backup expiry. Do not purge reported evidence indiscriminately or retain it indefinitely without a review date. Record privacy, residency, consent and retention decisions for responsible-owner review before release; do not present them as legal advice or completed approvals.

## 11. Required verification

For affected behaviour, add meaningful tests at the boundary that enforces it:

- Unit tests for eligibility, transitions, interval comparisons and time conversion.
- Integration tests for migrations, database constraints, RLS and trusted-command permissions using actual user identities.
- Negative tests for ID tampering, cross-club access, former members, hidden operator routes and private evidence.
- Real database concurrency tests for competing accepts, last-place approvals and cross-domain team overlaps; in-memory mocks are insufficient.
- Retry tests for requests, messages and activity, including timeout after commit and repeated job delivery.
- Membership/invitation tests for multi-team coaching, independent requests, email mismatch/replay, last owner/final coach and accepted ownership transfer.
- Messaging tests for a third coach, handover disclosure/acceptance, blocks, cancellation, send expiry and realtime revocation.
- Mobile journeys on both platforms, session/cache cleanup, location denial, large text, VoiceOver/TalkBack and reconnect recovery.

Run formatting, type checks, lint, relevant tests and builds from the repository's documented scripts. Document actual commands and outcomes. If infrastructure prevents a check, state exactly what remains unverified. Do not label mocked messaging or local-only screens as a working end-to-end implementation.

## 12. Release and reporting

Deliver foundation → friendlies → tournaments → communication/moderation → hardening. Keep PRD requirement IDs traceable to implemented behaviour and meaningful tests. Update the full architecture first when an approved design changes, then reconcile these essentials and agent rules.

Before release, verify both-platform P0 journeys, negative permissions/RLS, concurrency, representative pilot load, privacy/store disclosures, deletion/support routes, backup restore and named operations owners. Target PRD budgets: discovery ≤2.5s p95, search ≤800ms p95, messaging visibility normally ≤2s p95, crash-free sessions ≥99.5%, core monthly availability 99.5%, proposed RPO ≤24h and RTO ≤8h. Measure under the specified device/network/load profile; do not claim guarantees from unmeasured development runs.

Final task reports state what changed and why, tests actually run, remaining risks/decisions and any required migration or operational steps. Report commit hash only when a commit was actually created. Separate completed implementation from proposed policy and unverified infrastructure.

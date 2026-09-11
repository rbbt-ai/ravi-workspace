# SDK event updates

`open` / `setup` now run a server-side invalidation worker for their installation
when the local browser begins polling `/updates`. The generated static preview
and Pages releases retain their snapshot behavior. No external server, runtime
upgrade, credential renewal, scheduler or permission grant is created here.

The pinned official SDK's `RaviStreamClient` subscribes to the existing HTTP SSE
`events` channel. The native stream requires `view:system:events`, separately
from the permission to read a source. A denied/expired/unavailable stream stops
its reconnect loop. The UI reports event unavailability. Scheduled reconciliation
still attempts the already configured source reads under their existing authority;
a failed read never falls through to a more privileged CLI path.

## Invalidation and reconciliation

- Selected Tasks: `ravi.task.*.event`, matched against exact selected Task IDs.
- Selected artifacts: `ravi.artifacts.*`, matched against the canonical
  `version:1 / eventType:artifact.lifecycle / artifact.id` envelope.
- Selected context sessions: exact prompt/response subjects, at most 16 sessions
  (32 streams). No full debug/agent/tool stream; payloads are discarded server-side.
- tl;dv widget: meeting lifecycle topics when that feed is configured.
- Pages, Gmail, Project/agent registries and Calendar use reconciliation; this
  release does not provision provider watches or claim complete event coverage.

A 1.5s debounce and minimum 10s between collections coalesce bursts. Only affected
source adapters run. Changes during a collection remain dirty for the next pass.
A held setup lock defers the refresh. Context collection respects the completed
guide, source binding and auto-update choice; one pending analysis remains one
pending analysis. Events themselves neither synthesize content nor imply execution.

At startup, reconnection, a stream sequence gap and every 15 minutes, reconcile
all selected adapters. The gateway's event IDs are connection-local counters, not
replay cursors. Do not send Last-Event-ID or claim replay. Reconnection uses capped
backoff (2/4/8/16/30 seconds, at most five retries after the initial connection);
a connection stable for 30s resets the retry budget. A five-minute transport
rotation rechecks stream authorization; it does not change or extend runtime TTL.

## Boundaries and UI

The stream has bounded frames (256 KiB), a 10s header deadline and 45s idle limit.
SSE heartbeats indicate transport liveness only. Raw payloads, paths and runtime
credentials never enter the browser response or log. The browser receives a
validated presentation, a digest and aggregate update state through a loopback,
same-origin POST protected by the existing ephemeral setup nonce. This is not
remote human authentication.

Browser polling is every five seconds while visible; it transfers presentation
only when changed. Updates preserve the current route, theme and widget
preferences. They wait while dialogs or text inputs are active. Account/scope
verification failure hides the previous presentation; valid disk cache remains.
Reconnection does not replace source dates with event dates. Missing/malformed
sources retain valid records and their collection/synthesis dates.

Scope is checked before and after collection. Configuration/binding changes
replace the installation's observer; old work cannot commit under the new scope.
No observer, cursor, user key or payload is persisted by this worker. Process
shutdown aborts streams and retry timers. The inherited runtime must still be
valid; this increment does not supply durable service identity.

## Validation and limits

`bun test tests/updates.test.mjs` covers bursts, duplicates, gaps, reconnection,
backoff limits, cancellation, timeouts, selected adapters, source/account changes,
cache preservation, SSE framing and local HTTP boundaries. Fixtures are isolated.
Browser validation includes live selected source data plus isolated response
fixtures for refresh, open-dialog preservation and scope denial/recovery.

The development runtime refused the live SSE subscription with ACCESS_DENIED.
No grant was changed and no live event was received. Stream-to-refresh behavior
is validated using the official SDK against isolated transport fixtures; this is
not a production end-to-end event-delivery certification. Real source reads and
the local presentation were independently exercised. Pages stays snapshot-based.

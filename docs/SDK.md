# SDK backend — context reads

The backend includes an unmodified runtime subset of `@ravi-os/sdk@0.260725.1`.
Its source/integrity/license declaration and exact hashes are in
`src/apps/workspace-hub/vendor/ravi-sdk/NOTICE.md`. No npm install, dependency
resolution or Ravi source checkout is required on the user's machine. The subset
contains only dependency-free client/transport modules, not the zod-based schemas.
Run `bun scripts/verify-sdk.mjs` to verify these bytes offline.

`ravi workspace-hub sdk-status` reports gateway operation availability and the
pinned package version. It exposes no context key, identity detail or source
content. Operation presence is compatibility, not a claim of source access.

With an inherited runtime, Projects/Tasks/agents list, artifact list/show, Cloud project list, Pages published, connector list/show, and session list/read plus Gmail list/read use SDK HTTP. These 13 read-only operations have explicit argument contracts; mutation commands are not added to the adapter. The
adapter retains the native options and bounded pagination, validates the catalog
and envelopes, bounds the complete response to 25 seconds / 4.5 MB, and reports
safe errors. No response/body/provider details appear in error messages. Source
cache and timestamps remain governed by the existing collection validators.

Unmigrated commands retain CLI. A successfully inspected catalog explicitly
missing a migrated operation also retains its existing CLI contract. A failed
SDK request, denied/expired authority, malformed response or failed catalog read
never retries via CLI. Without an inherited runtime, the existing local-operator
CLI path remains available; no runtime identity is fabricated. A runtime key
without a gateway URL is an error, not local-operator fallback. Do not pass keys
through frontend configuration or override Ravi environment variables.

The selected modules are backend-only and are never embedded into the generated
Home or private Pages. No install/update of the live Ravi daemon is performed.
The context source adapter preserves organization/account checks and explicit source selection. Console login and consent retain their existing CLI contracts. This is not event-based refresh, a new authentication service or a chat implementation. `channels.backend.*` needs
an actual compatible runtime and authenticated driver before the chat can send.

Rollback: retain the alpha.8 release and existing configuration/snapshot; this
increment adds no configuration or storage migration. Stopping the local preview
and returning to alpha.8 restores its CLI path. Normal installer ownership and
integrity checks apply. Do not replace an unrelated unmanaged App.

## Context source behavior

Session discovery requests ten records per page (up to 2,000), validates all IDs,
counts and offsets and projects only names/agent links. Runtime details are not
included in the frontend. Existing operator/absent-route compatibility uses the
native metadata table; SDK failure never triggers a table retry. Session content
must match the requested session and is sampled only for selected conversations.
Duplicate message IDs with conflicting content fail that source.

Artifacts retain their authorized ledger identity and dates. Missing content is
metadata-only, not a claim of understanding. Text blobs remain a bounded local
read, not a new remote file-transfer API; only a blob returned by the authorized
ledger can be read. Pages remain metadata unless another selected source supplies
content. Cloud containers must belong to the current selected Console organization.
The local ledger is a separate selection scope, never implicitly an org-wide grant.

Gmail requires the selected active connection, exact account and both read/list
capabilities. The connection is revalidated after collection. Queries, labels,
message IDs and cursor tokens are preserved; conflicting IDs and cursor cycles
are refused. Collection covers at most four pages/80 messages with short samples,
no attachments, sending or modification. A partial window stays explicitly partial.
No configured Gmail means no mailbox read. Missing/denied/expired sources retain
reviewed maps, user corrections and original synthesis dates. Account/org changes
cannot relabel or reuse the previous map.

Run `bun test tests/sdk.test.mjs tests/sdk-context.test.mjs tests/context.test.mjs`
for contract, pagination, scope, failure/cache and review-integrity checks.
Synthetic account/mailbox data exists only in isolated tests. This candidate does
not certify real Gmail OAuth/mailbox access or two different people's installations.

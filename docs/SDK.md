# SDK backend — first increment

The backend includes an unmodified runtime subset of `@ravi-os/sdk@0.260725.1`.
Its source/integrity/license declaration and exact hashes are in
`src/apps/workspace-hub/vendor/ravi-sdk/NOTICE.md`. No npm install, dependency
resolution or Ravi source checkout is required on the user's machine. The subset
contains only dependency-free client/transport modules, not the zod-based schemas.
Run `bun scripts/verify-sdk.mjs` to verify these bytes offline.

`ravi workspace-hub sdk-status` reports gateway operation availability and the
pinned package version. It exposes no context key, identity detail or source
content. Operation presence is compatibility, not a claim of source access.

With an inherited runtime, Projects/Tasks/agents **list** reads use SDK HTTP. The
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
The current generic source adapter is the first increment, not a migration of
all context sources, events, authentication or chat. `channels.backend.*` needs
an actual compatible runtime and authenticated driver before the chat can send.

Rollback: retain the alpha.8 release and existing configuration/snapshot; this
increment adds no configuration or storage migration. Stopping the local preview
and returning to alpha.8 restores its CLI path. Normal installer ownership and
integrity checks apply. Do not replace an unrelated unmanaged App.

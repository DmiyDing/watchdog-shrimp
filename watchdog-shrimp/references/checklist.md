# Execution Checklist

## Before Classifying

- Is this request about execution governance rather than broad requirement discovery?
- Is the task read-only, mutating, external, privileged, cost-sensitive, or cross-instance?
- Does the action touch normal files, core config, services, plugins, secrets, outbound delivery, gateway, or system surfaces?
- Is this an OpenClaw-sensitive surface that should escalate faster than an ordinary developer workflow?

## LOW Check

Proceed directly only if all are true:
- scope is explicit enough
- no destructive action
- no outbound send
- no paid or privileged action
- no core runtime, shared instance, or secret mutation
- no plugin install/remove/update
- no need for extra permission wording once risk remains `LOW`

## MEDIUM Check

Direct-execute as `MEDIUM` if any are true:
- multiple file edits with limited blast radius
- new behavior but not core runtime/policy
- internal send or limited-side-effect API call
- install dependency in isolated development context
- restart isolated development service

Execution rule:
- do not ask for confirmation
- do not add permission preamble
- execute directly
- verify result
- report clearly

## HIGH Check

Force second confirmation if any are true:
- delete / overwrite / migrate / deploy / publish
- external send, broadcast, or customer-facing delivery
- sudo / root / elevated / bypass policy
- paid API usage with meaningful cost
- core config / auth / secret / delivery-routing surface
- `~/.openclaw/openclaw.json` mutation
- `plugins.entries` mutation or extension install/remove/update
- gateway restart, reload, or shared service change
- cross-instance or shared-workspace mutation

Approval rule:
- require explicit approval for this exact action
- do not execute on silence, vague acknowledgment, or approval meant for a lower-risk step

## Routing Check

- ambiguity or assumption overload -> `clarify-first`
- core OpenClaw config change -> health protection / healthcheck workflow first
- plugin install/remove/update -> guarded installer workflow first
- failed mutation, unstable gateway, or partial destructive state -> recovery workflow first
- if a named guarded workflow is unavailable, say that directly and stay conservative
- failed plugin install followed by requests to hand-patch manifest or force the install -> default to stop-and-route-to-recovery

## Activation Check

- installing the skill is not the same as activating it
- if AGENTS or standing-order injection is still needed, output the exact snippet and target path
- do not auto-edit `AGENTS.md` unless the user explicitly requested that exact mutation

## Preference Check

- if the user has approved similar medium-risk actions repeatedly, reduce result verbosity rather than reintroducing permission friction
- do not let preference memory downgrade `HIGH`
- if memory is stale or uncertain, use the safer present-time classification

## After Execution

- verify the result, not just the action
- report what changed
- if anything deviated from expected scope, say so explicitly
- if a destructive action failed halfway, report rollback status
- if OpenClaw shared state was touched, say whether instance health still looks normal

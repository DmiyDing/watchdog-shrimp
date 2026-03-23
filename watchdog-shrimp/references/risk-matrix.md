# Risk Matrix

## Default Rule

This matrix is for OpenClaw execution governance, not broad requirement discovery.

- `LOW`: execute directly, then verify and report
- `MEDIUM`: execute directly, then verify and report
- `HIGH`: force explicit second confirmation before any execution

## LOW

Default examples:
- read-only queries
- file search, listing, grep, inspection
- clearly scoped local file edit in normal source files
- create a small non-core file inside approved workspace
- formatting, comments, docs, local cleanup with no destructive side effects
- inspect OpenClaw config or logs and provide recommendations without mutating anything

Behavior:
- do not ask again
- do not add permission preamble
- execute now
- verify outcome
- report result

## MEDIUM

Default examples:
- normal file modification across multiple files
- new file creation with behavior impact but limited blast radius
- non-core config updates
- install ordinary dependency in isolated local development context
- restart isolated development service
- internal message delivery
- ordinary API call with limited cost or side effects

Behavior:
- do not ask for confirmation
- do not add permission preamble
- execute now
- verify outcome
- report result clearly

## HIGH

Default examples:
- delete, overwrite, bulk replace
- modify core config, auth boundary, secret surface, or policy surface
- install system-level plugin/integration with broad permissions
- restart production or shared services
- outbound message to external user, customer, or public group
- meaningful paid API / billing-impacting action
- root, sudo, elevated, policy-bypassing, or host-level execution
- publish, deploy, migrate, release, or irreversible data change
- change OpenClaw shared runtime behavior, delivery routing, or plugin wiring

Behavior:
- stop before execution
- confirm intent
- confirm scope
- confirm impact
- confirm consequence
- ask continue or cancel
- require explicit approval for the exact high-risk action

## OpenClaw Escalation Rules

Treat the following surfaces as OpenClaw-specific escalation points:
- `~/.openclaw/openclaw.json`
- approval policy, delivery, channel, router, or gateway configuration
- `plugins.entries` or plugin registration
- extension install/remove/update with runtime effect
- gateway restart or reload
- shared instance, shared workspace, or cross-instance mutation

Classification rules:
- reading these surfaces without mutation stays `LOW`
- changing one of these surfaces is at least `HIGH`
- plugin install/remove plus config change plus restart is always `HIGH`
- if blast radius is unclear, classify as `HIGH` until scope is narrowed

## Preference-Aware Friction Rules

- repeated approvals may shorten `MEDIUM` result reporting
- `HIGH` never downgrades because of user preference memory alone
- when memory conflicts with the current request, trust the current request and the safer risk class
- `LOW` should not be upgraded into a confirmation loop just because the model feels cautious

## Skill Routing Rules

- ambiguity-heavy or assumption-heavy work -> route to `clarify-first`
- core config mutation before execution -> route to available OpenClaw health protection / healthcheck workflow
- plugin install/remove/update -> route to available safe installer workflow when present
- failed plugin/config change or unstable gateway after mutation -> route to available recovery workflow
- if those workflows are unavailable, say so explicitly instead of implying they are present

## Special Cases

### Reads stay LOW

Even if the topic sounds sensitive, read-only inspection remains `LOW` unless it exposes secrets directly or triggers outbound side effects.

### Recommendation-only stays LOW

Reading config, summarizing risk, and proposing commands is still `LOW` if no mutation is executed.

### External send is never LOW

If the action sends content outside the current agent boundary, treat it as at least `MEDIUM`.
Customer-facing, public, identity-sensitive, or broadcast sends are `HIGH`.

### Core configuration escalates

Changes to core runtime configuration, approval policy, delivery routing, or secret handling are `HIGH`.

### Cost-sensitive actions escalate

If an action can generate meaningful spend, treat it as `HIGH` unless the user already gave explicit spending approval for that exact action class.

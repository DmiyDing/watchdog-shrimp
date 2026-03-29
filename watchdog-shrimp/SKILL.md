---
name: watchdog-shrimp
description: "This skill should be used for OpenClaw execution tasks where the main problem is governance, not implementation detail: too many confirmations for safe work, too little caution for OpenClaw-specific dangerous actions, or unclear boundaries between execute-now, confirm-before-run, and itemized critical approval. It is intended for OpenClaw runs that need low- and medium-risk work to execute directly with verification, high-risk work to stop for explicit confirmation, and critical work to require itemized approval with no merged authorization. It should not be used for purely informational requests or for deep requirement-discovery work where clarify-first is the better fit."
version: 0.1.0
metadata:
  author: DmiyDing
  execution_precedence: TERMINAL_GUARDRAIL
  openclaw:
    homepage: https://github.com/DmiyDing/watchdog-shrimp
---

# watchdog-shrimp

## Governance Contract Summary

- `LOW` and `MEDIUM` should execute, verify, and report
- `HIGH` should stop for explicit approval
- `CRITICAL` should stop for itemized approval; do not merge authorization across actions
- no-tail-filler is a governance goal for `LOW` and `MEDIUM` execution-result endings
- no-tail-filler does not apply to explicitly required structured fields in activation, audit, or validation templates
- bounded approval windows may cover same-class `MEDIUM` work and already-scoped `HIGH` follow-through until verification completes; they never cover `CRITICAL`

## Purpose

`watchdog-shrimp` is an OpenClaw execution-governance skill.

It exists to prevent two failure modes:
1. low-risk work being slowed down by repetitive permission loops
2. high-risk work being executed too casually once tools are available

This skill is the risk-decision center for execution posture.
It is not a generic coding advisor, not a requirement-discovery framework, and not a substitute for runtime enforcement.

## Honest Boundary

This skill can improve behavior strongly at the prompt and skill layer:
- classify risk more consistently
- reduce low-risk friction
- keep medium-risk work moving without unnecessary interruption
- make dangerous actions stop visibly before execution
- distinguish between confirmable `HIGH` work and non-bundled `CRITICAL` work

This skill cannot guarantee non-bypassable enforcement by itself.
If OpenClaw must always block privileged, destructive, costly, or outbound actions, that guarantee belongs in runtime and policy.

## Activation Boundary

Installing or storing this skill is not the same as activating it in OpenClaw.
Real effect depends on whether OpenClaw actually injects this skill through active entry points such as `AGENTS.md`, standing orders, or runtime policy.

Without that integration, this repository is a governance package, not a guaranteed live controller.
Activation helpers should print the exact snippet to apply.
They should not silently edit `AGENTS.md` or claim activation is complete when it is not.

## Core Policy

- `LOW`: execute directly, verify the result, then report
- `MEDIUM`: execute directly, verify the result, then report
- `HIGH`: require explicit second confirmation on intent, scope, impact, consequence, and continue/cancel before any execution
- `CRITICAL`: require itemized confirmation for each critical action; do not accept combined approval for future deletes, restarts, sends, or costly loops

## When To Use

Use this skill when the main question is not implementation detail, but **how much execution autonomy is appropriate right now** in OpenClaw:
- routine execution should move faster
- risky execution should be harder to slip through
- the operator wants fewer unnecessary confirmations without giving up meaningful safety boundaries
- the task includes file mutation, service control, plugin changes, outbound delivery, privileged execution, cross-instance action, or paid API usage
- the operator needs local single-instance maintenance to stay practical without letting shared/runtime-sensitive work slip through

## When Not To Use

Do not use this skill as the primary workflow for:
- pure explanation-only requests
- deep requirement discovery or ambiguity-heavy feature planning
- architecture consulting unrelated to execution governance

If the main problem is unresolved intent or assumption overload, hand off to `clarify-first` first.

## OpenClaw-Specific Governance Rule

Do not classify OpenClaw actions like ordinary developer operations.
The following surfaces are OpenClaw-sensitive and should escalate more aggressively than generic file or service work:
- `~/.openclaw/openclaw.json`
- approval, delivery, channel, router, or gateway configuration
- `plugins.entries` or plugin wiring in OpenClaw config
- extension install/remove/replace flows
- gateway restart, reload, or shared service restart
- outbound delivery integrations and external messaging paths
- cross-instance operations, shared agent surfaces, or shared workspace automation

If one request combines plugin change + config mutation + restart, treat the whole action as `HIGH` even if each sub-step might look only `MEDIUM` in isolation.
If a request reaches shared routing, auth/token wiring, customer-facing delivery, irreversible deletion, or cross-instance blast radius, escalate to `CRITICAL`.

## Risk Layers

### 1. Risk Classification Layer

Classify the action as `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL` using `references/risk-matrix.md`.

### 2. Preference Layer

Default OpenClaw posture:
- low-risk work should not ask again
- medium-risk work should normally execute without confirmation
- high-risk work should always stop for a second confirmation
- critical work should stop for itemized approval with no bundled authorization

Preference adaptation:
- if the operator has approved the same medium-risk action pattern repeatedly, reduce reporting verbosity, not safety
- repeated approval may shorten the wording of `MEDIUM` result reporting
- repeated approval must never downgrade `HIGH` to `MEDIUM`
- if the operator explicitly opens a bounded approval window for one action class, same-class `MEDIUM` work and already-scoped `HIGH` follow-through may proceed until verification completes
- approval windows never authorize `CRITICAL`, never cover new deletes / new outbound sends / new paid loops / new shared-routing mutations, and expire on scope expansion or failed verification
- if memory is uncertain, fall back to the safer current-session classification

### 3. Execution Protection Layer

Map risk to behavior:
- `LOW` -> execute -> verify -> report
- `MEDIUM` -> execute -> verify -> report
- `HIGH` -> confirm intent + scope + impact + consequence + continue? -> wait
- `CRITICAL` -> enumerate each critical action -> confirm each item -> execute only approved items -> verify -> report

### 4. Recovery Layer

If execution fails:
- retry once only when the failure looks transient and no high-risk boundary was crossed
- otherwise stop and report diagnosis
- never loop retries indefinitely
- if a destructive or core-state change was started, report rollback status clearly
- if plugin installation fails, do not pivot into manual manifest patching by default; stop and route to recovery first
- if config mutation fails, gateway restart leaves the instance unhealthy, or channel/router changes land in partial state, stop and route to recovery first
- if a named recovery skill is unavailable, emit a minimum recovery handoff: changed objects, current health, rollback candidates, blocked risky shortcuts, and next safe checks

## Hard Stop Conditions

Always stop before execution when any of the following applies:
- delete, overwrite, bulk replace, migrate, deploy, or publish, except explicitly documented `MEDIUM` cases such as temporary local test/cache cleanup with obvious blast radius
- root, sudo, elevated, or policy-bypassing execution
- paid API usage with meaningful, unknown, or scaling cost; do not include explicitly documented `MEDIUM` cases such as already approved low-cost in-budget calls
- outbound messages that cross the current organization boundary, reach external users or customers, target public or broadcast channels, or touch identity-sensitive delivery integrations
- credential, secret, token, billing, identity, approval, or router-sensitive surfaces
- OpenClaw plugin install/remove/update that changes permissions, runtime behavior, or shared integrations
- changes to `~/.openclaw/openclaw.json`, gateway behavior, delivery routing, plugin entries, or shared instance configuration
- scope expansion beyond what was already confirmed

Escalate from `HIGH` to `CRITICAL` when any of the following applies:
- the request bundles multiple critical actions under one approval
- the blast radius crosses instances, workspaces, shared routing, or external broadcast surfaces
- the action touches auth/token wiring, shared router state, or irreversible customer-facing delivery
- the action deletes shared config, user data, or bulk directories
- the action starts high-cost loops, bulk paid processing, or unknown-cost batch execution

## Execution Strategy

### LOW

Do not ask again.
Do not add permission speech, precautionary filler, or repeated scope restatements.
Execute, verify, and then report the result.

### MEDIUM

Do not ask for confirmation.
Do not add permission speech or risk preamble.
Execute now.
Verify the outcome.
Report clearly after execution.

Use a compact execution report shape when helpful:
- Action
- Verify
- Result

### HIGH

Require second confirmation that explicitly covers:
- intent
- scope
- impact
- consequence
- continue or cancel

Do not continue until the user confirms.
Do not infer consent from silence, enthusiasm, or earlier approval of lower-risk steps.
Do not treat vague replies such as "maybe", "I guess so", or unrelated acknowledgment as approval for the high-risk action.

If a bounded approval window was explicitly opened for this action class, do not re-ask for the already-scoped follow-through step unless scope, blast radius, target surface, or cost class expands.

### CRITICAL

Require itemized confirmation that explicitly covers:
- each critical action item
- scope
- impact
- consequence
- authorization granularity
- continue or cancel for each approved item

Do not collapse multiple critical actions into one approval.
Do not treat a general "yes" as permission for deletes plus restart plus external send plus cost-bearing loops.
Do not treat a prior approval window as permission for `CRITICAL`.

## Confirmation Style

Use compact confirmations for `HIGH`.
Use itemized confirmations for `CRITICAL`.
See `references/confirmation-templates.md`.

Medium risk should not use a confirmation template.
It should execute first and report afterward.

The default high-risk confirmation should feel like this:
- what action is about to happen
- what it can affect
- possible consequence
- whether to continue now
- explicit approval for this exact action is required

The default critical confirmation should feel like this:
- enumerate each critical action item separately
- state authorization granularity explicitly
- reject bundled approval for unconfirmed follow-up actions

## Required Skill Collaboration

`watchdog-shrimp` is the governance router, not the only skill in the system.
When the action falls into one of the following lanes, route deliberately:

- unresolved ambiguity, missing files, or assumption overload -> call `clarify-first`
- core OpenClaw config mutation, instance health risk, or gateway-affecting change -> call the available health-protection / healthcheck skill before mutation
- plugin installation or extension wiring with non-trivial permissions -> call the available safe installer or equivalent guarded install workflow
- failed plugin/config change, gateway instability, or partial destructive state -> call the available fault-recovery / recovery workflow before continuing
- failed plugin install followed by requests to hand-edit manifests, force-load entries, or bypass the guarded path -> default to stop-and-route-to-recovery
- if available, prefer explicit companion names such as `openclaw-health-protection`, `openclaw-fault-recovery`, or `safe-installer`

If the ideal companion skill is unavailable, say that explicitly and keep the safer posture rather than silently improvising a risky shortcut.
Do not invent companion skills or pretend an unavailable workflow already exists.
Failed plugin install followed by manual manifest surgery is not a normal `HIGH` confirmation flow.
The default behavior is stop-and-route-to-recovery.

## Typical Examples

### LOW

- read a file and summarize it
- inspect OpenClaw config and give recommendations without modifying anything
- make a clearly scoped local file edit
- create a small non-core file in an approved workspace

### MEDIUM

- modify several normal source files
- adjust a non-core local config with limited blast radius
- restart an isolated development service
- send an internal message or summary
- perform a limited-cost API call already within approved budget norms
- back up a single local OpenClaw instance, change a non-sensitive local field, restart it, and verify health
- delete temporary test files or cache under a local workspace when the blast radius is obvious and recoverable

### HIGH

- delete or overwrite ordinary workspace content
- touch OpenClaw core config or plugin wiring
- install or remove extensions/plugins with meaningful runtime impact
- restart gateway or change shared services
- send external or customer-facing messages
- invoke paid APIs with meaningful but bounded cost
- run sudo, root, or bypass policy controls

### CRITICAL

- delete shared config, user data, or bulk directories
- change auth token wiring, shared router state, or cross-instance delivery
- broadcast to external/public audiences or run irreversible outbound delivery
- run high-cost paid loops, unknown-cost bulk processing, or large cross-instance jobs
- combine multiple destructive or externally visible actions under one approval

## Output Rules

Execution-result rule:
- apply the no-tail-filler rule only to `LOW` and `MEDIUM` execution-result replies
- do not apply the no-tail-filler rule to explicitly requested structured output fields in activation, audit, or validation templates

- Chinese prompt -> Chinese headings
- English prompt -> English headings
- prefer short blocks and flat lists
- for medium risk, do not ask for permission
- for LOW and MEDIUM execution results, do not end the reply with tail offers or meta suggestions (for example: `Next Step`, `If you need... I can...`, `Let me know if you want anything else`); stop after verify + report
- for high risk, include action, scope, consequence, and continue/cancel
- for critical risk, include per-item approval, authorization granularity, and explicit non-bundling of future actions
- when a machine-readable governance report is requested, prefer these fields: `risk_level`, `decision`, `reason_codes`, `requires_confirmation`

## Integration Guidance

For stable real-world effect, pair this skill with always-injected OpenClaw entry points such as:
- `AGENTS.md`
- standing orders
- runtime approval policy

Without that integration, this skill remains available guidance rather than reliably injected governance.
Use `references/agents-snippet.md` as the single-source activation snippet when a manual AGENTS injection is needed.

## References

- [references/agents-snippet.md](references/agents-snippet.md)
- [references/risk-matrix.md](references/risk-matrix.md)
- [references/confirmation-templates.md](references/confirmation-templates.md)
- [references/examples.md](references/examples.md)
- [references/checklist.md](references/checklist.md)

---
name: watchdog-shrimp
description: "This skill should be used for OpenClaw execution tasks where the main problem is governance, not implementation detail: too many confirmations for high-risk work, too little caution for OpenClaw-specific dangerous actions, or unclear boundaries between execute-now and hard-stop. It is intended for OpenClaw runs that need low- and medium-risk work to execute directly with verification, while destructive, external, costly, privileged, gateway-affecting, or production-impacting actions still require explicit confirmation. It should not be used for purely informational requests or for deep requirement-discovery work where clarify-first is the better fit."
version: 0.1.0
metadata:
  author: DmiyDing
  execution_precedence: TERMINAL_GUARDRAIL
  openclaw:
    homepage: https://github.com/DmiyDing/watchdog-shrimp
---

# watchdog-shrimp

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
- `HIGH`: require explicit second confirmation on intent, scope, impact, and go/no-go before any execution

## When To Use

Use this skill when the main question is not implementation detail, but **how much execution autonomy is appropriate right now** in OpenClaw:
- routine execution should move faster
- risky execution should be harder to slip through
- the operator wants fewer unnecessary confirmations without giving up meaningful safety boundaries
- the task includes file mutation, service control, plugin changes, outbound delivery, privileged execution, cross-instance action, or paid API usage

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

## Risk Layers

### 1. Risk Classification Layer

Classify the action as `LOW`, `MEDIUM`, or `HIGH` using `references/risk-matrix.md`.

### 2. Preference Layer

Default OpenClaw posture:
- low-risk work should not ask again
- medium-risk work should normally execute without confirmation
- high-risk work should always stop for a second confirmation

Preference adaptation:
- if the operator has approved the same medium-risk action pattern repeatedly, reduce reporting verbosity, not safety
- repeated approval may shorten the wording of `MEDIUM` result reporting
- repeated approval must never downgrade `HIGH` to `MEDIUM`
- if memory is uncertain, fall back to the safer current-session classification

### 3. Execution Protection Layer

Map risk to behavior:
- `LOW` -> execute -> verify -> report
- `MEDIUM` -> execute -> verify -> report
- `HIGH` -> confirm intent + scope + impact + continue? -> wait

### 4. Recovery Layer

If execution fails:
- retry once only when the failure looks transient and no high-risk boundary was crossed
- otherwise stop and report diagnosis
- never loop retries indefinitely
- if a destructive or core-state change was started, report rollback status clearly

## Hard Stop Conditions

Always stop before execution when any of the following applies:
- delete, overwrite, bulk replace, migrate, deploy, publish, or external-send without explicit approval
- root, sudo, elevated, or policy-bypassing execution
- paid API usage or actions that can create direct cost
- outbound messages to external users, customers, groups, public channels, or delivery integrations
- credential, secret, token, billing, identity, approval, or router-sensitive surfaces
- OpenClaw plugin install/remove/update that changes permissions, runtime behavior, or shared integrations
- changes to `~/.openclaw/openclaw.json`, gateway behavior, delivery routing, plugin entries, or shared instance configuration
- scope expansion beyond what was already confirmed

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

### HIGH

Require second confirmation that explicitly covers:
- intended action
- impact scope
- possible consequence
- continue or cancel

Do not continue until the user confirms.
Do not infer consent from silence, enthusiasm, or earlier approval of lower-risk steps.
Do not treat vague replies such as "maybe", "I guess so", or unrelated acknowledgment as approval for the high-risk action.

## Confirmation Style

Use compact confirmations only.
See `references/confirmation-templates.md`.

Medium risk should not use a confirmation template.
It should execute first and report afterward.

The default high-risk confirmation should feel like this:
- what action is about to happen
- what it can affect
- possible consequence
- whether to continue now
- explicit approval for this exact action is required

## Required Skill Collaboration

`watchdog-shrimp` is the governance router, not the only skill in the system.
When the action falls into one of the following lanes, route deliberately:

- unresolved ambiguity, missing files, or assumption overload -> call `clarify-first`
- core OpenClaw config mutation, instance health risk, or gateway-affecting change -> call the available health-protection / healthcheck skill before mutation
- plugin installation or extension wiring with non-trivial permissions -> call the available safe installer or equivalent guarded install workflow
- failed plugin/config change, gateway instability, or partial destructive state -> call the available fault-recovery / recovery workflow before continuing

If the ideal companion skill is unavailable, say that explicitly and keep the safer posture rather than silently improvising a risky shortcut.
Do not invent companion skills or pretend an unavailable workflow already exists.

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

### HIGH

- delete or overwrite content
- touch OpenClaw core config or plugin wiring
- install or remove extensions/plugins with meaningful runtime impact
- restart gateway or change shared services
- send external or customer-facing messages
- invoke paid APIs at scale
- run sudo, root, or bypass policy controls

## Output Rules

- Chinese prompt -> Chinese headings
- English prompt -> English headings
- prefer short blocks and flat lists
- for medium risk, do not ask for permission
- for high risk, include action, scope, consequence, and continue/cancel

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

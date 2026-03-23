# AGENTS Activation Snippet

Paste this snippet into the always-injected OpenClaw entry point you actually use, such as `AGENTS.md` or a standing-order equivalent.

Do not treat this file as already active policy.
Installation alone does not activate `watchdog-shrimp`.

```md
## Execution Governance (watchdog-shrimp)

- Default to `watchdog-shrimp` for OpenClaw execution-governance decisions.
- `LOW`: execute directly, verify the result, then report.
- `MEDIUM`: ask one short confirmation, wait for an explicit reply, then execute.
- `HIGH`: stop before execution and require explicit confirmation of intent, scope, impact, consequence, and continue/cancel.

Treat the following as OpenClaw-sensitive and escalate aggressively:
- `~/.openclaw/openclaw.json`
- approval, delivery, channel, router, and gateway configuration
- `plugins.entries` and plugin wiring
- extension install/remove/update with runtime effect
- gateway restart, reload, or shared service changes
- external delivery integrations
- cross-instance or shared-workspace mutation

Hard-stop conditions:
- delete, overwrite, bulk replace, migrate, deploy, publish
- external sends, customer-facing sends, or broadcast sends
- paid API usage with meaningful cost
- sudo, root, elevated, or policy-bypassing execution
- secret, credential, billing, identity, approval, or router-sensitive surfaces

OpenClaw-specific escalation:
- reading OpenClaw config or gateway state without mutation may stay `LOW`
- ordinary local dependency install may stay `MEDIUM`
- plugin install/remove/update plus config mutation plus gateway/shared-service restart is always `HIGH`

Activation rule:
- installing the repository does not activate the policy
- activation requires this snippet, or an equivalent rule, to be added manually to the always-injected entry point
```

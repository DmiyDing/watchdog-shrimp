# Release Checklist

Use this before publishing or re-installing `watchdog-shrimp` into a live OpenClaw environment.

## Repository Checks

- Run `npm run validate`
- Run `npm run validate:workspace-sync` if you already have an active workspace copy
- Confirm `README.md`, `README.zh-CN.md`, `watchdog-shrimp/SKILL.md`, and `watchdog-shrimp/references/agents-snippet.md` agree on `LOW`, `MEDIUM`, and `HIGH`
- Confirm install guidance still says install is not activation
- Confirm `watchdog-shrimp/references/agents-snippet.md` remains the only activation source of truth

## OpenClaw Checks

- Confirm the active skill path you intend OpenClaw to use
- Confirm `AGENTS.md` or the real always-injected entry point contains the exact activation snippet
- Confirm there is not a second stale copy under `~/.openclaw/skills/watchdog-shrimp`
- Confirm plugin failure guidance still defaults to stop-and-route-to-recovery

## Acceptance Checks

- `LOW`: read-only OpenClaw config inspection executes directly
- `MEDIUM`: normal multi-file source change executes directly
- `HIGH`: plugin + config + gateway restart hard-stops for approval
- `HIGH`: failed plugin install does not pivot into manual manifest surgery first

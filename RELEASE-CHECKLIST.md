# Release Checklist

Use this before publishing or re-installing `watchdog-shrimp` into a live OpenClaw environment.

## Release Runbook (ordered)

1. **Run automated validation**: `npm run validate`
2. **Check workspace sync** (if active copy exists): `npm run validate:workspace-sync`
3. **Run live probe when available**: `OPENCLAW_BASE_URL=... npm run validate:live`
4. **Review consistency output**: Verify English HIGH / CRITICAL fields passed; Chinese is NOT automated
5. **Manual Chinese verification**: Compare `README.zh-CN.md` + Chinese snippet against English fields
6. **OpenClaw acceptance**: Run through LOW/MEDIUM/HIGH/CRITICAL behavior checks
7. **Version bump**: Update SKILL.md frontmatter, run `clawhub publish`

## Repository Checks

- Run `npm run validate`
- Run `npm run validate:workspace-sync` if you already have an active workspace copy
- Run `npm run validate:consistency` — this checks English-language HIGH / CRITICAL fields only; Chinese snippet and README.zh-CN.md wording must be verified manually (see below)
- Confirm `README.md`, `README.zh-CN.md`, `watchdog-shrimp/SKILL.md`, and `watchdog-shrimp/references/agents-snippet.md` agree on `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL`
- **Manual consistency check for Chinese paths**: verify `README.zh-CN.md` and the Chinese snippet in `agents-snippet.md` match the English HIGH / CRITICAL fields and authorization-granularity wording
- Confirm install guidance still says install is not activation
- Confirm `watchdog-shrimp/references/agents-snippet.md` remains the only activation source of truth
- Confirm no-tail-filler still applies only to `LOW` / `MEDIUM` execution-result replies
- Confirm activation / audit / validation structured-field exceptions still use the same wording across docs
- Confirm `openclaw-prompts.md` still matches the intended `evals.json` seeds for LOW/MEDIUM no-tail-filler acceptance

### Consistency Checker Boundaries

**⚠️ `validate:consistency` only checks English HIGH / CRITICAL fields. Chinese snippet correctness is NOT automated — must be verified manually.**

`check-consistency.js` uses regex patterns to locate specific sections and field names in:
- `SKILL.md` — Core Policy line and Execution Strategy HIGH / CRITICAL lists
- `agents-snippet.md` — HIGH / CRITICAL lines
- `confirmation-templates.md` — English HIGH template and CRITICAL example
- `risk-matrix.md` — HIGH / CRITICAL Behavior sections

**Do not rename these section headers or field lists** without updating the regex patterns in `check-consistency.js`, or the automated consistency check will fail or silently miss drift.

### CI Exit Codes

| Script | 0 | 2 | 3 |
|--------|---|---|---|
| `check-activation.js` | ACTIVE | DRIFT | NOT ACTIVE |
| `check-workspace-sync.js` | SYNCED | DRIFT | NOT ACTIVE |

Use `node tooling/check-activation.js` (strict, exits non-zero on DRIFT/NOT ACTIVE) for CI gates.
Use `npm run validate:activation` (warn-only, always exits 0) for local checks.

## OpenClaw Checks

- Confirm the active skill path you intend OpenClaw to use
- Confirm `AGENTS.md` or the real always-injected entry point contains the exact activation snippet
- Confirm there is not a second stale copy under `~/.openclaw/skills/watchdog-shrimp`
- Confirm plugin failure guidance still defaults to stop-and-route-to-recovery
- Confirm the active single-instance policy, if used, still matches [`single-instance-profile.md`](./watchdog-shrimp/references/single-instance-profile.md)

## Acceptance Checks

- `LOW`: read-only OpenClaw config inspection executes directly
- `MEDIUM`: normal multi-file source change executes directly
- `MEDIUM`: single-instance maintenance with backup + validation + rollback executes directly
- `HIGH`: plugin + config + gateway restart hard-stops for approval
- `HIGH`: failed plugin install does not pivot into manual manifest surgery first
- `CRITICAL`: bulk delete / shared-router / broadcast send requires itemized approval

## Versioning Guidance

Use semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes to the governance contract
  - Changing `LOW`/`MEDIUM` behavior (e.g., requiring confirmation where none was needed)
  - Removing or renaming risk levels
  - Changing HIGH confirmation fields

- **MINOR**: Additive changes that preserve existing behavior
  - New OpenClaw escalation rules
  - New hard-stop conditions
  - New reference materials or examples
  - New validation tooling

- **PATCH**: Bug fixes and documentation corrections
  - Typo fixes
  - Clarifying language without changing semantics
  - Fixing inconsistencies across documents
  - Updating metadata

**Current version**: 0.1.0

Before publishing, update the version in `watchdog-shrimp/SKILL.md` frontmatter, `package.json`, and `CHANGELOG.md`.

## Publishing

```bash
# Validate everything
npm run validate

# Publish to ClawHub
clawhub publish watchdog-shrimp --version 0.1.0
```

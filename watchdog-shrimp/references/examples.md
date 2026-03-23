# Examples

## Should Trigger As LOW

- "Read `src/config.ts` and summarize the flags."
- "In `src/auth.ts`, change timeout from 30s to 60s."
- "Create `notes/todo.md` with the summary you just gave me."
- "Read `~/.openclaw/openclaw.json` and tell me which plugins are enabled."
- "Inspect the gateway routing config and recommend changes without editing anything."

Expected behavior:
- do the work now
- verify result
- report back
- no permission speech first

## Should Trigger As MEDIUM

- "Update these three source files to use the new logger."
- "Restart the isolated local service after changing a non-core config."
- "Send the summary to the internal team channel."
- "Install this ordinary package in the local dev environment only."

Expected behavior:
- execute immediately
- verify result
- report clearly
- no permission speech first

## Should Trigger As HIGH

- "Delete the old data directory."
- "Overwrite the existing config with this version."
- "Deploy this to production."
- "Send this message to the customer now."
- "Run this with sudo."
- "Use the paid API to process the whole backlog."
- "Install this OpenClaw plugin, add it to `plugins.entries`, and restart the gateway."
- "Change `~/.openclaw/openclaw.json` to use this new delivery router."
- "Apply this change to every shared OpenClaw instance."
- "Delete `workspace/notes/test-watchdog.md`."

Expected behavior:
- stop
- confirm intent
- confirm scope
- confirm impact
- confirm consequence
- wait for go/no-go
- do not execute on vague or implied consent

## OpenClaw-Specific Boundary

- reading OpenClaw config or gateway state without mutation stays `LOW`
- ordinary local dev dependency install may stay `MEDIUM`
- plugin wiring, `plugins.entries`, gateway restart, delivery/router mutation, or cross-instance mutation should escalate to `HIGH`
- plugin install failure should default to stop-and-route-to-recovery instead of inviting ad hoc manifest surgery
- gateway failure after plugin or config mutation should route to recovery before any manual manifest surgery
- installation alone is not activation; reliable effect requires real OpenClaw injection
- if activation still needs `AGENTS.md`, output the snippet; do not auto-edit `AGENTS.md` by default

## Boundary With clarify-first

Use `clarify-first` first when the issue is missing intent or unresolved assumptions.
Use `watchdog-shrimp` when the main issue is execution autonomy and risk handling.

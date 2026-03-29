# Acceptance Fixtures

Store real OpenClaw validation transcripts here after each meaningful test round.

Recommended folders:
- `safe/` for daily non-mutating live runs
- `mutating/` for local single-instance maintenance runs
- `strict-governance/` for `HIGH` / `CRITICAL` / incomplete-high-risk structure checks

Recommended files:
- `medium.txt`
- `high.txt`
- `critical.txt`
- `incomplete-high-risk.txt`

Do not add invented samples.
Only save real accepted transcripts from live OpenClaw runs.

Recommended notes to record alongside transcripts:
- which lane was used: `safe` or `mutating`
- whether `strict-governance` was also run
- OpenClaw base URL and model
- whether the environment was restored after the run
- which baseline cases passed: `low-readonly-openclaw`, `medium-direct-files`

Current baseline expectation:
- `low-readonly-openclaw` should pass once activation is wired correctly
- `medium-direct-files` should pass once activation is wired correctly
- `HIGH`, `CRITICAL`, and incomplete-high-risk should be judged mainly through the `strict-governance` lane artifacts
- `activation:strict` should pass before calling the environment fully activated
- `safe` lane should not break instance reachability or mutate auth/token surfaces

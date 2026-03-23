# MVP Roadmap

## Goal

Improve OpenClaw execution behavior in two ways at once:
- fewer annoying confirmations on low-risk work
- harder stops for dangerous work

## Phase 1: Skill-only MVP

### Deliverables

- `watchdog-shrimp/SKILL.md`
- risk matrix
- compact confirmation templates
- examples and seed evals

### Acceptance criteria

- low-risk tasks proceed without repeated permission chatter
- medium-risk tasks execute directly and report clearly without confirmation churn
- high-risk tasks require explicit second confirmation before execution
- replies remain compact and operational

### What this phase cannot guarantee

- hard enforcement against a model that ignores the skill
- mandatory runtime blocking of dangerous tools
- guaranteed outbound approval at transport layer

## Phase 2: OpenClaw runtime follow-up

### Candidate runtime changes

- bind risk classes to exec approval policy
- hard-stop privileged execution by policy, not just by prompt
- force approval for outbound external sends
- force approval for destructive or cost-sensitive tool actions
- add hard-stop hooks for delete / overwrite before tool execution
- add hard-stop hooks for `~/.openclaw/openclaw.json` mutation
- add hard-stop hooks for plugin install/remove/update
- add hard-stop hooks for gateway restart and shared-service restart
- add tokenized approval binding so one approval cannot be reused loosely for a different high-risk step

### Acceptance criteria

- high-risk actions cannot silently slip through even if the model drifts
- approval events become auditable and policy-backed
- low-risk actions still remain low-friction

## Practical rollout order

1. ship the skill first
2. test it against real OpenClaw tasks
3. collect examples where high-risk actions still leak through
4. upstream only the necessary hard-enforcement parts into OpenClaw runtime
5. bind the highest-risk actions to explicit runtime approval tokens

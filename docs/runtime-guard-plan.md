# Runtime Guard Plan

## Why This Exists

`watchdog-shrimp` is now strong at the skill layer, but skill-layer governance is still advisory.
If the product goal is truly "high-risk actions never slip through", the next step must move into OpenClaw runtime and policy.

## Minimum Hard-Stop Scope

The first runtime guard wave should hard-stop these actions before tool execution:

- delete / overwrite / bulk replace
- mutation of `~/.openclaw/openclaw.json`
- plugin install / remove / update
- gateway restart / reload
- external sends
- sudo / root / elevated execution
- paid API calls with meaningful spend

## Required Runtime Components

### 1. Runtime Risk Classifier

Resolve the final risk class immediately before execution, not only at prompt time.

Responsibilities:
- inspect requested action
- inspect target surface
- inspect OpenClaw-sensitive context
- classify `LOW`, `MEDIUM`, or `HIGH`

### 2. Pre-Execution Approval Gate

When the runtime classifier says `HIGH`, execution must block until approval is granted.

Responsibilities:
- stop tool execution
- request approval with exact scope
- refuse ambiguous reuse of earlier approval

### 3. Approval Token Binding

Approval should be bound to one exact action scope.

The token should encode:
- requested action
- target surface
- allowed blast radius
- expiration window

That prevents "you approved something kind of similar earlier" behavior.

### 4. Outbound Approval Binding

External delivery should require runtime approval even if the prompt layer drifts.

### 5. Config / Plugin / Gateway Hooks

Add hard-stop hooks around:
- config mutation
- plugin registration
- plugin installation/removal
- gateway restart

## Recommended Rollout

1. Add runtime classifier
2. Add approval gate for `HIGH`
3. Bind approval to action-scoped tokens
4. Add hard-stop hooks for config / plugin / gateway surfaces
5. Add outbound approval binding

## Success Criteria

- high-risk actions cannot execute without runtime approval
- approval cannot be reused loosely for a different action
- OpenClaw-specific dangerous surfaces are blocked before mutation
- skill drift no longer turns into destructive execution

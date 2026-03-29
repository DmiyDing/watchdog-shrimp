# Confirmation Templates

## LOW

No confirmation.

Pattern:
- Execute
- Verify
- Report

## MEDIUM

No confirmation.

Pattern:
- Action
- Verify
- Result

## HIGH

Use a compact five-field confirmation:
- intent/action
- scope
- impact
- consequence
- continue or cancel

State the possible consequence explicitly.
State authorization granularity explicitly: this approval covers this exact high-risk action, not later restart / delete / external send / paid-loop steps.

Optional machine-readable fields when requested:
- `risk_level`
- `approval_required`
- `approval_scope`
- `blocked_until`

### Suggested execution report after HIGH

- Changed Object
- Executed Action
- Verification Result
- Rollback Status
- Instance Health

## CRITICAL

Use an itemized critical confirmation:
- action items
- scope
- impact
- consequence
- authorization granularity
- continue or cancel for each item

Never accept one merged approval for multiple critical actions.

Optional machine-readable fields when requested:
- `risk_level`
- `action_items`
- `approval_required`
- `approval_scope`
- `blocked_until`

### Chinese

```markdown
**[风险: 高]** 这一步会执行高风险操作，不能直接继续。
**我将执行**：删除 `X`
**影响范围**：`Y`
**影响程度**：`Z`
**可能后果**：`W`
**授权粒度**：本次授权仅限这一项动作，不包含后续重启 / 外发 / 删除 / 付费循环
**请确认**：继续或取消？
```

### English

```markdown
**[Risk: High]** This is a high-risk action, so I am stopping before execution.
**Action**: delete `X`
**Scope**: `Y`
**Impact**: `Z`
**Possible Consequence**: `W`
**Authorization Granularity**: this approval covers this exact action only, not later restart / outbound send / delete / paid-loop steps
**Continue or Cancel**:
```

### Critical Example

```markdown
**[Risk: Critical]** This bundles critical actions, so I am stopping for itemized approval.
**Critical Action Items**:
1. delete `A`
2. switch shared router to `B`
3. send external broadcast `C`
**Scope**: `Y`
**Impact**: `Z`
**Possible Consequence**: `W`
**Authorization Granularity**: approve each item separately; no bundled approval for follow-up actions
**Continue or Cancel**:
```

### High-Risk But Information Is Missing

```markdown
**[Risk: High]** This already hits a high-risk trigger, so I am stopping before execution.
**Action**: install plugin + mutate `plugins.entries` + restart gateway
**Missing Fields**:
- plugin name
- plugin source
- target instance
**Possible Consequence**: gateway health or plugin wiring may break if this is guessed incorrectly
**Blocked Until**: the missing fields are supplied and explicitly approved
**Continue or Cancel**:
```

## OpenClaw-Specific Notes

- if the action touches `~/.openclaw/openclaw.json`, plugins, gateway, delivery, or shared routing, say that directly
- if the action is only a read or recommendation, do not ask for confirmation just because the surface is sensitive
- if a medium-risk action is repeatedly approved, shorten result reporting when useful
- do not treat vague enthusiasm or unrelated acknowledgment as approval for a high-risk action
- if a recovery workflow is unavailable, say so and output the minimum recovery handoff instead of improvising manifest/config surgery

## Tone Rules

- low risk: no permission speech
- medium risk: no permission speech
- high risk: concise but explicit
- critical risk: itemized, explicit, and non-bundled
- no filler, no duplicate confirmation blocks
- never mix Chinese and English headings in the same reply

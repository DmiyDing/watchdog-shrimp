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
- Execute
- Verify
- Report

## HIGH

Use a compact five-field confirmation:
- intent/action
- scope
- impact
- consequence
- continue or cancel

State the possible consequence explicitly.

### Chinese

```markdown
**[风险: 高]** 这一步会执行高风险操作，不能直接继续。
**我将执行**：删除 `X`
**影响范围**：`Y`
**影响程度**：`Z`
**可能后果**：`W`
**请确认**：继续或取消？
```

### English

```markdown
**[Risk: High]** This is a high-risk action, so I am stopping before execution.
**Action**: delete `X`
**Scope**: `Y`
**Impact**: `Z`
**Possible Consequence**: `W`
**Continue or Cancel**:
```

## OpenClaw-Specific Notes

- if the action touches `~/.openclaw/openclaw.json`, plugins, gateway, delivery, or shared routing, say that directly
- if the action is only a read or recommendation, do not ask for confirmation just because the surface is sensitive
- if a medium-risk action is repeatedly approved, shorten result reporting when useful
- do not treat vague enthusiasm or unrelated acknowledgment as approval for a high-risk action

## Tone Rules

- low risk: no permission speech
- medium risk: no permission speech
- high risk: concise but explicit
- no filler, no duplicate confirmation blocks
- never mix Chinese and English headings in the same reply

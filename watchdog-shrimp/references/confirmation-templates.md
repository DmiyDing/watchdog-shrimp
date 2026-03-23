# Confirmation Templates

## LOW

No confirmation.

Pattern:
- Execute
- Verify
- Report

## MEDIUM

Keep it to one short confirmation.
Do not dump a full protocol.
Do not imply default continuation.

### Chinese

```markdown
**[风险: 中]** 这一步会修改 `X` 并影响 `Y`。
**请确认**：是否按这个范围继续？
```

### English

```markdown
**[Risk: Medium]** This will change `X` and affect `Y`.
**Next Step**: Confirm whether I should continue with that scope.
```

## HIGH

Use a compact four-point confirmation.
State the possible consequence explicitly.

### Chinese

```markdown
**[风险: 高]** 这一步会执行高风险操作，不能直接继续。
**我将执行**：删除 `X`
**影响范围**：`Y`
**可能后果**：`Z`
**请确认**：是否继续？
```

### English

```markdown
**[Risk: High]** This is a high-risk action, so I am stopping before execution.
**Action**: delete `X`
**Impact**: `Y`
**Possible Consequence**: `Z`
**Next Step**: confirm whether to continue.
```

## OpenClaw-Specific Notes

- if the action touches `~/.openclaw/openclaw.json`, plugins, gateway, delivery, or shared routing, say that directly
- if the action is only a read or recommendation, do not ask for confirmation just because the surface is sensitive
- if a medium-risk action is repeatedly approved, shorten wording but still wait for a reply

## Tone Rules

- low risk: no permission speech
- medium risk: one short confirmation only
- high risk: concise but explicit
- never mix Chinese and English headings in the same reply

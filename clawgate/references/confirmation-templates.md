# Confirmation Templates

## Output Protocol

Use these machine-readable fields whenever the user, harness, or downstream system expects stable structure:
- `risk_level`
- `blocked`
- `missing_fields`
- `approval_mode`
- `continue_or_cancel`
- `itemized_actions`

`HIGH` and `CRITICAL` should prefer the machine-readable fields plus the human-readable headings in the same block.
`LOW` and `MEDIUM` may stay human-readable unless a machine-readable consumer is explicitly in play.

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

Stable execution report:
- `Action`
- `Verify`
- `Result`

Optional machine-readable fields when requested:
- `risk_level: MEDIUM`
- `blocked: false`

## HIGH

Use a blocked confirmation with this fixed field order:
- `Risk: HIGH`
- `Scope`
- `Impact`
- `Possible Consequence`
- `Missing Fields`
- `Continue or Cancel`

Rules:
- Start by explicitly stating `Risk: HIGH`.
- If any information is missing, keep the missing-fields prompt inside the blocked confirmation block.
- Do not degrade into ordinary Q&A or clarification-first style questioning.
- State authorization granularity explicitly: this approval covers this exact high-risk action only.
- State `Continue or Cancel` explicitly.

Required machine-readable fields:
- `risk_level: HIGH`
- `blocked: true`
- `approval_mode: explicit_confirmation`
- `missing_fields`
- `continue_or_cancel`
- `itemized_actions: []`

### English

```markdown
Risk: HIGH
risk_level: HIGH
blocked: true
approval_mode: explicit_confirmation
Scope: install plugin + mutate `plugins.entries` + restart gateway on the named target
Impact: OpenClaw runtime wiring and gateway health may change for this target
Possible Consequence: a bad install, config mutation, or restart can leave the instance unhealthy
missing_fields:
- plugin source
- target instance
Missing Fields:
- plugin source
- target instance
continue_or_cancel: continue or cancel
itemized_actions: []
Authorization Granularity: this approval covers this exact high-risk action only, not later restart / delete / outbound send / paid-loop steps outside the named scope
Continue or Cancel: continue or cancel
```

### Chinese

```markdown
Risk: HIGH
risk_level: HIGH
blocked: true
approval_mode: explicit_confirmation
Scope: 在指定目标上安装插件 + 修改 `plugins.entries` + 重启 gateway
Impact: OpenClaw 运行时接线与 gateway 健康状态可能发生变化
Possible Consequence: 如果安装、配置或重启判断错误，实例可能变得不健康
missing_fields:
- 插件来源
- 目标实例
Missing Fields:
- 插件来源
- 目标实例
continue_or_cancel: continue or cancel
itemized_actions: []
Authorization Granularity: 本次授权仅覆盖这一组已命名的高风险动作，不覆盖后续新增的重启 / 删除 / 外发 / 付费循环
Continue or Cancel: continue or cancel
```

### High-Risk But Information Is Missing

Use this exact skeleton when a request already hits `HIGH` but key fields are missing:

```markdown
Risk: HIGH
risk_level: HIGH
blocked: true
approval_mode: explicit_confirmation
missing_fields:
- plugin name
- plugin source
- target instance
Missing Fields:
- plugin name
- plugin source
- target instance
Blocked Until: the missing fields are supplied inside this confirmation block and the exact action is explicitly approved
Scope: plugin install + `plugins.entries` mutation + gateway restart
Impact: OpenClaw runtime wiring and gateway availability may change
Possible Consequence: guessing any missing field can break plugin wiring or leave the gateway unhealthy
continue_or_cancel: continue or cancel
itemized_actions: []
Continue or Cancel: continue or cancel
```

## CRITICAL

Use a blocked itemized confirmation with this fixed field order:
- `Risk: CRITICAL`
- `Critical Action Items`
- `Audience Groups`
- `Channels`
- `Authorization Granularity`
- `Approve Each Item`
- `Continue or Cancel`

Rules:
- Always start by explicitly stating `Risk: CRITICAL`.
- Never merge approvals for multiple critical items.
- Use `Approve Each Item` and require a separate approval or cancellation for every numbered item.
- For broadcast or public-channel work, list each audience or destination separately.

Required machine-readable fields:
- `risk_level: CRITICAL`
- `blocked: true`
- `approval_mode: itemized`
- `missing_fields`
- `continue_or_cancel`
- `itemized_actions`

### Critical Example

### Critical Fixed Skeleton

```markdown
Risk: CRITICAL
risk_level: CRITICAL
blocked: true
approval_mode: itemized
missing_fields: []
Critical Action Items:
1. delete `A`
2. switch shared router to `B`
Authorization Granularity: approve each item separately; do not merge authorization across items
Approve Each Item: reply item-by-item with approve or cancel
continue_or_cancel: continue or cancel
itemized_actions:
- delete `A`
- switch shared router to `B`
Continue or Cancel: continue or cancel
```

### Broadcast / Public Channel Template

Use this exact template for customer mailing lists, public channels, or broad external delivery:

```markdown
Risk: CRITICAL
risk_level: CRITICAL
blocked: true
approval_mode: itemized
missing_fields: []
Critical Action Items:
1. send to customer mailing list `A`
2. send to public channel `B`
Audience Groups:
- customers in mailing list `A`
- viewers in public channel `B`
Channels:
- mailing list `A`
- public channel `B`
Authorization Granularity: approve each destination separately; no bundled approval for all audiences
Approve Each Item: reply item-by-item with approve or cancel
continue_or_cancel: continue or cancel
itemized_actions:
- send to customer mailing list `A`
- send to public channel `B`
Continue or Cancel: continue or cancel
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

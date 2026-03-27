# AGENTS Activation Snippet

Paste this snippet into the always-injected OpenClaw entry point you actually use, such as `AGENTS.md` or a standing-order equivalent.

Do not treat this file as already active policy.
Installation alone does not activate `watchdog-shrimp`.

```md
## Execution Governance (watchdog-shrimp)

- Default to `watchdog-shrimp` for OpenClaw execution-governance decisions.
- `LOW`: execute directly, verify the result, then report.
- `MEDIUM`: execute directly, verify the result, then report.
- `HIGH`: stop before execution and require explicit confirmation of intent, scope, impact, consequence, and continue/cancel.

Treat the following as OpenClaw-sensitive and escalate aggressively:
- `~/.openclaw/openclaw.json`
- approval, delivery, channel, router, and gateway configuration
- `plugins.entries` and plugin wiring
- extension install/remove/update with runtime effect
- gateway restart, reload, or shared service changes
- external delivery integrations
- cross-instance or shared-workspace mutation

Hard-stop conditions:
- delete, overwrite, bulk replace, migrate, deploy, publish
- outbound messages that cross the current organization boundary, reach external users or customers, target public or broadcast channels, or touch identity-sensitive delivery integrations
- paid API usage with meaningful cost
- sudo, root, elevated, or policy-bypassing execution
- secret, credential, billing, identity, approval, or router-sensitive surfaces

OpenClaw-specific escalation:
- reading OpenClaw config or gateway state without mutation may stay `LOW`
- ordinary local dependency install may stay `MEDIUM`
- plugin install/remove/update plus config mutation plus gateway/shared-service restart is always `HIGH`

Activation rule:
- installing the repository does not activate the policy
- activation requires this snippet, or an equivalent rule, to be added manually to the always-injected entry point
```

---

## Chinese / 中文版本

将此片段粘贴到你实际使用的 OpenClaw 常驻入口，例如 `AGENTS.md` 或等效的 standing-order。

此文件本身不是已激活的策略。
仅安装并不代表激活了 `watchdog-shrimp`。

```md
## 执行治理 (watchdog-shrimp)

- 默认使用 `watchdog-shrimp` 进行 OpenClaw 执行治理决策。
- `LOW`：直接执行，验证结果，然后报告。
- `MEDIUM`：直接执行，验证结果，然后报告。
- `HIGH`：执行前暂停，要求显式确认意图、范围、影响、后果，以及继续或取消。

以下内容视为 OpenClaw 敏感项，需激进升级：
- `~/.openclaw/openclaw.json`
- approval、delivery、channel、router 和 gateway 配置
- `plugins.entries` 和插件配置
- 有运行时影响的扩展安装/移除/更新
- gateway 重启、重载或共享服务变更
- 外部投递集成
- 跨实例或共享工作区变更

强制停止条件：
- 删除、覆盖、批量替换、迁移、部署、发布
- 跨越当前组织边界、触达外部用户或客户、面向公开或广播渠道、或涉及身份敏感投递集成的外发消息
- 有实际成本的付费 API 使用
- sudo、root、提权或绕过策略的执行
- 密钥、凭证、账单、身份、审批或路由敏感面

OpenClaw 特定升级规则：
- 只读 OpenClaw 配置或 gateway 状态不变更可保持 `LOW`
- 普通本地依赖安装可保持 `MEDIUM`
- 插件安装/移除/更新 + 配置变更 + gateway/共享服务重启始终为 `HIGH`

激活规则：
- 安装仓库不等于激活策略
- 激活需要将此片段或等效规则手动添加到常驻入口
```

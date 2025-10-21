AI 多版本生成与 Token 管理重构
=================================

## 目标

- 彻底解决“版本B生成慢”和“高级版被误判超限”两类核心问题。
- 以模块化方式重构生成流程、订阅校验与 Token 计费，提升可维护性。
- 在不影响既有 UI 交互的前提下，缩短响应路径并增强可观测性。

## 总体架构

```
┌─────────────────────────────────────────────┐
│ Generation Orchestrator（生成调度层）          │ ← 顺序触发版本A/B，负责结果回写
├─────────────────────────────────────────────┤
│ Token Manager（令牌管理层）                  │ ← 缓冲记录、批量同步 Supabase
├─────────────────────────────────────────────┤
│ Subscription Service（订阅状态层）           │ ← 统一解析 tier，广播状态变更
└─────────────────────────────────────────────┘
```

## 架构原则

1. **职责单一**：调度层、Token 层、订阅层互不穿透，跨模块仅通过事件交流。
2. **快速短路**：Premium 用户始终跳过 Token 限额判断，避免误判。
3. **异步容错**：所有外部请求（Supabase、API 计费）失败时记录日志但不阻塞主流程。
4. **日志留痕**：关键信息统一写入 `logger`，可在 Telemetry 中聚合回溯。

## 版本生成优化

- **顺序执行**：先生成版本A，马上推送 UI；版本B走后台 Promise，结果就绪后补齐。
- **独立配置**：A/B 使用不同的 timeout / retries / temperature，通过 JSON 配置管理。
- **失败矩阵**：针对超时、504、模型权限不足等情况制定降级策略，减少重复重试。
- **Prompt 收敛**：创意版使用轻量提示词并降低 `maxTokens`，缩短响应时间。

## 订阅层强化

- **缓存层级**：内存 Map（10min TTL） > BroadcastChannel 同步 > fallback localStorage。
- **节流处理**：Supabase 查询被节流或返回空时，不落库 trial，保持上一状态。
- **快速通道**：`getTier()` 若判定 premium 直接返回，避免后续限额检查。
- **事件广播**：`tierUpdated` 事件包含来源、有效期，供 UI/其他模块订阅。

## Token 管理重构

- **写路径**：所有版本调用将 token 使用量写入缓冲队列，由定时任务批量入库。
- **读路径**：读取逻辑校验数据是否 stale，Premium 全量 bypass，其他套餐才计算 projected usage。
- **错误处理**：Supabase / API 写入失败仅警告，不抛异常阻塞主流程。
- **观察指标**：聚合日志包含 userId、tier、monthlyUsed、warningLevel，方便排查。

## 事件与日志

| 事件类型              | 触发方                  | 关键字段                                        |
| --------------------- | ----------------------- | ----------------------------------------------- |
| `tierUpdated`         | SubscriptionService     | `userId`, `tier`, `source`, `expiresAt`, `ts`    |
| `generationCompleted` | Generation Orchestrator | `versionId`, `platformId`, `success`, `elapsed` |
| `tokenSynced`         | TokenManager            | `userId`, `delta`, `monthlyTotal`, `ts`         |

## 实施待办

1. 重构生成调度逻辑，拆分版本A/B执行顺序与回写。
2. 调整订阅服务，避免节流 fallback 污染缓存，并暴露 `isPremium` 快速判断。
3. 更新 Token 计费逻辑：premium bypass、缓冲写入、改良 Supabase 失败处理。
4. 扩展日志：统一输出订阅来源、token 统计、模型降级原因。
5. 验证：在 staging 环境跑长文/高频用例，确认无超限误判、版本B latency 降低。
6. 回归：执行批量生成脚本 + Supabase token 统计比对，确保账务一致。

## 风险缓释

- **订阅失真**：新增缓存 guard 和事件检测，确保 trial 值不会覆盖已知 premium。
- **统计遗漏**：同步批量插入记录成功/失败，若失败可回滚内存缓冲重试。
- **性能退化**：版本B后台执行，A 仍然立即可用，用户感知不变。

## 完成标准

- 高级版用户 0 次 token 超限误判。
- 版本B首屏可用时间下降 ≥ 40%。
- 关键路径日志可追溯（tier、token、fallback 均有记录）。
- Release 后 7 天内无回滚，无新增 P0/P1 问题。

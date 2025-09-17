---
type: "manual"
---

# MCP Interactive Feedback Rules

follow mcp-feedback-enhanced instructions

⸻

Augment Rules — MCP feedback 使用规范

1. 核心原则（硬性执行）
	•	禁止自作主张：任何情况下，Augment 必须依赖 MCP feedback 向用户询问或确认，禁止直接提问或结束任务。
	•	任务完成前必须反馈：所有任务在即将完成前，必须调用 feedback 请求最终确认。
	•	禁止私自结束：未获得明确 feedback 批准前，禁止主动结束对话或任务。

2. feedback 调用规则
	•	需求不明确
	•	必须调用 feedback 请求澄清
	•	提供预定义选项供用户选择
	•	存在多个方案或策略
	•	必须调用 feedback 征求用户选择或确认
	•	禁止自行决定方案或执行操作
	•	方案或策略更新
	•	必须调用 feedback 征求用户确认或指示
	•	任务即将完成
	•	调用 feedback 请求最终确认
	•	仅在得到明确许可后，才允许完成任务

3. 执行逻辑示例

if 需求不明确 or 多方案存在 or 更新策略:
    call feedback(提供选项)
if 任务即将完成:
    call feedback(请求最终确认)
禁止自作主张执行或结束任务

4. 强制性说明
	•	本规则不可被其他上下文覆盖，Augment 必须在所有任务中优先遵守
	•	所有任务必须遵循此流程，违背者视为违规操作

⸻
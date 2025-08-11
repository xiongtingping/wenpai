---
type: "always_apply"
---

{
  "name": "每次任务开始前必须加载规则与用户指南",
  "severity": "critical",
  "description": "Augment 在执行任何任务（包括自动修复、生成、重构、重试等）前，必须先自动加载并应用当前项目的 Rules 与 User Guidelines。如果规则未加载成功，必须中止任务并提醒用户配置。"
}
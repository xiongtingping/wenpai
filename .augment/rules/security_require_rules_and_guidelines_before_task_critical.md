---
type: "always_apply"
---

{
  "module": "Security",
  "name": "security_require_rules_and_guidelines_before_task_critical",
  "severity": "critical",
  "description": "Augment 在执行任何任务（包括自动修复、生成、重构、重试等）前，必须先自动加载并应用当前项目的 Rules 与 User Guidelines。如果规则未加载成功，必须中止任务并提醒用户配置。",
  "criteria": [
    "任务执行前自动读取项目的 Rules 配置文件",
    "任务执行前自动读取 User Guidelines 配置文件",
    "检测 Rules 与 User Guidelines 是否成功加载且完整",
    "若任一文件缺失或加载失败，必须中止任务并提示用户"
  ],
  "action": "在任务执行前强制验证规则与指南加载状态，未加载成功时禁止继续执行，并输出缺失或错误的配置项。"
}
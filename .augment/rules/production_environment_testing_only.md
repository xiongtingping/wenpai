---
type: "agent_requested"
description: "Example description"
---
{
  "module": "Development",
  "name": "production_environment_testing_only",
  "severity": "critical",
  "description": "用户明确要求在生产环境进行测试和修复，严禁在开发环境（localhost、npm run dev等）进行测试。所有验证、调试、修复都必须在生产环境完成。",
  "criteria": [
    "禁止在开发环境（localhost、npm run dev 等）进行测试或修复",
    "所有调试、验证、修复操作必须在生产环境执行",
    "检测到非生产环境操作应阻止任务继续"
  ],
  "action": "在检测到开发环境操作时阻止执行，并提示必须切换至生产环境完成测试和修复。",
  "keywords": [
    "生产环境",
    "生产环境测试",
    "禁止开发环境",
    "验证",
    "调试",
    "修复",
    "环境规范",
    "测试约束"
  ]
}
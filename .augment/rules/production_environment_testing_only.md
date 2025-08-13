---
type: "agent_requested"
description: "Example description"
---
{
  "name": "production_environment_testing_only",
  "severity": "critical",
  "description": "用户明确要求在生产环境进行测试和修复，严禁在开发环境（localhost、npm run dev等）进行测试。所有验证、调试、修复都必须在生产环境完成。"
}
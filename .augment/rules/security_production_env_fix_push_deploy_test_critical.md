---
type: "agent_requested"
description: "security_production_env_fix_push_deploy_test_critical"
---
{
  "module": "Security",
  "name": "security_production_env_fix_push_deploy_test_critical",
  "severity": "critical",
  "description": "当问题发生在生产环境时，修复完成后必须立即执行 Git push，并触发生产环境部署流程（如 CI/CD 或手动部署）。禁止仅在开发环境中测试修复效果，所有验证必须在生产环境下完成，确保修复逻辑与生产数据、依赖、配置保持一致。",
  "criteria": [
    "检测当前 Git 分支是否为生产分支（如 main 或 master）",
    "检测最近一次提交是否已 push 至远程生产分支",
    "检测生产部署流程是否已执行（CI/CD 或手动部署日志）",
    "禁止在仅 dev/test 环境完成验证就结束流程"
  ],
  "action": "若检测到当前环境非生产分支或未部署至生产环境，则阻止任务完成并提示必须在生产环境验证修复。"
}
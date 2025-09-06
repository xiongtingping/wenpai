---
type: "agent_requested"
description: "security_prevent_authing_modification_error"
---
{
  "module": "Authentication",
  "name": "authing_login_system_integrity_error",
  "severity": "error",
  "description": "
  "criteria": [
    "
    "禁止改动回调地址、token 处理或登录态持久化机制",
    "
    "如需更改，必须封装新模块并提交变更清单审核"
  ],
  "action": "在检测到对 Authing 登录或认证系统的核心逻辑修改时阻止任务执行，并提示提交封装模块与审核清单。",
  "keywords": [
    "Authing",
    "登录系统",
    "认证系统",
    "权限判断",
    "Guard",
    "Token",
    "登录态",
    "系统完整性"
  ]
}
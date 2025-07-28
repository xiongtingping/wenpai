---
type: "always_apply"
---

{
  "name": "禁止破坏 Authing 登录与认证系统",
  "severity": "error",
  "description": "禁止改动 Guard 初始化、回调地址、token 处理、登录态持久化、权限判断逻辑等，必须确保登录系统完整可用。如需修改请封装新模块并提交清单审核。"
}
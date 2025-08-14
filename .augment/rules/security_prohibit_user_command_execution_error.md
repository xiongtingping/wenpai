---
type: "always_apply"
---

{
  "module": "Security",
  "name": "security_prohibit_user_command_execution_error",
  "severity": "error",
  "description": "禁止要求用户执行命令，包括构建、运行、登录测试、日志收集等操作。所有任务应在内置终端或自动化环境中完成，并自动抓取日志与执行结果。若任务出错，需自动重试并输出关键信息。",
  "criteria": [
    "禁止在文档、提示或代码中要求用户手动执行 npm run / yarn run / build / dev / login / test 等命令",
    "所有操作必须在内置终端或自动化环境中执行",
    "任务执行失败时必须自动重试，并输出关键日志信息供排查",
    "禁止依赖用户手动输入命令或操作来完成验证、测试或构建"
  ],
  "action": "检测到用户手动操作提示时阻止执行，并提示开发者改为自动化执行机制。",
  "keywords": [
    "用户命令",
    "禁止手动操作",
    "自动化执行",
    "日志抓取",
    "任务重试",
    "构建",
    "运行",
    "测试",
    "安全策略"
  ]
}
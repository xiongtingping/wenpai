---
type: "agent_requested"
description: "Example description"
---

{
  "module": "Development",
  "name": "dev_prohibit_undefined_concat_error",
  "severity": "error",
  "description": "禁止拼接出现 'undefinedundefined'。所有用户信息展示必须使用封装工具（如 getUserDisplayName(user)），避免直接拼接未判空的字段。禁止在模板字符串 `${}` 中使用未经处理的对象字段。",
  "criteria": [
    "禁止直接拼接 nickname + username 或其他可能为 undefined 的字段",
    "禁止在模板字符串中使用未经处理的对象字段",
    "必须使用统一封装工具获取显示信息，如 getUserDisplayName(user)",
    "检测到可能出现 undefined 的拼接场景必须阻止执行或提示修复"
  ],
  "action": "在发现未判空拼接的用户信息时阻止任务执行，并提示使用封装工具或加判空处理。",
  "keywords": [
    "undefined拼接",
    "未判空",
    "用户信息显示",
    "模板字符串安全",
    "getUserDisplayName",
    "字段判空",
    "防止undefined",
    "字符串拼接安全",
    "前端显示保护"
  ]
}
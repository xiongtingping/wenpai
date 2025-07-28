---
type: "always_apply"
---

{
  "name": "禁止拼接出现 'undefinedundefined'",
  "severity": "error",
  "description": "所有用户信息展示必须使用封装工具（如 getUserDisplayName(user)），避免 nickname + username 等未判空拼接。禁止在模板字符串 `${}` 中使用未处理的对象字段。"
}
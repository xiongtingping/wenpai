---
type: "always_apply"
---

{
  "name": "新功能/重要改动必须自动提交 Git",
  "severity": "critical",
  "description": "当系统检测到新增功能模块、大规模文件改动、核心逻辑重构或权限/认证相关改动时，必须自动执行 Git 提交（git add + git commit）。提交信息需明确包含变更类型与目的，防止关键改动丢失。"
}
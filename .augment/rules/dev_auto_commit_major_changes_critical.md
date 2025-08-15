---
type: "agent_requested"
description: "Example description"
---
{
  "module": "Development",
  "name": "dev_auto_commit_major_changes_critical",
  "severity": "critical",
  "description": "当系统检测到新增功能模块、大规模文件改动、核心逻辑重构或权限/认证相关改动时，必须自动执行 Git 提交（git add + git commit），提交信息需明确包含变更类型与目的，防止关键改动丢失。默认仅执行 commit，不自动 push，除非用户明确要求。",
  "criteria": [
    "检测新增功能模块",
    "检测大规模文件改动（超过设定阈值）",
    "检测核心逻辑重构",
    "检测权限或认证相关代码改动",
    "自动生成规范化的 Git 提交信息（含变更类型与目的）",
    "默认不执行 git push，除非用户明确要求"
  ],
  "action": "在满足条件时，执行 git add + git commit，确保变更被记录，但不自动推送到远程仓库，除非用户确认。",
  "keywords": [
    "git commit",
    "自动提交",
    "自动 commit",
    "大规模改动",
    "大文件改动",
    "功能新增",
    "核心重构",
    "权限改动",
    "认证改动",
    "commit message",
    "提交信息",
    "代码提交",
    "版本记录",
    "auto commit",
    "feature added",
    "major changes",
    "auth changes",
    "permission changes"
  ]
}
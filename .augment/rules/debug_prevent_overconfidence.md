---
type: "always_apply"
---

{
  "module": "Debug",
  "name": "debug_prevent_overconfidence",
  "severity": "warning",
  "description": "禁止 AI 在调试时武断认定‘已经找到根因’，必须列出多个可能性，并进行概率和验证分析。",
  "criteria": [
    "禁止直接声称‘已找到根因’",
    "必须输出至少 3 个【根因候选】并附带概率评估",
    "必须区分【症状】与【根因候选】，不可混淆",
    "在修复前必须输出 checklist（调用链、配置、依赖、根因 vs 症状、副作用）",
    "修复方案需经过二次自查，避免仅掩盖问题"
  ],
  "action": "若发现模型直接认定唯一根因，应阻止修复输出并提示重新生成包含多个候选的调试分析。",
  "keywords": [
    "根因",
    "候选根因",
    "症状",
    "概率",
    "多假设",
    "验证步骤",
    "Checklist",
    "二次自查",
    "过度自信",
    "debug"
  ]
}
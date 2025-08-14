---
type: "always_apply"
---

{
  "module": "Core",
  "name": "core_confirm_model_info_critical",
  "severity": "critical",
  "description": "每次会话开始必须告知当前使用的 AI 模型名称。",
  "criteria": [
    "必须输出模型名称"
  ],
  "action": "确保模型信息明确告知用户",
  "keywords": [
    "模型名称",
    "当前模型",
    "AI模型",
    "使用模型",
    "model name",
    "current model",
    "gpt版本",
    "模型信息",
    "模型标识",
    "AI版本"
  ]
}
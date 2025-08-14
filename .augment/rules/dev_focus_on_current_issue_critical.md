---
type: "always_apply"
---

{
  "rules": [
    {
      "module": "Development",
      "name": "dev_focus_on_current_issue_critical",
      "severity": "critical",
      "description": "专注于解决当前用户提出的问题，避免无关改动。",
      "criteria": [
        "优先完成当前用户描述的具体目标或修改点",
        "不要在无关区域进行重构、重命名或风格优化",
        "不提前优化未被要求的代码结构"
      ],
      "action": "在生成前先逐行确认修改范围，仅对涉及的部分进行调整",
      "keywords": [
        "focus on issue",
        "当前问题",
        "只改当前",
        "无关改动禁止",
        "patch",
        "局部修复",
        "current task only",
        "avoid unrelated changes"
      ]
    },
    {
      "module": "Development",
      "name": "dev_no_unnecessary_mass_deletion_error",
      "severity": "error",
      "description": "禁止无必要的大量删除代码。",
      "criteria": [
        "不得删除大量与问题无关的代码",
        "删除必须有合理原因（如解决错误、替换为用户要求的新实现）",
        "避免因重构而大面积替换原有逻辑"
      ],
      "action": "保留现有可用代码，仅在必要处替换或删除",
      "keywords": [
        "mass delete",
        "大面积删除",
        "无关代码删除禁止",
        "bulk removal",
        "delete risk",
        "避免破坏原有逻辑",
        "delete only necessary",
        "unnecessary deletion"
      ]
    },
    {
      "module": "Development",
      "name": "dev_preserve_code_readability_warning",
      "severity": "warning",
      "description": "保留上下文可读性。",
      "criteria": [
        "保留原有代码中有意义的变量名、注释、结构",
        "尽量不改变未被要求修改的函数或模块签名"
      ],
      "action": "仅在需要修改的地方插入或调整代码，保持整体结构稳定",
      "keywords": [
        "readability",
        "可读性",
        "保留变量名",
        "保留注释",
        "保持结构稳定",
        "maintain signature",
        "avoid unnecessary changes"
      ]
    },
    {
      "module": "Development",
      "name": "dev_incremental_change_strategy_warning",
      "severity": "warning",
      "description": "采用增量修改策略，减少风险。",
      "criteria": [
        "分批次、小范围修改，而不是一次性大改",
        "每次修改后确保功能可运行并通过现有逻辑测试"
      ],
      "action": "在输出中保留未修改部分，突出标记修改部分",
      "keywords": [
        "incremental change",
        "增量修改",
        "small batch",
        "分批修改",
        "gradual update",
        "risk reduction",
        "分步修改",
        "highlight changes"
      ]
    }
  ]
}
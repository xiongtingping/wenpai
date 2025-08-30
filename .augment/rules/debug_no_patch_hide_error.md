---
type: "always_apply"
---

{
  "rules": [
    {
      "module": "Debug",
      "name": "debug_no_patch_hide_error",
      "severity": "critical",
      "description": "禁止通过绕过、隐藏或临时 patch 的方式处理问题，必须真正修复根因。", 
      "criteria": [
        "禁止在未确认根因前直接输出修复代码",
        "禁止通过 try/catch 包裹或静默错误日志来掩盖问题",
        "禁止通过条件判断跳过触发错误的逻辑而不修复",
        "禁止使用临时 patch（如 return 空值、mock 数据）代替真实解决方案"
      ],
      "action": "在修复前必须输出根因候选清单，并验证后确认再修复。",
      "keywords": [ 
        "绕过错误",
        "隐藏问题",
        "patch",
        "临时修复",
        "静默错误",
        "掩盖根因",
        "bypass",
        "hack fix",
        "quick patch"
      ]
    },
    {
      "module": "Debug",
      "name": "debug_focus_on_root_cause_error",
      "severity": "error",
      "description": "必须追溯并解决根因，而不是仅处理表层症状。",
      "criteria": [
        "禁止仅修改表层报错代码（如 UI 层提示、console.log）而忽略底层逻辑错误",
        "禁止修复次生问题而不追溯来源",
        "必须明确区分【症状】与【根因候选】"
      ],
      "action": "要求在修复前输出根因分析（≥3个候选，并附概率），确认源头后再修复。",
      "keywords": [
        "根因分析",
        "症状 vs 根因",
        "trace back",
        "真正解决",
        "source issue",
        "causal analysis"
      ]
    },
    {
      "module": "Debug",
      "name": "debug_prohibit_fake_fix_warning",
      "severity": "warning",
      "description": "禁止通过删除、注释掉或屏蔽代码来规避问题。",
      "criteria": [
        "不得通过注释/删除触发报错的代码行来掩盖问题",
        "不得通过条件语句直接跳过问题代码",
        "不得通过禁用功能绕过错误"
      ],
      "action": "必须保证原有功能可运行，并通过修复逻辑来解决问题，而不是移除功能。",
      "keywords": [
        "假修复",
        "注释掉",
        "删除绕过",
        "skip logic",
        "disable feature",
        "fake fix"
      ]
    },
    {
      "module": "Debug",
      "name": "debug_validate_fix_strategy_warning",
      "severity": "warning",
      "description": "在输出修复方案前必须进行验证，避免‘先改后试’的盲修。",
      "criteria": [
        "修复前必须解释修复思路与适用范围",
        "必须说明可能副作用",
        "必须经过至少一次逻辑自查，确保方案合理"
      ],
      "action": "在输出修复代码前，先扮演代码审查员，审视修复的正确性和副作用。",
      "keywords": [
        "修复验证",
        "先分析后修复",
        "自查",
        "验证根因",
        "合理性检查",
        "避免盲修"
      ]
    }
  ]
}
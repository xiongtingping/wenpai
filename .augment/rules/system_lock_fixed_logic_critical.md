---
type: "agent_requested"
description: "Example description"
---

{
  "module": "System",
  "name": "system_lock_fixed_logic_critical",
  "severity": "critical",
  "description": "修复完成后必须锁定逻辑，
  "criteria": [
    "修复逻辑必须添加注释说明原因和方式",
    "LOCKED 区域
  ],
  "action": "对已封装逻辑标记锁定，若需变更需显式创建副本并记录修改原因。",
  "keywords": [
    "逻辑锁定",
    "修复追溯",
    "封装保护",
    "注释说明",
    "变更副本",
    "稳定性保障"
  ]
}
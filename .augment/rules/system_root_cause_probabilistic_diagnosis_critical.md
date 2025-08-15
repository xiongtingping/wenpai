---
type: "always_apply"
---

{
  "module": "System",
  "name": "system_root_cause_probabilistic_diagnosis_critical",
  "severity": "critical",
  "description": "修复问题必须先充分理解与建模，再系统性枚举所有可能原因并进行概率评估；按优先级验证与修复，严禁仅对表层症状做 patch 式修改或在未梳理全部可能原因的情况下盲目改动。",
  "criteria": [
    "在修改前完成问题复现、范围界定与成功判据（expected vs actual）",
    "列出所有可能原因（架构/依赖/版本/环境变量/配置/权限/网络/数据/并发与时序/SSR vs CSR/构建与部署/缓存等）并给出概率评估",
    "形成按概率从高到低排序的『根因假设清单』与验证计划（所需证据、日志/埋点/实验）",
    "每次仅针对最高优先假设实施最小可行变更并收集证据，验证通过后再固化修复",
    "任何仅修改报错行或添加临时补丁而未做根因与上下游影响分析的做法一律禁止",
    "修复后必须执行上下游链路回归（入口→状态→API→权限→UI）、防复发措施与文档化",
    "连续三轮验证仍未定位时，必须切换到系统性架构排查模式并提交结构性优化方案"
  ],
  "action": "在执行任何修复前输出《问题理解与根因假设清单》与《验证与修复计划》（含概率与优先级）；按优先级逐项验证与修复，记录证据与结论；每轮修复后执行回归与防复发加固（监控/告警/lint 规则/测试用例/文档）；如三轮未果，自动切换为系统级排查并提交重构或替代路径建议。",
  "keywords": [
    "root cause",
    "probabilistic diagnosis",
    "systemic",
    "architecture",
    "dependency",
    "hypothesis list",
    "verification plan",
    "avoid patch fix",
    "regression",
    "prevent recurrence",
    "根因分析",
    "概率评估",
    "系统性排查",
    "依赖冲突",
    "结构性缺陷",
    "最小可行变更",
    "三轮未解升级"
  ]
}
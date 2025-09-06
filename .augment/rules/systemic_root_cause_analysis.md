---
type: "always_apply"
---

{
  "name": "systemic_root_cause_analysis",
  "severity": "critical",
  "description": "执行任务时必须优先查找深层次与根本性问题，而非仅处理表面症状。禁止简单 patch 式修复，必须基于全局架构、上下游依赖、长期维护性进行整体性、全面性、系统性分析与解决。",
  "criteria": [
    "任务执行前必须分析问题在架构、依赖、流程上的根本原因",
    "
    "必须提出系统性解决方案，涵盖依赖关系、数据流、状态管理、权限、安全等",
    "修复后需验证是否彻底消除根本原因，并防止同类问题复发",
    "如无法一次性根治，需设计渐进式替换或重构方案，并明确阶段目标"
  ],
  "action": "在任何代码修改、配置调整、模块重构前，先生成《根因分析报告》与《系统性解决方案草案》，经确认后执行。禁止仅返回零散代码片段。",
  "keywords": [
    "root cause",
    "systemic",
    "architecture",
    "dependency",
    "refactor",
    "tech debt",
    "long-term maintainability",
    "prevent recurrence",
    "架构问题",
    "依赖冲突",
    "系统性排查",
    "根因分析",
    "防止复发",
    "技术债务"
  ]
}
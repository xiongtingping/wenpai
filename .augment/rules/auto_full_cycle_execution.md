---
type: "always_apply"
---

{
  "rules": [
    {
      "module": "Execution",
      "name": "auto_full_cycle_execution",
      "severity": "critical",
      "description": "所有涉及修复、重构、配置、集成、部署的任务，必须在无用户交互的前提下自动执行完整流程。",
      "criteria": [
        "任务必须自动完成：读取上下文 → 制定改动方案 → 修改代码 → 运行/构建 → 验证结果",
        "禁止中途停顿或等待用户输入",
        "若存在多种方案，自动选择兼容性最高、影响面最小的方案并执行"
      ],
      "action": "自动执行全流程并输出最终结果与验证日志",
      "keywords": ["自动化", "闭环执行", "无交互", "全流程", "任务执行"]
    },
    {
      "module": "Execution",
      "name": "no_user_confirmation",
      "severity": "critical",
      "description": "禁止在任务执行过程中生成任何形式的二次确认提示或停顿。",
      "criteria": [
        "禁止出现“是否确认执行”“你确定要这样做吗”等提示",
        "禁止通过提问方式暂停执行",
        "不确定情况下必须选择默认最安全方案并继续"
      ],
      "action": "执行任务时自动决策并推进，不等待用户输入",
      "keywords": ["禁止确认", "自动决策", "不中断", "执行连续性"]
    },
    {
      "module": "Validation",
      "name": "multi_round_self_check_and_rollback",
      "severity": "critical",
      "description": "执行完成后必须自动进行多轮验证，并在异常时自动回滚。",
      "criteria": [
        "执行完成后进行构建测试、功能测试、依赖检查等多轮验证",
        "检测到异常必须自动回滚到执行前状态",
        "输出错误日志和回滚报告，禁止等待用户处理"
      ],
      "action": "在执行后自检并回滚异常执行，保证安全闭环",
      "keywords": ["自检", "多轮验证", "回滚机制", "安全执行"]
    },
    {
      "module": "Context",
      "name": "auto_context_and_dependency_loading",
      "severity": "high",
      "description": "任务开始前必须自动加载上下文和依赖信息，避免因信息不足中断。",
      "criteria": [
        "读取依赖版本、运行环境、文件结构、配置文件",
        "确保信息完整，避免缺少上下文导致停顿",
        "在执行前完成环境准备"
      ],
      "action": "自动加载并解析上下文，补全任务所需信息",
      "keywords": ["上下文", "依赖信息", "自动加载", "环境准备"]
    },
    {
      "module": "Execution",
      "name": "minimal_impact_strategy",
      "severity": "high",
      "description": "在可行方案中优先选择对现有功能影响最小的执行策略。",
      "criteria": [
        "优先保持兼容性和稳定性",
        "即使在 UNLOCK 模式下也不得破坏核心功能",
        "保证任务目标完成的前提下减少风险"
      ],
      "action": "自动选择最小影响的执行方案并完成任务",
      "keywords": ["最小影响", "稳定性", "兼容性", "执行策略"]
    }
  ]
}
---
trigger: always_on
alwaysApply: true
---
{
  "rules": [
    {
      "module": "Mode",
      "name": "mode_switch_from_prompt_meta",
      "severity": "critical",
      "description": "从消息中解析模式标记，设置会话模式。支持 [MODE: SAFE] / [MODE: UNLOCK]，缺省为 SAFE。",
      "criteria": [
        "当检测到 '[MODE: UNLOCK]' 或 meta.json 中 \"mode\":\"UNLOCK\" 时，设置会话变量 session.mode=UNLOCK",
        "当检测到 '[MODE: SAFE]' 或 meta.json 中 \"mode\":\"SAFE\" 时，设置会话变量 session.mode=SAFE",
        "若二者皆无，默认 session.mode=SAFE"
      ],
      "action": "在任务开始前解析模式并写入会话状态 session.mode",
      "keywords": ["MODE", "SAFE", "UNLOCK", "会话模式", "模式切换"]
    },
    {
      "module": "Execution",
      "name": "unlock_overrides_minimal_change",
      "severity": "critical",
      "description": "当 session.mode=UNLOCK 时，禁止使用最小改动策略，改为最佳实现优先（可重构、可改签名、可拆合模块）。",
      "criteria": [
        "session.mode=UNLOCK 时，禁用 minimal_impact_strategy、minimal_change_set 等保守策略",
        "允许：修改函数签名/参数结构、文件/模块拆分合并、命名规范化、大范围重构",
        "仍需保持对外接口兼容性或给出迁移指引"
      ],
      "action": "覆盖/屏蔽最小改动相关规则并启用解锁改动范围",
      "keywords": ["UNLOCK", "重构", "最佳实现", "覆盖保守策略"]
    },
    {
      "module": "Execution",
      "name": "unlock_no_user_confirmation",
      "severity": "critical",
      "description": "UNLOCK 模式下禁止任何形式的用户确认或停顿，必须全自动闭环执行。",
      "criteria": [
        "禁止出现“是否确认执行”“需要你确认”“建议先…”等确认/建议措辞",
        "遇到不确定场景时自动选择最安全、兼容性最高的方案继续执行",
        "完成：规划 → 修改 → 构建/运行 → 验证 → 报告 的全流程"
      ],
      "action": "启用无交互自动执行；若检测到确认语气，自动改为直接执行",
      "keywords": ["UNLOCK", "无确认", "自动执行", "不中断"]
    },
    {
      "module": "Guardrails",
      "name": "unlock_banned_phrases",
      "severity": "error",
      "description": "UNLOCK 模式下禁止出现会触发保守路径或中断的措辞。",
      "criteria": [
        "禁用短语（示例）：“最小修复”“小范围改动”“我将快速审查后…再…”“是否需要我…确认”“建议先评估再执行”",
        "禁用语气：征询式/保守式/等待指示式表述"
      ],
      "action": "若检测到禁用措辞，自动改写为执行式语气并继续任务",
      "keywords": ["禁用词", "措辞控制", "保守语气拦截"]
    },
    {
      "module": "Context",
      "name": "unlock_auto_context_bootstrap",
      "severity": "high",
      "description": "UNLOCK 模式下必须自动加载运行环境与依赖上下文，避免因信息不足而停顿。",
      "criteria": [
        "自动解析：依赖版本、运行脚本、构建命令、环境变量、路由/认证配置、文件结构",
        "无法获取时选择默认安全值并继续（记录在报告里）"
      ],
      "action": "自动完成上下文引导与缺省值填充",
      "keywords": ["上下文加载", "依赖解析", "默认值", "不中断"]
    },
    {
      "module": "Validation",
      "name": "unlock_pipeline_and_artifacts",
      "severity": "high",
      "description": "UNLOCK 模式下强制输出完整闭环工件与验证结果。",
      "criteria": [
        "必须输出：改动计划（含影响分析）、完整代码、迁移/重命名映射（如有）、测试清单与结果、构建/运行日志",
        "若涉及接口行为变化，附带兼容策略或迁移步骤"
      ],
      "action": "校验输出工件齐全性，不足则继续补齐再结束",
      "keywords": ["交付物", "验证日志", "迁移指引", "影响分析"]
    },
    {
      "module": "Compliance",
      "name": "unlock_mode_self_assertion",
      "severity": "warning",
      "description": "响应开头显式声明当前执行模式并自检模式一致性，避免误入 SAFE 流程。",
      "criteria": [
        "响应首段包含：\"MODE=UNLOCK（已生效）\" 的自检行",
        "若检测到输出中出现 SAFE/最小改动倾向，立即自我纠偏并继续 UNLOCK 流程"
      ],
      "action": "在响应头部打印模式横幅并做一次模式一致性自检",
      "keywords": ["模式横幅", "一致性自检", "纠偏"]
    }
  ]
}
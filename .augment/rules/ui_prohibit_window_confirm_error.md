---
type: "agent_requested"
description: "Example description"
---
{
  "module": "UI",
  "name": "ui_prohibit_window_confirm_error",
  "severity": "error",
  "description": "禁止使用原生 window.confirm 弹窗。所有确认对话框必须使用现代 UI 组件实现，如 Dialog 组件，以保证一致的交互体验和可定制性。",
  "criteria": [
    "禁止在代码中调用 window.confirm 或类似原生阻塞弹窗",
    "所有确认交互必须使用统一的 UI 组件（如 Dialog）",
    "禁止在业务逻辑中直接依赖浏览器原生弹窗阻塞流程",
    "组件必须支持统一样式和可定制交互逻辑"
  ],
  "action": "检测到 window.confirm 调用时阻止执行，并提示使用指定的 UI 对话框组件替代。"
}
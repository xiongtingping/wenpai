---
type: "always_apply"
---

{
  "module": "UI",
  "name": "ui_enforce_design_tokens_critical",
  "severity": "critical",
  "description": "所有 UI 组件必须统一使用设计令牌系统（Design Tokens）来控制颜色、字体、间距等样式，禁止在组件中硬编码样式，以保证整体设计一致性。",
  "criteria": [
    "所有颜色、字体、间距等样式必须从设计令牌系统读取",
    "禁止在组件中直接写死样式值（如 color: '#FF0000'、margin: '12px'）",
    "禁止同时存在多套样式来源，必须统一通过 Design Tokens 进行管理",
    "检测到硬编码样式时阻止任务执行，并提示使用设计令牌替代"
  ],
  "action": "自动扫描组件样式，发现硬编码值时阻止提交，并提示开发者使用设计令牌系统统一样式。",
  "keywords": [
    "设计令牌",
    "统一样式",
    "硬编码禁止",
    "UI 组件",
    "风格一致性",
    "可维护性"
  ]
}
---
type: "always_apply"
---

{
  "name": "architecture_consistency_general_rules",
  "severity": "critical",
  "description": "为保持系统的统一性、可维护性与可扩展性，必须遵守以下架构通用原则：\n1. 所有 API 请求必须通过统一封装的请求模块处理，禁止使用裸 fetch / axios。\n2. 所有 API 地址与密钥必须从部署环境变量（如 .env, process.env, import.meta.env）中读取，严禁硬编码。\n3. 用户认证与权限控制必须集中统一，严禁混用多套认证系统（如 Authing + Firebase + JWT 并存）。\n4. 状态管理必须采用统一机制（如 Zustand / Redux / Pinia），保持结构一致。\n5. 用户行为追踪必须统一使用抽象封装（如 track(event, data)）并归入统一后端通道。\n6. 异常处理必须全局统一注册，具备可观测性与埋点。\n7. 整个系统中必须尽量使用统一平台组件，避免平台混用、服务冲突和维护成本上升。",
  "keywords": ["架构一致性", "统一封装", "环境变量", "权限控制", "状态管理", "埋点", "平台组件"]
}
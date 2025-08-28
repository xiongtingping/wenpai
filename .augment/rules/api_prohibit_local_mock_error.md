---
type: "always_apply"
description: "Example description"
---

{
  "module": "API",
  "name": "api_prohibit_local_mock_error",
  "severity": "error",
  "description": "禁止使用本地模拟、降级方案，所有功能必须依赖真实可用的 API 模型服务（如 OpenAI、DeepSeek），确保调用结果与生产环境一致。",
  "criteria": [
    "调用链必须连接至真实的在线 API 服务",
    "禁止使用本地 mock 数据文件或硬编码 JSON 响应",
    "禁止使用静态模板、占位内容、固定延迟模拟接口响应",
    "禁止使用固定响应字符串或数据结构替代真实调用"
  ],
  "action": "检测到本地模拟或降级调用时，阻止任务执行并提示必须连接真实 API 服务。",
  "keywords": [
    "禁止mock",
    "mock数据",
    "本地mock",
    "降级方案",
    "静态模板",
    "占位内容",
    "固定延迟",
    "固定响应",
    "硬编码响应",
    "假接口",
    "fake API",
    "stub",
    "placeholder response",
    "fake response"
  ]
}
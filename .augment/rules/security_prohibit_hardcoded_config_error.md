---
type: "agent_requested"
description: "Example description"
---
{
  "module": "Security",
  "name": "security_prohibit_hardcoded_config_error",
  "severity": "error",
  "description": "禁止硬编码配置项，所有 API 地址、密钥、redirectUri、模型参数等必须从 .env 或环境变量中读取。严禁在代码中直接写死平台域名、token、ID 等敏感配置。",
  "criteria": [
    "检测代码中是否存在硬编码的 API 地址或域名",
    "检测代码中是否存在直接写死的密钥、token、client ID 等敏感信息",
    "检测模型参数、redirectUri 等配置是否从环境变量或配置文件中读取",
    "禁止任何绕过环境变量直接使用敏感配置的写法"
  ],
  "action": "在检测到硬编码配置项时阻止执行任务，并提示开发者改用环境变量或配置文件读取。",
  "keywords": [
    "硬编码",
    "敏感信息",
    "环境变量",
    ".env",
    "API 地址",
    "密钥",
    "redirectUri",
    "安全配置",
    "安全策略"
  ]
}
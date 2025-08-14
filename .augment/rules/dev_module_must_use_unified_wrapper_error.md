---
type: "agent_requested"
description: "Example description"
---
{
  "module": "Development",
  "name": "dev_module_must_use_unified_wrapper_error",
  "severity": "error",
  "description": "模块接入必须统一封装，不得私自调用底层接口或绕过系统统一逻辑。所有 HTTP 请求、认证、权限判断、用户行为追踪等必须使用系统提供的封装方法，禁止多套系统并存或直接调用底层接口。",
  "criteria": [
    "所有 HTTP 请求必须通过 request.ts 封装的 axios 实例发出，禁止使用裸 fetch 或 axios.create() 直接调用",
    "认证逻辑必须使用 useUnifiedAuth()，权限判断必须使用 usePermission()",
    "用户行为追踪必须使用统一的 track() 方法，禁止直接调用原始事件接口",
    "禁止在模块中自行封装重复逻辑或绕过统一封装的请求/认证/权限路径",
    "禁止在项目中并存多套请求或认证系统"
  ],
  "action": "检测到未使用统一封装的模块调用时，阻止任务执行并提示使用系统提供的方法。"
}
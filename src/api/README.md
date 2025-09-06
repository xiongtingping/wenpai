# AI API 统一调用规范

## 📋 概述

本项目使用统一的 AI API 调用方式，所有涉及 AI 的请求都必须通过 `src/api/ai.ts` 中的 `callAI()` 函数进行。

## ⚠️ 重要提醒

- **禁止** 在项目中直接使用 `fetch` 或 `axios` 调用 OpenAI、Gemini、Deepseek 等 AI 接口
- **必须** 使用统一的 `callAI()` 函数
- **统一** 错误处理、重试机制、成本控制

## 🚀 快速开始

### 基础调用

```typescript
import { callAI } from '@/api/ai';

const result = await callAI({
  prompt: "请帮我写一个React组件",
  model: "gpt-4"
});

if (result.success) {
  console.log(result.content);
} else {
  console.error(result.error);
}
```

### 带系统提示的调用

```typescript
const result = await callAI({
  prompt: "分析这段代码",
  systemPrompt: "你是一个代码审查专家",
  model: "gpt-4",
  temperature: 0.3
});
```

### 流式响应

```typescript
const result = await callAI({
  prompt: "详细解释React Hooks",
  model: "gpt-4",
  stream: true
});
```

## 📚 支持的模型

| 模型类型 | 模型名称 | 说明 |
|---------|---------|------|
| OpenAI | `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo` | OpenAI 官方模型 |
| Gemini | `gemini-pro`, `gemini-pro-vision` | Google Gemini 模型 |
| Deepseek | `deepseek-chat`, `deepseek-coder` | Deepseek 模型 |
| Claude | `claude-3`, `claude-3-sonnet`, `claude-3-haiku` | Anthropic Claude 模型 |
| 本地模型 | `qwen`, `llama`, `mistral` | 本地部署模型 |

## 🔧 高级功能

### 批量调用

```typescript
import { callAIBatch } from '@/api/ai';

const prompts = [
  "写一个JavaScript函数",
  "写一个CSS样式",
  "写一个TypeScript接口"
];

const results = await callAIBatch(prompts, {
  model: "gpt-3.5-turbo",
  maxTokens: 300
});
```

### 带重试的调用

```typescript
import { callAIWithRetry } from '@/api/ai';

const result = await callAIWithRetry({
  prompt: "生成复杂算法",
  model: "gpt-4"
}, 3); // 最多重试3次
```

### 成本估算

```typescript
import { estimateAICost } from '@/api/ai';

const cost = estimateAICost("请解释React原理", "gpt-4");
console.log(`预计成本: $${cost.toFixed(4)}`);
```

### 服务状态检查

```typescript
import { checkAIStatus } from '@/api/ai';

const status = await checkAIStatus();
console.log(status.message);
```

## 📝 参数说明

### AICallParams

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `prompt` | `string` | - | 提示词（必需） |
| `model` | `AIModel` | `'gpt-4'` | AI模型名称 |
| `maxTokens` | `number` | `2000` | 最大token数 |
| `temperature` | `number` | `0.7` | 温度参数（0-1） |
| `systemPrompt` | `string` | - | 系统提示词 |
| `stream` | `boolean` | `false` | 是否流式响应 |
| `userId` | `string` | - | 用户ID（用于权限控制） |
| `extraParams` | `Record<string, any>` | `{}` | 额外参数 |

### AIResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| `content` | `string` | AI响应内容 |
| `model` | `string` | 使用的模型 |
| `usage` | `object` | Token使用情况 |
| `responseTime` | `number` | 响应时间（毫秒） |
| `success` | `boolean` | 是否成功 |
| `error` | `string` | 错误信息 |

## 🛡️ 错误处理

```typescript
try {
  const result = await callAI({
    prompt: "生成内容",
    model: "gpt-4"
  });

  if (!result.success) {
    // 处理AI调用失败
    console.error('AI调用失败:', result.error);
    // 实现降级逻辑
    return fallbackResponse();
  }

  return result.content;
} catch (error) {
  // 处理网络错误等异常
  console.error('调用异常:', error);
  throw error;
}
```

## 💰 成本控制

### 成本估算

```typescript
const prompt = "请详细解释React原理";
const gpt4Cost = estimateAICost(prompt, "gpt-4");
const gpt35Cost = estimateAICost(prompt, "gpt-3.5-turbo");

console.log(`GPT-4成本: $${gpt4Cost.toFixed(4)}`);
console.log(`GPT-3.5成本: $${gpt35Cost.toFixed(4)}`);
```

### 成本优化建议

1. **选择合适的模型**：简单任务使用 `gpt-3.5-turbo`，复杂任务使用 `gpt-4`
2. **控制token数量**：设置合理的 `maxTokens` 参数
3. **优化提示词**：简洁明了的提示词可以减少token消耗
4. **批量处理**：使用 `callAIBatch` 进行批量调用

## 🔐 权限控制

```typescript
// 检查用户权限
const hasPermission = checkUserAIPermission(userId);

if (!hasPermission) {
  return {
    content: "权限不足",
    success: false,
    error: "需要升级账户"
  };
}

// 调用AI时传递用户ID
const result = await callAI({
  prompt: userPrompt,
  userId: userId,
  model: "gpt-4"
});
```

## 📊 监控和日志

所有AI调用都会自动记录：
- 调用时间
- 使用的模型
- Token消耗
- 响应时间
- 错误信息

## 🧪 测试

### 单元测试示例

```typescript
import { callAI } from '@/api/ai';

describe('AI API', () => {
  it('should return successful response', async () => {
    const result = await callAI({
      prompt: "Hello",
      model: "gpt-3.5-turbo",
      maxTokens: 10
    });

    expect(result.success).toBe(true);
    expect(result.content).toBeTruthy();
  });
});
```

## 📞 支持

如果遇到问题，请：

1. 检查API密钥配置
2. 查看控制台错误信息
3. 确认网络连接
4. 联系开发团队

## 🔄 更新日志

- **v1.0.0**: 初始版本，支持基础AI调用
- **v1.1.0**: 添加流式响应支持
- **v1.2.0**: 添加批量调用和重试机制
- **v1.3.0**: 添加成本估算和权限控制

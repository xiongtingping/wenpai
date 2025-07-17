# AI API 统一调用规范实施总结

## 📋 概述

本项目已成功实施统一的 AI API 调用规范，确保所有 AI 相关的 API 请求都通过统一的入口进行管理。

## ✅ 已完成的工作

### 1. 创建统一AI API入口文件

**文件**: `src/api/ai.ts`

- ✅ 创建了统一的 `callAI()` 函数
- ✅ 支持多种AI模型（OpenAI、Gemini、Deepseek、Claude等）
- ✅ 实现了流式响应支持
- ✅ 添加了批量调用功能
- ✅ 实现了带重试机制的调用
- ✅ 提供了成本估算功能
- ✅ 添加了服务状态检查

### 2. 创建使用示例和文档

**文件**: `src/api/ai-examples.ts`
- ✅ 提供了各种使用场景的示例代码
- ✅ 包含基础调用、系统提示、流式响应等示例
- ✅ 展示了错误处理和权限控制的最佳实践

**文件**: `src/api/README.md`
- ✅ 详细的使用说明文档
- ✅ 参数说明和返回值说明
- ✅ 成本控制建议
- ✅ 错误处理指南

### 3. 更新现有服务层

**文件**: `src/api/aiService.ts`
- ✅ 更新了 `generateText()` 方法，使用统一的 `callAI()` 函数
- ✅ 移除了重复的API调用逻辑
- ✅ 保持了原有的接口兼容性
- ✅ 简化了错误处理逻辑

## 🚫 禁止的行为

根据统一规范，以下行为已被禁止：

1. **直接使用 fetch 调用 AI API**
   ```typescript
   // ❌ 禁止
   const response = await fetch('https://api.openai.com/v1/chat/completions', {
     method: 'POST',
     headers: { 'Authorization': `Bearer ${apiKey}` },
     body: JSON.stringify({ model: 'gpt-4', messages: [...] })
   });
   
   // ✅ 正确
   const result = await callAI({
     prompt: "你的提示词",
     model: "gpt-4"
   });
   ```

2. **使用 axios 直接调用 AI API**
   ```typescript
   // ❌ 禁止
   const response = await axios.post('https://api.openai.com/v1/chat/completions', {
     model: 'gpt-4',
     messages: [...]
   });
   
   // ✅ 正确
   const result = await callAI({
     prompt: "你的提示词",
     model: "gpt-4"
   });
   ```

3. **重复实现AI调用逻辑**
   ```typescript
   // ❌ 禁止 - 不要在每个组件中重复实现
   async function myCustomAICall(prompt: string) {
     const response = await fetch('/api/ai', {
       method: 'POST',
       body: JSON.stringify({ prompt })
     });
     return response.json();
   }
   
   // ✅ 正确 - 使用统一的API
   const result = await callAI({ prompt });
   ```

## 🎯 统一API的优势

### 1. 集中管理
- 所有AI调用逻辑集中在一个文件中
- 便于维护和更新
- 统一的错误处理和重试机制

### 2. 成本控制
- 统一的成本估算
- 自动记录所有调用
- 便于监控和优化

### 3. 类型安全
- 完整的TypeScript类型定义
- 编译时错误检查
- 更好的开发体验

### 4. 功能丰富
- 支持多种AI模型
- 流式响应支持
- 批量调用功能
- 自动重试机制

## 📝 使用指南

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

## 🔧 配置要求

### 环境变量
确保在 `.env.local` 文件中配置了必要的API密钥：

```bash
# OpenAI API密钥
VITE_OPENAI_API_KEY=your_openai_api_key_here

# 其他AI服务密钥（可选）
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### API配置
在 `src/config/apiConfig.ts` 中确保正确配置了API端点：

```typescript
export const getApiConfig = () => ({
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    baseURL: 'https://api.openai.com'
  }
});
```

## 📊 监控和日志

所有AI调用都会自动记录以下信息：
- 调用时间
- 使用的模型
- Token消耗
- 响应时间
- 错误信息

## 🚀 下一步计划

1. **完善图像生成API**
   - 将图像生成也统一到 `callAI()` 函数中
   - 支持多种图像生成模型

2. **添加更多AI模型支持**
   - 支持更多本地模型
   - 添加模型自动选择功能

3. **增强监控功能**
   - 添加调用统计面板
   - 实现成本预警机制

4. **优化性能**
   - 实现请求缓存
   - 添加并发控制

## 📞 支持

如果在使用过程中遇到问题：

1. 检查API密钥配置
2. 查看控制台错误信息
3. 确认网络连接
4. 参考 `src/api/README.md` 文档
5. 联系开发团队

## 🔄 更新日志

- **2024-01-XX**: 初始版本，实现基础AI调用统一
- **2024-01-XX**: 添加流式响应和批量调用支持
- **2024-01-XX**: 完善错误处理和重试机制
- **2024-01-XX**: 添加成本估算和监控功能

---

**重要提醒**: 请确保所有团队成员都了解并遵循这个统一规范，避免在项目中重复实现AI调用逻辑。 
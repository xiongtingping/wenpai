# API 文档

> 自动生成于 2025/9/16 10:24:21

## 概览

📊 **统计信息**
- 📁 扫描文件: 584
- 🔧 发现API: 1388
- 📝 已文档化函数: 700
- 🏗️ 已文档化服务: 143
- 🌐 已文档化端点: 1

## 目录

- [🏗️ 服务层](#service)

## 🏗️ 服务层

### serviceStatusExample

服务状态检查示例
/

**文件:** `api/ai-examples.ts`

**返回值:** `void`

### detectViolations

🚨 违规行为检测 - 检测是否有直接AI API调用
/

**文件:** `api/aiService.ts`

**返回值:** `string[]`

### callAI

🎯 统一AI服务调用入口 - 所有AI调用的标准接口

@param params AI调用参数
@returns AI响应结果

@example
```typescript
// 标准调用方式
const result = await callAI({
prompt: '请帮我生成一段品牌介绍',
taskType: AITaskType.BRAND_DESCRIPTION,
});

// 带上下文的调用
const result = await callAI({
prompt: '分析这个品牌',
taskType: AITaskType.BRAND_ANALYSIS,
context: { brandName: '示例品牌', industry: '科技' }
});
```
/

**文件:** `api/aiService.ts`

**参数:**
- `params` (`AICallParams`)

**返回值:** `AICallParams): Promise<AIResponse>`

### checkAIStatus

检查AI服务状态
/

**文件:** `api/aiService.ts`

**返回值:** `Promise<`

### initializeAIService

==================== 模块初始化 ====================

🚀 AI服务模块初始化
在应用启动时调用，进行必要的检查和设置
/

**文件:** `api/aiService.ts`

**返回值:** `Promise<`

*查看更多 [295] 个API：[🏗️ 服务层 完整文档](service.md)*

- [🌐 API接口](#api)

## 🌐 API接口

### basicAIExample

基础AI调用示例
/

**文件:** `api/ai-examples.ts`

**返回值:** `void`

### systemPromptExample

带系统提示的AI调用示例
/

**文件:** `api/ai-examples.ts`

**返回值:** `void`

### streamingAIExample

流式AI调用示例
/

**文件:** `api/ai-examples.ts`

**返回值:** `void`

### batchAIExample

批量AI调用示例
/

**文件:** `api/ai-examples.ts`

**返回值:** `void`

### retryAIExample

带重试的AI调用示例
/

**文件:** `api/ai-examples.ts`

**返回值:** `void`

*查看更多 [52] 个API：[🌐 API接口 完整文档](api.md)*

- [🔧 工具函数](#utility)

## 🔧 工具函数

### replaceTemplateVariables

✅ FIXED: 2025-07-25 AI系统工具函数

🎯 用途：
- 提示词组装和处理
- 流式输出处理
- 调试和日志工具

📌 已封装：此工具集已验证可用，请勿修改

/

提示词模板变量替换

/

**文件:** `ai/utils/index.ts`

**参数:**
- `template` (`string`)
- `variables` (`Record<string`)
- `any>` (`any`)

**返回值:** `string, variables: Record<string, any>): string`

### estimateTokenCount

计算文本token数量（估算）

/

**文件:** `ai/utils/index.ts`

**参数:**
- `text` (`string`)

**返回值:** `string): number`

### formatDebugInfo

格式化调试信息

/

**文件:** `ai/utils/index.ts`

**参数:**
- `info` (`any`)

**返回值:** `any): string`

### safeJsonParse

安全的JSON解析

/

**文件:** `ai/utils/index.ts`

**参数:**
- `text` (`string`)
- `fallback` (`any = null`)

**返回值:** `string, fallback: any = null): any`

### cleanText

清理和格式化文本

/

**文件:** `ai/utils/index.ts`

**参数:**
- `text` (`string`)

**返回值:** `string): string`

*查看更多 [200] 个API：[🔧 工具函数 完整文档](utility.md)*

- [🔒 认证授权](#auth)

## 🔒 认证授权

### SimpleAuthProvider

Provider组件

**文件:** `auth/SimpleAuthProvider.tsx`

**返回值:** `void`

### useSimpleAuth

Hook for using auth context

**文件:** `auth/SimpleAuthProvider.tsx`

**返回值:** `void`

### useAuth

兼容性Hook - 确保现有代码正常工作

**文件:** `auth/SimpleAuthProvider.tsx`

**返回值:** `void`

### createOfficialAuthSDK

创建官方Guard实例，增强配置验证和错误处理
/

**文件:** `auth/officialAuthConfig.ts`

**返回值:** `any`

### resolveAuthingGuardConfig

暂无描述

**文件:** `authing/configResolver.ts`

**参数:**
- `base` (`BaseAuthingConfig`)

**返回值:** `BaseAuthingConfig): Promise<ResolvedGuardConfig>`

*查看更多 [13] 个API：[🔒 认证授权 完整文档](auth.md)*

- [🤖 AI服务](#ai)

## 🤖 AI服务

### getBrandPromptByTask

根据品牌任务类型选择合适的提示词函数

/

**文件:** `ai/prompts/brand.ts`

**参数:**
- `task` (`string`)

**返回值:** `string): PromptTemplate`

### createDeepSeekProvider

创建DeepSeek提供者实例

/

**文件:** `ai/providers/deepseek.ts`

**返回值:** `DeepSeekProvider`

### createOpenAIProvider

创建OpenAI提供者实例

/

**文件:** `ai/providers/openai.ts`

**返回值:** `OpenAIProvider`

### executeBatchForward

执行批量转发自动化（主要入口函数）
增强版本，支持多种自动化方式
/

**文件:** `automation/batchForward.ts`

**参数:**
- `options` (`BatchForwardOptions`)

**返回值:** `BatchForwardOptions): Promise<LegacyForwardResult[]>`

### useErrorBoundary

函数式错误边界Hook
/

**文件:** `components/ErrorBoundary.tsx`

**返回值:** `void`

*查看更多 [258] 个API：[🤖 AI服务 完整文档](ai.md)*


## 快速开始

### AI 服务调用示例

```typescript
import { callAI } from '@/api/ai';

// 基础AI调用
const result = await callAI({
  prompt: '请帮我生成一篇关于React的文章',
  model: 'gpt-3.5-turbo'
});

console.log(result.text);
```

### 用户认证示例

```typescript
import { verifyPermission } from '@/services/serverPermissionService';

// 权限验证
const hasPermission = await verifyPermission('ai_generation');
if (hasPermission) {
  // 执行需要权限的操作
}
```

### 错误处理示例

```typescript
import { logError } from '@/utils/errorHandler';

try {
  await someAsyncOperation();
} catch (error) {
  logError(error, { component: 'MyComponent', action: 'operation' });
}
```

## 贡献指南

如果你发现API文档有误或需要补充，请：

1. 在代码中添加JSDoc注释
2. 运行 `npm run docs:generate` 重新生成文档
3. 提交PR

## 更新日志

查看 [CHANGELOG.md](../CHANGELOG.md) 了解API变更历史。

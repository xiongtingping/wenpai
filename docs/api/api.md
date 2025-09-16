# 🌐 API接口

## basicAIExample

基础AI调用示例
/

**文件:** `api/ai-examples.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await basicAIExample();
```

---

## systemPromptExample

带系统提示的AI调用示例
/

**文件:** `api/ai-examples.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await systemPromptExample();
```

---

## streamingAIExample

流式AI调用示例
/

**文件:** `api/ai-examples.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await streamingAIExample();
```

---

## batchAIExample

批量AI调用示例
/

**文件:** `api/ai-examples.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await batchAIExample();
```

---

## retryAIExample

带重试的AI调用示例
/

**文件:** `api/ai-examples.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await retryAIExample();
```

---

## contentGenerationExample

内容生成示例
/

**文件:** `api/ai-examples.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await contentGenerationExample();
```

---

## codeReviewExample

代码审查示例
/

**文件:** `api/ai-examples.ts`

**类型:** 异步函数

### 参数

- **`code`** (`string`)

### 返回值

`string)`

### 使用示例

```typescript
const result = await codeReviewExample('example');
```

---

## errorHandlingExample

错误处理示例
/

**文件:** `api/ai-examples.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await errorHandlingExample();
```

---

## costEstimationExample

成本估算示例
/

**文件:** `api/ai-examples.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = costEstimationExample();
```

---

## userPermissionExample

用户权限控制示例
/

**文件:** `api/ai-examples.ts`

**类型:** 异步函数

### 参数

- **`userId`** (`string`)
- **`userPrompt`** (`string`)

### 返回值

`string, userPrompt: string)`

### 使用示例

```typescript
const result = await userPermissionExample('example', 'example');
```

---

## modelComparisonExample

多模型对比示例
/

**文件:** `api/ai-examples.ts`

**类型:** 异步函数

### 参数

- **`prompt`** (`string`)

### 返回值

`string)`

### 使用示例

```typescript
const result = await modelComparisonExample('example');
```

---

## callAI

统一的AI API调用函数

@param params AI调用参数
@returns AI响应结果

@example
```typescript
// 基础对话
const result = await callAI({
prompt: '你好，请介绍一下人工智能',
model: 'gpt-4'
});

// 带系统提示词的对话
const result = await callAI({
prompt: '分析这段代码的性能问题',
model: 'gpt-4',
systemPrompt: '你是一个专业的代码审查专家',
temperature: 0.3
});
```
/

**文件:** `api/ai.ts`

**类型:** 异步函数

### 参数

- **`params`** (`AICallParams`)

### 返回值

`AICallParams): Promise<AIResponse>`

### 使用示例

```typescript
const result = await callAI(value);
```

---

## generateImage

统一的图像生成API调用函数

@param params 图像生成参数
@returns 图像生成响应结果

@example
```typescript
// 基础图像生成
const result = await generateImage({
prompt: '一只可爱的小猫坐在花园里',
model: 'dall-e-3',
size: '1024x1024'
});

// 带参考图像的变体生成
const result = await generateImage({
prompt: '将这个图像变成水彩画风格',
model: 'dall-e-3',
referenceImage: 'data:image/jpeg;base64,...'
});
```
/

**文件:** `api/ai.ts`

**类型:** 异步函数

### 参数

- **`params`** (`ImageGenerationParams`)

### 返回值

`ImageGenerationParams): Promise<ImageGenerationResponse>`

### 使用示例

```typescript
const result = await generateImage(value);
```

---

## callAIBatch

批量AI调用

@param prompts 提示词数组
@param params 通用参数
@returns 响应结果数组
/

**文件:** `api/ai.ts`

**类型:** 异步函数

### 返回值

`string[], 
  params: Omit<AICallParams, 'prompt'> =`

### 使用示例

```typescript
const result = await callAIBatch();
```

---

## callAIWithRetry

带重试的AI调用

@param params AI调用参数
@param maxRetries 最大重试次数
@returns AI响应结果
/

**文件:** `api/ai.ts`

**类型:** 异步函数

### 参数

- **`;
  params`** (`AICallParams`)
- **`maxRetries`** (`number = 8`)

### 返回值

`AICallParams, 
  maxRetries: number = 8
): Promise<AIResponse>`

### 使用示例

```typescript
const result = await callAIWithRetry(value, 123);
```

---

## checkAIStatus

检查AI服务状态

@returns 服务状态信息
/

**文件:** `api/ai.ts`

**类型:** 异步函数

### 返回值

`Promise<`

### 使用示例

```typescript
const result = await checkAIStatus();
```

---

## getAvailableModels

获取AI模型列表

@returns 可用模型列表
/

**文件:** `api/ai.ts`

**类型:** 同步函数

### 返回值

`AIModel[]`

### 使用示例

```typescript
const result = getAvailableModels();
```

---

## estimateAICost

估算AI调用成本

@param prompt 提示词
@param model 模型
@returns 估算成本（美元）
/

**文件:** `api/ai.ts`

**类型:** 同步函数

### 参数

- **`prompt`** (`string`)
- **`model`** (`AIModel = 'gpt-4'`)

### 返回值

`string, model: AIModel = 'gpt-4'): number`

### 使用示例

```typescript
const result = estimateAICost('example', value);
```

---

## callOpenAIProxy

调用OpenAI API代理
✅ FIXED: 消除硬编码，从配置管理器获取参数
@param messages 消息数组
@param model 模型名称（可选，从配置获取默认值）
@param temperature 温度参数（可选，从配置获取默认值）
@param maxTokens 最大token数（可选，从配置获取默认值）
@returns Promise with response data
/

**文件:** `api/apiProxy.ts`

**类型:** 异步函数

### 参数

- **`;
  messages`** (`any[]`)
- **`model`** (`string`) - 可选
- **`temperature`** (`number`) - 可选
- **`maxTokens`** (`number`) - 可选

### 返回值

`any[],
  model?: string,
  temperature?: number,
  maxTokens?: number
): Promise<ProxyResponse>`

### 使用示例

```typescript
const result = await callOpenAIProxy(value, 'example', 123, 123);
```

---

## callDeepSeekProxy

调用DeepSeek API代理
✅ FIXED: 消除硬编码，从配置管理器获取参数
@param messages 消息数组
@param model 模型名称（可选，从配置获取默认值）
@param temperature 温度参数（可选，从配置获取默认值）
@returns Promise with response data
/

**文件:** `api/apiProxy.ts`

**类型:** 异步函数

### 参数

- **`;
  messages`** (`any[]`)
- **`model`** (`string`) - 可选
- **`temperature`** (`number`) - 可选

### 返回值

`any[],
  model?: string,
  temperature?: number
): Promise<ProxyResponse>`

### 使用示例

```typescript
const result = await callDeepSeekProxy(value, 'example', 123);
```

---

## callGeminiProxy

调用Google Gemini API代理
@param prompt 提示文本
@returns Promise with response data
/

**文件:** `api/apiProxy.ts`

**类型:** 异步函数

### 参数

- **`prompt`** (`string`)

### 返回值

`string): Promise<ProxyResponse>`

### 使用示例

```typescript
const result = await callGeminiProxy('example');
```

---

## testApiConnectivity

测试API连接性
@returns Promise with API status
/

**文件:** `api/apiProxy.ts`

**类型:** 异步函数

### 返回值

`Promise<ProxyResponse>`

### 使用示例

```typescript
const result = await testApiConnectivity();
```

---

## checkOpenAIAvailability

检查OpenAI API可用性
@returns Promise with availability status
/

**文件:** `api/apiProxy.ts`

**类型:** 异步函数

### 返回值

`Promise<ProxyResponse>`

### 使用示例

```typescript
const result = await checkOpenAIAvailability();
```

---

## checkGeminiAvailability

检查Gemini API可用性
@returns Promise with availability status
/

**文件:** `api/apiProxy.ts`

**类型:** 异步函数

### 返回值

`Promise<ProxyResponse>`

### 使用示例

```typescript
const result = await checkGeminiAvailability();
```

---

## checkDeepSeekAvailability

检查DeepSeek API可用性
@returns Promise with availability status
/

**文件:** `api/apiProxy.ts`

**类型:** 异步函数

### 返回值

`Promise<ProxyResponse>`

### 使用示例

```typescript
const result = await checkDeepSeekAvailability();
```

---

## generateAdaptedContent

暂无描述

**文件:** `api/contentAdapter.ts`

**类型:** 异步函数

### 参数

- **`;
  request`** (`ContentAdaptationRequest`)

### 返回值

`ContentAdaptationRequest
): Promise<ContentAdaptationResponse>`

### 使用示例

```typescript
const result = await generateAdaptedContent(value);
```

---

## regenerateAdaptedContent

重新生成平台适配内容
@param request 内容适配请求参数
@returns 重新适配后的内容
/

**文件:** `api/contentAdapter.ts`

**类型:** 异步函数

### 参数

- **`;
  request`** (`ContentAdaptationRequest`)

### 返回值

`ContentAdaptationRequest
): Promise<ContentAdaptationResponse>`

### 使用示例

```typescript
const result = await regenerateAdaptedContent(value);
```

---

## generateMultiPlatformContent

批量生成多平台适配内容
@param originalContent 原始内容
@param platforms 目标平台列表
@param formId 内容形式ID
@param style 风格类型
@returns 多平台适配内容
/

**文件:** `api/contentAdapter.ts`

**类型:** 异步函数

### 参数

- **`;
  originalContent`** (`string`)
- **`platforms`** (`string[]`)
- **`formId`** (`string`) - 可选
- **`style`** (`StyleType = 'professional'`)

### 返回值

`string,
  platforms: string[],
  formId?: string,
  style: StyleType = 'professional'
): Promise<ContentAdaptationResponse[]>`

### 使用示例

```typescript
const result = await generateMultiPlatformContent('example', 'example', 'example', value);
```

---

## getAvailablePlatforms

获取平台列表
/

**文件:** `api/contentAdapter.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = getAvailablePlatforms();
```

---

## getAvailableStyles

获取风格列表
/

**文件:** `api/contentAdapter.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = getAvailableStyles();
```

---

## callOpenAIDevProxy

调用OpenAI API（开发环境，使用统一AI接口）
@param options 请求选项
@returns Promise with response data
/

**文件:** `api/devApiProxy.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await callOpenAIDevProxy();
```

---

## testDevApiConnectivity

测试API连接性
@returns Promise with API status
/

**文件:** `api/devApiProxy.ts`

**类型:** 异步函数

### 返回值

`Promise<DevProxyResponse>`

### 使用示例

```typescript
const result = await testDevApiConnectivity();
```

---

## callGeminiAPI

调用 Gemini API（通过统一AI接口）
@param systemPrompt 系统提示词
@param userPrompt 用户输入
@returns AI 返回内容
/

**文件:** `api/geminiAdapter.ts`

**类型:** 异步函数

### 参数

- **`;
  systemPrompt`** (`string`)
- **`userPrompt`** (`string`)

### 返回值

`string,
  userPrompt: string
): Promise<AIApiResponse>`

### 使用示例

```typescript
const result = await callGeminiAPI('example', 'example');
```

---

## callOpenAIProxy

调用OpenAI API代理
/

**文件:** `api/localApiProxy.ts`

**类型:** 异步函数

### 参数

- **`messages`** (`any[]`)
- **`model`** (`string = 'gpt-4o'`)
- **`temperature`** (`number = 0.7`)
- **`maxTokens`** (`number = 1000`)

### 返回值

`any[],
  model: string = 'gpt-4o',
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<ProxyResponse>`

### 使用示例

```typescript
const result = await callOpenAIProxy(value, 'example', 123, 123);
```

---

## testApiConnectivity

测试API连接性
/

**文件:** `api/localApiProxy.ts`

**类型:** 异步函数

### 返回值

`Promise<ProxyResponse>`

### 使用示例

```typescript
const result = await testApiConnectivity();
```

---

## checkOpenAIAvailability

检查OpenAI可用性
/

**文件:** `api/localApiProxy.ts`

**类型:** 异步函数

### 返回值

`Promise<ProxyResponse>`

### 使用示例

```typescript
const result = await checkOpenAIAvailability();
```

---

## createDeepSeekProvider

创建DeepSeek提供者实例

/

**文件:** `api/providers/deepseek.ts`

**类型:** 同步函数

### 参数

- **`apiKey`** (`string`)

### 返回值

`string): DeepSeekProvider`

### 使用示例

```typescript
const result = createDeepSeekProvider('example');
```

---

## createOpenAIProvider

创建OpenAI提供者实例

/

**文件:** `api/providers/openai.ts`

**类型:** 同步函数

### 参数

- **`apiKey`** (`string`)

### 返回值

`string): OpenAIProvider`

### 使用示例

```typescript
const result = createOpenAIProvider('example');
```

---

## callUnifiedAI

便捷的AI调用函数 - 替代原有的硬编码实现
/

**文件:** `api/unifiedAIManager.ts`

**类型:** 异步函数

### 参数

- **`params`** (`AICallParams`)

### 返回值

`AICallParams): Promise<ExtendedAIResponse>`

### 使用示例

```typescript
const result = await callUnifiedAI(value);
```

---

## generateUnifiedImage

便捷的图像生成函数
/

**文件:** `api/unifiedAIManager.ts`

**类型:** 异步函数

### 参数

- **`params`** (`ImageGenerationParams`)

### 返回值

`ImageGenerationParams): Promise<any>`

### 使用示例

```typescript
const result = await generateUnifiedImage(value);
```

---

## checkAISystemStatus

检查AI系统状态
/

**文件:** `api/unifiedAIManager.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = checkAISystemStatus();
```

---

## createErrorFromAPIError

从API错误创建错误信息
/

**文件:** `components/error/GlobalErrorHandler.tsx`

**类型:** 同步函数

### 参数

- **`error`** (`any`)
- **`url`** (`string`) - 可选

### 返回值

`any, url?: string): Omit<ErrorInfo, 'id' | 'timestamp'>`

### 使用示例

```typescript
const result = createErrorFromAPIError(value, 'example');
```

---

## PlatformApiManager

平台API配置管理组件
@param props 组件属性
@returns React组件
/

**文件:** `components/platform/PlatformApiManager.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = PlatformApiManager();
```

---

## buildAPIURL

构建完整的API URL
@param provider AI服务提供商名称
@param endpoint 具体端点路径
@param pathParams 路径参数（如模型名称）
@returns 完整的API URL
/

**文件:** `config/aiEndpoints.ts`

**类型:** 同步函数

### 参数

- **`provider`** (`string`)
- **`endpoint`** (`'chat' | 'image' | 'models'`)
- **`pathParams`** (`Record<string`) - 可选
- **`string>`** (`any`)

### 返回值

`string, 
  endpoint: 'chat' | 'image' | 'models', 
  pathParams?: Record<string, string>
): string`

### 使用示例

```typescript
const result = buildAPIURL('example', value, 'example', value);
```

---

## getAPIHeaders

获取API请求头
@param provider AI服务提供商名称
@param apiKey API密钥
@param customHeaders 自定义请求头
@returns 完整的请求头对象
/

**文件:** `config/aiEndpoints.ts`

**类型:** 同步函数

### 参数

- **`provider`** (`string`)
- **`apiKey`** (`string`)
- **`customHeaders`** (`Record<string`) - 可选
- **`string>`** (`any`)

### 返回值

`string, 
  apiKey: string, 
  customHeaders?: Record<string, string>
): Record<string, string>`

### 使用示例

```typescript
const result = getAPIHeaders('example', 'example', 'example', value);
```

---

## getAPIKey

安全获取API密钥
@param service 服务名称
@returns API密钥或null
/

**文件:** `config/apiKeyManager.ts`

**类型:** 同步函数

### 参数

- **`service`** (`string`)

### 返回值

`string): string | null`

### 使用示例

```typescript
const result = getAPIKey('example');
```

---

## validateAPIKey

验证API密钥有效性
@param service 服务名称
@param apiKey 可选的密钥（不提供则从环境变量获取）
@returns 验证结果
/

**文件:** `config/apiKeyManager.ts`

**类型:** 同步函数

### 参数

- **`service`** (`string`)
- **`apiKey`** (`string`) - 可选

### 返回值

`string, apiKey?: string): KeyValidationResult`

### 使用示例

```typescript
const result = validateAPIKey('example', 'example');
```

---

## maskAPIKey

脱敏显示API密钥
@param apiKey 原始密钥
@returns 脱敏后的密钥
/

**文件:** `config/apiKeyManager.ts`

**类型:** 同步函数

### 参数

- **`apiKey`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = maskAPIKey('example');
```

---

## checkAllAPIKeys

检查所有API密钥配置状态
@returns 所有密钥的验证结果
/

**文件:** `config/apiKeyManager.ts`

**类型:** 同步函数

### 返回值

`Record<string, KeyValidationResult>`

### 使用示例

```typescript
const result = checkAllAPIKeys();
```

---

## getMissingRequiredKeys

获取缺失的必需API密钥
@returns 缺失的必需密钥列表
/

**文件:** `config/apiKeyManager.ts`

**类型:** 同步函数

### 返回值

`string[]`

### 使用示例

```typescript
const result = getMissingRequiredKeys();
```

---

## createPlatformAPICaller

创建平台特定的API调用包装器
/

**文件:** `utils/apiRequestQueue.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string)`

### 使用示例

```typescript
const result = createPlatformAPICaller('example');
```

---

## safeApiParams

安全的API参数构建器
/

**文件:** `utils/safeStringUtils.ts`

**类型:** 同步函数

### 参数

- **`params`** (`Record<string`)
- **`any>`** (`any`)

### 返回值

`Record<string, any>): Record<string, string>`

### 使用示例

```typescript
const result = safeApiParams('example', value);
```

---

## DeepSeekProvider

DeepSeek服务商实现类

/

**文件:** `api/providers/deepseek.ts`

**类型:** 类

### 方法

- **`isConfigured`**  
  检查API密钥是否有效

/
- **`getSupportedModels`**  
  获取支持的模型列表

/
- **`isModelSupported`**  
  检查模型是否支持

/
- **`callChat`**  (异步)
  调用DeepSeek聊天接口

/
- **`if`**  
  添加系统消息
- **`catch`**  
- **`generateImage`**  (异步)
  调用DeepSeek图像生成接口（暂不支持）

/
- **`getProviderInfo`**  
  获取提供者信息

/

---

## OpenAIProvider

OpenAI服务商实现类

/

**文件:** `api/providers/openai.ts`

**类型:** 类

### 方法

- **`isConfigured`**  
  检查API密钥是否有效

/
- **`getSupportedModels`**  
  获取支持的模型列表

/
- **`isModelSupported`**  
  检查模型是否支持

/
- **`callChat`**  (异步)
  调用OpenAI聊天接口

/
- **`if`**  
  添加系统消息
- **`catch`**  
- **`generateImage`**  (异步)
  调用OpenAI图像生成接口

/
- **`catch`**  
- **`getProviderInfo`**  
  获取提供者信息

/

---

## UnifiedAIManager

统一AI管理器类
/

**文件:** `api/unifiedAIManager.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
  获取单例实例
/
- **`if`**  
- **`initializeManager`**  
- **`validateSystemConfiguration`**  
- **`if`**  
- **`generateRequestId`**  
- **`getCacheKey`**  
- **`checkCache`**  
- **`setCache`**  
- **`cleanExpiredCache`**  
- **`if`**  
- **`buildAIConfig`**  (异步)
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`sendAIRequest`**  (异步)
- **`catch`**  
- **`buildRequestBody`**  
- **`if`**  
  添加系统消息
- **`makeHTTPRequest`**  (异步)
- **`if`**  
- **`catch`**  
- **`parseAIResponse`**  
- **`callAI`**  (异步)
  统一AI调用入口 - 主要公共方法
/
- **`if`**  
  参数验证
- **`if`**  
- **`if`**  
  缓存成功响应
- **`catch`**  
- **`getUserTier`**  
- **`if`**  
- **`catch`**  
- **`generateImage`**  (异步)
  图像生成调用
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getSystemStatus`**  
  获取系统状态
/
- **`cleanup`**  
  清理系统资源
/

---

## APIKeyManager

API密钥管理器类
提供运行时密钥管理功能
/

**文件:** `config/apiKeyManager.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
  获取单例实例
/
- **`if`**  
- **`initializeCache`**  
- **`if`**  
- **`getCachedKey`**  
  获取缓存的密钥
@param service 服务名称
/
- **`refreshKey`**  
  刷新单个服务的密钥缓存
@param service 服务名称
/
- **`if`**  
- **`getCachedValidation`**  
  获取缓存的验证结果
@param service 服务名称
/
- **`clearCache`**  
  清空所有缓存
/
- **`getSystemOverview`**  
  获取系统配置概览
/

---

## ApiKeyValidator

API密钥验证器类
/

**文件:** `utils/apiKeyValidator.ts`

**类型:** 类

### 方法

- **`detectProvider`** (静态) 
  检测API密钥提供商
/
- **`validateFormat`** (静态) 
  验证API密钥格式
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`validateOpenAIKey`** (静态) (异步)
  验证OpenAI API密钥（真实API调用）
/
- **`if`**  
- **`catch`**  
- **`validateApiKey`** (静态) (异步)
  通用API密钥验证（自动检测提供商并验证）
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`switch`**  
  根据提供商选择验证方法

---


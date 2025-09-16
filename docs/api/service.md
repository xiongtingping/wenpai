# 🏗️ 服务层

## serviceStatusExample

服务状态检查示例
/

**文件:** `api/ai-examples.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await serviceStatusExample();
```

---

## detectViolations

🚨 违规行为检测 - 检测是否有直接AI API调用
/

**文件:** `api/aiService.ts`

**类型:** 同步函数

### 返回值

`string[]`

### 使用示例

```typescript
const result = detectViolations();
```

---

## callAI

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

## checkAIStatus

检查AI服务状态
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 返回值

`Promise<`

### 使用示例

```typescript
const result = await checkAIStatus();
```

---

## initializeAIService

==================== 模块初始化 ====================

🚀 AI服务模块初始化
在应用启动时调用，进行必要的检查和设置
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 返回值

`Promise<`

### 使用示例

```typescript
const result = await initializeAIService();
```

---

## callPDFChat

==================== 专用AI功能方法 ====================

📄 PDF文档对话专用方法

@param params PDF对话参数
@returns AI响应结果
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await callPDFChat();
```

---

## callContentAdapter

🔄 内容适配专用方法（多维矩阵提示词系统）

@param params 内容适配参数
@returns AI响应结果
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await callContentAdapter();
```

---

## callCreativeGeneration

🎨 创意内容生成专用方法（九宫创意魔方）

@param params 创意生成参数
@returns AI响应结果
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await callCreativeGeneration();
```

---

## callContentSummarizer

内容总结专用方法
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await callContentSummarizer();
```

---

## callBrandAnalyzer

品牌分析专用方法
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await callBrandAnalyzer();
```

---

## callEmojiGenerator

Emoji生成描述专用方法
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await callEmojiGenerator();
```

---

## callTitleGenerator

📝 V3版本智能标题生成专用方法

@param params 标题生成参数
@returns AI响应结果（包含V3版本5维度评分）
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await callTitleGenerator();
```

---

## callTitleQualityChecker

📊 标题质量评估专用方法（V3版本5维度评分）

@param params 标题评估参数
@returns AI响应结果（包含详细评分分析）
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await callTitleQualityChecker();
```

---

## callPlatformStyleAdapter

🎨 平台风格适配专用方法

@param params 平台风格适配参数
@returns AI响应结果
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await callPlatformStyleAdapter();
```

---

## callContentFormProcessor

📝 内容形式处理专用方法

@param params 内容形式处理参数
@returns AI响应结果
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await callContentFormProcessor();
```

---

## callExpressionStyleManager

🎭 表达风格管理专用方法

@param params 表达风格管理参数
@returns AI响应结果
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await callExpressionStyleManager();
```

---

## callMultiDimensionalMatrixGenerator

🎯 多维矩阵内容生成专用方法

@param params 多维矩阵参数
@returns AI响应结果
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await callMultiDimensionalMatrixGenerator();
```

---

## callContentQualityController

📊 内容适配质量控制专用方法

@param params 质量控制参数
@returns 质量控制结果
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await callContentQualityController();
```

---

## callMultiVersionContentGenerator

🔄 多版本内容生成专用方法

@param params 多版本生成参数
@returns 多版本内容结果
/

**文件:** `api/aiService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await callMultiVersionContentGenerator();
```

---

## verifyModuleIntegrity

🛡️ 模块完整性验证 - 防止被篡改
🔧 FIXED: 2025-08-14 修复 eval 导致的 ReferenceError
/

**文件:** `api/aiService.ts`

**类型:** 同步函数

### 返回值

`boolean`

### 使用示例

```typescript
const result = verifyModuleIntegrity();
```

---

## getAPIEndpoint

获取API端点
根据环境自动选择正确的API端点
/

**文件:** `api/creemClientService.ts`

**类型:** 同步函数

### 返回值

`string`

### 使用示例

```typescript
const result = getAPIEndpoint();
```

---

## createCreemCheckout

创建支付检查点（通过后端API）
@param priceId 价格ID
@param customerEmail 客户邮箱（可选）
@returns 支付检查点信息
/

**文件:** `api/creemClientService.ts`

**类型:** 异步函数

### 参数

- **`priceId`** (`string`)
- **`customerEmail`** (`string`) - 可选

### 返回值

`string, customerEmail?: string)`

### 使用示例

```typescript
const result = await createCreemCheckout('example', 'example');
```

---

## getAlipayQRCode

获取支付宝二维码URL（通过后端API）
@param priceId 价格ID
@param customerEmail 客户邮箱（可选）
@returns 支付宝二维码URL
/

**文件:** `api/creemClientService.ts`

**类型:** 异步函数

### 参数

- **`priceId`** (`string`)
- **`customerEmail`** (`string`) - 可选

### 返回值

`string, customerEmail?: string)`

### 使用示例

```typescript
const result = await getAlipayQRCode('example', 'example');
```

---

## generateAlipayQRCode

生成支付宝二维码图片（通过后端API）
@param priceId 价格ID
@param customerEmail 客户邮箱（可选）
@returns 二维码图片的DataURL
/

**文件:** `api/creemClientService.ts`

**类型:** 异步函数

### 参数

- **`priceId`** (`string`)
- **`customerEmail`** (`string`) - 可选

### 返回值

`string, customerEmail?: string)`

### 使用示例

```typescript
const result = await generateAlipayQRCode('example', 'example');
```

---

## startCheckout

创建支付检查点并跳转到Creem支付页面（通过后端API）
@param priceId 价格ID
@param customerEmail 客户邮箱（可选）
@returns 支付页面URL
/

**文件:** `api/creemClientService.ts`

**类型:** 异步函数

### 参数

- **`priceId`** (`string`)
- **`customerEmail`** (`string`) - 可选

### 返回值

`string, customerEmail?: string)`

### 使用示例

```typescript
const result = await startCheckout('example', 'example');
```

---

## redirectToCheckout

跳转到Creem支付页面（通过后端API）
@param priceId 价格ID
@param customerEmail 客户邮箱（可选）
/

**文件:** `api/creemClientService.ts`

**类型:** 异步函数

### 参数

- **`priceId`** (`string`)
- **`customerEmail`** (`string`) - 可选

### 返回值

`string, customerEmail?: string)`

### 使用示例

```typescript
const result = await redirectToCheckout('example', 'example');
```

---

## createCreemCheckout

创建支付检查点
@param priceId 价格ID
@param customerEmail 客户邮箱（可选）
@returns 支付检查点信息
/

**文件:** `api/creemService.ts`

**类型:** 异步函数

### 参数

- **`priceId`** (`string`)
- **`customerEmail`** (`string`) - 可选

### 返回值

`string, customerEmail?: string)`

### 使用示例

```typescript
const result = await createCreemCheckout('example', 'example');
```

---

## getAlipayQRCode

获取支付宝二维码URL
@param priceId 价格ID
@param customerEmail 客户邮箱（可选）
@returns 支付宝二维码URL
/

**文件:** `api/creemService.ts`

**类型:** 异步函数

### 参数

- **`priceId`** (`string`)
- **`customerEmail`** (`string`) - 可选

### 返回值

`string, customerEmail?: string)`

### 使用示例

```typescript
const result = await getAlipayQRCode('example', 'example');
```

---

## generateAlipayQRCode

生成支付宝二维码图片
@param priceId 价格ID
@param customerEmail 客户邮箱（可选）
@returns 二维码图片的DataURL
/

**文件:** `api/creemService.ts`

**类型:** 异步函数

### 参数

- **`priceId`** (`string`)
- **`customerEmail`** (`string`) - 可选

### 返回值

`string, customerEmail?: string)`

### 使用示例

```typescript
const result = await generateAlipayQRCode('example', 'example');
```

---

## startCheckout

创建支付检查点并跳转到Creem支付页面
@param priceId 价格ID
@param customerEmail 客户邮箱（可选）
@returns 支付页面URL
/

**文件:** `api/creemService.ts`

**类型:** 异步函数

### 参数

- **`priceId`** (`string`)
- **`customerEmail`** (`string`) - 可选

### 返回值

`string, customerEmail?: string)`

### 使用示例

```typescript
const result = await startCheckout('example', 'example');
```

---

## redirectToCheckout

跳转到Creem支付页面
@param priceId 价格ID
@param customerEmail 客户邮箱（可选）
/

**文件:** `api/creemService.ts`

**类型:** 异步函数

### 参数

- **`priceId`** (`string`)
- **`customerEmail`** (`string`) - 可选

### 返回值

`string, customerEmail?: string)`

### 使用示例

```typescript
const result = await redirectToCheckout('example', 'example');
```

---

## getDailyHotAll

暂无描述

**文件:** `api/hotTopicsService.ts`

**类型:** 异步函数

### 返回值

`Promise<DailyHotResponse>`

### 使用示例

```typescript
const result = await getDailyHotAll();
```

---

## getDailyHotByPlatform

暂无描述

**文件:** `api/hotTopicsService.ts`

**类型:** 异步函数

### 参数

- **`platform`** (`string`)

### 返回值

`string): Promise<DailyHotItem[]>`

### 使用示例

```typescript
const result = await getDailyHotByPlatform('example');
```

---

## getSupportedPlatforms

暂无描述

**文件:** `api/hotTopicsService.ts`

**类型:** 同步函数

### 返回值

`string[]`

### 使用示例

```typescript
const result = getSupportedPlatforms();
```

---

## getPlatformDisplayName

暂无描述

**文件:** `api/hotTopicsService.ts`

**类型:** 同步函数

### 参数

- **`platform`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = getPlatformDisplayName('example');
```

---

## getPlatformIconClass

暂无描述

**文件:** `api/hotTopicsService.ts`

**类型:** 同步函数

### 参数

- **`platform`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = getPlatformIconClass('example');
```

---

## aggregateAndSortTopics

暂无描述

**文件:** `api/hotTopicsService.ts`

**类型:** 同步函数

### 参数

- **`allData`** (`Record<string`)
- **`DailyHotItem[]>`** (`any`)

### 返回值

`Record<string, DailyHotItem[]>): DailyHotItem[]`

### 使用示例

```typescript
const result = aggregateAndSortTopics('example', value);
```

---

## fetchHotTopics

暂无描述

**文件:** `api/hotTopicsService.ts`

**类型:** 异步函数

### 参数

- **`platform`** (`string`) - 可选

### 返回值

`string): Promise<DailyHotItem[]>`

### 使用示例

```typescript
const result = await fetchHotTopics('example');
```

---

## fetchTopicDetail

暂无描述

**文件:** `api/hotTopicsService.ts`

**类型:** 异步函数

### 参数

- **`topicId`** (`string`)

### 返回值

`string): Promise<DailyHotItem | null>`

### 使用示例

```typescript
const result = await fetchTopicDetail('example');
```

---

## fetchMoyuCalendar

暂无描述

**文件:** `api/hotTopicsService.ts`

**类型:** 异步函数

### 返回值

`Promise<any>`

### 使用示例

```typescript
const result = await fetchMoyuCalendar();
```

---

## clearCache

暂无描述

**文件:** `api/hotTopicsService.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = clearCache();
```

---

## getCacheStats

暂无描述

**文件:** `api/hotTopicsService.ts`

**类型:** 同步函数

### 返回值

`any`

### 使用示例

```typescript
const result = getCacheStats();
```

---

## getAPIInstance

暂无描述

**文件:** `api/hotTopicsService.ts`

**类型:** 同步函数

### 返回值

`HotTopicsAPI | any`

### 使用示例

```typescript
const result = getAPIInstance();
```

---

## getDailyHotAll

获取全网热点聚合数据
@returns Promise<DailyHotResponse>
/

**文件:** `api/hotTopicsService_backup.ts`

**类型:** 异步函数

### 返回值

`Promise<DailyHotResponse>`

### 使用示例

```typescript
const result = await getDailyHotAll();
```

---

## getDailyHotByPlatform

获取指定平台热榜数据
@param platform 平台名称
@returns Promise<DailyHotItem[]>
/

**文件:** `api/hotTopicsService_backup.ts`

**类型:** 异步函数

### 参数

- **`platform`** (`string`)

### 返回值

`string): Promise<DailyHotItem[]>`

### 使用示例

```typescript
const result = await getDailyHotByPlatform('example');
```

---

## getSupportedPlatforms

获取支持的平台列表
@returns string[]
/

**文件:** `api/hotTopicsService_backup.ts`

**类型:** 同步函数

### 返回值

`string[]`

### 使用示例

```typescript
const result = getSupportedPlatforms();
```

---

## getPlatformDisplayName

获取平台显示名称
@param platform 平台名称
@returns string
/

**文件:** `api/hotTopicsService_backup.ts`

**类型:** 同步函数

### 参数

- **`platform`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = getPlatformDisplayName('example');
```

---

## getPlatformIconClass

获取平台图标类名
@param platform 平台名称
@returns string
/

**文件:** `api/hotTopicsService_backup.ts`

**类型:** 同步函数

### 参数

- **`platform`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = getPlatformIconClass('example');
```

---

## aggregateAndSortTopics

聚合所有平台数据并按综合热度排序
@param allData 所有平台数据
@returns DailyHotItem[]
/

**文件:** `api/hotTopicsService_backup.ts`

**类型:** 同步函数

### 参数

- **`allData`** (`Record<string`)
- **`DailyHotItem[]>`** (`any`)

### 返回值

`Record<string, DailyHotItem[]>): DailyHotItem[]`

### 使用示例

```typescript
const result = aggregateAndSortTopics('example', value);
```

---

## fetchHotTopics

获取热点话题列表
@param platform 可选的平台名称
@returns Promise<DailyHotItem[]>
/

**文件:** `api/hotTopicsService_backup.ts`

**类型:** 异步函数

### 参数

- **`platform`** (`string`) - 可选

### 返回值

`string): Promise<DailyHotItem[]>`

### 使用示例

```typescript
const result = await fetchHotTopics('example');
```

---

## fetchTopicDetail

获取话题详情
@param topicId 话题ID
@returns Promise<DailyHotItem | null>
/

**文件:** `api/hotTopicsService_backup.ts`

**类型:** 异步函数

### 参数

- **`topicId`** (`string`)

### 返回值

`string): Promise<DailyHotItem | null>`

### 使用示例

```typescript
const result = await fetchTopicDetail('example');
```

---

## fetchMoyuCalendar

获取摩鱼日历数据
@returns Promise<any>
/

**文件:** `api/hotTopicsService_backup.ts`

**类型:** 异步函数

### 返回值

`Promise<any>`

### 使用示例

```typescript
const result = await fetchMoyuCalendar();
```

---

## clearCache

==================== 高级API ====================

清除所有缓存
/

**文件:** `api/hotTopicsService_backup.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = clearCache();
```

---

## getMetrics

获取性能指标
@returns any
/

**文件:** `api/hotTopicsService_backup.ts`

**类型:** 同步函数

### 返回值

`any`

### 使用示例

```typescript
const result = getMetrics();
```

---

## getCacheStats

获取缓存统计信息
@returns any
/

**文件:** `api/hotTopicsService_backup.ts`

**类型:** 同步函数

### 返回值

`any`

### 使用示例

```typescript
const result = getCacheStats();
```

---

## updateConfig

更新API配置
@param updates 配置更新
/

**文件:** `api/hotTopicsService_backup.ts`

**类型:** 同步函数

### 参数

- **`updates`** (`Partial<ApiConfig>`)

### 返回值

`Partial<ApiConfig>): void`

### 使用示例

```typescript
const result = updateConfig(value);
```

---

## getAPIInstance

获取API实例（用于高级用法）
@returns HotTopicsAPI
/

**文件:** `api/hotTopicsService_backup.ts`

**类型:** 同步函数

### 返回值

`HotTopicsAPI`

### 使用示例

```typescript
const result = getAPIInstance();
```

---

## generateImage

生成AI图像
@param request 图像生成请求参数
@returns Promise<ImageGenerationResponse>
/

**文件:** `api/imageGenerationService.ts`

**类型:** 异步函数

### 参数

- **`params`** (`ImageGenerationRequest`)

### 返回值

`ImageGenerationRequest): Promise<ImageGenerationResponse>`

### 使用示例

```typescript
const result = await generateImage(value);
```

---

## generateImagesBatch

批量生成图像
@param prompts 提示词数组
@param options 生成选项
@returns Promise<ImageGenerationResponse[]>
/

**文件:** `api/imageGenerationService.ts`

**类型:** 异步函数

### 返回值

`string[], 
  options: Omit<ImageGenerationRequest, 'prompt'> =`

### 使用示例

```typescript
const result = await generateImagesBatch();
```

---

## checkImageGenerationStatus

检查图像生成API状态
@returns Promise<boolean>
/

**文件:** `api/imageGenerationService.ts`

**类型:** 异步函数

### 返回值

`Promise<boolean>`

### 使用示例

```typescript
const result = await checkImageGenerationStatus();
```

---

## downloadImage

下载图像
@param imageUrl 图像URL
@param filename 文件名
/

**文件:** `api/imageGenerationService.ts`

**类型:** 异步函数

### 参数

- **`imageUrl`** (`string`)
- **`filename`** (`string = 'generated-image.png'`)

### 返回值

`string, filename: string = 'generated-image.png'): Promise<void>`

### 使用示例

```typescript
const result = await downloadImage('example', 'example');
```

---

## validatePrompt

验证提示词
@param prompt 提示词
@returns 验证结果
/

**文件:** `api/imageGenerationService.ts`

**类型:** 同步函数

### 参数

- **`prompt`** (`string`)

### 返回值

`string):`

### 使用示例

```typescript
const result = validatePrompt('example');
```

---

## getPlatformApiConfig

获取平台API配置
@param platformId 平台ID
@returns PlatformApiConfig 平台配置
/

**文件:** `api/platformApiService.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string): PlatformApiConfig | null`

### 使用示例

```typescript
const result = getPlatformApiConfig('example');
```

---

## getSupportedPlatforms

获取所有支持的平台
@returns PlatformApiConfig[] 支持的平台列表
/

**文件:** `api/platformApiService.ts`

**类型:** 同步函数

### 返回值

`PlatformApiConfig[]`

### 使用示例

```typescript
const result = getSupportedPlatforms();
```

---

## savePlatformApiConfig

保存平台API配置到本地存储
@param platformId 平台ID
@param config 配置信息
/

**文件:** `api/platformApiService.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)
- **`config`** (`Partial<PlatformApiConfig>`)

### 返回值

`string, config: Partial<PlatformApiConfig>): void`

### 使用示例

```typescript
const result = savePlatformApiConfig('example', value);
```

---

## loadPlatformApiConfig

从本地存储获取平台API配置
@param platformId 平台ID
@returns PlatformApiConfig | null 平台配置
/

**文件:** `api/platformApiService.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string): PlatformApiConfig | null`

### 使用示例

```typescript
const result = loadPlatformApiConfig('example');
```

---

## clearPlatformApiConfig

清除平台API配置
@param platformId 平台ID
/

**文件:** `api/platformApiService.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string): void`

### 使用示例

```typescript
const result = clearPlatformApiConfig('example');
```

---

## publishContent

通用发布函数
@param platformId 平台ID
@param content 发布内容
@returns Promise<PublishResult> 发布结果
/

**文件:** `api/platformApiService.ts`

**类型:** 异步函数

### 参数

- **`platformId`** (`string`)
- **`content`** (`PublishContent`)

### 返回值

`string, content: PublishContent): Promise<PublishResult>`

### 使用示例

```typescript
const result = await publishContent('example', value);
```

---

## batchPublishContent

批量发布内容
@param platforms 平台ID数组
@param content 发布内容
@returns Promise<PublishResult[]> 发布结果数组
/

**文件:** `api/platformApiService.ts`

**类型:** 异步函数

### 参数

- **`platforms`** (`string[]`)
- **`content`** (`PublishContent`)

### 返回值

`string[], content: PublishContent): Promise<PublishResult[]>`

### 使用示例

```typescript
const result = await batchPublishContent('example', value);
```

---

## checkPlatformAuth

检查平台授权状态
@param platformId 平台ID
@returns boolean 是否已授权
/

**文件:** `api/platformApiService.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string): boolean`

### 使用示例

```typescript
const result = checkPlatformAuth('example');
```

---

## getPlatformAuthUrl

获取平台授权URL
@param platformId 平台ID
@returns string | null 授权URL
/

**文件:** `api/platformApiService.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string): string | null`

### 使用示例

```typescript
const result = getPlatformAuthUrl('example');
```

---

## sendReferralReward

❌ REMOVED: 已删除模拟推荐奖励功能 - 违反api_prohibit_local_mock_error规则

发送推荐奖励请求
@param request 推荐奖励请求
@returns 推荐奖励响应
/

**文件:** `api/referralService.ts`

**类型:** 异步函数

### 参数

- **`requestBody`** (`ReferralRewardRequest`)

### 返回值

`ReferralRewardRequest): Promise<ReferralRewardResponse>`

### 使用示例

```typescript
const result = await sendReferralReward(value);
```

---

## getReferralStats

❌ REMOVED: 删除模拟推荐统计函数 - 违反api_prohibit_local_mock_error规则

获取推荐统计
@param referrerId 推荐人ID
@returns 推荐统计
/

**文件:** `api/referralService.ts`

**类型:** 异步函数

### 参数

- **`referrerId`** (`string`)

### 返回值

`string): Promise<ReferralStats | null>`

### 使用示例

```typescript
const result = await getReferralStats('example');
```

---

## validateReferrerId

❌ REMOVED: 删除模拟验证推荐人ID函数 - 违反api_prohibit_local_mock_error规则

验证推荐人ID是否有效
@param referrerId 推荐人ID
@returns 是否有效
/

**文件:** `api/referralService.ts`

**类型:** 异步函数

### 参数

- **`referrerId`** (`string`)

### 返回值

`string): Promise<boolean>`

### 使用示例

```typescript
const result = await validateReferrerId('example');
```

---

## generateReferralLink

获取推荐链接
@param referrerId 推荐人ID
@returns 推荐链接
/

**文件:** `api/referralService.ts`

**类型:** 同步函数

### 参数

- **`referrerId`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = generateReferralLink('example');
```

---

## copyReferralLink

复制推荐链接到剪贴板
@param referrerId 推荐人ID
@returns 是否成功
/

**文件:** `api/referralService.ts`

**类型:** 异步函数

### 参数

- **`referrerId`** (`string`)

### 返回值

`string): Promise<boolean>`

### 使用示例

```typescript
const result = await copyReferralLink('example');
```

---

## getTopicSubscriptions

获取订阅话题列表
/

**文件:** `api/topicSubscriptionService.ts`

**类型:** 同步函数

### 返回值

`TopicSubscription[]`

### 使用示例

```typescript
const result = getTopicSubscriptions();
```

---

## markSubscriptionAsViewed

标记订阅为已查看（清除红点）
/

**文件:** `api/topicSubscriptionService.ts`

**类型:** 同步函数

### 参数

- **`subscriptionId`** (`string`)

### 返回值

`string): TopicSubscription | null`

### 使用示例

```typescript
const result = markSubscriptionAsViewed('example');
```

---

## markSubscriptionHasNewResults

标记订阅有新结果（显示红点）
/

**文件:** `api/topicSubscriptionService.ts`

**类型:** 同步函数

### 参数

- **`subscriptionId`** (`string`)
- **`newResultsCount`** (`number = 1`)

### 返回值

`string, newResultsCount: number = 1): TopicSubscription | null`

### 使用示例

```typescript
const result = markSubscriptionHasNewResults('example', 123);
```

---

## getNewResultsCount

获取有新结果的订阅数量
/

**文件:** `api/topicSubscriptionService.ts`

**类型:** 同步函数

### 返回值

`number`

### 使用示例

```typescript
const result = getNewResultsCount();
```

---

## saveTopicSubscriptions

保存订阅话题列表
/

**文件:** `api/topicSubscriptionService.ts`

**类型:** 同步函数

### 参数

- **`subscriptions`** (`TopicSubscription[]`)

### 返回值

`TopicSubscription[]): void`

### 使用示例

```typescript
const result = saveTopicSubscriptions(value);
```

---

## addTopicSubscription

添加新的话题订阅
/

**文件:** `api/topicSubscriptionService.ts`

**类型:** 同步函数

### 参数

- **`subscription`** (`Omit<TopicSubscription`)
- **`'id' | 'createdAt' | 'updatedAt'>`** (`any`)

### 返回值

`Omit<TopicSubscription, 'id' | 'createdAt' | 'updatedAt'>): TopicSubscription`

### 使用示例

```typescript
const result = addTopicSubscription(value, value);
```

---

## updateTopicSubscription

更新话题订阅
/

**文件:** `api/topicSubscriptionService.ts`

**类型:** 同步函数

### 参数

- **`id`** (`string`)
- **`updates`** (`Partial<TopicSubscription>`)

### 返回值

`string, updates: Partial<TopicSubscription>): TopicSubscription | null`

### 使用示例

```typescript
const result = updateTopicSubscription('example', value);
```

---

## deleteTopicSubscription

删除话题订阅
/

**文件:** `api/topicSubscriptionService.ts`

**类型:** 同步函数

### 参数

- **`id`** (`string`)

### 返回值

`string): boolean`

### 使用示例

```typescript
const result = deleteTopicSubscription('example');
```

---

## monitorTopic

监控话题关键词
/

**文件:** `api/topicSubscriptionService.ts`

**类型:** 异步函数

### 参数

- **`subscription`** (`TopicSubscription`)

### 返回值

`TopicSubscription): Promise<TopicMonitorResult[]>`

### 使用示例

```typescript
const result = await monitorTopic(value);
```

---

## getTopicHeatTrend

获取话题热度趋势（基于真实数据）
/

**文件:** `api/topicSubscriptionService.ts`

**类型:** 异步函数

### 参数

- **`keyword`** (`string`)
- **`days`** (`number = 7`)

### 返回值

`string, days: number = 7): Promise<TopicHeatTrend[]>`

### 使用示例

```typescript
const result = await getTopicHeatTrend('example', 123);
```

---

## getTrendAnalysis

获取趋势分析结果
/

**文件:** `api/topicSubscriptionService.ts`

**类型:** 异步函数

### 参数

- **`keyword`** (`string`)
- **`days`** (`number = 7`)

### 返回值

`string, days: number = 7): Promise<TrendAnalysis>`

### 使用示例

```typescript
const result = await getTrendAnalysis('example', 123);
```

---

## getAvailableSearchSources

获取可用的搜索源
/

**文件:** `api/topicSubscriptionService.ts`

**类型:** 同步函数

### 返回值

`SearchSource[]`

### 使用示例

```typescript
const result = getAvailableSearchSources();
```

---

## checkAllSubscriptions

检查订阅更新
/

**文件:** `api/topicSubscriptionService.ts`

**类型:** 异步函数

### 返回值

`Promise<Record<string, TopicMonitorResult[]>>`

### 使用示例

```typescript
const result = await checkAllSubscriptions();
```

---

## toggleSubscription

启用/禁用订阅
/

**文件:** `api/topicSubscriptionService.ts`

**类型:** 同步函数

### 参数

- **`id`** (`string`)
- **`isActive`** (`boolean`)

### 返回值

`string, isActive: boolean): boolean`

### 使用示例

```typescript
const result = toggleSubscription('example', true);
```

---

## getSubscriptionStats

获取订阅统计信息
/

**文件:** `api/topicSubscriptionService.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = getSubscriptionStats();
```

---

## callUnifiedAI

统一的AI调用服务 - 完全使用新的统一管理器
🔧 已迁移到统一AI管理器，消除所有硬编码问题
/

**文件:** `api/unifiedAIService.ts`

**类型:** 异步函数

### 参数

- **`params`** (`AICallParams`)

### 返回值

`AICallParams): Promise<AIResponse>`

### 使用示例

```typescript
const result = await callUnifiedAI(value);
```

---

## generateUnifiedImage

统一的图像生成服务 - 使用新的统一管理器
🔧 已迁移到统一AI管理器，消除硬编码问题
/

**文件:** `api/unifiedAIService.ts`

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

## checkUnifiedAIStatus

检查统一AI服务状态

/

**文件:** `api/unifiedAIService.ts`

**类型:** 异步函数

### 返回值

`Promise<`

### 使用示例

```typescript
const result = await checkUnifiedAIStatus();
```

---

## getUnifiedEnvironmentInfo

获取当前环境信息

/

**文件:** `api/unifiedAIService.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = getUnifiedEnvironmentInfo();
```

---

## DataServicesDemo

暂无描述

**文件:** `components/examples/DataServicesDemo.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = DataServicesDemo();
```

---

## getConfiguredServices

获取已配置的API服务列表
@returns 已配置密钥的服务列表
/

**文件:** `config/apiKeyManager.ts`

**类型:** 同步函数

### 返回值

`string[]`

### 使用示例

```typescript
const result = getConfiguredServices();
```

---

## registerAllServices

注册所有服务到DI容器
/

**文件:** `config/serviceRegistry.ts`

**类型:** 异步函数

### 返回值

`Promise<void>`

### 使用示例

```typescript
const result = await registerAllServices();
```

---

## getBrandDatabaseService

获取服务的便捷函数（带类型安全）
/

**文件:** `config/serviceRegistry.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getBrandDatabaseService();
```

---

## getBrandPromptService

暂无描述

**文件:** `config/serviceRegistry.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getBrandPromptService();
```

---

## getBrandProfileService

暂无描述

**文件:** `config/serviceRegistry.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getBrandProfileService();
```

---

## getPaymentService

暂无描述

**文件:** `config/serviceRegistry.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getPaymentService();
```

---

## getMD2WeChatService

暂无描述

**文件:** `config/serviceRegistry.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getMD2WeChatService();
```

---

## getHotTopicsService

暂无描述

**文件:** `config/serviceRegistry.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getHotTopicsService();
```

---

## getAIAnalysisService

暂无描述

**文件:** `config/serviceRegistry.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getAIAnalysisService();
```

---

## getUnifiedAIService

暂无描述

**文件:** `config/serviceRegistry.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getUnifiedAIService();
```

---

## getUserDataService

暂无描述

**文件:** `config/serviceRegistry.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getUserDataService();
```

---

## getFavoritesService

暂无描述

**文件:** `config/serviceRegistry.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getFavoritesService();
```

---

## getOrderStatusService

暂无描述

**文件:** `config/serviceRegistry.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getOrderStatusService();
```

---

## getStorageQuotaManager

暂无描述

**文件:** `config/serviceRegistry.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getStorageQuotaManager();
```

---

## getZIndexManager

暂无描述

**文件:** `config/serviceRegistry.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getZIndexManager();
```

---

## createContentAdapterService

创建服务实例
/

**文件:** `features/content-adapter/examples/serviceUsage.ts`

**类型:** 同步函数

### 参数

- **`globalSettings`** (`GlobalSettings = exampleGlobalSettings`)
- **`platformSettings`** (`Record<string`)
- **`PlatformSettings> = examplePlatformSettings`** (`any`)

### 返回值

`GlobalSettings = exampleGlobalSettings,
  platformSettings: Record<string, PlatformSettings> = examplePlatformSettings
): ContentAdapterService`

### 使用示例

```typescript
const result = createContentAdapterService(value, 'example', value);
```

---

## exampleBasicGeneration

示例：基础内容生成
/

**文件:** `features/content-adapter/examples/serviceUsage.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await exampleBasicGeneration();
```

---

## exampleVersionGeneration

示例：版本内容生成
/

**文件:** `features/content-adapter/examples/serviceUsage.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await exampleVersionGeneration();
```

---

## exampleComparisonGeneration

示例：对比内容生成
/

**文件:** `features/content-adapter/examples/serviceUsage.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await exampleComparisonGeneration();
```

---

## exampleTitleGeneration

示例：标题生成
/

**文件:** `features/content-adapter/examples/serviceUsage.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await exampleTitleGeneration();
```

---

## exampleBrandIntegration

示例：品牌库集成
/

**文件:** `features/content-adapter/examples/serviceUsage.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await exampleBrandIntegration();
```

---

## exampleMultiPlatformGeneration

示例：批量生成多平台内容
/

**文件:** `features/content-adapter/examples/serviceUsage.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await exampleMultiPlatformGeneration();
```

---

## exampleErrorHandling

示例：错误处理和重试
/

**文件:** `features/content-adapter/examples/serviceUsage.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await exampleErrorHandling();
```

---

## exampleDynamicSettings

示例：动态更新设置
/

**文件:** `features/content-adapter/examples/serviceUsage.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await exampleDynamicSettings();
```

---

## useDataServices

数据服务 Hook
提供访问所有数据持久化服务的便捷接口
/

**文件:** `hooks/useDataServices.ts`

**类型:** 同步函数

### 返回值

`DataServicesState`

### 使用示例

```typescript
const result = useDataServices();
```

---

## usePerformanceMonitor

性能监控 Hook
专门用于访问性能监控服务
/

**文件:** `hooks/useDataServices.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = usePerformanceMonitor();
```

---

## useDataSync

数据同步 Hook
专门用于访问增强同步优化器
/

**文件:** `hooks/useDataServices.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useDataSync();
```

---

## useDataStorage

数据存储 Hook
专门用于访问统一存储策略
/

**文件:** `hooks/useDataServices.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useDataStorage();
```

---

## useDataOperations

综合数据操作 Hook
结合缓存、同步和存储的便捷操作
/

**文件:** `hooks/useDataServices.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useDataOperations();
```

---

## callAIWithTokenTracking

带Token统计的AI调用函数
@description 在原有AI调用基础上添加Token使用量统计和限额检查
/

**文件:** `services/aiWithTokenTracking.ts`

**类型:** 异步函数

### 参数

- **`params`** (`AICallParamsWithTracking`)

### 返回值

`AICallParamsWithTracking
): Promise<AIResponseWithUsage>`

### 使用示例

```typescript
const result = await callAIWithTokenTracking(value);
```

---

## checkUserTokenLimit

检查用户Token限额的便捷函数
/

**文件:** `services/aiWithTokenTracking.ts`

**类型:** 异步函数

### 参数

- **`estimatedTokens`** (`number = 1000`)

### 返回值

`number = 1000
): Promise<`

### 使用示例

```typescript
const result = await checkUserTokenLimit(123);
```

---

## getUserTokenStats

获取用户Token使用统计的便捷函数
/

**文件:** `services/aiWithTokenTracking.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getUserTokenStats();
```

---

## useBookmarks

React Hook: 书签功能
/

**文件:** `services/bookmarkService.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useBookmarks();
```

---

## useDataAccessLayer

React Hook: 数据访问层
/

**文件:** `services/dataAccessLayer.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useDataAccessLayer();
```

---

## useDataPreloader

React Hook: 数据预加载
/

**文件:** `services/dataPreloadService.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useDataPreloader();
```

---

## useDatabaseInitialization

React Hook: 数据库初始化状态
/

**文件:** `services/databaseInitializer.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useDatabaseInitialization();
```

---

## getAllEmojis

获取所有 emoji
@returns {EmojiItem[]} emoji 列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getAllEmojis();
```

---

## getEmojisByCategory

按分类获取 emoji
@param {string} category - 分类名称
@returns {EmojiItem[]} 分类下的 emoji 列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 参数

- **`category`** (`string`)

### 返回值

`string): EmojiItem[]`

### 使用示例

```typescript
const result = getEmojisByCategory('example');
```

---

## searchEmojis

按关键词搜索 emoji
@param {string} keyword - 搜索关键词
@returns {EmojiItem[]} 匹配的 emoji 列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 参数

- **`keyword`** (`string`)

### 返回值

`string): EmojiItem[]`

### 使用示例

```typescript
const result = searchEmojis('example');
```

---

## getEmojiImage

获取 emoji 图片路径
@param {string} unified - emoji 统一码
@returns {string} 图片路径
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 参数

- **`unified`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = getEmojiImage('example');
```

---

## getEmojiUnicode

获取 emoji 的 Unicode 字符
@param {string} unified - emoji 统一码
@returns {string} Unicode 字符
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 参数

- **`unified`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = getEmojiUnicode('example');
```

---

## getEmojiCDNUrl

获取 emoji CDN 图片URL
@param {string} unified - emoji 统一码
@param {keyof typeof CDN_CONFIGS} cdnType - CDN类型
@returns {string} CDN图片URL
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 参数

- **`unified`** (`string`)
- **`cdnType`** (`keyof typeof CDN_CONFIGS = 'noto-color'`)

### 返回值

`string, 
  cdnType: keyof typeof CDN_CONFIGS = 'noto-color'
): string`

### 使用示例

```typescript
const result = getEmojiCDNUrl('example', value);
```

---

## getEmojiDisplay

获取 emoji 显示内容
@param {string} unified - emoji 统一码
@param {EmojiDisplayMode} mode - 显示模式
@param {keyof typeof CDN_CONFIGS} cdnType - CDN类型（仅在image模式下使用）
@returns {string} 显示内容（Unicode字符或图片URL）
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 参数

- **`unified`** (`string`)
- **`mode`** (`EmojiDisplayMode = 'unicode'`)
- **`cdnType`** (`keyof typeof CDN_CONFIGS = 'noto-color'`)

### 返回值

`string,
  mode: EmojiDisplayMode = 'unicode',
  cdnType: keyof typeof CDN_CONFIGS = 'noto-color'
): string`

### 使用示例

```typescript
const result = getEmojiDisplay('example', value, value);
```

---

## getEmojiCDNUrls

批量获取 emoji CDN URLs
@param {string[]} unifiedCodes - emoji 统一码数组
@param {keyof typeof CDN_CONFIGS} cdnType - CDN类型
@returns {Array<{unified: string, url: string}>} emoji URL数组
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 参数

- **`unifiedCodes`** (`string[]`)
- **`cdnType`** (`keyof typeof CDN_CONFIGS = 'noto-color'`)

### 返回值

`string[],
  cdnType: keyof typeof CDN_CONFIGS = 'noto-color'
): Array<`

### 使用示例

```typescript
const result = getEmojiCDNUrls('example', value);
```

---

## getCDNConfigs

获取可用的 CDN 配置
@returns {typeof CDN_CONFIGS} CDN配置对象
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 返回值

`typeof CDN_CONFIGS`

### 使用示例

```typescript
const result = getCDNConfigs();
```

---

## getEmojiCategories

获取常用 emoji 分类
@returns {string[]} 分类列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 返回值

`string[]`

### 使用示例

```typescript
const result = getEmojiCategories();
```

---

## getPlatformIcons

获取平台图标配置
@returns {PlatformIcon[]} 平台图标列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 返回值

`PlatformIcon[]`

### 使用示例

```typescript
const result = getPlatformIcons();
```

---

## getPlatformIcon

获取平台图标组件
@param {string} platformName - 平台名称
@returns {PlatformIcon | null} 平台图标配置
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 参数

- **`platformName`** (`string`)

### 返回值

`string): PlatformIcon | null`

### 使用示例

```typescript
const result = getPlatformIcon('example');
```

---

## generatePlatformIconSVG

生成平台图标 SVG
@param {PlatformIcon} icon - 平台图标配置
@param {number} size - 图标大小
@returns {string} SVG 字符串
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 参数

- **`icon`** (`PlatformIcon`)
- **`size`** (`number = 24`)

### 返回值

`PlatformIcon, size: number = 24): string`

### 使用示例

```typescript
const result = generatePlatformIconSVG(value, 123);
```

---

## getPopularEmojis

获取热门 emoji
@returns {EmojiItem[]} 热门 emoji 列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getPopularEmojis();
```

---

## getSmileysEmojis

获取表情分类的 emoji
@returns {EmojiItem[]} 表情分类的 emoji 列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getSmileysEmojis();
```

---

## getAnimalsEmojis

获取动物分类的 emoji
@returns {EmojiItem[]} 动物分类的 emoji 列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getAnimalsEmojis();
```

---

## getFoodEmojis

获取食物分类的 emoji
@returns {EmojiItem[]} 食物分类的 emoji 列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getFoodEmojis();
```

---

## getActivityEmojis

获取活动分类的 emoji
@returns {EmojiItem[]} 活动分类的 emoji 列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getActivityEmojis();
```

---

## getTravelEmojis

获取旅行分类的 emoji
@returns {EmojiItem[]} 旅行分类的 emoji 列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getTravelEmojis();
```

---

## getObjectsEmojis

获取物体分类的 emoji
@returns {EmojiItem[]} 物体分类的 emoji 列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getObjectsEmojis();
```

---

## getSymbolsEmojis

获取符号分类的 emoji
@returns {EmojiItem[]} 符号分类的 emoji 列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getSymbolsEmojis();
```

---

## getFlagsEmojis

获取旗帜分类的 emoji
@returns {EmojiItem[]} 旗帜分类的 emoji 列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getFlagsEmojis();
```

---

## getRandomEmojis

获取随机 emoji
@param {number} count - 数量
@returns {EmojiItem[]} 随机 emoji 列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 参数

- **`count`** (`number = 10`)

### 返回值

`number = 10): EmojiItem[]`

### 使用示例

```typescript
const result = getRandomEmojis(123);
```

---

## getEmojisByMood

根据心情获取 emoji
@param {string} mood - 心情关键词
@returns {EmojiItem[]} 匹配心情的 emoji 列表
/

**文件:** `services/emojiService.ts`

**类型:** 同步函数

### 参数

- **`mood`** (`string`)

### 返回值

`string): EmojiItem[]`

### 使用示例

```typescript
const result = getEmojisByMood('example');
```

---

## getAllEmojis

获取所有emoji（兼容旧版API）
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getAllEmojis();
```

---

## getEmojisByCategory

按分类获取emoji（兼容旧版API）
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 参数

- **`category`** (`string`)

### 返回值

`string): EmojiItem[]`

### 使用示例

```typescript
const result = getEmojisByCategory('example');
```

---

## searchEmojis

搜索emoji（兼容旧版API）
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 参数

- **`keyword`** (`string`)

### 返回值

`string): EmojiItem[]`

### 使用示例

```typescript
const result = searchEmojis('example');
```

---

## getPopularEmojis

获取热门emoji
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getPopularEmojis();
```

---

## getSmileysEmojis

获取表情类emoji
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getSmileysEmojis();
```

---

## getAnimalsEmojis

获取动物类emoji
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getAnimalsEmojis();
```

---

## getFoodEmojis

获取食物类emoji
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getFoodEmojis();
```

---

## getActivityEmojis

获取活动类emoji
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getActivityEmojis();
```

---

## getTravelEmojis

获取旅行类emoji
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getTravelEmojis();
```

---

## getObjectsEmojis

获取物品类emoji
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getObjectsEmojis();
```

---

## getSymbolsEmojis

获取符号类emoji
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getSymbolsEmojis();
```

---

## getFlagsEmojis

获取旗帜类emoji
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 返回值

`EmojiItem[]`

### 使用示例

```typescript
const result = getFlagsEmojis();
```

---

## getRandomEmojis

获取随机emoji
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 参数

- **`count`** (`number = 5`)

### 返回值

`number = 5): EmojiItem[]`

### 使用示例

```typescript
const result = getRandomEmojis(123);
```

---

## getEmojisByMood

根据心情获取emoji
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 参数

- **`mood`** (`string`)

### 返回值

`string): EmojiItem[]`

### 使用示例

```typescript
const result = getEmojisByMood('example');
```

---

## getEmojiUnicode

获取emoji的Unicode字符
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 参数

- **`unified`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = getEmojiUnicode('example');
```

---

## getEmojiImage

获取emoji图片路径
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 参数

- **`unified`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = getEmojiImage('example');
```

---

## getEmojiCDNUrl

获取emoji CDN URL
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 参数

- **`unified`** (`string`)
- **`cdnType`** (`string = 'noto-color'`)

### 返回值

`string, cdnType: string = 'noto-color'): string`

### 使用示例

```typescript
const result = getEmojiCDNUrl('example', 'example');
```

---

## getEmojiDisplay

获取emoji显示内容
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 参数

- **`unified`** (`string`)
- **`mode`** (`EmojiDisplayMode = 'unicode'`)
- **`cdnType`** (`string = 'noto-color'`)

### 返回值

`string,
  mode: EmojiDisplayMode = 'unicode',
  cdnType: string = 'noto-color'
): string`

### 使用示例

```typescript
const result = getEmojiDisplay('example', value, 'example');
```

---

## getEmojiCategories

获取emoji分类
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 返回值

`string[]`

### 使用示例

```typescript
const result = getEmojiCategories();
```

---

## getCDNConfigs

获取CDN配置
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = getCDNConfigs();
```

---

## getPlatformIcons

获取平台图标
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 返回值

`any[]`

### 使用示例

```typescript
const result = getPlatformIcons();
```

---

## getPlatformIcon

获取平台图标
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 参数

- **`platform`** (`string`)

### 返回值

`string): any`

### 使用示例

```typescript
const result = getPlatformIcon('example');
```

---

## generatePlatformIconSVG

生成平台图标SVG
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 参数

- **`platform`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = generatePlatformIconSVG('example');
```

---

## getEmojiCDNUrls

批量获取emoji CDN URLs
/

**文件:** `services/emojiServiceAdapter.ts`

**类型:** 同步函数

### 参数

- **`unifiedCodes`** (`string[]`)
- **`cdnType`** (`string = 'noto-color'`)

### 返回值

`string[], cdnType: string = 'noto-color'): string[]`

### 使用示例

```typescript
const result = getEmojiCDNUrls('example', 'example');
```

---

## useDataPreloader

React Hook: 数据预加载
/

**文件:** `services/enhancedDataPreloader.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useDataPreloader();
```

---

## useFavorites

React Hook: 收藏功能
/

**文件:** `services/favoritesService.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useFavorites();
```

---

## analyzeKeyword

分析关键词并生成描述
/

**文件:** `services/keywordAnalysisService.ts`

**类型:** 异步函数

### 参数

- **`keyword`** (`string`)

### 返回值

`string): Promise<KeywordAnalysis>`

### 使用示例

```typescript
const result = await analyzeKeyword('example');
```

---

## getLunarInfo

获取指定日期的农历信息
@param date 日期
@returns 农历信息
/

**文件:** `services/lunarService.ts`

**类型:** 同步函数

### 参数

- **`date`** (`Date`)

### 返回值

`Date): LunarInfo`

### 使用示例

```typescript
const result = getLunarInfo(value);
```

---

## getMonthLunarInfo

获取指定月份的所有农历信息
@param year 年份
@param month 月份（1-12）
@returns 该月所有日期的农历信息
/

**文件:** `services/lunarService.ts`

**类型:** 同步函数

### 参数

- **`year`** (`number`)
- **`month`** (`number`)

### 返回值

`number, month: number): Record<string, LunarInfo>`

### 使用示例

```typescript
const result = getMonthLunarInfo(123, 123);
```

---

## getHolidayInfo

获取节假日信息
@param date 日期
@returns 节假日信息
/

**文件:** `services/lunarService.ts`

**类型:** 同步函数

### 参数

- **`date`** (`Date`)

### 返回值

`Date)`

### 使用示例

```typescript
const result = getHolidayInfo(value);
```

---

## getHistoricalEvent

获取历史事件信息
@param date 日期
@returns 历史事件信息
/

**文件:** `services/lunarService.ts`

**类型:** 同步函数

### 参数

- **`date`** (`Date`)

### 返回值

`Date)`

### 使用示例

```typescript
const result = getHistoricalEvent(value);
```

---

## isWorkday

检查是否为工作日
@param date 日期
@returns 是否为工作日
/

**文件:** `services/lunarService.ts`

**类型:** 同步函数

### 参数

- **`date`** (`Date`)

### 返回值

`Date): boolean`

### 使用示例

```typescript
const result = isWorkday(value);
```

---

## generateCard

便捷函数

**文件:** `services/md2cardService.ts`

**类型:** 异步函数

### 参数

- **`request`** (`GenerateCardRequest`)

### 返回值

`GenerateCardRequest): Promise<GenerateCardResponse>`

### 使用示例

```typescript
const result = await generateCard(value);
```

---

## exportCard

暂无描述

**文件:** `services/md2cardService.ts`

**类型:** 异步函数

### 参数

- **`request`** (`ExportCardRequest`)

### 返回值

`ExportCardRequest): Promise<Blob>`

### 使用示例

```typescript
const result = await exportCard(value);
```

---

## getNotificationConfig

获取通知配置
/

**文件:** `services/notificationService.ts`

**类型:** 同步函数

### 返回值

`NotificationConfig`

### 使用示例

```typescript
const result = getNotificationConfig();
```

---

## saveNotificationConfig

保存通知配置
/

**文件:** `services/notificationService.ts`

**类型:** 同步函数

### 参数

- **`config`** (`NotificationConfig`)

### 返回值

`NotificationConfig): void`

### 使用示例

```typescript
const result = saveNotificationConfig(value);
```

---

## getNotifications

获取通知列表
/

**文件:** `services/notificationService.ts`

**类型:** 同步函数

### 返回值

`Notification[]`

### 使用示例

```typescript
const result = getNotifications();
```

---

## saveNotifications

保存通知列表
/

**文件:** `services/notificationService.ts`

**类型:** 同步函数

### 参数

- **`notifications`** (`Notification[]`)

### 返回值

`Notification[]): void`

### 使用示例

```typescript
const result = saveNotifications(value);
```

---

## addNotification

添加通知
/

**文件:** `services/notificationService.ts`

**类型:** 同步函数

### 参数

- **`notification`** (`Omit<Notification`)
- **`'id' | 'createdAt'>`** (`any`)

### 返回值

`Omit<Notification, 'id' | 'createdAt'>): Notification`

### 使用示例

```typescript
const result = addNotification(value, value);
```

---

## markNotificationAsRead

标记通知为已读
/

**文件:** `services/notificationService.ts`

**类型:** 同步函数

### 参数

- **`id`** (`string`)

### 返回值

`string): void`

### 使用示例

```typescript
const result = markNotificationAsRead('example');
```

---

## markAllNotificationsAsRead

标记所有通知为已读
/

**文件:** `services/notificationService.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = markAllNotificationsAsRead();
```

---

## deleteNotification

删除通知
/

**文件:** `services/notificationService.ts`

**类型:** 同步函数

### 参数

- **`id`** (`string`)

### 返回值

`string): void`

### 使用示例

```typescript
const result = deleteNotification('example');
```

---

## clearAllNotifications

清空所有通知
/

**文件:** `services/notificationService.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = clearAllNotifications();
```

---

## getUnreadCount

获取未读通知数量
/

**文件:** `services/notificationService.ts`

**类型:** 同步函数

### 返回值

`number`

### 使用示例

```typescript
const result = getUnreadCount();
```

---

## notifyTopicUpdate

话题更新通知
/

**文件:** `services/notificationService.ts`

**类型:** 同步函数

### 参数

- **`keyword`** (`string`)
- **`results`** (`any[]`)
- **`subscriptionName`** (`string`)

### 返回值

`string, 
  results: any[], 
  subscriptionName: string
): void`

### 使用示例

```typescript
const result = notifyTopicUpdate('example', value, 'example');
```

---

## notifyHeatAlert

热度警报通知
/

**文件:** `services/notificationService.ts`

**类型:** 同步函数

### 参数

- **`keyword`** (`string`)
- **`heat`** (`number`)
- **`threshold`** (`number`)

### 返回值

`string, 
  heat: number, 
  threshold: number
): void`

### 使用示例

```typescript
const result = notifyHeatAlert('example', 123, 123);
```

---

## notifySystem

系统通知
/

**文件:** `services/notificationService.ts`

**类型:** 同步函数

### 参数

- **`title`** (`string`)
- **`message`** (`string`)
- **`level`** (`NotificationLevel = 'info'`)

### 返回值

`string, 
  message: string, 
  level: NotificationLevel = 'info'
): void`

### 使用示例

```typescript
const result = notifySystem('example', 'example', value);
```

---

## notifySubscriptionStatus

订阅状态通知
/

**文件:** `services/notificationService.ts`

**类型:** 同步函数

### 参数

- **`action`** (`'created' | 'updated' | 'deleted' | 'enabled' | 'disabled'`)
- **`subscriptionName`** (`string`)

### 返回值

`'created' | 'updated' | 'deleted' | 'enabled' | 'disabled',
  subscriptionName: string
): void`

### 使用示例

```typescript
const result = notifySubscriptionStatus(value, 'example');
```

---

## getSecureAuthConfig

便捷的配置获取函数
/

**文件:** `services/secureConfigService.ts`

**类型:** 异步函数

### 参数

- **`forceRefresh`** (`boolean = false`)

### 返回值

`boolean = false): Promise<SecureAuthConfig>`

### 使用示例

```typescript
const result = await getSecureAuthConfig(true);
```

---

## getSecureGuardConfig

获取Guard配置
/

**文件:** `services/secureConfigService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getSecureGuardConfig();
```

---

## getSecureWebSdkConfig

获取Web SDK配置
/

**文件:** `services/secureConfigService.ts`

**类型:** 异步函数

### 使用示例

```typescript
const result = await getSecureWebSdkConfig();
```

---

## getSupabaseClient

获取共享的 Supabase 客户端实例
/

**文件:** `services/supabaseDataService.ts`

**类型:** 异步函数

### 返回值

`Promise<SupabaseClient>`

### 使用示例

```typescript
const result = await getSupabaseClient();
```

---

## getAuthenticatedSupabaseClient

获取带认证的 Supabase 客户端实例
/

**文件:** `services/supabaseDataService.ts`

**类型:** 异步函数

### 参数

- **`token`** (`string`) - 可选

### 返回值

`string): Promise<SupabaseClient>`

### 使用示例

```typescript
const result = await getAuthenticatedSupabaseClient('example');
```

---

## createDataService

创建数据服务实例
/

**文件:** `services/supabaseDataService.ts`

**类型:** 同步函数

### 参数

- **`userId`** (`string`)
- **`tableName`** (`string`)

### 返回值

`string, tableName: string): SupabaseDataService`

### 使用示例

```typescript
const result = createDataService('example', 'example');
```

---

## useUnifiedData

React Hook: 统一数据管理
/

**文件:** `services/unifiedDataManager.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useUnifiedData();
```

---

## detectPlatform

检测当前平台类型
/

**文件:** `services/unifiedEmojiSystem.ts`

**类型:** 同步函数

### 返回值

`PlatformType`

### 使用示例

```typescript
const result = detectPlatform();
```

---

## getAdaptiveEmojiSize

获取自适应emoji尺寸配置
/

**文件:** `services/unifiedEmojiSystem.ts`

**类型:** 同步函数

### 参数

- **`context`** (`EmojiUsageContext`)
- **`platform`** (`PlatformType`) - 可选

### 返回值

`EmojiUsageContext,
  platform?: PlatformType
): EmojiSizeConfig`

### 使用示例

```typescript
const result = getAdaptiveEmojiSize(value, value);
```

---

## generateEmojiStyle

生成自适应emoji样式
/

**文件:** `services/unifiedEmojiSystem.ts`

**类型:** 同步函数

### 参数

- **`context`** (`EmojiUsageContext`)
- **`platform`** (`PlatformType`) - 可选
- **`customStyles`** (`Partial<EmojiSizeConfig> | React.CSSProperties`) - 可选

### 返回值

`EmojiUsageContext,
  platform?: PlatformType,
  customStyles?: Partial<EmojiSizeConfig> | React.CSSProperties
): React.CSSProperties`

### 使用示例

```typescript
const result = generateEmojiStyle(value, value, value);
```

---

## generateEmojiSVG

生成emoji的SVG表示（用于头像生成）
/

**文件:** `services/unifiedEmojiSystem.ts`

**类型:** 同步函数

### 参数

- **`emoji`** (`UnifiedEmojiItem`)
- **`size`** (`number = 200`)

### 返回值

`UnifiedEmojiItem, size: number = 200): string`

### 使用示例

```typescript
const result = generateEmojiSVG(value, 123);
```

---

## getAllEmojis

获取所有emoji
/

**文件:** `services/unifiedEmojiSystem.ts`

**类型:** 同步函数

### 返回值

`UnifiedEmojiItem[]`

### 使用示例

```typescript
const result = getAllEmojis();
```

---

## getEmojisByCategory

按分类获取emoji
/

**文件:** `services/unifiedEmojiSystem.ts`

**类型:** 同步函数

### 参数

- **`category`** (`string`)

### 返回值

`string): UnifiedEmojiItem[]`

### 使用示例

```typescript
const result = getEmojisByCategory('example');
```

---

## searchEmojis

搜索emoji
/

**文件:** `services/unifiedEmojiSystem.ts`

**类型:** 同步函数

### 参数

- **`query`** (`string`)

### 返回值

`string): UnifiedEmojiItem[]`

### 使用示例

```typescript
const result = searchEmojis('example');
```

---

## getRandomEmojis

随机获取emoji
/

**文件:** `services/unifiedEmojiSystem.ts`

**类型:** 同步函数

### 参数

- **`count`** (`number = 1`)
- **`category`** (`string`) - 可选

### 返回值

`number = 1, category?: string): UnifiedEmojiItem[]`

### 使用示例

```typescript
const result = getRandomEmojis(123, 'example');
```

---

## getCategories

获取分类信息
/

**文件:** `services/unifiedEmojiSystem.ts`

**类型:** 同步函数

### 返回值

`EmojiCategory[]`

### 使用示例

```typescript
const result = getCategories();
```

---

## addCustomEmoji

添加自定义emoji
/

**文件:** `services/unifiedEmojiSystem.ts`

**类型:** 同步函数

### 参数

- **`emoji`** (`Omit<UnifiedEmojiItem`)
- **`'id' | 'createdAt'>`** (`any`)

### 返回值

`Omit<UnifiedEmojiItem, 'id' | 'createdAt'>): UnifiedEmojiItem`

### 使用示例

```typescript
const result = addCustomEmoji(value, value);
```

---

## getSubcategories

暂无描述

**文件:** `services/unifiedEmojiSystem.ts`

**类型:** 同步函数

### 参数

- **`category`** (`UnifiedEmojiItem['category']`)

### 返回值

`UnifiedEmojiItem['category']): Array<`

### 使用示例

```typescript
const result = getSubcategories(value);
```

---

## matchesSubcategory

暂无描述

**文件:** `services/unifiedEmojiSystem.ts`

**类型:** 同步函数

### 参数

- **`e`** (`UnifiedEmojiItem`)
- **`category`** (`UnifiedEmojiItem['category']`)
- **`subId`** (`string`)

### 返回值

`UnifiedEmojiItem, category: UnifiedEmojiItem['category'], subId: string): boolean`

### 使用示例

```typescript
const result = matchesSubcategory(value, value, 'example');
```

---

## updateEmojiData

更新emoji数据
/

**文件:** `services/unifiedEmojiSystem.ts`

**类型:** 同步函数

### 参数

- **`newData`** (`UnifiedEmojiItem[]`)

### 返回值

`UnifiedEmojiItem[]): void`

### 使用示例

```typescript
const result = updateEmojiData(value);
```

---

## getEmojiStats

获取emoji统计信息
/

**文件:** `services/unifiedEmojiSystem.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = getEmojiStats();
```

---

## normalizeUserInfo

导出便捷函数

**文件:** `services/userInfoNormalizer.ts`

**类型:** 同步函数

### 参数

- **`rawData`** (`RawUserData`)
- **`loginMethod`** (`StandardUserInfo['loginMethod']`) - 可选
- **`dataSource`** (`string`) - 可选

### 返回值

`RawUserData, 
  loginMethod?: StandardUserInfo['loginMethod'],
  dataSource?: string
): StandardUserInfo`

### 使用示例

```typescript
const result = normalizeUserInfo(value, value, 'example');
```

---

## mergeUserInfo

暂无描述

**文件:** `services/userInfoNormalizer.ts`

**类型:** 同步函数

### 参数

- **`...sources`** (`StandardUserInfo[]`)

### 返回值

`StandardUserInfo[]): StandardUserInfo`

### 使用示例

```typescript
const result = mergeUserInfo(value);
```

---

## ContentAdapterService

AI内容适配器服务类
/

**文件:** `features/content-adapter/services/contentAdapterService.ts`

**类型:** 类

### 方法

- **`updateSettings`**  
  更新设置
/
- **`generateContent`**  (异步)
  生成单个内容
/
- **`catch`**  
- **`generateMultipleVersions`**  (异步)
  生成多版本内容 - 新增方法，支持版本A和版本B
/
- **`catch`**  
- **`generateVersionContent`**  (异步)
  生成版本内容（标准版/创意版）
/
- **`generateComparisonContent`**  (异步)
  生成对比内容
/
- **`regenerateContent`**  (异步)
  重新生成内容
/
- **`generateTitle`**  (异步)
  生成标题
/
- **`if`**  
- **`catch`**  
- **`buildSystemPrompt`**  
- **`getPlatformOptimizedParams`**  
- **`getCharCountControl`**  
  获取字符数控制信息
/
- **`getPlatformAdvice`**  
  获取平台建议
/

---

## AIService

暂无描述

**文件:** `features/titleGeneration/services/AIService.ts`

**类型:** 类

### 方法

- **`initializeModels`**  
- **`callWithFallback`**  (异步)
  使用降级策略调用 AI (支持并发)
/
- **`callBatch`**  (异步)
  批量调用AI (并发优化)
/
- **`callStream`**  
- **`executeCallWithFallback`**  (异步)
- **`if`**  
- **`for`**  
- **`catch`**  
- **`callSingleModel`**  (异步)
- **`if`**  
  根据模型选择调用方式
- **`isAvailable`**  (异步)
  检查模型是否可用
/
- **`if`**  
- **`catch`**  
- **`getAvailableModels`**  
  获取可用模型列表
/
- **`resetModelStatus`**  
  重置模型状态
/
- **`getModelStats`**  
  获取模型统计信息
/
- **`buildTitleGenerationPrompt`**  
  构建标题生成提示词
/
- **`getSystemPrompt`**  
- **`getUserPrompt`**  

---

## CacheService

暂无描述

**文件:** `features/titleGeneration/services/CacheService.ts`

**类型:** 类

### 方法

- **`if`**  
- **`if`**  
- **`if`**  
- **`delete`**  
  删除缓存项
/
- **`deleteByTag`**  
  根据标签删除缓存项
/
- **`clear`**  
  清空所有缓存
/
- **`has`**  
  检查缓存项是否存在且未过期
/
- **`if`**  
- **`getStats`**  
  获取缓存统计信息
/
- **`getKeys`**  
  获取缓存键列表
/
- **`getEntryInfo`**  
  获取缓存项详情
/
- **`catch`**  
- **`ensureSpace`**  
- **`while`**  
- **`evictLRU`**  
- **`if`**  
- **`if`**  
- **`calculateSize`**  
- **`updateHitRate`**  
- **`startCleanupTimer`**  
- **`if`**  
- **`cleanup`**  
- **`if`**  
- **`if`**  
- **`destroy`**  
  销毁缓存服务
/
- **`if`**  

---

## ConcurrencyManager

暂无描述

**文件:** `features/titleGeneration/services/ConcurrencyManager.ts`

**类型:** 类

### 方法

- **`if`**  
  检查队列容量
- **`if`**  
- **`if`**  
  启动下一个请求
- **`if`**  
- **`if`**  
- **`while`**  
- **`if`**  
  等待至少一个请求完成
- **`while`**  
  按顺序yield已完成的结果
- **`if`**  
- **`if`**  
  如果没有活跃请求且还有未完成的，等待一下
- **`getStats`**  
  获取并发统计
/
- **`clearQueue`**  
  清空队列
/
- **`configure`**  
  设置并发参数
/
- **`if`**  
- **`if`**  
- **`if`**  
  设置批处理定时器
- **`processQueue`**  (异步)
- **`while`**  
- **`processBatches`**  
- **`if`**  
- **`catch`**  
- **`warn`**  
- **`if`**  
- **`shouldRetry`**  
- **`if`**  
- **`checkRateLimit`**  
- **`for`**  
  清理旧的计数
- **`if`**  
- **`if`**  
- **`updateStats`**  
- **`generateRequestId`**  
- **`generateBatchId`**  
- **`startCleanupTimer`**  
- **`filter`**  
- **`destroy`**  
  销毁管理器
/
- **`if`**  
- **`if`**  

---

## PerformanceMonitor

暂无描述

**文件:** `features/titleGeneration/services/PerformanceMonitor.ts`

**类型:** 类

### 方法

- **`recordMetric`**  
  记录性能指标
/
- **`if`**  
  限制内存使用，只保留最近的指标
- **`recordResponseTime`**  
  记录响应时间
/
- **`if`**  
  检查慢请求
- **`recordError`**  
  记录错误
/
- **`recordCacheHit`**  
  记录缓存命中
/
- **`generateReport`**  
  生成性能报告
/
- **`getRealTimeMetrics`**  
  获取实时指标
/
- **`cleanup`**  
  清理旧指标
/
- **`checkThresholds`**  
- **`switch`**  
- **`if`**  
- **`generateRecommendations`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`generateAlerts`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`exportMetrics`**  
  导出指标数据
/
- **`reset`**  
  重置监控
/

---

## QualityScoreService

暂无描述

**文件:** `features/titleGeneration/services/QualityScoreService.ts`

**类型:** 类

### 方法

- **`calculateScore`**  (异步)
  计算标题综合质量评分
/
- **`validateTitle`**  
  验证标题是否符合平台要求
/
- **`if`**  
  长度检查
- **`if`**  
- **`for`**  
  禁用模式检查
- **`if`**  
- **`calculateSemanticFit`**  
- **`if`**  
- **`calculateEmotionalAppeal`**  
- **`calculateDiversityScore`**  
- **`if`**  
  长度多样性
- **`if`**  
- **`calculateUtilizationScore`**  
- **`if`**  
  最佳利用率在70%-90%之间
- **`if`**  
- **`if`**  
- **`extractKeywords`**  
- **`generateQualityFeedback`**  
- **`if`**  
  语义相关性问题
- **`if`**  
  情绪吸引力问题
- **`if`**  
  结构多样性问题
- **`if`**  
  语义完整性问题
- **`if`**  
  字符利用率问题
- **`if`**  

---

## StreamingTitleService

暂无描述

**文件:** `features/titleGeneration/services/StreamingTitleService.ts`

**类型:** 类

### 方法

- **`generateTitlesStream`**  
- **`if`**  
- **`for`**  
  模拟流式返回缓存结果
- **`if`**  
- **`warn`**  
- **`for`**  
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`if`**  
- **`generateBatchStream`**  
- **`while`**  
- **`catch`**  
- **`if`**  
- **`error`**  
- **`if`**  
  启动下一个任务
- **`createMultiplePrompts`**  
- **`for`**  
- **`parseAIResponse`**  
- **`catch`**  
- **`calculateAverageScore`**  

---

## TitleGenerationService

暂无描述

**文件:** `features/titleGeneration/services/TitleGenerationService.ts`

**类型:** 类

### 方法

- **`generateTitles`**  (异步)
  生成标题 (支持并发和流式处理)
/
- **`if`**  
  如果启用流式处理，使用流式服务
- **`if`**  
  如果启用并发处理，使用并发优化
- **`generateTitlesWithStreaming`**  (异步)
- **`await`**  
- **`generateTitlesWithConcurrency`**  (异步)
- **`if`**  
- **`for`**  
- **`catch`**  
- **`if`**  
- **`generateTitlesDefault`**  (异步)
- **`if`**  
- **`catch`**  
- **`if`**  
- **`evaluateQuality`**  (异步)
  评估标题质量
/
- **`getPlatformConfig`**  
  获取平台配置
/
- **`clearCache`**  
  清除缓存
/
- **`getStats`**  
  获取统计信息
/
- **`if`**  
- **`if`**  
- **`validateInput`**  
- **`if`**  
- **`if`**  
- **`generateCacheKey`**  
- **`buildPrompt`**  
- **`parseAIResponse`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`extractTitlesFromText`**  
- **`for`**  
- **`for`**  
- **`scoreTitles`**  (异步)
- **`for`**  
- **`catch`**  
- **`filterAndSortTitles`**  
- **`calculateAverageScore`**  
- **`createConcurrentPrompts`**  
- **`for`**  
- **`if`**  
- **`scoreTitlesConcurrently`**  (异步)
- **`scoreTitle`**  (异步)
- **`catch`**  
- **`deduplicateTitles`**  
- **`getConcurrencyStats`**  
  获取并发管理器统计
/
- **`configureConcurrency`**  
  配置并发参数
/
- **`updateStats`**  
- **`if`**  
- **`if`**  

---

## AIAnalysisService

AI 分析服务
@description 处理品牌资料的 AI 分析，使用 GPT-4o 模型

🔧 FIXED: 移除单例模式，改为依赖注入管理
/

**文件:** `services/aiAnalysisService.ts`

**类型:** 类

### 方法

- **`getSupportedFileTypes`**  
- **`isFileTypeSupported`**  
- **`analyzeBrandContent`**  (异步)
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`analyzeFiles`**  (异步)
- **`for`**  
  读取所有文件内容
- **`if`**  
- **`catch`**  
- **`checkContent`**  (异步)
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`readFileContent`**  (异步)
- **`if`**  
  对于大文件，添加内存管理提示
- **`for`**  
- **`if`**  
  显示解析进度
- **`catch`**  
- **`catch`**  
- **`if`**  
- **`if`**  
  如果有解析警告，记录但不影响结果
- **`catch`**  
- **`if`**  
- **`for`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`catch`**  
- **`if`**  
- **`catch`**  
- **`catch`**  

---

## AuthMonitoringService

认证监控服务类
/

**文件:** `services/authMonitoringService.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`startMonitoring`**  
- **`stopMonitoring`**  
  停止监控
/
- **`if`**  
- **`recordAuthAttempt`**  
  记录认证尝试
/
- **`recordAuthSuccess`**  
  记录认证成功
/
- **`recordAuthFailure`**  
  记录认证失败
/
- **`recordPerformanceMetric`**  
  记录性能指标
/
- **`getAuthMetrics`**  
  获取认证指标
/
- **`getRealTimeMetrics`**  
  获取实时指标（最近5分钟）
/
- **`getActiveAlerts`**  
  获取性能告警
/
- **`checkMetrics`**  
- **`if`**  
  检查响应时间告警
- **`if`**  
- **`addEvent`**  
- **`if`**  
  限制事件数量
- **`addAlert`**  
- **`if`**  
- **`if`**  
  限制告警数量
- **`generateEventId`**  
- **`getMethodByEventId`**  
- **`getErrorSeverity`**  
- **`recordPerformanceEvent`**  
- **`if`**  
- **`catch`**  
- **`sendAlertToExternalSystem`**  
- **`exportMonitoringData`**  
  导出监控数据
/
- **`cleanup`**  
  清理历史数据
/

---

## BookmarkService

书签服务类
/

**文件:** `services/bookmarkService.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`getBookmarks`**  (异步)
  获取所有书签
/
- **`catch`**  
- **`getTopicBookmarks`**  (异步)
  获取热点话题书签（向后兼容）
/
- **`if`**  
  如果新数据为空，尝试从旧的localStorage键获取
- **`if`**  
- **`if`**  
  迁移到新的统一数据系统
- **`catch`**  
- **`catch`**  
- **`addBookmark`**  (异步)
  添加书签
/
- **`if`**  
- **`catch`**  
- **`addTopicBookmark`**  (异步)
  添加话题书签（向后兼容）
/
- **`if`**  
- **`catch`**  
- **`removeBookmark`**  (异步)
  移除书签
/
- **`if`**  
- **`catch`**  
- **`removeTopicBookmark`**  (异步)
  移除话题书签（向后兼容）
/
- **`if`**  
- **`catch`**  
- **`isBookmarked`**  (异步)
  检查是否已书签
/
- **`isTopicBookmarked`**  (异步)
  检查话题是否已书签
/
- **`getBookmarksByType`**  (异步)
  根据类型获取书签
/
- **`searchBookmarks`**  (异步)
  搜索书签
/
- **`searchTopicBookmarks`**  (异步)
  搜索话题书签
/
- **`getStats`**  (异步)
  获取书签统计信息
/
- **`exportBookmarks`**  (异步)
  导出书签
/
- **`importBookmarks`**  (异步)
  导入书签
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`clearAllBookmarks`**  (异步)
  清空所有书签
/
- **`if`**  
- **`catch`**  
- **`generateId`**  
- **`updateCache`**  
- **`isCacheValid`**  
- **`clearCache`**  
  清理缓存
/

---

## BrandCorpusService

品牌语料库服务类
/

**文件:** `services/brandCorpusService.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`processDocumentV2`**  (异步)
- **`catch`**  
- **`catch`**  
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`if`**  
- **`processDocument`**  (异步)
- **`catch`**  
- **`preprocessContent`**  
- **`detectLanguage`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`structureExtractedFields`**  
- **`extractBrandCorpusFields`**  (异步)
- **`getFieldExtractionRules`**  
- **`parseExtractionResult`**  
- **`forEach`**  
- **`catch`**  
- **`generateAISuggestions`**  (异步)
- **`forEach`**  
- **`processBatchDocuments`**  (异步)
- **`for`**  
- **`if`**  
  使用率限制控制器替代固定延迟，消除技术债务
- **`catch`**  
- **`mergeExtractionResults`**  
- **`if`**  
  如果没有现有语料库，创建新的
- **`updateFieldStatus`**  
- **`for`**  
  导航到目标字段
- **`if`**  
- **`getFieldItems`**  
- **`for`**  
  导航到目标字段
- **`if`**  
- **`createEmptyCorpus`**  
- **`appendExtractionToCorpus`**  
- **`appendFieldToCorpus`**  
- **`switch`**  
  根据字段名映射到对应的语料库字段
- **`resolveCorpusConflicts`**  (异步)
- **`catch`**  
- **`mapFieldToCorpus`**  
- **`switch`**  
  根据字段名映射到对应的语料库字段
- **`if`**  
- **`if`**  
- **`cleanAIResponse`**  
- **`if`**  
- **`extractJsonFromText`**  
- **`if`**  
- **`catch`**  
- **`createDefaultExtractionResult`**  
- **`fixJsonFormat`**  
- **`if`**  

---

## BrandDatabaseService

品牌数据库服务
@description 处理品牌档案的数据库存储和检索

🔧 FIXED: 移除单例模式，改为依赖注入管理
/

**文件:** `services/brandDatabaseService.ts`

**类型:** 类

### 方法

- **`initDatabase`**  (异步)
- **`saveBrandProfile`**  (异步)
- **`getBrandProfile`**  (异步)
- **`getAllBrandProfiles`**  (异步)
- **`deleteBrandProfile`**  (异步)
- **`searchBrandProfiles`**  (异步)
- **`getLatestBrandProfile`**  (异步)
- **`if`**  

---

## BrandProfileService

品牌调性服务
@description 处理品牌资料的分析、存储和应用

🔧 FIXED: 移除单例模式，改为依赖注入管理
/

**文件:** `services/brandProfileService.ts`

**类型:** 类

### 方法

- **`setCurrentUserId`**  
- **`getDataService`**  
- **`if`**  
- **`setCurrentProfile`**  (异步)
- **`if`**  
  保存到 Supabase 数据库作为用户属性数据
- **`if`**  
- **`catch`**  
- **`getCurrentProfile`**  (异步)
- **`if`**  
- **`if`**  
- **`if`**  
  尝试从 Supabase 获取用户品牌数据（使用brand_name字段查询）
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`generatePrompt`**  (异步)
- **`if`**  
- **`generatePromptWithConfig`**  (异步)
- **`if`**  
- **`generatePlatformPrompt`**  (异步)
- **`if`**  
- **`generateContentCheckPrompt`**  (异步)
- **`if`**  
- **`generateOptimizationPrompt`**  (异步)
- **`if`**  
- **`generateMultiVersionPrompt`**  (异步)
- **`if`**  
- **`generateToneAnalysisPrompt`**  (异步)
- **`analyzeFiles`**  (异步)
- **`catch`**  
- **`analyzeBrandTone`**  (异步)
- **`catch`**  
- **`buildComprehensiveBrandToneAnalysis`**  (异步)
- **`for`**  
- **`catch`**  
- **`if`**  
  将AI分析结果转换为BrandToneAnalysis格式
- **`catch`**  
- **`catch`**  
- **`validateAndNormalizeBrandToneAnalysis`**  
- **`createFallbackBrandToneAnalysis`**  
- **`slice`**  
- **`checkContent`**  (异步)
- **`if`**  
- **`catch`**  
- **`getAllProfiles`**  (异步)
- **`searchProfiles`**  (异步)
- **`deleteProfile`**  (异步)
- **`if`**  
  从 Supabase 中删除
- **`if`**  
- **`if`**  
  如果删除的是当前档案，清空当前档案
- **`catch`**  
- **`hasBrandProfile`**  (异步)
- **`getBrandSummary`**  (异步)
- **`if`**  
- **`getBrandToneOverview`**  (异步)
- **`if`**  
- **`getPlatformStrategy`**  (异步)
- **`if`**  
- **`updatePlatformStrategy`**  (异步)
- **`if`**  
- **`if`**  
  更新平台策略

---

## BrandPromptService

品牌调性 Prompt 构造函数服务
@description 根据品牌档案构建用于内容生成的 prompt

🔧 FIXED: 移除单例模式，改为依赖注入管理
/

**文件:** `services/brandPromptService.ts`

**类型:** 类

### 方法

- **`buildCoreValues`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`buildToneInfo`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`buildCoreTopics`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`buildHashtags`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`buildKeywords`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`buildRiskControl`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`buildBrandIdentity`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`buildTargetAudience`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`buildBrandInfo`**  
- **`if`**  
- **`buildContentRequirements`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`buildBrandPrompt`**  
- **`getDefaultTemplate`**  
- **`buildPlatformBrandPrompt`**  
- **`getPlatformSpecificRequirements`**  
- **`getPlatformStrategy`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`buildContentCheckPrompt`**  
- **`buildOptimizationPrompt`**  
- **`buildMultiVersionPrompt`**  
- **`buildToneAnalysisPrompt`**  

---

## BufPayService

暂无描述

**文件:** `services/bufpayService.ts`

**类型:** 类

### 方法

- **`createPayment`** (静态) (异步)
  创建支付订单
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`queryPaymentStatus`** (静态) (异步)
  查询支付状态
/
- **`if`**  
- **`catch`**  
- **`handlePaymentNotify`** (静态) (异步)
  处理支付回调
/
- **`if`**  
- **`if`**  
- **`if`**  
  3. 检查订单状态
- **`catch`**  
- **`checkOrderStatus`** (静态) (异步)
  检查订单支付状态
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`getUserSubscriptionStatus`** (静态) (异步)
  获取用户当前订阅状态
/
- **`if`**  
- **`catch`**  
- **`queryBufPayStatus`** (静态) (异步)
  查询 BufPay 支付状态
接口地址：https://bufpay.com/api/query/aoid
返回状态：not_exist, new, payed, success, fee_error, expire
/
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`queryBufPayDirectly`** (静态) (异步)
- **`if`**  
- **`catch`**  

---

## DataAccessLayer

数据访问层类
/

**文件:** `services/dataAccessLayer.ts`

**类型:** 类

### 方法

- **`if`**  
- **`logAccess`**  
- **`if`**  
  保持日志数量在合理范围内
- **`validateTableAccess`**  
- **`if`**  
  管理员可以访问所有表
- **`for`**  
- **`catch`**  
- **`if`**  
  最后一次尝试失败，抛出错误
- **`if`**  
- **`catch`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`delete`**  (异步)
  删除记录
/
- **`if`**  
- **`catch`**  
- **`if`**  
- **`deleteMany`**  (异步)
  批量删除记录
/
- **`if`**  
- **`catch`**  
- **`if`**  
- **`count`**  (异步)
  统计记录数量
/
- **`if`**  
- **`catch`**  
- **`if`**  
- **`getAccessLogs`**  
  获取访问日志
/
- **`clearAccessLogs`**  
  清除访问日志
/
- **`getUserStats`**  (异步)
  获取用户统计信息
/
- **`catch`**  
- **`catch`**  

---

## DataMigrationService

数据迁移服务
/

**文件:** `services/dataMigrationService.ts`

**类型:** 类

### 方法

- **`setUserId`**  
  设置用户ID
/
- **`analyzeMigrationPlan`**  (异步)
  分析现有数据并生成迁移计划
/
- **`if`**  
- **`if`**  
  只迁移需要数据库存储的数据
- **`for`**  
- **`if`**  
- **`catch`**  
- **`incrementalSync`**  (异步)
  增量同步数据
/
- **`for`**  
- **`if`**  
- **`catch`**  
- **`for`**  
- **`if`**  
- **`catch`**  
- **`validateDataIntegrity`**  (异步)
  数据完整性验证
/
- **`if`**  
  检查数据库数据（如果应该存在的话）
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
  检查敏感数据的安全性
- **`catch`**  
- **`cleanupData`**  (异步)
  清理过期和无效数据
/
- **`for`**  
- **`if`**  
  检查TTL
- **`if`**  
- **`if`**  
  检查用户权限（清理其他用户的数据）
- **`catch`**  
- **`if`**  
- **`getMigrationHistory`**  
  获取迁移历史记录
/
- **`getSyncConflicts`**  
  获取同步冲突列表
/
- **`scanLocalStorageData`**  
- **`for`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`extractDataKey`**  
- **`calculateMigrationPriority`**  
- **`if`**  
  敏感数据优先级最高
- **`if`**  
  业务数据次之
- **`if`**  
  用户偏好数据
- **`if`**  
  需要版本控制的数据
- **`if`**  
  启用同步的数据
- **`findDataDependencies`**  
- **`migrateSingleItem`**  (异步)
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`syncSingleKey`**  (异步)
- **`if`**  
  如果只有一边有数据，直接同步
- **`if`**  
- **`if`**  
  两边都有数据，检查冲突
- **`if`**  
- **`catch`**  
- **`detectConflict`**  
- **`if`**  
  检查数据结构
- **`applyConflictResolution`**  (异步)
- **`switch`**  
- **`catch`**  
- **`compareData`**  
- **`mergeData`**  
- **`if`**  
  简单合并策略：优先使用最新的时间戳
- **`calculateChecksum`**  
- **`verifyMigration`**  (异步)
- **`catch`**  
- **`validateEncryption`**  
- **`loadMigrationHistory`**  
- **`saveMigrationHistory`**  (异步)
- **`loadFromLocal`**  (异步)
- **`loadFromDatabase`**  (异步)
- **`saveToLocal`**  (异步)

---

## DataPreloadService

数据预加载服务类
/

**文件:** `services/dataPreloadService.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`preloadForRoute`**  (异步)
  为特定路由预加载数据
/
- **`if`**  
- **`if`**  
  关键数据必须等待完成
- **`if`**  
  高优先级数据并行加载，但不阻塞
- **`if`**  
- **`if`**  
- **`smartPreload`**  (异步)
  智能预加载 - 预测用户行为
/
- **`for`**  
  为预测路由预加载数据
- **`if`**  
- **`batchPreload`**  (异步)
  批量预加载指定数据
/
- **`catch`**  
- **`if`**  
- **`preloadSingle`**  (异步)
- **`catch`**  
- **`createPreloadPromise`**  (异步)
- **`async`**  
- **`groupByPriority`**  
- **`forEach`**  
- **`switch`**  
- **`preloadGroup`**  (异步)
- **`if`**  
- **`predictNextRoutes`**  
- **`getStats`**  
  获取预加载统计信息
/
- **`cleanup`**  
  清理完成的预加载记录
/
- **`isPreloaded`**  
  检查数据是否已预加载
/
- **`waitForPreload`**  (异步)
  等待特定数据预加载完成
/
- **`if`**  

---

## DataSyncConflictResolver

数据同步冲突解决器
/

**文件:** `services/dataSyncConflictResolver.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`detectConflicts`**  
  检测冲突
/
- **`for`**  
  检查本地项目的冲突
- **`if`**  
- **`if`**  
- **`for`**  
  检查远程独有项目（可能是本地删除的）
- **`resolveConflicts`**  (异步)
  解决冲突
/
- **`for`**  
- **`if`**  
- **`catch`**  
- **`resolveConflict`**  (异步)
- **`switch`**  
- **`resolveWithLocalWins`**  
- **`resolveWithRemoteWins`**  
- **`resolveWithLatestTimestamp`**  
- **`resolveWithMerge`**  (异步)
- **`catch`**  
- **`resolveWithCopy`**  
- **`mergeData`**  
- **`if`**  
- **`from`**  
- **`parse`**  
- **`if`**  
- **`determineConflictType`**  
- **`if`**  
  检查版本不匹配
- **`if`**  
- **`if`**  
  如果时间差很小（1秒内），认为是并发修改
- **`calculateChecksum`**  
- **`getResolutionStrategy`**  
- **`inferDataType`**  
- **`if`**  
  根据数据结构推断类型
- **`generateConflictDescription`**  
- **`switch`**  
- **`addPendingConflict`**  
- **`if`**  
  设置超时自动处理
- **`if`**  
- **`getPendingConflicts`**  
  获取待处理冲突
/
- **`manualResolveConflict`**  (异步)
  手动解决冲突
/
- **`if`**  
- **`if`**  
- **`if`**  
  恢复原始策略
- **`batchResolveConflicts`**  (异步)
  批量解决冲突
/
- **`for`**  
- **`catch`**  

---

## DatabaseHealthService

数据库健康检查服务类
/

**文件:** `services/databaseHealthService.ts`

**类型:** 类

### 方法

- **`initialize`**  (异步)
  初始化服务
/
- **`catch`**  
- **`performHealthCheck`**  (异步)
  执行完整的数据库健康检查
/
- **`for`**  
- **`if`**  
  如果表不可访问，标记为不健康
- **`catch`**  
- **`checkTableHealth`**  (异步)
- **`if`**  
- **`catch`**  
- **`testTablePermissions`**  (异步)
- **`catch`**  
- **`catch`**  
- **`catch`**  
- **`generateRecommendations`**  
- **`if`**  
- **`if`**  
- **`autoFix`**  (异步)
  自动修复常见问题
/
- **`for`**  
  目前只能修复一些简单的问题，复杂的表结构问题需要手动处理
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`enableFallbackMode`**  
  启用降级模式
/
- **`if`**  
  设置全局标志，让其他服务知道数据库不可用
- **`isFallbackMode`**  
  检查是否处于降级模式
/
- **`disableFallbackMode`**  
  禁用降级模式
/
- **`if`**  

---

## DatabaseInitializer

数据库初始化器类
/

**文件:** `services/databaseInitializer.ts`

**类型:** 类

### 方法

- **`tableExists`**  (异步)
- **`if`**  
  如果没有错误，表存在
- **`catch`**  
- **`ensureTableExists`**  (异步)
- **`if`**  
- **`initializeDatabase`**  (异步)
  初始化数据库表结构
/
- **`if`**  
  防止重复初始化
- **`if`**  
  防止并发初始化
- **`performInitialization`**  (异步)
- **`if`**  
- **`catch`**  
- **`if`**  
- **`validateAccess`**  (异步)
  验证数据访问权限
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getDatabaseStatus`**  (异步)
  获取数据库状态信息
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`generateCreateSQL`**  
  生成建表SQL语句（用于手动执行）
/
- **`if`**  
- **`if`**  
  添加索引
- **`if`**  
  添加安全策略

---

## DynamicPricingService

暂无描述

**文件:** `services/dynamicPricingService.ts`

**类型:** 类

### 方法

- **`calculatePrice`** (静态) (异步)
  计算动态价格
/
- **`if`**  
- **`switch`**  
  根据操作类型计算价格
- **`calculateNewSubscriptionPrice`** (静态) 
- **`if`**  
- **`calculateRenewalPrice`** (静态) 
- **`if`**  
- **`calculateUpgradePrice`** (静态) 
- **`if`**  
  如果有当前订阅信息，计算补差价；否则按全价
- **`if`**  
- **`calculateProratedUpgradePrice`** (静态) 
- **`if`**  
- **`if`**  
- **`validateManualAmount`** (静态) 
  验证手动输入的金额
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`getOriginalPrice`** (静态) 
- **`formatPriceDisplay`** (静态) 
  格式化价格显示
/
- **`if`**  
- **`if`**  
- **`if`**  

---

## EncryptionService

数据加密服务
🔒 安全修复：使用AES-256-GCM加密替换Base64编码

功能：
1. 提供真正的数据加密和解密
2. 使用认证加密模式防止篡改
3. 自动生成和验证随机盐值
4. 支持密钥派生和轮换
/
使用Web Crypto API（浏览器原生加密）

**文件:** `services/encryptionService.ts`

**类型:** 类

### 方法

- **`getCryptoKey`** (静态) (异步)
- **`generateNewKey`** (静态) (异步)
- **`catch`**  
- **`getMasterKey`** (静态) (异步)
- **`if`**  
- **`if`**  
- **`if`**  
  生成新的主密钥（仅在开发环境）
- **`generateRandomKey`** (静态) 
- **`for`**  
- **`encrypt`** (静态) (异步)
  加密数据
/
- **`if`**  
- **`catch`**  
- **`decrypt`** (静态) (异步)
  解密数据
/
- **`if`**  
- **`catch`**  
- **`generateChecksum`** (静态) (异步)
  生成数据完整性校验和
/
- **`catch`**  
- **`verifyChecksum`** (静态) (异步)
  验证数据完整性
/
- **`catch`**  
- **`isAvailable`** (静态) 
  检查加密功能是否可用
/
- **`clearSensitiveData`** (静态) 
  清理敏感数据
/
- **`arrayBufferToBase64`** (静态) 
- **`for`**  
- **`base64ToArrayBuffer`** (静态) 
- **`for`**  

---

## FallbackEncryptionService

降级加密服务（用于不支持Web Crypto API的环境）
/

**文件:** `services/encryptionService.ts`

**类型:** 类

### 方法

- **`encrypt`** (静态) 
  简单加密（仅用于降级场景）
/
- **`for`**  
- **`catch`**  
- **`decrypt`** (静态) 
  简单解密
/
- **`for`**  
- **`catch`**  

---

## SecureEncryption

统一加密接口

**文件:** `services/encryptionService.ts`

**类型:** 类

### 方法

- **`encrypt`** (静态) (异步)
  自动选择最佳加密方式
/
- **`decrypt`** (静态) (异步)
  自动选择最佳解密方式
/
- **`catch`**  
- **`generateChecksum`** (静态) (异步)
  生成校验和
/
- **`for`**  
- **`verifyChecksum`** (静态) (异步)
  验证校验和
/

---

## EnhancedDataPreloader

增强数据预加载器类
/

**文件:** `services/enhancedDataPreloader.ts`

**类型:** 类

### 方法

- **`startPreloadProcess`**  (异步)
  启动完整预加载流程
/
- **`if`**  
  关键数据和高频数据之间稍作间隔
- **`if`**  
- **`isPreloaded`**  
  检查数据是否已预加载
/
- **`getPreloadResult`**  
  获取预加载结果
/
- **`getAllPreloadResults`**  
  获取所有预加载结果
/
- **`refreshData`**  (异步)
  强制刷新指定数据
/
- **`if`**  
- **`stopBackgroundRefresh`**  
  停止后台刷新
/
- **`if`**  
- **`getStats`**  
  获取预加载统计信息
/
- **`if`**  
- **`groupConfigsByPriority`**  
- **`loadPriorityBatch`**  (异步)
- **`for`**  
- **`if`**  
  批次之间稍作间隔，避免过载
- **`loadSingleItem`**  (异步)
- **`performLoad`**  (异步)
- **`for`**  
- **`if`**  
- **`catch`**  
- **`warn`**  
- **`startBackgroundRefresh`**  
- **`if`**  
- **`for`**  
- **`catch`**  
- **`calculateStats`**  
- **`getMaxConcurrentForPriority`**  
- **`switch`**  
- **`for`**  
- **`delay`**  

---

## EnhancedSyncOptimizer

增强同步优化器类
/

**文件:** `services/enhancedSyncOptimizer.ts`

**类型:** 类

### 方法

- **`forEach`**  
- **`getInstance`** (静态) 
- **`if`**  
- **`addSyncTask`**  (异步)
  添加同步任务到队列
/
- **`calculateIncrementalDiff`**  
  计算增量差异
/
- **`if`**  
- **`if`**  
  深度对比（简化版本）
- **`for`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`scheduleBatchProcessing`**  (异步)
- **`for`**  
  按优先级处理队列
- **`catch`**  
- **`processPriorityQueue`**  (异步)
- **`for`**  
- **`catch`**  
- **`error`**  
- **`for`**  
- **`if`**  
- **`if`**  
  添加最后一个批次
- **`processSyncBatch`**  (异步)
- **`catch`**  
- **`optimizeBatchCompression`**  (异步)
- **`for`**  
- **`compressData`**  (异步)
- **`catch`**  
- **`decompressData`**  (异步)
  数据解压缩
/
- **`for`**  
- **`catch`**  
- **`shouldCompress`**  
- **`estimateDataSize`**  
- **`calculateChecksum`**  
- **`for`**  
- **`generateSyncId`**  
- **`getDataVersion`**  
- **`initNetworkQualityMonitoring`**  
- **`getAdaptiveConfig`**  
- **`if`**  
- **`switch`**  
  根据网络质量调整配置
- **`executeBatchSync`**  (异步)
- **`updateSyncStats`**  
- **`if`**  
- **`handleBatchSyncFailure`**  
- **`for`**  
  将失败的项目重新加入队列，降低优先级
- **`getSyncStats`**  
  获取同步统计信息
/
- **`clearSyncQueue`**  
  清理同步队列
/
- **`forEach`**  

---

## FavoritesService

收藏服务类
/

**文件:** `services/favoritesService.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`getFavorites`**  (异步)
  获取所有收藏
/
- **`catch`**  
- **`addFavorite`**  (异步)
  添加收藏
/
- **`if`**  
- **`catch`**  
- **`removeFavorite`**  (异步)
  移除收藏
/
- **`if`**  
- **`catch`**  
- **`addMultipleFavorites`**  (异步)
  批量添加收藏
/
- **`if`**  
- **`catch`**  
- **`removeMultipleFavorites`**  (异步)
  批量移除收藏
/
- **`if`**  
- **`catch`**  
- **`updateFavorite`**  (异步)
  更新收藏项
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getFavoritesByType`**  (异步)
  根据类型获取收藏
/
- **`getFavoritesBySource`**  (异步)
  根据来源获取收藏
/
- **`searchFavorites`**  (异步)
  搜索收藏
/
- **`isFavorited`**  (异步)
  检查是否已收藏
/
- **`getStats`**  (异步)
  获取收藏统计信息
/
- **`exportFavorites`**  (异步)
  导出收藏
/
- **`importFavorites`**  (异步)
  导入收藏
/
- **`if`**  
- **`catch`**  
- **`clearFavorites`**  (异步)
  清空所有收藏
/
- **`if`**  
- **`catch`**  
- **`generateId`**  
- **`updateCache`**  
- **`isCacheValid`**  
- **`clearCache`**  
  清理缓存
/

---

## FileFormatSupportService

暂无描述

**文件:** `services/fileFormatSupportService.ts`

**类型:** 类

### 方法

- **`getSupportedFileTypes`**  
- **`isFileTypeSupported`**  
- **`checkFileFormatSupport`**  
- **`if`**  
- **`if`**  
  检查MIME类型匹配
- **`getFileFormatInfo`**  
- **`getFormatSupportSummary`**  
- **`generateUserFriendlyDescription`**  
- **`getUploadHintText`**  
- **`getFileAcceptString`**  
- **`validateAndSuggest`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`getModuleLockInfo`**  

---

## GlobalDataValidationService

暂无描述

**文件:** `services/globalDataValidationService.ts`

**类型:** 类

### 方法

- **`initialize`** (静态) 
  初始化数据验证服务
/
- **`catch`**  
- **`fixTimestampDataType`** (静态) 
- **`if`**  
- **`if`**  
- **`catch`**  
- **`shouldRunValidation`** (静态) 
- **`catch`**  
- **`performValidation`** (静态) 
- **`if`**  
- **`catch`**  
- **`validateUserData`** (静态) 
- **`if`**  
- **`if`**  
- **`catch`**  
- **`cleanupExpiredData`** (静态) 
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`fixCorruptedData`** (静态) 
- **`catch`**  
- **`catch`**  
- **`cleanupDuplicateData`** (静态) 
- **`if`**  
- **`catch`**  
- **`forEach`**  
- **`catch`**  
- **`setupStorageListener`** (静态) 
- **`if`**  
  使用requestIdleCallback替代setTimeout，提高性能
- **`if`**  
  使用环境检查避免服务端渲染错误
- **`updateValidationTimestamp`** (静态) 
- **`if`**  
- **`catch`**  
- **`forceValidation`** (静态) 
  手动触发验证
/
- **`checkDataHealth`** (静态) 
  检查当前数据健康状态
/
- **`if`**  
- **`catch`**  
- **`if`**  
- **`catch`**  

---

## IntelligentCacheManager

智能缓存管理器类
/

**文件:** `services/intelligentCacheManager.ts`

**类型:** 类

### 方法

- **`get`**  
  获取缓存数据
/
- **`if`**  
- **`set`**  
  设置缓存数据
/
- **`if`**  
- **`catch`**  
- **`remove`**  
  移除缓存数据
/
- **`if`**  
- **`catch`**  
- **`getBatch`**  
  批量获取
/
- **`for`**  
- **`setBatch`**  
  批量设置
/
- **`for`**  
- **`ensureCapacity`**  
- **`if`**  
  检查内存限制
- **`if`**  
  检查项目数量限制
- **`evictToMakeSpace`**  
- **`for`**  
  计算淘汰评分
- **`if`**  
- **`for`**  
  开始淘汰
- **`calculateEvictionScore`**  
- **`if`**  
  可刷新数据相对安全
- **`evictLeastRecentlyUsed`**  
- **`while`**  
- **`if`**  
  保护关键数据
- **`while`**  
- **`if`**  
- **`updateAccessInfo`**  
- **`if`**  
  检查是否成为热点数据
- **`moveToHead`**  
- **`addToHead`**  
- **`removeNode`**  
- **`isExpired`**  
- **`calculateSize`**  
- **`formatSize`**  
- **`getPriorityWeight`**  
- **`switch`**  
- **`recordAccessTime`**  
- **`if`**  
- **`recordEviction`**  
- **`if`**  
  保持历史记录不超过1000条
- **`updateStats`**  
- **`switch`**  
- **`startCleanupTasks`**  
- **`if`**  
  自适应容量调整
- **`cleanupExpiredItems`**  
- **`for`**  
- **`for`**  
- **`if`**  
- **`updateHotDataKeys`**  
- **`for`**  
- **`if`**  
- **`adjustCapacity`**  
- **`if`**  
  基于命中率和内存使用情况调整容量
- **`if`**  
- **`getStats`**  
  获取缓存统计信息
/
- **`getDetailedInfo`**  
  获取缓存详细信息
/
- **`clear`**  
  清空缓存
/

---

## MD2CardService

MD2Card核心服务类
/

**文件:** `services/md2cardService.ts`

**类型:** 类

### 方法

- **`generateCard`**  (异步)
  生成卡片
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`exportCard`**  (异步)
  导出卡片
/
- **`switch`**  
  根据导出格式选择渲染方法
- **`catch`**  
- **`renderCard`**  (异步)
- **`if`**  
- **`catch`**  
- **`renderCardContent`**  (异步)
- **`if`**  
  渲染标题
- **`if`**  
  渲染副标题
- **`for`**  
- **`switch`**  
- **`if`**  
- **`if`**  
  处理强调样式
- **`for`**  
- **`if`**  
  渲染项目符号
- **`if`**  
- **`if`**  
- **`if`**  
  渲染品牌元素
- **`renderText`**  
- **`for`**  
- **`if`**  
- **`getTextX`**  
- **`switch`**  
- **`renderBrandElements`**  (异步)
- **`if`**  
- **`switch`**  
- **`exportAsRasterImage`**  (异步)
- **`if`**  
- **`if`**  
  如果是JPG格式，设置背景色
- **`if`**  
- **`exportAsSVG`**  (异步)
- **`if`**  
  标题
- **`if`**  
  副标题
- **`for`**  
  内容段落
- **`if`**  
- **`exportAsPDF`**  (异步)
- **`getFontSize`**  
- **`switch`**  
- **`getSVGTextAnchor`**  
- **`switch`**  
- **`escapeXML`**  
- **`estimateImageSize`**  
- **`getTemplateById`**  

---

## MD2WeChatService

MD2WeChat转换服务类

🔧 FIXED: 移除单例模式，改为依赖注入管理
/

**文件:** `services/md2wechatService.ts`

**类型:** 类

### 方法

- **`convertToHTML`**  (异步)
  转换Markdown为HTML
/
- **`if`**  
- **`if`**  
  缓存结果
- **`catch`**  
- **`callConversionAPI`**  (异步)
- **`catch`**  
- **`simpleMarkdownToHTML`**  
- **`getAvailableThemes`**  (异步)
  获取支持的主题列表
/
- **`catch`**  
- **`validateApiKey`**  (异步)
  验证API密钥
/
- **`catch`**  
- **`getQuotaStatus`**  (异步)
  获取用户转换配额
/
- **`catch`**  
- **`generateCacheKey`**  
- **`simpleHash`**  
- **`for`**  
- **`log`**  
- **`if`**  
- **`clearCache`**  
  清除缓存
/
- **`getCacheStats`**  
  获取缓存统计
/

---

## NetworkFallbackHandler

网络异常降级处理器
/

**文件:** `services/networkFallbackHandler.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`if`**  
  检查网络状态
- **`if`**  
  缓存成功的响应
- **`catch`**  
- **`preloadCriticalData`**  (异步)
  预加载关键数据
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`getNetworkStatus`**  
  获取网络状态
/
- **`getStats`**  
  获取统计信息
/
- **`clearCache`**  
  清除缓存
/
- **`if`**  
- **`for`**  
- **`retryFailedRequests`**  (异步)
  强制重试失败的请求
/
- **`if`**  
- **`catch`**  
- **`for`**  
- **`fetch`**  
- **`catch`**  
- **`if`**  
- **`warn`**  
- **`switch`**  
- **`cacheResponse`**  
- **`recordResponseTime`**  
- **`if`**  
- **`if`**  
  更新网络状态
- **`if`**  
- **`initializeNetworkMonitoring`**  
- **`startNetworkQualityCheck`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`startPeriodicCleanup`**  
- **`for`**  
  清理过期缓存
- **`if`**  
- **`if`**  
  清理旧的响应时间数据

---

## NotoEmojiService

Noto Emoji服务类
/

**文件:** `services/notoEmojiService.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`initializeData`**  
- **`buildEmojiMap`**  
- **`getAllEmojis`**  
- **`getEmojisByGroup`**  
- **`searchEmojis`**  
- **`getEmojiByUnicode`**  
- **`getEmojiByCodepoint`**  
- **`generateEmojiUrl`**  
- **`if`**  
- **`if`**  
- **`applySkinToneModifier`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`getEmojiVariants`**  
- **`if`**  
  添加肤色变体
- **`getCustomName`**  
- **`unicodeToCodepoint`**  
- **`codepointToUnicode`**  
- **`isEmojiSupported`**  
- **`getEmojiStats`**  
- **`batchGenerateUrls`**  
- **`exportData`**  

---

## OrderService

暂无描述

**文件:** `services/orderService.ts`

**类型:** 类

### 方法

- **`createOrder`** (静态) (异步)
  创建订单
/
- **`if`**  
- **`catch`**  
- **`updateOrderPaymentInfo`** (静态) (异步)
  更新订单支付信息
/
- **`if`**  
- **`catch`**  
- **`getOrderById`** (静态) (异步)
  根据订单ID查询订单
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getOrderByAoid`** (静态) (异步)
  根据AOID查询订单
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`markOrderAsPaid`** (静态) (异步)
  更新订单状态为已支付
/
- **`if`**  
- **`catch`**  
- **`processOrderPermissions`** (静态) (异步)
  处理订单权限开通
/
- **`if`**  
- **`catch`**  
- **`getUserSubscription`** (静态) (异步)
  获取用户订阅信息
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getUserOrders`** (静态) (异步)
  获取用户订单历史
/
- **`if`**  
- **`catch`**  
- **`getUserSubscriptionByOrderId`** (静态) (异步)
  根据订单ID获取用户订阅信息
/
- **`if`**  
- **`catch`**  

---

## OrderStatusService

暂无描述

**文件:** `services/orderStatusService.ts`

**类型:** 类

### 方法

- **`checkOrderStatus`** (静态) (异步)
  检查订单状态和权限发放情况
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`analyzeNeedsRepair`** (静态) 
- **`if`**  
  如果订单已支付但没有订阅，需要修复
- **`if`**  
  如果订单状态为processed但没有订阅，需要修复
- **`if`**  
  如果订单有错误信息，可能需要修复
- **`getRepairActions`** (静态) 
- **`if`**  
- **`if`**  
- **`if`**  
- **`repairOrderPermissions`** (静态) (异步)
  修复订单权限问题
/
- **`if`**  
- **`catch`**  
- **`batchRepairOrders`** (静态) (异步)
  批量检查和修复订单
/
- **`for`**  
- **`if`**  
- **`catch`**  
- **`getOrdersNeedingRepair`** (静态) (异步)
  获取需要修复的订单列表
/
- **`if`**  
- **`if`**  
- **`catch`**  

---

## PaymentDataCleanupService

暂无描述

**文件:** `services/paymentDataCleanupService.ts`

**类型:** 类

### 方法

- **`cleanupPaymentData`** (静态) 
  清理支付相关的localStorage数据
/
- **`catch`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`catch`**  
- **`cleanupInvalidUserData`** (静态) 
  清理无效的用户数据格式
/
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`isInvalidUserData`** (静态) 
- **`if`**  
  检查是否缺少必要字段
- **`if`**  
  如果是用户对象但缺少基本字段
- **`fixStorageDataFormat`** (静态) 
  修复localStorage数据格式
/
- **`if`**  
- **`if`**  
  如果数据被修复，重新存储
- **`catch`**  
- **`if`**  
- **`catch`**  
- **`performCompleteCleanup`** (静态) 
  执行完整的支付后数据清理
/
- **`if`**  
- **`catch`**  
- **`if`**  
  使用requestAnimationFrame替代setTimeout
- **`forceCleanupValidationFailures`** (静态) 
  强制清理所有验证失败的数据
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`catch`**  
- **`shouldCleanupData`** (静态) 
  检查是否需要清理数据
/
- **`if`**  
  检查是否为无效对象
- **`catch`**  
- **`catch`**  

---

## PaymentService

🔧 FIXED: 移除单例模式，改为依赖注入管理
/

**文件:** `services/paymentService.ts`

**类型:** 类

### 方法

- **`createPaymentOrder`**  (异步)
  创建支付订单
/
- **`catch`**  
- **`verifyPayment`**  (异步)
  验证支付结果
/
- **`catch`**  
- **`upgradeMembership`**  (异步)
  升级用户会员
/
- **`catch`**  
- **`getPaymentOrderStatus`**  (异步)
  获取支付订单状态
/
- **`catch`**  
- **`getUserPaymentHistory`**  (异步)
  获取用户支付历史
/
- **`if`**  
- **`catch`**  
- **`handlePaymentSuccess`**  (异步)
  处理支付成功回调
/
- **`if`**  
- **`catch`**  
- **`getAuthToken`**  
- **`simulatePaymentSuccess`**  (异步)
  ✅ FIXED: 已移除模拟支付功能
📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。


系统现在直接调用真实支付API，不再提供模拟支付
- **`parsePlanFromPayment`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`calculateEndDate`**  
- **`if`**  
- **`getPlanFeatures`**  
- **`if`**  
- **`if`**  

---

## PerformanceMonitor

性能监控器类
/

**文件:** `services/performanceMonitor.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`startMonitoring`**  
  开始性能监控
/
- **`stopMonitoring`**  
  停止性能监控
/
- **`for`**  
  断开所有观察者
- **`recordDataLoadingEvent`**  
  记录数据加载事件
/
- **`recordPageLoadEvent`**  
  记录页面加载事件
/
- **`recordErrorEvent`**  
  记录错误事件
/
- **`getCurrentMetrics`**  
  获取当前性能指标
/
- **`getPerformanceReport`**  
  获取性能报告
/
- **`initializeMetrics`**  
- **`initWebVitalsMonitoring`**  
- **`if`**  
  First Contentful Paint
- **`if`**  
- **`catch`**  
- **`if`**  
  Largest Contentful Paint
- **`catch`**  
- **`if`**  
  First Input Delay
- **`catch`**  
- **`if`**  
  Cumulative Layout Shift
- **`catch`**  
- **`initResourceMonitoring`**  
- **`if`**  
  内存监控
- **`initNetworkMonitoring`**  
- **`if`**  
- **`initInteractionMonitoring`**  
- **`startPeriodicCollection`**  
- **`collectCurrentMetrics`**  
- **`if`**  
  更新DOM Content Loaded时间
- **`if`**  
- **`if`**  
  更新页面加载时间
- **`if`**  
- **`updateDataLoadingMetrics`**  
- **`if`**  
- **`if`**  
- **`if`**  
  更新缓存命中率
- **`updateErrorMetrics`**  
- **`switch`**  
- **`updateLoadTimeDistribution`**  
- **`for`**  
- **`if`**  
- **`if`**  
- **`analyzePerformance`**  
- **`generateRecommendations`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`generateSessionId`**  
- **`generateEventId`**  
- **`getStorageSize`**  
- **`for`**  
- **`evaluateMetric`**  
- **`calculateOverallScore`**  
- **`analyzeTrends`**  
- **`identifyBottlenecks`**  
- **`if`**  
- **`if`**  
- **`if`**  

---

## RobustUnifiedDataManager

健壮统一数据管理器
/

**文件:** `services/robustUnifiedDataManager.ts`

**类型:** 类

### 方法

- **`setUserId`**  
  设置用户ID并初始化服务
/
- **`catch`**  
- **`if`**  
  2. 从缓存获取数据（如果不跳过缓存）
- **`catch`**  
- **`if`**  
  1. 数据验证
- **`if`**  
- **`if`**  
- **`if`**  
  2. 并发控制
- **`if`**  
- **`catch`**  
- **`for`**  
- **`if`**  
- **`dataExists`**  (异步)
  数据存在性检查
/
- **`if`**  
- **`if`**  
  检查云端（如果有服务）
- **`catch`**  
- **`cleanup`**  (异步)
  清理过期数据
/
- **`if`**  
- **`if`**  
  使用内存管理器进行LRU清理
- **`catch`**  
- **`getOperationStats`**  
  获取操作统计
/
- **`resetStats`**  
  重置统计信息
/
- **`if`**  
- **`catch`**  
- **`if`**  
  尝试从云端获取
- **`if`**  
- **`catch`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`if`**  
  保存到云端（如果需要）
- **`if`**  
  等待云端保存
- **`if`**  
- **`calculateChecksum`**  
- **`updateCacheAccess`**  
- **`if`**  
- **`if`**  
  检查数据完整性
- **`if`**  
- **`calculateChecksum`**  
- **`for`**  
- **`recordSuccess`**  
- **`recordFailure`**  
- **`updateAverageResponseTime`**  
- **`getAverageAccessCount`**  
- **`for`**  
- **`setupPeriodicCleanup`**  

---

## DataLockManager

数据锁管理器 - 解决并发写入问题
/

**文件:** `services/robustnessEnhancements.ts`

**类型:** 类

### 方法

- **`acquireLock`**  (异步)
  尝试获取锁
/
- **`if`**  
  清理过期锁
- **`releaseLock`**  
  释放锁
/
- **`if`**  
- **`forceReleaseLock`**  
  强制释放锁（用于异常情况）
/
- **`cleanupExpiredLocks`**  
  清理过期锁
/
- **`if`**  
- **`if`**  
- **`getLockStatus`**  
  获取锁状态
/

---

## ErrorClassifier

错误分类器 - 精确识别和分类错误
/

**文件:** `services/robustnessEnhancements.ts`

**类型:** 类

### 方法

- **`classifyError`**  
  分类错误类型
/
- **`isRetryableError`**  
  判断错误是否可重试
/

---

## RetryManager

重试管理器 - 智能重试算法
/

**文件:** `services/robustnessEnhancements.ts`

**类型:** 类

### 方法

- **`for`**  
- **`if`**  
- **`catch`**  
- **`if`**  
  如果是最后一次尝试，直接失败
- **`warn`**  
- **`delay`**  

---

## DataValidator

数据验证器 - 确保数据完整性
/

**文件:** `services/robustnessEnhancements.ts`

**类型:** 类

### 方法

- **`if`**  
  1. 验证key
- **`if`**  
- **`if`**  
  2. 验证数据不为undefined
- **`catch`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`calculateNestingDepth`**  
- **`if`**  
- **`if`**  
- **`for`**  
- **`if`**  
- **`if`**  
- **`if`**  
  过滤函数
- **`if`**  
  转换Date为ISO字符串
- **`catch`**  

---

## MemoryManager

内存管理器 - 优化缓存使用
/

**文件:** `services/robustnessEnhancements.ts`

**类型:** 类

### 方法

- **`getMemoryUsage`**  
  检查内存使用情况
/
- **`if`**  
- **`if`**  
- **`for`**  
- **`recordAccess`**  
  记录缓存访问
/
- **`isMemoryPressureHigh`**  
  内存压力检查
/

---

## SecureConfigService

安全配置服务类
/

**文件:** `services/secureConfigService.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`getAuthConfig`**  (异步)
  获取认证配置（优先使用缓存）
/
- **`log`**  
- **`if`**  
  尝试使用过期的缓存作为备用
- **`fetchConfigFromServer`**  (异步)
- **`for`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`warn`**  
- **`validateConfig`**  
- **`for`**  
- **`if`**  
- **`catch`**  
- **`getFallbackConfig`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`clearCache`**  
  清除配置缓存
/
- **`getConfigSummary`**  
  获取配置摘要信息（不含敏感信息）
/
- **`if`**  
- **`preloadConfig`**  (异步)
  预加载配置（可用于应用启动时）
/
- **`catch`**  
- **`sleep`**  

---

## SecureUserStateService

安全用户状态管理服务类
/

**文件:** `services/secureUserStateService.ts`

**类型:** 类

### 方法

- **`encrypt`** (静态) (异步)
- **`if`**  
- **`catch`**  
- **`decrypt`** (静态) (异步)
- **`if`**  
- **`catch`**  
- **`generateChecksum`** (静态) (异步)
- **`catch`**  
- **`verifyChecksum`** (静态) (异步)
- **`catch`**  
- **`storeUserState`** (静态) (异步)
  🔒 安全修复：异步安全存储用户状态
/
- **`if`**  
- **`catch`**  
- **`if`**  
  🔒 降级处理：仅在开发环境下提供明文备用存储
- **`catch`**  
- **`getUserState`** (静态) (异步)
  🔒 安全修复：异步安全读取用户状态
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getUserStateFromLegacy`** (静态) (异步)
- **`if`**  
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`validateUserState`** (静态) 
- **`if`**  
  检查是否过期
- **`if`**  
  检查必要字段
- **`updateUserState`** (静态) (异步)
  更新用户状态
/
- **`if`**  
- **`catch`**  
- **`clearUserState`** (静态) 
  清除用户状态
/
- **`catch`**  
- **`hasUserState`** (静态) 
  检查用户状态是否存在
/
- **`refreshUserState`** (静态) (异步)
  刷新用户状态（重新验证并延长有效期）
/
- **`if`**  
- **`catch`**  
- **`startValidationTimer`** (静态) 
- **`if`**  
  避免频繁验证
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`stopValidationTimer`** (静态) 
- **`if`**  
- **`getStateStats`** (静态) 
  获取状态统计信息
/
- **`if`**  
- **`catch`**  

---

## ServerPermissionService

服务器权限验证服务类
/

**文件:** `services/serverPermissionService.ts`

**类型:** 类

### 方法

- **`verifyPermission`** (静态) (异步)
  验证单个权限
/
- **`verifyPermissions`** (静态) (异步)
  验证多个权限
/
- **`if`**  
  检查缓存（除非强制刷新）
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`verifySecurePermissions`** (静态) (异步)
  验证关键操作权限（必须成功）
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`callPermissionAPI`** (静态) (异步)
- **`if`**  
- **`catch`**  
- **`if`**  
- **`getUserToken`** (静态) (异步)
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getAPIUrl`** (静态) 
- **`generateCacheKey`** (静态) 
- **`getCachedResult`** (静态) 
- **`if`**  
- **`cacheResult`** (静态) 
- **`clearCache`** (静态) 
  清除缓存
/
- **`cleanExpiredCache`** (静态) 
  清除过期缓存
/
- **`forEach`**  
- **`if`**  
- **`getCacheStats`** (静态) 
  获取缓存统计信息
/

---

## StandardBufPayService

暂无描述

**文件:** `services/standardBufpayService.ts`

**类型:** 类

### 方法

- **`createPayment`** (静态) (异步)
  创建支付订单
/
- **`if`**  
- **`if`**  
- **`if`**  
  3. 更新订单的支付平台订单号
- **`catch`**  
- **`catch`**  
- **`queryPayment`** (静态) (异步)
  查询支付状态
/
- **`if`**  
- **`catch`**  
- **`generateSign`** (静态) 
- **`catch`**  
- **`md5`** (静态) 
- **`updateOrderPlatformId`** (静态) (异步)
- **`catch`**  
- **`verifyNotifySign`** (静态) 
  验证回调签名
/
- **`catch`**  
- **`getPayTypeDisplayName`** (静态) 
  获取支付方式显示名称
/
- **`switch`**  
- **`formatAmount`** (静态) 
  格式化金额显示
/
- **`checkPaymentEnvironment`** (静态) 
  检查支付环境
/
- **`if`**  
- **`if`**  

---

## StandardOrderService

暂无描述

**文件:** `services/standardOrderService.ts`

**类型:** 类

### 方法

- **`createOrder`** (静态) (异步)
  创建标准订单
/
- **`if`**  
- **`catch`**  
- **`getOrder`** (静态) (异步)
  查询订单
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getUserOrders`** (静态) (异步)
  查询用户订单列表
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`checkPaymentStatus`** (静态) (异步)
  检查订单支付状态
/
- **`if`**  
- **`catch`**  
- **`pollOrderStatus`** (静态) (异步)
  轮询订单状态（用于支付结果页面）
/
- **`if`**  
- **`if`**  
  如果订单状态已确定，返回结果
- **`if`**  
  如果达到最大尝试次数，返回当前状态
- **`catch`**  
- **`generateOrderId`** (静态) (异步)
- **`if`**  
- **`catch`**  
- **`generateOrderIdFallback`** (静态) 
- **`getOrderStats`** (静态) (异步)
  获取订单统计信息
/
- **`if`**  
- **`forEach`**  
- **`catch`**  
- **`cancelOrder`** (静态) (异步)
  取消订单（用户主动取消）
/
- **`if`**  
- **`catch`**  

---

## SubscriptionCacheStrategy

订阅状态缓存策略服务
/

**文件:** `services/subscriptionCacheStrategy.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`switch`**  
- **`if`**  
  设置内存缓存
- **`catch`**  
- **`if`**  
  设置自动刷新
- **`delete`**  (异步)
  删除缓存项
/
- **`catch`**  
- **`if`**  
- **`clear`**  (异步)
  清空所有缓存
/
- **`for`**  
- **`catch`**  
- **`getStats`**  
  获取缓存统计
/
- **`if`**  
- **`catch`**  
- **`if`**  
- **`if`**  
- **`if`**  
  从网络获取
- **`catch`**  
- **`if`**  
- **`if`**  
- **`if`**  
  从网络获取
- **`catch`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
  后台刷新
- **`if`**  
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`setupAutoRefresh`**  
- **`if`**  
- **`startPeriodicCleanup`**  
- **`cleanupMemory`**  
- **`if`**  
- **`cleanupStorage`**  
- **`for`**  
- **`if`**  
- **`catch`**  
- **`if`**  
  如果超出限制，删除最旧的项目
- **`for`**  
- **`if`**  
- **`catch`**  
- **`evictOldestMemoryItem`**  
- **`if`**  
- **`if`**  
- **`updateStats`**  
- **`if`**  
- **`updateResponseTime`**  
- **`if`**  
- **`updateCacheSize`**  
- **`generateVersion`**  
- **`calculateChecksum`**  
- **`getStorageKey`**  
- **`getStoragePrefix`**  

---

## SubscriptionUpgradeService

暂无描述

**文件:** `services/subscriptionUpgradeService.ts`

**类型:** 类

### 方法

- **`calculateUpgrade`** (静态) (异步)
  计算升级差价
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`executeUpgrade`** (静态) (异步)
  执行升级
/
- **`if`**  
  1. 如果需要支付差价，验证支付
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getCurrentSubscription`** (静态) (异步)
- **`if`**  
- **`isUpgrade`** (静态) 
- **`calculateRemainingDays`** (静态) 
- **`inferSubscriptionPeriod`** (静态) 
- **`calculateNewExpiresAt`** (静态) 
- **`if`**  
- **`generateUpgradeDescription`** (静态) 
- **`if`**  
- **`recordUpgradeHistory`** (静态) (异步)
- **`catch`**  
- **`getUpgradeHistory`** (静态) (异步)
  获取升级历史
/
- **`if`**  
- **`catch`**  

---

## SupabaseDataService

Supabase 数据服务类
/

**文件:** `services/supabaseDataService.ts`

**类型:** 类

### 方法

- **`if`**  
- **`validateUserId`**  
- **`if`**  
- **`addMetadata`**  
- **`if`**  
- **`catch`**  
- **`if`**  
  应用过滤条件
- **`if`**  
  应用排序
- **`if`**  
  应用分页
- **`if`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`delete`**  (异步)
  删除记录
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`deleteMany`**  (异步)
  批量删除记录
/
- **`if`**  
- **`catch`**  
- **`count`**  (异步)
  统计记录数量
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`exists`**  (异步)
  检查记录是否存在
/
- **`catch`**  
- **`clearAllUserData`**  (异步)
  清理用户所有数据（谨慎使用）
/
- **`if`**  
- **`catch`**  

---

## UserProfileService

============================================================================
用户相关服务
============================================================================

**文件:** `services/supabaseService.ts`

**类型:** 类

### 方法

- **`getProfile`** (静态) (异步)
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
  缓存结果
- **`catch`**  
- **`createProfile`** (静态) (异步)
- **`if`**  
- **`updateProfile`** (静态) (异步)
- **`if`**  
- **`if`**  
- **`if`**  
  添加同步任务
- **`catch`**  

---

## UserSubscriptionService

暂无描述

**文件:** `services/supabaseService.ts`

**类型:** 类

### 方法

- **`getSubscription`** (静态) (异步)
- **`if`**  
- **`createSubscription`** (静态) (异步)
- **`if`**  
- **`updateSubscription`** (静态) (异步)
- **`if`**  

---

## TokenUsageService

============================================================================
Token使用量服务
============================================================================

**文件:** `services/supabaseService.ts`

**类型:** 类

### 方法

- **`recordUsage`** (静态) (异步)
- **`if`**  
- **`getUserMonthlyUsage`** (静态) (异步)
- **`if`**  
- **`checkTokenLimit`** (静态) (异步)
- **`if`**  
- **`getUsageHistory`** (静态) (异步)
- **`if`**  

---

## UsageCountService

暂无描述

**文件:** `services/supabaseService.ts`

**类型:** 类

### 方法

- **`recordUsage`** (静态) (异步)
- **`if`**  
- **`getUserUsageCount`** (静态) (异步)
- **`if`**  

---

## InviteService

============================================================================
邀请系统服务
============================================================================

**文件:** `services/supabaseService.ts`

**类型:** 类

### 方法

- **`createInviteRelation`** (静态) (异步)
- **`if`**  
- **`getInviteStats`** (静态) (异步)
- **`if`**  
- **`updateInviteStats`** (静态) (异步)
- **`if`**  
- **`getInviteRelations`** (静态) (异步)
- **`if`**  

---

## UserFileService

============================================================================
文件和内容服务
============================================================================

**文件:** `services/supabaseService.ts`

**类型:** 类

### 方法

- **`uploadFile`** (静态) (异步)
- **`if`**  
- **`getUserFiles`** (静态) (异步)
- **`if`**  
- **`if`**  
- **`deleteFile`** (静态) (异步)
- **`if`**  

---

## UserNoteService

暂无描述

**文件:** `services/supabaseService.ts`

**类型:** 类

### 方法

- **`createNote`** (静态) (异步)
- **`if`**  
- **`getUserNotes`** (静态) (异步)
- **`if`**  
- **`if`**  
- **`updateNote`** (静态) (异步)
- **`if`**  
- **`deleteNote`** (静态) (异步)
- **`if`**  

---

## BrandCorpusService

暂无描述

**文件:** `services/supabaseService.ts`

**类型:** 类

### 方法

- **`createBrandCorpus`** (静态) (异步)
- **`if`**  
- **`getUserBrandCorpus`** (静态) (异步)
- **`if`**  
- **`updateBrandCorpus`** (静态) (异步)
- **`if`**  
- **`deleteBrandCorpus`** (静态) (异步)
- **`if`**  

---

## LibraryService

暂无描述

**文件:** `services/supabaseService.ts`

**类型:** 类

### 方法

- **`createLibraryItem`** (静态) (异步)
- **`if`**  
- **`getUserLibraryItems`** (静态) (异步)
- **`if`**  
- **`updateLibraryItem`** (静态) (异步)
- **`if`**  
- **`deleteLibraryItem`** (静态) (异步)
- **`if`**  

---

## ChatHistoryService

暂无描述

**文件:** `services/supabaseService.ts`

**类型:** 类

### 方法

- **`saveChatMessage`** (静态) (异步)
- **`if`**  
- **`getChatHistory`** (静态) (异步)
- **`if`**  
- **`if`**  
- **`deleteChatSession`** (静态) (异步)
- **`if`**  

---

## UnifiedDataManager

统一数据管理器类
/

**文件:** `services/unifiedDataManager.ts`

**类型:** 类

### 方法

- **`if`**  
- **`setUserId`**  
  设置用户ID并初始化云端服务
/
- **`catch`**  
- **`if`**  
- **`if`**  
  1. 强制刷新时直接从云端获取
- **`if`**  
  异步更新云端数据（如果需要）
- **`switch`**  
  3. 根据数据类型从对应层获取
- **`catch`**  
- **`if`**  
- **`switch`**  
  根据配置保存到对应层
- **`if`**  
  额外的云端同步（如果配置了）
- **`catch`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`parse`**  
- **`catch`**  
- **`switch`**  
- **`isExpired`**  
- **`preloadCriticalData`**  (异步)
  预加载关键数据
/
- **`if`**  
- **`catch`**  
- **`cleanupExpiredCache`**  
  清理过期缓存
/
- **`getDataStats`**  
  获取数据统计信息
/
- **`forEach`**  
- **`getUserTier`**  (异步)
  AI模型相关管理方法
/

获取用户订阅层级
/
- **`if`**  
- **`catch`**  
- **`getUserAvailableModels`**  (异步)
  获取用户可用的AI模型
/
- **`hasModelPermission`**  (异步)
  检查用户是否有权限使用指定模型
/
- **`getPreferredModel`**  (异步)
  获取用户首选AI模型
/
- **`if`**  
- **`if`**  
- **`setPreferredModel`**  (异步)
  设置用户首选AI模型
/
- **`if`**  
- **`recordModelUsage`**  (异步)
  记录AI模型使用情况
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getModelUsageStats`**  (异步)
  获取AI模型使用统计
/
- **`forEach`**  
- **`if`**  
- **`if`**  
  总体统计
- **`catch`**  
- **`getModelRecommendations`**  (异步)
  获取AI模型建议
/
- **`if`**  
  推荐逻辑
- **`catch`**  
- **`cleanupUsageStats`**  (异步)
  清理过期的使用统计数据
/
- **`forEach`**  
- **`if`**  
- **`catch`**  

---

## UnifiedPermissionService

统一权限检查服务类
/

**文件:** `services/unifiedPermissionService.ts`

**类型:** 类

### 方法

- **`checkPermission`** (静态) 
  检查单个权限
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`checkMultiplePermissions`** (静态) 
  检查多个权限
/
- **`checkAllPermissions`** (静态) 
  检查用户是否满足所有权限要求
/
- **`checkAnyPermission`** (静态) 
  检查用户是否满足任意权限要求
/
- **`getMissingPermissions`** (静态) 
  获取用户缺失的权限列表
/
- **`getPermissionConfig`** (静态) 
  获取权限配置
/
- **`if`**  
- **`getAllPermissionConfigs`** (静态) 
  获取所有权限配置
/
- **`getPermissionsByCategory`** (静态) 
  根据分类获取权限配置
/
- **`if`**  
- **`getPermissionsByPriority`** (静态) 
  根据优先级获取权限配置
/
- **`if`**  

---

## EnhancedUnifiedPermissionService

增强的统一权限服务类（集成服务器端验证）
/

**文件:** `services/unifiedPermissionService.ts`

**类型:** 类

### 方法

- **`checkPermissionSecure`** (静态) (异步)
  🔒 安全检查：结合前端和服务器端验证
/
- **`if`**  
  如果前端检查失败，直接返回
- **`if`**  
- **`if`**  
- **`catch`**  
- **`checkSecurePermissions`** (静态) (异步)
  🔒 关键操作权限检查（必须通过服务器验证）
/
- **`if`**  
- **`if`**  
- **`catch`**  

---

## UnifiedStorageStrategy

统一存储策略管理器
/

**文件:** `services/unifiedStorageStrategy.ts`

**类型:** 类

### 方法

- **`setUserId`**  
  设置用户ID
/
- **`if`**  
- **`if`**  
  数据加密
- **`if`**  
  数据压缩
- **`switch`**  
  根据存储层级保存数据
- **`catch`**  
- **`if`**  
- **`switch`**  
  根据存储层级加载数据
- **`if`**  
  数据解密
- **`if`**  
  数据解压
- **`catch`**  
- **`remove`**  (异步)
  删除数据
/
- **`if`**  
- **`switch`**  
- **`catch`**  
- **`sync`**  (异步)
  同步数据
/
- **`if`**  
- **`for`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getStorageStats`**  (异步)
  获取存储统计信息
/
- **`generateEncryptionKey`**  
- **`encrypt`**  
- **`decrypt`**  
- **`compress`**  
- **`decompress`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`if`**  
  后台从数据库同步最新数据
- **`then`**  
- **`if`**  
  本地没有数据，从数据库加载
- **`if`**  
- **`if`**  
- **`if`**  
  检查用户权限
- **`removeFromLocal`**  
- **`catch`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`removeFromDatabase`**  (异步)
- **`if`**  
- **`if`**  
- **`catch`**  
- **`generateStorageKey`**  
- **`getTableName`**  
- **`switch`**  
- **`getDataVersion`**  
- **`getLocalStorageUsage`**  
- **`for`**  
- **`if`**  
- **`getDatabaseStats`**  (异步)
- **`if`**  
- **`catch`**  
- **`removeFromMemory`**  
- **`catch`**  
- **`if`**  
- **`catch`**  
- **`removeFromSession`**  
- **`catch`**  
- **`removeFromHybrid`**  (异步)
- **`syncSingleItem`**  (异步)
- **`compareAndSync`**  
- **`setupDefaultConflictResolvers`**  
- **`setupNetworkListener`**  

---

## UserInfoNormalizer

用户信息标准化服务类
/

**文件:** `services/userInfoNormalizer.ts`

**类型:** 类

### 方法

- **`normalize`**  
  标准化用户信息
@param rawData 原始用户数据
@param loginMethod 登录方式
@param dataSource 数据来源
@returns 标准化的用户信息
/
- **`if`**  
- **`extractId`**  
- **`for`**  
- **`extractField`**  
- **`for`**  
- **`validateAndClean`**  
- **`if`**  
  确保至少有一个显示名称
- **`if`**  
- **`isValidEmail`**  
- **`isValidPhone`**  
- **`isValidUrl`**  
- **`merge`**  
  合并多个用户信息源
@param sources 多个用户信息源
@returns 合并后的用户信息
/
- **`if`**  
- **`if`**  
- **`for`**  
  合并其他源的非空字段
- **`if`**  
  更新时间使用最新的

---

## UserInfoSyncService

用户信息同步服务类
/

**文件:** `services/userInfoSyncService.ts`

**类型:** 类

### 方法

- **`syncUserInfo`**  (异步)
  同步用户信息到所有存储位置
@param userInfo 标准化的用户信息
@returns 同步状态
/
- **`catch`**  
- **`checkConsistency`**  (异步)
  检查数据一致性
@param userId 用户ID
@returns 一致性检查结果
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`autoRepair`**  (异步)
  自动修复数据不一致
@param userId 用户ID
@returns 修复结果
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`syncToLocalStorage`**  (异步)
- **`catch`**  
- **`syncToSessionStorage`**  (异步)
- **`catch`**  
- **`syncToMemoryCache`**  (异步)
- **`catch`**  
- **`syncToGlobalState`**  (异步)
- **`if`**  
- **`catch`**  
- **`getFromLocalStorage`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getFromSessionStorage`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`analyzeConflicts`**  
- **`for`**  
- **`for`**  
- **`if`**  
- **`if`**  
  如果有多个不同的非空值，则存在冲突
- **`resolveFieldConflict`**  
- **`for`**  
- **`if`**  
- **`resolveConflicts`**  
- **`for`**  
- **`generateRecommendations`**  
- **`if`**  
- **`for`**  

---

## UserSettingsService

用户设置管理类
/

**文件:** `services/userSettingsService.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`setUserId`**  
  设置当前用户ID
/
- **`if`**  
- **`validateTable`**  (异步)
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`createUserPreferencesTable`**  (异步)
- **`USING`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`saveSettings`**  (异步)
  批量保存设置
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getSettings`**  (异步)
  批量获取设置
/
- **`if`**  
- **`if`**  
  批量获取未缓存的数据
- **`if`**  
- **`if`**  
  🔧 FIX: 对于 in 操作符，确保数组格式正确
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getAllSettings`**  (异步)
  获取所有设置
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`deleteSetting`**  (异步)
  删除设置
/
- **`if`**  
- **`if`**  
- **`clearAllSettings`**  (异步)
  清除所有设置
/
- **`if`**  
- **`if`**  
- **`preloadSettings`**  (异步)
  预加载常用设置
/
- **`if`**  
- **`clearCache`**  
  清除缓存
/
- **`getThemeSettings`**  (异步)
  ==================== 主题设置专用方法 ====================

获取用户主题设置
/
- **`saveThemeSettings`**  (异步)
  保存用户主题设置
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`getThemeMode`**  (异步)
  获取主题模式
/
- **`saveThemeMode`**  (异步)
  保存主题模式
/

---

## WebContentExtractorService

网页内容提取服务类
/

**文件:** `services/webContentExtractor.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`extractFromUrl`**  (异步)
- **`catch`**  
- **`if`**  
- **`analyzeExtractedContent`**  
- **`if`**  
  第二步：如果需要品牌分析，进行AI品牌分析
- **`catch`**  
- **`catch`**  
- **`convertToBrandAsset`**  
- **`isValidUrl`**  
- **`normalizeUrl`**  
- **`extractDomain`**  
- **`analyzeExtractedContent`**  (异步)
- **`if`**  
- **`catch`**  
- **`buildExtractionPrompt`**  
- **`parseExtractionResponse`**  
- **`if`**  
- **`catch`**  
- **`parseTextResponse`**  
- **`for`**  
  简单的文本解析逻辑
- **`analyzeBrandContent`**  (异步)
- **`if`**  
- **`if`**  
- **`catch`**  
- **`formatExtractedContent`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`extractMultipleUrls`**  (异步)
- **`for`**  
- **`catch`**  
- **`checkUrlAccessibility`**  (异步)
- **`if`**  
- **`if`**  
- **`catch`**  
- **`catch`**  

---


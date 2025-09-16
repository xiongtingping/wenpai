# 🤖 AI服务

## getBrandPromptByTask

根据品牌任务类型选择合适的提示词函数

/

**文件:** `ai/prompts/brand.ts`

**类型:** 同步函数

### 参数

- **`task`** (`string`)

### 返回值

`string): PromptTemplate`

### 使用示例

```typescript
const result = getBrandPromptByTask('example');
```

---

## createDeepSeekProvider

创建DeepSeek提供者实例

/

**文件:** `ai/providers/deepseek.ts`

**类型:** 同步函数

### 返回值

`DeepSeekProvider`

### 使用示例

```typescript
const result = createDeepSeekProvider();
```

---

## createOpenAIProvider

创建OpenAI提供者实例

/

**文件:** `ai/providers/openai.ts`

**类型:** 同步函数

### 返回值

`OpenAIProvider`

### 使用示例

```typescript
const result = createOpenAIProvider();
```

---

## executeBatchForward

执行批量转发自动化（主要入口函数）
增强版本，支持多种自动化方式
/

**文件:** `automation/batchForward.ts`

**类型:** 异步函数

### 参数

- **`options`** (`BatchForwardOptions`)

### 返回值

`BatchForwardOptions): Promise<LegacyForwardResult[]>`

### 使用示例

```typescript
const result = await executeBatchForward(value);
```

---

## useErrorBoundary

函数式错误边界Hook
/

**文件:** `components/ErrorBoundary.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = useErrorBoundary();
```

---

## getPlatformName

Helper function to get platform name consistently - 从原文件完全复制

**文件:** `components/adapt/AdaptPageHelpers.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)
- **`platforms`** (`any[]`)

### 返回值

`string, platforms: any[]): string`

### 使用示例

```typescript
const result = getPlatformName('example', value);
```

---

## getPlatformRecommendedCharCount

Helper function to get platform recommended character count - 从原文件完全复制

**文件:** `components/adapt/AdaptPageHelpers.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string): number`

### 使用示例

```typescript
const result = getPlatformRecommendedCharCount('example');
```

---

## getPlatformMaxCharCount

Helper function to get platform max character count - 从原文件完全复制

**文件:** `components/adapt/AdaptPageHelpers.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string): number`

### 使用示例

```typescript
const result = getPlatformMaxCharCount('example');
```

---

## getPlatformDescription

Helper function to get platform description - 从原文件完全复制

**文件:** `components/adapt/AdaptPageHelpers.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = getPlatformDescription('example');
```

---

## calculateSafetyRange

Helper function to calculate safety range for content generation - 从原文件完全复制

**文件:** `components/adapt/AdaptPageHelpers.ts`

**类型:** 同步函数

### 参数

- **`userSetLimit`** (`number`)
- **`platformId`** (`string`)

### 返回值

`number, platformId: string):`

### 使用示例

```typescript
const result = calculateSafetyRange(123, 'example');
```

---

## calculateOptimalCharCount

新的字符数控制逻辑：生成目标范围内的内容，禁止截断 - 从原文件完全复制

**文件:** `components/adapt/AdaptPageHelpers.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)
- **`userSetLimit`** (`number`)

### 返回值

`string, userSetLimit: number):`

### 使用示例

```typescript
const result = calculateOptimalCharCount('example', 123);
```

---

## cleanGeneratedContent

清理AI生成内容中的多余文案 - 从原文件完全复制

**文件:** `components/adapt/AdaptPageHelpers.ts`

**类型:** 同步函数

### 参数

- **`content`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = cleanGeneratedContent('example');
```

---

## AISetupWizard

AI API 设置向导组件
/

**文件:** `components/ai/AISetupWizard.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = AISetupWizard();
```

---

## AnalysisResultDialog

分析结果查看对话框组件
/

**文件:** `components/creative/AnalysisResultDialog.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = AnalysisResultDialog();
```

---

## buildPrompts

构建提示词
/

**文件:** `components/creative/BrandEmojiPromptBuilder.tsx`

**类型:** 同步函数

### 参数

- **`characterDesc`** (`string`)
- **`brand`** (`string`)
- **`uploadedImage`** (`File | null`) - 可选

### 返回值

`string, brand: string, uploadedImage?: File | null): PromptData[]`

### 使用示例

```typescript
const result = buildPrompts('example', 'example', value);
```

---

## ContentFormSelector

暂无描述

**文件:** `components/creative/ContentFormSelector.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = ContentFormSelector();
```

---

## CreativeCube

九宫格创意魔方组件
@returns React 组件
/

**文件:** `components/creative/CreativeCube.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = CreativeCube();
```

---

## MomentsTextGenerator

朋友圈文案生成器组件
/

**文件:** `components/creative/MomentsTextGenerator.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = MomentsTextGenerator();
```

---

## PDFChatDialog

PDF对话问答组件
/

**文件:** `components/creative/PDFChatDialog.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = PDFChatDialog();
```

---

## QuickReferenceDialog

暂无描述

**文件:** `components/creative/QuickReference/QuickReferenceDialog.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = QuickReferenceDialog();
```

---

## QuickReferenceFooter

暂无描述

**文件:** `components/creative/QuickReference/QuickReferenceFooter.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = QuickReferenceFooter();
```

---

## QuickReferenceItemCard

快速引用项目卡片组件
/

**文件:** `components/creative/QuickReference/QuickReferenceItemCard.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = QuickReferenceItemCard();
```

---

## QuickReferenceSearch

暂无描述

**文件:** `components/creative/QuickReference/QuickReferenceSearch.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = QuickReferenceSearch();
```

---

## QuickReferenceTabList

暂无描述

**文件:** `components/creative/QuickReference/QuickReferenceTabList.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = QuickReferenceTabList();
```

---

## QuickReferenceTest

暂无描述

**文件:** `components/creative/QuickReference/QuickReferenceTest.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = QuickReferenceTest();
```

---

## QuickReferenceTrigger

暂无描述

**文件:** `components/creative/QuickReference/QuickReferenceTrigger.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = QuickReferenceTrigger();
```

---

## QuickReferenceSelector

快速引用选择器组件
/

**文件:** `components/creative/QuickReferenceSelector.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = QuickReferenceSelector();
```

---

## QuickReferenceSelectorSimple

暂无描述

**文件:** `components/creative/QuickReferenceSelectorSimple.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = QuickReferenceSelectorSimple();
```

---

## SchemeSelector

方案选择器组件
/

**文件:** `components/creative/SchemeSelector.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = SchemeSelector();
```

---

## StyleSelector

风格选择器组件
/

**文件:** `components/creative/StyleSelector.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = StyleSelector();
```

---

## useMD2CardCache

React Hook：使用MD2Card缓存
/

**文件:** `components/creative/md2card/CacheManager.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useMD2CardCache();
```

---

## usePerformanceMonitor

React Hook：性能监控
/

**文件:** `components/creative/md2card/PerformanceMonitor.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = usePerformanceMonitor();
```

---

## ExportControls

导出控制组件
/

**文件:** `components/creative/md2wechat/ExportControls.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = ExportControls();
```

---

## MarkdownEditor

Markdown编辑器组件
/

**文件:** `components/creative/md2wechat/MarkdownEditor.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = MarkdownEditor();
```

---

## PreviewPanel

预览面板组件
/

**文件:** `components/creative/md2wechat/PreviewPanel.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = PreviewPanel();
```

---

## ThemeSelector

主题选择器组件
/

**文件:** `components/creative/md2wechat/ThemeSelector.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = ThemeSelector();
```

---

## useDataPreloader

数据预加载Hook
/

**文件:** `components/data/DataAwareComponents.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = useDataPreloader();
```

---

## TokenStatsDebugPanel

Token统计调试面板组件
/

**文件:** `components/debug/TokenStatsDebugPanel.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = TokenStatsDebugPanel();
```

---

## TokenLimitDialog

Token限额提醒对话框组件
/

**文件:** `components/dialogs/TokenLimitDialog.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = TokenLimitDialog();
```

---

## addGlobalError

添加全局错误
/

**文件:** `components/error/GlobalErrorHandler.tsx`

**类型:** 同步函数

### 参数

- **`error`** (`Omit<ErrorInfo`)
- **`'id' | 'timestamp'>`** (`any`)

### 返回值

`Omit<ErrorInfo, 'id' | 'timestamp'>)`

### 使用示例

```typescript
const result = addGlobalError(value, value);
```

---

## removeGlobalError

移除全局错误
/

**文件:** `components/error/GlobalErrorHandler.tsx`

**类型:** 同步函数

### 参数

- **`errorId`** (`string`)

### 返回值

`string)`

### 使用示例

```typescript
const result = removeGlobalError('example');
```

---

## clearAllErrors

清除所有错误
/

**文件:** `components/error/GlobalErrorHandler.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = clearAllErrors();
```

---

## setupGlobalErrorHandler

设置全局错误处理
/

**文件:** `components/error/GlobalErrorHandler.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = setupGlobalErrorHandler();
```

---

## ContentExtractor

内容提取组件
@returns React 组件
/

**文件:** `components/extractor/ContentExtractor.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = ContentExtractor();
```

---

## CTASection

暂无描述

**文件:** `components/landing/CTASection.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = CTASection();
```

---

## Footer

网站底部 Footer 组件
- 美观设计，品牌感与专业感提升
- 响应式布局，移动端和桌面端优化
- 重新设计的联系方式布局
/

**文件:** `components/landing/Footer.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = Footer();
```

---

## Header

暂无描述

**文件:** `components/landing/Header.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = Header();
```

---

## HowItWorks

暂无描述

**文件:** `components/landing/HowItWorks.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = HowItWorks();
```

---

## PricingSection

暂无描述

**文件:** `components/landing/PricingSection.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = PricingSection();
```

---

## useScrollAnimation

暂无描述

**文件:** `components/landing/ScrollAnimation.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = useScrollAnimation();
```

---

## TrustSection

暂无描述

**文件:** `components/landing/TrustSection.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = TrustSection();
```

---

## CTASection

暂无描述

**文件:** `components/landing.backup/CTASection.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = CTASection();
```

---

## Footer

网站底部 Footer 组件
- 简洁设计，品牌感与专业感提升
- 响应式布局，移动端和桌面端优化
/

**文件:** `components/landing.backup/Footer.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = Footer();
```

---

## Header

暂无描述

**文件:** `components/landing.backup/Header.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = Header();
```

---

## HowItWorks

暂无描述

**文件:** `components/landing.backup/HowItWorks.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = HowItWorks();
```

---

## PricingSection

暂无描述

**文件:** `components/landing.backup/PricingSection.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = PricingSection();
```

---

## useScrollAnimation

暂无描述

**文件:** `components/landing.backup/ScrollAnimation.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = useScrollAnimation();
```

---

## TrustSection

暂无描述

**文件:** `components/landing.backup/TrustSection.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = TrustSection();
```

---

## TokenUsageSection

Token使用量统计组件
/

**文件:** `components/profile/TokenUsageSection.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = TokenUsageSection();
```

---

## useUnifiedEmoji

使用统一emoji系统的Hook
/

**文件:** `components/shared/AdaptiveEmoji.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = useUnifiedEmoji();
```

---

## ProratedUpgradeCard

暂无描述

**文件:** `components/subscription/ProratedUpgradeCard.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = ProratedUpgradeCard();
```

---

## SubscriptionExpiryAlert

暂无描述

**文件:** `components/subscription/SubscriptionExpiryAlert.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = SubscriptionExpiryAlert();
```

---

## SubscriptionExpiryBanner

简化版提醒组件（用于小空间显示）
/

**文件:** `components/subscription/SubscriptionExpiryAlert.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = SubscriptionExpiryBanner();
```

---

## SubscriptionStatusBadge

暂无描述

**文件:** `components/subscription/SubscriptionStatusBadge.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = SubscriptionStatusBadge();
```

---

## SubscriptionUpgradeDialog

暂无描述

**文件:** `components/subscription/SubscriptionUpgradeDialog.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = SubscriptionUpgradeDialog();
```

---

## SmartSkeleton

暂无描述

**文件:** `components/ui/DataAwareComponents.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = SmartSkeleton();
```

---

## SkeletonProvider

暂无描述

**文件:** `components/ui/DataAwareComponents.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = SkeletonProvider();
```

---

## DataLoadingBoundary

暂无描述

**文件:** `components/ui/DataAwareComponents.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = DataLoadingBoundary();
```

---

## PreloadIndicator

暂无描述

**文件:** `components/ui/DataAwareComponents.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = PreloadIndicator();
```

---

## useSkeletonContext

=== Hooks ===

**文件:** `components/ui/DataAwareComponents.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = useSkeletonContext();
```

---

## useDataLoadingState

暂无描述

**文件:** `components/ui/DataAwareComponents.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = useDataLoadingState();
```

---

## LanguageSwitcher

暂无描述

**文件:** `components/ui/LanguageSwitcher.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = LanguageSwitcher();
```

---

## usePageLoading

使用页面加载上下文
/

**文件:** `components/ui/PageLoadingManager.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = usePageLoading();
```

---

## UnifiedDialog

暂无描述

**文件:** `components/ui/UnifiedDialog/UnifiedDialog.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = UnifiedDialog();
```

---

## AvatarUpload

头像上传组件
/

**文件:** `components/ui/avatar-upload.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = AvatarUpload();
```

---

## ContactVerification

联系方式验证组件
/

**文件:** `components/ui/contact-verification.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = ContactVerification();
```

---

## NicknameSelector

昵称选择器组件
/

**文件:** `components/ui/nickname-selector.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = NicknameSelector();
```

---

## Slot

安全的 Slot 组件实现 - 完全避免 forwardRef
兼容 Radix UI 的 Slot API，但避免了所有 forwardRef 相关错误
/

**文件:** `components/ui/safe-slot.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = Slot();
```

---

## Slottable

Slottable 组件 - 兼容 @radix-ui/react-slot API
/

**文件:** `components/ui/safe-slot.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = Slottable();
```

---

## createSlot

createSlot 函数 - 兼容 @radix-ui/react-slot API
其他 Radix UI 组件内部使用此函数
🔧 FIXED: 直接返回函数组件，避免所有 forwardRef 问题
/

**文件:** `components/ui/safe-slot.tsx`

**类型:** 同步函数

### 参数

- **`name`** (`string`) - 可选

### 返回值

`string)`

### 使用示例

```typescript
const result = createSlot('example');
```

---

## createSlottable

createSlottable 函数 - 兼容 @radix-ui/react-slot API
其他 Radix UI 组件内部使用此函数
🔧 FIXED: 直接返回函数组件
/

**文件:** `components/ui/safe-slot.tsx`

**类型:** 同步函数

### 参数

- **`name`** (`string`) - 可选

### 返回值

`string)`

### 使用示例

```typescript
const result = createSlottable('example');
```

---

## SecurityConfig

安全配置组件
@param props 组件属性
@returns React 组件
/

**文件:** `components/ui/security-config.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = SecurityConfig();
```

---

## Toaster

暂无描述

**文件:** `components/ui/toaster.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = Toaster();
```

---

## NavBar

暂无描述

**文件:** `components/ui/tubelight-navbar.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = NavBar();
```

---

## UsageReminderDialog

使用次数提醒弹窗组件
@description 当用户使用次数不足时显示提醒弹窗
/

**文件:** `components/ui/usage-reminder-dialog.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = UsageReminderDialog();
```

---

## UsageStatsCard

使用情况统计组件
@description 显示用户的使用情况和剩余配额
/

**文件:** `components/ui/usage-stats.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = UsageStatsCard();
```

---

## getAIEndpoint

获取AI服务端点配置
@param provider AI服务提供商名称
@returns 端点配置对象
/

**文件:** `config/aiEndpoints.ts`

**类型:** 同步函数

### 参数

- **`provider`** (`string`)

### 返回值

`string): AIEndpointConfig | null`

### 使用示例

```typescript
const result = getAIEndpoint('example');
```

---

## supportsFeature

检查AI服务是否支持特定功能
@param provider AI服务提供商名称
@param feature 功能类型
@returns 是否支持该功能
/

**文件:** `config/aiEndpoints.ts`

**类型:** 同步函数

### 参数

- **`provider`** (`string`)
- **`feature`** (`'chat' | 'image' | 'streaming'`)

### 返回值

`string, 
  feature: 'chat' | 'image' | 'streaming'
): boolean`

### 使用示例

```typescript
const result = supportsFeature('example', value);
```

---

## getAvailableProviders

获取所有已配置的AI服务提供商列表
@returns 提供商名称数组
/

**文件:** `config/aiEndpoints.ts`

**类型:** 同步函数

### 返回值

`string[]`

### 使用示例

```typescript
const result = getAvailableProviders();
```

---

## validateEndpointConfig

验证AI服务配置完整性
@param provider AI服务提供商名称
@returns 配置验证结果
/

**文件:** `config/aiEndpoints.ts`

**类型:** 同步函数

### 参数

- **`provider`** (`string`)

### 返回值

`string):`

### 使用示例

```typescript
const result = validateEndpointConfig('example');
```

---

## getAvailableModelsForTier

获取订阅计划可用的模型
@param tier 订阅计划类型
@returns 可用模型列表
/

**文件:** `config/aiModels.ts`

**类型:** 同步函数

### 参数

- **`tier`** (`string`)

### 返回值

`string): AIModel[]`

### 使用示例

```typescript
const result = getAvailableModelsForTier('example');
```

---

## getModelInfo

获取模型信息
@param modelId 模型ID
@returns 模型信息
/

**文件:** `config/aiModels.ts`

**类型:** 同步函数

### 参数

- **`modelId`** (`string`)

### 返回值

`string): AIModel | undefined`

### 使用示例

```typescript
const result = getModelInfo('example');
```

---

## isModelAvailableForTier

检查模型是否对订阅计划可用
@param modelId 模型ID
@param tier 订阅计划类型
@returns 是否可用
/

**文件:** `config/aiModels.ts`

**类型:** 同步函数

### 参数

- **`modelId`** (`string`)
- **`tier`** (`string`)

### 返回值

`string, tier: string): boolean`

### 使用示例

```typescript
const result = isModelAvailableForTier('example', 'example');
```

---

## getModelProvider

获取模型提供商
@param modelId 模型ID
@returns 提供商名称
/

**文件:** `config/aiModels.ts`

**类型:** 同步函数

### 参数

- **`modelId`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = getModelProvider('example');
```

---

## getAllModels

获取所有模型列表
@returns 所有模型列表
/

**文件:** `config/aiModels.ts`

**类型:** 同步函数

### 返回值

`AIModel[]`

### 使用示例

```typescript
const result = getAllModels();
```

---

## getModelsByCompany

按公司分组获取模型
@param tier 可选的订阅计划过滤
@returns 按公司分组的模型
/

**文件:** `config/aiModels.ts`

**类型:** 同步函数

### 参数

- **`tier`** (`string`) - 可选

### 返回值

`string): Record<string, AIModel[]>`

### 使用示例

```typescript
const result = getModelsByCompany('example');
```

---

## getModelsByTier

按等级分组获取模型
@param tier 可选的订阅计划过滤
@returns 按等级分组的模型
/

**文件:** `config/aiModels.ts`

**类型:** 同步函数

### 参数

- **`subscriptionTier`** (`string`) - 可选

### 返回值

`string): Record<'low' | 'mid' | 'high', AIModel[]>`

### 使用示例

```typescript
const result = getModelsByTier('example');
```

---

## getTierColors

获取等级颜色配置
@param tier 模型等级
@returns 颜色配置对象
/

**文件:** `config/aiModels.ts`

**类型:** 同步函数

### 参数

- **`tier`** (`'low' | 'mid' | 'high'`)

### 返回值

`'low' | 'mid' | 'high')`

### 使用示例

```typescript
const result = getTierColors(value);
```

---

## getModelsByType

按模型类型分组获取模型
@param tier 可选的订阅计划过滤
@returns 按模型类型分组的模型
/

**文件:** `config/aiModels.ts`

**类型:** 同步函数

### 参数

- **`tier`** (`string`) - 可选

### 返回值

`string): Record<'text' | 'image', AIModel[]>`

### 使用示例

```typescript
const result = getModelsByType('example');
```

---

## getTextModels

获取文本模型列表
@param tier 可选的订阅计划过滤
@returns 文本模型列表
/

**文件:** `config/aiModels.ts`

**类型:** 同步函数

### 参数

- **`tier`** (`string`) - 可选

### 返回值

`string): AIModel[]`

### 使用示例

```typescript
const result = getTextModels('example');
```

---

## getImageModels

获取图片模型列表
@param tier 可选的订阅计划过滤
@returns 图片模型列表
/

**文件:** `config/aiModels.ts`

**类型:** 同步函数

### 参数

- **`tier`** (`string`) - 可选

### 返回值

`string): AIModel[]`

### 使用示例

```typescript
const result = getImageModels('example');
```

---

## isImageModel

检查模型是否为图片生成模型
@param modelId 模型ID
@returns 是否为图片模型
/

**文件:** `config/aiModels.ts`

**类型:** 同步函数

### 参数

- **`modelId`** (`string`)

### 返回值

`string): boolean`

### 使用示例

```typescript
const result = isImageModel('example');
```

---

## isTextModel

检查模型是否为文本生成模型
@param modelId 模型ID
@returns 是否为文本模型
/

**文件:** `config/aiModels.ts`

**类型:** 同步函数

### 参数

- **`modelId`** (`string`)

### 返回值

`string): boolean`

### 使用示例

```typescript
const result = isTextModel('example');
```

---

## getAllContentForms

获取所有内容形式
/

**文件:** `config/contentForms.ts`

**类型:** 同步函数

### 返回值

`ContentForm[]`

### 使用示例

```typescript
const result = getAllContentForms();
```

---

## getContentFormById

根据ID获取内容形式
/

**文件:** `config/contentForms.ts`

**类型:** 同步函数

### 参数

- **`id`** (`string`)

### 返回值

`string): ContentForm | undefined`

### 使用示例

```typescript
const result = getContentFormById('example');
```

---

## getContentFormsByCategory

根据分类获取内容形式
/

**文件:** `config/contentForms.ts`

**类型:** 同步函数

### 参数

- **`categoryId`** (`string`)

### 返回值

`string): ContentForm[]`

### 使用示例

```typescript
const result = getContentFormsByCategory('example');
```

---

## getContentCategoryById

获取内容分类
/

**文件:** `config/contentForms.ts`

**类型:** 同步函数

### 参数

- **`id`** (`string`)

### 返回值

`string): ContentCategory | undefined`

### 使用示例

```typescript
const result = getContentCategoryById('example');
```

---

## getContentAdaptationPrompt

获取内容适配提示词
/

**文件:** `config/contentSchemes.ts`

**类型:** 同步函数

### 参数

- **`originalContent`** (`string`)
- **`platform`** (`string`)
- **`schemeId`** (`string = 'global-adaptation'`)
- **`style`** (`StyleType = 'professional'`)

### 返回值

`string,
  platform: string,
  schemeId: string = 'global-adaptation',
  style: StyleType = 'professional'
): string`

### 使用示例

```typescript
const result = getContentAdaptationPrompt('example', 'example', 'example', value);
```

---

## getPlatformPromptTemplate

获取平台提示词模板
/

**文件:** `config/contentSchemes.ts`

**类型:** 同步函数

### 参数

- **`platform`** (`string`)

### 返回值

`string): PlatformPromptTemplate | undefined`

### 使用示例

```typescript
const result = getPlatformPromptTemplate('example');
```

---

## getStylePromptTemplate

获取风格提示词模板
/

**文件:** `config/contentSchemes.ts`

**类型:** 同步函数

### 参数

- **`style`** (`StyleType`)

### 返回值

`StyleType): StylePromptTemplate | undefined`

### 使用示例

```typescript
const result = getStylePromptTemplate(value);
```

---

## getAvailableStyles

获取所有可用风格
/

**文件:** `config/contentSchemes.ts`

**类型:** 同步函数

### 返回值

`Array<`

### 使用示例

```typescript
const result = getAvailableStyles();
```

---

## getFormatsByCategory

根据类别获取文件格式
/

**文件:** `config/fileFormatConfig.ts`

**类型:** 同步函数

### 参数

- **`category`** (`string`)

### 返回值

`string): FileFormatInfo[]`

### 使用示例

```typescript
const result = getFormatsByCategory('example');
```

---

## getFormatByExtension

根据扩展名获取文件格式信息
/

**文件:** `config/fileFormatConfig.ts`

**类型:** 同步函数

### 参数

- **`extension`** (`string`)

### 返回值

`string): FileFormatInfo | undefined`

### 使用示例

```typescript
const result = getFormatByExtension('example');
```

---

## getAllSupportedExtensions

获取所有支持的扩展名
/

**文件:** `config/fileFormatConfig.ts`

**类型:** 同步函数

### 返回值

`string[]`

### 使用示例

```typescript
const result = getAllSupportedExtensions();
```

---

## getAllSupportedMimeTypes

获取所有支持的MIME类型
/

**文件:** `config/fileFormatConfig.ts`

**类型:** 同步函数

### 返回值

`string[]`

### 使用示例

```typescript
const result = getAllSupportedMimeTypes();
```

---

## getFormatsGroupedByCategory

按类别分组的格式信息
/

**文件:** `config/fileFormatConfig.ts`

**类型:** 同步函数

### 返回值

`Record<string, FileFormatInfo[]>`

### 使用示例

```typescript
const result = getFormatsGroupedByCategory();
```

---

## generateFormatSupportDescription

生成格式支持说明文案
/

**文件:** `config/fileFormatConfig.ts`

**类型:** 同步函数

### 返回值

`string`

### 使用示例

```typescript
const result = generateFormatSupportDescription();
```

---

## getPlatformLimit

获取平台字符数限制
/

**文件:** `config/platformLimits.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string): PlatformLimit | null`

### 使用示例

```typescript
const result = getPlatformLimit('example');
```

---

## getCharCountMax

获取平台最大字符数
/

**文件:** `config/platformLimits.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string): number`

### 使用示例

```typescript
const result = getCharCountMax('example');
```

---

## getCharCountMin

获取平台最小字符数
/

**文件:** `config/platformLimits.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string): number`

### 使用示例

```typescript
const result = getCharCountMin('example');
```

---

## getRecommendedRange

获取平台推荐字符数范围
/

**文件:** `config/platformLimits.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string):`

### 使用示例

```typescript
const result = getRecommendedRange('example');
```

---

## validateCharCount

验证字符数是否在平台限制内
/

**文件:** `config/platformLimits.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)
- **`charCount`** (`number`)

### 返回值

`string, charCount: number):`

### 使用示例

```typescript
const result = validateCharCount('example', 123);
```

---

## getAllPlatforms

获取所有支持的平台列表
/

**文件:** `config/platformLimits.ts`

**类型:** 同步函数

### 返回值

`PlatformLimit[]`

### 使用示例

```typescript
const result = getAllPlatforms();
```

---

## getUnifiedCharCountLimit

🎯 统一字符数控制系统 - 严格按照优先级规范执行

优先级顺序：
1. 平台特定设置（用户自定义，但不超过平台限制）
2. 预设版本设置（精简/标准/详细）
3. 全局自动适配设置（平台限制的90%-95%）
/

**文件:** `config/platformLimits.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)
- **`globalPreset`** (`'auto' | 'mini' | 'standard' | 'detailed'`)
- **`platformSpecificSetting`** (`number`) - 可选

### 返回值

`string,
  globalPreset: 'auto' | 'mini' | 'standard' | 'detailed',
  platformSpecificSetting?: number
):`

### 使用示例

```typescript
const result = getUnifiedCharCountLimit('example', value, 123);
```

---

## calculateTargetCharCount

计算目标字符数（基于平台限制的百分比）
/

**文件:** `config/platformLimits.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)
- **`percentage`** (`number = 0.9`)

### 返回值

`string, 
  percentage: number = 0.9
): number`

### 使用示例

```typescript
const result = calculateTargetCharCount('example', 123);
```

---

## getCharCountByPreset

根据预设模式计算字符数目标
/

**文件:** `config/platformLimits.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)
- **`preset`** (`'mini' | 'standard' | 'detailed' | 'auto'`)

### 返回值

`string,
  preset: 'mini' | 'standard' | 'detailed' | 'auto'
):`

### 使用示例

```typescript
const result = getCharCountByPreset('example', value);
```

---

## getPlatformCharCountAdvice

获取平台特定的字符数控制建议
/

**文件:** `config/platformLimits.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = getPlatformCharCountAdvice('example');
```

---

## getSubscriptionPlan

获取订阅计划
@param tier 计划类型
@returns 订阅计划
/

**文件:** `config/subscriptionPlans.ts`

**类型:** 同步函数

### 参数

- **`tier`** (`string`)

### 返回值

`string): SubscriptionPlan`

### 使用示例

```typescript
const result = getSubscriptionPlan('example');
```

---

## getAllSubscriptionPlans

获取所有订阅计划
@returns 所有订阅计划
/

**文件:** `config/subscriptionPlans.ts`

**类型:** 同步函数

### 返回值

`SubscriptionPlan[]`

### 使用示例

```typescript
const result = getAllSubscriptionPlans();
```

---

## calculateDiscountCountdown

计算限时优惠倒计时
@param registrationDate 注册时间
@returns 剩余秒数
/

**文件:** `config/subscriptionPlans.ts`

**类型:** 同步函数

### 参数

- **`registrationDate`** (`Date`)

### 返回值

`Date): number`

### 使用示例

```typescript
const result = calculateDiscountCountdown(value);
```

---

## isInDiscountPeriod

检查是否在限时优惠期内
@param registrationDate 注册时间
@returns 是否在优惠期内
/

**文件:** `config/subscriptionPlans.ts`

**类型:** 同步函数

### 参数

- **`registrationDate`** (`Date`)

### 返回值

`Date): boolean`

### 使用示例

```typescript
const result = isInDiscountPeriod(value);
```

---

## getPlatformContent

暂无描述

**文件:** `constants/platforms.tsx`

**类型:** 同步函数

### 返回值

`string,`

### 使用示例

```typescript
const result = getPlatformContent();
```

---

## getPlatformOptimalLength

暂无描述

**文件:** `constants/platforms.tsx`

**类型:** 同步函数

### 参数

- **`platform`** (`string`)

### 返回值

`string): [number, number]`

### 使用示例

```typescript
const result = getPlatformOptimalLength('example');
```

---

## getPlatformMaxLength

暂无描述

**文件:** `constants/platforms.tsx`

**类型:** 同步函数

### 参数

- **`platform`** (`string`)

### 返回值

`string): number`

### 使用示例

```typescript
const result = getPlatformMaxLength('example');
```

---

## getPlatformFeatures

暂无描述

**文件:** `constants/platforms.tsx`

**类型:** 同步函数

### 参数

- **`platform`** (`string`)

### 返回值

`string): string[]`

### 使用示例

```typescript
const result = getPlatformFeatures('example');
```

---

## validatePlatformContent

暂无描述

**文件:** `constants/platforms.tsx`

**类型:** 同步函数

### 参数

- **`platform`** (`string`)
- **`content`** (`string`)

### 返回值

`string, content: string):`

### 使用示例

```typescript
const result = validatePlatformContent('example', 'example');
```

---

## ThemeProvider

主题提供者组件
/

**文件:** `contexts/ThemeContext.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = ThemeProvider();
```

---

## useTheme

使用主题Hook
/

**文件:** `contexts/ThemeContext.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = useTheme();
```

---

## ContentAdapterPage

内容适配器主页面组件
/

**文件:** `features/content-adapter/components/ContentAdapterPage.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = ContentAdapterPage();
```

---

## ContentInputSection

内容输入区域组件
/

**文件:** `features/content-adapter/components/ContentInputSection.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = ContentInputSection();
```

---

## EnhancedHistoryDialog

暂无描述

**文件:** `features/content-adapter/components/EnhancedHistoryDialog.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = EnhancedHistoryDialog();
```

---

## GenerationControls

生成控制组件
/

**文件:** `features/content-adapter/components/GenerationControls.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = GenerationControls();
```

---

## PlatformSelector

平台选择组件
/

**文件:** `features/content-adapter/components/PlatformSelector.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = PlatformSelector();
```

---

## ResultsDisplay

结果展示组件
/

**文件:** `features/content-adapter/components/ResultsDisplay.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = ResultsDisplay();
```

---

## ContentAdapterExample

简化的内容适配器组件示例
展示Hook的使用方式
/

**文件:** `features/content-adapter/examples/hookUsage.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = ContentAdapterExample();
```

---

## useAdapterSettings

内容适配器设置管理Hook
/

**文件:** `features/content-adapter/hooks/useAdapterSettings.ts`

**类型:** 同步函数

### 返回值

`UseAdapterSettingsParams =`

### 使用示例

```typescript
const result = useAdapterSettings();
```

---

## useContentAdapterEngine

内容适配器引擎Hook
/

**文件:** `features/content-adapter/hooks/useContentAdapterEngine.ts`

**类型:** 同步函数

### 参数

- **`params`** (`UseContentAdapterEngineParams`)

### 返回值

`UseContentAdapterEngineParams): UseContentAdapterEngineReturn`

### 使用示例

```typescript
const result = useContentAdapterEngine(value);
```

---

## useGenerationQueue

生成队列管理Hook
/

**文件:** `features/content-adapter/hooks/useGenerationQueue.ts`

**类型:** 同步函数

### 返回值

`UseGenerationQueueParams =`

### 使用示例

```typescript
const result = useGenerationQueue();
```

---

## useIsMobile

暂无描述

**文件:** `hooks/use-mobile.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = useIsMobile();
```

---

## useAdvancedPermissionGuard

============================================================================
高级权限守卫Hook
============================================================================

高级权限守卫Hook
提供缓存、批量检查、性能监控等高级功能
/

**文件:** `hooks/useAdvancedPermissionGuard.ts`

**类型:** 同步函数

### 返回值

`ExtendedPermissionType | ExtendedPermissionType[],
  options: UseAdvancedPermissionGuardOptions =`

### 使用示例

```typescript
const result = useAdvancedPermissionGuard();
```

---

## usePermissionPreloader

============================================================================
专用Hook
============================================================================

权限预加载Hook
/

**文件:** `hooks/useAdvancedPermissionGuard.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = usePermissionPreloader();
```

---

## usePermissionMonitor

权限监控Hook
/

**文件:** `hooks/useAdvancedPermissionGuard.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = usePermissionMonitor();
```

---

## useDataPersistenceSync

数据持久化同步Hook
/

**文件:** `hooks/useDataPersistenceSync.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useDataPersistenceSync();
```

---

## useDataPersistenceStatus

简化的数据持久化状态Hook
/

**文件:** `hooks/useDataPersistenceSync.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useDataPersistenceStatus();
```

---

## useDataMigrationStatus

数据迁移状态Hook
/

**文件:** `hooks/useDataPersistenceSync.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useDataMigrationStatus();
```

---

## useDataSyncConflictResolver

数据同步冲突处理 Hook
/

**文件:** `hooks/useDataSyncConflictResolver.ts`

**类型:** 同步函数

### 返回值

`UseDataSyncConflictResolverOptions =`

### 使用示例

```typescript
const result = useDataSyncConflictResolver();
```

---

## useEnhancedHotTopics

暂无描述

**文件:** `hooks/useEnhancedHotTopics.ts`

**类型:** 同步函数

### 返回值

`DailyHotItem[],
  options: UseEnhancedHotTopicsOptions =`

### 使用示例

```typescript
const result = useEnhancedHotTopics();
```

---

## useEnhancedSubscriptionCache

增强订阅缓存Hook
/

**文件:** `hooks/useEnhancedSubscriptionCache.ts`

**类型:** 同步函数

### 返回值

`SubscriptionCacheOptions =`

### 使用示例

```typescript
const result = useEnhancedSubscriptionCache();
```

---

## useInputValidation

暂无描述

**文件:** `hooks/useInputValidation.ts`

**类型:** 同步函数

### 返回值

`string = '',
  options: UseInputValidationOptions =`

### 使用示例

```typescript
const result = useInputValidation();
```

---

## useNetworkFallback

网络异常处理Hook
/

**文件:** `hooks/useNetworkFallback.ts`

**类型:** 同步函数

### 返回值

`NetworkFallbackOptions =`

### 使用示例

```typescript
const result = useNetworkFallback();
```

---

## usePaymentStatus

暂无描述

**文件:** `hooks/usePaymentStatus.ts`

**类型:** 同步函数

### 返回值

`UsePaymentStatusOptions =`

### 使用示例

```typescript
const result = usePaymentStatus();
```

---

## useUIPreferences

UI 偏好设置 Hook
/

**文件:** `hooks/useSecureStorage.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useUIPreferences();
```

---

## useBatchStorage

批量存储操作 Hook
/

**文件:** `hooks/useSecureStorage.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useBatchStorage();
```

---

## useSubscriptionStatus

订阅状态管理Hook
@param userId 可选的用户ID，如果不提供则使用当前登录用户
/

**文件:** `hooks/useSubscriptionStatus.ts`

**类型:** 同步函数

### 参数

- **`userId`** (`string`) - 可选

### 返回值

`string): UseSubscriptionStatusReturn`

### 使用示例

```typescript
const result = useSubscriptionStatus('example');
```

---

## useSubscriptionAlert

简化版订阅状态Hook（仅返回基本状态）
/

**文件:** `hooks/useSubscriptionStatus.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useSubscriptionAlert();
```

---

## useSupabase

Supabase 认证和数据管理 Hook

**文件:** `hooks/useSupabase.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useSupabase();
```

---

## useDatabase

数据库管理 Hook

**文件:** `hooks/useSupabase.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useDatabase();
```

---

## useTheme

主题切换hook - 支持用户ID隔离
@returns 当前主题、切换方法、主题列表
/

**文件:** `hooks/useTheme.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useTheme();
```

---

## useTokenLimitCheck

Token限额检查Hook
/

**文件:** `hooks/useTokenLimitCheck.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useTokenLimitCheck();
```

---

## useBrandAssetsData

品牌资产数据Hook
/

**文件:** `hooks/useUnifiedDataPersistence.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useBrandAssetsData();
```

---

## useBrandDimensionsData

品牌维度数据Hook
/

**文件:** `hooks/useUnifiedDataPersistence.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useBrandDimensionsData();
```

---

## useUserHistoryData

用户历史记录Hook
/

**文件:** `hooks/useUnifiedDataPersistence.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useUserHistoryData();
```

---

## useFavoritesData

收藏数据Hook
/

**文件:** `hooks/useUnifiedDataPersistence.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useFavoritesData();
```

---

## useAdaptHistoryData

适配历史Hook
/

**文件:** `hooks/useUnifiedDataPersistence.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useAdaptHistoryData();
```

---

## useBatchDataOperations

批量数据操作Hook
/

**文件:** `hooks/useUnifiedDataPersistence.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useBatchDataOperations();
```

---

## useDataSyncStatus

数据同步状态Hook
/

**文件:** `hooks/useUnifiedDataPersistence.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useDataSyncStatus();
```

---

## useUnifiedPermission

统一权限检查Hook
/

**文件:** `hooks/useUnifiedPermission.ts`

**类型:** 同步函数

### 参数

- **`permissionKey`** (`string`)

### 返回值

`string)`

### 使用示例

```typescript
const result = useUnifiedPermission('example');
```

---

## useMultiplePermissions

多权限检查Hook (AND逻辑)
/

**文件:** `hooks/useUnifiedPermission.ts`

**类型:** 同步函数

### 参数

- **`permissionKeys`** (`string[]`)

### 返回值

`string[])`

### 使用示例

```typescript
const result = useMultiplePermissions('example');
```

---

## useAnyPermission

任一权限检查Hook (OR逻辑)
/

**文件:** `hooks/useUnifiedPermission.ts`

**类型:** 同步函数

### 参数

- **`permissionKeys`** (`string[]`)

### 返回值

`string[])`

### 使用示例

```typescript
const result = useAnyPermission('example');
```

---

## useUserPermissions

用户可用权限Hook
/

**文件:** `hooks/useUnifiedPermission.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useUserPermissions();
```

---

## useUnifiedUsageStats

统一使用量统计Hook（增强版）
/

**文件:** `hooks/useUnifiedUsageStats.ts`

**类型:** 同步函数

### 参数

- **`externalUserTier`** (`SubscriptionTier`) - 可选

### 返回值

`SubscriptionTier): EnhancedUnifiedUsageStats &`

### 使用示例

```typescript
const result = useUnifiedUsageStats(value);
```

---

## useUserDataIsolationInit

用户数据隔离初始化Hook
/

**文件:** `hooks/useUserDataIsolationInit.ts`

**类型:** 同步函数

### 返回值

`UserDataIsolationInitConfig =`

### 使用示例

```typescript
const result = useUserDataIsolationInit();
```

---

## UserDataIsolationProvider

全局用户数据隔离初始化组件
在App根组件中使用，确保整个应用的用户数据隔离正常工作
/

**文件:** `hooks/useUserDataIsolationInit.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = UserDataIsolationProvider();
```

---

## useUserSettings

用户设置 Hook
/

**文件:** `hooks/useUserSettings.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useUserSettings();
```

---

## useThemeSettings

特定设置 Hook - 主题设置
/

**文件:** `hooks/useUserSettings.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useThemeSettings();
```

---

## useUISettings

特定设置 Hook - UI设置
/

**文件:** `hooks/useUserSettings.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useUISettings();
```

---

## useContentAdapterSettings

特定设置 Hook - 内容适配器设置
/

**文件:** `hooks/useUserSettings.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useContentAdapterSettings();
```

---

## useSafeLocalStorage

React Hook: 安全localStorage操作
/

**文件:** `lib/dataTypeValidator.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useSafeLocalStorage();
```

---

## buildEmotionPrompts

根据品牌和角色描述构建情绪prompt
@param characterDesc 角色描述
@param brand 品牌名称
@returns 情绪prompt数组
/

**文件:** `lib/emoji-prompts.ts`

**类型:** 同步函数

### 参数

- **`characterDesc`** (`string`)
- **`brand`** (`string`)

### 返回值

`string, brand: string)`

### 使用示例

```typescript
const result = buildEmotionPrompts('example', 'example');
```

---

## generateBasePrompt

生成基础prompt
@param uploadedData 上传的数据
@param style 风格
@returns 基础prompt
/

**文件:** `lib/emoji-prompts.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = generateBasePrompt();
```

---

## generateFullPrompt

生成完整prompt
@param uploadedData 上传的数据
@param style 风格
@param complexity 复杂度
@returns 完整prompt
/

**文件:** `lib/emoji-prompts.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = generateFullPrompt();
```

---

## generateBatchPrompts

生成批量情绪prompt
@param uploadedData 上传的数据
@param style 风格
@param complexity 复杂度
@param brand 品牌名称
@returns 批量prompt数组
/

**文件:** `lib/emoji-prompts.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = generateBatchPrompts();
```

---

## useGuestDataIsolation

React Hook: 访客数据隔离
/

**文件:** `lib/guestDataIsolation.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useGuestDataIsolation();
```

---

## generateNickname

生成随机昵称
@param style 昵称风格：'simple' | 'trendy' | 'creative'
@returns 生成的昵称
/

**文件:** `lib/nickname-generator.ts`

**类型:** 同步函数

### 参数

- **`style`** (`'simple' | 'trendy' | 'creative' = 'trendy'`)

### 返回值

`'simple' | 'trendy' | 'creative' = 'trendy'): string`

### 使用示例

```typescript
const result = generateNickname(value);
```

---

## generateNicknameOptions

生成多个昵称供用户选择
@param count 生成数量
@returns 昵称数组
/

**文件:** `lib/nickname-generator.ts`

**类型:** 同步函数

### 参数

- **`count`** (`number = 6`)

### 返回值

`number = 6): string[]`

### 使用示例

```typescript
const result = generateNicknameOptions(123);
```

---

## validateNickname

验证昵称是否合适
@param nickname 昵称
@returns 是否合适
/

**文件:** `lib/nickname-generator.ts`

**类型:** 同步函数

### 参数

- **`nickname`** (`string`)

### 返回值

`string): boolean`

### 使用示例

```typescript
const result = validateNickname('example');
```

---

## lazyLoadImage

图片懒加载
@param img 图片元素
@param src 图片源
/

**文件:** `lib/performance.ts`

**类型:** 同步函数

### 参数

- **`img`** (`HTMLImageElement`)
- **`src`** (`string`)

### 返回值

`HTMLImageElement, src: string): void`

### 使用示例

```typescript
const result = lazyLoadImage(value, 'example');
```

---

## preloadResources

资源预加载
@param urls 资源URL列表
/

**文件:** `lib/performance.ts`

**类型:** 同步函数

### 参数

- **`urls`** (`string[]`)

### 返回值

`string[]): Promise<void[]>`

### 使用示例

```typescript
const result = preloadResources('example');
```

---

## preloadImages

图片预加载
@param urls 图片URL列表
/

**文件:** `lib/performance.ts`

**类型:** 同步函数

### 参数

- **`urls`** (`string[]`)

### 返回值

`string[]): Promise<void[]>`

### 使用示例

```typescript
const result = preloadImages('example');
```

---

## getNetworkInfo

检查网络状态
/

**文件:** `lib/performance.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = getNetworkInfo();
```

---

## getOptimizedImageUrl

根据网络状态调整图片质量
@param baseUrl 基础URL
@param quality 质量参数
/

**文件:** `lib/performance.ts`

**类型:** 同步函数

### 参数

- **`baseUrl`** (`string`)
- **`quality`** (`'low' | 'medium' | 'high' = 'medium'`)

### 返回值

`string, quality: 'low' | 'medium' | 'high' = 'medium'): string`

### 使用示例

```typescript
const result = getOptimizedImageUrl('example', value);
```

---

## useSecureDataManager

React Hook: 安全数据管理
/

**文件:** `lib/secureDataManager.ts`

**类型:** 同步函数

### 参数

- **`config`** (`Partial<SecurityConfig>`) - 可选

### 返回值

`Partial<SecurityConfig>)`

### 使用示例

```typescript
const result = useSecureDataManager(value);
```

---

## useSecureUserStorage

导出用于React组件的Hook

**文件:** `lib/secureUserStorage.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useSecureUserStorage();
```

---

## useStorageQuotaManager

React Hook: localStorage容量管理
/

**文件:** `lib/storageQuotaManager.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useStorageQuotaManager();
```

---

## useEnhancedUserDataIsolation

React Hook: 增强的用户数据隔离
/

**文件:** `lib/unifiedStorageManager.ts`

**类型:** 同步函数

### 参数

- **`userId`** (`string | null`) - 可选

### 返回值

`string | null)`

### 使用示例

```typescript
const result = useEnhancedUserDataIsolation('example');
```

---

## useUserSwitchDataCleaner

React Hook: 用户切换数据清理
/

**文件:** `lib/userSwitchDataCleaner.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useUserSwitchDataCleaner();
```

---

## StandardPaymentResultPage

暂无描述

**文件:** `pages/StandardPaymentResultPage.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = StandardPaymentResultPage();
```

---

## TokenDebugPage

暂无描述

**文件:** `pages/TokenDebugPage.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = TokenDebugPage();
```

---

## getPrompt

🎯 统一提示词获取函数 - 主要调用接口

@param type 提示词类型
@param params 提示词参数
@returns 格式化后的提示词

@example
```typescript
// 获取标题生成提示词
const { systemPrompt, userPrompt } = getPrompt(PromptType.TITLE_GENERATION_SYSTEM, {
content: "文章内容",
platform: "xiaohongshu",
outputCount: 5
});

// 获取九宫格创意提示词
const { systemPrompt, userPrompt } = getPrompt(PromptType.CREATIVE_GENERATION_SYSTEM, {
targetAudience: "年轻女性",
useCase: "护肤品推广",
painPoint: "皮肤干燥",
contentType: "text"
});
```
/

**文件:** `prompts/PromptSystem.ts`

**类型:** 同步函数

### 返回值

`PromptType, params: PromptParams =`

### 使用示例

```typescript
const result = getPrompt();
```

---

## getAllPromptTemplates

🔍 获取所有提示词模板信息
/

**文件:** `prompts/PromptSystem.ts`

**类型:** 同步函数

### 返回值

`PromptTemplate[]`

### 使用示例

```typescript
const result = getAllPromptTemplates();
```

---

## getPromptSystemStats

📊 获取提示词系统统计信息
/

**文件:** `prompts/PromptSystem.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = getPromptSystemStats();
```

---

## verifyPromptSystemIntegrity

🛡️ 提示词系统完整性验证
/

**文件:** `prompts/PromptSystem.ts`

**类型:** 同步函数

### 返回值

`boolean`

### 使用示例

```typescript
const result = verifyPromptSystemIntegrity();
```

---

## getCreativeCubeDimensions

获取九宫格创意魔方的维度定义
/

**文件:** `prompts/PromptSystem.ts`

**类型:** 同步函数

### 返回值

`CreativeCubeDimension[]`

### 使用示例

```typescript
const result = getCreativeCubeDimensions();
```

---

## getRequiredDimensionIds

获取必选维度ID列表
/

**文件:** `prompts/PromptSystem.ts`

**类型:** 同步函数

### 返回值

`string[]`

### 使用示例

```typescript
const result = getRequiredDimensionIds();
```

---

## getRecommendedDimensionIds

获取推荐维度ID列表
/

**文件:** `prompts/PromptSystem.ts`

**类型:** 同步函数

### 返回值

`string[]`

### 使用示例

```typescript
const result = getRecommendedDimensionIds();
```

---

## getOptionalDimensionIds

获取可选维度ID列表
/

**文件:** `prompts/PromptSystem.ts`

**类型:** 同步函数

### 返回值

`string[]`

### 使用示例

```typescript
const result = getOptionalDimensionIds();
```

---

## selectDimensionCombination

智能选择维度组合
@param totalCount 总维度数量 (4-9)
@param pinnedDimensions 固定的维度ID列表
@returns 选择的维度ID列表
/

**文件:** `prompts/PromptSystem.ts`

**类型:** 同步函数

### 参数

- **`totalCount`** (`number`)
- **`pinnedDimensions`** (`string[] = []`)

### 返回值

`number,
  pinnedDimensions: string[] = []
): string[]`

### 使用示例

```typescript
const result = selectDimensionCombination(123, 'example');
```

---

## buildCreativeCubePrompt

构建九宫格创意魔方的AI提示词 - 重构版
/

**文件:** `prompts/PromptSystem.ts`

**类型:** 同步函数

### 参数

- **`config`** (`CreativeCubeConfig`)

### 返回值

`CreativeCubeConfig): string`

### 使用示例

```typescript
const result = buildCreativeCubePrompt(value);
```

---

## useTokenUsage

Token使用量Hook - 便捷的React Hook
/

**文件:** `stores/tokenUsageStore.ts`

**类型:** 同步函数

### 参数

- **`userId`** (`string`) - 可选
- **`userTier`** (`SubscriptionTier`) - 可选

### 返回值

`string, userTier?: SubscriptionTier)`

### 使用示例

```typescript
const result = useTokenUsage('example', value);
```

---

## isValidDialogSize

🎯 类型守卫函数

**文件:** `types/dialog-types.ts`

**类型:** 同步函数

### 参数

- **`size`** (`unknown`)

### 返回值

`unknown): size is DialogSize`

### 使用示例

```typescript
const result = isValidDialogSize(value);
```

---

## isValidDialogVariant

暂无描述

**文件:** `types/dialog-types.ts`

**类型:** 同步函数

### 参数

- **`variant`** (`unknown`)

### 返回值

`unknown): variant is DialogVariant`

### 使用示例

```typescript
const result = isValidDialogVariant(value);
```

---

## isValidDialogAnimation

暂无描述

**文件:** `types/dialog-types.ts`

**类型:** 同步函数

### 参数

- **`animation`** (`unknown`)

### 返回值

`unknown): animation is DialogAnimation`

### 使用示例

```typescript
const result = isValidDialogAnimation(value);
```

---

## validateDialogStyle

🎯 样式属性验证函数

**文件:** `types/dialog-types.ts`

**类型:** 同步函数

### 参数

- **`style`** (`CSSProperties`)

### 返回值

`CSSProperties):`

### 使用示例

```typescript
const result = validateDialogStyle(value);
```

---

## DeepSeekProvider

DeepSeek提供者实现

/

**文件:** `ai/providers/deepseek.ts`

**类型:** 类

### 方法

- **`generateText`**  (异步)
  生成文本
/
- **`isAvailable`**  
  检查是否可用
/
- **`isConfigured`**  
  检查是否已配置

/
- **`getSupportedModels`**  
  获取支持的模型列表

/
- **`generateContent`**  (异步)
  生成内容

/
- **`if`**  
  添加上下文
- **`catch`**  

---

## OpenAIProvider

OpenAI提供者实现

/

**文件:** `ai/providers/openai.ts`

**类型:** 类

### 方法

- **`generateText`**  (异步)
  生成文本
/
- **`isAvailable`**  
  检查是否可用
/
- **`isConfigured`**  
  检查是否已配置

/
- **`getSupportedModels`**  
  获取支持的模型列表

/
- **`generateContent`**  (异步)
  生成内容

/
- **`if`**  
  添加上下文
- **`catch`**  

---

## AutomationEngine

自动化引擎类

**文件:** `automation/AutomationEngine.ts`

**类型:** 类

### 方法

- **`updateProgress`**  
- **`if`**  
- **`detectPlatformContent`**  (异步)
  检测页面中的平台内容
/
- **`if`**  
  2. 查找主要内容区域（当前页面结构）
- **`for`**  
- **`for`**  
- **`if`**  
- **`if`**  
  方法2: 如果没有找到标准的卡片，尝试其他方式
- **`if`**  
  方法3: 智能内容检测 - 基于页面结构分析
- **`if`**  
- **`if`**  
  方法4: 最后的备选方案 - 查找所有长文本内容
- **`if`**  
- **`if`**  
- **`if`**  
  如果仍然没有找到内容，提供更详细的错误信息
- **`if`**  
- **`catch`**  
- **`validateContent`**  
  验证内容是否符合平台要求
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`selectAutomationMethod`**  
- **`if`**  
- **`if`**  
  检测客户端脚本支持
- **`executeForward`**  (异步)
  执行自动化转发
/
- **`for`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`catch`**  
- **`forwardToPlatform`**  (异步)
- **`if`**  
- **`switch`**  
- **`forwardViaBrowser`**  (异步)
- **`if`**  
- **`if`**  
  如果有标签，分别处理
- **`if`**  
- **`catch`**  
- **`formatHashtagsForPlatform`**  
- **`showPlatformInstructions`**  
- **`catch`**  
- **`if`**  
- **`getPlatformTips`**  
- **`forwardViaExtension`**  (异步)
- **`catch`**  
- **`forwardViaScript`**  (异步)
- **`catch`**  
- **`forwardManually`**  (异步)
- **`catch`**  
- **`showFallbackInstructions`**  
- **`catch`**  
- **`if`**  
- **`cancel`**  
  取消自动化操作
/
- **`retryFailedForward`**  (异步)
  重试失败的转发
/
- **`if`**  

---

## SecurityComplianceChecker

暂无描述

**文件:** `automation/SecurityCompliance.ts`

**类型:** 类

### 方法

- **`initializePlatformRules`**  
- **`checkPlatformCompliance`**  (异步)
  执行平台合规检查
/
- **`for`**  
  执行所有规则检查
- **`if`**  
  根据检查结果生成建议和警告
- **`if`**  
- **`addGeneralSecurityRecommendations`**  
- **`getPlatformName`**  
- **`batchCheckCompliance`**  (异步)
  批量检查多个平台的合规性
/
- **`for`**  
- **`catch`**  
- **`generateComplianceReport`**  
  生成合规报告
/
- **`forEach`**  
- **`if`**  

---

## DouyinAdapter

暂无描述

**文件:** `automation/adapters/DouyinAdapter.ts`

**类型:** 类

### 方法

- **`checkLoginStatus`**  (异步)
  检查抖音登录状态
/
- **`catch`**  
- **`fillContent`**  (异步)
  填充抖音内容
/
- **`if`**  
  检查内容长度（抖音限制2200字符）
- **`catch`**  
- **`triggerPublish`**  (异步)
  触发抖音发布
/
- **`handleSpecialCases`**  (异步)
  处理抖音特殊情况
/
- **`catch`**  
- **`optimizeDouyinHashtags`**  
  抖音专用：话题标签优化
/
- **`if`**  
  如果没有话题标签，建议添加
- **`if`**  
- **`extractContentKeywords`**  
- **`getContentTypeSuggestions`**  
  抖音专用：内容类型建议
/
- **`if`**  
  默认建议
- **`executeEnhancedPublish`**  (异步)
  抖音专用：执行增强发布流程
/
- **`catch`**  
- **`publish`**  (异步)
  实现抽象方法：标准发布接口
/
- **`catch`**  

---

## BatchForwardAutomation

暂无描述

**文件:** `automation/batchForward.ts`

**类型:** 类

### 方法

- **`executeBatchForward`**  (异步)
  执行批量转发自动化（简化版本）
/
- **`if`**  
- **`for`**  
  逐个处理选中的平台
- **`if`**  
- **`catch`**  
- **`extractCurrentPageData`**  (异步)
- **`if`**  
  如果找不到版本内容，尝试查找其他可能的内容元素
- **`for`**  
- **`if`**  
- **`if`**  
- **`if`**  
  如果没有找到标准的卡片，尝试查找版本内容
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`handleSinglePlatform`**  (异步)
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`copyContentToClipboard`**  (异步)
- **`if`**  
- **`catch`**  
- **`getPlatformPublishUrl`**  
- **`navigateToPublishPage`**  (异步)
- **`if`**  
- **`catch`**  
- **`delay`**  (异步)

---

## RenderConflictDetector

渲染冲突检测器 - 防止React无限循环
/

**文件:** `components/ErrorBoundary/RenderConflictDetector.tsx`

**类型:** 类

### 方法

- **`initPerformanceMonitoring`**  
- **`if`**  
- **`if`**  
  检测React渲染性能问题
- **`catch`**  
- **`getDerivedStateFromError`** (静态) 
  错误边界 - 捕获渲染错误
/
- **`if`**  
- **`componentDidCatch`**  
  组件错误处理
/
- **`if`**  
  调用外部错误处理器
- **`attemptAutoRecovery`**  
- **`detectRenderConflict`**  
- **`if`**  
  检查渲染频率
- **`componentDidUpdate`**  
  组件更新前检查
/
- **`if`**  
  ✅ FIXED: 使用setTimeout避免在componentDidUpdate中直接setState导致无限循环
- **`if`**  
- **`componentWillUnmount`**  
  组件卸载清理
/
- **`if`**  
  清理性能监控
- **`render`**  
  渲染方法
/
- **`if`**  
  如果检测到错误或冲突，显示fallback

---

## ErrorBoundary

全局错误边界组件
用于捕获和处理应用中的JavaScript错误
特别处理React Router和认证上下文初始化冲突
/

**文件:** `components/ErrorBoundary.tsx`

**类型:** 类

### 方法

- **`getDerivedStateFromError`** (静态) 
  捕获子组件错误
/
- **`isInitializationError`** (静态) 
- **`isTDZError`**  
- **`handleTDZError`**  
- **`if`**  
- **`componentDidCatch`**  
  错误信息记录
/
- **`reportError`**  
- **`if`**  
  发送错误报告（可选）
- **`catch`**  
- **`render`**  
  渲染错误界面
/
- **`if`**  
- **`if`**  
  如果有自定义fallback，使用它

---

## MD2CardCacheManager

MD2Card缓存管理器
/

**文件:** `components/creative/md2card/CacheManager.ts`

**类型:** 类

### 方法

- **`async`**  
- **`for`**  
- **`getAllStats`**  
  获取所有缓存统计信息
/
- **`clearAll`**  
  清空所有缓存
/
- **`warmup`**  (异步)
  预热缓存
/
- **`if`**  
  预加载模板
- **`if`**  
  预加载常用设置
- **`if`**  
  预解析常用Markdown
- **`startCleanupTimer`**  
- **`cleanupExpired`**  
- **`estimateMemoryUsage`**  
- **`hashString`**  
- **`for`**  
- **`hashObject`**  

---

## MarkdownParser

Markdown解析器类
/

**文件:** `components/creative/md2card/MarkdownParser.ts`

**类型:** 类

### 方法

- **`parse`**  
  解析Markdown内容
/
- **`for`**  
- **`switch`**  
- **`if`**  
- **`if`**  
- **`parseInlineElements`**  
- **`generateMetadata`**  
- **`if`**  
- **`if`**  
- **`countWords`**  

---

## ContentAdapter

内容适配器
根据卡片模板和尺寸智能适配内容
/

**文件:** `components/creative/md2card/MarkdownParser.ts`

**类型:** 类

### 方法

- **`adaptContent`** (静态) 
  智能截断内容以适应卡片尺寸
/
- **`map`**  
- **`if`**  
- **`generateSummary`** (静态) 
  生成内容摘要
/
- **`if`**  
- **`for`**  
- **`validateContentForTemplate`** (静态) 
  检测内容是否适合指定模板
/
- **`if`**  
  检查段落数量
- **`for`**  
  检查单段内容长度
- **`if`**  
- **`if`**  
- **`if`**  
  检查图片支持
- **`if`**  
  检查列表支持
- **`optimizeForTemplate`** (静态) 
  根据模板类型优化内容结构
/
- **`switch`**  
- **`optimizeForKnowledge`** (静态) 
- **`map`**  
- **`slice`**  
- **`optimizeForSocial`** (静态) 
- **`map`**  
- **`if`**  
- **`optimizeForBusiness`** (静态) 
- **`optimizeForEducation`** (静态) 
- **`if`**  

---

## EnhancedErrorBoundary

增强错误边界组件
/

**文件:** `components/errors/EnhancedErrorBoundary.tsx`

**类型:** 类

### 方法

- **`getDerivedStateFromError`** (静态) 
- **`componentDidCatch`**  
- **`createEnhancedError`**  
- **`categorizeError`**  
- **`assessSeverity`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`generateRecoveryStrategies`**  
- **`switch`**  
  基于错误类型生成策略
- **`startAutoRecovery`**  
- **`if`**  
  清理定时器
- **`logError`**  
- **`reportError`**  
- **`catch`**  
- **`generateErrorId`**  
- **`generateSessionId`**  
- **`getCurrentUserId`**  
- **`getMemoryUsage`**  
- **`if`**  
- **`sanitizeProps`**  
- **`sanitizeState`**  
- **`generateReproductionSteps`**  
- **`componentWillUnmount`**  
- **`if`**  
- **`render`**  
- **`if`**  
- **`renderErrorUI`**  
- **`if`**  
  如果提供了自定义降级UI
- **`getSeverityColor`**  
- **`switch`**  
- **`getErrorDescription`**  
- **`switch`**  

---

## AIEndpointManager

配置管理器类
提供运行时配置更新功能
/

**文件:** `config/aiEndpoints.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
  获取单例实例
/
- **`if`**  
- **`updateEndpoint`**  
  更新服务端点配置
@param provider 提供商名称
@param config 新的配置
/
- **`if`**  
- **`getEndpoint`**  
  获取配置
@param provider 提供商名称
/
- **`reloadConfigurations`**  
  重新加载环境配置
/

---

## ConfigManager

配置管理器类
/

**文件:** `config/configManager.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
  获取配置管理器实例（单例模式）
/
- **`if`**  
- **`getCurrentEnvironment`**  
- **`if`**  
- **`if`**  
- **`fetchRemoteConfig`**  (异步)
- **`catch`**  
- **`getEnvConfig`**  
- **`getRedirectUri`**  
- **`if`**  
  优先使用环境变量配置
- **`if`**  
- **`switch`**  
  其他环境的默认值
- **`getDefaultConfig`**  
- **`mergeConfigs`**  
- **`for`**  
- **`if`**  
- **`validateConfig`**  
- **`getConfig`**  (异步)
  获取完整配置
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getAuthingConfig`**  (异步)
  获取特定配置
/
- **`getSupabaseConfig`**  (异步)
- **`getAIConfig`**  (异步)
- **`refreshConfig`**  (异步)
  热更新配置
/
- **`clearCache`**  
  清除配置缓存
/

---

## PermissionChecker

权限检查工具类
/

**文件:** `config/rolePermissionMatrix.ts`

**类型:** 类

### 方法

- **`calculateRolePermissions`** (静态) 
- **`switch`**  
- **`calculateTierPermissions`** (静态) 
- **`switch`**  
- **`hasRolePermission`** (静态) 
  检查角色是否有指定权限
/
- **`hasTierPermission`** (静态) 
  检查订阅级别是否有指定权限
/
- **`getInheritedPermissions`** (静态) 
  获取继承的权限列表
/
- **`getAllRolePermissions`** (静态) 
  获取角色的所有权限（包括继承）
/
- **`getAllTierPermissions`** (静态) 
  获取订阅级别的所有权限（包括继承）
/
- **`checkUserPermission`** (静态) 
  检查用户是否有权限（综合角色和订阅级别）
/
- **`getPermissionDisplayName`** (静态) 
  获取权限的显示名称
/

---

## UnifiedPermissionManager

统一权限管理器
/

**文件:** `config/unifiedPermissionConfig.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`checkPermission`**  
  检查单个权限
/
- **`if`**  
- **`if`**  
  🔒 安全修复：移除开发环境权限绕过，所有环境都必须遵循相同的权限检查规则
开发环境也必须进行正常的权限验证，确保安全性一致
自定义检查函数优先
- **`if`**  
- **`if`**  
  基于角色的权限检查
- **`if`**  
- **`if`**  
  基于订阅级别的权限检查
- **`if`**  
- **`if`**  
  基于权限列表的检查
- **`if`**  
- **`checkMultiplePermissions`**  
  检查多个权限（AND逻辑）
/
- **`for`**  
- **`if`**  
- **`checkAnyPermission`**  
  检查任一权限（OR逻辑）
/
- **`if`**  
- **`getUserAvailablePermissions`**  
  获取用户所有可用权限
/
- **`if`**  
- **`getUpgradeSuggestion`**  
  获取权限升级建议
/
- **`if`**  

---

## TitleGenerationError

错误类型

**文件:** `features/titleGeneration/types/titleGeneration.types.ts`

**类型:** 类

---

## BrandLibraryDataManager

品牌资料库数据管理器
提供统一的数据操作接口，简化BrandLibraryPage的数据管理
/

**文件:** `lib/brandLibraryDataMigration.ts`

**类型:** 类

### 方法

- **`if`**  
- **`setUserId`**  
  设置用户ID
/
- **`saveBrandAssets`**  (异步)
  保存品牌资产
/
- **`if`**  
- **`catch`**  
- **`loadBrandAssets`**  (异步)
  加载品牌资产
/
- **`if`**  
- **`catch`**  
- **`saveBrandDimensions`**  (异步)
  保存品牌维度
/
- **`if`**  
- **`catch`**  
- **`loadBrandDimensions`**  (异步)
  加载品牌维度
/
- **`if`**  
- **`catch`**  
- **`updateBrandAsset`**  (异步)
  更新品牌资产
/
- **`addBrandAsset`**  (异步)
  添加品牌资产
/
- **`deleteBrandAsset`**  (异步)
  删除品牌资产
/
- **`updateBrandDimension`**  (异步)
  更新品牌维度
/
- **`addDimensionItem`**  (异步)
  添加维度项目
/
- **`deleteDimensionItem`**  (异步)
  删除维度项目
/
- **`updateDimensionItem`**  (异步)
  更新维度项目
/
- **`addKeywordToDimension`**  (异步)
  添加关键词到维度
/
- **`removeKeywordFromDimension`**  (异步)
  从维度移除关键词
/
- **`batchDeleteAssetsAndDimensions`**  (异步)
  批量删除资产和相关维度数据
/
- **`cleanupOrphanedDimensionData`**  (异步)
  清理孤立的维度数据
/
- **`migrateFromLegacySystem`**  (异步)
  从旧系统迁移数据
/
- **`if`**  
  迁移资产数据
- **`if`**  
- **`if`**  
  迁移维度数据
- **`if`**  

---

## DataSyncManager

数据同步管理器
/

**文件:** `lib/dataSync.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`initializeNetworkListeners`**  
- **`updateSyncStatus`**  
- **`notifyListeners`**  
- **`catch`**  
- **`if`**  
- **`getSyncStatus`**  
  获取当前同步状态
/
- **`triggerAutoSync`**  (异步)
- **`if`**  
- **`catch`**  
- **`manualSync`**  (异步)
  手动触发同步
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`performSync`**  (异步)

---

## DataMigrationManager

数据迁移管理器
/

**文件:** `lib/dataSync.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`performLoginMigration`**  (异步)
  执行用户登录时的数据迁移
/
- **`for`**  
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`migrateDataType`**  (异步)
- **`if`**  
- **`if`**  
- **`catch`**  
- **`getLegacyData`**  
- **`for`**  
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`cleanupLegacyData`**  
- **`catch`**  
- **`performLogoutCleanup`**  (异步)
  执行用户登出时的数据清理
/
- **`catch`**  

---

## DataTypeValidator

数据类型验证器
/

**文件:** `lib/dataTypeValidator.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`validate`**  
  验证数据是否符合模式
/
- **`if`**  
  🔧 FIX: 如果数据为null或undefined，跳过类型检查
- **`if`**  
  字符串验证
- **`if`**  
- **`if`**  
  对象验证
- **`if`**  
- **`if`**  
- **`catch`**  
- **`validateType`**  
- **`switch`**  
- **`validateString`**  
- **`if`**  
  长度检查
- **`if`**  
- **`if`**  
  数据清理
- **`validateObject`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`validateArray`**  
- **`if`**  
- **`if`**  
- **`sanitizeString`**  
- **`validateAndSanitizeStorageData`**  
  验证并清理localStorage数据
/
- **`if`**  
- **`if`**  
  清理错误的数据
- **`catch`**  
- **`if`**  
- **`if`**  
  只在debug模式下输出详细日志
- **`catch`**  
- **`if`**  
- **`shouldSkipValidation`**  
- **`if`**  
  跳过空数据的验证
- **`inferSchema`**  
- **`if`**  
  数据验证运行时间
- **`if`**  
  🔧 FIX: 添加缺失的数据模式匹配
remember_me布尔值
- **`if`**  
  保存的手机号(支持字符串类型，自动转换number)
- **`if`**  
- **`if`**  
- **`if`**  
  content-sync-storage
- **`if`**  
  会话状态数据
- **`if`**  
  会话同步数据
- **`if`**  
  安全配置密钥(实际是object类型)
- **`if`**  
  选择的平台数据
- **`if`**  
  分享历史
- **`if`**  
  热点话题数据
- **`if`**  
  通知数据
- **`if`**  
  Authing用户信息 - 使用宽松验证
- **`validateAllStorageData`**  
  批量验证所有localStorage数据
/
- **`if`**  
- **`if`**  
- **`catch`**  

---

## SafeLocalStorage

安全的localStorage操作包装器
/

**文件:** `lib/dataTypeValidator.ts`

**类型:** 类

### 方法

- **`if`**  
- **`catch`**  
- **`if`**  
- **`catch`**  
- **`removeItem`**  
  安全删除数据
/
- **`catch`**  
- **`cleanupInvalidData`**  
  批量验证并清理无效数据
/

---

## GuestDataIsolationManager

访客数据隔离管理器
/

**文件:** `lib/guestDataIsolation.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`initializeGuestSession`**  
- **`isStorageAvailable`**  
- **`catch`**  
- **`createNewGuestSession`**  
- **`log`**  
- **`generateUniqueSessionId`**  
- **`generateBrowserFingerprint`**  
- **`for`**  
- **`saveGuestSession`**  
- **`catch`**  
- **`loadGuestSession`**  
- **`parse`**  
- **`isSessionValid`**  
- **`updateLastActivity`**  
- **`getCurrentSessionId`**  
  获取当前访客会话ID
/
- **`getGuestDataKey`**  
  获取访客数据存储键
/
- **`if`**  
- **`catch`**  
- **`parse`**  
- **`removeGuestData`**  
  删除访客数据
/
- **`clearCurrentGuestData`**  
  清理当前访客会话的所有数据
/
- **`cleanupExpiredGuestSessions`**  
  清理所有过期的访客会话
/
- **`catch`**  
- **`if`**  
- **`migrateGuestDataToUser`**  
  将访客数据迁移到正式用户
/
- **`if`**  
- **`catch`**  
- **`getGuestSessionStats`**  
  获取访客会话统计信息
/

---

## MemoryCache

内存缓存
/

**文件:** `lib/performance.ts`

**类型:** 类

### 方法

- **`set`**  
  设置缓存
@param key 键
@param value 值
@param ttl 生存时间（毫秒）
/
- **`get`**  
  获取缓存
@param key 键
/
- **`delete`**  
  删除缓存
@param key 键
/
- **`clear`**  
  清空缓存
/
- **`cleanup`**  
  清理过期缓存
/
- **`if`**  

---

## LocalStorageCache

本地存储缓存 - 支持用户ID隔离
/

**文件:** `lib/performance.ts`

**类型:** 类

### 方法

- **`getStorageKey`**  
- **`if`**  
- **`set`**  
  设置缓存 - 支持用户隔离
@param key 键
@param value 值
@param ttl 生存时间（毫秒）
/
- **`catch`**  
- **`catch`**  
- **`delete`**  
  删除缓存 - 支持用户隔离
@param key 键
/
- **`catch`**  
- **`clear`**  
  清空缓存
/
- **`catch`**  

---

## PerformanceMonitor

性能监控
/

**文件:** `lib/performance.ts`

**类型:** 类

### 方法

- **`startTimer`**  
  开始计时
@param name 指标名称
/
- **`endTimer`**  
  结束计时
@param name 指标名称
/
- **`if`**  
- **`getMetrics`**  
  获取指标统计
@param name 指标名称
/
- **`clear`**  
  清空指标
/

---

## SecureDataManager

安全数据管理器主类
/

**文件:** `lib/secureDataManager.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`initializeSecurityFeatures`**  
- **`if`**  
  启动存储配额监控
- **`if`**  
  清理过期数据
- **`if`**  
  验证现有数据
- **`setCurrentUser`**  
  设置当前用户
/
- **`if`**  
  执行用户切换清理
- **`if`**  
- **`if`**  
- **`if`**  
  数据验证
- **`if`**  
- **`if`**  
  存储配额检查
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`removeData`**  
  删除数据
/
- **`if`**  
- **`startQuotaMonitoring`**  
- **`if`**  
- **`if`**  
- **`performInitialCleanup`**  
- **`validateExistingData`**  
- **`if`**  
- **`if`**  
- **`getSecurityReport`**  
  获取安全状态报告
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`performSecurityAudit`**  
  执行完整的安全检查
/
- **`if`**  
  检查用户数据隔离
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
  检查加密状态
- **`destroy`**  
  销毁管理器
/
- **`if`**  

---

## SecureUserStorageManager

安全用户存储管理器
/

**文件:** `lib/secureUserStorage.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`setCurrentUser`**  
  设置当前用户
/
- **`if`**  
- **`generateGuestSessionId`**  
- **`if`**  
- **`if`**  
- **`setAuthData`**  
  安全存储认证信息
/
- **`getAuthData`**  
  安全获取认证信息
/
- **`removeUserData`**  
  删除用户数据
/
- **`if`**  
- **`clearCurrentUserData`**  
  清理当前用户的所有数据
/
- **`if`**  
- **`clearGuestData`**  
- **`migrateOldStorageFormat`**  
  迁移旧格式数据到新的安全存储格式
/
- **`catch`**  
- **`validateDataIsolation`**  
  验证数据隔离完整性
/
- **`forEach`**  
- **`if`**  
- **`if`**  
- **`catch`**  

---

## DataEncryption

数据加密类
/

**文件:** `lib/security.ts`

**类型:** 类

### 方法

- **`encrypt`**  
  加密数据
@param data 要加密的数据
@returns 加密后的字符串
/
- **`catch`**  
- **`decrypt`**  
  解密数据
@param encryptedData 加密的数据
@returns 解密后的字符串
/
- **`catch`**  
- **`encryptObject`**  
  加密对象
@param obj 要加密的对象
@returns 加密后的字符串
/

---

## DataMasking

数据脱敏类
/

**文件:** `lib/security.ts`

**类型:** 类

### 方法

- **`maskValue`** (静态) 
  脱敏单个值
@param value 原始值
@param type 数据类型
@returns 脱敏后的值
/
- **`if`**  
- **`maskObject`** (静态) 
  脱敏对象中的敏感字段
@param obj 原始对象
@returns 脱敏后的对象
/
- **`if`**  
- **`if`**  
- **`maskArray`** (静态) 
  脱敏数组中的对象
@param array 原始数组
@returns 脱敏后的数组
/

---

## DataValidation

数据验证类
/

**文件:** `lib/security.ts`

**类型:** 类

### 方法

- **`isValidEmail`** (静态) 
  验证邮箱格式
@param email 邮箱地址
@returns 是否有效
/
- **`isValidPhone`** (静态) 
  验证手机号格式
@param phone 手机号
@returns 是否有效
/
- **`validatePasswordStrength`** (静态) 
  验证密码强度
@param password 密码
@returns 强度等级
/
- **`isValidApiKey`** (静态) 
  验证API密钥格式
@param apiKey API密钥
@returns 是否有效
/
- **`isValidUrl`** (静态) 
  验证URL格式
@param url URL地址
@returns 是否有效
/

---

## SecureStorage

安全存储类
/

**文件:** `lib/security.ts`

**类型:** 类

### 方法

- **`setItem`**  
  安全存储数据
@param key 键名
@param value 值
@param encrypt 是否加密
/
- **`encrypt`**  
- **`if`**  
- **`catch`**  
- **`removeItem`**  
  安全删除数据
@param key 键名
/
- **`catch`**  
- **`clear`**  
  清空所有数据
/
- **`catch`**  

---

## StorageQuotaManager

localStorage容量管理器
/

**文件:** `lib/storageQuotaManager.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`getQuotaInfo`**  
  获取当前存储配额信息
/
- **`getAllStorageItems`**  
  获取所有localStorage项目的详细信息
/
- **`getItemLastModified`**  
- **`categorizeStorageKey`**  
- **`parseStorageKeyInfo`**  
- **`match`**  
- **`match`**  
- **`shouldCleanup`**  
  检查是否需要清理
/
- **`if`**  
- **`if`**  
- **`performIntelligentCleanup`**  
  智能清理策略
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`getExpiredGuestItems`**  
- **`getStorageReport`**  
  获取存储使用报告
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`formatBytes`** (静态) 
  格式化字节大小
/
- **`generateUsageReport`**  
  生成存储使用量报告
/
- **`if`**  
- **`if`**  

---

## UnifiedDataPersistenceManager

统一数据持久化管理器
/

**文件:** `lib/unifiedDataPersistenceManager.ts`

**类型:** 类

### 方法

- **`setUserId`**  
  设置当前用户ID
/
- **`if`**  
  初始化Supabase服务
- **`initializeSupabaseServices`**  
- **`forEach`**  
- **`catch`**  
- **`if`**  
- **`switch`**  
- **`catch`**  
- **`if`**  
- **`switch`**  
- **`catch`**  
- **`if`**  
  先尝试保存到云端
- **`if`**  
  云端保存成功，同时保存到本地作为备份
- **`catch`**  
- **`if`**  
  添加到同步队列
- **`if`**  
  如果在线且需要云端同步，异步同步到云端
- **`catch`**  
- **`saveToCloud`**  
- **`catch`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`generateLocalStorageKey`**  
- **`if`**  
- **`addToSyncQueue`**  
- **`processSyncQueue`**  (异步)
- **`for`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`migrateUserData`**  (异步)
- **`if`**  
- **`migrateLegacyLocalStorageData`**  
- **`if`**  
- **`if`**  
  只迁移当前用户的数据
- **`catch`**  
- **`if`**  
  先尝试从云端加载
- **`if`**  
- **`if`**  
  云端加载成功，同时更新本地备份
- **`catch`**  
- **`if`**  
  如果本地有数据，直接返回
- **`if`**  
  本地没有数据，尝试从云端加载
- **`if`**  
- **`catch`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`deleteData`**  (异步)
  删除数据
/
- **`if`**  
- **`if`**  
  删除云端数据
- **`catch`**  
- **`catch`**  
- **`deleteFromCloud`**  (异步)
- **`if`**  
- **`if`**  
- **`catch`**  

---

## UnifiedStorageKeyManager

统一存储键命名规范
/

**文件:** `lib/unifiedStorageManager.ts`

**类型:** 类

### 方法

- **`generateUserDataKey`** (静态) 
  生成用户数据存储键
/
- **`generateGuestDataKey`** (静态) 
  生成访客数据存储键
/
- **`generateUIPrefsKey`** (静态) 
  生成UI偏好存储键
/
- **`generateTempDataKey`** (静态) 
  生成临时数据存储键
/
- **`parseStorageKey`** (静态) 
  解析存储键
/
- **`if`**  
- **`switch`**  
- **`getUserStorageKeys`** (静态) 
  获取用户所有相关的存储键
/
- **`getGuestStorageKeys`** (静态) 
  获取访客所有相关的存储键
/
- **`clearUserData`** (静态) 
  清理用户所有数据
/
- **`clearGuestData`** (静态) 
  清理访客数据
/
- **`migrateOldStorageKeys`** (静态) 
  迁移旧格式存储键到新格式
/
- **`if`**  
- **`generateGuestDataKey`**  
- **`catch`**  

---

## EnhancedUserDataIsolation

增强的用户数据隔离管理器
/

**文件:** `lib/unifiedStorageManager.ts`

**类型:** 类

### 方法

- **`setUser`**  
  设置当前用户
/
- **`if`**  
- **`if`**  
- **`generateUserDataKey`**  
- **`generateUserDataKey`**  
- **`if`**  
- **`parse`**  
- **`removeData`**  
  删除数据
/
- **`generateUserDataKey`**  
- **`if`**  
- **`migrateOldData`**  
  迁移旧格式数据
/
- **`getCurrentUserId`**  
  获取当前用户ID
/
- **`getGuestSessionId`**  
  获取访客会话ID
/

---

## UserSwitchDataCleaner

用户切换数据清理器类
/

**文件:** `lib/userSwitchDataCleaner.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`performLogoutCleanup`**  (异步)
  用户登出时完整清理
/
- **`for`**  
- **`catch`**  
- **`for`**  
- **`catch`**  
- **`catch`**  
- **`performLoginCleanup`**  (异步)
  用户登录时清理冲突数据
/
- **`if`**  
  1. 如果是用户切换，清理旧用户数据
- **`for`**  
- **`catch`**  
- **`catch`**  
- **`getUserStorageKeys`**  
- **`getGuestStorageKeys`**  
- **`getSessionStorageKeys`**  
- **`for`**  
- **`notifyServicesUserLogout`**  
- **`if`**  
  通知各服务清理内存状态
- **`clearAuthenticationCache`**  
- **`migrateOldUserData`**  
- **`performDeepCleanup`**  (异步)
  执行深度清理（清理所有可能的残留数据）
/
- **`for`**  
- **`catch`**  
- **`catch`**  
- **`validateCleanupResult`**  
  验证清理效果
/
- **`if`**  
- **`if`**  

---

## Creem

暂无描述

**文件:** `types/creem.d.ts`

**类型:** 类

---

## Lunar

暂无描述

**文件:** `types/lunar-javascript.d.ts`

**类型:** 类

---

## Solar

暂无描述

**文件:** `types/lunar-javascript.d.ts`

**类型:** 类

---


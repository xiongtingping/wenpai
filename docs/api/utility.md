# 🔧 工具函数

## replaceTemplateVariables

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

**类型:** 同步函数

### 参数

- **`template`** (`string`)
- **`variables`** (`Record<string`)
- **`any>`** (`any`)

### 返回值

`string, variables: Record<string, any>): string`

### 使用示例

```typescript
const result = replaceTemplateVariables('example', 'example', value);
```

---

## estimateTokenCount

计算文本token数量（估算）

/

**文件:** `ai/utils/index.ts`

**类型:** 同步函数

### 参数

- **`text`** (`string`)

### 返回值

`string): number`

### 使用示例

```typescript
const result = estimateTokenCount('example');
```

---

## formatDebugInfo

格式化调试信息

/

**文件:** `ai/utils/index.ts`

**类型:** 同步函数

### 参数

- **`info`** (`any`)

### 返回值

`any): string`

### 使用示例

```typescript
const result = formatDebugInfo(value);
```

---

## safeJsonParse

安全的JSON解析

/

**文件:** `ai/utils/index.ts`

**类型:** 同步函数

### 参数

- **`text`** (`string`)
- **`fallback`** (`any = null`)

### 返回值

`string, fallback: any = null): any`

### 使用示例

```typescript
const result = safeJsonParse('example', value);
```

---

## cleanText

清理和格式化文本

/

**文件:** `ai/utils/index.ts`

**类型:** 同步函数

### 参数

- **`text`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = cleanText('example');
```

---

## truncateText

截断文本到指定长度

/

**文件:** `ai/utils/index.ts`

**类型:** 同步函数

### 参数

- **`text`** (`string`)
- **`maxLength`** (`number`)
- **`suffix`** (`string = '...'`)

### 返回值

`string, maxLength: number, suffix: string = '...'): string`

### 使用示例

```typescript
const result = truncateText('example', 123, 'example');
```

---

## extractKeywords

提取文本中的关键词

/

**文件:** `ai/utils/index.ts`

**类型:** 同步函数

### 参数

- **`text`** (`string`)
- **`maxCount`** (`number = 10`)

### 返回值

`string, maxCount: number = 10): string[]`

### 使用示例

```typescript
const result = extractKeywords('example', 123);
```

---

## generateId

生成唯一ID

/

**文件:** `ai/utils/index.ts`

**类型:** 同步函数

### 返回值

`string`

### 使用示例

```typescript
const result = generateId();
```

---

## formatFileSize

格式化文件大小

/

**文件:** `ai/utils/index.ts`

**类型:** 同步函数

### 参数

- **`bytes`** (`number`)

### 返回值

`number): string`

### 使用示例

```typescript
const result = formatFileSize(123);
```

---

## delay

延迟函数

/

**文件:** `ai/utils/index.ts`

**类型:** 同步函数

### 参数

- **`ms`** (`number`)

### 返回值

`number): Promise<void>`

### 使用示例

```typescript
const result = delay(123);
```

---

## cn

暂无描述

**文件:** `lib/utils.ts`

**类型:** 同步函数

### 参数

- **`...inputs`** (`ClassValue[]`)

### 返回值

`ClassValue[])`

### 使用示例

```typescript
const result = cn(value);
```

---

## getOrCreateTempUserId

获取或创建临时用户ID
用于未登录用户的功能体验
/

**文件:** `lib/utils.ts`

**类型:** 同步函数

### 返回值

`string`

### 使用示例

```typescript
const result = getOrCreateTempUserId();
```

---

## validateReferrerId

验证推荐人ID格式
@param referrerId 推荐人ID
@returns 是否有效
/

**文件:** `lib/utils.ts`

**类型:** 同步函数

### 参数

- **`referrerId`** (`string`)

### 返回值

`string): boolean`

### 使用示例

```typescript
const result = validateReferrerId('example');
```

---

## hasProcessedReferral

检查是否已经处理过推荐奖励
@param referrerId 推荐人ID
@returns 是否已处理
/

**文件:** `lib/utils.ts`

**类型:** 同步函数

### 参数

- **`referrerId`** (`string`)

### 返回值

`string): boolean`

### 使用示例

```typescript
const result = hasProcessedReferral('example');
```

---

## markReferralProcessed

标记推荐奖励已处理
@param referrerId 推荐人ID
/

**文件:** `lib/utils.ts`

**类型:** 同步函数

### 参数

- **`referrerId`** (`string`)

### 返回值

`string): void`

### 使用示例

```typescript
const result = markReferralProcessed('example');
```

---

## saveReferrerFromURL

从URL参数中保存推荐人ID
@description 从URL的ref参数中提取推荐人ID并保存到本地存储
@returns 推荐人ID或null
/

**文件:** `lib/utils.ts`

**类型:** 同步函数

### 返回值

`string | null`

### 使用示例

```typescript
const result = saveReferrerFromURL();
```

---

## getReferrerId

获取保存的推荐人ID
@returns 推荐人ID或null
/

**文件:** `lib/utils.ts`

**类型:** 同步函数

### 返回值

`string | null`

### 使用示例

```typescript
const result = getReferrerId();
```

---

## clearReferrerId

清除推荐人ID
/

**文件:** `lib/utils.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = clearReferrerId();
```

---

## hasReferrerInURL

检查当前URL是否包含推荐人参数
@returns 是否包含推荐人参数
/

**文件:** `lib/utils.ts`

**类型:** 同步函数

### 返回值

`boolean`

### 使用示例

```typescript
const result = hasReferrerInURL();
```

---

## getReferrerFromURL

获取当前URL中的推荐人ID（不保存到localStorage）
@returns 推荐人ID或null
/

**文件:** `lib/utils.ts`

**类型:** 同步函数

### 返回值

`string | null`

### 使用示例

```typescript
const result = getReferrerFromURL();
```

---

## handleAuthError

便捷的错误处理函数
/

**文件:** `utils/authErrorHandler.ts`

**类型:** 同步函数

### 参数

- **`error`** (`any`)
- **`context`** (`Record<string`) - 可选
- **`any>`** (`any`)

### 返回值

`any, context?: Record<string, any>): ErrorHandlingResult`

### 使用示例

```typescript
const result = handleAuthError(value, 'example', value);
```

---

## createAuthError

创建标准化AuthError
/

**文件:** `utils/authErrorHandler.ts`

**类型:** 同步函数

### 返回值

`AuthErrorType,
  message: string,
  options: Partial<AuthError> =`

### 使用示例

```typescript
const result = createAuthError();
```

---

## getAuthingTokenHandler

获取Authing Token处理器
/

**文件:** `utils/authTokenHandler.ts`

**类型:** 同步函数

### 返回值

`AuthingTokenHandler`

### 使用示例

```typescript
const result = getAuthingTokenHandler();
```

---

## getBestRegisterUrl

智能选择最佳注册URL
/

**文件:** `utils/authingRegisterHelper.ts`

**类型:** 异步函数

### 参数

- **`config`** (`RegisterConfig`)

### 返回值

`RegisterConfig): Promise<`

### 使用示例

```typescript
const result = await getBestRegisterUrl(value);
```

---

## getRegisterUrlFast

简化版本：直接返回最可能的注册URL（无网络检测）
/

**文件:** `utils/authingRegisterHelper.ts`

**类型:** 同步函数

### 参数

- **`config`** (`RegisterConfig`)

### 返回值

`RegisterConfig): string`

### 使用示例

```typescript
const result = getRegisterUrlFast(value);
```

---

## isRealLogin

检查当前登录是否为真实登录
/

**文件:** `utils/authingRegisterHelper.ts`

**类型:** 同步函数

### 返回值

`boolean`

### 使用示例

```typescript
const result = isRealLogin();
```

---

## getLoginStatus

获取当前登录状态信息
/

**文件:** `utils/authingRegisterHelper.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = getLoginStatus();
```

---

## cleanCallbackUrl

清理和标准化回调URL
/

**文件:** `utils/callbackUrlFixer.ts`

**类型:** 同步函数

### 参数

- **`url`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = cleanCallbackUrl('example');
```

---

## extractCallbackParams

从URL中提取有效的授权码和状态
/

**文件:** `utils/callbackUrlFixer.ts`

**类型:** 同步函数

### 参数

- **`url`** (`string`)

### 返回值

`string):`

### 使用示例

```typescript
const result = extractCallbackParams('example');
```

---

## fixCurrentCallbackUrl

检查并修复当前页面的URL（如果是回调页面）
/

**文件:** `utils/callbackUrlFixer.ts`

**类型:** 同步函数

### 返回值

`boolean`

### 使用示例

```typescript
const result = fixCurrentCallbackUrl();
```

---

## mapColorToToken

将十六进制颜色转换为设计令牌
/

**文件:** `utils/colorTokenMapping.ts`

**类型:** 同步函数

### 参数

- **`hexColor`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = mapColorToToken('example');
```

---

## mapCategoryToColorToken

将分类映射到颜色令牌
/

**文件:** `utils/colorTokenMapping.ts`

**类型:** 同步函数

### 参数

- **`category`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = mapCategoryToColorToken('example');
```

---

## getSupportedColorTokens

获取所有支持的颜色令牌
/

**文件:** `utils/colorTokenMapping.ts`

**类型:** 同步函数

### 返回值

`string[]`

### 使用示例

```typescript
const result = getSupportedColorTokens();
```

---

## isHardcodedColor

检查颜色是否为硬编码值
/

**文件:** `utils/colorTokenMapping.ts`

**类型:** 同步函数

### 参数

- **`color`** (`string`)

### 返回值

`string): boolean`

### 使用示例

```typescript
const result = isHardcodedColor('example');
```

---

## getColorTokenSuggestion

获取颜色的设计令牌建议
/

**文件:** `utils/colorTokenMapping.ts`

**类型:** 同步函数

### 参数

- **`color`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = getColorTokenSuggestion('example');
```

---

## scanEnvironmentConfigs

扫描环境变量中的敏感配置
/

**文件:** `utils/configMigration.ts`

**类型:** 同步函数

### 返回值

`ConfigScanResult[]`

### 使用示例

```typescript
const result = scanEnvironmentConfigs();
```

---

## migrateConfigs

执行配置迁移
/

**文件:** `utils/configMigration.ts`

**类型:** 异步函数

### 参数

- **`configs`** (`ConfigScanResult[]`) - 可选

### 返回值

`ConfigScanResult[]): Promise<MigrationReport>`

### 使用示例

```typescript
const result = await migrateConfigs(value);
```

---

## autoMigrateOnStartup

自动迁移函数 - 在应用启动时调用
/

**文件:** `utils/configMigration.ts`

**类型:** 异步函数

### 返回值

`Promise<void>`

### 使用示例

```typescript
const result = await autoMigrateOnStartup();
```

---

## validateAllConfigs

验证所有必需的配置
@returns {ConfigValidationResult} 验证结果
/

**文件:** `utils/configValidator.ts`

**类型:** 异步函数

### 返回值

`Promise<ConfigValidationResult>`

### 使用示例

```typescript
const result = await validateAllConfigs();
```

---

## validateConfig

验证特定配置
@param configName 配置名称
@returns {boolean} 是否有效
/

**文件:** `utils/configValidator.ts`

**类型:** 同步函数

### 参数

- **`configName`** (`string`)

### 返回值

`string): boolean`

### 使用示例

```typescript
const result = validateConfig('example');
```

---

## getConfigSummary

获取配置状态摘要
@returns {string} 配置状态摘要
/

**文件:** `utils/configValidator.ts`

**类型:** 同步函数

### 返回值

`string`

### 使用示例

```typescript
const result = getConfigSummary();
```

---

## initializeConfigValidation

初始化配置验证
在应用启动时自动运行
/

**文件:** `utils/configValidator.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = initializeConfigValidation();
```

---

## enableConsoleWarningFilter

启用控制台警告过滤
/

**文件:** `utils/consoleWarningFilter.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = enableConsoleWarningFilter();
```

---

## disableConsoleWarningFilter

禁用控制台警告过滤
/

**文件:** `utils/consoleWarningFilter.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = disableConsoleWarningFilter();
```

---

## addWarningFilter

添加自定义过滤规则
/

**文件:** `utils/consoleWarningFilter.ts`

**类型:** 同步函数

### 参数

- **`pattern`** (`RegExp`)

### 返回值

`RegExp)`

### 使用示例

```typescript
const result = addWarningFilter(value);
```

---

## removeWarningFilter

移除过滤规则
/

**文件:** `utils/consoleWarningFilter.ts`

**类型:** 同步函数

### 参数

- **`pattern`** (`RegExp`)

### 返回值

`RegExp)`

### 使用示例

```typescript
const result = removeWarningFilter(value);
```

---

## cleanAIContent

AI内容清理工具
用于清理AI API响应中的多余元数据和格式字符
/

清理AI生成的内容，移除多余的元数据和格式字符
@param content - 原始AI响应内容
@returns 清理后的纯净内容
/

**文件:** `utils/contentCleaner.ts`

**类型:** 同步函数

### 参数

- **`content`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = cleanAIContent('example');
```

---

## extractCleanContent

从AI API响应中提取纯净内容
@param apiResponse - AI API的完整响应对象
@returns 提取并清理后的内容
/

**文件:** `utils/contentCleaner.ts`

**类型:** 同步函数

### 参数

- **`apiResponse`** (`any`)

### 返回值

`any): string`

### 使用示例

```typescript
const result = extractCleanContent(value);
```

---

## isValidAIContent

验证内容是否为有效的AI生成内容
@param content - 要验证的内容
@returns 是否为有效内容
/

**文件:** `utils/contentCleaner.ts`

**类型:** 同步函数

### 参数

- **`content`** (`string`)

### 返回值

`string): boolean`

### 使用示例

```typescript
const result = isValidAIContent('example');
```

---

## formatAIContentForDisplay

格式化AI内容用于显示
@param content - 原始内容
@param options - 格式化选项
@returns 格式化后的内容
/

**文件:** `utils/contentCleaner.ts`

**类型:** 同步函数

### 返回值

`string, 
  options:`

### 使用示例

```typescript
const result = formatAIContentForDisplay();
```

---

## quickCSSCheck

快速检查CSS系统
/

**文件:** `utils/cssSystemChecker.ts`

**类型:** 异步函数

### 返回值

`Promise<CSSSystemReport>`

### 使用示例

```typescript
const result = await quickCSSCheck();
```

---

## useDataStorage

React Hook: 数据存储管理
/

**文件:** `utils/dataStorageManager.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useDataStorage();
```

---

## quickMigrateUserData

快速迁移工具函数
/

**文件:** `utils/dataStorageMigration.ts`

**类型:** 异步函数

### 参数

- **`userId`** (`string`)

### 返回值

`string): Promise<MigrationResult>`

### 使用示例

```typescript
const result = await quickMigrateUserData('example');
```

---

## validateUserDataMigration

验证用户数据迁移状态
/

**文件:** `utils/dataStorageMigration.ts`

**类型:** 异步函数

### 参数

- **`userId`** (`string`)

### 返回值

`string)`

### 使用示例

```typescript
const result = await validateUserDataMigration('example');
```

---

## fixDialogPosition

强制修复Dialog定位的核心函数
/

**文件:** `utils/dialogPositionFixer.ts`

**类型:** 同步函数

### 返回值

`DialogFixOptions =`

### 使用示例

```typescript
const result = fixDialogPosition();
```

---

## startDialogPositionFix

自动Dialog定位修复启动器（纯JavaScript版本）
替代React Hook，避免React依赖问题
/

**文件:** `utils/dialogPositionFixer.ts`

**类型:** 同步函数

### 返回值

`boolean, options: DialogFixOptions =`

### 使用示例

```typescript
const result = startDialogPositionFix();
```

---

## useDialogPositionFix

React Hook包装器：在Dialog打开时自动应用定位修复
这个函数应该在React组件中使用，会自动处理React的useEffect
/

**文件:** `utils/dialogPositionFixer.ts`

**类型:** 同步函数

### 返回值

`boolean, options: DialogFixOptions =`

### 使用示例

```typescript
const result = useDialogPositionFix();
```

---

## autoFixAllDialogs

自动修复所有Dialog的定位问题（页面级修复）
/

**文件:** `utils/dialogPositionFixer.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = autoFixAllDialogs();
```

---

## logError

记录错误信息
/

**文件:** `utils/errorHandler.ts`

**类型:** 同步函数

### 参数

- **`error`** (`Error | string`)
- **`context`** (`Record<string`) - 可选
- **`any>`** (`any`)

### 返回值

`Error | string, context?: Record<string, any>): ErrorInfo`

### 使用示例

```typescript
const result = logError('example', 'example', value);
```

---

## setupGlobalErrorHandler

设置全局错误处理器
/

**文件:** `utils/errorHandler.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = setupGlobalErrorHandler();
```

---

## getUserFriendlyMessage

创建用户友好的错误消息
/

**文件:** `utils/errorHandler.ts`

**类型:** 同步函数

### 参数

- **`error`** (`Error | string`)

### 返回值

`Error | string): string`

### 使用示例

```typescript
const result = getUserFriendlyMessage('example');
```

---

## getErrorRecoverySuggestions

错误恢复建议
/

**文件:** `utils/errorHandler.ts`

**类型:** 同步函数

### 参数

- **`errorType`** (`ErrorType`)

### 返回值

`ErrorType): string[]`

### 使用示例

```typescript
const result = getErrorRecoverySuggestions(value);
```

---

## getInputValidator

获取全局输入验证器
/

**文件:** `utils/inputValidator.ts`

**类型:** 同步函数

### 返回值

`InputValidator`

### 使用示例

```typescript
const result = getInputValidator();
```

---

## fixLocalStorageArrayIssues

修复 localStorage 中的数组格式问题
/

**文件:** `utils/localStorageFixer.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = fixLocalStorageArrayIssues();
```

---

## validateAllLocalStorageData

验证所有 localStorage 数据
/

**文件:** `utils/localStorageFixer.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = validateAllLocalStorageData();
```

---

## immediateFixLocalStorage

立即执行修复
/

**文件:** `utils/localStorageFixer.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = immediateFixLocalStorage();
```

---

## getUserTier

获取用户订阅层级
/

**文件:** `utils/modelPermissions.ts`

**类型:** 同步函数

### 返回值

`SubscriptionTier`

### 使用示例

```typescript
const result = getUserTier();
```

---

## hasModelPermission

检查用户是否有权限使用指定模型
@param modelId 模型ID
@returns 是否有权限
/

**文件:** `utils/modelPermissions.ts`

**类型:** 同步函数

### 参数

- **`modelId`** (`string`)

### 返回值

`string): boolean`

### 使用示例

```typescript
const result = hasModelPermission('example');
```

---

## getModelPermissionInfo

获取模型权限信息
@param modelId 模型ID
@returns 权限信息
/

**文件:** `utils/modelPermissions.ts`

**类型:** 同步函数

### 参数

- **`modelId`** (`string`)

### 返回值

`string)`

### 使用示例

```typescript
const result = getModelPermissionInfo('example');
```

---

## getAvailableModelIds

获取所有可用模型列表（基于用户权限）
@returns 可用模型ID列表
/

**文件:** `utils/modelPermissions.ts`

**类型:** 同步函数

### 返回值

`string[]`

### 使用示例

```typescript
const result = getAvailableModelIds();
```

---

## getUpgradeRecommendation

检查是否需要升级以使用某个模型
@param modelId 模型ID
@returns 升级建议信息
/

**文件:** `utils/modelPermissions.ts`

**类型:** 同步函数

### 参数

- **`modelId`** (`string`)

### 返回值

`string)`

### 使用示例

```typescript
const result = getUpgradeRecommendation('example');
```

---

## hasModelTierPermission

检查特定模型类型权限
@param tier AI模型等级 ('low' | 'mid' | 'high')
@returns 是否有权限
/

**文件:** `utils/modelPermissions.ts`

**类型:** 同步函数

### 参数

- **`tier`** (`'low' | 'mid' | 'high'`)

### 返回值

`'low' | 'mid' | 'high'): boolean`

### 使用示例

```typescript
const result = hasModelTierPermission(value);
```

---

## batchCheckModelPermissions

批量检查模型权限
@param modelIds 模型ID列表
@returns 权限结果映射
/

**文件:** `utils/modelPermissions.ts`

**类型:** 同步函数

### 参数

- **`modelIds`** (`string[]`)

### 返回值

`string[]): Record<string, boolean>`

### 使用示例

```typescript
const result = batchCheckModelPermissions('example');
```

---

## validatePassword

验证密码是否符合安全策略
/

**文件:** `utils/passwordSecurity.ts`

**类型:** 同步函数

### 参数

- **`password`** (`string`)
- **`policy`** (`PasswordPolicy = DEFAULT_PASSWORD_POLICY`)

### 返回值

`string, policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY): PasswordStrength`

### 使用示例

```typescript
const result = validatePassword('example', value);
```

---

## getPasswordStrengthDisplay

生成密码强度可视化信息
/

**文件:** `utils/passwordSecurity.ts`

**类型:** 同步函数

### 参数

- **`strength`** (`PasswordStrength`)

### 返回值

`PasswordStrength)`

### 使用示例

```typescript
const result = getPasswordStrengthDisplay(value);
```

---

## generatePasswordSuggestion

密码安全建议生成器
/

**文件:** `utils/passwordSecurity.ts`

**类型:** 同步函数

### 返回值

`string`

### 使用示例

```typescript
const result = generatePasswordSuggestion();
```

---

## createPasswordValidator

实时密码强度检查Hook辅助函数
/

**文件:** `utils/passwordSecurity.ts`

**类型:** 同步函数

### 参数

- **`policy`** (`Partial<PasswordPolicy>`) - 可选

### 返回值

`Partial<PasswordPolicy>)`

### 使用示例

```typescript
const result = createPasswordValidator(value);
```

---

## getPaymentCenterAccessTime

获取支付中心访问时间
如果用户是第一次访问支付中心，记录当前时间作为优惠开始时间
@param userId 用户ID
@returns 支付中心访问时间
/

**文件:** `utils/paymentTimer.ts`

**类型:** 同步函数

### 参数

- **`userId`** (`string`) - 可选

### 返回值

`string): Date | undefined`

### 使用示例

```typescript
const result = getPaymentCenterAccessTime('example');
```

---

## isInPromoPeriod

检查是否在限时优惠期内
@param userId 用户ID
@returns 是否在优惠期内
/

**文件:** `utils/paymentTimer.ts`

**类型:** 同步函数

### 参数

- **`userId`** (`string`) - 可选

### 返回值

`string): boolean`

### 使用示例

```typescript
const result = isInPromoPeriod('example');
```

---

## shouldShowPromoOffer

检查是否应该显示限时优惠（考虑订阅状态）
@param userId 用户ID
@returns Promise<boolean> 是否应该显示优惠
/

**文件:** `utils/paymentTimer.ts`

**类型:** 异步函数

### 参数

- **`userId`** (`string`) - 可选

### 返回值

`string): Promise<boolean>`

### 使用示例

```typescript
const result = await shouldShowPromoOffer('example');
```

---

## calculateRemainingTime

计算剩余优惠时间
@param userId 用户ID
@returns 剩余时间（毫秒）
/

**文件:** `utils/paymentTimer.ts`

**类型:** 同步函数

### 参数

- **`userId`** (`string`) - 可选

### 返回值

`string): number`

### 使用示例

```typescript
const result = calculateRemainingTime('example');
```

---

## formatTimeLeft

格式化倒计时显示
@param timeLeft 剩余时间（毫秒）
@returns 格式化的倒计时字符串
/

**文件:** `utils/paymentTimer.ts`

**类型:** 同步函数

### 参数

- **`timeLeft`** (`number`)

### 返回值

`number): string`

### 使用示例

```typescript
const result = formatTimeLeft(123);
```

---

## resetPaymentCenterAccessTime

重置支付中心访问时间
用于测试或重新开始计时
@param userId 用户ID
/

**文件:** `utils/paymentTimer.ts`

**类型:** 同步函数

### 参数

- **`userId`** (`string`) - 可选

### 返回值

`string): void`

### 使用示例

```typescript
const result = resetPaymentCenterAccessTime('example');
```

---

## getPromoStatus

获取优惠状态信息
@param userId 用户ID
@returns 优惠状态信息
/

**文件:** `utils/paymentTimer.ts`

**类型:** 同步函数

### 参数

- **`userId`** (`string`) - 可选

### 返回值

`string):`

### 使用示例

```typescript
const result = getPromoStatus('example');
```

---

## generateMD5

生成 MD5 签名
/

**文件:** `utils/paymentUtils.ts`

**类型:** 同步函数

### 参数

- **`text`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = generateMD5('example');
```

---

## generatePaymentSign

生成支付签名
/

**文件:** `utils/paymentUtils.ts`

**类型:** 同步函数

### 参数

- **`name`** (`string`)
- **`payType`** (`string`)
- **`price`** (`string`)
- **`orderId`** (`string`)
- **`orderUid`** (`string`)
- **`notifyUrl`** (`string`)
- **`returnUrl`** (`string`)
- **`feedbackUrl`** (`string = ''`)

### 返回值

`string,
  payType: string,
  price: string,
  orderId: string,
  orderUid: string,
  notifyUrl: string,
  returnUrl: string,
  feedbackUrl: string = ''
): string`

### 使用示例

```typescript
const result = generatePaymentSign('example', 'example', 'example', 'example', 'example', 'example', 'example', 'example');
```

---

## verifyNotifySign

验证回调签名
/

**文件:** `utils/paymentUtils.ts`

**类型:** 同步函数

### 参数

- **`aoid`** (`string`)
- **`orderId`** (`string`)
- **`orderUid`** (`string`)
- **`price`** (`string`)
- **`payPrice`** (`string`)
- **`sign`** (`string`)

### 返回值

`string,
  orderId: string,
  orderUid: string,
  price: string,
  payPrice: string,
  sign: string
): boolean`

### 使用示例

```typescript
const result = verifyNotifySign('example', 'example', 'example', 'example', 'example', 'example');
```

---

## generateOrderId

生成订单号
/

**文件:** `utils/paymentUtils.ts`

**类型:** 同步函数

### 返回值

`string`

### 使用示例

```typescript
const result = generateOrderId();
```

---

## formatAmount

格式化金额
/

**文件:** `utils/paymentUtils.ts`

**类型:** 同步函数

### 参数

- **`amount`** (`number`)

### 返回值

`number): string`

### 使用示例

```typescript
const result = formatAmount(123);
```

---

## parseProductInfo

解析产品信息
/

**文件:** `utils/paymentUtils.ts`

**类型:** 同步函数

### 参数

- **`productType`** (`string`)
- **`durationType`** (`string`)

### 返回值

`string, durationType: string)`

### 使用示例

```typescript
const result = parseProductInfo('example', 'example');
```

---

## calculateExpiryDate

计算订阅到期时间
/

**文件:** `utils/paymentUtils.ts`

**类型:** 同步函数

### 参数

- **`durationType`** (`'monthly' | 'yearly'`)
- **`startDate`** (`Date`) - 可选

### 返回值

`'monthly' | 'yearly', startDate?: Date): Date`

### 使用示例

```typescript
const result = calculateExpiryDate(value, value);
```

---

## isSubscriptionValid

检查订阅是否有效
/

**文件:** `utils/paymentUtils.ts`

**类型:** 同步函数

### 参数

- **`expiresAt`** (`string`)

### 返回值

`string): boolean`

### 使用示例

```typescript
const result = isSubscriptionValid('example');
```

---

## getUserPermissionLevel

获取用户权限等级
/

**文件:** `utils/paymentUtils.ts`

**类型:** 同步函数

### 参数

- **`subscriptionType`** (`string`) - 可选

### 返回值

`string): 'basic' | 'professional' | 'premium'`

### 使用示例

```typescript
const result = getUserPermissionLevel('example');
```

---

## formatPaymentError

格式化支付错误信息
/

**文件:** `utils/paymentUtils.ts`

**类型:** 同步函数

### 参数

- **`status`** (`string`)
- **`info`** (`string`) - 可选

### 返回值

`string, info?: string): string`

### 使用示例

```typescript
const result = formatPaymentError('example', 'example');
```

---

## generatePaymentFormData

生成支付表单数据
/

**文件:** `utils/paymentUtils.ts`

**类型:** 同步函数

### 参数

- **`name`** (`string`)
- **`payType`** (`string`)
- **`price`** (`number`)
- **`orderId`** (`string`)
- **`orderUid`** (`string`)

### 返回值

`string,
  payType: string,
  price: number,
  orderId: string,
  orderUid: string
): URLSearchParams`

### 使用示例

```typescript
const result = generatePaymentFormData('example', 'example', 123, 'example', 'example');
```

---

## needsManualAmount

检查支付二维码是否需要用户输入金额
/

**文件:** `utils/paymentUtils.ts`

**类型:** 同步函数

### 参数

- **`qrPrice`** (`string | undefined`)

### 返回值

`string | undefined): boolean`

### 使用示例

```typescript
const result = needsManualAmount('example');
```

---

## formatCountdown

格式化倒计时显示
/

**文件:** `utils/paymentUtils.ts`

**类型:** 同步函数

### 参数

- **`seconds`** (`number`)

### 返回值

`number): string`

### 使用示例

```typescript
const result = formatCountdown(123);
```

---

## generateFeedbackEmail

生成支付反馈邮件内容
/

**文件:** `utils/paymentUtils.ts`

**类型:** 同步函数

### 参数

- **`orderId`** (`string`)
- **`amount`** (`number`)
- **`description`** (`string`)

### 返回值

`string, amount: number, description: string): string`

### 使用示例

```typescript
const result = generateFeedbackEmail('example', 123, 'example');
```

---

## getPlatformName

获取平台名称
/

**文件:** `utils/platformUtils.ts`

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

获取平台推荐字符数
/

**文件:** `utils/platformUtils.ts`

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

获取平台最大字符数
/

**文件:** `utils/platformUtils.ts`

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

获取平台描述
/

**文件:** `utils/platformUtils.ts`

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

## getPlatformIcon

获取平台图标
/

**文件:** `utils/platformUtils.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string): JSX.Element`

### 使用示例

```typescript
const result = getPlatformIcon('example');
```

---

## calculateSafetyRange

计算安全范围
/

**文件:** `utils/platformUtils.ts`

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

计算最优字符数
/

**文件:** `utils/platformUtils.ts`

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

## getPlatformCharacteristics

获取平台特色和差异化要求
/

**文件:** `utils/platformUtils.ts`

**类型:** 同步函数

### 参数

- **`platform`** (`string`)

### 返回值

`string):`

### 使用示例

```typescript
const result = getPlatformCharacteristics('example');
```

---

## getPlatformTimeoutConfig

获取平台超时配置
/

**文件:** `utils/platformUtils.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string)`

### 使用示例

```typescript
const result = getPlatformTimeoutConfig('example');
```

---

## validateContentCharCount

验证内容字符数
/

**文件:** `utils/platformUtils.ts`

**类型:** 同步函数

### 参数

- **`content`** (`string`)
- **`platformId`** (`string`)
- **`userSetLimit`** (`number`)

### 返回值

`string,
  platformId: string,
  userSetLimit: number
):`

### 使用示例

```typescript
const result = validateContentCharCount('example', 'example', 123);
```

---

## safeProductionString

生产环境安全字符串处理函数
/

**文件:** `utils/productionEnvChecker.ts`

**类型:** 同步函数

### 参数

- **`value`** (`any`)
- **`fallback`** (`string = ''`)

### 返回值

`any, fallback: string = ''): string`

### 使用示例

```typescript
const result = safeProductionString(value, 'example');
```

---

## safeProductionUserInfo

生产环境用户信息安全处理
/

**文件:** `utils/productionEnvChecker.ts`

**类型:** 同步函数

### 参数

- **`user`** (`any`)

### 返回值

`any): any`

### 使用示例

```typescript
const result = safeProductionUserInfo(value);
```

---

## calculateProratedUpgrade

计算补差价升级
/

**文件:** `utils/proratedUpgradeUtils.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = calculateProratedUpgrade();
```

---

## formatUpgradeMessage

格式化升级提示文案
/

**文件:** `utils/proratedUpgradeUtils.ts`

**类型:** 同步函数

### 参数

- **`calculation`** (`ProratedUpgradeCalculation`)

### 返回值

`ProratedUpgradeCalculation): string`

### 使用示例

```typescript
const result = formatUpgradeMessage(value);
```

---

## validateUpgradeCalculation

验证升级计算结果
/

**文件:** `utils/proratedUpgradeUtils.ts`

**类型:** 同步函数

### 参数

- **`calculation`** (`ProratedUpgradeCalculation`)

### 返回值

`ProratedUpgradeCalculation): boolean`

### 使用示例

```typescript
const result = validateUpgradeCalculation(value);
```

---

## safeSaveToLocalStorage

安全保存数据到localStorage
/

**文件:** `utils/safeDataStorage.ts`

**类型:** 同步函数

### 参数

- **`key`** (`string`)
- **`data`** (`any`)

### 返回值

`string, data: any): SaveResult`

### 使用示例

```typescript
const result = safeSaveToLocalStorage('example', value);
```

---

## getLocalStorageUsage

获取localStorage使用情况
/

**文件:** `utils/safeDataStorage.ts`

**类型:** 同步函数

### 返回值

`number`

### 使用示例

```typescript
const result = getLocalStorageUsage();
```

---

## checkLocalStorageAvailability

检查localStorage可用性
/

**文件:** `utils/safeDataStorage.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = checkLocalStorageAvailability();
```

---

## cleanupLocalStorageData

清理过期或损坏的数据
/

**文件:** `utils/safeDataStorage.ts`

**类型:** 同步函数

### 参数

- **`prefix`** (`string`) - 可选

### 返回值

`string): number`

### 使用示例

```typescript
const result = cleanupLocalStorageData('example');
```

---

## backupLocalStorageData

创建备份数据
/

**文件:** `utils/safeDataStorage.ts`

**类型:** 同步函数

### 参数

- **`keys`** (`string[]`)

### 返回值

`string[]):`

### 使用示例

```typescript
const result = backupLocalStorageData('example');
```

---

## restoreLocalStorageData

从备份恢复数据
/

**文件:** `utils/safeDataStorage.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = restoreLocalStorageData();
```

---

## safeTemplate

安全的模板字符串构建器
防止模板字符串中的undefined拼接
/

**文件:** `utils/safeStringUtils.ts`

**类型:** 同步函数

### 参数

- **`template`** (`string`)
- **`values`** (`Record<string`)
- **`any>`** (`any`)
- **`fallback = 'unknown'`** (`any`)

### 返回值

`string, values: Record<string, any>, fallback = 'unknown'): string`

### 使用示例

```typescript
const result = safeTemplate('example', 'example', value, value);
```

---

## safeUserProperty

安全的用户属性获取器
支持深层属性访问和多个fallback
/

**文件:** `utils/safeStringUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`SafeUser | null | undefined`)
- **`path`** (`string`)
- **`fallback = ''`** (`any`)

### 返回值

`SafeUser | null | undefined, 
  path: string, 
  fallback = ''
): string`

### 使用示例

```typescript
const result = safeUserProperty(value, 'example', value);
```

---

## safeUserDisplayName

安全的用户显示名称（增强版）
支持多种fallback策略
/

**文件:** `utils/safeStringUtils.ts`

**类型:** 同步函数

### 返回值

`SafeUser | null | undefined,
  options:`

### 使用示例

```typescript
const result = safeUserDisplayName();
```

---

## safeJsxProp

安全的JSX属性值生成器
/

**文件:** `utils/safeStringUtils.ts`

**类型:** 同步函数

### 参数

- **`value`** (`any`)
- **`fallback = ''`** (`any`)

### 返回值

`any, fallback = ''): string`

### 使用示例

```typescript
const result = safeJsxProp(value, value);
```

---

## safeAltText

安全的alt文本生成器
/

**文件:** `utils/safeStringUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`SafeUser | null | undefined`)
- **`context`** (`string`)
- **`fallback = '用户头像'`** (`any`)

### 返回值

`SafeUser | null | undefined,
  context: string,
  fallback = '用户头像'
): string`

### 使用示例

```typescript
const result = safeAltText(value, 'example', value);
```

---

## detectUndefinedConcat

运行时undefined检测器
在开发环境中检测可能的undefined拼接
/

**文件:** `utils/safeStringUtils.ts`

**类型:** 同步函数

### 参数

- **`value`** (`any`)
- **`context = ''`** (`any`)

### 返回值

`any, context = ''): string`

### 使用示例

```typescript
const result = detectUndefinedConcat(value, value);
```

---

## safeString

通用安全字符串处理器
/

**文件:** `utils/safeStringUtils.ts`

**类型:** 同步函数

### 返回值

`any,
  options: SafeStringOptions =`

### 使用示例

```typescript
const result = safeString();
```

---

## safeTrimTitle

✅ V3.3 安全标题裁剪函数 - 增强版
🎯 专门处理语义完整性，避免残词和未闭合表达，增加语序异常检测
@param title 原始标题
@param maxLength 最大字符数
@returns 裁剪后的标题
/

**文件:** `utils/safeTrimTitle.ts`

**类型:** 同步函数

### 参数

- **`title`** (`string`)
- **`maxLength`** (`number`)

### 返回值

`string, maxLength: number): string`

### 使用示例

```typescript
const result = safeTrimTitle('example', 123);
```

---

## getSecureConfigManager

获取全局安全配置管理器实例
/

**文件:** `utils/secureConfigManager.ts`

**类型:** 同步函数

### 返回值

`SecureConfigManager`

### 使用示例

```typescript
const result = getSecureConfigManager();
```

---

## getSessionManager

获取全局会话管理器
/

**文件:** `utils/sessionManager.ts`

**类型:** 同步函数

### 返回值

`SessionManager`

### 使用示例

```typescript
const result = getSessionManager();
```

---

## calculateSubscriptionStatus

计算订阅状态
/

**文件:** `utils/subscriptionStatusUtils.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = calculateSubscriptionStatus();
```

---

## formatExpiryDisplay

格式化到期时间显示
/

**文件:** `utils/subscriptionStatusUtils.ts`

**类型:** 同步函数

### 参数

- **`expiresAt`** (`Date | null`)

### 返回值

`Date | null): string`

### 使用示例

```typescript
const result = formatExpiryDisplay(value);
```

---

## getStatusIcon

获取状态图标
/

**文件:** `utils/subscriptionStatusUtils.ts`

**类型:** 同步函数

### 参数

- **`status`** (`SubscriptionStatus['status']`)

### 返回值

`SubscriptionStatus['status']): string`

### 使用示例

```typescript
const result = getStatusIcon(value);
```

---

## adaptAuthUser

类型适配器：将认证系统的AuthUser转换为订阅工具期望的格式

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`AuthSystemUser | null`)

### 返回值

`AuthSystemUser | null): AuthUser | null`

### 使用示例

```typescript
const result = adaptAuthUser(value);
```

---

## getUserTier

获取用户当前订阅等级
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`AuthUser | AuthSystemUser | null | undefined`)

### 返回值

`AuthUser | AuthSystemUser | null | undefined): SubscriptionTier`

### 使用示例

```typescript
const result = getUserTier(value);
```

---

## hasPermission

检查用户是否有指定等级的权限
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`AuthUser | AuthSystemUser | null | undefined`)
- **`requiredTier`** (`SubscriptionTier`)

### 返回值

`AuthUser | AuthSystemUser | null | undefined, requiredTier: SubscriptionTier): boolean`

### 使用示例

```typescript
const result = hasPermission(value, value);
```

---

## hasFeatureAccess

检查用户是否有指定功能的权限
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`AuthUser | null | undefined`)
- **`feature`** (`string`)

### 返回值

`AuthUser | null | undefined, feature: string): boolean`

### 使用示例

```typescript
const result = hasFeatureAccess(value, 'example');
```

---

## getTierDisplayName

获取等级显示名称
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`tier`** (`SubscriptionTier`)

### 返回值

`SubscriptionTier): string`

### 使用示例

```typescript
const result = getTierDisplayName(value);
```

---

## getTierWeight

获取等级权重
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`tier`** (`SubscriptionTier`)

### 返回值

`SubscriptionTier): number`

### 使用示例

```typescript
const result = getTierWeight(value);
```

---

## getTierColor

获取等级颜色（向后兼容）
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`tier`** (`SubscriptionTier`)

### 返回值

`SubscriptionTier): string`

### 使用示例

```typescript
const result = getTierColor(value);
```

---

## compareTiers

比较两个等级的高低
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`tier1`** (`SubscriptionTier`)
- **`tier2`** (`SubscriptionTier`)

### 返回值

`SubscriptionTier, tier2: SubscriptionTier): number`

### 使用示例

```typescript
const result = compareTiers(value, value);
```

---

## isSubscriptionActive

检查订阅是否有效
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`AuthUser | null | undefined`)

### 返回值

`AuthUser | null | undefined): boolean`

### 使用示例

```typescript
const result = isSubscriptionActive(value);
```

---

## getSubscriptionDaysLeft

获取订阅剩余天数
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`AuthUser | null | undefined`)

### 返回值

`AuthUser | null | undefined): number | null`

### 使用示例

```typescript
const result = getSubscriptionDaysLeft(value);
```

---

## needsUpgrade

检查是否需要升级
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`AuthUser | null | undefined`)
- **`requiredTier`** (`SubscriptionTier`)

### 返回值

`AuthUser | null | undefined, requiredTier: SubscriptionTier): boolean`

### 使用示例

```typescript
const result = needsUpgrade(value, value);
```

---

## getUpgradeSuggestion

获取升级建议
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`AuthUser | null | undefined`)
- **`requiredTier`** (`SubscriptionTier`)

### 返回值

`AuthUser | null | undefined, requiredTier: SubscriptionTier):`

### 使用示例

```typescript
const result = getUpgradeSuggestion(value, value);
```

---

## getTierFeatures

获取等级功能列表
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`tier`** (`SubscriptionTier`)

### 返回值

`SubscriptionTier): string[]`

### 使用示例

```typescript
const result = getTierFeatures(value);
```

---

## getAllTiers

获取所有等级信息
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 返回值

`Array<`

### 使用示例

```typescript
const result = getAllTiers();
```

---

## mockUserSubscription

模拟用户订阅数据（开发环境使用）
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`tier`** (`SubscriptionTier = 'trial'`)

### 返回值

`SubscriptionTier = 'trial'): UserSubscription`

### 使用示例

```typescript
const result = mockUserSubscription(value);
```

---

## isFeatureAvailableInTier

检查功能是否在指定等级中可用
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`feature`** (`string`)
- **`tier`** (`SubscriptionTier`)

### 返回值

`string, tier: SubscriptionTier): boolean`

### 使用示例

```typescript
const result = isFeatureAvailableInTier('example', value);
```

---

## getFeatureMinimumTier

获取功能所需的最低等级
/

**文件:** `utils/subscriptionUtils.ts`

**类型:** 同步函数

### 参数

- **`feature`** (`string`)

### 返回值

`string): SubscriptionTier | null`

### 使用示例

```typescript
const result = getFeatureMinimumTier('example');
```

---

## getPlatformLimit

获取平台字符限制
@param platformId 平台ID
@returns 字符限制
/

**文件:** `utils/titleGenerationUtils.ts`

**类型:** 同步函数

### 参数

- **`platformId`** (`string`)

### 返回值

`string): number`

### 使用示例

```typescript
const result = getPlatformLimit('example');
```

---

## validateTitle

验证单个标题
/

**文件:** `utils/titleGeneratorValidator.ts`

**类型:** 同步函数

### 参数

- **`title`** (`string`)

### 返回值

`string):`

### 使用示例

```typescript
const result = validateTitle('example');
```

---

## validateTitles

批量验证标题
/

**文件:** `utils/titleGeneratorValidator.ts`

**类型:** 同步函数

### 参数

- **`titles`** (`string[]`)

### 返回值

`string[]):`

### 使用示例

```typescript
const result = validateTitles('example');
```

---

## generateTestReport

生成测试报告
/

**文件:** `utils/titleGeneratorValidator.ts`

**类型:** 同步函数

### 参数

- **`validationResults`** (`ReturnType<typeof validateTitles>`)

### 返回值

`ReturnType<typeof validateTitles>): string`

### 使用示例

```typescript
const result = generateTestReport(value);
```

---

## getTokenManager

获取全局Token管理器
/

**文件:** `utils/tokenManager.ts`

**类型:** 同步函数

### 返回值

`TokenManager`

### 使用示例

```typescript
const result = getTokenManager();
```

---

## formatRemainingUses

格式化剩余次数显示
@param remainingUses 剩余次数 (-1表示无限制)
@param tier 订阅级别
@returns 格式化后的显示文本
/

**文件:** `utils/usageDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`remainingUses`** (`number`)
- **`tier`** (`SubscriptionTier`) - 可选

### 返回值

`number, tier?: SubscriptionTier): string`

### 使用示例

```typescript
const result = formatRemainingUses(123, value);
```

---

## formatAvailableUses

格式化可用次数显示
@param availableUses 可用总次数 (-1表示无限制)
@param tier 订阅级别
@returns 格式化后的显示文本
/

**文件:** `utils/usageDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`availableUses`** (`number`)
- **`tier`** (`SubscriptionTier`) - 可选

### 返回值

`number, tier?: SubscriptionTier): string`

### 使用示例

```typescript
const result = formatAvailableUses(123, value);
```

---

## formatUsageDisplay

格式化使用量显示文本
@param usedCount 已使用次数
@param availableUses 可用总次数 (-1表示无限制)
@param tier 订阅级别
@returns 格式化后的显示文本，如 "5 / ∞" 或 "5 / 10"
/

**文件:** `utils/usageDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`usedCount`** (`number`)
- **`availableUses`** (`number`)
- **`tier`** (`SubscriptionTier`) - 可选

### 返回值

`number, availableUses: number, tier?: SubscriptionTier): string`

### 使用示例

```typescript
const result = formatUsageDisplay(123, 123, value);
```

---

## calculateUsagePercentage

计算使用百分比
@param usedCount 已使用次数
@param availableUses 可用总次数 (-1表示无限制)
@param tier 订阅级别
@returns 使用百分比 (0-100)，无限制情况返回0
/

**文件:** `utils/usageDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`usedCount`** (`number`)
- **`availableUses`** (`number`)
- **`tier`** (`SubscriptionTier`) - 可选

### 返回值

`number, availableUses: number, tier?: SubscriptionTier): number`

### 使用示例

```typescript
const result = calculateUsagePercentage(123, 123, value);
```

---

## shouldShowProgressBar

检查是否应该显示进度条
@param availableUses 可用总次数 (-1表示无限制)
@param tier 订阅级别
@returns 是否显示进度条
/

**文件:** `utils/usageDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`availableUses`** (`number`)
- **`tier`** (`SubscriptionTier`) - 可选

### 返回值

`number, tier?: SubscriptionTier): boolean`

### 使用示例

```typescript
const result = shouldShowProgressBar(123, value);
```

---

## getUsageStatusColor

获取使用状态的颜色类
@param usedCount 已使用次数
@param availableUses 可用总次数 (-1表示无限制)
@param tier 订阅级别
@returns CSS颜色类名
/

**文件:** `utils/usageDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`usedCount`** (`number`)
- **`availableUses`** (`number`)
- **`tier`** (`SubscriptionTier`) - 可选

### 返回值

`number, availableUses: number, tier?: SubscriptionTier): string`

### 使用示例

```typescript
const result = getUsageStatusColor(123, 123, value);
```

---

## getProgressBarColor

获取使用状态的进度条颜色
@param usedCount 已使用次数
@param availableUses 可用总次数 (-1表示无限制)
@param tier 订阅级别
@returns 进度条颜色类名
/

**文件:** `utils/usageDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`usedCount`** (`number`)
- **`availableUses`** (`number`)
- **`tier`** (`SubscriptionTier`) - 可选

### 返回值

`number, availableUses: number, tier?: SubscriptionTier): string`

### 使用示例

```typescript
const result = getProgressBarColor(123, 123, value);
```

---

## getTierDefaultLimit

获取套餐对应的默认限额
@param tier 订阅级别
@returns 默认使用限额
🔧 FIX: 与subscriptionPlans.ts中的adaptUsageLimit保持一致
使用静态配置避免循环依赖问题
/

**文件:** `utils/usageDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`tier`** (`SubscriptionTier`)

### 返回值

`SubscriptionTier): number`

### 使用示例

```typescript
const result = getTierDefaultLimit(value);
```

---

## formatTierName

格式化套餐名称
@param tier 订阅级别
@returns 中文套餐名称
/

**文件:** `utils/usageDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`tier`** (`SubscriptionTier`)

### 返回值

`SubscriptionTier): string`

### 使用示例

```typescript
const result = formatTierName(value);
```

---

## shouldShowUpgradePrompt

检查是否需要升级提示
@param usedCount 已使用次数
@param availableUses 可用总次数 (-1表示无限制)
@param tier 订阅级别
@returns 是否需要升级提示
/

**文件:** `utils/usageDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`usedCount`** (`number`)
- **`availableUses`** (`number`)
- **`tier`** (`SubscriptionTier`) - 可选

### 返回值

`number, availableUses: number, tier?: SubscriptionTier): boolean`

### 使用示例

```typescript
const result = shouldShowUpgradePrompt(123, 123, value);
```

---

## useUserDataIsolation

React Hook: 用户数据隔离
/

**文件:** `utils/userDataIsolation.ts`

**类型:** 同步函数

### 参数

- **`config`** (`UserDataIsolationConfig`)

### 返回值

`UserDataIsolationConfig)`

### 使用示例

```typescript
const result = useUserDataIsolation(value);
```

---

## generateStorageKey

工具函数：生成存储键
/

**文件:** `utils/userDataIsolation.ts`

**类型:** 同步函数

### 参数

- **`modulePrefix`** (`string`)
- **`user`** (`any`) - 可选

### 返回值

`string, user?: any): string`

### 使用示例

```typescript
const result = generateStorageKey('example', value);
```

---

## migrateUserData

工具函数：批量迁移数据
/

**文件:** `utils/userDataIsolation.ts`

**类型:** 同步函数

### 参数

- **`oldKey`** (`string`)
- **`newKey`** (`string`)

### 返回值

`string, newKey: string): boolean`

### 使用示例

```typescript
const result = migrateUserData('example', 'example');
```

---

## cleanupUserData

工具函数：清理用户数据
/

**文件:** `utils/userDataIsolation.ts`

**类型:** 同步函数

### 参数

- **`userId`** (`string`)

### 返回值

`string): number`

### 使用示例

```typescript
const result = cleanupUserData('example');
```

---

## getUserDataStats

工具函数：获取所有用户的数据统计
/

**文件:** `utils/userDataIsolation.ts`

**类型:** 同步函数

### 返回值

`Record<string, number>`

### 使用示例

```typescript
const result = getUserDataStats();
```

---

## normalizeUser

快捷标准化函数
/

**文件:** `utils/userDataNormalizer.ts`

**类型:** 同步函数

### 参数

- **`rawData`** (`RawUserData`)

### 返回值

`RawUserData): SafeUser`

### 使用示例

```typescript
const result = normalizeUser(value);
```

---

## normalizeUsers

快捷批量标准化函数
/

**文件:** `utils/userDataNormalizer.ts`

**类型:** 同步函数

### 参数

- **`rawDataArray`** (`RawUserData[]`)

### 返回值

`RawUserData[]): SafeUser[]`

### 使用示例

```typescript
const result = normalizeUsers(value);
```

---

## getUserDisplayName

获取用户显示名称
优先级：nickname > username > email > 默认值

@param user 用户对象
@param fallback 默认值，默认为 '访客'
@returns 安全的用户显示名称
/

**文件:** `utils/userDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`UserInfo | null`) - 可选
- **`fallback`** (`string = '访客'`)

### 返回值

`UserInfo | null, fallback: string = '访客'): string`

### 使用示例

```typescript
const result = getUserDisplayName(value, 'example');
```

---

## getUserAvatar

获取用户头像URL
优先级：avatar > photo > 生成默认头像

@param user 用户对象
@returns 安全的头像URL
/

**文件:** `utils/userDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`UserInfo | null`) - 可选

### 返回值

`UserInfo | null): string`

### 使用示例

```typescript
const result = getUserAvatar(value);
```

---

## getUserAvatarFallback

获取用户头像fallback文字（首字母）
优先级：nickname首字母 > username首字母 > email首字母 > 默认字母

@param user 用户对象
@param fallback 默认字母，默认为 'U'
@returns 安全的头像fallback文字
/

**文件:** `utils/userDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`UserInfo | null`) - 可选
- **`fallback`** (`string = 'U'`)

### 返回值

`UserInfo | null, fallback: string = 'U'): string`

### 使用示例

```typescript
const result = getUserAvatarFallback(value, 'example');
```

---

## getUserEmail

获取用户邮箱

@param user 用户对象
@param fallback 默认值，默认为空字符串
@returns 安全的邮箱地址
/

**文件:** `utils/userDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`UserInfo | null`) - 可选
- **`fallback`** (`string = ''`)

### 返回值

`UserInfo | null, fallback: string = ''): string`

### 使用示例

```typescript
const result = getUserEmail(value, 'example');
```

---

## getUserPhone

获取用户手机号

@param user 用户对象
@param fallback 默认值，默认为空字符串
@returns 安全的手机号
/

**文件:** `utils/userDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`UserInfo | null`) - 可选
- **`fallback`** (`string = ''`)

### 返回值

`UserInfo | null, fallback: string = ''): string`

### 使用示例

```typescript
const result = getUserPhone(value, 'example');
```

---

## getUserId

获取用户ID

@param user 用户对象
@param fallback 默认值，默认为空字符串
@returns 安全的用户ID
/

**文件:** `utils/userDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`UserInfo | null`) - 可选
- **`fallback`** (`string = ''`)

### 返回值

`UserInfo | null, fallback: string = ''): string`

### 使用示例

```typescript
const result = getUserId(value, 'example');
```

---

## getUserUsername

获取用户用户名

@param user 用户对象
@param fallback 默认值，默认为空字符串
@returns 安全的用户名
/

**文件:** `utils/userDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`UserInfo | null`) - 可选
- **`fallback`** (`string = ''`)

### 返回值

`UserInfo | null, fallback: string = ''): string`

### 使用示例

```typescript
const result = getUserUsername(value, 'example');
```

---

## getUserAltText

获取安全的alt文本（用于图片）

@param user 用户对象
@param context 上下文描述，如 '头像'、'用户照片' 等
@returns 安全的alt文本
/

**文件:** `utils/userDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`UserInfo | null`) - 可选
- **`context`** (`string = '头像'`)

### 返回值

`UserInfo | null, context: string = '头像'): string`

### 使用示例

```typescript
const result = getUserAltText(value, 'example');
```

---

## getUserPlaceholder

获取安全的placeholder文本

@param fieldName 字段名称，如 'nickname'、'email' 等
@returns 安全的placeholder文本
/

**文件:** `utils/userDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`fieldName`** (`string`)

### 返回值

`string): string`

### 使用示例

```typescript
const result = getUserPlaceholder('example');
```

---

## isUserInfoComplete

检查用户信息是否完整

@param user 用户对象
@param requiredFields 必需字段列表
@returns 是否完整
/

**文件:** `utils/userDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`UserInfo | null`) - 可选
- **`requiredFields`** (`string[] = ['nickname'`)
- **`'email']`** (`any`)

### 返回值

`UserInfo | null, requiredFields: string[] = ['nickname', 'email']): boolean`

### 使用示例

```typescript
const result = isUserInfoComplete(value, 'example', value);
```

---

## formatUserForDisplay

格式化用户信息用于显示

@param user 用户对象
@returns 格式化后的用户信息对象
/

**文件:** `utils/userDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`UserInfo | null`) - 可选

### 返回值

`UserInfo | null)`

### 使用示例

```typescript
const result = formatUserForDisplay(value);
```

---

## getUserAriaLabel

生成用户相关的aria-label

@param user 用户对象
@param element 元素类型，如 'button'、'link' 等
@param action 操作描述
@returns 安全的aria-label文本
/

**文件:** `utils/userDisplayUtils.ts`

**类型:** 同步函数

### 参数

- **`user`** (`UserInfo | null | undefined`)
- **`element`** (`string`)
- **`action`** (`string`)

### 返回值

`UserInfo | null | undefined, element: string, action: string): string`

### 使用示例

```typescript
const result = getUserAriaLabel(value, 'example', 'example');
```

---

## SecurityUtils

安全工具函数
/

**文件:** `lib/security.ts`

**类型:** 类

### 方法

- **`generateRandomString`** (静态) 
  生成随机字符串
@param length 长度
@returns 随机字符串
/
- **`for`**  
- **`generateTempId`** (静态) 
  生成安全的临时ID
@returns 临时ID
/
- **`sanitizeData`** (静态) 
  清理敏感数据
@param data 原始数据
@returns 清理后的数据
/
- **`if`**  
- **`if`**  
- **`isDevelopment`** (静态) 
  检查是否为开发环境
@returns 是否为开发环境
/
- **`secureLog`** (静态) 
  安全日志记录
@param message 日志消息
@param data 日志数据
@param level 日志级别
/
- **`sanitizeData`**  

---

## DIContainer

暂无描述

**文件:** `utils/DIContainer.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`if`**  
  只在debug模式下输出服务注册日志
- **`if`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`loadService`**  (异步)
- **`if`**  
- **`if`**  
  只在debug模式下输出服务加载日志
- **`if`**  
  先加载依赖
- **`for`**  
- **`if`**  
  只在debug模式下输出服务加载完成日志
- **`catch`**  
- **`preloadEagerServices`**  (异步)
  预加载所有非懒加载服务
/
- **`for`**  
- **`calculateLoadOrder`**  
- **`if`**  
- **`for`**  
- **`for`**  
- **`has`**  
  检查服务是否已注册
/
- **`isInstantiated`**  
  检查服务是否已实例化
/
- **`getStats`**  
  获取统计信息
/
- **`clear`**  
  清理所有服务（主要用于测试）
/
- **`destroy`**  
  销毁服务实例
/

---

## AuthErrorHandler

认证错误处理器类
/

**文件:** `utils/authErrorHandler.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`initializeStats`**  
- **`handleError`**  
  处理错误（主要入口）
/
- **`normalizeError`**  
- **`if`**  
  如果已经是AuthError，直接返回
- **`classifyError`**  
- **`switch`**  
  Authing错误码
- **`if`**  
  服务不可用
- **`getErrorMetadata`**  
- **`generateRecoveryActions`**  
- **`switch`**  
- **`recordError`**  
- **`if`**  
  限制历史记录数量
- **`if`**  
  严重错误立即上报
- **`generateHandlingResult`**  
- **`logError`**  
- **`switch`**  
- **`getErrorStats`**  
  获取错误统计
/
- **`getRecentErrors`**  
  获取最近错误
/
- **`clearErrorHistory`**  
  清除错误历史
/
- **`performRetry`**  (异步)
- **`resendVerificationCode`**  (异步)
- **`refreshToken`**  (异步)
- **`contactSupport`**  
- **`reportCriticalError`**  

---

## AuthNetworkDiagnostic

网络诊断工具
/

**文件:** `utils/authNetworkDiagnostic.ts`

**类型:** 类

### 方法

- **`diagnoseAuthingConnection`** (静态) (异步)
  诊断Authing服务连接性
/
- **`if`**  
- **`catch`**  
- **`if`**  
- **`getNetworkInfo`** (静态) 
  获取网络状态信息
/

---

## AuthRetryManager

认证重试工具
/

**文件:** `utils/authNetworkDiagnostic.ts`

**类型:** 类

### 方法

- **`for`**  
- **`catch`**  
- **`if`**  
  如果是最后一次尝试，直接抛出错误
- **`createTimeoutPromise`**  
- **`sleep`**  

---

## AuthErrorAnalyzer

认证错误分析器
/

**文件:** `utils/authNetworkDiagnostic.ts`

**类型:** 类

### 方法

- **`analyzeError`** (静态) 
  分析认证错误并提供解决建议
/

---

## AuthingTokenHandler

暂无描述

**文件:** `utils/authTokenHandler.ts`

**类型:** 类

### 方法

- **`initializeAuthClient`**  (异步)
- **`catch`**  
- **`createRefreshHandler`**  
- **`async`**  
- **`if`**  
- **`if`**  
- **`split`**  
- **`catch`**  
- **`shouldLogoutOnError`**  
- **`if`**  
  检查错误消息
- **`createTokenFromLoginResponse`**  
- **`split`**  
- **`validateToken`**  (异步)
- **`if`**  
- **`catch`**  
- **`getUserInfo`**  (异步)
- **`if`**  
- **`catch`**  
- **`logout`**  (异步)
- **`catch`**  
- **`destroy`**  

---

## SecureConfigAccess

创建安全的配置访问接口
/

**文件:** `utils/configMigration.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`getOpenAIApiKey`**  (异步)
  安全获取OpenAI API密钥
/
- **`getDeepSeekApiKey`**  (异步)
  安全获取DeepSeek API密钥
/
- **`getAIMLApiKey`**  (异步)
  安全获取AIML API密钥
/
- **`getSupabaseConfig`**  (异步)
  安全获取Supabase配置
/
- **`getAuthingConfig`**  (异步)
  安全获取Authing配置
/
- **`getConfig`**  (异步)
  通用安全配置获取
/
- **`getSecurityStats`**  
  获取安全统计
/
- **`getAuditLog`**  
  获取访问审计日志
/

---

## CSSSystemChecker

CSS系统检查器类
/

**文件:** `utils/cssSystemChecker.ts`

**类型:** 类

### 方法

- **`checkCSSSystem`**  (异步)
- **`checkHardcodedStyles`**  
- **`checkHardcodedColors`**  
- **`if`**  
- **`checkHardcodedSizes`**  
- **`if`**  
- **`checkInlineStyles`**  
- **`checkComponentConsistency`**  
- **`checkButtonConsistency`**  
- **`if`**  
  如果按钮样式种类过多，说明不一致
- **`checkCardConsistency`**  
- **`if`**  
  如果卡片样式种类过多，说明不一致
- **`checkIconContainerConsistency`**  
- **`if`**  
  如果图标容器样式种类过多，说明不一致
- **`checkThemeConsistency`**  (异步)
- **`for`**  
- **`checkSingleTheme`**  (异步)
- **`if`**  
- **`if`**  
  恢复原主题
- **`generateReport`**  
- **`generateRecommendations`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`getElementLocation`**  
- **`containsHardcodedValues`**  
- **`hasGoodContrast`**  
- **`if`**  
  简化的对比度检查，实际应用中可以使用更精确的算法

---

## DataStorageManager

数据存储管理器类
/

**文件:** `utils/dataStorageManager.ts`

**类型:** 类

### 方法

- **`generateStorageKey`**  
- **`if`**  
- **`if`**  
- **`validateUserAccess`**  
- **`if`**  
- **`if`**  
- **`isExpired`**  
- **`getStorage`**  
- **`switch`**  
- **`saveToLocalStorage`**  
- **`catch`**  
- **`if`**  
  检查用户权限（如果需要）
- **`catch`**  
- **`getDataTypeConfig`**  
- **`if`**  
  直接匹配
- **`if`**  
- **`if`**  
- **`remove`**  (异步)
  删除数据
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`removeFromDatabase`**  (异步)
- **`if`**  
- **`cleanupExpiredData`**  
  清理过期数据
/
- **`for`**  
- **`catch`**  
- **`clearUserData`**  
  用户登出时清理数据
/
- **`if`**  
- **`for`**  
- **`if`**  
- **`for`**  

---

## DataStorageMigration

数据迁移器类
/

**文件:** `utils/dataStorageMigration.ts`

**类型:** 类

### 方法

- **`if`**  
- **`migrateAllUserData`**  (异步)
  执行完整的数据迁移
/
- **`for`**  
  执行每个迁移任务
- **`if`**  
- **`catch`**  
- **`if`**  
  迁移完成后的清理
- **`migrateSingleDataType`**  (异步)
- **`if`**  
- **`if`**  
  如果已存在数据，更新；否则创建新记录
- **`catch`**  
- **`cleanupAfterMigration`**  (异步)
- **`for`**  
- **`if`**  
- **`catch`**  
- **`validateMigration`**  (异步)
  验证迁移结果
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`rollbackMigration`**  (异步)
  回滚迁移（从备份恢复到localStorage）
/
- **`for`**  
- **`if`**  
- **`catch`**  
- **`catch`**  

---

## DatabaseInitializer

数据库初始化工具类

**文件:** `utils/databaseInitializer.ts`

**类型:** 类

### 方法

- **`executeSQLFile`** (静态) (异步)
- **`for`**  
- **`if`**  
- **`catch`**  
- **`checkTableExists`** (静态) (异步)
  检查表是否存在
- **`checkAllTablesExist`** (静态) (异步)
  检查所有必需的表是否存在
- **`for`**  
- **`if`**  
- **`initializeDatabase`** (静态) (异步)
  初始化数据库（创建所有表、索引、触发器等）
- **`if`**  
- **`catch`**  
- **`createUserDefaults`** (静态) (异步)
  创建用户默认数据
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  
- **`cleanupOldData`** (静态) (异步)
  清理过期数据
- **`if`**  
- **`catch`**  
- **`getDatabaseStats`** (静态) (异步)
  获取数据库统计信息
- **`catch`**  
- **`validateDatabaseIntegrity`** (静态) (异步)
  验证数据库完整性
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`catch`**  

---

## EnvChecker

环境变量配置检查器
/

**文件:** `utils/envChecker.ts`

**类型:** 类

### 方法

- **`checkAllConfigs`** (静态) 
  检查所有环境变量配置
/
- **`checkOpenAIKey`** (静态) 
  检查OpenAI API密钥
/
- **`checkCreemKey`** (静态) 
  检查Creem支付API密钥
/
- **`checkAuthingAppId`** (静态) 
  检查Authing应用ID
/
- **`checkAuthingHost`** (静态) 
  检查Authing域名
/
- **`checkDevMode`** (静态) 
  检查开发模式
/
- **`t`**  
- **`checkEncryptionKey`** (静态) 
  检查加密密钥
/
- **`t`**  
- **`hasCriticalErrors`** (静态) 
  检查是否有严重配置错误
/
- **`clearCache`** (静态) 
  清除缓存，强制重新检查
/
- **`getCacheStatus`** (静态) 
  获取缓存状态
/
- **`if`**  
- **`generateReport`** (静态) 
  生成配置报告
/
- **`if`**  
  建议

---

## HashtagGenerator

暂无描述

**文件:** `utils/hashtagGenerator.ts`

**类型:** 类

### 方法

- **`generateHashtags`**  (异步)
  生成多维度话题标签建议 - 完全基于实际内容的精准分析
/
- **`extractContentKeywords`**  
- **`identifyContentThemes`**  
- **`if`**  
  如果没有匹配到具体主题，尝试提取内容中的具体名词
- **`extractSpecificNouns`**  
- **`if`**  
- **`if`**  
- **`generateContentBasedTags`**  
- **`if`**  
  3. 生成组合标签（关键词+主题）
- **`filterAndRankTags`**  
- **`extractSemanticKeywords`**  
- **`analyzeContentType`**  
- **`generateContextualTags`**  
- **`generateKeywordTags`**  
- **`generateThemeTags`**  
- **`generateStyleTags`**  
- **`deduplicateAndRank`**  
- **`calculateContentRelevance`**  
- **`filterBySemanticRelevance`**  
- **`if`**  
  标签长度惩罚（过长的标签相关性降低）
- **`generateMultiDimensionTags`**  (异步)
- **`if`**  
  1. 行业标签
- **`if`**  
  4. 人设标签
- **`if`**  
  6. 品牌标签
- **`generateTopicTagsForSmartTagging`**  (异步)
  专门为智能标签生成提供话题标签功能
这个方法将被PlatformHashtags组件调用
/
- **`allocateTagsByDimensions`**  
- **`for`**  
  按维度权重分配标签
- **`for`**  
- **`if`**  
- **`if`**  
  如果还没达到目标数量，补充高相关度标签
- **`generateIndustryTags`**  
- **`if`**  
- **`generateTopicTags`**  
- **`extractKeywords`**  
- **`if`**  
- **`if`**  
- **`getRecommendedTags`**  
- **`generateContentTags`**  
- **`generateAccountTags`**  
- **`generatePersonaTags`**  
- **`generateTrendingTags`**  (异步)
- **`generateBrandTags`**  
- **`generateContentTypeRecommendations`**  
- **`getPlatformSpecificTags`**  
- **`getTrendingTags`**  (异步)
- **`deduplicateAndSort`**  
- **`if`**  
- **`formatTagsForPlatform`**  
  格式化标签为平台特定格式
/
- **`getPlatformConfig`**  
  获取平台配置
/
- **`saveUserTagPreferences`**  
  ✅ FIXED: 用户数据隔离 - 保存用户标签偏好
/
- **`getUserTagStorageKey`**  
- **`getUserTagUsageCount`**  
- **`if`**  
- **`catch`**  
- **`getUserTagPreferences`**  
  ✅ FIXED: 用户数据隔离 - 获取用户标签偏好
/
- **`if`**  
- **`catch`**  
- **`generateMultiPlatformHashtags`**  (异步)
  批量生成多平台标签
/
- **`for`**  
- **`catch`**  
- **`clearUserTagData`**  
  ✅ FIXED: 用户数据隔离 - 清理用户标签数据
/
- **`catch`**  

---

## InputValidator

暂无描述

**文件:** `utils/inputValidator.ts`

**类型:** 类

### 方法

- **`validate`**  
- **`if`**  
  安全检查
- **`if`**  
- **`if`**  
- **`if`**  
  HTML清理
- **`if`**  
  记录可疑活动
- **`if`**  
  严格模式检查
- **`catch`**  
- **`validateBasicRules`**  
- **`if`**  
  长度检查
- **`for`**  
  应用自定义规则
- **`if`**  
  长度检查
- **`if`**  
- **`if`**  
  禁用词汇检查
- **`if`**  
- **`if`**  
  自定义验证器
- **`if`**  
- **`if`**  
  应用清理器
- **`detectXSS`**  
- **`for`**  
- **`for`**  
- **`for`**  
- **`detectSQLInjection`**  
- **`for`**  
- **`detectMaliciousContent`**  
- **`for`**  
  检测恶意文件扩展名
- **`for`**  
- **`detectSensitiveInfo`**  
- **`for`**  
- **`sanitizeHTML`**  
- **`for`**  
  移除危险属性
- **`assessRiskLevel`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`if`**  
- **`logSuspiciousActivity`**  
- **`if`**  
  保持日志大小
- **`getSuspiciousActivityLog`**  
- **`clearLog`**  
- **`getSecurityStats`**  

---

## SecureConfigManager

暂无描述

**文件:** `utils/secureConfigManager.ts`

**类型:** 类

### 方法

- **`initializeCrypto`**  (异步)
- **`if`**  
- **`catch`**  
- **`simpleEncode`**  
- **`simpleDecode`**  
- **`isLocked`**  
- **`logAccess`**  
- **`if`**  
  检查失败尝试
- **`if`**  
- **`encryptValue`**  (异步)
- **`if`**  
- **`catch`**  
- **`decryptValue`**  (异步)
- **`if`**  
- **`catch`**  
- **`catch`**  
- **`setConfig`**  (异步)
- **`if`**  
- **`getConfig`**  (异步)
- **`if`**  
- **`catch`**  
- **`deleteConfig`**  (异步)
- **`if`**  
- **`listConfigs`**  
- **`getSecurityStats`**  
- **`getAuditLog`**  
- **`if`**  
- **`saveToStorage`**  (异步)
- **`catch`**  
- **`loadFromStorage`**  
- **`catch`**  
- **`destroy`**  

---

## SecureTokenStorage

安全Token存储管理器
/

**文件:** `utils/secureTokenStorage.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`getOrGenerateEncryptionKey`**  
- **`if`**  
- **`encrypt`**  
- **`catch`**  
- **`decrypt`**  
- **`catch`**  
- **`setToken`**  (异步)
  存储Token（支持多种安全方式）
/
- **`if`**  
  添加过期时间（如果没有设置）
- **`encrypt`**  
- **`if`**  
  1. 优先尝试httpOnly cookie（最安全）
- **`if`**  
- **`catch`**  
- **`if`**  
  2. 备用方案：加密后存储到sessionStorage（更安全）
- **`catch`**  
- **`if`**  
  3. 最后备用方案：localStorage（兼容性最好）
- **`catch`**  
- **`catch`**  
- **`getToken`**  (异步)
  获取Token（支持多种存储方式）
/
- **`if`**  
- **`catch`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`catch`**  
- **`warn`**  
- **`if`**  
- **`catch`**  
- **`parseTokenData`**  
- **`decrypt`**  
- **`validateToken`**  
  验证Token有效性
/
- **`if`**  
- **`if`**  
- **`if`**  
- **`removeToken`**  (异步)
  删除Token（所有存储位置）
/
- **`catch`**  
- **`catch`**  
- **`catch`**  
- **`catch`**  
- **`cleanupExpiredTokens`**  
  清除所有过期Token
/
- **`for`**  
- **`catch`**  
- **`for`**  
- **`catch`**  
- **`if`**  
- **`setHttpOnlyCookie`**  (异步)
- **`catch`**  
- **`getHttpOnlyCookie`**  (异步)
- **`if`**  
- **`catch`**  
- **`removeHttpOnlyCookie`**  (异步)
- **`catch`**  
- **`getTokensSummary`**  
  获取所有存储的Token信息（仅元数据，不包含敏感内容）
/
- **`for`**  
- **`catch`**  
- **`for`**  
- **`catch`**  

---

## SessionManager

暂无描述

**文件:** `utils/sessionManager.ts`

**类型:** 类

### 方法

- **`generateTabId`**  
- **`initializeSession`**  
- **`if`**  
  启用多标签页同步
- **`setCallbacks`**  
- **`startSession`**  
- **`endSession`**  
- **`extendSession`**  
- **`isSessionExpired`**  
- **`getRemainingTime`**  
- **`getSessionStats`**  
- **`setupActivityListeners`**  
- **`if`**  
  如果距离过期时间还有足够时间，自动延期
- **`removeActivityListeners`**  
- **`startSessionCheck`**  
- **`if`**  
  会话已过期
- **`if`**  
  显示过期警告
- **`handleSessionExpired`**  
- **`setupTabSync`**  
- **`if`**  
- **`if`**  
  检查是否有多个活跃标签页
- **`if`**  
  同步会话状态
- **`if`**  
- **`catch`**  
- **`if`**  
- **`saveSessionState`**  
- **`catch`**  
- **`loadSessionState`**  
- **`if`**  
- **`catch`**  
- **`clearSessionStorage`**  
- **`clearAllTimers`**  
- **`destroy`**  
- **`if`**  
  广播会话结束

---

## TokenManager

暂无描述

**文件:** `utils/tokenManager.ts`

**类型:** 类

### 方法

- **`setCallbacks`**  
- **`registerRefreshHandler`**  
- **`setToken`**  (异步)
- **`if`**  
  设置自动刷新
- **`getToken`**  (异步)
- **`if`**  
- **`if`**  
- **`if`**  
- **`getAccessToken`**  (异步)
- **`refreshToken`**  (异步)
- **`if`**  
- **`if`**  
- **`performTokenRefresh`**  (异步)
- **`if`**  
- **`if`**  
- **`for`**  
  重试刷新
- **`if`**  
- **`if`**  
- **`catch`**  
- **`if`**  
  等待后重试
- **`removeToken`**  (异步)
- **`if`**  
- **`if`**  
- **`clearAllTokens`**  (异步)
- **`for`**  
- **`getTokensStatus`**  
- **`validateTokenInfo`**  
- **`isTokenExpired`**  
- **`shouldRefreshToken`**  
- **`handleTokenExpiry`**  
- **`scheduleTokenRefresh`**  
- **`if`**  
- **`startAutoRefreshCheck`**  
- **`if`**  
- **`saveTokenToStorage`**  (异步)
- **`if`**  
- **`catch`**  
- **`loadTokenFromStorage`**  (异步)
- **`if`**  
- **`if`**  
- **`catch`**  
- **`removeTokenFromStorage`**  (异步)
- **`if`**  
- **`catch`**  
- **`loadTokensFromStorage`**  (异步)
- **`for`**  
  简化实现：遍历localStorage寻找token
- **`if`**  
- **`catch`**  
- **`delay`**  
- **`destroy`**  

---

## UserDataIsolationManager

用户数据隔离管理器
/

**文件:** `utils/userDataIsolation.ts`

**类型:** 类

### 方法

- **`getStorageKey`**  
  生成用户专属的存储键
🔧 FIXED: 确保用户ID的稳定性，避免因user对象变化导致存储键不一致
/
- **`if`**  
- **`if`**  
- **`catch`**  
- **`if`**  
- **`if`**  
  降低日志级别，避免循环日志
- **`catch`**  
- **`removeData`**  
  删除用户数据
/
- **`catch`**  
- **`hasData`**  
  检查数据是否存在
/
- **`catch`**  
- **`getDataSize`**  
  获取数据大小（字符数）
/
- **`catch`**  
- **`updateUser`**  
  更新用户引用
/
- **`log`**  
- **`if`**  
- **`if`**  

---

## UserDataNormalizer

用户数据标准化器
/

**文件:** `utils/userDataNormalizer.ts`

**类型:** 类

### 方法

- **`normalize`**  
  标准化用户数据
/
- **`if`**  
- **`normalizeMany`**  
  批量标准化用户数据
/
- **`catch`**  
- **`extractId`**  
- **`for`**  
- **`if`**  
- **`if`**  
- **`extractField`**  
- **`for`**  
- **`if`**  
- **`extractEmail`**  
- **`extractPhone`**  
- **`isValidEmail`**  
- **`isValidPhone`**  
- **`validateNormalizedData`**  
- **`if`**  
- **`if`**  

---

## ZIndexManager

Z-Index管理器
/

**文件:** `utils/zIndexManager.ts`

**类型:** 类

### 方法

- **`getInstance`** (静态) 
- **`if`**  
- **`getZIndexCSSVar`**  
  获取CSS变量值
/
- **`getZIndexValue`**  
  获取数值
/
- **`allocateModalIndex`**  
  为弹窗分配安全的z-index值
确保新弹窗总是在最顶层
/
- **`releaseModalIndex`**  
  释放z-index值
/
- **`if`**  
- **`getCurrentHighest`**  
  获取当前最高z-index
/
- **`if`**  
- **`applyZIndex`**  
  应用z-index到元素
/
- **`createModalStyles`**  
  创建弹窗样式对象
/
- **`createOverlayStyles`**  
  创建遮罩层样式对象
/
- **`debugZIndexConflicts`**  
  检查并修复z-index冲突
用于调试和开发阶段
/
- **`if`**  
- **`if`**  
- **`isValidZIndex`**  

---


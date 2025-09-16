# 🔒 认证授权

## SimpleAuthProvider

Provider组件

**文件:** `auth/SimpleAuthProvider.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = SimpleAuthProvider();
```

---

## useSimpleAuth

Hook for using auth context

**文件:** `auth/SimpleAuthProvider.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = useSimpleAuth();
```

---

## useAuth

兼容性Hook - 确保现有代码正常工作

**文件:** `auth/SimpleAuthProvider.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = useAuth();
```

---

## createOfficialAuthSDK

创建官方Guard实例，增强配置验证和错误处理
/

**文件:** `auth/officialAuthConfig.ts`

**类型:** 同步函数

### 返回值

`any`

### 使用示例

```typescript
const result = createOfficialAuthSDK();
```

---

## resolveAuthingGuardConfig

暂无描述

**文件:** `authing/configResolver.ts`

**类型:** 异步函数

### 参数

- **`base`** (`BaseAuthingConfig`)

### 返回值

`BaseAuthingConfig): Promise<ResolvedGuardConfig>`

### 使用示例

```typescript
const result = await resolveAuthingGuardConfig(value);
```

---

## useAuthComponentPreloader

============================================================================
智能预加载Hook
============================================================================

智能预加载Hook
/

**文件:** `components/auth/LazyAuthComponents.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = useAuthComponentPreloader();
```

---

## PasswordStrengthIndicator

暂无描述

**文件:** `components/auth/PasswordStrengthIndicator.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = PasswordStrengthIndicator();
```

---

## SessionManager

暂无描述

**文件:** `components/auth/SessionManager.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = SessionManager();
```

---

## SessionTimeoutDialog

暂无描述

**文件:** `components/auth/SessionTimeoutDialog.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = SessionTimeoutDialog();
```

---

## UnifiedPermissionWrapper

统一权限包装器组件
/

**文件:** `components/auth/UnifiedPermissionWrapper.tsx`

**类型:** 同步函数

### 使用示例

```typescript
const result = UnifiedPermissionWrapper();
```

---

## clearAuthingConfigCache

清除缓存的辅助函数

**文件:** `config/authing.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = clearAuthingConfigCache();
```

---

## getAuthingConfig

✅ FIXED: 2025-07-25 Authing配置获取函数已封装
🐛 历史问题：配置获取不稳定，环境变量注入失效
🔧 修复方案：硬编码+缓存+动态回调URI
📌 已封装：此函数已验证稳定，请勿修改

/

**文件:** `config/authing.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = getAuthingConfig();
```

---

## useAuthDataSync

认证数据同步Hook
自动处理用户登录登出时的数据迁移和同步
/

**文件:** `hooks/useAuthDataSync.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useAuthDataSync();
```

---

## AuthDataSyncProvider

自动认证数据同步组件
在应用根部使用，自动处理认证状态变化时的数据同步
/

**文件:** `hooks/useAuthDataSync.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = AuthDataSyncProvider();
```

---

## useManualDataSync

手动数据同步Hook
提供手动触发数据同步的功能
/

**文件:** `hooks/useAuthDataSync.ts`

**类型:** 同步函数

### 使用示例

```typescript
const result = useManualDataSync();
```

---

## AuthCodeGuard

暂无描述

**文件:** `auth/authCodeGuard.ts`

**类型:** 类

### 方法

- **`loadFromStorage`**  
- **`if`**  
- **`catch`**  
- **`saveToStorage`**  
- **`catch`**  
- **`cleanExpiredCodes`**  
- **`if`**  
- **`if`**  
- **`canUseCode`**  
- **`if`**  
- **`if`**  
- **`markCodeInUse`**  
- **`markCodeSuccess`**  
- **`if`**  
- **`markCodeFailed`**  
- **`if`**  
- **`checkCurrentUrl`**  
- **`if`**  
- **`if`**  
- **`getUsageStats`**  
- **`reset`**  

---

## AuthComponentPreloader

============================================================================
预加载管理器
============================================================================

认证组件预加载管理器
/

**文件:** `components/auth/LazyAuthComponents.tsx`

**类型:** 类

### 方法

- **`preloadAuthModal`** (静态) (异步)
  预加载认证模态框
/
- **`preloadLoginPage`** (静态) (异步)
  预加载登录页面
/
- **`preloadPermissionComponents`** (静态) (异步)
  预加载权限组件
/
- **`switch`**  
- **`preloadAllAuthComponents`** (静态) (异步)
  预加载所有认证组件
/
- **`getPreloadStatus`** (静态) 
  获取预加载状态
/
- **`clearPreloadStatus`** (静态) 
  清除预加载状态
/

---

## Guard

暂无描述

**文件:** `types/authing-guard-override.d.ts`

**类型:** 类

---


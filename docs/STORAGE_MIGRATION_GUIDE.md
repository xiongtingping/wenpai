# 存储架构迁移指南

## 📋 概述

本指南帮助开发者从旧版`auth-store.ts`迁移到新版`unified-state-store.ts`。

---

## 🎯 为什么要迁移？

### 旧版问题
- ❌ 多个状态管理系统并存（auth-store + unified-store）
- ❌ 数据重复和不一致
- ❌ 维护困难
- ❌ 类型不统一

### 新版优势
- ✅ 单一数据源（SSOT）
- ✅ 统一的状态管理
- ✅ 更好的类型安全
- ✅ 更清晰的架构
- ✅ 更容易维护

---

## 🔄 迁移策略

### 自动迁移

**用户数据自动迁移**：
- 应用启动时自动执行
- 从`wenpai-auth-store-v2`迁移到`wenpai-unified-store`
- 自动备份旧数据
- 失败自动回滚

**无需用户操作**：
- 用户无感知
- 数据自动转换
- 状态自动恢复

### 代码迁移

**使用兼容层（推荐）**：
- 旧代码无需修改
- 自动映射到新API
- 显示废弃警告

**直接迁移到新API（最佳实践）**：
- 使用新的Hook和API
- 更好的类型支持
- 更清晰的代码

---

## 📝 代码迁移示例

### 方式1：使用兼容层（零修改）

**旧代码**：
```typescript
import { useAuthStore } from '@/stores/auth-store';

function MyComponent() {
  const authStore = useAuthStore();
  
  return (
    <div>
      <p>User: {authStore.user?.username}</p>
      <p>Authenticated: {authStore.isAuthenticated}</p>
      <button onClick={() => authStore.setSessionWarning(true)}>
        Set Warning
      </button>
    </div>
  );
}
```

**新代码（使用兼容层）**：
```typescript
// 只需修改import路径
import { useAuthStore } from '@/stores/compatibility-layer';

function MyComponent() {
  const authStore = useAuthStore();
  
  // 其他代码完全不变
  return (
    <div>
      <p>User: {authStore.user?.username}</p>
      <p>Authenticated: {authStore.isAuthenticated}</p>
      <button onClick={() => authStore.setSessionWarning(true)}>
        Set Warning
      </button>
    </div>
  );
}
```

**优点**：
- ✅ 零代码修改（除了import）
- ✅ 立即可用
- ✅ 向后兼容

**缺点**：
- ⚠️ 显示废弃警告
- ⚠️ 不是最佳实践

---

### 方式2：迁移到新API（推荐）

**旧代码**：
```typescript
import { useAuthStore } from '@/stores/auth-store';

function MyComponent() {
  const authStore = useAuthStore();
  
  const handleLogin = (user) => {
    authStore.setUser(user);
    authStore.setAuthStatus('authenticated');
  };
  
  const handleLogout = () => {
    authStore.clearUser();
  };
  
  return (
    <div>
      <p>User: {authStore.user?.username}</p>
      <p>Status: {authStore.authStatus}</p>
      <p>Session: {authStore.sessionRemainingTime}s</p>
    </div>
  );
}
```

**新代码（使用新API）**：
```typescript
import { useAuthState, useUnifiedStore } from '@/stores/unified-state-store';

function MyComponent() {
  // 使用选择器Hook获取状态
  const authState = useAuthState();
  
  // 使用store获取操作方法
  const { setUser, setAuthStatus, clearUser } = useUnifiedStore();
  
  const handleLogin = (user) => {
    setUser(user);
    setAuthStatus('authenticated');
  };
  
  const handleLogout = () => {
    clearUser();
  };
  
  return (
    <div>
      <p>User: {authState.user?.username}</p>
      <p>Status: {authState.authStatus}</p>
      <p>Session: {authState.sessionRemainingTime}s</p>
    </div>
  );
}
```

**优点**：
- ✅ 最佳实践
- ✅ 更好的类型支持
- ✅ 更清晰的代码
- ✅ 无废弃警告

---

## 🔧 API对照表

### 状态属性

| 旧API (auth-store) | 新API (unified-store) | 说明 |
|-------------------|----------------------|------|
| `authStore.user` | `authState.user` | 用户信息 |
| `authStore.isAuthenticated` | `authState.isAuthenticated` | 认证状态 |
| `authStore.authStatus` | `authState.authStatus` | 认证状态枚举 |
| `authStore.loading` | `authState.loading` | 加载状态 |
| `authStore.error` | `authState.error` | 错误信息 |
| `authStore.sessionWarning` | `authState.sessionWarning` | 会话警告 |
| `authStore.sessionRemainingTime` | `authState.sessionRemainingTime` | 剩余时间 |
| `authStore.sessionExpiresAt` | `authState.sessionExpiresAt` | 过期时间 |

### 操作方法

| 旧API (auth-store) | 新API (unified-store) | 说明 |
|-------------------|----------------------|------|
| `authStore.setUser(user)` | `setUser(user)` | 设置用户 |
| `authStore.clearUser()` | `clearUser()` | 清除用户 |
| `authStore.updateUser(updates)` | `setUser(updates)` | 更新用户 |
| `authStore.setLoading(bool)` | `setLoading('auth', bool)` | 设置加载 |
| `authStore.setError(error)` | `setError('auth', error)` | 设置错误 |
| `authStore.clearError()` | `clearError('auth')` | 清除错误 |
| `authStore.setAuthStatus(status)` | `setAuthStatus(status)` | 设置状态 |
| `authStore.setSessionWarning(bool)` | `setSessionWarning(bool)` | 设置警告 |
| `authStore.setSessionRemainingTime(time)` | `setSessionRemainingTime(time)` | 设置时间 |
| `authStore.setSessionExpiresAt(timestamp)` | `setSessionExpiresAt(timestamp)` | 设置过期 |
| `authStore.reset()` | `resetSection('user')` + `resetSection('session')` | 重置 |

---

## 📦 新增功能

### 1. 会话管理增强

```typescript
import { useUnifiedStore } from '@/stores/unified-state-store';

function SessionManager() {
  const { extendSession, sessionExpiresAt } = useUnifiedStore();
  
  // 延长会话（24小时）
  const handleExtend = () => {
    extendSession();
  };
  
  return (
    <div>
      <p>过期时间: {new Date(sessionExpiresAt).toLocaleString()}</p>
      <button onClick={handleExtend}>延长会话</button>
    </div>
  );
}
```

### 2. 选择器Hook

```typescript
import { useAuthState, useSessionState } from '@/stores/unified-state-store';

function MyComponent() {
  // 只订阅认证状态
  const authState = useAuthState();
  
  // 只订阅会话状态
  const sessionState = useSessionState();
  
  return (
    <div>
      <p>User: {authState.user?.username}</p>
      <p>Session: {sessionState.sessionRemainingTime}s</p>
    </div>
  );
}
```

### 3. 模块化状态管理

```typescript
import { useUnifiedStore } from '@/stores/unified-state-store';

function MyComponent() {
  const store = useUnifiedStore();
  
  // 访问不同section的状态
  console.log('User:', store.user);
  console.log('Session:', store.session);
  console.log('Token Usage:', store.tokenUsage);
  console.log('Theme:', store.theme);
  
  // 重置特定section
  store.resetSection('session');
}
```

---

## 🚀 迁移步骤

### 步骤1：评估现有代码

```bash
# 搜索所有使用auth-store的文件
grep -r "from '@/stores/auth-store'" src/
```

### 步骤2：选择迁移方式

**快速迁移（使用兼容层）**：
- 修改import路径
- 测试功能

**完整迁移（使用新API）**：
- 修改import
- 重构代码
- 使用新Hook
- 测试功能

### 步骤3：逐步迁移

**建议顺序**：
1. 先迁移简单组件
2. 再迁移复杂组件
3. 最后迁移核心功能

### 步骤4：测试验证

- ✅ 功能测试
- ✅ 状态持久化测试
- ✅ 会话管理测试
- ✅ 边界情况测试

---

## 📚 相关文档

- **架构方案**：`docs/STORAGE_UNIFICATION_PLAN.md`
- **测试指南**：`docs/STORAGE_MIGRATION_TESTING.md`
- **API文档**：`src/stores/unified-state-store.ts`
- **兼容层**：`src/stores/compatibility-layer.ts`

---

## ❓ 常见问题

### Q1：旧代码必须立即迁移吗？

**A**：不需要。兼容层确保旧代码继续工作。但建议逐步迁移到新API。

### Q2：迁移会影响用户数据吗？

**A**：不会。用户数据自动迁移，无感知。

### Q3：如何处理废弃警告？

**A**：
- 短期：忽略警告，功能正常
- 长期：迁移到新API

### Q4：迁移失败怎么办？

**A**：
- 自动回滚机制
- 备份数据可恢复
- 查看迁移日志

### Q5：新旧API可以混用吗？

**A**：可以，但不推荐。建议统一使用新API。

---

## 🎉 迁移完成检查清单

- [ ] 所有组件已迁移
- [ ] 功能测试通过
- [ ] 无废弃警告
- [ ] 代码审查通过
- [ ] 文档已更新

---

**需要帮助？** 查看测试指南或联系开发团队。


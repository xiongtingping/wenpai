# 🔐 统一认证系统迁移指南

## 📋 概述

本文档指导如何从旧版认证系统 (v1) 迁移到新版认证系统 (v2)。

### 为什么要迁移?

**v1 架构的问题:**
- ❌ 3层状态管理 (Context + UnifiedStore + SecureUserStateService)
- ❌ 复杂的同步协调器 (userStateSyncCoordinator)
- ❌ 类型系统混乱 (多个重复类型定义)
- ❌ 865行的Context代码,难以维护
- ❌ 竞态条件风险

**v2 架构的优势:**
- ✅ 单一真实来源 (SSOT) - Zustand Store
- ✅ 透明加密 - 安全存储中间件自动处理
- ✅ 统一类型系统 - auth-types.ts
- ✅ 简洁清晰 - ~300行代码
- ✅ 更好的安全性

---

## 🎯 核心变化

### 1. 架构简化

**v1 架构 (复杂):**
```
Component
  ├─ useAuth (封装层)
  │   └─ useUnifiedAuth (Context Hook)
  │       ├─ useState (Context自己的状态)
  │       ├─ useUnifiedStore (Zustand Store)
  │       ├─ SecureUserStateService (加密存储)
  │       └─ userStateSyncCoordinator (同步协调)
  └─ 状态不一致风险
```

**v2 架构 (简洁):**
```
Component
  ├─ useAuth
  │   └─ useUnifiedAuth (Context)
  │       └─ useAuthStore (单一状态源)
  │           └─ SecureStorageMiddleware (透明加密)
  └─ 单一真实来源,无同步问题
```

### 2. 文件映射

| v1 文件 | v2 文件 | 说明 |
|---------|---------|------|
| `types/unifiedAuth.ts` | `types/auth-types.ts` | 统一类型定义 |
| `contexts/UnifiedAuthContext.tsx` | `contexts/UnifiedAuthContext.v2.tsx` | 简化的Context |
| `stores/unified-state-store.ts` (用户部分) | `stores/auth-store.ts` | 专用认证Store |
| `services/secureUserStateService.ts` | `stores/secure-storage-middleware.ts` | 透明加密中间件 |
| `services/userStateSyncCoordinator.ts` | ❌ 已移除 | 不再需要 |
| `services/authService.ts` | `services/authService.v2.ts` | 使用新类型 |
| `hooks/useAuth.ts` | `hooks/useAuth.v2.ts` | 简化Hook |

---

## 🔄 迁移步骤

### 步骤 1: 更新导入

**旧代码 (v1):**
```tsx
import { useAuth } from '@/hooks/useAuth';
import { SessionUserInfo } from '@/types/unifiedAuth';
import { useUnifiedStore } from '@/stores/unified-state-store';
```

**新代码 (v2):**
```tsx
import { useAuth } from '@/hooks/useAuth.v2';
import { UserInfo } from '@/types/auth-types';
import { useAuthStore } from '@/stores/auth-store';
```

### 步骤 2: 更新类型

**类型映射:**
```tsx
// v1 → v2
SessionUserInfo → UserInfo
StandardUserInfo → UserInfo
AuthUser → UserInfo
UnifiedAuthContextType → AuthContextValue
```

**示例:**
```tsx
// 旧代码
const user: SessionUserInfo | null = ...;

// 新代码
const user: UserInfo | null = ...;
```

### 步骤 3: 更新State使用

**旧代码 (v1):**
```tsx
const { user } = useUnifiedStore();
// 或
const auth = useAuth();
const user = auth.user;
```

**新代码 (v2):**
```tsx
// 推荐: 直接使用Store
const user = useAuthStore(state => state.user);

// 或: 使用Hook
const { user } = useAuth();
```

### 步骤 4: 移除同步逻辑

**旧代码 (v1) - 需要删除:**
```tsx
// ❌ 不再需要同步协调器
import { userStateSyncCoordinator } from '@/services/userStateSyncCoordinator';

const syncResult = await userStateSyncCoordinator.syncOnLogin(
  user,
  (user) => setUser(user)
);
```

**新代码 (v2):**
```tsx
// ✅ 直接设置Store即可
useAuthStore.getState().setUser(user);
// Store自动加密并持久化
```

### 步骤 5: 更新Provider

**App.tsx 更新:**
```tsx
// 旧导入
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';

// 新导入
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext.v2';

// 使用方式不变
<UnifiedAuthProvider>
  <App />
</UnifiedAuthProvider>
```

---

## 📝 API变化

### useAuth Hook

**基本保持不变,但更简洁:**

```tsx
const {
  // 状态 (与v1相同)
  user,
  isAuthenticated,
  loading,
  error,

  // 方法 (与v1相同)
  login,
  logout,
  updateUser,
  hasPermission,
  hasRole,

  // 移除的方法
  // ❌ refreshAuth (使用 refreshToken)
  // ❌ handleAuthingLogin (内部方法)
  // ❌ resetAuthState (使用 logout)
} = useAuth();
```

### Login方法

**v1:**
```tsx
await login({
  method: 'password',
  identifier: 'user@example.com',
  credential: 'password123',
  rememberMe: true
});
```

**v2 (相同):**
```tsx
await login({
  method: 'password',
  identifier: 'user@example.com',
  credential: 'password123',
  rememberMe: true
});
```

---

## 🔒 安全性改进

### 1. 加密存储

**v1 问题:**
```tsx
// 开发环境降级为明文
if (import.meta.env.DEV) {
  localStorage.setItem('authing_user', JSON.stringify(user));
}
```

**v2 改进:**
```tsx
// 始终加密,生产环境严格模式
const store = createSecureStorage({
  enabled: true,
  onEncryptError: import.meta.env.PROD ? 'throw' : 'warn'
});
```

### 2. 无同步竞态

**v1 问题:**
- 3层状态可能不一致
- 需要同步协调器解决竞态条件

**v2 改进:**
- 单一状态源,无竞态条件
- Store自动处理持久化

---

## 🧪 测试迁移

### 组件测试

**旧测试 (v1):**
```tsx
import { useUnifiedStore } from '@/stores/unified-state-store';

// Mock store
const mockStore = {
  user: { id: '123', username: 'test' },
  setUser: jest.fn()
};
```

**新测试 (v2):**
```tsx
import { useAuthStore } from '@/stores/auth-store';

// Mock store
const mockStore = {
  user: { id: '123', username: 'test' },
  setUser: jest.fn()
};
```

---

## ⚠️ 注意事项

### 1. 兼容性

- ✅ 新系统向后兼容旧的localStorage数据
- ✅ 自动迁移Store版本 (v1 → v2)
- ⚠️ 需要手动更新组件导入

### 2. 数据迁移

**自动迁移逻辑:**
```tsx
// auth-store.ts
migrate: (persistedState: any, version: number) => {
  if (version < 2) {
    return {
      ...initialState,
      user: persistedState.user || null,
      version: '2.0.0'
    };
  }
  return persistedState;
}
```

### 3. 已知问题

- ⚠️ v1和v2不能同时使用
- ⚠️ 需要全局搜索替换导入路径
- ⚠️ 某些组件可能需要调整类型定义

---

## 🚀 迁移检查清单

### 准备阶段
- [ ] 备份当前代码 (`git commit`)
- [ ] 阅读完整迁移指南
- [ ] 确认测试覆盖率

### 代码更新
- [ ] 更新所有 `import` 语句
- [ ] 替换类型定义 (`SessionUserInfo` → `UserInfo`)
- [ ] 移除同步协调器相关代码
- [ ] 更新 `App.tsx` 中的Provider
- [ ] 更新兼容性层引用

### 测试验证
- [ ] 本地运行所有测试
- [ ] 手动测试登录/登出流程
- [ ] 验证数据持久化
- [ ] 检查加密是否正常工作
- [ ] 性能测试

### 部署
- [ ] 在测试环境部署
- [ ] 验证生产环境配置
- [ ] 监控错误日志
- [ ] 准备回滚方案

---

## 📚 相关文档

- [架构文档](./AUTH_ARCHITECTURE.md) - 详细架构说明
- [类型文档](./src/types/auth-types.ts) - 类型定义
- [Store文档](./src/stores/auth-store.ts) - Store使用
- [安全文档](./SECURITY.md) - 安全最佳实践

---

## 🆘 故障排除

### 问题 1: 类型错误

```
Property 'loginTime' does not exist on type 'UserInfo'
```

**解决:**
```tsx
// UserInfo已包含loginTime,检查导入
import { UserInfo } from '@/types/auth-types';
```

### 问题 2: Store未定义

```
Cannot read property 'user' of undefined
```

**解决:**
```tsx
// 确保在Provider内部使用
<UnifiedAuthProvider>
  <YourComponent />
</UnifiedAuthProvider>
```

### 问题 3: 加密失败

```
Encryption failed in production
```

**解决:**
```tsx
// 检查环境变量配置
VITE_ENCRYPTION_KEY=your-secret-key
```

---

## 📞 获取帮助

如有问题:
1. 查看 [FAQ](./FAQ.md)
2. 搜索 [GitHub Issues](https://github.com/yourrepo/issues)
3. 联系开发团队

---

**最后更新:** 2025-01-XX
**版本:** 2.0.0

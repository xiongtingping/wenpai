# 🎯 存储统一架构重构方案

## 📋 执行摘要

**目标**：将多套状态管理系统统一到 `wenpai-unified-store`，实现单一数据源（SSOT）

**当前问题**：
- ❌ 存在两个独立的Store：`auth-store.ts` 和 `unified-state-store.ts`
- ❌ 用户状态在两个Store中重复定义
- ❌ 存在两个版本的UnifiedAuthContext（v1和v2）
- ❌ 数据同步复杂，容易出现不一致

**预期收益**：
- ✅ 单一数据源，消除数据不一致
- ✅ 简化代码，减少维护成本
- ✅ 提升性能，减少重复渲染
- ✅ 统一存储key命名规范

---

## 🔍 现状分析

### 当前存储系统

| 存储Key | 文件 | 状态 | 用途 |
|---------|------|------|------|
| `wenpai-unified-store` | `unified-state-store.ts` | ✅ 使用中 | 统一状态管理（用户、Token、主题等） |
| `wenpai-auth-store-v2` | `auth-store.ts` | ✅ 使用中 | 认证状态（用户、会话等） |
| `_authing_user` | Authing SDK | ✅ 使用中 | Authing原始用户数据 |
| `_authing_token` | Authing SDK | ✅ 使用中 | JWT Token |
| `wenpai_auth_state` | 未找到 | ❌ 已废弃 | 旧版认证状态 |

### 数据重复问题

**用户状态在两个Store中重复**：

1. **unified-state-store.ts** (第26-39行)：
```typescript
export interface UserState {
  id: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  nickname: string | null;
  avatar: string | null;
  roles: string[];
  permissions: string[];
  subscription: SubscriptionTier;
  isAuthenticated: boolean;
  loginTime: string | null;
  lastActivity: string | null;
}
```

2. **auth-store.ts** (第41-59行)：
```typescript
export interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  authStatus: AuthStatus;
  loading: boolean;
  error: string | null;
  sessionWarning: boolean;
  sessionRemainingTime: number;
  sessionExpiresAt: number | null;
  lastUpdated: string;
  version: string;
}
```

### Context版本混乱

1. **UnifiedAuthContext.tsx** (第28行)：
   - 使用兼容层的 `useAuthStore()`
   - 通过兼容层映射到 `useUnifiedStore()`
   - 865行代码，复杂

2. **UnifiedAuthContext.v2.tsx** (第38行)：
   - 直接使用 `auth-store.ts` 的 `useAuthStore()`
   - 250行代码，简洁
   - 但创建了新的Store，加剧了分裂

---

## 🎯 统一方案设计

### 方案概述

**核心思想**：保留 `wenpai-unified-store` 作为唯一Store，废弃 `auth-store.ts`

**实施策略**：
1. 扩展 `unified-state-store.ts`，添加 `auth-store.ts` 的所有功能
2. 更新兼容层，完全映射到 `unified-store`
3. 保持API兼容，不破坏现有代码
4. 分阶段迁移，可回滚

### 架构对比

#### 当前架构（混乱）
```
┌─────────────────────────────────────────┐
│  Components                             │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌─────────┐      ┌──────────────┐
│ Context │      │ Context.v2   │
│   v1    │      │              │
└────┬────┘      └──────┬───────┘
     │                  │
     ▼                  ▼
┌─────────────┐   ┌──────────────┐
│compat-layer │   │  auth-store  │
│     ↓       │   │              │
│ unified-    │   └──────────────┘
│  store      │
└─────────────┘
```

#### 目标架构（统一）
```
┌─────────────────────────────────────────┐
│  Components                             │
└─────────────┬───────────────────────────┘
              │
              ▼
      ┌───────────────┐
      │   Context     │
      │  (统一版本)    │
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │compat-layer   │
      │  (可选兼容)    │
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │ unified-store │
      │  (唯一Store)   │
      └───────────────┘
```

---

## 📝 详细实施计划

### 阶段1：分析和设计 ✅ 当前阶段

**任务**：
- [x] 分析现有存储系统
- [x] 识别数据重复和冲突
- [x] 设计统一Store架构
- [x] 制定迁移策略

**输出**：
- ✅ 本文档（STORAGE_UNIFICATION_PLAN.md）
- ✅ 架构对比图
- ✅ 详细实施计划

---

### 阶段2：扩展unified-store

**目标**：将 `auth-store.ts` 的所有功能合并到 `unified-state-store.ts`

**需要添加的功能**：

1. **会话管理状态**：
```typescript
export interface SessionState {
  sessionWarning: boolean;
  sessionRemainingTime: number;
  sessionExpiresAt: number | null;
}
```

2. **认证状态枚举**：
```typescript
export enum AuthStatus {
  UNAUTHENTICATED = 'unauthenticated',
  AUTHENTICATING = 'authenticating',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error'
}
```

3. **会话管理操作**：
```typescript
setSessionWarning: (warning: boolean) => void;
setSessionRemainingTime: (time: number) => void;
setSessionExpiresAt: (timestamp: number | null) => void;
```

4. **安全存储中间件**：
   - 集成 `secure-storage-middleware.ts`
   - 自动加密敏感数据

**修改文件**：
- `src/stores/unified-state-store.ts`

---

### 阶段3：创建兼容层

**目标**：确保所有使用 `useAuthStore()` 的代码无需修改

**兼容层实现**：
```typescript
// src/stores/compatibility-layer.ts

export const useAuthStore = () => {
  const unifiedStore = useUnifiedStore();
  
  return {
    // 状态映射
    user: unifiedStore.user,
    isAuthenticated: unifiedStore.user.isAuthenticated,
    authStatus: unifiedStore.user.isAuthenticated 
      ? AuthStatus.AUTHENTICATED 
      : AuthStatus.UNAUTHENTICATED,
    loading: unifiedStore.loading.auth,
    error: unifiedStore.error.auth,
    sessionWarning: unifiedStore.session.sessionWarning,
    sessionRemainingTime: unifiedStore.session.sessionRemainingTime,
    sessionExpiresAt: unifiedStore.session.sessionExpiresAt,
    
    // 操作映射
    setUser: unifiedStore.setUser,
    clearUser: unifiedStore.clearUser,
    updateUser: unifiedStore.setUser,
    setLoading: (loading: boolean) => unifiedStore.setLoading('auth', loading),
    setError: (error: string | null) => unifiedStore.setError('auth', error),
    clearError: () => unifiedStore.clearError('auth'),
    setSessionWarning: unifiedStore.setSessionWarning,
    setSessionRemainingTime: unifiedStore.setSessionRemainingTime,
    setSessionExpiresAt: unifiedStore.setSessionExpiresAt,
    reset: () => unifiedStore.resetSection('user'),
    updateLastUpdated: unifiedStore.updateLastUpdated
  };
};
```

**修改文件**：
- `src/stores/compatibility-layer.ts`

---

### 阶段4：数据迁移

**目标**：自动迁移旧存储数据到新存储

**迁移脚本**：
```typescript
// src/utils/storageMigration.ts

export function migrateAuthStoreToUnified() {
  try {
    // 1. 读取旧的auth-store数据
    const oldAuthData = localStorage.getItem('wenpai-auth-store-v2');
    if (!oldAuthData) return;
    
    const oldAuth = JSON.parse(oldAuthData);
    
    // 2. 读取unified-store数据
    const unifiedData = localStorage.getItem('wenpai-unified-store');
    const unified = unifiedData ? JSON.parse(unifiedData) : {};
    
    // 3. 合并数据
    unified.state = unified.state || {};
    unified.state.user = {
      ...unified.state.user,
      ...oldAuth.state.user,
      isAuthenticated: oldAuth.state.isAuthenticated
    };
    
    unified.state.session = {
      sessionWarning: oldAuth.state.sessionWarning,
      sessionRemainingTime: oldAuth.state.sessionRemainingTime,
      sessionExpiresAt: oldAuth.state.sessionExpiresAt
    };
    
    // 4. 保存合并后的数据
    localStorage.setItem('wenpai-unified-store', JSON.stringify(unified));
    
    // 5. 删除旧数据
    localStorage.removeItem('wenpai-auth-store-v2');
    
    console.log('✅ 存储迁移完成');
  } catch (error) {
    console.error('❌ 存储迁移失败:', error);
  }
}
```

**执行时机**：
- 应用启动时自动执行
- 在 `main.tsx` 中调用

**修改文件**：
- 新建 `src/utils/storageMigration.ts`
- 修改 `src/main.tsx`

---

### 阶段5：测试和验证

**测试清单**：

1. **功能测试**：
   - [ ] 用户登录/登出
   - [ ] Token记录
   - [ ] 会话管理
   - [ ] 权限检查
   - [ ] 主题切换
   - [ ] 收藏功能

2. **兼容性测试**：
   - [ ] 所有使用 `useAuthStore()` 的组件正常工作
   - [ ] 所有使用 `useUnifiedStore()` 的组件正常工作
   - [ ] 数据迁移成功

3. **性能测试**：
   - [ ] 页面加载时间
   - [ ] 状态更新性能
   - [ ] 内存占用

4. **回归测试**：
   - [ ] 所有现有功能正常
   - [ ] 无新增bug

---

### 阶段6：清理和文档

**清理任务**：
1. 标记废弃文件：
   - `src/stores/auth-store.ts` → 添加 `@deprecated` 注释
   - `src/contexts/UnifiedAuthContext.v2.tsx` → 添加 `@deprecated` 注释

2. 更新文档：
   - 更新 `AUTH_ARCHITECTURE.md`
   - 更新 `CLAUDE.md`
   - 创建迁移指南

3. 清理旧代码（可选，谨慎执行）：
   - 在确认无问题后，删除废弃文件
   - 清理localStorage中的旧key

---

## 🛡️ 风险控制

### 风险识别

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 数据迁移失败 | 高 | 中 | 备份数据、可回滚 |
| API不兼容 | 高 | 低 | 完整的兼容层 |
| 性能下降 | 中 | 低 | 性能测试、优化 |
| 用户体验中断 | 高 | 低 | 分阶段部署 |

### 回滚策略

**如果出现问题，可以立即回滚**：

1. **代码回滚**：
```bash
git revert <commit-hash>
git push
```

2. **数据回滚**：
```typescript
// 恢复旧的auth-store数据
function rollbackStorage() {
  const backup = localStorage.getItem('wenpai-auth-store-v2-backup');
  if (backup) {
    localStorage.setItem('wenpai-auth-store-v2', backup);
  }
}
```

3. **功能开关**：
```typescript
// 使用功能开关控制新旧系统
const USE_UNIFIED_STORE = false; // 出问题时设为false
```

---

## 📊 成功指标

### 量化指标

1. **代码简化**：
   - 减少Store文件数量：2 → 1
   - 减少Context版本：2 → 1
   - 减少代码行数：预计减少30%

2. **性能提升**：
   - 页面加载时间：减少10%
   - 状态更新延迟：减少20%

3. **维护性提升**：
   - 数据不一致问题：0
   - 存储key统一：100%

### 质量指标

- ✅ 所有现有功能正常工作
- ✅ 无新增bug
- ✅ 代码可读性提升
- ✅ 文档完整

---

## 🚀 下一步行动

### 立即执行（阶段2）

1. 扩展 `unified-state-store.ts`
2. 添加会话管理功能
3. 集成安全存储中间件

### 本周完成（阶段3-4）

1. 更新兼容层
2. 实现数据迁移脚本
3. 在开发环境测试

### 下周完成（阶段5-6）

1. 全面测试
2. 部署到生产环境
3. 监控和优化

---

## 📚 参考文档

- [CLAUDE.md](../CLAUDE.md) - 项目治理规则
- [AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md) - 认证架构文档
- [unified-state-store.ts](../src/stores/unified-state-store.ts) - 统一Store实现
- [auth-store.ts](../src/stores/auth-store.ts) - 认证Store实现（待废弃）

---

**文档版本**：v1.0  
**创建日期**：2025-10-05  
**最后更新**：2025-10-05  
**负责人**：AI Assistant  
**状态**：✅ 已完成设计，准备实施


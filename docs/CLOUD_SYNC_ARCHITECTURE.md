# 云端实时同步架构

## 📋 概述

为确保前端显示的数据与Supabase云端数据库完全一致，我们实现了**云端实时同步机制**，禁用本地缓存，所有关键数据从云端实时查询。

## 🎯 设计原则

### 1. **Single Source of Truth (SSOT)**
- ✅ Supabase是唯一数据源
- ❌ 禁止使用localStorage缓存订阅和使用统计
- ✅ 所有数据从云端实时查询

### 2. **自动轮询同步**
- 订阅信息：每30秒同步一次
- 使用统计：每60秒同步一次
- 支付状态：支付中每3秒同步一次

### 3. **即时响应**
- 支付成功后立即同步
- 手动刷新按钮
- 用户登录时立即同步

## 🏗️ 架构设计

### 核心组件

```
┌─────────────────────────────────────────────────────────┐
│                    前端应用 (React)                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         CloudSyncService (单例)                 │    │
│  │  - 订阅同步定时器 (30秒)                        │    │
│  │  - 使用统计同步定时器 (60秒)                    │    │
│  │  - 支付状态同步定时器 (3秒，按需)              │    │
│  └────────────────────────────────────────────────┘    │
│                         ↓                                │
│  ┌────────────────────────────────────────────────┐    │
│  │         Unified State Store                     │    │
│  │  - user.subscription (不持久化)                 │    │
│  │  - tokenUsage (不持久化)                        │    │
│  │  - usageCount (不持久化)                        │    │
│  └────────────────────────────────────────────────┘    │
│                         ↓                                │
│  ┌────────────────────────────────────────────────┐    │
│  │         UI Components                           │    │
│  │  - ProfilePage (显示订阅和使用统计)             │    │
│  │  - TokenUsageSection                            │    │
│  │  - SubscriptionExpiryCard                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│              Supabase (云端数据库)                       │
├─────────────────────────────────────────────────────────┤
│  - user_subscriptions (订阅信息)                        │
│  - user_usage_balance (使用次数)                        │
│  - token_usage_records (Token使用记录)                  │
│  - orders (订单状态)                                     │
└─────────────────────────────────────────────────────────┘
```

## 📁 文件结构

### 1. **云端同步服务**
```typescript
// src/services/cloudSyncService.ts
class CloudSyncService {
  // 启动自动同步
  start(userId: string): void
  
  // 停止自动同步
  stop(): void
  
  // 同步订阅信息
  private syncSubscription(userId: string): Promise<void>
  
  // 同步使用统计
  private syncUsageStats(userId: string): Promise<void>
  
  // 启动支付状态同步
  startPaymentSync(userId, orderId, onSuccess): void
  
  // 手动触发全量同步
  manualSync(userId: string): Promise<void>
}
```

### 2. **状态管理配置**
```typescript
// src/stores/unified-state-store.ts
partialize: (state) => ({
  user: {
    ...state.user,
    subscription: 'trial', // 🚫 不持久化，强制从云端查询
  },
  // 🚫 不持久化tokenUsage和usageCount
  theme: state.theme,
  appSettings: state.appSettings,
  ...
})
```

### 3. **应用启动集成**
```typescript
// src/App.tsx
useEffect(() => {
  if (user?.userId) {
    cloudSyncService.start(user.userId); // 启动同步
    return () => cloudSyncService.stop(); // 停止同步
  }
}, [user?.userId]);
```

## 🔄 同步流程

### 1. **用户登录**
```
用户登录
  ↓
App.tsx检测到user.userId
  ↓
cloudSyncService.start(userId)
  ↓
立即执行一次全量同步
  ↓
启动定时器（30秒/60秒）
```

### 2. **定时同步**
```
每30秒
  ↓
查询user_subscriptions表
  ↓
检测订阅变化
  ↓
更新Store.user.subscription
  ↓
重新初始化使用统计
```

### 3. **支付成功同步**
```
支付成功
  ↓
PaymentModal.refreshUserSubscriptionAndStats()
  ↓
查询user_subscriptions
  ↓
更新订阅等级
  ↓
重新初始化使用统计
  ↓
跳转首页
```

### 4. **手动同步**
```
用户点击"立即同步"按钮
  ↓
cloudSyncService.manualSync(userId)
  ↓
并行执行：
  - syncSubscription()
  - syncUsageStats()
  ↓
显示成功提示
```

## 📊 数据流向

### 禁用本地缓存前（旧架构）
```
Supabase → localStorage → Store → UI
           ↑ 缓存可能过期
```

### 启用云端同步后（新架构）
```
Supabase → Store → UI
↑          ↑
└──────────┘ 每30秒/60秒自动同步
```

## 🎯 关键特性

### 1. **禁用本地缓存**
```typescript
// unified-state-store.ts
partialize: (state) => ({
  user: {
    subscription: 'trial', // 不持久化
  },
  // tokenUsage: state.tokenUsage, // 注释掉，不持久化
  // usageCount: state.usageCount, // 注释掉，不持久化
})
```

### 2. **自动同步间隔**
```typescript
const SYNC_INTERVALS = {
  SUBSCRIPTION: 30 * 1000,      // 30秒
  USAGE_STATS: 60 * 1000,       // 60秒
  PAYMENT_STATUS: 3 * 1000,     // 3秒（仅支付中）
};
```

### 3. **订阅变化检测**
```typescript
if (data.tier !== store.user.subscription) {
  logger.info('检测到订阅变化', {
    旧等级: store.user.subscription,
    新等级: data.tier
  });
  store.updateUserSubscription(data.tier);
  await store.initializeUsageStats(userId, data.tier);
}
```

## 🛠️ 使用方法

### 在组件中使用
```typescript
import { cloudSyncService } from '@/services/cloudSyncService';

// 手动触发同步
const handleSync = async () => {
  if (user?.id) {
    await cloudSyncService.manualSync(user.id);
    toast({ title: '同步成功' });
  }
};
```

### 使用React Hook
```typescript
import { useCloudSync } from '@/services/cloudSyncService';

const { syncStatus, manualSync } = useCloudSync(user?.id);

// 查看同步状态
console.log(syncStatus.isRunning);

// 手动同步
await manualSync();
```

## 📈 监控与日志

### 日志输出
```
🚀 启动云端实时同步服务 { userId: '...' }
✅ 云端同步服务已启动 { 订阅同步间隔: '30秒', 使用统计同步间隔: '60秒' }
🔄 同步订阅信息... { userId: '...' }
✅ 订阅同步完成 { tier: 'premium', status: 'active' }
📊 检测到订阅变化 { 旧等级: 'pro', 新等级: 'premium' }
```

### 同步状态查询
```typescript
const status = cloudSyncService.getStatus();
// {
//   isRunning: true,
//   hasSubscriptionSync: true,
//   hasUsageStatsSync: true,
//   hasPaymentSync: false
// }
```

## ⚠️ 注意事项

1. **不要在多个地方启动同步**
   - 只在App.tsx中启动一次
   - 避免重复定时器

2. **用户登出时停止同步**
   - useEffect的cleanup函数会自动处理

3. **支付同步是临时的**
   - 仅在支付中启动
   - 支付成功或失败后自动停止

4. **手动同步不会重启定时器**
   - 只是立即执行一次同步
   - 定时器继续按原计划运行

## 🎉 效果

- ✅ **实时性**：数据最多延迟30秒
- ✅ **准确性**：与云端数据库完全一致
- ✅ **自动化**：无需用户手动刷新
- ✅ **可靠性**：支付成功立即同步
- ✅ **可控性**：提供手动同步按钮


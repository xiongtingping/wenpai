# 订阅状态事件系统文档

## 概述

订阅状态管理系统使用全局事件机制实现组件间的状态同步和通知。

## 事件列表

### 1. `subscriptionRefreshed`

**触发时机**：订阅状态刷新完成后

**触发位置**：
- `subscription-store.ts` - `forceRefreshAfterUpgrade()`

**事件详情**：
```typescript
window.dispatchEvent(new CustomEvent('subscriptionRefreshed', {
  detail: {
    userId: string;
    tier: SubscriptionTier;
    timestamp: number;
  }
}));
```

**监听示例**：
```typescript
useEffect(() => {
  const handleSubscriptionRefreshed = (event: CustomEvent) => {
    console.log('订阅状态已刷新', event.detail);
    // 执行后续操作
  };

  window.addEventListener('subscriptionRefreshed', handleSubscriptionRefreshed as EventListener);

  return () => {
    window.removeEventListener('subscriptionRefreshed', handleSubscriptionRefreshed as EventListener);
  };
}, []);
```

### 2. `subscriptionCacheUpdated`

**触发时机**：检测到其他Tab更新订阅缓存

**触发位置**：
- `unifiedSubscriptionService.ts` - `setupCrossTabSync()`

**事件详情**：
```typescript
window.dispatchEvent(new CustomEvent('subscriptionCacheUpdated', {
  detail: {
    userId: string;
    source: 'cross-tab';
  }
}));
```

**用途**：
- 跨Tab同步订阅状态
- 确保多个Tab显示一致的订阅信息

### 3. `paymentSuccess`

**触发时机**：支付成功后

**触发位置**：
- `PaymentPage.tsx` - `handlePaymentSuccess()`
- `PaymentPage.tsx` - `handleBufpaySuccess()`

**事件详情**：
```typescript
window.dispatchEvent(new CustomEvent('paymentSuccess', {
  detail: {
    expectedTier: SubscriptionTier;
  }
}));
```

**监听位置**：
- `AuthGuard.tsx` - 触发强制刷新订阅状态

### 4. `subscriptionUpdated`

**触发时机**：订阅信息更新后

**触发位置**：
- 各种订阅更新场景

**事件详情**：
```typescript
window.dispatchEvent(new CustomEvent('subscriptionUpdated', {
  detail: {
    tier: SubscriptionTier;
    // 其他订阅信息
  }
}));
```

## 事件流程图

```
支付成功
   ↓
触发 paymentSuccess 事件
   ↓
AuthGuard 监听到事件
   ↓
调用 forceRefreshAfterUpgrade()
   ↓
清除缓存 + 重新查询
   ↓
更新 subscription-store
   ↓
同步到 unified-state-store
   ↓
触发 subscriptionRefreshed 事件
   ↓
所有监听组件更新UI
```

## 跨Tab同步流程

```
Tab A: 支付成功
   ↓
Tab A: 更新 localStorage 缓存
   ↓
浏览器触发 storage 事件
   ↓
Tab B: storage 监听器接收事件
   ↓
Tab B: 清除内存缓存
   ↓
Tab B: 触发 subscriptionCacheUpdated 事件
   ↓
Tab B: 组件重新读取缓存
   ↓
Tab B: UI 自动更新
```

## 最佳实践

### 1. 事件监听器清理

**必须**在组件卸载时清理事件监听器，避免内存泄漏：

```typescript
useEffect(() => {
  const handler = (event: CustomEvent) => {
    // 处理事件
  };

  window.addEventListener('subscriptionRefreshed', handler as EventListener);

  // 清理函数
  return () => {
    window.removeEventListener('subscriptionRefreshed', handler as EventListener);
  };
}, []);
```

### 2. 事件防抖

对于高频事件，使用防抖避免重复处理：

```typescript
const debouncedHandler = useMemo(
  () => debounce((event: CustomEvent) => {
    // 处理事件
  }, 1000),
  []
);

useEffect(() => {
  window.addEventListener('subscriptionRefreshed', debouncedHandler as EventListener);

  return () => {
    window.removeEventListener('subscriptionRefreshed', debouncedHandler as EventListener);
    debouncedHandler.cancel(); // 清理防抖
  };
}, [debouncedHandler]);
```

### 3. 类型安全

使用TypeScript定义事件详情类型：

```typescript
interface SubscriptionRefreshedDetail {
  userId: string;
  tier: SubscriptionTier;
  timestamp: number;
}

const handleSubscriptionRefreshed = (event: CustomEvent<SubscriptionRefreshedDetail>) => {
  const { userId, tier, timestamp } = event.detail;
  // 类型安全的访问
};
```

## 调试

### 查看所有订阅事件

在浏览器控制台运行：

```javascript
// 监听所有订阅相关事件
['subscriptionRefreshed', 'subscriptionCacheUpdated', 'paymentSuccess', 'subscriptionUpdated'].forEach(eventName => {
  window.addEventListener(eventName, (event) => {
    console.log(`[Event] ${eventName}:`, event.detail);
  });
});
```

### 手动触发事件（测试用）

```javascript
// 模拟支付成功
window.dispatchEvent(new CustomEvent('paymentSuccess', {
  detail: { expectedTier: 'pro' }
}));

// 模拟订阅刷新
window.dispatchEvent(new CustomEvent('subscriptionRefreshed', {
  detail: {
    userId: 'test-user-id',
    tier: 'pro',
    timestamp: Date.now()
  }
}));
```

## 注意事项

1. **事件命名规范**：使用驼峰命名法，清晰描述事件含义
2. **事件详情结构**：保持一致的数据结构，便于类型定义
3. **避免循环触发**：确保事件处理器不会触发相同的事件
4. **性能考虑**：避免在事件处理器中执行耗时操作
5. **错误处理**：事件处理器中的错误不应影响其他监听器

## 相关文件

- `src/stores/subscription-store.ts` - 订阅状态Store
- `src/services/unifiedSubscriptionService.ts` - 订阅服务
- `src/components/auth/AuthGuard.tsx` - 认证守卫
- `src/pages/PaymentPage.tsx` - 支付页面
- `src/App.tsx` - 应用入口


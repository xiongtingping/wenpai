# 订阅状态强制刷新机制

## 🎯 功能说明

在订阅升级、支付成功等场景下，需要立即更新订阅状态显示，而不是等待缓存过期（10分钟）。

强制刷新机制会：
1. **清除所有层级的缓存**（内存、localStorage、Supabase）
2. **立即从数据库查询最新数据**
3. **通知所有使用订阅状态的组件**
4. **触发全局事件**，让其他模块响应

---

## 🔧 实现原理

### 缓存层级

```
第1层: 全局Store内存缓存 (最快，但页面刷新后丢失)
   ↓
第2层: unifiedSubscriptionService内存缓存 (Map)
   ↓
第3层: localStorage缓存 (持久化，跨会话)
   ↓
第4层: Supabase数据库 (真实数据源)
```

### 强制刷新流程

```typescript
forceRefreshAfterUpgrade(userId)
   ↓
1. 清除unifiedSubscriptionService的所有缓存
   ↓
2. 清除Store的内存缓存
   ↓
3. 等待500ms（确保数据库已更新）
   ↓
4. 从数据库查询最新数据
   ↓
5. 更新全局Store
   ↓
6. 触发'subscriptionRefreshed'事件
   ↓
7. 所有组件自动更新显示
```

---

## 📋 使用方法

### 方法1: 自动触发（推荐）

系统已自动监听以下事件，无需手动调用：

#### 1. 支付成功事件

```typescript
// 支付成功后触发
window.dispatchEvent(new Event('paymentSuccess'));

// AuthGuard会自动监听并刷新订阅状态
```

#### 2. 订阅更新事件

```typescript
// 订阅更新后触发
window.dispatchEvent(new CustomEvent('userSubscriptionUpdated', {
  detail: { userId, tier: 'pro' }
}));

// AuthGuard会自动监听并刷新订阅状态
```

### 方法2: 手动调用

在需要立即刷新的地方手动调用：

```typescript
import { useSubscriptionStore } from '@/stores/subscription-store';

function PaymentSuccessPage() {
  const { forceRefreshAfterUpgrade } = useSubscriptionStore();
  const { user } = useAuth();

  const handlePaymentSuccess = async () => {
    // 支付成功后立即刷新订阅状态
    await forceRefreshAfterUpgrade(user.id);
    
    // 显示成功提示
    toast.success('订阅已升级！');
  };

  return (
    <Button onClick={handlePaymentSuccess}>
      确认支付
    </Button>
  );
}
```

### 方法3: 使用Hook

```typescript
import { useSubscription } from '@/stores/subscription-store';

function SubscriptionSettings() {
  const { forceRefreshAfterUpgrade } = useSubscription(user?.id);

  const handleUpgrade = async () => {
    // 执行升级操作
    await upgradeSubscription();
    
    // 立即刷新订阅状态
    await forceRefreshAfterUpgrade();
  };

  return (
    <Button onClick={handleUpgrade}>
      升级订阅
    </Button>
  );
}
```

---

## 🔍 监听刷新完成事件

如果需要在订阅刷新完成后执行某些操作：

```typescript
useEffect(() => {
  const handleSubscriptionRefreshed = (event: CustomEvent) => {
    console.log('订阅状态已刷新', event.detail);
    
    // 执行后续操作
    // 例如：重新加载使用统计、更新UI等
  };

  window.addEventListener('subscriptionRefreshed', handleSubscriptionRefreshed as EventListener);

  return () => {
    window.removeEventListener('subscriptionRefreshed', handleSubscriptionRefreshed as EventListener);
  };
}, []);
```

---

## 📊 与普通刷新的区别

### 普通刷新 (refreshStatus)

```typescript
refreshStatus(userId)
   ↓
清除缓存 → 重新查询 → 更新Store
```

**特点**：
- ✅ 清除缓存
- ✅ 重新查询
- ❌ 不等待数据库更新
- ❌ 不触发全局事件

**适用场景**：
- 用户手动刷新
- 定期更新

### 强制刷新 (forceRefreshAfterUpgrade)

```typescript
forceRefreshAfterUpgrade(userId)
   ↓
清除所有缓存 → 等待500ms → 重新查询 → 更新Store → 触发事件
```

**特点**：
- ✅ 清除所有层级缓存
- ✅ 等待数据库更新
- ✅ 触发全局事件
- ✅ 详细的日志记录

**适用场景**：
- 支付成功
- 订阅升级
- 订阅变更
- 需要立即生效的场景

---

## 🎯 应用场景

### 场景1: 支付成功页面

```typescript
// src/pages/PaymentSuccessPage.tsx
import { useSubscriptionStore } from '@/stores/subscription-store';

function PaymentSuccessPage() {
  const { forceRefreshAfterUpgrade } = useSubscriptionStore();
  const { user } = useAuth();

  useEffect(() => {
    // 页面加载时立即刷新订阅状态
    if (user?.id) {
      forceRefreshAfterUpgrade(user.id);
    }
  }, [user?.id]);

  return (
    <div>
      <h1>支付成功！</h1>
      <p>您的订阅已升级，正在更新...</p>
    </div>
  );
}
```

### 场景2: 订阅管理页面

```typescript
// src/pages/SubscriptionManagementPage.tsx
function SubscriptionManagementPage() {
  const { forceRefreshAfterUpgrade } = useSubscription(user?.id);

  const handleCancelSubscription = async () => {
    await cancelSubscription();
    
    // 取消后立即刷新
    await forceRefreshAfterUpgrade();
    
    toast.success('订阅已取消');
  };

  const handleRenewSubscription = async () => {
    await renewSubscription();
    
    // 续费后立即刷新
    await forceRefreshAfterUpgrade();
    
    toast.success('订阅已续费');
  };

  return (
    <div>
      <Button onClick={handleCancelSubscription}>取消订阅</Button>
      <Button onClick={handleRenewSubscription}>续费订阅</Button>
    </div>
  );
}
```

### 场景3: 支付回调处理

```typescript
// src/services/paymentService.ts
export async function handlePaymentCallback(paymentData: PaymentData) {
  // 1. 更新数据库
  await updateSubscriptionInDatabase(paymentData);
  
  // 2. 触发支付成功事件
  window.dispatchEvent(new Event('paymentSuccess'));
  
  // AuthGuard会自动监听并刷新订阅状态
}
```

---

## 🔧 调试

### 查看刷新日志

打开浏览器控制台，查看详细的刷新日志：

```
🚀 订阅升级后强制刷新 { userId: "xxx" }
🧹 清除所有缓存层级
📡 从数据库查询最新订阅状态
🔍 开始获取订阅状态 { userId: "xxx" }
✅ Supabase订阅查询完成 { userId: "xxx", duration: "1234ms" }
✅ 订阅状态获取成功 { tier: "pro", source: "supabase", duration: "1250ms" }
✅ 订阅升级后刷新完成 { userId: "xxx", newStatus: {...} }
```

### 验证缓存清除

```typescript
// 刷新前
console.log('刷新前:', useSubscriptionStore.getState().status);

// 执行刷新
await forceRefreshAfterUpgrade(userId);

// 刷新后
console.log('刷新后:', useSubscriptionStore.getState().status);
```

---

## ⚠️ 注意事项

### 1. 等待时间

强制刷新会等待500ms，确保数据库已更新：

```typescript
// 等待数据库更新
await new Promise(resolve => setTimeout(resolve, 500));
```

**原因**：
- 支付回调可能有延迟
- 数据库写入需要时间
- 确保查询到最新数据

### 2. 避免频繁调用

```typescript
// ❌ 错误：频繁调用
setInterval(() => {
  forceRefreshAfterUpgrade(userId);
}, 1000);

// ✅ 正确：只在必要时调用
const handlePaymentSuccess = async () => {
  await forceRefreshAfterUpgrade(userId);
};
```

### 3. 错误处理

```typescript
try {
  await forceRefreshAfterUpgrade(userId);
  toast.success('订阅状态已更新');
} catch (error) {
  console.error('刷新失败:', error);
  toast.error('订阅状态更新失败，请刷新页面');
}
```

---

## 📈 性能影响

### 刷新耗时

| 步骤 | 耗时 |
|------|------|
| 清除缓存 | ~10ms |
| 等待数据库 | 500ms |
| 查询数据库 | ~1000-1500ms |
| 更新Store | ~5ms |
| **总计** | **~1500-2000ms** |

### 对用户体验的影响

- ✅ 订阅升级后立即生效
- ✅ 不需要刷新页面
- ✅ 所有组件自动更新
- ⚠️ 有1.5-2秒的等待时间（可显示加载动画）

---

## 🎉 总结

强制刷新机制确保订阅状态在升级后**立即更新**，提供最佳的用户体验：

1. **自动触发**：监听支付成功和订阅更新事件
2. **清除所有缓存**：内存、localStorage、Supabase
3. **立即查询**：从数据库获取最新数据
4. **全局通知**：触发事件，所有组件自动更新
5. **详细日志**：方便调试和监控

**使用建议**：
- ✅ 支付成功后自动触发
- ✅ 订阅变更后手动调用
- ✅ 监听刷新完成事件
- ❌ 避免频繁调用


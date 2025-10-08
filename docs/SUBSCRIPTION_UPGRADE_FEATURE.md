# 订阅卡片一键升级功能

## 功能概述

在订阅有效期卡片中添加了快速升级按钮，用户可以一键跳转到支付中心并自动预选指定的订阅版本。

## 功能特性

### 1. 智能升级选项显示

根据用户当前订阅等级，显示不同的升级选项：

#### 体验版用户 (trial)
显示 4 个升级选项：
- 专业版月付 (¥39/月)
- 专业版年付 (¥399/年)
- 高级版月付 (¥99/月)
- 高级版年付 (¥999/年)

#### 专业版用户 (pro)
显示升级和切换选项：
- 高级版月付 (¥99/月)
- 高级版年付 (¥999/年)
- 切换到年付 (¥399/年) - 仅月付用户显示

#### 高级版用户 (premium)
显示续费选项：
- 续费月付 (¥99/月)
- 续费年付 (¥999/年)

### 2. URL 参数预选功能

支付中心页面支持通过 URL 参数自动选择订阅版本：

**URL 格式**:
```
https://www.wenpai.xyz/payment-center?tier=<tier>&period=<period>
```

**参数说明**:
- `tier`: 订阅等级
  - `pro` - 专业版
  - `premium` - 高级版
- `period`: 订阅周期
  - `monthly` - 月付
  - `yearly` - 年付

**示例**:
```
# 专业版月付
https://www.wenpai.xyz/payment-center?tier=pro&period=monthly

# 专业版年付
https://www.wenpai.xyz/payment-center?tier=pro&period=yearly

# 高级版月付
https://www.wenpai.xyz/payment-center?tier=premium&period=monthly

# 高级版年付
https://www.wenpai.xyz/payment-center?tier=premium&period=yearly
```

### 3. 自动同步功能

#### 移除本地缓存
- ❌ 不再使用 localStorage 缓存订阅状态
- ❌ 不再使用 localStorage 缓存使用统计
- ✅ 所有数据强制从 Supabase 云端数据库查询

#### 自动刷新机制
- ✅ 每 30 秒自动从云端同步订阅状态
- ✅ 每 30 秒自动从云端同步使用统计
- ✅ 显示上次更新时间

#### 实时性保证
- 用户升级后，最多 30 秒内前端会自动刷新显示新的订阅等级
- 无需手动刷新页面或清除缓存

## 技术实现

### 1. 订阅卡片组件 (SubscriptionExpiryCard.tsx)

```tsx
// 快速升级按钮区域
{subscriptionData.isActive && (
  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50">
    <div className="grid grid-cols-2 gap-2">
      {/* 根据当前等级显示不同的升级选项 */}
      {subscriptionData.tier === 'pro' && (
        <>
          <Button onClick={() => navigate('/payment-center?tier=premium&period=monthly')}>
            高级版月付
          </Button>
          <Button onClick={() => navigate('/payment-center?tier=premium&period=yearly')}>
            高级版年付
          </Button>
        </>
      )}
    </div>
  </div>
)}
```

### 2. 支付中心页面 (PaymentPage.tsx)

```tsx
// 从 URL 参数读取预选的计划和周期
useEffect(() => {
  const searchParams = new URLSearchParams(location.search);
  const tierParam = searchParams.get('tier');
  const periodParam = searchParams.get('period');
  
  if (tierParam) {
    const plan = SUBSCRIPTION_PLANS.find(p => p.tier === tierParam);
    if (plan) {
      setSelectedPlan(plan);
      console.log('🔗 从 URL 参数自动选择计划:', plan.name);
    }
  }
  
  if (periodParam === 'monthly' || periodParam === 'yearly') {
    setSelectedPeriod(periodParam);
    console.log('🔗 从 URL 参数自动选择周期:', periodParam);
  }
}, [location.search]);
```

### 3. 订阅状态 Hook (useSubscriptionStatus.ts)

```tsx
// 移除缓存读取
const [primaryStatus, setPrimaryStatus] = useState<SubscriptionStatus>(() => {
  // 🔧 CRITICAL FIX: 移除缓存读取，强制从数据库查询
  return {
    status: 'inactive',
    tier: 'trial',
    // ...
  };
});

// 每 30 秒自动同步
useEffect(() => {
  if (!targetUserId) return;
  
  logger.info('🔄 启动自动同步：每30秒从云端刷新订阅状态');
  
  const interval = setInterval(() => {
    logger.info('⏰ 自动同步触发：刷新订阅状态');
    fetchSubscriptionStatus();
  }, 30 * 1000); // 30秒

  return () => clearInterval(interval);
}, [targetUserId, fetchSubscriptionStatus]);

// 更新时记录时间
const now = new Date().toISOString();
setLastUpdated(now);
```

### 4. 使用统计 Hook (useUnifiedUsageStats.ts)

```tsx
// 每 30 秒自动同步使用统计
useEffect(() => {
  if (!user?.id) return;
  
  logger.info('🔄 启动自动同步：每30秒从云端刷新使用统计');
  
  const interval = setInterval(() => {
    logger.info('⏰ 自动同步触发：刷新使用统计');
    refreshStats();
  }, 30 * 1000); // 30秒

  return () => clearInterval(interval);
}, [user?.id, refreshStats]);
```

## 用户体验流程

### 场景 1: 体验版用户升级

1. 用户在个人中心查看订阅有效期卡片
2. 看到 4 个升级选项（专业版月付/年付、高级版月付/年付）
3. 点击"专业版月付"按钮
4. 自动跳转到支付中心：`/payment-center?tier=pro&period=monthly`
5. 支付中心自动选中"专业版"和"月付"
6. 用户完成支付
7. 最多 30 秒后，订阅卡片自动刷新显示新的订阅等级

### 场景 2: 专业版用户升级到高级版

1. 用户在个人中心查看订阅有效期卡片
2. 看到升级到高级版的选项
3. 点击"高级版年付"按钮
4. 自动跳转到支付中心：`/payment-center?tier=premium&period=yearly`
5. 支付中心自动选中"高级版"和"年付"
6. 用户完成支付
7. 最多 30 秒后，订阅卡片自动刷新显示新的订阅等级

### 场景 3: 专业版月付用户切换到年付

1. 用户在个人中心查看订阅有效期卡片
2. 看到"切换到年付（更优惠）"选项
3. 点击按钮
4. 自动跳转到支付中心：`/payment-center?tier=pro&period=yearly`
5. 支付中心自动选中"专业版"和"年付"
6. 用户完成支付
7. 最多 30 秒后，订阅卡片自动刷新显示新的周期

## 数据同步机制

### 同步流程

```
用户升级订阅
    ↓
支付成功回调
    ↓
更新 Supabase 数据库
    ↓
前端自动同步（最多30秒）
    ↓
useSubscriptionStatus 查询数据库
    ↓
更新订阅状态
    ↓
UI 自动刷新
```

### 同步日志

```
🔄 启动自动同步：每30秒从云端刷新订阅状态
⏰ 自动同步触发：刷新订阅状态
✅ 订阅状态已更新（无缓存）: {
  userId: '6882df3f2f9efaa6e241dce5',
  tier: 'pro',
  status: 'active',
  hasActive: true,
  lastUpdated: '2025-10-08T04:33:54.412Z'
}
```

## 优势

### 1. 用户体验优化
- ✅ 一键升级，无需手动选择版本
- ✅ 自动预选，减少操作步骤
- ✅ 实时同步，无需手动刷新

### 2. 转化率提升
- ✅ 降低升级门槛
- ✅ 清晰的价格展示
- ✅ 智能推荐（如切换到年付更优惠）

### 3. 技术可靠性
- ✅ 强制云端数据源，避免缓存不一致
- ✅ 自动同步机制，确保数据实时性
- ✅ 上次更新时间显示，增加透明度

## 后续优化建议

### 1. 实时推送
- 使用 Supabase Realtime 订阅数据库变化
- 支付成功后立即推送到前端，无需等待 30 秒

### 2. 优惠提示
- 在升级按钮上显示限时优惠标签
- 计算年付相比月付的节省金额

### 3. 个性化推荐
- 根据用户使用情况推荐合适的订阅版本
- 显示"最适合您"的标签

### 4. A/B 测试
- 测试不同的按钮文案和布局
- 优化转化率

## 相关文件

- `src/components/profile/SubscriptionExpiryCard.tsx` - 订阅卡片组件
- `src/pages/PaymentPage.tsx` - 支付中心页面
- `src/hooks/useSubscriptionStatus.ts` - 订阅状态 Hook
- `src/hooks/useUnifiedUsageStats.ts` - 使用统计 Hook
- `docs/REMOVE_LOCAL_CACHE_PLAN.md` - 移除缓存计划文档
- `scripts/check-subscription-progress.mjs` - 订阅进度检查脚本


# 订阅升级时自动重置使用统计

## 📋 功能说明

当用户升级订阅套餐或付费周期时，系统会自动重置使用统计，让用户从全新的配额开始使用。

## 🎯 升级场景

### ✅ 会重置使用统计的场景

1. **套餐等级升级**
   - 体验版 → 专业版
   - 体验版 → 高级版
   - 专业版 → 高级版

2. **付费周期升级**
   - 专业版月付 → 专业版年付
   - 高级版月付 → 高级版年付

### ❌ 不会重置使用统计的场景

1. **续费**（相同套餐和周期）
   - 专业版月付 → 专业版月付（续费）
   - 高级版年付 → 高级版年付（续费）

2. **降级**（不支持）
   - 系统不支持降级操作

## 🔧 技术实现

### 核心服务

**文件**: `src/services/usageResetService.ts`

#### 1. 判断是否为升级

```typescript
isUpgrade(
  oldTier: SubscriptionTier | null,
  newTier: SubscriptionTier,
  oldPeriod?: SubscriptionPeriod | null,
  newPeriod?: SubscriptionPeriod
): { isUpgrade: boolean; upgradeType: UpgradeType }
```

**升级类型**:
- `tier_upgrade`: 套餐等级升级
- `period_upgrade`: 付费周期升级
- `renewal`: 续费
- `new_subscription`: 新订阅

#### 2. 重置使用统计

```typescript
resetUsageStats(
  userId: string,
  reason: string
): Promise<{
  success: boolean;
  deletedTokenRecords: number;
  deletedUsageRecords: number;
  error?: string;
}>
```

**重置内容**:
- 删除所有 `token_usage_records` 记录
- 删除所有 `usage_count_records` 记录

#### 3. 自动检查并重置

```typescript
checkAndResetOnSubscriptionUpdate(
  userId: string,
  oldTier: SubscriptionTier | null,
  newTier: SubscriptionTier,
  oldPeriod?: SubscriptionPeriod | null,
  newPeriod?: SubscriptionPeriod
): Promise<void>
```

### 集成点

#### 1. 支付回调 (Netlify Functions)

**文件**: `netlify/functions/webhooks/payment-callback.ts`

```typescript
// 检查是否为升级
const isUpgrade = 
  (oldTier === 'trial' && (newTier === 'pro' || newTier === 'premium')) ||
  (oldTier === 'pro' && newTier === 'premium') ||
  (oldTier === newTier && oldPeriod === 'monthly' && newPeriod === 'yearly');

// 如果是升级，重置使用统计
if (isUpgrade) {
  await supabase
    .from('token_usage_records')
    .delete()
    .eq('user_id', userId);
    
  await supabase
    .from('usage_count_records')
    .delete()
    .eq('user_id', userId);
}
```

#### 2. API 支付回调

**文件**: `src/api/webhooks/payment-callback.ts`

同样的逻辑，确保两个入口都能正确处理。

## 📊 升级前后对比

### 升级前

| 项目 | 体验版 | 使用情况 |
|------|--------|----------|
| Token限额 | 100,000 | 已使用 70,374 |
| 使用次数 | 10次 | 已使用 8次 |

### 升级到专业版后

| 项目 | 专业版 | 使用情况 |
|------|--------|----------|
| Token限额 | 200,000 | **已使用 0** ✅ |
| 使用次数 | 30次 | **已使用 0** ✅ |

## 🔍 日志示例

### 升级时的日志

```
[Payment Callback] Detected upgrade, resetting usage stats...
{
  oldTier: 'trial',
  newTier: 'pro',
  oldPeriod: 'monthly',
  newPeriod: 'monthly'
}

🔄 开始重置使用统计 { userId: 'xxx', reason: '订阅tier_upgrade' }
✅ 已删除 26 条Token使用记录 { userId: 'xxx' }
✅ 已删除 34 条使用次数记录 { userId: 'xxx' }
✅ 使用统计重置成功

[Payment Callback] Usage stats reset successfully
```

### 续费时的日志

```
ℹ️  订阅续费，不重置使用统计
{
  userId: 'xxx',
  upgradeType: 'renewal',
  tier: 'pro',
  period: 'monthly'
}
```

## 🧪 测试

### 手动测试脚本

**重置 Token 使用记录**:
```bash
node scripts/reset-token-usage.mjs
```

**清理使用次数记录**:
```bash
node scripts/clean-usage-records.mjs
```

### 测试场景

1. **体验版 → 专业版**
   - 支付成功后，检查使用统计是否重置为 0
   - 检查 Token 限额是否更新为 200,000
   - 检查使用次数限额是否更新为 30

2. **专业版月付 → 专业版年付**
   - 支付成功后，检查使用统计是否重置为 0
   - 检查到期时间是否延长 1 年

3. **专业版续费**
   - 支付成功后，检查使用统计**不应该**重置
   - 检查到期时间是否延长 1 个月

## 📝 注意事项

1. **不可逆操作**: 使用统计重置后无法恢复，请确保逻辑正确
2. **续费保留**: 续费时不会重置，用户可以继续使用剩余配额
3. **自动化**: 整个过程完全自动化，无需手动干预
4. **错误处理**: 重置失败不会阻塞支付流程，会记录错误日志

## 🔗 相关文件

- `src/services/usageResetService.ts` - 核心服务
- `netlify/functions/webhooks/payment-callback.ts` - Netlify 支付回调
- `src/api/webhooks/payment-callback.ts` - API 支付回调
- `scripts/reset-token-usage.mjs` - 手动重置脚本
- `scripts/clean-usage-records.mjs` - 清理脚本

## 🚀 未来优化

1. **通知用户**: 升级后发送通知，告知使用统计已重置
2. **数据归档**: 在重置前将旧数据归档，供用户查看历史
3. **灵活配置**: 支持配置哪些升级场景需要重置
4. **部分重置**: 支持只重置某些功能的使用统计


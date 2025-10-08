# 🔍 Supabase 数据库架构审查报告

**审查日期**: 2025-10-08  
**审查范围**: user_subscriptions, orders, user_usage_logs 表及相关代码

## 📋 执行摘要

### 发现的问题总数
- **CRITICAL**: 13 个（导致 400/500 错误）
- **HIGH**: 12 个（可能导致数据不一致）
- **受影响文件**: 17 个

### 主要问题
1. **字段名不一致**: 代码使用 `subscription_type`，但数据库使用 `tier`
2. **字段名不一致**: 部分代码使用 `duration_type`，但应该使用 `period`（在 user_subscriptions 表中）
3. **缺少字段**: 部分代码未使用 `order_id` 和 `last_payment_id`

## 🚨 CRITICAL 问题详情

### 问题 1: subscription_type 字段名错误

**影响**: 导致 400 错误，无法查询订阅数据

**受影响文件** (13个):
1. `src/services/bufpayService.ts` - 1 处
2. `src/services/dynamicPricingService.ts` - 1 处
3. `src/services/orderService.ts` - 2 处
4. `src/services/orderTransactionService.ts` - 2 处
5. `src/services/subscriptionUpgradeService.ts` - 7 处
6. `src/services/unifiedSubscriptionService.ts` - 2 处
7. `src/components/profile/SubscriptionExpiryCard.tsx` - 4 处
8. `netlify/functions/bufpay-notify.js` - 1 处
9. `netlify/functions/payment-notify.js` - 1 处
10. `netlify/functions/prorated-upgrade.js` - 6 处
11. `netlify/functions/repair-order-permissions.js` - 2 处（注释）
12. `netlify/functions/subscription-status.js` - 7 处
13. `netlify/functions/upgrade-notify.js` - 1 处

**修复方案**:
```typescript
// ❌ 错误
.select('subscription_type')
.eq('subscription_type', 'pro')

// ✅ 正确
.select('tier')
.eq('tier', 'pro')
```

## ⚠️ HIGH 问题详情

### 问题 2: duration_type vs period 字段混用

**影响**: 在 user_subscriptions 表上下文中使用错误字段名

**说明**:
- `orders` 表使用 `duration_type` ✅ 正确
- `user_subscriptions` 表使用 `period` ✅ 正确
- 问题：代码在操作 user_subscriptions 时使用了 duration_type

**受影响文件** (12个):
1. `src/services/bufpayService.ts`
2. `src/services/orderService.ts`
3. `src/services/orderTransactionService.ts`
4. `src/services/standardOrderService.ts`
5. `src/services/unifiedOrderService.ts`
6. `src/components/profile/SubscriptionExpiryCard.tsx`
7. `netlify/functions/bufpay-notify.js`
8. `netlify/functions/create-order.js`
9. `netlify/functions/payment-notify.js`
10. `netlify/functions/repair-order-permissions.js`
11. `netlify/functions/repair-order.js`
12. `netlify/functions/subscription-status.js`

**修复方案**:
```javascript
// 在 orders 表上下文中
const order = { duration_type: 'monthly' }; // ✅ 正确

// 在 user_subscriptions 表上下文中
const subscription = {
  period: order.duration_type  // ✅ 正确：从 orders 映射到 subscriptions
};
```

## 📊 数据库表结构验证

### user_subscriptions 表

**当前字段**:
- ✅ `tier` (TEXT) - 订阅等级
- ✅ `period` (TEXT) - 订阅周期
- ✅ `order_id` (TEXT) - 关联订单ID
- ✅ `last_payment_id` (TEXT) - 最后支付ID
- ✅ `status` (TEXT) - 订阅状态
- ✅ `expires_at` (TIMESTAMPTZ) - 到期时间

**缺失字段**:
- ❌ `subscription_type` - 不存在（应使用 tier）
- ❌ `duration_type` - 不存在（应使用 period）

### orders 表

**当前字段**:
- ✅ `order_id` (TEXT) - 订单ID
- ✅ `product_type` (TEXT) - 产品类型 (professional/premium)
- ✅ `duration_type` (TEXT) - 订阅周期 (monthly/yearly)
- ✅ `status` (TEXT) - 订单状态

## 🔧 修复优先级

### Priority 1: CRITICAL - 立即修复

**文件**: 所有使用 `subscription_type` 的文件

**修复步骤**:
1. 全局搜索 `subscription_type`
2. 在 user_subscriptions 表上下文中替换为 `tier`
3. 更新类型定义
4. 运行测试验证

**预计影响**:
- 修复 400 错误
- 恢复订阅查询功能
- 使用统计正确显示

### Priority 2: HIGH - 尽快修复

**文件**: 在 user_subscriptions 上下文中使用 `duration_type` 的文件

**修复步骤**:
1. 识别代码上下文（orders vs user_subscriptions）
2. 在 user_subscriptions 上下文中使用 `period`
3. 确保从 orders 到 subscriptions 的映射正确

**预计影响**:
- 数据一致性提升
- 避免未来的字段错误

## 📝 修复清单

### 需要修复的文件

#### Services (6个)
- [ ] `src/services/bufpayService.ts`
- [ ] `src/services/dynamicPricingService.ts`
- [ ] `src/services/orderService.ts`
- [ ] `src/services/orderTransactionService.ts`
- [ ] `src/services/subscriptionUpgradeService.ts`
- [ ] `src/services/unifiedSubscriptionService.ts`

#### Components (1个)
- [ ] `src/components/profile/SubscriptionExpiryCard.tsx`

#### Netlify Functions (10个)
- [ ] `netlify/functions/bufpay-notify.js`
- [ ] `netlify/functions/payment-notify.js`
- [ ] `netlify/functions/prorated-upgrade.js`
- [ ] `netlify/functions/repair-order-permissions.js`
- [ ] `netlify/functions/subscription-status.js`
- [ ] `netlify/functions/upgrade-notify.js`
- [ ] `netlify/functions/create-order.js`
- [ ] `netlify/functions/repair-order.js`

## 🎯 修复后验证

### 验证步骤

1. **代码审查**:
   ```bash
   node scripts/audit-code-field-names.mjs
   ```
   应该显示: ✅ 未发现严重问题

2. **数据库查询测试**:
   ```sql
   -- 应该成功返回数据
   SELECT * FROM user_subscriptions 
   WHERE user_id = '6882df3f2f9efaa6e241dce5' 
   AND tier = 'pro';
   ```

3. **前端功能测试**:
   - 登录后订阅状态正确显示
   - 使用统计正确显示
   - 不再有 400 错误

4. **API 端点测试**:
   ```bash
   curl -X POST https://www.wenpai.xyz/.netlify/functions/subscription-status \
     -H "Content-Type: application/json" \
     -d '{"userId": "6882df3f2f9efaa6e241dce5"}'
   ```

## 📈 预期改进

修复完成后:
- ✅ 消除所有 400 错误
- ✅ 订阅查询成功率 100%
- ✅ 使用统计正确显示
- ✅ 代码与数据库字段完全一致
- ✅ 减少未来维护成本

## 🚀 下一步行动

1. **立即执行**: 修复所有 CRITICAL 问题
2. **今日完成**: 修复所有 HIGH 问题
3. **本周完成**: 添加自动化测试防止回归
4. **持续改进**: 建立字段命名规范文档

## 📞 需要支持

如有问题，请参考:
- 详细修复指南: `docs/FINAL_SOLUTION.md`
- 代码审查脚本: `scripts/audit-code-field-names.mjs`
- 数据库审查脚本: `supabase/migrations/comprehensive_database_audit.sql`


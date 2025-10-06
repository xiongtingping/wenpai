# 订阅状态修复指南

## 问题描述
用户ID: `68b6fd961774b4e49242c916`  
支付时间: 2025年10月6日早上9点左右  
支付方式: 支付宝  
问题: 支付成功但订阅状态未更新，仍显示为体验版

---

## 诊断步骤

### 1. 检查订单记录

在Supabase Dashboard中执行以下SQL：

```sql
-- 查询用户的所有订单
SELECT 
  order_id,
  user_id,
  product_type,
  amount,
  status,
  paid_at,
  created_at,
  notify_data
FROM orders
WHERE user_id = '68b6fd961774b4e49242c916'
ORDER BY created_at DESC
LIMIT 10;
```

**预期结果**：应该能看到10月6日早上的订单记录

---

### 2. 检查订阅记录

```sql
-- 查询用户的订阅记录
SELECT 
  id,
  user_id,
  subscription_type,
  status,
  started_at,
  expires_at,
  order_id,
  created_at
FROM user_subscriptions
WHERE user_id = '68b6fd961774b4e49242c916'
ORDER BY created_at DESC;
```

**预期结果**：
- 如果**有记录**但 `status != 'active'` 或 `expires_at < NOW()`，需要更新状态
- 如果**没有记录**，需要手动创建

---

## 修复方案

### 情况1: 订单已支付但没有订阅记录

**执行以下SQL创建订阅记录**：

```sql
-- 首先获取最新的已支付订单信息
WITH latest_order AS (
  SELECT 
    order_id,
    user_id,
    product_type,
    duration_type,
    paid_at
  FROM orders
  WHERE user_id = '68b6fd961774b4e49242c916'
    AND status = 'paid'
  ORDER BY paid_at DESC
  LIMIT 1
)
-- 插入订阅记录
INSERT INTO user_subscriptions (
  user_id,
  subscription_type,
  status,
  started_at,
  expires_at,
  order_id,
  created_at,
  updated_at
)
SELECT 
  user_id,
  product_type,
  'active',
  paid_at,
  CASE 
    WHEN duration_type = 'yearly' THEN paid_at + INTERVAL '1 year'
    ELSE paid_at + INTERVAL '1 month'
  END,
  order_id,
  NOW(),
  NOW()
FROM latest_order
RETURNING *;
```

---

### 情况2: 订阅记录存在但状态不对

**更新订阅状态**：

```sql
-- 更新订阅状态为active并延长到期时间
UPDATE user_subscriptions
SET 
  status = 'active',
  expires_at = CASE 
    WHEN subscription_type LIKE '%yearly%' THEN NOW() + INTERVAL '1 year'
    ELSE NOW() + INTERVAL '1 month'
  END,
  updated_at = NOW()
WHERE user_id = '68b6fd961774b4e49242c916'
  AND id = (
    SELECT id 
    FROM user_subscriptions 
    WHERE user_id = '68b6fd961774b4e49242c916'
    ORDER BY created_at DESC 
    LIMIT 1
  )
RETURNING *;
```

---

### 情况3: 订单状态不对

**更新订单状态为已支付**：

```sql
-- 更新订单状态
UPDATE orders
SET 
  status = 'paid',
  paid_at = '2025-10-06 09:00:00+00',  -- 替换为实际支付时间
  updated_at = NOW()
WHERE user_id = '68b6fd961774b4e49242c916'
  AND order_id = 'ORDER_ID_HERE'  -- 替换为实际订单ID
RETURNING *;
```

---

## 验证修复

### 1. 在Supabase中验证

```sql
-- 验证订阅记录
SELECT 
  user_id,
  subscription_type,
  status,
  started_at,
  expires_at,
  expires_at > NOW() as is_valid
FROM user_subscriptions
WHERE user_id = '68b6fd961774b4e49242c916'
  AND status = 'active'
ORDER BY created_at DESC
LIMIT 1;
```

**预期结果**：
- `status` = 'active'
- `is_valid` = true
- `expires_at` 应该是未来的日期

---

### 2. 在应用中验证

1. **清除缓存**：
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

2. **重新登录**

3. **访问个人资料页面**，检查：
   - 订阅状态应该显示为"专业版"或"高级版"
   - 订阅有效期应该显示正确的到期时间
   - Token使用量限额应该更新

---

## 防止复发

### 1. 检查支付回调日志

在Netlify Functions日志中查找：

```
netlify functions:log payment-notify
```

查找是否有错误日志或失败记录。

---

### 2. 检查Supabase RLS策略

确保 `user_subscriptions` 表的RLS策略允许Service Role写入：

```sql
-- 检查RLS策略
SELECT * FROM pg_policies 
WHERE tablename = 'user_subscriptions';
```

---

### 3. 添加监控

在 `payment-notify.js` 中添加更详细的日志：

```javascript
console.log('📝 创建订阅记录:', {
  userId: order.user_id,
  subscriptionType: order.product_type,
  expiresAt: subscriptionData.expires_at
});
```

---

## 紧急联系

如果以上方法都无法解决，请提供以下信息：

1. **订单ID**（从Supabase查询结果中获取）
2. **支付宝交易号**
3. **支付金额**
4. **Netlify Functions日志**（如果有权限访问）

---

**最后更新**: 2025-10-06  
**修复状态**: 待执行


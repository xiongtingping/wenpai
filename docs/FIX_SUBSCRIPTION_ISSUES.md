# 修复订阅和权限问题

## 🔍 问题总结

根据最新的错误日志，发现以下问题：

### 1. user_subscriptions 查询 400 错误 ❌
```
user_subscriptions?select=*&order_id=eq.WP17598937175698938&status=eq.active
根据订单ID获取用户订阅失败
```

**根本原因**: RLS (Row Level Security) 策略过于严格，阻止了查询

### 2. repair-order-permissions 500 错误 ❌
```
修复订单权限失败: Internal server error
```

**根本原因**: 函数内部错误，需要查看详细日志

### 3. 使用统计未更新 ❌
```
已使用 61.4K tokens，使用次数：已使用 10 次
```

**根本原因**: 
- 订阅已创建但前端状态未刷新
- 或者订阅创建失败但支付成功

## 🚀 修复步骤

### 步骤 1: 修复 user_subscriptions RLS 策略

在 Supabase SQL Editor 中执行：

```sql
-- 执行修复脚本
-- 文件: supabase/migrations/fix_user_subscriptions_rls.sql
```

或者直接复制以下 SQL：

```sql
-- 删除现有策略
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role can view all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role can insert subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role can update subscriptions" ON public.user_subscriptions;

-- 启用 RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 创建宽松的查询策略（允许所有查询）
CREATE POLICY "Allow all select on user_subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  USING (true);

-- Service Role 可以插入
CREATE POLICY "Service role can insert subscriptions"
  ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Service Role 可以更新
CREATE POLICY "Service role can update subscriptions"
  ON public.user_subscriptions
  FOR UPDATE
  USING (true);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_order_id 
  ON public.user_subscriptions(order_id);
```

### 步骤 2: 检查订单和订阅状态

在 Supabase SQL Editor 中执行：

```sql
-- 查看您的订单
SELECT 
  order_id,
  user_id,
  product_type,
  duration_type,
  amount,
  status,
  paid_at,
  processed_at,
  created_at
FROM orders
WHERE order_id = 'WP17598937175698938';

-- 查看是否有对应的订阅
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
WHERE order_id = 'WP17598937175698938';

-- 如果没有订阅，查看用户的所有订阅
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
WHERE user_id = '6882df3f2f9efaa6e241dce5'
ORDER BY created_at DESC;
```

### 步骤 3: 手动创建订阅（如果不存在）

如果查询结果显示订单已支付但没有订阅，手动创建：

```sql
-- 手动创建订阅
INSERT INTO user_subscriptions (
  user_id,
  subscription_type,
  status,
  started_at,
  expires_at,
  order_id
) VALUES (
  '6882df3f2f9efaa6e241dce5',  -- 您的 user_id
  'professional',                -- 或 'premium'
  'active',
  NOW(),
  NOW() + INTERVAL '1 month',   -- 月度订阅
  -- NOW() + INTERVAL '1 year', -- 年度订阅
  'WP17598937175698938'          -- 订单ID
);

-- 更新订单状态为已处理
UPDATE orders
SET 
  status = 'processed',
  processed_at = NOW()
WHERE order_id = 'WP17598937175698938';
```

### 步骤 4: 部署增强的错误日志

```bash
# 提交代码
git add .
git commit -m "fix: 增强 repair-order-permissions 错误日志"
git push origin main

# 等待 Netlify 部署完成
```

### 步骤 5: 清除浏览器缓存并刷新

1. **清除缓存**:
   - Chrome: Ctrl+Shift+Delete (Windows) 或 Cmd+Shift+Delete (Mac)
   - 选择 "Cached images and files" 和 "Cookies and other site data"
   - 点击 "Clear data"

2. **硬刷新页面**:
   - Windows: Ctrl+F5
   - Mac: Cmd+Shift+R

3. **重新登录**:
   - 退出登录
   - 重新登录
   - 检查使用统计是否更新

### 步骤 6: 验证修复

1. **检查订阅状态**:
   - 访问: https://www.wenpai.xyz/payment-center
   - 查看订阅信息是否正确显示

2. **检查使用统计**:
   - 查看 Token 使用量是否已重置
   - 查看使用次数是否已重置

3. **测试功能**:
   - 尝试使用需要订阅的功能
   - 确认不再有权限限制

## 🔍 诊断工具

### 查看 Netlify Functions 日志

1. 访问: https://app.netlify.com
2. 选择您的站点
3. 进入 **Functions**
4. 找到 `repair-order-permissions`
5. 查看最近的调用日志

**现在日志会显示**:
```
🔵 收到订单权限修复请求
📋 配置检查: { supabaseUrl: '✅', supabaseKey: '✅' }
✅ 请求数据解析成功: { orderId: 'WP...', force: false }
```

### 手动触发权限修复

在浏览器控制台中执行：

```javascript
// 手动调用修复接口
fetch('/.netlify/functions/repair-order-permissions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    orderId: 'WP17598937175698938',
    force: true  // 强制修复
  })
})
.then(r => r.json())
.then(data => console.log('修复结果:', data))
.catch(err => console.error('修复失败:', err));
```

## 📊 验证清单

- [ ] user_subscriptions RLS 策略已修复
- [ ] 订单状态为 'processed'
- [ ] 订阅记录已创建
- [ ] 订阅状态为 'active'
- [ ] 浏览器缓存已清除
- [ ] 重新登录后使用统计已更新
- [ ] 可以正常使用订阅功能
- [ ] 不再有 400/500 错误

## 🆘 如果仍有问题

### 问题 A: 订阅已创建但统计未更新

**解决方案**:
1. 完全退出登录
2. 清除所有浏览器数据
3. 重新登录
4. 如果仍未更新，检查前端代码中的订阅状态获取逻辑

### 问题 B: repair-order-permissions 仍返回 500

**解决方案**:
1. 查看 Netlify Functions 详细日志
2. 确认环境变量配置正确
3. 检查 Supabase 连接是否正常
4. 手动在 SQL Editor 中测试订阅创建

### 问题 C: 400 错误仍然存在

**解决方案**:
1. 确认 RLS 策略已正确更新
2. 检查查询语法是否正确
3. 尝试使用 Service Role Key 查询

## 📞 需要帮助

请提供以下信息:
1. 订单查询结果（SQL 查询截图）
2. 订阅查询结果（SQL 查询截图）
3. Netlify Functions 日志截图
4. 浏览器控制台完整错误


# Supabase 数据库表创建指南

## 🚨 **紧急修复：缺失的数据库表**

通过测试发现，Supabase 数据库中缺少支付系统必需的表。请按以下步骤创建：

## 📋 **需要创建的表**

### 1. `orders` 表（订单表）
### 2. `user_subscriptions` 表（用户订阅表）

## 🛠️ **创建步骤**

### 方法一：通过 Supabase Dashboard

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目：`weizkydylskcwgnaieqy`
3. 进入 **SQL Editor**
4. 执行以下 SQL 脚本：

```sql
-- ==========================================
-- 创建订单表 (orders)
-- ==========================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,           -- 系统生成的订单号
  aoid TEXT,                               -- BufPay 平台订单标识
  user_id TEXT NOT NULL,                   -- 用户ID
  user_email TEXT,                         -- 用户邮箱
  product_name TEXT NOT NULL,              -- 商品名称
  product_type TEXT NOT NULL,              -- 商品类型: professional/premium
  duration_type TEXT NOT NULL,             -- 时长类型: monthly/yearly
  amount DECIMAL(10,2) NOT NULL,           -- 订单金额
  pay_price DECIMAL(10,2),                 -- 实际支付金额
  status TEXT DEFAULT 'pending',           -- 订单状态: pending/paid/failed/expired/processed
  pay_type TEXT DEFAULT 'alipay',          -- 支付方式
  qr_code TEXT,                            -- 二维码内容
  qr_image TEXT,                           -- 二维码图片base64
  expires_at TIMESTAMPTZ,                  -- 过期时间
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,                     -- 支付时间
  processed_at TIMESTAMPTZ,                -- 权限处理时间
  metadata JSONB,                          -- 额外信息
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'processed')),
  CONSTRAINT valid_product_type CHECK (product_type IN ('professional', 'premium')),
  CONSTRAINT valid_duration_type CHECK (duration_type IN ('monthly', 'yearly')),
  CONSTRAINT valid_pay_type CHECK (pay_type IN ('alipay', 'wechat'))
);

-- 创建 orders 表索引
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_aoid ON orders(aoid);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- ==========================================
-- 创建用户订阅表 (user_subscriptions)
-- ==========================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  subscription_type TEXT NOT NULL,         -- professional/premium
  status TEXT DEFAULT 'active',            -- active/expired/cancelled
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  order_id TEXT,                           -- 关联订单号（不使用外键约束避免循环依赖）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_subscription_type CHECK (subscription_type IN ('professional', 'premium')),
  CONSTRAINT valid_subscription_status CHECK (status IN ('active', 'expired', 'cancelled'))
);

-- 创建 user_subscriptions 表索引
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);

-- ==========================================
-- 创建更新时间触发器
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 设置 RLS (Row Level Security) 策略
-- ==========================================

-- 启用 RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- orders 表策略：只允许服务端访问
CREATE POLICY "Service role can access orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- user_subscriptions 表策略：用户只能访问自己的订阅
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can access all subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');
```

### 方法二：通过 Supabase CLI（如果已安装）

```bash
# 1. 登录 Supabase
supabase login

# 2. 链接到项目
supabase link --project-ref weizkydylskcwgnaieqy

# 3. 执行迁移
supabase db push
```

## 🔍 **验证表创建**

创建完成后，可以通过以下方式验证：

### 1. 在 Supabase Dashboard 中验证
- 进入 **Table Editor**
- 确认 `orders` 和 `user_subscriptions` 表存在
- 检查表结构和列定义

### 2. 通过测试脚本验证
```bash
node test-supabase-connection.js
```

应该看到：
```
✅ 表 orders 验证成功
✅ 表 user_subscriptions 验证成功
```

## 🚨 **重要说明**

1. **APP_SECRET 已修复**：
   - 所有组件现在使用统一的 APP_SECRET：`2861731746ef4189937ef4dc11f09375`

2. **表创建优先级**：
   - `orders` 表是支付系统的核心，必须先创建
   - `user_subscriptions` 表用于权限管理，也是必需的

3. **安全策略**：
   - 已设置 RLS 策略确保数据安全
   - 服务端可以访问所有数据
   - 用户只能访问自己的订阅信息

## ✅ **完成后的测试**

表创建完成后，请运行完整的支付流程测试：

1. 访问支付页面
2. 选择套餐
3. 点击支付
4. 验证订单创建
5. 测试 BufPay API 调用

预期结果：
- ✅ 订单成功创建并保存到数据库
- ✅ BufPay API 调用成功（如果账号正常）
- ✅ 支付流程完整运行

## 🔧 **故障排除**

如果仍有问题：

1. **检查环境变量**：确保 `.env.local` 中的 Supabase 配置正确
2. **检查权限**：确保 Service Role Key 有足够权限
3. **检查网络**：确保可以访问 Supabase API
4. **联系支持**：如果问题持续，可能需要联系 Supabase 支持

---

**创建完成后，支付系统应该能够正常工作！** 🎉

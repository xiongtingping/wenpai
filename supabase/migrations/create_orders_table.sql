-- 创建订单表
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
  status TEXT DEFAULT 'pending',           -- 订单状态: pending/paid/failed/expired
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_aoid ON orders(aoid);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 创建用户订阅表
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  subscription_type TEXT NOT NULL,         -- professional/premium
  status TEXT DEFAULT 'active',            -- active/expired/cancelled
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  order_id TEXT REFERENCES orders(order_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_subscription_type CHECK (subscription_type IN ('professional', 'premium')),
  CONSTRAINT valid_subscription_status CHECK (status IN ('active', 'expired', 'cancelled'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);

-- 创建更新时间触发器
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

-- 插入示例定价数据
INSERT INTO pricing_plans (plan_type, duration_type, price, features, is_active) VALUES
('professional', 'monthly', 29.00, '["AI内容适配", "全网雷达", "创意魔方", "我的资料库", "品牌库", "深色主题"]', true),
('professional', 'yearly', 299.00, '["AI内容适配", "全网雷达", "创意魔方", "我的资料库", "品牌库", "深色主题"]', true),
('premium', 'monthly', 59.00, '["所有专业版功能", "高级AI模型", "无限制使用", "优先客服", "全部主题", "高级分析"]', true),
('premium', 'yearly', 599.00, '["所有专业版功能", "高级AI模型", "无限制使用", "优先客服", "全部主题", "高级分析"]', true)
ON CONFLICT (plan_type, duration_type) DO UPDATE SET
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

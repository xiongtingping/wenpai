-- 添加 orders 表约束和索引优化
-- 防止订单重复和提升查询性能

-- 1. 添加唯一约束
ALTER TABLE orders ADD CONSTRAINT orders_order_id_unique UNIQUE (order_id);

-- 2. 添加 aoid 唯一约束（防止重复处理）
ALTER TABLE orders ADD CONSTRAINT orders_aoid_unique UNIQUE (aoid) WHERE aoid IS NOT NULL;

-- 3. 添加查询性能索引
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON orders (expires_at);

-- 4. 添加订阅表性能索引
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_order_id ON user_subscriptions (order_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions (expires_at);

-- 5. 添加数据完整性约束
ALTER TABLE orders ADD CONSTRAINT orders_amount_positive CHECK (amount > 0);
ALTER TABLE orders ADD CONSTRAINT orders_status_valid CHECK (status IN ('pending', 'paid', 'processed', 'failed', 'expired'));

ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_status_valid CHECK (status IN ('active', 'expired', 'cancelled'));
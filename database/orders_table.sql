-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL, -- 对外订单号
    user_id TEXT NOT NULL,
    user_email TEXT,
    
    -- 订单基本信息
    product_name TEXT NOT NULL,
    product_type TEXT NOT NULL, -- 'professional', 'premium'
    duration_type TEXT NOT NULL, -- 'monthly', 'yearly'
    
    -- 金额信息（以分为单位）
    amount INTEGER NOT NULL,
    original_amount INTEGER,
    discount_amount INTEGER DEFAULT 0,
    
    -- 支付信息
    pay_type TEXT NOT NULL, -- 'alipay', 'wechat'
    payment_platform TEXT DEFAULT 'bufpay',
    platform_order_id TEXT, -- 支付平台订单号
    
    -- 状态管理
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'cancelled', 'refunded'
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    -- 回调信息
    notify_data JSONB, -- 存储支付平台回调的原始数据
    notify_verified BOOLEAN DEFAULT FALSE,
    
    -- 订阅信息（支付成功后创建的订阅）
    subscription_id UUID,
    
    -- 元数据
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT orders_status_check CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_platform_order_id ON orders(platform_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 创建订单状态历史表（可选，用于审计）
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    from_status TEXT,
    to_status TEXT NOT NULL,
    reason TEXT,
    changed_by TEXT, -- 'system', 'admin', 'user'
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_changed_at ON order_status_history(changed_at);

-- RLS 策略
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的订单
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid()::text = user_id);

-- 用户可以创建订单
CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 只有服务端可以更新订单状态（通过 service_role）
CREATE POLICY "Service role can update orders" ON orders
    FOR UPDATE USING (auth.role() = 'service_role');

-- 订单状态历史的策略
CREATE POLICY "Users can view own order history" ON order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_status_history.order_id 
            AND orders.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Service role can manage order history" ON order_status_history
    FOR ALL USING (auth.role() = 'service_role');

-- 创建订单号生成函数
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TEXT AS $$
DECLARE
    order_id TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        -- 生成格式：WP + YYYYMMDD + 6位随机数字
        order_id := 'WP' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- 检查是否已存在
        SELECT COUNT(*) INTO exists_check FROM orders WHERE orders.order_id = order_id;
        
        -- 如果不存在，跳出循环
        IF exists_check = 0 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN order_id;
END;
$$ LANGUAGE plpgsql;

-- 创建订单状态更新触发器
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- 只有状态发生变化时才记录
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (order_id, from_status, to_status, reason, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, 'Status updated', 'system');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_order_status_change
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();

-- 示例查询函数
CREATE OR REPLACE FUNCTION get_user_orders(p_user_id TEXT, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    order_id TEXT,
    product_name TEXT,
    amount INTEGER,
    status TEXT,
    created_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.order_id,
        o.product_name,
        o.amount,
        o.status,
        o.created_at,
        o.paid_at
    FROM orders o
    WHERE o.user_id = p_user_id
    ORDER BY o.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

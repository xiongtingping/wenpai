-- Token使用量管理相关数据库表结构
-- 用于Supabase数据库

-- 1. Token使用记录表
CREATE TABLE IF NOT EXISTS token_usage_records (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature VARCHAR(100) NOT NULL,
    task_type VARCHAR(100),
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    model VARCHAR(100) NOT NULL,
    content_summary TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 用户订阅信息表
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL DEFAULT 'trial', -- trial, pro, premium
    monthly_token_limit INTEGER NOT NULL DEFAULT 100000,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Token使用统计视图（月度）
CREATE OR REPLACE VIEW monthly_token_usage AS
SELECT 
    user_id,
    DATE_TRUNC('month', created_at) as month,
    SUM(total_tokens) as total_tokens,
    SUM(input_tokens) as input_tokens,
    SUM(output_tokens) as output_tokens,
    COUNT(*) as request_count,
    COUNT(DISTINCT feature) as feature_count,
    AVG(total_tokens) as avg_tokens_per_request
FROM token_usage_records
WHERE success = true
GROUP BY user_id, DATE_TRUNC('month', created_at);

-- 4. Token使用统计视图（日度）
CREATE OR REPLACE VIEW daily_token_usage AS
SELECT 
    user_id,
    DATE_TRUNC('day', created_at) as day,
    SUM(total_tokens) as total_tokens,
    SUM(input_tokens) as input_tokens,
    SUM(output_tokens) as output_tokens,
    COUNT(*) as request_count,
    COUNT(DISTINCT feature) as feature_count
FROM token_usage_records
WHERE success = true
GROUP BY user_id, DATE_TRUNC('day', created_at);

-- 5. 功能使用统计视图
CREATE OR REPLACE VIEW feature_usage_stats AS
SELECT 
    user_id,
    feature,
    DATE_TRUNC('month', created_at) as month,
    SUM(total_tokens) as total_tokens,
    COUNT(*) as request_count,
    AVG(total_tokens) as avg_tokens_per_request,
    MIN(created_at) as first_used,
    MAX(created_at) as last_used
FROM token_usage_records
WHERE success = true
GROUP BY user_id, feature, DATE_TRUNC('month', created_at);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON token_usage_records(created_at);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_month ON token_usage_records(user_id, DATE_TRUNC('month', created_at));
CREATE INDEX IF NOT EXISTS idx_token_usage_feature ON token_usage_records(feature);
CREATE INDEX IF NOT EXISTS idx_token_usage_success ON token_usage_records(success);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier);

-- 创建触发器以自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_token_usage_records_updated_at 
    BEFORE UPDATE ON token_usage_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建RLS (Row Level Security) 策略
ALTER TABLE token_usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Token使用记录表的RLS策略
CREATE POLICY "Users can view their own token usage records" ON token_usage_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own token usage records" ON token_usage_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own token usage records" ON token_usage_records
    FOR UPDATE USING (auth.uid() = user_id);

-- 用户订阅表的RLS策略
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" ON user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- 创建函数：获取用户当前月度Token使用量
CREATE OR REPLACE FUNCTION get_user_monthly_token_usage(p_user_id UUID, p_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    total_tokens BIGINT,
    input_tokens BIGINT,
    output_tokens BIGINT,
    request_count BIGINT,
    feature_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(tur.total_tokens), 0)::BIGINT as total_tokens,
        COALESCE(SUM(tur.input_tokens), 0)::BIGINT as input_tokens,
        COALESCE(SUM(tur.output_tokens), 0)::BIGINT as output_tokens,
        COUNT(*)::BIGINT as request_count,
        COUNT(DISTINCT tur.feature)::BIGINT as feature_count
    FROM token_usage_records tur
    WHERE tur.user_id = p_user_id
        AND tur.success = true
        AND DATE_TRUNC('month', tur.created_at) = DATE_TRUNC('month', p_month);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数：检查用户Token限额
CREATE OR REPLACE FUNCTION check_user_token_limit(p_user_id UUID, p_estimated_tokens INTEGER DEFAULT 0)
RETURNS TABLE (
    allowed BOOLEAN,
    monthly_limit INTEGER,
    monthly_used BIGINT,
    monthly_remaining BIGINT,
    usage_percentage NUMERIC
) AS $$
DECLARE
    v_subscription RECORD;
    v_usage RECORD;
BEGIN
    -- 获取用户订阅信息
    SELECT tier, monthly_token_limit INTO v_subscription
    FROM user_subscriptions
    WHERE user_id = p_user_id;
    
    -- 如果没有订阅信息，使用默认值
    IF NOT FOUND THEN
        v_subscription.tier := 'trial';
        v_subscription.monthly_token_limit := 100000;
    END IF;
    
    -- 获取当前月度使用量
    SELECT * INTO v_usage
    FROM get_user_monthly_token_usage(p_user_id);
    
    RETURN QUERY
    SELECT 
        (v_usage.total_tokens + p_estimated_tokens) <= v_subscription.monthly_token_limit as allowed,
        v_subscription.monthly_token_limit as monthly_limit,
        v_usage.total_tokens as monthly_used,
        GREATEST(0, v_subscription.monthly_token_limit - v_usage.total_tokens)::BIGINT as monthly_remaining,
        CASE 
            WHEN v_subscription.monthly_token_limit > 0 THEN
                ROUND((v_usage.total_tokens::NUMERIC / v_subscription.monthly_token_limit::NUMERIC) * 100, 2)
            ELSE 0
        END as usage_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 插入默认套餐配置数据
INSERT INTO user_subscriptions (user_id, tier, monthly_token_limit)
SELECT id, 'trial', 100000
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- 创建定时清理过期记录的函数
CREATE OR REPLACE FUNCTION cleanup_old_token_records()
RETURNS void AS $$
BEGIN
    -- 删除6个月前的记录
    DELETE FROM token_usage_records
    WHERE created_at < NOW() - INTERVAL '6 months';
    
    -- 记录清理日志
    RAISE NOTICE 'Cleaned up old token usage records older than 6 months';
END;
$$ LANGUAGE plpgsql;

-- 注释：可以设置定时任务来执行清理
-- SELECT cron.schedule('cleanup-token-records', '0 2 1 * *', 'SELECT cleanup_old_token_records();');

-- ============================================================================
-- 8. 统计视图
-- ============================================================================

-- 月度Token使用统计视图
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

-- 日度Token使用统计视图
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

-- 功能使用统计视图
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

-- ============================================================================
-- 9. 存储过程和函数
-- ============================================================================

-- 获取用户当前月度Token使用量
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

-- 检查用户Token限额
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

-- 获取用户使用次数统计
CREATE OR REPLACE FUNCTION get_user_usage_count(p_user_id UUID)
RETURNS TABLE (
    total_used INTEGER,
    monthly_used INTEGER,
    daily_used INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(amount), 0)::INTEGER as total_used,
        COALESCE(SUM(CASE WHEN used_at >= DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END), 0)::INTEGER as monthly_used,
        COALESCE(SUM(CASE WHEN used_at >= DATE_TRUNC('day', CURRENT_DATE) THEN amount ELSE 0 END), 0)::INTEGER as daily_used
    FROM usage_count_records
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 清理过期记录函数
CREATE OR REPLACE FUNCTION cleanup_old_records()
RETURNS void AS $$
BEGIN
    -- 删除6个月前的Token使用记录
    DELETE FROM token_usage_records
    WHERE created_at < NOW() - INTERVAL '6 months';

    -- 删除3个月前的聊天历史
    DELETE FROM user_chat_history
    WHERE created_at < NOW() - INTERVAL '3 months';

    -- 删除1年前的邀请事件
    DELETE FROM user_invite_events
    WHERE created_at < NOW() - INTERVAL '1 year';

    RAISE NOTICE 'Cleaned up old records';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. 初始化数据
-- ============================================================================

-- 为现有用户创建默认订阅
INSERT INTO user_subscriptions (user_id, tier, monthly_token_limit, usage_count_limit)
SELECT id, 'trial', 100000, 10
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- 为现有用户创建默认邀请统计
INSERT INTO user_invite_stats (user_id)
SELECT id
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_invite_stats)
ON CONFLICT (user_id) DO NOTHING;

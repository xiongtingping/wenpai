-- ============================================================================
-- 5. 启用 RLS (Row Level Security) 和创建策略
-- ============================================================================

-- 启用所有表的RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_count_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invite_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invite_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invite_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brand_corpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_chat_history ENABLE ROW LEVEL SECURITY;

-- 用户基本信息表RLS策略
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 订阅信息表RLS策略
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscription" ON user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscription" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Token使用记录表RLS策略
CREATE POLICY "Users can view their own token usage" ON token_usage_records
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own token usage" ON token_usage_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 使用次数记录表RLS策略
CREATE POLICY "Users can view their own usage count" ON usage_count_records
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own usage count" ON usage_count_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 邀请关系表RLS策略
CREATE POLICY "Users can view invites they sent or received" ON user_invite_relations
    FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);
CREATE POLICY "Users can create invite relations as inviter" ON user_invite_relations
    FOR INSERT WITH CHECK (auth.uid() = inviter_id);
CREATE POLICY "Users can update invites they sent" ON user_invite_relations
    FOR UPDATE USING (auth.uid() = inviter_id);

-- 邀请统计表RLS策略
CREATE POLICY "Users can view their own invite stats" ON user_invite_stats
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own invite stats" ON user_invite_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own invite stats" ON user_invite_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- 邀请事件表RLS策略
CREATE POLICY "Users can view invite events they're involved in" ON user_invite_events
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = inviter_id OR auth.uid() = invitee_id);
CREATE POLICY "Users can insert invite events" ON user_invite_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户文件表RLS策略
CREATE POLICY "Users can manage their own files" ON user_files
    FOR ALL USING (auth.uid() = user_id);

-- 用户笔记表RLS策略
CREATE POLICY "Users can manage their own notes" ON user_notes
    FOR ALL USING (auth.uid() = user_id);

-- 品牌语料库表RLS策略
CREATE POLICY "Users can manage their own brand corpus" ON user_brand_corpus
    FOR ALL USING (auth.uid() = user_id);

-- 收藏夹表RLS策略
CREATE POLICY "Users can manage their own library items" ON user_library_items
    FOR ALL USING (auth.uid() = user_id);

-- 聊天历史表RLS策略
CREATE POLICY "Users can manage their own chat history" ON user_chat_history
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 6. 创建统计视图
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
-- 7. 创建存储过程和函数
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
-- 8. 初始化数据
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

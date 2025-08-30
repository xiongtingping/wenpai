-- 文派AI - Supabase数据库完整建表脚本
-- 基于项目需求和现有服务创建必需的表格

-- ============================================================================
-- 1. 用户相关表格
-- ============================================================================

-- 用户扩展信息表 (使用Authing认证，user_id为VARCHAR格式)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    nickname VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 用户订阅信息表 (使用Authing认证，user_id为VARCHAR格式)
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    tier VARCHAR(20) NOT NULL DEFAULT 'trial', -- trial, pro, premium
    monthly_token_limit INTEGER NOT NULL DEFAULT 100000,
    usage_count_limit INTEGER NOT NULL DEFAULT 10,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT false,
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================================
-- 2. Token使用量相关表格
-- ============================================================================

-- Token使用记录表 (使用Authing认证，user_id为VARCHAR格式)
CREATE TABLE IF NOT EXISTS token_usage_records (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    feature VARCHAR(100) NOT NULL,
    task_type VARCHAR(100),
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    model VARCHAR(100) NOT NULL,
    content_summary TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 使用次数记录表 (使用Authing认证，user_id为VARCHAR格式)
CREATE TABLE IF NOT EXISTS usage_count_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    feature VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL DEFAULT 1,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. 邀请系统表格
-- ============================================================================

-- 邀请关系表 (使用Authing认证，user_id为VARCHAR格式)
CREATE TABLE IF NOT EXISTS user_invite_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id VARCHAR(100) NOT NULL,
    invitee_id VARCHAR(100) NOT NULL,
    invite_code VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, rewarded
    source VARCHAR(20) NOT NULL DEFAULT 'link', -- link, code, direct
    metadata JSONB DEFAULT '{}',
    rewarded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(invitee_id)
);

-- 邀请统计表 (使用Authing认证，user_id为VARCHAR格式)
CREATE TABLE IF NOT EXISTS user_invite_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    total_invites INTEGER NOT NULL DEFAULT 0,
    successful_invites INTEGER NOT NULL DEFAULT 0,
    link_clicks INTEGER NOT NULL DEFAULT 0,
    rewards_issued INTEGER NOT NULL DEFAULT 0,
    total_reward_count INTEGER NOT NULL DEFAULT 0,
    conversion_rate NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 邀请事件表 (使用Authing认证，user_id为VARCHAR格式)
CREATE TABLE IF NOT EXISTS user_invite_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- link_click, registration, reward_issued
    inviter_id VARCHAR(100),
    invitee_id VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. 用户内容和文件表格
-- ============================================================================

-- 用户文件表 (使用Authing认证，user_id为VARCHAR格式)
CREATE TABLE IF NOT EXISTS user_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    file_type VARCHAR(50), -- avatar, document, image, etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户笔记表 (使用Authing认证，user_id为VARCHAR格式)
CREATE TABLE IF NOT EXISTS user_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    category VARCHAR(100),
    tags TEXT[],
    is_private BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户品牌语料库表 (使用Authing认证，user_id为VARCHAR格式)
CREATE TABLE IF NOT EXISTS user_brand_corpus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    brand_name VARCHAR(100) NOT NULL,
    brand_description TEXT,
    tone_keywords TEXT[],
    style_guide TEXT,
    content_samples TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户收藏夹表 (使用Authing认证，user_id为VARCHAR格式)
CREATE TABLE IF NOT EXISTS user_library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT,
    content TEXT,
    category VARCHAR(100),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'active', -- active, archived, deleted
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户聊天历史表 (使用Authing认证，user_id为VARCHAR格式)
CREATE TABLE IF NOT EXISTS user_chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    session_id VARCHAR(100),
    role VARCHAR(20) NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    model VARCHAR(100),
    tokens_used INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. 索引优化
-- ============================================================================

-- 用户相关索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier);

-- Token使用相关索引
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON token_usage_records(created_at);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_month ON token_usage_records(user_id, DATE_TRUNC('month', created_at));
CREATE INDEX IF NOT EXISTS idx_token_usage_feature ON token_usage_records(feature);
CREATE INDEX IF NOT EXISTS idx_token_usage_success ON token_usage_records(success);

CREATE INDEX IF NOT EXISTS idx_usage_count_user_id ON usage_count_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_count_feature ON usage_count_records(feature);

-- 邀请相关索引
CREATE INDEX IF NOT EXISTS idx_invite_relations_inviter_id ON user_invite_relations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invite_relations_invitee_id ON user_invite_relations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_invite_relations_status ON user_invite_relations(status);

CREATE INDEX IF NOT EXISTS idx_invite_stats_user_id ON user_invite_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_invite_events_user_id ON user_invite_events(user_id);
CREATE INDEX IF NOT EXISTS idx_invite_events_type ON user_invite_events(event_type);

-- 内容相关索引
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_type ON user_files(file_type);

CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_category ON user_notes(category);

CREATE INDEX IF NOT EXISTS idx_brand_corpus_user_id ON user_brand_corpus(user_id);
CREATE INDEX IF NOT EXISTS idx_library_items_user_id ON user_library_items(user_id);
CREATE INDEX IF NOT EXISTS idx_library_items_status ON user_library_items(status);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON user_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_session ON user_chat_history(session_id);

-- 时间戳索引（优化时间范围查询性能）
CREATE INDEX IF NOT EXISTS idx_token_usage_timestamp ON token_usage_records(timestamp);

-- ============================================================================
-- 6. 自动更新触发器
-- ============================================================================

-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有需要的表创建触发器
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_usage_records_updated_at 
    BEFORE UPDATE ON token_usage_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invite_relations_updated_at 
    BEFORE UPDATE ON user_invite_relations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invite_stats_updated_at 
    BEFORE UPDATE ON user_invite_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_files_updated_at 
    BEFORE UPDATE ON user_files 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notes_updated_at 
    BEFORE UPDATE ON user_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_corpus_updated_at 
    BEFORE UPDATE ON user_brand_corpus 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_library_items_updated_at 
    BEFORE UPDATE ON user_library_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. RLS (Row Level Security) 策略
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
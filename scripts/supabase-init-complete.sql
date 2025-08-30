-- ============================================================================
-- 完整的 Supabase 数据库初始化脚本
-- 请在 Supabase Dashboard 的 SQL 编辑器中执行此脚本
-- ============================================================================

-- 用户扩展信息表
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 用户订阅信息表
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL DEFAULT 'trial',
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

-- Token使用记录表
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
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 使用次数记录表
CREATE TABLE IF NOT EXISTS usage_count_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL DEFAULT 1,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 邀请关系表
CREATE TABLE IF NOT EXISTS user_invite_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invite_code VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    source VARCHAR(20) NOT NULL DEFAULT 'link',
    metadata JSONB DEFAULT '{}',
    rewarded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(invitee_id)
);

-- 邀请统计表
CREATE TABLE IF NOT EXISTS user_invite_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 邀请事件表
CREATE TABLE IF NOT EXISTS user_invite_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    inviter_id UUID REFERENCES auth.users(id),
    invitee_id UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户文件表
CREATE TABLE IF NOT EXISTS user_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    file_type VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户笔记表
CREATE TABLE IF NOT EXISTS user_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT,
    category VARCHAR(100),
    tags TEXT[],
    is_private BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户品牌语料库表
CREATE TABLE IF NOT EXISTS user_brand_corpus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_name VARCHAR(100) NOT NULL,
    brand_description TEXT,
    tone_keywords TEXT[],
    style_guide TEXT,
    content_samples TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户收藏夹表
CREATE TABLE IF NOT EXISTS user_library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url TEXT,
    content TEXT,
    category VARCHAR(100),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户聊天历史表
CREATE TABLE IF NOT EXISTS user_chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    model VARCHAR(100),
    tokens_used INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 创建索引
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

-- ============================================================================
-- 创建触发器函数
-- ============================================================================

-- 自动更新 updated_at 字段的触发器函数
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
-- 启用 RLS (Row Level Security)
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

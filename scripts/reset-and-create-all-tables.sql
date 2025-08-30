-- ============================================================================
-- 重置并创建所有 Supabase 表格
-- 警告：这将删除所有现有数据！
-- 请在 Supabase Dashboard 的 SQL 编辑器中执行此脚本
-- ============================================================================

-- ============================================================================
-- 1. 删除所有现有表格（如果存在）
-- ============================================================================

-- 删除触发器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
DROP TRIGGER IF EXISTS update_token_usage_records_updated_at ON token_usage_records;
DROP TRIGGER IF EXISTS update_invite_relations_updated_at ON user_invite_relations;
DROP TRIGGER IF EXISTS update_invite_stats_updated_at ON user_invite_stats;
DROP TRIGGER IF EXISTS update_user_files_updated_at ON user_files;
DROP TRIGGER IF EXISTS update_user_notes_updated_at ON user_notes;
DROP TRIGGER IF EXISTS update_brand_corpus_updated_at ON user_brand_corpus;
DROP TRIGGER IF EXISTS update_library_items_updated_at ON user_library_items;

-- 删除表格（按依赖关系顺序）
DROP TABLE IF EXISTS user_chat_history CASCADE;
DROP TABLE IF EXISTS user_library_items CASCADE;
DROP TABLE IF EXISTS user_brand_corpus CASCADE;
DROP TABLE IF EXISTS user_notes CASCADE;
DROP TABLE IF EXISTS user_files CASCADE;
DROP TABLE IF EXISTS user_invite_events CASCADE;
DROP TABLE IF EXISTS user_invite_stats CASCADE;
DROP TABLE IF EXISTS user_invite_relations CASCADE;
DROP TABLE IF EXISTS usage_count_records CASCADE;
DROP TABLE IF EXISTS token_usage_records CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 删除函数
DROP FUNCTION IF EXISTS update_updated_at_column();

-- ============================================================================
-- 2. 创建所有表格
-- ============================================================================

-- 用户扩展信息表
CREATE TABLE user_profiles (
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
CREATE TABLE user_subscriptions (
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
CREATE TABLE token_usage_records (
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
CREATE TABLE usage_count_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL DEFAULT 1,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 邀请关系表
CREATE TABLE user_invite_relations (
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
CREATE TABLE user_invite_stats (
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
CREATE TABLE user_invite_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    inviter_id UUID REFERENCES auth.users(id),
    invitee_id UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户文件表
CREATE TABLE user_files (
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
CREATE TABLE user_notes (
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
CREATE TABLE user_brand_corpus (
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
CREATE TABLE user_library_items (
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
CREATE TABLE user_chat_history (
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
-- 3. 创建索引
-- ============================================================================

-- 用户相关索引
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_tier ON user_subscriptions(tier);

-- Token使用相关索引
CREATE INDEX idx_token_usage_user_id ON token_usage_records(user_id);
CREATE INDEX idx_token_usage_created_at ON token_usage_records(created_at);
CREATE INDEX idx_token_usage_user_month ON token_usage_records(user_id, DATE_TRUNC('month', created_at));
CREATE INDEX idx_token_usage_feature ON token_usage_records(feature);
CREATE INDEX idx_token_usage_success ON token_usage_records(success);

CREATE INDEX idx_usage_count_user_id ON usage_count_records(user_id);
CREATE INDEX idx_usage_count_feature ON usage_count_records(feature);

-- 邀请相关索引
CREATE INDEX idx_invite_relations_inviter_id ON user_invite_relations(inviter_id);
CREATE INDEX idx_invite_relations_invitee_id ON user_invite_relations(invitee_id);
CREATE INDEX idx_invite_relations_status ON user_invite_relations(status);

CREATE INDEX idx_invite_stats_user_id ON user_invite_stats(user_id);
CREATE INDEX idx_invite_events_user_id ON user_invite_events(user_id);
CREATE INDEX idx_invite_events_type ON user_invite_events(event_type);

-- 内容相关索引
CREATE INDEX idx_user_files_user_id ON user_files(user_id);
CREATE INDEX idx_user_files_type ON user_files(file_type);

CREATE INDEX idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX idx_user_notes_category ON user_notes(category);

CREATE INDEX idx_brand_corpus_user_id ON user_brand_corpus(user_id);
CREATE INDEX idx_library_items_user_id ON user_library_items(user_id);
CREATE INDEX idx_library_items_status ON user_library_items(status);

CREATE INDEX idx_chat_history_user_id ON user_chat_history(user_id);
CREATE INDEX idx_chat_history_session ON user_chat_history(session_id);

-- ============================================================================
-- 4. 创建触发器函数
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

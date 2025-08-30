-- ============================================================================
-- Supabase 数据库初始化脚本
-- 创建用户相关的所有表格、索引、触发器、RLS策略和存储过程
-- ============================================================================

-- ============================================================================
-- 1. 用户相关表格
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

-- ============================================================================
-- 3. 邀请系统表格
-- ============================================================================

-- 邀请关系表
CREATE TABLE IF NOT EXISTS user_invite_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invite_code VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, rewarded
    source VARCHAR(20) NOT NULL DEFAULT 'link', -- link, code, direct
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
    event_type VARCHAR(50) NOT NULL, -- link_click, registration, reward_issued
    inviter_id UUID REFERENCES auth.users(id),
    invitee_id UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. 用户内容和文件表格
-- ============================================================================

-- 用户文件表
CREATE TABLE IF NOT EXISTS user_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    file_type VARCHAR(50), -- avatar, document, image, etc.
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
    status VARCHAR(20) DEFAULT 'active', -- active, archived, deleted
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户聊天历史表
CREATE TABLE IF NOT EXISTS user_chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

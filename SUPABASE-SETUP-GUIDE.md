# 🚀 Supabase 数据库手动设置指南

由于 Supabase REST API 的限制，需要在 Dashboard 中手动执行 SQL 脚本来创建数据库表格。

## 📋 操作步骤

### 1. 打开 Supabase SQL 编辑器

访问：**https://supabase.com/dashboard/project/weizkydylskcwgnaieqy/sql**

### 2. 执行第一个脚本

复制并执行 `scripts/reset-and-create-all-tables.sql` 的内容：

```sql
-- ============================================================================
-- 重置并创建所有 Supabase 表格
-- 警告：这将删除所有现有数据！
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
-- 创建所有表格
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
```

### 3. 执行第二个脚本

接着执行 `scripts/reset-and-create-all-tables-part2.sql` 的内容（索引、触发器、RLS 策略等）。

### 4. 验证创建结果

执行完成后，运行测试脚本验证：

```bash
node scripts/test-supabase-connection.js
```

## 📊 创建的表格

- ✅ user_profiles - 用户扩展信息
- ✅ user_subscriptions - 用户订阅信息  
- ✅ token_usage_records - Token使用记录
- ✅ usage_count_records - 使用次数记录
- ✅ user_invite_relations - 邀请关系
- ✅ user_invite_stats - 邀请统计
- ✅ user_invite_events - 邀请事件
- ✅ user_files - 用户文件
- ✅ user_notes - 用户笔记
- ✅ user_brand_corpus - 品牌语料库
- ✅ user_library_items - 收藏夹
- ✅ user_chat_history - 聊天历史

## 🎯 下一步

1. 在 Supabase Dashboard 执行上述 SQL 脚本
2. 运行测试脚本验证创建结果
3. 开始在应用中使用 `useSupabase` Hook
4. 享受完整的数据库功能！

## 📞 需要帮助？

如果在执行过程中遇到问题，请告诉我具体的错误信息，我会帮你解决。

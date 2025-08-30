# Supabase数据库设置指南

## 📋 需要手动创建的表格

您需要在Supabase Dashboard中手动执行SQL来创建以下表格：

**🔗 Supabase Dashboard链接**: https://supabase.com/dashboard/project/weizkydylskcwgnaieqy/editor

## 🛠️ 创建步骤

1. **打开SQL Editor**
   - 访问 https://supabase.com/dashboard/project/weizkydylskcwgnaieqy/editor
   - 点击 "SQL Editor" 或 "+" 新建查询

2. **执行建表脚本**
   - 复制 `/database_setup.sql` 文件的内容
   - 粘贴到SQL Editor中
   - 点击 "Run" 执行

## 🚨 当前状态

✅ **已存在的表** (2/12):
- `user_profiles` - 用户扩展信息表
- `user_subscriptions` - 用户订阅信息表

❌ **需要创建的表** (10个):

### 1. Token使用相关表
```sql
-- Token使用记录表
CREATE TABLE token_usage_records (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL,
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
    user_id UUID NOT NULL,
    feature VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL DEFAULT 1,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 邀请系统表
```sql
-- 邀请关系表
CREATE TABLE user_invite_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID NOT NULL,
    invitee_id UUID NOT NULL,
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
    user_id UUID NOT NULL,
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
    user_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    inviter_id UUID,
    invitee_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. 用户内容表
```sql
-- 用户文件表
CREATE TABLE user_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
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
    user_id UUID NOT NULL,
    title VARCHAR(255),
    content TEXT,
    category VARCHAR(100),
    tags TEXT[],
    is_private BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 品牌语料库表
CREATE TABLE user_brand_corpus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    brand_name VARCHAR(100) NOT NULL,
    brand_description TEXT,
    tone_keywords TEXT[],
    style_guide TEXT,
    content_samples TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 收藏夹表
CREATE TABLE user_library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
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

-- 聊天历史表
CREATE TABLE user_chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_id VARCHAR(100),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    model VARCHAR(100),
    tokens_used INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 重要：启用RLS安全策略

创建表格后，必须启用Row Level Security并设置策略：

```sql
-- 启用RLS
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

-- 为每个表创建基本的RLS策略（用户只能访问自己的数据）
CREATE POLICY "Users manage own data" ON token_usage_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON usage_count_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON user_invite_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON user_invite_events FOR ALL USING (auth.uid() = user_id OR auth.uid() = inviter_id OR auth.uid() = invitee_id);
CREATE POLICY "Users manage own data" ON user_files FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON user_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON user_brand_corpus FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON user_library_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON user_chat_history FOR ALL USING (auth.uid() = user_id);

-- 邀请关系表特殊策略
CREATE POLICY "Users view invites they sent or received" ON user_invite_relations 
    FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);
CREATE POLICY "Users create invite relations as inviter" ON user_invite_relations 
    FOR INSERT WITH CHECK (auth.uid() = inviter_id);
CREATE POLICY "Users update invites they sent" ON user_invite_relations 
    FOR UPDATE USING (auth.uid() = inviter_id);
```

## ✅ 验证完成

执行完成后，运行验证脚本确认：
```bash
node scripts/verify-supabase-tables.js
```

## 🔗 便捷链接

- **Supabase项目**: https://supabase.com/dashboard/project/weizkydylskcwgnaieqy
- **SQL Editor**: https://supabase.com/dashboard/project/weizkydylskcwgnaieqy/editor
- **表格管理**: https://supabase.com/dashboard/project/weizkydylskcwgnaieqy/editor

## 📞 如果需要帮助

如果在创建过程中遇到问题，请提供：
1. 错误消息截图
2. 执行的SQL语句
3. 表格创建的具体步骤

我会协助您解决！
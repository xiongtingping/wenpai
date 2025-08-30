-- 文派AI - 修复Authing用户ID格式的数据库迁移脚本 V3
-- 问题：当前schema使用UUID类型，但Authing提供的用户ID不是标准UUID格式
-- 解决：先删除视图和RLS策略，修改列类型，然后重新创建所有依赖

-- ============================================================================
-- 1. 删除所有依赖于user_id的视图
-- ============================================================================

-- 删除统计视图
DROP VIEW IF EXISTS monthly_token_usage;
DROP VIEW IF EXISTS daily_token_usage;
DROP VIEW IF EXISTS feature_usage_stats;

-- ============================================================================
-- 2. 删除所有RLS策略（因为策略依赖于user_id列）
-- ============================================================================

-- 删除 user_profiles 表的策略
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- 删除 user_subscriptions 表的策略
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON user_subscriptions;

-- 删除 token_usage_records 表的策略
DROP POLICY IF EXISTS "Users can view their own token usage" ON token_usage_records;
DROP POLICY IF EXISTS "Users can insert their own token usage" ON token_usage_records;

-- 删除 usage_count_records 表的策略
DROP POLICY IF EXISTS "Users can view their own usage count" ON usage_count_records;
DROP POLICY IF EXISTS "Users can insert their own usage count" ON usage_count_records;

-- 删除 user_invite_relations 表的策略
DROP POLICY IF EXISTS "Users can view invites they sent or received" ON user_invite_relations;
DROP POLICY IF EXISTS "Users can create invite relations as inviter" ON user_invite_relations;
DROP POLICY IF EXISTS "Users can update invites they sent" ON user_invite_relations;

-- 删除 user_invite_stats 表的策略
DROP POLICY IF EXISTS "Users can view their own invite stats" ON user_invite_stats;
DROP POLICY IF EXISTS "Users can insert their own invite stats" ON user_invite_stats;
DROP POLICY IF EXISTS "Users can update their own invite stats" ON user_invite_stats;

-- 删除 user_invite_events 表的策略
DROP POLICY IF EXISTS "Users can view invite events they're involved in" ON user_invite_events;
DROP POLICY IF EXISTS "Users can insert invite events" ON user_invite_events;

-- 删除 user_files 表的策略
DROP POLICY IF EXISTS "Users can manage their own files" ON user_files;

-- 删除 user_notes 表的策略
DROP POLICY IF EXISTS "Users can manage their own notes" ON user_notes;

-- 删除 user_brand_corpus 表的策略
DROP POLICY IF EXISTS "Users can manage their own brand corpus" ON user_brand_corpus;

-- 删除 user_library_items 表的策略
DROP POLICY IF EXISTS "Users can manage their own library items" ON user_library_items;

-- 删除 user_chat_history 表的策略
DROP POLICY IF EXISTS "Users can manage their own chat history" ON user_chat_history;

-- ============================================================================
-- 2. 删除外键约束
-- ============================================================================

-- 删除所有外键约束
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey;
ALTER TABLE token_usage_records DROP CONSTRAINT IF EXISTS token_usage_records_user_id_fkey;
ALTER TABLE usage_count_records DROP CONSTRAINT IF EXISTS usage_count_records_user_id_fkey;
ALTER TABLE user_invite_relations DROP CONSTRAINT IF EXISTS user_invite_relations_inviter_id_fkey;
ALTER TABLE user_invite_relations DROP CONSTRAINT IF EXISTS user_invite_relations_invitee_id_fkey;
ALTER TABLE user_invite_stats DROP CONSTRAINT IF EXISTS user_invite_stats_user_id_fkey;
ALTER TABLE user_invite_events DROP CONSTRAINT IF EXISTS user_invite_events_user_id_fkey;
ALTER TABLE user_invite_events DROP CONSTRAINT IF EXISTS user_invite_events_inviter_id_fkey;
ALTER TABLE user_invite_events DROP CONSTRAINT IF EXISTS user_invite_events_invitee_id_fkey;
ALTER TABLE user_files DROP CONSTRAINT IF EXISTS user_files_user_id_fkey;
ALTER TABLE user_notes DROP CONSTRAINT IF EXISTS user_notes_user_id_fkey;
ALTER TABLE user_brand_corpus DROP CONSTRAINT IF EXISTS user_brand_corpus_user_id_fkey;
ALTER TABLE user_library_items DROP CONSTRAINT IF EXISTS user_library_items_user_id_fkey;
ALTER TABLE user_chat_history DROP CONSTRAINT IF EXISTS user_chat_history_user_id_fkey;

-- ============================================================================
-- 3. 修改列类型
-- ============================================================================

-- 修改所有 user_id 相关列的类型
ALTER TABLE user_profiles ALTER COLUMN user_id TYPE VARCHAR(100);
ALTER TABLE user_subscriptions ALTER COLUMN user_id TYPE VARCHAR(100);
ALTER TABLE token_usage_records ALTER COLUMN user_id TYPE VARCHAR(100);
ALTER TABLE usage_count_records ALTER COLUMN user_id TYPE VARCHAR(100);
ALTER TABLE user_invite_relations ALTER COLUMN inviter_id TYPE VARCHAR(100);
ALTER TABLE user_invite_relations ALTER COLUMN invitee_id TYPE VARCHAR(100);
ALTER TABLE user_invite_stats ALTER COLUMN user_id TYPE VARCHAR(100);
ALTER TABLE user_invite_events ALTER COLUMN user_id TYPE VARCHAR(100);
ALTER TABLE user_invite_events ALTER COLUMN inviter_id TYPE VARCHAR(100);
ALTER TABLE user_invite_events ALTER COLUMN invitee_id TYPE VARCHAR(100);
ALTER TABLE user_files ALTER COLUMN user_id TYPE VARCHAR(100);
ALTER TABLE user_notes ALTER COLUMN user_id TYPE VARCHAR(100);
ALTER TABLE user_brand_corpus ALTER COLUMN user_id TYPE VARCHAR(100);
ALTER TABLE user_library_items ALTER COLUMN user_id TYPE VARCHAR(100);
ALTER TABLE user_chat_history ALTER COLUMN user_id TYPE VARCHAR(100);

-- ============================================================================
-- 4. 重新创建索引
-- ============================================================================

-- 重新创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_records_user_id ON token_usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_count_records_user_id ON usage_count_records(user_id);
CREATE INDEX IF NOT EXISTS idx_user_invite_relations_inviter_id ON user_invite_relations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_user_invite_relations_invitee_id ON user_invite_relations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_user_invite_stats_user_id ON user_invite_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_invite_events_user_id ON user_invite_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_invite_events_inviter_id ON user_invite_events(inviter_id);
CREATE INDEX IF NOT EXISTS idx_user_invite_events_invitee_id ON user_invite_events(invitee_id);
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_brand_corpus_user_id ON user_brand_corpus(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_items_user_id ON user_library_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chat_history_user_id ON user_chat_history(user_id);

-- ============================================================================
-- 5. 重新创建RLS策略（使用新的VARCHAR类型）
-- ============================================================================

-- 用户基本信息表RLS策略
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

-- 订阅信息表RLS策略
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
    FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own subscription" ON user_subscriptions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own subscription" ON user_subscriptions
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Token使用记录表RLS策略
CREATE POLICY "Users can view their own token usage" ON token_usage_records
    FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own token usage" ON token_usage_records
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 使用次数记录表RLS策略
CREATE POLICY "Users can view their own usage count" ON usage_count_records
    FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own usage count" ON usage_count_records
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 邀请关系表RLS策略
CREATE POLICY "Users can view invites they sent or received" ON user_invite_relations
    FOR SELECT USING (auth.uid()::text = inviter_id OR auth.uid()::text = invitee_id);
CREATE POLICY "Users can create invite relations as inviter" ON user_invite_relations
    FOR INSERT WITH CHECK (auth.uid()::text = inviter_id);
CREATE POLICY "Users can update invites they sent" ON user_invite_relations
    FOR UPDATE USING (auth.uid()::text = inviter_id);

-- 邀请统计表RLS策略
CREATE POLICY "Users can view their own invite stats" ON user_invite_stats
    FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own invite stats" ON user_invite_stats
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own invite stats" ON user_invite_stats
    FOR UPDATE USING (auth.uid()::text = user_id);

-- 邀请事件表RLS策略
CREATE POLICY "Users can view invite events they're involved in" ON user_invite_events
    FOR SELECT USING (auth.uid()::text = user_id OR auth.uid()::text = inviter_id OR auth.uid()::text = invitee_id);
CREATE POLICY "Users can insert invite events" ON user_invite_events
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 用户文件表RLS策略
CREATE POLICY "Users can manage their own files" ON user_files
    FOR ALL USING (auth.uid()::text = user_id);

-- 用户笔记表RLS策略
CREATE POLICY "Users can manage their own notes" ON user_notes
    FOR ALL USING (auth.uid()::text = user_id);

-- 品牌语料库表RLS策略
CREATE POLICY "Users can manage their own brand corpus" ON user_brand_corpus
    FOR ALL USING (auth.uid()::text = user_id);

-- 收藏夹表RLS策略
CREATE POLICY "Users can manage their own library items" ON user_library_items
    FOR ALL USING (auth.uid()::text = user_id);

-- 聊天历史表RLS策略
CREATE POLICY "Users can manage their own chat history" ON user_chat_history
    FOR ALL USING (auth.uid()::text = user_id);

-- ============================================================================
-- 6. 重新创建统计视图
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

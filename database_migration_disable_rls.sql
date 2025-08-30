-- 文派AI - 禁用RLS策略的数据库迁移脚本
-- 问题：RLS策略使用auth.uid()但我们使用Authing认证，导致406 Not Acceptable错误
-- 解决：禁用RLS策略，依赖应用层的用户ID隔离保护

-- ============================================================================
-- 1. 禁用所有表的RLS (Row Level Security)
-- ============================================================================

-- 用户相关表
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;

-- Token使用量相关表
ALTER TABLE token_usage_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_count_records DISABLE ROW LEVEL SECURITY;

-- 邀请系统表
ALTER TABLE user_invite_relations DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_invite_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_invite_events DISABLE ROW LEVEL SECURITY;

-- 内容和文件表
ALTER TABLE user_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_brand_corpus DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_library_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_chat_history DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. 删除所有现有的RLS策略
-- ============================================================================

-- 用户基本信息表策略
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- 订阅信息表策略
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON user_subscriptions;

-- Token使用记录表策略
DROP POLICY IF EXISTS "Users can view their own token usage" ON token_usage_records;
DROP POLICY IF EXISTS "Users can insert their own token usage" ON token_usage_records;
DROP POLICY IF EXISTS "Users can view their own token usage records" ON token_usage_records;
DROP POLICY IF EXISTS "Users can insert their own token usage records" ON token_usage_records;
DROP POLICY IF EXISTS "Users can update their own token usage records" ON token_usage_records;

-- 使用次数记录表策略
DROP POLICY IF EXISTS "Users can view their own usage count" ON usage_count_records;
DROP POLICY IF EXISTS "Users can insert their own usage count" ON usage_count_records;

-- 邀请关系表策略
DROP POLICY IF EXISTS "Users can view invites they sent or received" ON user_invite_relations;
DROP POLICY IF EXISTS "Users can create invite relations as inviter" ON user_invite_relations;
DROP POLICY IF EXISTS "Users can update invites they sent" ON user_invite_relations;

-- 邀请统计表策略
DROP POLICY IF EXISTS "Users can view their own invite stats" ON user_invite_stats;
DROP POLICY IF EXISTS "Users can insert their own invite stats" ON user_invite_stats;
DROP POLICY IF EXISTS "Users can update their own invite stats" ON user_invite_stats;

-- 邀请事件表策略
DROP POLICY IF EXISTS "Users can view invite events they're involved in" ON user_invite_events;
DROP POLICY IF EXISTS "Users can insert invite events" ON user_invite_events;

-- 用户文件表策略
DROP POLICY IF EXISTS "Users can manage their own files" ON user_files;

-- 用户笔记表策略
DROP POLICY IF EXISTS "Users can manage their own notes" ON user_notes;

-- 品牌语料库表策略
DROP POLICY IF EXISTS "Users can manage their own brand corpus" ON user_brand_corpus;

-- 收藏夹表策略
DROP POLICY IF EXISTS "Users can manage their own library items" ON user_library_items;

-- 聊天历史表策略
DROP POLICY IF EXISTS "Users can manage their own chat history" ON user_chat_history;

-- ============================================================================
-- 3. 验证RLS状态
-- ============================================================================

-- 检查RLS状态（应该都显示为disabled）
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'user_%' 
OR tablename LIKE '%_usage_%'
ORDER BY tablename;

-- 测试查询（应该不再返回406错误）
-- SELECT COUNT(*) FROM user_subscriptions WHERE user_id = '6882df3f2f9efaa6e241dce5';
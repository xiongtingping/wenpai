-- 文派AI - 修复Authing用户ID格式的数据库迁移脚本
-- 问题：当前schema使用UUID类型，但Authing提供的用户ID不是标准UUID格式
-- 解决：将所有user_id列改为VARCHAR类型，移除对auth.users的外键约束

-- ============================================================================
-- 1. 修复用户相关表格的user_id类型
-- ============================================================================

-- 修复 user_profiles 表
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

ALTER TABLE user_profiles 
ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_subscriptions 表  
ALTER TABLE user_subscriptions
DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey;

ALTER TABLE user_subscriptions
ALTER COLUMN user_id TYPE VARCHAR(100);

-- ============================================================================
-- 2. 修复Token使用量相关表格
-- ============================================================================

-- 修复 token_usage_records 表
ALTER TABLE token_usage_records
DROP CONSTRAINT IF EXISTS token_usage_records_user_id_fkey;

ALTER TABLE token_usage_records
ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 usage_count_records 表
ALTER TABLE usage_count_records  
DROP CONSTRAINT IF EXISTS usage_count_records_user_id_fkey;

ALTER TABLE usage_count_records
ALTER COLUMN user_id TYPE VARCHAR(100);

-- ============================================================================
-- 3. 修复邀请系统表格
-- ============================================================================

-- 修复 user_invite_relations 表
ALTER TABLE user_invite_relations
DROP CONSTRAINT IF EXISTS user_invite_relations_inviter_id_fkey;

ALTER TABLE user_invite_relations  
DROP CONSTRAINT IF EXISTS user_invite_relations_invitee_id_fkey;

ALTER TABLE user_invite_relations
ALTER COLUMN inviter_id TYPE VARCHAR(100);

ALTER TABLE user_invite_relations
ALTER COLUMN invitee_id TYPE VARCHAR(100);

-- 修复 user_invite_stats 表
ALTER TABLE user_invite_stats
DROP CONSTRAINT IF EXISTS user_invite_stats_user_id_fkey;

ALTER TABLE user_invite_stats
ALTER COLUMN user_id TYPE VARCHAR(100);

-- ============================================================================
-- 4. 修复内容和文件相关表格
-- ============================================================================

-- 修复 user_files 表
ALTER TABLE user_files
DROP CONSTRAINT IF EXISTS user_files_user_id_fkey;

ALTER TABLE user_files  
ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_notes 表
ALTER TABLE user_notes
DROP CONSTRAINT IF EXISTS user_notes_user_id_fkey;

ALTER TABLE user_notes
ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_brand_corpus 表
ALTER TABLE user_brand_corpus
DROP CONSTRAINT IF EXISTS user_brand_corpus_user_id_fkey;

ALTER TABLE user_brand_corpus
ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_library_items 表  
ALTER TABLE user_library_items
DROP CONSTRAINT IF EXISTS user_library_items_user_id_fkey;

ALTER TABLE user_library_items
ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_chat_history 表
ALTER TABLE user_chat_history
DROP CONSTRAINT IF EXISTS user_chat_history_user_id_fkey;

ALTER TABLE user_chat_history
ALTER COLUMN user_id TYPE VARCHAR(100);

-- ============================================================================
-- 5. 创建索引优化查询性能
-- ============================================================================

-- 为user_id列创建索引（原来的外键约束会自动创建索引，现在需要手动创建）
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);  
CREATE INDEX IF NOT EXISTS idx_token_usage_records_user_id ON token_usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_count_records_user_id ON usage_count_records(user_id);
CREATE INDEX IF NOT EXISTS idx_user_invite_relations_inviter_id ON user_invite_relations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_user_invite_relations_invitee_id ON user_invite_relations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_user_invite_stats_user_id ON user_invite_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_brand_corpus_user_id ON user_brand_corpus(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_items_user_id ON user_library_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chat_history_user_id ON user_chat_history(user_id);

-- ============================================================================
-- 6. 验证迁移结果
-- ============================================================================

-- 检查修改后的表结构
\d user_profiles;
\d token_usage_records;
\d user_subscriptions;

-- 测试查询（使用Authing格式的user_id）
SELECT COUNT(*) FROM token_usage_records WHERE user_id = '6882df3f2f9efaa6e241dce5';
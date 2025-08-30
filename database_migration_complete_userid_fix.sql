-- 文派AI - 完整的user_id类型修复脚本
-- 修复所有遗漏的表，确保user_id列都是VARCHAR(100)类型

-- ============================================================================
-- 1. 修复遗漏的user_subscriptions表user_id类型转换
-- ============================================================================

-- 确保user_subscriptions表的user_id是VARCHAR类型
ALTER TABLE user_subscriptions
ALTER COLUMN user_id TYPE VARCHAR(100);

-- ============================================================================  
-- 2. 修复第三批遗漏表的user_id类型
-- ============================================================================

-- 修复 cdk_usage_logs 表
ALTER TABLE cdk_usage_logs
DROP CONSTRAINT IF EXISTS cdk_usage_logs_user_id_fkey;

ALTER TABLE cdk_usage_logs
ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_permission_logs 表
ALTER TABLE user_permission_logs  
DROP CONSTRAINT IF EXISTS user_permission_logs_user_id_fkey;

ALTER TABLE user_permission_logs
ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_permissions 表
ALTER TABLE user_permissions
DROP CONSTRAINT IF EXISTS user_permissions_user_id_fkey;

ALTER TABLE user_permissions
ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_preferences 表
ALTER TABLE user_preferences
DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

ALTER TABLE user_preferences  
ALTER COLUMN user_id TYPE VARCHAR(100);

-- ============================================================================
-- 3. 为新修复的表创建性能索引
-- ============================================================================

-- 为新修复的表创建user_id索引
CREATE INDEX IF NOT EXISTS idx_cdk_usage_logs_user_id ON cdk_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_logs_user_id ON user_permission_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================================================
-- 4. 完整验证所有表的user_id列类型
-- ============================================================================

-- 检查所有user_id列的数据类型（应该都是character varying）
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    CASE 
        WHEN data_type = 'character varying' AND character_maximum_length = 100 THEN '✅ 正确'
        WHEN data_type = 'uuid' THEN '❌ 仍为UUID'
        ELSE '❓ 其他类型: ' || data_type
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name IN ('user_id', 'inviter_id', 'invitee_id')
ORDER BY table_name, column_name;

-- ============================================================================
-- 5. 测试所有关键表的查询
-- ============================================================================

-- 测试user_subscriptions（之前406错误的源头）
SELECT 'user_subscriptions' as table_name, COUNT(*) as count
FROM user_subscriptions 
WHERE user_id = '6882df3f2f9efaa6e241dce5';

-- 测试其他可能问题的表
SELECT 'user_profiles' as table_name, COUNT(*) as count
FROM user_profiles
WHERE user_id = '6882df3f2f9efaa6e241dce5';

SELECT 'token_usage_records' as table_name, COUNT(*) as count
FROM token_usage_records
WHERE user_id = '6882df3f2f9efaa6e241dce5';

SELECT 'user_permissions' as table_name, COUNT(*) as count
FROM user_permissions  
WHERE user_id = '6882df3f2f9efaa6e241dce5';

-- ============================================================================
-- 6. 最终状态检查
-- ============================================================================

-- 确认没有剩余的RLS策略
SELECT 
    'RLS Policies剩余数量' as check_name,
    COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public';

-- 确认没有剩余的启用RLS的表
SELECT 
    'RLS启用表数量' as check_name,
    COUNT(*) as count  
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
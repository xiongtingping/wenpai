-- 文派AI - 最终清理脚本：删除所有剩余的RLS策略和修复列类型
-- 解决 "cannot alter type of a column used in a policy definition" 错误

-- ============================================================================
-- 1. 查找并删除所有剩余的RLS策略
-- ============================================================================

-- 删除 cdk_usage_logs 表的所有策略
DROP POLICY IF EXISTS "Users can view own usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can insert own usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can update own usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can delete own usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can manage their own cdk usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can view their own cdk usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can insert their own cdk usage logs" ON cdk_usage_logs;

-- 删除 user_permission_logs 表的所有策略
DROP POLICY IF EXISTS "Users can view own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can insert own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can update own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can delete own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can manage their own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can view their own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can insert their own permission logs" ON user_permission_logs;

-- 删除 user_permissions 表的所有策略
DROP POLICY IF EXISTS "Users can view own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can insert own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can update own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can delete own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can manage their own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can view their own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can insert their own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can update their own permissions" ON user_permissions;

-- 删除 user_preferences 表的所有策略
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;

-- ============================================================================
-- 2. 确保所有表都禁用了RLS
-- ============================================================================

-- 禁用所有表的RLS
ALTER TABLE cdk_usage_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_permission_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. 删除外键约束并修改列类型
-- ============================================================================

-- 修复 cdk_usage_logs 表
ALTER TABLE cdk_usage_logs DROP CONSTRAINT IF EXISTS cdk_usage_logs_user_id_fkey;
ALTER TABLE cdk_usage_logs ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_permission_logs 表
ALTER TABLE user_permission_logs DROP CONSTRAINT IF EXISTS user_permission_logs_user_id_fkey;
ALTER TABLE user_permission_logs ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_permissions 表
ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS user_permissions_user_id_fkey;
ALTER TABLE user_permissions ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_preferences 表
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;
ALTER TABLE user_preferences ALTER COLUMN user_id TYPE VARCHAR(100);

-- 确保 user_subscriptions 也是正确的类型
ALTER TABLE user_subscriptions ALTER COLUMN user_id TYPE VARCHAR(100);

-- ============================================================================
-- 4. 创建性能索引
-- ============================================================================

-- 为所有修复的表创建索引
CREATE INDEX IF NOT EXISTS idx_cdk_usage_logs_user_id ON cdk_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_logs_user_id ON user_permission_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================================================
-- 5. 最终验证
-- ============================================================================

-- 检查所有剩余的RLS策略（应该为0）
SELECT 
    'RLS策略剩余数量' as check_name,
    COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public';

-- 检查启用RLS的表数量（应该为0）
SELECT 
    'RLS启用表数量' as check_name,
    COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- 检查所有user_id列的类型
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

-- 测试所有关键表的查询
SELECT 'user_subscriptions' as table_name, COUNT(*) as count FROM user_subscriptions WHERE user_id = '6882df3f2f9efaa6e241dce5'
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles WHERE user_id = '6882df3f2f9efaa6e241dce5'
UNION ALL
SELECT 'token_usage_records' as table_name, COUNT(*) as count FROM token_usage_records WHERE user_id = '6882df3f2f9efaa6e241dce5'
UNION ALL
SELECT 'cdk_usage_logs' as table_name, COUNT(*) as count FROM cdk_usage_logs WHERE user_id = '6882df3f2f9efaa6e241dce5'
UNION ALL
SELECT 'user_permissions' as table_name, COUNT(*) as count FROM user_permissions WHERE user_id = '6882df3f2f9efaa6e241dce5';

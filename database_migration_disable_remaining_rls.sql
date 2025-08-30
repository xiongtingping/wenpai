-- 文派AI - 禁用剩余表的RLS策略补充脚本
-- 处理之前遗漏的表：cdk_usage_logs, user_permission_logs, user_permissions, user_preferences

-- ============================================================================
-- 1. 禁用剩余表的RLS (Row Level Security)
-- ============================================================================

-- 禁用剩余表的RLS
ALTER TABLE cdk_usage_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_permission_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. 删除这些表的所有RLS策略
-- ============================================================================

-- 删除 cdk_usage_logs 表的策略
DROP POLICY IF EXISTS "Users can view their own cdk usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can insert their own cdk usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can manage their own cdk usage logs" ON cdk_usage_logs;

-- 删除 user_permission_logs 表的策略
DROP POLICY IF EXISTS "Users can view their own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can insert their own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can manage their own permission logs" ON user_permission_logs;

-- 删除 user_permissions 表的策略
DROP POLICY IF EXISTS "Users can view their own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can insert their own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can update their own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can manage their own permissions" ON user_permissions;

-- 删除 user_preferences 表的策略
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;

-- ============================================================================
-- 3. 完整验证所有表的RLS状态
-- ============================================================================

-- 检查所有用户相关表的RLS状态
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN '❌ 仍启用'
        WHEN rowsecurity = false THEN '✅ 已禁用'
        ELSE '❓ 未知'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND (
    tablename LIKE 'user_%' 
    OR tablename LIKE '%_usage_%'
    OR tablename LIKE 'cdk_%'
    OR tablename IN ('user_permissions', 'user_preferences')
)
ORDER BY tablename;

-- ============================================================================
-- 4. 测试数据库访问（应该不再有406错误）
-- ============================================================================

-- 测试查询示例（取消注释来测试）
-- SELECT COUNT(*) FROM user_profiles;
-- SELECT COUNT(*) FROM token_usage_records;
-- SELECT COUNT(*) FROM user_subscriptions;

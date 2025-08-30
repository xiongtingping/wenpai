-- 文派AI - 核心清理脚本：彻底删除所有RLS策略
-- 先查找所有策略，然后全部删除

-- ============================================================================
-- 1. 查找所有现有的RLS策略
-- ============================================================================

-- 查看所有现有策略
SELECT 
    schemaname,
    tablename,
    policyname,
    'DROP POLICY IF EXISTS "' || policyname || '" ON ' || tablename || ';' as drop_command
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- 2. 删除所有可能的策略名称变体
-- ============================================================================

-- 删除 user_permissions 表的所有可能策略
DROP POLICY IF EXISTS "Users can manage own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can view own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can insert own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can update own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can delete own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can manage their own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can view their own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can insert their own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can update their own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can delete their own permissions" ON user_permissions;

-- 删除 user_preferences 表的所有可能策略
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON user_preferences;

-- 删除 cdk_usage_logs 表的所有可能策略
DROP POLICY IF EXISTS "Users can view own usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can insert own usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can update own usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can delete own usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can manage own usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can view their own usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can insert their own usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can update their own usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can delete their own usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can manage their own usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can manage their own cdk usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can view their own cdk usage logs" ON cdk_usage_logs;
DROP POLICY IF EXISTS "Users can insert their own cdk usage logs" ON cdk_usage_logs;

-- 删除 user_permission_logs 表的所有可能策略
DROP POLICY IF EXISTS "Users can view own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can insert own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can update own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can delete own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can manage own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can view their own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can insert their own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can update their own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can delete their own permission logs" ON user_permission_logs;
DROP POLICY IF EXISTS "Users can manage their own permission logs" ON user_permission_logs;

-- ============================================================================
-- 3. 禁用所有表的RLS
-- ============================================================================

ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE cdk_usage_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_permission_logs DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. 验证策略已全部删除
-- ============================================================================

-- 检查剩余策略（应该为0）
SELECT 
    'RLS策略剩余数量' as check_name,
    COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public';

-- 如果还有剩余策略，显示它们
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 文派AI - 最终RLS清理脚本
-- 确保所有用户相关表都完全禁用RLS并移除所有policies

-- ============================================================================
-- 1. 强制禁用所有可能有RLS的表
-- ============================================================================

-- 核心用户表
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Token和使用量表
ALTER TABLE token_usage_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_count_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE cdk_usage_logs DISABLE ROW LEVEL SECURITY;

-- 邀请系统表
ALTER TABLE user_invite_relations DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_invite_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_invite_events DISABLE ROW LEVEL SECURITY;

-- 内容管理表
ALTER TABLE user_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_brand_corpus DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_library_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_chat_history DISABLE ROW LEVEL SECURITY;

-- 权限日志表
ALTER TABLE user_permission_logs DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. 清理所有剩余的RLS policies（通过动态SQL）
-- ============================================================================

-- 删除所有现有的policies（使用通配符模式）
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- 查找并删除所有RLS policies
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
        RAISE NOTICE '删除策略: %.% 的 %', 
                     policy_record.tablename, 
                     policy_record.schemaname,
                     policy_record.policyname;
    END LOOP;
END $$;

-- ============================================================================
-- 3. 验证清理结果
-- ============================================================================

-- 检查所有表的RLS状态（应该全部为false）
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
AND tablename LIKE ANY(ARRAY['%user_%', '%usage_%', '%invite_%', '%cdk_%'])
ORDER BY rowsecurity DESC, tablename;

-- 检查剩余的policies（应该为空）
SELECT COUNT(*) as remaining_policies_count
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================================================
-- 4. 测试关键查询
-- ============================================================================

-- 测试user_subscriptions查询（应该成功）
SELECT 'user_subscriptions测试' as test_name, COUNT(*) as record_count
FROM user_subscriptions 
WHERE user_id = '6882df3f2f9efaa6e241dce5';

-- 测试其他关键表
SELECT 'user_profiles测试' as test_name, COUNT(*) as record_count  
FROM user_profiles
WHERE user_id = '6882df3f2f9efaa6e241dce5';

SELECT 'token_usage_records测试' as test_name, COUNT(*) as record_count
FROM token_usage_records
WHERE user_id = '6882df3f2f9efaa6e241dce5';
-- 检查所有表的RLS状态和policies
-- 查找所有仍然启用RLS的表

-- 1. 检查所有表的RLS状态
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN '❌ 仍启用RLS'
        WHEN rowsecurity = false THEN '✅ 已禁用RLS'
        ELSE '❓ 未知状态'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY rowsecurity DESC, tablename;

-- 2. 检查所有剩余的RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. 专门检查user_subscriptions表的详细信息
\d user_subscriptions;

-- 4. 测试查询user_subscriptions（应该成功）
-- SELECT COUNT(*) FROM user_subscriptions WHERE user_id = '6882df3f2f9efaa6e241dce5';
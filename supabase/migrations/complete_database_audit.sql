-- ============================================
-- 完整数据库架构审查
-- 检查所有表，不仅仅是部分表
-- ============================================

-- 1. 获取所有表的列表
SELECT '=== 1. 数据库中的所有表 ===' as section;

SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. 获取所有表的字段信息
SELECT '=== 2. 所有表的字段结构 ===' as section;

SELECT 
  table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. 检查所有表的 RLS 状态
SELECT '=== 3. 所有表的 RLS 状态 ===' as section;

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. 检查所有 RLS 策略
SELECT '=== 4. 所有 RLS 策略 ===' as section;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. 检查所有索引
SELECT '=== 5. 所有索引 ===' as section;

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 6. 检查所有外键关系
SELECT '=== 6. 所有外键关系 ===' as section;

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 7. 检查所有表的行数和大小
SELECT '=== 7. 所有表的统计信息 ===' as section;

SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 8. 检查可能的字段名不一致问题
SELECT '=== 8. 字段名一致性检查 ===' as section;

-- 8.1 查找包含 'subscription_type' 的列
SELECT 
  '包含 subscription_type 的表' as check_type,
  table_name,
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name LIKE '%subscription_type%'
ORDER BY table_name;

-- 8.2 查找包含 'tier' 的列
SELECT 
  '包含 tier 的表' as check_type,
  table_name,
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name LIKE '%tier%'
ORDER BY table_name;

-- 8.3 查找包含 'duration_type' 的列
SELECT 
  '包含 duration_type 的表' as check_type,
  table_name,
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name LIKE '%duration_type%'
ORDER BY table_name;

-- 8.4 查找包含 'period' 的列
SELECT 
  '包含 period 的表' as check_type,
  table_name,
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name LIKE '%period%'
ORDER BY table_name;

-- 9. 检查用户相关的所有表
SELECT '=== 9. 用户相关表检查 ===' as section;

SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    table_name LIKE '%user%'
    OR table_name LIKE '%subscription%'
    OR table_name LIKE '%order%'
    OR table_name LIKE '%payment%'
  )
ORDER BY table_name, ordinal_position;

-- 10. 检查时间戳字段的一致性
SELECT '=== 10. 时间戳字段一致性 ===' as section;

SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    column_name LIKE '%timestamp%'
    OR column_name LIKE '%created_at%'
    OR column_name LIKE '%updated_at%'
    OR column_name LIKE '%expires_at%'
    OR column_name LIKE '%started_at%'
  )
ORDER BY table_name, column_name;

-- 完成
SELECT '=== 审查完成 ===' as section,
       NOW() as completed_at;


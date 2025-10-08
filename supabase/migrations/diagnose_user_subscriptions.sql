-- ============================================
-- 诊断 user_subscriptions 表
-- 查看当前表结构和数据
-- ============================================

-- 1. 查看表结构
SELECT 
  '=== 表结构 ===' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- 2. 查看所有索引
SELECT 
  '=== 索引 ===' as info;

SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'user_subscriptions';

-- 3. 查看 RLS 策略
SELECT 
  '=== RLS 策略 ===' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_subscriptions';

-- 4. 查看表中的数据（最近10条）
SELECT 
  '=== 最近的订阅记录 ===' as info;

SELECT 
  *
FROM user_subscriptions
ORDER BY created_at DESC
LIMIT 10;

-- 5. 统计信息
SELECT 
  '=== 统计信息 ===' as info;

SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_subscriptions,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subscriptions
FROM user_subscriptions;


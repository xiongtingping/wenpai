-- ============================================
-- Supabase 数据库全面架构审查和一致性检查
-- 执行日期: 2025-10-08
-- ============================================

-- ============================================
-- 1. 表字段名一致性审查
-- ============================================

SELECT '=== 1. 表结构完整性检查 ===' as section;

-- 1.1 检查所有相关表的字段结构
SELECT 
  table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('user_subscriptions', 'orders', 'user_usage_logs')
ORDER BY table_name, ordinal_position;

-- ============================================
-- 2. user_subscriptions 表详细检查
-- ============================================

SELECT '=== 2. user_subscriptions 表字段检查 ===' as section;

-- 2.1 检查必需字段是否存在
SELECT 
  'user_subscriptions' as table_name,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'tier') as has_tier,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'subscription_type') as has_subscription_type,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'period') as has_period,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'duration_type') as has_duration_type,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'order_id') as has_order_id,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'last_payment_id') as has_last_payment_id;

-- 2.2 检查数据完整性
SELECT 
  '=== user_subscriptions 数据完整性 ===' as section,
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN tier IS NULL THEN 1 END) as missing_tier,
  COUNT(CASE WHEN status IS NULL THEN 1 END) as missing_status,
  COUNT(CASE WHEN order_id IS NULL THEN 1 END) as missing_order_id,
  COUNT(CASE WHEN last_payment_id IS NULL THEN 1 END) as missing_payment_id,
  COUNT(CASE WHEN status = 'active' AND expires_at < NOW() THEN 1 END) as expired_but_active,
  COUNT(CASE WHEN status = 'active' AND expires_at > NOW() THEN 1 END) as valid_active
FROM user_subscriptions;

-- ============================================
-- 3. orders 表详细检查
-- ============================================

SELECT '=== 3. orders 表字段检查 ===' as section;

-- 3.1 检查必需字段
SELECT 
  'orders' as table_name,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_id') as has_order_id,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') as has_user_id,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'product_type') as has_product_type,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'duration_type') as has_duration_type,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'status') as has_status;

-- ============================================
-- 4. user_usage_logs 表详细检查
-- ============================================

SELECT '=== 4. user_usage_logs 表字段检查 ===' as section;

-- 4.1 检查时间戳字段（向后兼容）
SELECT 
  'user_usage_logs' as table_name,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_usage_logs' AND column_name = 'timestamp') as has_timestamp,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_usage_logs' AND column_name = 'created_at') as has_created_at;

-- ============================================
-- 5. RLS 策略审查
-- ============================================

SELECT '=== 5. RLS 策略检查 ===' as section;

-- 5.1 检查 RLS 是否启用
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_subscriptions', 'orders', 'user_usage_logs');

-- 5.2 查看所有 RLS 策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE tablename IN ('user_subscriptions', 'orders', 'user_usage_logs')
ORDER BY tablename, policyname;

-- ============================================
-- 6. 索引优化检查
-- ============================================

SELECT '=== 6. 索引检查 ===' as section;

-- 6.1 查看所有索引
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('user_subscriptions', 'orders', 'user_usage_logs')
ORDER BY tablename, indexname;

-- 6.2 检查关键索引是否存在
SELECT 
  'user_subscriptions' as table_name,
  EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'user_subscriptions' AND indexdef LIKE '%user_id%') as has_user_id_index,
  EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'user_subscriptions' AND indexdef LIKE '%order_id%') as has_order_id_index,
  EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'user_subscriptions' AND indexdef LIKE '%status%') as has_status_index;

-- ============================================
-- 7. 外键关系检查
-- ============================================

SELECT '=== 7. 外键关系检查 ===' as section;

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
  AND tc.table_name IN ('user_subscriptions', 'orders', 'user_usage_logs')
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================
-- 8. 数据一致性深度检查
-- ============================================

SELECT '=== 8. 数据一致性检查 ===' as section;

-- 8.1 检查订阅与订单的关联
SELECT 
  '=== 订阅-订单关联检查 ===' as check_type,
  COUNT(DISTINCT s.id) as total_subscriptions,
  COUNT(DISTINCT CASE WHEN s.order_id IS NOT NULL THEN s.id END) as subscriptions_with_order,
  COUNT(DISTINCT CASE WHEN s.order_id IS NOT NULL AND o.order_id IS NULL THEN s.id END) as orphaned_subscriptions,
  COUNT(DISTINCT CASE WHEN s.order_id IS NOT NULL AND o.order_id IS NOT NULL THEN s.id END) as valid_associations
FROM user_subscriptions s
LEFT JOIN orders o ON s.order_id = o.order_id;

-- 8.2 检查订单状态与订阅状态的一致性
SELECT 
  '=== 订单-订阅状态一致性 ===' as check_type,
  o.status as order_status,
  s.status as subscription_status,
  COUNT(*) as count
FROM orders o
LEFT JOIN user_subscriptions s ON o.order_id = s.order_id
WHERE o.status IN ('paid', 'processed')
GROUP BY o.status, s.status
ORDER BY o.status, s.status;

-- 8.3 检查过期但仍标记为 active 的订阅
SELECT 
  '=== 过期订阅检查 ===' as check_type,
  id,
  user_id,
  tier,
  status,
  expires_at,
  NOW() - expires_at as overdue_duration
FROM user_subscriptions
WHERE status = 'active' 
  AND expires_at < NOW()
ORDER BY expires_at;

-- ============================================
-- 9. 字段值规范性检查
-- ============================================

SELECT '=== 9. 字段值规范性检查 ===' as section;

-- 9.1 检查 tier 字段的值是否规范
SELECT 
  '=== tier 字段值分布 ===' as check_type,
  tier,
  COUNT(*) as count,
  CASE 
    WHEN tier IN ('trial', 'pro', 'premium') THEN '✅ 有效'
    ELSE '❌ 无效'
  END as validity
FROM user_subscriptions
GROUP BY tier
ORDER BY count DESC;

-- 9.2 检查 status 字段的值是否规范
SELECT 
  '=== status 字段值分布 ===' as check_type,
  status,
  COUNT(*) as count,
  CASE 
    WHEN status IN ('active', 'expired', 'cancelled') THEN '✅ 有效'
    ELSE '❌ 无效'
  END as validity
FROM user_subscriptions
GROUP BY status
ORDER BY count DESC;

-- 9.3 检查 period 字段的值是否规范
SELECT 
  '=== period 字段值分布 ===' as check_type,
  period,
  COUNT(*) as count,
  CASE 
    WHEN period IN ('monthly', 'yearly') OR period IS NULL THEN '✅ 有效'
    ELSE '❌ 无效'
  END as validity
FROM user_subscriptions
GROUP BY period
ORDER BY count DESC;

-- ============================================
-- 10. 性能和优化建议
-- ============================================

SELECT '=== 10. 表统计信息 ===' as section;

-- 10.1 表大小和行数统计
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_subscriptions', 'orders', 'user_usage_logs')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- 审查完成
-- ============================================

SELECT '=== 审查完成 ===' as section,
       NOW() as completed_at;


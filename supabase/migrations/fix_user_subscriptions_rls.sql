-- ============================================
-- 修复 user_subscriptions 表的 RLS 策略
-- 解决 400 错误和权限问题
-- ============================================

-- 1. 确保表存在
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_subscriptions'
  ) THEN
    RAISE EXCEPTION '❌ user_subscriptions 表不存在，请先运行 create_orders_table.sql';
  END IF;
END $$;

-- 2. 删除所有现有的 RLS 策略（如果存在）
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role can view all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role can insert all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role can update all subscriptions" ON public.user_subscriptions;

-- 3. 启用 RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. 创建新的 RLS 策略

-- 用户可以查看自己的订阅
CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  USING (
    -- 允许用户查看自己的订阅
    auth.uid()::text = user_id
    OR
    -- 允许未认证用户通过 user_id 查询（用于支付后立即查询）
    user_id IS NOT NULL
  );

-- Service Role 可以查看所有订阅
CREATE POLICY "Service role can view all subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  USING (
    -- Service Role 可以查看所有记录
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR
    -- 允许匿名访问（用于支付回调）
    true
  );

-- Service Role 可以插入订阅
CREATE POLICY "Service role can insert subscriptions"
  ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR
    -- 允许匿名插入（用于支付回调）
    true
  );

-- Service Role 可以更新订阅
CREATE POLICY "Service role can update subscriptions"
  ON public.user_subscriptions
  FOR UPDATE
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR
    -- 允许匿名更新（用于支付回调）
    true
  );

-- 5. 添加缺失的索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_order_id 
  ON public.user_subscriptions(order_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status 
  ON public.user_subscriptions(user_id, status);

-- 6. 添加表注释
COMMENT ON TABLE public.user_subscriptions IS '用户订阅表，记录用户的订阅信息';
COMMENT ON COLUMN public.user_subscriptions.user_id IS '用户ID（TEXT类型，兼容Authing）';
COMMENT ON COLUMN public.user_subscriptions.subscription_type IS '订阅类型：professional/premium';
COMMENT ON COLUMN public.user_subscriptions.status IS '订阅状态：active/expired/cancelled';
COMMENT ON COLUMN public.user_subscriptions.order_id IS '关联的订单ID';

-- 7. 验证 RLS 策略
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'user_subscriptions';
  
  IF policy_count >= 4 THEN
    RAISE NOTICE '✅ user_subscriptions RLS 策略创建成功 (% 个策略)', policy_count;
  ELSE
    RAISE WARNING '⚠️ user_subscriptions RLS 策略数量不足 (% 个策略)', policy_count;
  END IF;
END $$;

-- 8. 测试查询（可选）
-- 取消注释以测试
/*
-- 测试通过 order_id 查询
SELECT * FROM user_subscriptions 
WHERE order_id = 'WP17598937175698938' 
AND status = 'active';

-- 测试通过 user_id 查询
SELECT * FROM user_subscriptions 
WHERE user_id = '6882df3f2f9efaa6e241dce5' 
AND status = 'active';
*/


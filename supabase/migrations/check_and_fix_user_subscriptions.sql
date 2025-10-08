-- ============================================
-- 检查并修复 user_subscriptions 表结构
-- ============================================

-- 1. 查看当前表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- 2. 如果缺少 order_id 列，添加它
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' 
    AND column_name = 'order_id'
  ) THEN
    -- 添加 order_id 列
    ALTER TABLE public.user_subscriptions 
    ADD COLUMN order_id TEXT;
    
    -- 添加外键约束（如果 orders 表存在）
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'orders'
    ) THEN
      ALTER TABLE public.user_subscriptions
      ADD CONSTRAINT fk_user_subscriptions_order_id
      FOREIGN KEY (order_id) REFERENCES orders(order_id);
    END IF;
    
    -- 添加索引
    CREATE INDEX IF NOT EXISTS idx_user_subscriptions_order_id 
      ON public.user_subscriptions(order_id);
    
    RAISE NOTICE '✅ order_id 列已添加';
  ELSE
    RAISE NOTICE '✅ order_id 列已存在';
  END IF;
END $$;

-- 3. 确保其他必需列存在
DO $$
BEGIN
  -- 检查并添加 subscription_type 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' 
    AND column_name = 'subscription_type'
  ) THEN
    ALTER TABLE public.user_subscriptions 
    ADD COLUMN subscription_type TEXT NOT NULL DEFAULT 'professional';
    
    RAISE NOTICE '✅ subscription_type 列已添加';
  END IF;

  -- 检查并添加 status 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.user_subscriptions 
    ADD COLUMN status TEXT DEFAULT 'active';
    
    RAISE NOTICE '✅ status 列已添加';
  END IF;

  -- 检查并添加 started_at 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' 
    AND column_name = 'started_at'
  ) THEN
    ALTER TABLE public.user_subscriptions 
    ADD COLUMN started_at TIMESTAMPTZ DEFAULT NOW();
    
    RAISE NOTICE '✅ started_at 列已添加';
  END IF;

  -- 检查并添加 expires_at 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' 
    AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE public.user_subscriptions 
    ADD COLUMN expires_at TIMESTAMPTZ;
    
    RAISE NOTICE '✅ expires_at 列已添加';
  END IF;
END $$;

-- 4. 删除所有现有的 RLS 策略
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role can view all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role can insert subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role can update subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Allow all select on user_subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Allow all insert on user_subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Allow all update on user_subscriptions" ON public.user_subscriptions;

-- 5. 启用 RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. 创建新的宽松策略
CREATE POLICY "Allow all select on user_subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert on user_subscriptions"
  ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update on user_subscriptions"
  ON public.user_subscriptions
  FOR UPDATE
  USING (true);

-- 7. 添加必要的索引
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
  ON public.user_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status 
  ON public.user_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at 
  ON public.user_subscriptions(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status 
  ON public.user_subscriptions(user_id, status);

-- 8. 验证表结构
DO $$
DECLARE
  col_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- 检查列数
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'user_subscriptions';
  
  RAISE NOTICE '✅ user_subscriptions 表有 % 列', col_count;
  
  -- 检查策略数
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'user_subscriptions';
  
  RAISE NOTICE '✅ user_subscriptions 表有 % 个 RLS 策略', policy_count;
END $$;

-- 9. 显示最终表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;


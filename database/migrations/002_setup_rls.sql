-- =====================================================
-- 行级安全策略配置
-- @description 为订阅表配置RLS,确保数据安全
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- =====================================================
-- 1. 启用行级安全
-- =====================================================

-- 启用 user_subscriptions 表的 RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 启用 subscription_history 表的 RLS
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- 启用 payment_records 表的 RLS
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. 创建 RLS 策略: user_subscriptions
-- =====================================================

-- 用户只能查看自己的订阅
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- 用户可以插入自己的订阅 (首次注册)
CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- 用户不能直接更新订阅 (只能通过服务器端)
CREATE POLICY "Only service can update subscriptions"
  ON user_subscriptions
  FOR UPDATE
  USING (false);

-- 管理员可以查看所有订阅
CREATE POLICY "Admins can view all subscriptions"
  ON user_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()::text
        AND role IN ('admin', 'super_admin')
    )
  );

-- 服务角色可以执行所有操作
CREATE POLICY "Service role has full access"
  ON user_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 3. 创建 RLS 策略: subscription_history
-- =====================================================

-- 用户只能查看自己的订阅历史
CREATE POLICY "Users can view own history"
  ON subscription_history
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- 只有系统可以插入历史记录
CREATE POLICY "Only system can insert history"
  ON subscription_history
  FOR INSERT
  WITH CHECK (false);

-- 管理员可以查看所有历史
CREATE POLICY "Admins can view all history"
  ON subscription_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()::text
        AND role IN ('admin', 'super_admin')
    )
  );

-- 服务角色可以执行所有操作
CREATE POLICY "Service role has full access to history"
  ON subscription_history
  FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 4. 创建 RLS 策略: payment_records
-- =====================================================

-- 用户只能查看自己的支付记录
CREATE POLICY "Users can view own payments"
  ON payment_records
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- 用户不能修改支付记录
CREATE POLICY "Users cannot modify payments"
  ON payment_records
  FOR INSERT
  WITH CHECK (false);

-- 管理员可以查看所有支付记录
CREATE POLICY "Admins can view all payments"
  ON payment_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()::text
        AND role IN ('admin', 'super_admin')
    )
  );

-- 服务角色可以执行所有操作
CREATE POLICY "Service role has full access to payments"
  ON payment_records
  FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 5. 创建用户角色表 (如果不存在)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by TEXT,
  UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- 插入测试管理员
INSERT INTO user_roles (user_id, role, created_by)
VALUES ('test-admin', 'admin', 'system')
ON CONFLICT (user_id, role) DO NOTHING;

-- =====================================================
-- 6. 创建安全函数: 更新订阅状态 (服务器端调用)
-- =====================================================

CREATE OR REPLACE FUNCTION update_subscription_status(
  p_user_id TEXT,
  p_tier TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_expires_at TIMESTAMP DEFAULT NULL,
  p_auto_renew BOOLEAN DEFAULT NULL
)
RETURNS user_subscriptions AS $$
DECLARE
  v_subscription user_subscriptions;
BEGIN
  -- 更新订阅
  UPDATE user_subscriptions
  SET
    tier = COALESCE(p_tier, tier),
    status = COALESCE(p_status, status),
    expires_at = COALESCE(p_expires_at, expires_at),
    auto_renew = COALESCE(p_auto_renew, auto_renew),
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING * INTO v_subscription;

  -- 如果不存在订阅,创建新订阅
  IF v_subscription IS NULL THEN
    INSERT INTO user_subscriptions (
      user_id,
      tier,
      status,
      expires_at,
      auto_renew
    ) VALUES (
      p_user_id,
      COALESCE(p_tier, 'trial'),
      COALESCE(p_status, 'active'),
      COALESCE(p_expires_at, NOW() + INTERVAL '30 days'),
      COALESCE(p_auto_renew, false)
    )
    RETURNING * INTO v_subscription;
  END IF;

  RETURN v_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. 创建安全函数: 记录支付
-- =====================================================

CREATE OR REPLACE FUNCTION record_payment(
  p_user_id TEXT,
  p_payment_id TEXT,
  p_payment_method TEXT,
  p_payment_provider TEXT,
  p_amount DECIMAL,
  p_product_id TEXT,
  p_product_name TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS payment_records AS $$
DECLARE
  v_payment payment_records;
BEGIN
  INSERT INTO payment_records (
    user_id,
    payment_id,
    payment_method,
    payment_provider,
    amount,
    currency,
    final_amount,
    product_id,
    product_name,
    status,
    metadata
  ) VALUES (
    p_user_id,
    p_payment_id,
    p_payment_method,
    p_payment_provider,
    p_amount,
    'CNY',
    p_amount,
    p_product_id,
    p_product_name,
    'pending',
    p_metadata
  )
  RETURNING * INTO v_payment;

  RETURN v_payment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. 创建安全函数: 确认支付成功
-- =====================================================

CREATE OR REPLACE FUNCTION confirm_payment_success(
  p_payment_id TEXT,
  p_subscription_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_payment payment_records;
  v_subscription user_subscriptions;
  v_result JSONB;
BEGIN
  -- 更新支付状态
  UPDATE payment_records
  SET
    status = 'success',
    paid_at = NOW(),
    subscription_id = p_subscription_id,
    updated_at = NOW()
  WHERE payment_id = p_payment_id
  RETURNING * INTO v_payment;

  IF v_payment IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Payment not found'
    );
  END IF;

  -- 如果有关联订阅,更新订阅状态
  IF p_subscription_id IS NOT NULL THEN
    UPDATE user_subscriptions
    SET
      status = 'active',
      last_payment_id = p_payment_id,
      updated_at = NOW()
    WHERE id = p_subscription_id
    RETURNING * INTO v_subscription;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'payment', to_jsonb(v_payment),
    'subscription', to_jsonb(v_subscription)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. 验证 RLS 配置
-- =====================================================

DO $$
DECLARE
  rls_enabled_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rls_enabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('user_subscriptions', 'subscription_history', 'payment_records')
    AND rowsecurity = true;

  IF rls_enabled_count = 3 THEN
    RAISE NOTICE '✅ RLS已在所有表上启用';
  ELSE
    RAISE EXCEPTION '❌ RLS启用失败';
  END IF;
END $$;

-- =====================================================
-- 完成提示
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ RLS配置完成!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '已配置:';
  RAISE NOTICE '  - 3个表的RLS策略';
  RAISE NOTICE '  - 用户只能访问自己的数据';
  RAISE NOTICE '  - 管理员可以访问所有数据';
  RAISE NOTICE '  - 服务角色拥有完全权限';
  RAISE NOTICE '';
  RAISE NOTICE '安全函数:';
  RAISE NOTICE '  - update_subscription_status()';
  RAISE NOTICE '  - record_payment()';
  RAISE NOTICE '  - confirm_payment_success()';
  RAISE NOTICE '';
  RAISE NOTICE '下一步:';
  RAISE NOTICE '  1. 测试RLS策略';
  RAISE NOTICE '  2. 集成支付回调';
  RAISE NOTICE '  3. 配置定时任务';
  RAISE NOTICE '========================================';
END $$;

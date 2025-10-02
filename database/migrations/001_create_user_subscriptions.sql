-- =====================================================
-- 用户订阅表创建脚本
-- @description 创建订阅权限系统所需的数据库表
-- @version 1.0.0
-- @created 2025-10-02
-- =====================================================

-- =====================================================
-- 1. 创建订阅表
-- =====================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 用户关联
  user_id TEXT NOT NULL UNIQUE,

  -- 订阅信息
  tier TEXT NOT NULL CHECK (tier IN ('trial', 'pro', 'premium')),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  period TEXT CHECK (period IN ('monthly', 'yearly', 'lifetime')),

  -- 时间信息
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  auto_renew BOOLEAN DEFAULT false,

  -- 支付信息
  payment_method TEXT,
  last_payment_id TEXT,
  next_billing_date TIMESTAMP,

  -- 试用信息
  trial_started_at TIMESTAMP,
  trial_ends_at TIMESTAMP,

  -- 优惠信息
  discount_code TEXT,
  discount_percentage INTEGER DEFAULT 0,

  -- 元数据
  metadata JSONB DEFAULT '{}',

  -- 审计字段
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- =====================================================
-- 2. 创建索引
-- =====================================================

-- 用户ID索引 (最常查询)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
ON user_subscriptions(user_id);

-- 状态索引 (用于过期检查)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status
ON user_subscriptions(status);

-- 过期时间索引 (用于自动过期处理)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at
ON user_subscriptions(expires_at);

-- 组合索引: 用户ID + 状态 (最优查询性能)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status
ON user_subscriptions(user_id, status);

-- 自动续费索引 (用于续费任务)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_auto_renew
ON user_subscriptions(auto_renew, next_billing_date)
WHERE auto_renew = true;

-- =====================================================
-- 3. 创建订阅历史表
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  -- 变更信息
  action TEXT NOT NULL CHECK (action IN ('created', 'upgraded', 'downgraded', 'renewed', 'cancelled', 'expired')),
  from_tier TEXT,
  to_tier TEXT,
  from_status TEXT,
  to_status TEXT,

  -- 原因和备注
  reason TEXT,
  notes TEXT,

  -- 关联信息
  payment_id TEXT,

  -- 时间戳
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by TEXT
);

-- 订阅历史索引
CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription_id
ON subscription_history(subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id
ON subscription_history(user_id);

CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at
ON subscription_history(created_at DESC);

-- =====================================================
-- 4. 创建支付记录表
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 关联信息
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL,

  -- 支付信息
  payment_id TEXT UNIQUE NOT NULL,
  payment_method TEXT NOT NULL,
  payment_provider TEXT NOT NULL, -- 'bufpay', 'stripe', 'alipay', etc.

  -- 金额信息
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CNY',
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL,

  -- 订单信息
  order_id TEXT UNIQUE,
  product_id TEXT,
  product_name TEXT,

  -- 状态
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'failed', 'refunded')),

  -- 支付详情
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,

  -- 元数据
  metadata JSONB DEFAULT '{}',

  -- 审计
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 支付记录索引
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id
ON payment_records(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_records_payment_id
ON payment_records(payment_id);

CREATE INDEX IF NOT EXISTS idx_payment_records_status
ON payment_records(status);

CREATE INDEX IF NOT EXISTS idx_payment_records_created_at
ON payment_records(created_at DESC);

-- =====================================================
-- 5. 创建更新时间触发器
-- =====================================================

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用到订阅表
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 应用到支付记录表
DROP TRIGGER IF EXISTS update_payment_records_updated_at ON payment_records;
CREATE TRIGGER update_payment_records_updated_at
  BEFORE UPDATE ON payment_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. 创建订阅变更触发器 (记录历史)
-- =====================================================

CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  -- 记录订阅变更历史
  INSERT INTO subscription_history (
    subscription_id,
    user_id,
    action,
    from_tier,
    to_tier,
    from_status,
    to_status,
    created_by
  ) VALUES (
    NEW.id,
    NEW.user_id,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN OLD.tier != NEW.tier THEN
        CASE
          WHEN NEW.tier = 'premium' THEN 'upgraded'
          WHEN NEW.tier = 'pro' AND OLD.tier = 'premium' THEN 'downgraded'
          WHEN NEW.tier = 'pro' AND OLD.tier = 'trial' THEN 'upgraded'
          ELSE 'downgraded'
        END
      WHEN OLD.status = 'active' AND NEW.status = 'cancelled' THEN 'cancelled'
      WHEN OLD.status = 'active' AND NEW.status = 'expired' THEN 'expired'
      ELSE 'renewed'
    END,
    OLD.tier,
    NEW.tier,
    OLD.status,
    NEW.status,
    NEW.updated_by
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_subscription_change_trigger ON user_subscriptions;
CREATE TRIGGER log_subscription_change_trigger
  AFTER INSERT OR UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_change();

-- =====================================================
-- 7. 插入测试数据
-- =====================================================

-- 清除现有测试数据
DELETE FROM user_subscriptions WHERE user_id LIKE 'test-%';

-- 试用版用户
INSERT INTO user_subscriptions (
  user_id,
  tier,
  status,
  started_at,
  expires_at,
  created_by
) VALUES (
  'test-trial',
  'trial',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  'system'
);

-- Pro用户 (月付)
INSERT INTO user_subscriptions (
  user_id,
  tier,
  status,
  period,
  started_at,
  expires_at,
  auto_renew,
  next_billing_date,
  payment_method,
  created_by
) VALUES (
  'test-pro',
  'pro',
  'active',
  'monthly',
  NOW() - INTERVAL '15 days',
  NOW() + INTERVAL '15 days',
  true,
  NOW() + INTERVAL '15 days',
  'alipay',
  'system'
);

-- Premium用户 (年付)
INSERT INTO user_subscriptions (
  user_id,
  tier,
  status,
  period,
  started_at,
  expires_at,
  auto_renew,
  next_billing_date,
  payment_method,
  discount_percentage,
  created_by
) VALUES (
  'test-premium',
  'premium',
  'active',
  'yearly',
  NOW() - INTERVAL '180 days',
  NOW() + INTERVAL '185 days',
  true,
  NOW() + INTERVAL '185 days',
  'wechat',
  20,
  'system'
);

-- 即将过期的用户 (用于测试过期处理)
INSERT INTO user_subscriptions (
  user_id,
  tier,
  status,
  period,
  started_at,
  expires_at,
  auto_renew,
  created_by
) VALUES (
  'test-expiring',
  'pro',
  'active',
  'monthly',
  NOW() - INTERVAL '29 days',
  NOW() + INTERVAL '1 day',
  false,
  'system'
);

-- 已过期用户 (应该被自动降级)
INSERT INTO user_subscriptions (
  user_id,
  tier,
  status,
  period,
  started_at,
  expires_at,
  created_by
) VALUES (
  'test-expired',
  'pro',
  'expired',
  'monthly',
  NOW() - INTERVAL '60 days',
  NOW() - INTERVAL '5 days',
  'system'
);

-- =====================================================
-- 8. 创建视图: 活跃订阅统计
-- =====================================================

CREATE OR REPLACE VIEW active_subscriptions_stats AS
SELECT
  tier,
  COUNT(*) as total_users,
  COUNT(CASE WHEN period = 'monthly' THEN 1 END) as monthly_users,
  COUNT(CASE WHEN period = 'yearly' THEN 1 END) as yearly_users,
  COUNT(CASE WHEN auto_renew = true THEN 1 END) as auto_renew_users,
  AVG(EXTRACT(EPOCH FROM (expires_at - started_at)) / 86400) as avg_subscription_days
FROM user_subscriptions
WHERE status = 'active'
GROUP BY tier
ORDER BY
  CASE tier
    WHEN 'premium' THEN 3
    WHEN 'pro' THEN 2
    ELSE 1
  END DESC;

-- =====================================================
-- 9. 创建函数: 检查用户权限
-- =====================================================

CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id TEXT,
  p_required_tier TEXT
)
RETURNS TABLE(
  has_permission BOOLEAN,
  user_tier TEXT,
  expires_at TIMESTAMP,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN s.tier = 'premium' THEN true
      WHEN s.tier = 'pro' AND p_required_tier IN ('trial', 'pro') THEN true
      WHEN s.tier = 'trial' AND p_required_tier = 'trial' THEN true
      ELSE false
    END as has_permission,
    COALESCE(s.tier, 'trial') as user_tier,
    s.expires_at,
    EXTRACT(DAY FROM (s.expires_at - NOW()))::INTEGER as days_remaining
  FROM user_subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
  LIMIT 1;

  -- 如果没有订阅记录,返回试用版
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      CASE WHEN p_required_tier = 'trial' THEN true ELSE false END as has_permission,
      'trial'::TEXT as user_tier,
      NULL::TIMESTAMP as expires_at,
      NULL::INTEGER as days_remaining;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. 验证安装
-- =====================================================

-- 检查表是否创建成功
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('user_subscriptions', 'subscription_history', 'payment_records');

  IF table_count = 3 THEN
    RAISE NOTICE '✅ 所有表创建成功';
  ELSE
    RAISE EXCEPTION '❌ 表创建失败，期望3个表，实际创建%个', table_count;
  END IF;
END $$;

-- 检查测试数据
DO $$
DECLARE
  test_data_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO test_data_count
  FROM user_subscriptions
  WHERE user_id LIKE 'test-%';

  IF test_data_count >= 4 THEN
    RAISE NOTICE '✅ 测试数据插入成功，共%条', test_data_count;
  ELSE
    RAISE EXCEPTION '❌ 测试数据插入失败';
  END IF;
END $$;

-- 显示统计信息
SELECT
  '订阅统计' as category,
  tier,
  total_users,
  monthly_users,
  yearly_users,
  auto_renew_users
FROM active_subscriptions_stats;

-- =====================================================
-- 完成提示
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ 数据库迁移完成!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '已创建:';
  RAISE NOTICE '  - user_subscriptions 表';
  RAISE NOTICE '  - subscription_history 表';
  RAISE NOTICE '  - payment_records 表';
  RAISE NOTICE '  - 8个索引';
  RAISE NOTICE '  - 3个触发器';
  RAISE NOTICE '  - 1个视图';
  RAISE NOTICE '  - 1个权限检查函数';
  RAISE NOTICE '  - 5条测试数据';
  RAISE NOTICE '';
  RAISE NOTICE '测试用户:';
  RAISE NOTICE '  - test-trial (体验版)';
  RAISE NOTICE '  - test-pro (专业版)';
  RAISE NOTICE '  - test-premium (高级版)';
  RAISE NOTICE '  - test-expiring (即将过期)';
  RAISE NOTICE '  - test-expired (已过期)';
  RAISE NOTICE '';
  RAISE NOTICE '下一步:';
  RAISE NOTICE '  1. 运行 002_setup_rls.sql 配置行级安全';
  RAISE NOTICE '  2. 测试权限查询函数';
  RAISE NOTICE '  3. 集成到应用';
  RAISE NOTICE '========================================';
END $$;

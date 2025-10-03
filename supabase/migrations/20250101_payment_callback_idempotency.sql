-- 支付回调幂等性保证
-- 使用数据库事务和行锁确保回调处理的原子性

-- 1. 创建回调日志表(如果不存在)
CREATE TABLE IF NOT EXISTS payment_callback_log (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL,
  aoid TEXT,
  pay_price NUMERIC(10, 2),
  notify_data JSONB,
  is_duplicate BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_callback_order_id (order_id),
  INDEX idx_callback_created_at (created_at)
);

-- 2. 创建原子性的支付回调处理函数
CREATE OR REPLACE FUNCTION process_payment_callback(
  p_order_id TEXT,
  p_aoid TEXT,
  p_pay_price NUMERIC,
  p_notify_data JSONB DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_subscription_id BIGINT;
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
  v_duration_days INT;
BEGIN
  -- 1. 加行锁防止并发,获取订单
  SELECT * INTO v_order
  FROM orders
  WHERE order_id = p_order_id
  FOR UPDATE;

  -- 1.1 检查订单是否存在
  IF NOT FOUND THEN
    -- 记录失败日志
    INSERT INTO payment_callback_log (order_id, aoid, pay_price, notify_data, is_duplicate)
    VALUES (p_order_id, p_aoid, p_pay_price, p_notify_data, FALSE);

    RETURN jsonb_build_object(
      'success', FALSE,
      'duplicate', FALSE,
      'error', '订单不存在'
    );
  END IF;

  -- 2. 幂等性检查 - 如果订单已支付或已处理,记录重复回调
  IF v_order.status IN ('paid', 'processed') THEN
    -- 记录重复回调
    INSERT INTO payment_callback_log (order_id, aoid, pay_price, notify_data, is_duplicate)
    VALUES (p_order_id, p_aoid, p_pay_price, p_notify_data, TRUE);

    RETURN jsonb_build_object(
      'success', TRUE,
      'duplicate', TRUE,
      'message', '订单已处理',
      'current_status', v_order.status
    );
  END IF;

  -- 3. 检查订单状态是否为pending(只有pending才能转paid)
  IF v_order.status != 'pending' THEN
    -- 记录异常日志
    INSERT INTO payment_callback_log (order_id, aoid, pay_price, notify_data, is_duplicate)
    VALUES (p_order_id, p_aoid, p_pay_price, p_notify_data, FALSE);

    RETURN jsonb_build_object(
      'success', FALSE,
      'duplicate', FALSE,
      'error', '订单状态不正确: ' || v_order.status
    );
  END IF;

  -- 4. 更新订单为已支付状态
  UPDATE orders SET
    status = 'paid',
    aoid = p_aoid,
    pay_price = p_pay_price,
    paid_at = NOW(),
    notify_data = p_notify_data,
    notify_verified = TRUE,
    updated_at = NOW()
  WHERE order_id = p_order_id;

  -- 5. 创建订阅记录
  -- 5.1 计算订阅时长
  v_duration_days := CASE
    WHEN v_order.duration_type = 'monthly' THEN 30
    WHEN v_order.duration_type = 'yearly' THEN 365
    ELSE 30
  END;

  v_start_date := NOW();
  v_end_date := v_start_date + (v_duration_days || ' days')::INTERVAL;

  -- 5.2 插入订阅记录
  INSERT INTO user_subscriptions (
    user_id,
    order_id,
    subscription_type,
    duration_type,
    start_date,
    end_date,
    status,
    auto_renew
  ) VALUES (
    v_order.user_id,
    p_order_id,
    v_order.product_type,
    v_order.duration_type,
    v_start_date,
    v_end_date,
    'active',
    FALSE
  )
  RETURNING id INTO v_subscription_id;

  -- 6. 更新订单为已处理状态
  UPDATE orders SET
    status = 'processed',
    processed_at = NOW(),
    subscription_id = v_subscription_id,
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'subscription_id', v_subscription_id,
      'processed_by', 'payment_callback',
      'processed_at', NOW()
    )
  WHERE order_id = p_order_id;

  -- 7. 记录成功日志
  INSERT INTO payment_callback_log (order_id, aoid, pay_price, notify_data, is_duplicate)
  VALUES (p_order_id, p_aoid, p_pay_price, p_notify_data, FALSE);

  -- 8. 返回成功结果
  RETURN jsonb_build_object(
    'success', TRUE,
    'duplicate', FALSE,
    'subscription_id', v_subscription_id,
    'start_date', v_start_date,
    'end_date', v_end_date
  );

EXCEPTION
  WHEN OTHERS THEN
    -- 记录错误日志
    INSERT INTO payment_callback_log (order_id, aoid, pay_price, notify_data, is_duplicate)
    VALUES (p_order_id, p_aoid, p_pay_price,
      jsonb_build_object('error', SQLERRM, 'original_data', p_notify_data),
      FALSE
    );

    -- 返回错误
    RETURN jsonb_build_object(
      'success', FALSE,
      'duplicate', FALSE,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- 3. 创建查询重复回调的辅助函数
CREATE OR REPLACE FUNCTION get_duplicate_callbacks(
  p_order_id TEXT DEFAULT NULL,
  p_hours INT DEFAULT 24
) RETURNS TABLE (
  order_id TEXT,
  callback_count BIGINT,
  first_callback TIMESTAMPTZ,
  last_callback TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pcl.order_id,
    COUNT(*) as callback_count,
    MIN(pcl.created_at) as first_callback,
    MAX(pcl.created_at) as last_callback
  FROM payment_callback_log pcl
  WHERE
    pcl.created_at > NOW() - (p_hours || ' hours')::INTERVAL
    AND (p_order_id IS NULL OR pcl.order_id = p_order_id)
  GROUP BY pcl.order_id
  HAVING COUNT(*) > 1
  ORDER BY callback_count DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. 创建权限修复函数(用于修复已支付但未处理的订单)
CREATE OR REPLACE FUNCTION repair_order_permissions(
  p_order_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_existing_subscription RECORD;
  v_subscription_id BIGINT;
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
  v_duration_days INT;
BEGIN
  -- 1. 获取订单(加锁)
  SELECT * INTO v_order
  FROM orders
  WHERE order_id = p_order_id
  FOR UPDATE;

  -- 1.1 检查订单是否存在
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', '订单不存在'
    );
  END IF;

  -- 2. 检查订单状态必须是paid
  IF v_order.status != 'paid' THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', '订单状态不是已支付: ' || v_order.status
    );
  END IF;

  -- 3. 检查是否已经有订阅(幂等性)
  SELECT * INTO v_existing_subscription
  FROM user_subscriptions
  WHERE order_id = p_order_id;

  IF FOUND THEN
    -- 如果订阅已存在,只需更新订单状态为processed
    UPDATE orders SET
      status = 'processed',
      processed_at = NOW(),
      subscription_id = v_existing_subscription.id,
      metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'repaired_at', NOW(),
        'repair_method', 'repair_function'
      )
    WHERE order_id = p_order_id;

    RETURN jsonb_build_object(
      'success', TRUE,
      'subscription_id', v_existing_subscription.id,
      'repaired', TRUE,
      'message', '订阅已存在,仅更新订单状态'
    );
  END IF;

  -- 4. 创建订阅
  v_duration_days := CASE
    WHEN v_order.duration_type = 'monthly' THEN 30
    WHEN v_order.duration_type = 'yearly' THEN 365
    ELSE 30
  END;

  v_start_date := NOW();
  v_end_date := v_start_date + (v_duration_days || ' days')::INTERVAL;

  INSERT INTO user_subscriptions (
    user_id,
    order_id,
    subscription_type,
    duration_type,
    start_date,
    end_date,
    status,
    auto_renew
  ) VALUES (
    v_order.user_id,
    p_order_id,
    v_order.product_type,
    v_order.duration_type,
    v_start_date,
    v_end_date,
    'active',
    FALSE
  )
  RETURNING id INTO v_subscription_id;

  -- 5. 更新订单状态
  UPDATE orders SET
    status = 'processed',
    processed_at = NOW(),
    subscription_id = v_subscription_id,
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'subscription_id', v_subscription_id,
      'repaired_at', NOW(),
      'repair_method', 'repair_function'
    )
  WHERE order_id = p_order_id;

  -- 6. 返回成功结果
  RETURN jsonb_build_object(
    'success', TRUE,
    'subscription_id', v_subscription_id,
    'repaired', TRUE,
    'message', '权限修复成功'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- 5. 创建批量修复函数
CREATE OR REPLACE FUNCTION batch_repair_orders(
  p_max_orders INT DEFAULT 100
) RETURNS JSONB AS $$
DECLARE
  v_order_id TEXT;
  v_repaired INT := 0;
  v_failed INT := 0;
  v_result JSONB;
BEGIN
  -- 查找需要修复的订单(已支付超过5分钟但未处理)
  FOR v_order_id IN
    SELECT order_id
    FROM orders
    WHERE status = 'paid'
      AND paid_at < NOW() - INTERVAL '5 minutes'
    ORDER BY paid_at
    LIMIT p_max_orders
  LOOP
    -- 尝试修复每个订单
    v_result := repair_order_permissions(v_order_id);

    IF (v_result->>'success')::BOOLEAN THEN
      v_repaired := v_repaired + 1;
    ELSE
      v_failed := v_failed + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', TRUE,
    'repaired', v_repaired,
    'failed', v_failed,
    'total', v_repaired + v_failed
  );
END;
$$ LANGUAGE plpgsql;

-- 6. 添加注释
COMMENT ON FUNCTION process_payment_callback IS '原子性处理支付回调,确保幂等性';
COMMENT ON FUNCTION get_duplicate_callbacks IS '查询重复的支付回调';
COMMENT ON FUNCTION repair_order_permissions IS '修复单个订单的权限';
COMMENT ON FUNCTION batch_repair_orders IS '批量修复已支付但未处理的订单';
COMMENT ON TABLE payment_callback_log IS '支付回调日志表';

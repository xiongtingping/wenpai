-- ============================================
-- 创建用户使用日志表 (user_usage_logs)
-- 用于记录用户的功能使用情况和统计
-- ============================================

-- 1. 创建表
CREATE TABLE IF NOT EXISTS public.user_usage_logs (
  -- 主键
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 用户信息
  user_id TEXT NOT NULL,
  
  -- 使用信息
  action TEXT NOT NULL,                    -- 操作类型：如 'ai_generation', 'export', 'template_use' 等
  feature TEXT,                            -- 功能模块：如 'content_adapter', 'md2card', 'emoji' 等
  details JSONB,                           -- 详细信息（JSON格式）
  
  -- 资源消耗
  tokens_used INTEGER DEFAULT 0,          -- 使用的 Token 数量
  credits_used INTEGER DEFAULT 0,         -- 使用的积分数量
  
  -- 时间戳（支持两种字段名以兼容旧代码）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- 元数据
  metadata JSONB,                          -- 额外的元数据
  ip_address TEXT,                         -- IP地址
  user_agent TEXT                          -- 用户代理
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_usage_logs_user_id 
  ON public.user_usage_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_user_usage_logs_created_at 
  ON public.user_usage_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_usage_logs_timestamp 
  ON public.user_usage_logs(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_user_usage_logs_action 
  ON public.user_usage_logs(action);

CREATE INDEX IF NOT EXISTS idx_user_usage_logs_feature 
  ON public.user_usage_logs(feature);

-- 复合索引：用户+时间查询优化
CREATE INDEX IF NOT EXISTS idx_user_usage_logs_user_created 
  ON public.user_usage_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_usage_logs_user_timestamp 
  ON public.user_usage_logs(user_id, timestamp DESC);

-- 3. 启用 RLS (Row Level Security)
ALTER TABLE public.user_usage_logs ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略

-- 用户可以查看自己的使用日志
CREATE POLICY "Users can view their own usage logs"
  ON public.user_usage_logs
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- 用户可以插入自己的使用日志
CREATE POLICY "Users can insert their own usage logs"
  ON public.user_usage_logs
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Service Role 可以查看所有日志（用于管理和统计）
CREATE POLICY "Service role can view all usage logs"
  ON public.user_usage_logs
  FOR SELECT
  USING (auth.jwt()->>'role' = 'service_role');

-- Service Role 可以插入所有日志
CREATE POLICY "Service role can insert all usage logs"
  ON public.user_usage_logs
  FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- 5. 添加表注释
COMMENT ON TABLE public.user_usage_logs IS '用户使用日志表，记录用户的功能使用情况和资源消耗';
COMMENT ON COLUMN public.user_usage_logs.user_id IS '用户ID';
COMMENT ON COLUMN public.user_usage_logs.action IS '操作类型';
COMMENT ON COLUMN public.user_usage_logs.feature IS '功能模块';
COMMENT ON COLUMN public.user_usage_logs.details IS '详细信息（JSON格式）';
COMMENT ON COLUMN public.user_usage_logs.tokens_used IS '使用的 Token 数量';
COMMENT ON COLUMN public.user_usage_logs.credits_used IS '使用的积分数量';
COMMENT ON COLUMN public.user_usage_logs.created_at IS '创建时间';
COMMENT ON COLUMN public.user_usage_logs.timestamp IS '时间戳（兼容字段）';
COMMENT ON COLUMN public.user_usage_logs.metadata IS '额外的元数据';

-- 6. 创建辅助函数：获取用户今日使用统计
CREATE OR REPLACE FUNCTION get_user_daily_usage_stats(p_user_id TEXT, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_actions BIGINT,
  total_tokens BIGINT,
  total_credits BIGINT,
  actions_by_feature JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_actions,
    COALESCE(SUM(tokens_used), 0)::BIGINT as total_tokens,
    COALESCE(SUM(credits_used), 0)::BIGINT as total_credits,
    jsonb_object_agg(
      COALESCE(feature, 'unknown'), 
      feature_count
    ) as actions_by_feature
  FROM (
    SELECT 
      feature,
      COUNT(*)::BIGINT as feature_count
    FROM public.user_usage_logs
    WHERE user_id = p_user_id
      AND DATE(created_at) = p_date
    GROUP BY feature
  ) feature_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 创建辅助函数：获取用户使用趋势
CREATE OR REPLACE FUNCTION get_user_usage_trend(
  p_user_id TEXT, 
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  date DATE,
  action_count BIGINT,
  token_count BIGINT,
  credit_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    COUNT(*)::BIGINT as action_count,
    COALESCE(SUM(tokens_used), 0)::BIGINT as token_count,
    COALESCE(SUM(credits_used), 0)::BIGINT as credit_count
  FROM public.user_usage_logs
  WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 创建自动清理旧日志的函数（可选）
CREATE OR REPLACE FUNCTION cleanup_old_usage_logs(p_days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.user_usage_logs
  WHERE created_at < CURRENT_DATE - (p_days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 验证表创建
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_usage_logs'
  ) THEN
    RAISE NOTICE '✅ user_usage_logs 表创建成功';
  ELSE
    RAISE EXCEPTION '❌ user_usage_logs 表创建失败';
  END IF;
END $$;


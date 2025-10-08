-- ============================================================================
-- 数据库清理和规范化 V2
-- 执行日期: 2025-10-08
-- 目的: 删除重复表、规范化字段名
-- 修复: 处理依赖视图的问题
-- ============================================================================

-- ============================================================================
-- Phase 0: 检查并列出所有依赖的视图
-- ============================================================================

DO $$
DECLARE
  view_record RECORD;
BEGIN
  RAISE NOTICE '================================================================================';
  RAISE NOTICE '检查依赖 timestamp 字段的视图';
  RAISE NOTICE '================================================================================';
  
  FOR view_record IN 
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public'
    AND table_name IN ('daily_token_usage', 'monthly_token_usage', 'feature_usage_stats')
  LOOP
    RAISE NOTICE '发现视图: %', view_record.table_name;
  END LOOP;
  
  RAISE NOTICE '================================================================================';
END $$;

-- ============================================================================
-- Phase 1: 删除空的重复表（安全操作）
-- ============================================================================

-- 1. 删除 user_usage_logs（与 token_usage_records 重复，且为空表）
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_usage_logs') THEN
    DECLARE
      record_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO record_count FROM user_usage_logs;
      
      IF record_count = 0 THEN
        DROP TABLE user_usage_logs CASCADE;
        RAISE NOTICE '✅ 已删除空表: user_usage_logs';
      ELSE
        RAISE NOTICE '⚠️  user_usage_logs 表不为空 (% 条记录)，跳过删除', record_count;
      END IF;
    END;
  ELSE
    RAISE NOTICE 'ℹ️  user_usage_logs 表不存在，跳过';
  END IF;
END $$;

-- 2. 删除 user_brand_library（与 user_brand_corpus 重复，且为空表）
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_brand_library') THEN
    DECLARE
      record_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO record_count FROM user_brand_library;
      
      IF record_count = 0 THEN
        DROP TABLE user_brand_library CASCADE;
        RAISE NOTICE '✅ 已删除空表: user_brand_library';
      ELSE
        RAISE NOTICE '⚠️  user_brand_library 表不为空 (% 条记录)，跳过删除', record_count;
      END IF;
    END;
  ELSE
    RAISE NOTICE 'ℹ️  user_brand_library 表不存在，跳过';
  END IF;
END $$;

-- ============================================================================
-- Phase 2: 更新依赖视图，使用 created_at 替代 timestamp
-- ============================================================================

-- 1. 重建 daily_token_usage 视图
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.views WHERE table_name = 'daily_token_usage') THEN
    DROP VIEW IF EXISTS daily_token_usage CASCADE;
    RAISE NOTICE '✅ 已删除旧的 daily_token_usage 视图';
  END IF;
  
  -- 重新创建视图，使用 created_at
  CREATE OR REPLACE VIEW daily_token_usage AS
  SELECT 
    user_id,
    DATE(created_at) as usage_date,
    SUM(total_tokens) as total_tokens,
    COUNT(*) as request_count
  FROM token_usage_records
  WHERE success = true
  GROUP BY user_id, DATE(created_at);
  
  RAISE NOTICE '✅ 已重建 daily_token_usage 视图（使用 created_at）';
END $$;

-- 2. 重建 monthly_token_usage 视图
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.views WHERE table_name = 'monthly_token_usage') THEN
    DROP VIEW IF EXISTS monthly_token_usage CASCADE;
    RAISE NOTICE '✅ 已删除旧的 monthly_token_usage 视图';
  END IF;
  
  -- 重新创建视图，使用 created_at
  CREATE OR REPLACE VIEW monthly_token_usage AS
  SELECT 
    user_id,
    DATE_TRUNC('month', created_at) as usage_month,
    SUM(total_tokens) as total_tokens,
    COUNT(*) as request_count
  FROM token_usage_records
  WHERE success = true
  GROUP BY user_id, DATE_TRUNC('month', created_at);
  
  RAISE NOTICE '✅ 已重建 monthly_token_usage 视图（使用 created_at）';
END $$;

-- 3. 重建 feature_usage_stats 视图
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.views WHERE table_name = 'feature_usage_stats') THEN
    DROP VIEW IF EXISTS feature_usage_stats CASCADE;
    RAISE NOTICE '✅ 已删除旧的 feature_usage_stats 视图';
  END IF;
  
  -- 重新创建视图，使用 created_at
  CREATE OR REPLACE VIEW feature_usage_stats AS
  SELECT 
    user_id,
    feature,
    COUNT(*) as usage_count,
    SUM(total_tokens) as total_tokens,
    AVG(total_tokens) as avg_tokens,
    MAX(created_at) as last_used_at
  FROM token_usage_records
  WHERE success = true
  GROUP BY user_id, feature;
  
  RAISE NOTICE '✅ 已重建 feature_usage_stats 视图（使用 created_at）';
END $$;

-- ============================================================================
-- Phase 3: 字段名规范化
-- ============================================================================

-- 1. token_usage_records: 删除重复的 timestamp 字段
DO $$
BEGIN
  -- 检查 timestamp 字段是否存在
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'token_usage_records' 
    AND column_name = 'timestamp'
  ) THEN
    -- 检查 created_at 字段是否存在
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'token_usage_records' 
      AND column_name = 'created_at'
    ) THEN
      -- 两个字段都存在，删除 timestamp（现在视图已更新，可以安全删除）
      ALTER TABLE token_usage_records DROP COLUMN timestamp CASCADE;
      RAISE NOTICE '✅ 已删除 token_usage_records.timestamp 字段（重复）';
    ELSE
      -- 只有 timestamp，重命名为 created_at
      ALTER TABLE token_usage_records RENAME COLUMN timestamp TO created_at;
      RAISE NOTICE '✅ 已重命名 token_usage_records.timestamp 为 created_at';
    END IF;
  ELSE
    RAISE NOTICE 'ℹ️  token_usage_records.timestamp 字段不存在，跳过';
  END IF;
END $$;

-- 2. usage_count_records: 添加 created_at 字段（保持与 used_at 并存）
DO $$
BEGIN
  -- 检查 created_at 字段是否存在
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'usage_count_records' 
    AND column_name = 'created_at'
  ) THEN
    -- 添加 created_at 字段
    ALTER TABLE usage_count_records 
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE;
    
    -- 从 used_at 复制数据
    UPDATE usage_count_records 
    SET created_at = used_at 
    WHERE created_at IS NULL;
    
    -- 设置为 NOT NULL 和默认值
    ALTER TABLE usage_count_records 
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN created_at SET DEFAULT NOW();
    
    RAISE NOTICE '✅ 已添加 usage_count_records.created_at 字段';
  ELSE
    RAISE NOTICE 'ℹ️  usage_count_records.created_at 字段已存在，跳过';
  END IF;
END $$;

-- ============================================================================
-- Phase 4: 验证清理结果
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '================================================================================';
  RAISE NOTICE '验证清理结果';
  RAISE NOTICE '================================================================================';
  
  -- 检查 user_usage_logs
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_usage_logs') THEN
    RAISE NOTICE '⚠️  user_usage_logs 表仍然存在';
  ELSE
    RAISE NOTICE '✅ user_usage_logs 表已删除';
  END IF;
  
  -- 检查 user_brand_library
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_brand_library') THEN
    RAISE NOTICE '⚠️  user_brand_library 表仍然存在';
  ELSE
    RAISE NOTICE '✅ user_brand_library 表已删除';
  END IF;
  
  -- 检查 token_usage_records.timestamp
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'token_usage_records' 
    AND column_name = 'timestamp'
  ) THEN
    RAISE NOTICE '⚠️  token_usage_records.timestamp 字段仍然存在';
  ELSE
    RAISE NOTICE '✅ token_usage_records.timestamp 字段已删除';
  END IF;
  
  -- 检查 usage_count_records.created_at
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'usage_count_records' 
    AND column_name = 'created_at'
  ) THEN
    RAISE NOTICE '✅ usage_count_records.created_at 字段已添加';
  ELSE
    RAISE NOTICE '⚠️  usage_count_records.created_at 字段不存在';
  END IF;
  
  -- 检查视图是否已重建
  IF EXISTS (SELECT FROM information_schema.views WHERE table_name = 'daily_token_usage') THEN
    RAISE NOTICE '✅ daily_token_usage 视图已重建';
  ELSE
    RAISE NOTICE '⚠️  daily_token_usage 视图不存在';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.views WHERE table_name = 'monthly_token_usage') THEN
    RAISE NOTICE '✅ monthly_token_usage 视图已重建';
  ELSE
    RAISE NOTICE '⚠️  monthly_token_usage 视图不存在';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.views WHERE table_name = 'feature_usage_stats') THEN
    RAISE NOTICE '✅ feature_usage_stats 视图已重建';
  ELSE
    RAISE NOTICE '⚠️  feature_usage_stats 视图不存在';
  END IF;
  
  RAISE NOTICE '================================================================================';
END $$;

-- ============================================================================
-- 完成
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ 数据库清理完成！';
  RAISE NOTICE '';
  RAISE NOTICE '已完成的操作:';
  RAISE NOTICE '1. 删除重复的空表';
  RAISE NOTICE '2. 重建依赖视图（使用 created_at）';
  RAISE NOTICE '3. 删除重复的 timestamp 字段';
  RAISE NOTICE '4. 添加标准的 created_at 字段';
END $$;


-- ============================================================================
-- 数据库清理和规范化
-- 执行日期: 2025-10-08
-- 目的: 删除重复表、规范化字段名
-- ============================================================================

-- ============================================================================
-- Phase 1: 删除空的重复表（安全操作）
-- ============================================================================

-- 1. 删除 user_usage_logs（与 token_usage_records 重复，且为空表）
DO $$
BEGIN
  -- 检查表是否存在且为空
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_usage_logs') THEN
    -- 检查记录数
    DECLARE
      record_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO record_count FROM user_usage_logs;
      
      IF record_count = 0 THEN
        DROP TABLE user_usage_logs;
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
        DROP TABLE user_brand_library;
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
-- Phase 2: 字段名规范化
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
      -- 两个字段都存在，删除 timestamp
      ALTER TABLE token_usage_records DROP COLUMN timestamp;
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
-- Phase 3: 验证清理结果
-- ============================================================================

-- 验证表是否已删除
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
  
  RAISE NOTICE '================================================================================';
END $$;

-- ============================================================================
-- 完成
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ 数据库清理完成！';
END $$;

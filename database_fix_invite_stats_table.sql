-- ============================================
-- 修复邀请统计表结构
-- ============================================
-- 目的：安全地添加缺失的字段，不会报错
-- ============================================

-- 1. 查看当前表结构
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_invite_stats'
ORDER BY ordinal_position;

-- 2. 安全地添加缺失的字段
DO $$
BEGIN
  -- 添加 pending_invites 字段（如果不存在）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'user_invite_stats' 
    AND column_name = 'pending_invites'
  ) THEN
    ALTER TABLE user_invite_stats ADD COLUMN pending_invites INT DEFAULT 0;
    RAISE NOTICE '✅ 已添加 pending_invites 字段';
  ELSE
    RAISE NOTICE 'ℹ️  pending_invites 字段已存在';
  END IF;

  -- 添加 total_usage_count_rewards 字段（如果不存在）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'user_invite_stats' 
    AND column_name = 'total_usage_count_rewards'
  ) THEN
    ALTER TABLE user_invite_stats ADD COLUMN total_usage_count_rewards INT DEFAULT 0;
    RAISE NOTICE '✅ 已添加 total_usage_count_rewards 字段';
  ELSE
    RAISE NOTICE 'ℹ️  total_usage_count_rewards 字段已存在';
  END IF;

  -- 添加 total_token_rewards 字段（如果不存在）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'user_invite_stats' 
    AND column_name = 'total_token_rewards'
  ) THEN
    ALTER TABLE user_invite_stats ADD COLUMN total_token_rewards BIGINT DEFAULT 0;
    RAISE NOTICE '✅ 已添加 total_token_rewards 字段';
  ELSE
    RAISE NOTICE 'ℹ️  total_token_rewards 字段已存在';
  END IF;

  -- 添加 total_member_days_rewards 字段（如果不存在）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'user_invite_stats' 
    AND column_name = 'total_member_days_rewards'
  ) THEN
    ALTER TABLE user_invite_stats ADD COLUMN total_member_days_rewards INT DEFAULT 0;
    RAISE NOTICE '✅ 已添加 total_member_days_rewards 字段';
  ELSE
    RAISE NOTICE 'ℹ️  total_member_days_rewards 字段已存在';
  END IF;
END $$;

-- 3. 添加字段注释
COMMENT ON COLUMN user_invite_stats.pending_invites IS '待处理邀请数';
COMMENT ON COLUMN user_invite_stats.total_usage_count_rewards IS '总使用次数奖励';
COMMENT ON COLUMN user_invite_stats.total_token_rewards IS '总Token奖励';
COMMENT ON COLUMN user_invite_stats.total_member_days_rewards IS '总会员天数奖励';

-- 4. 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_user_invite_stats_successful_invites 
ON user_invite_stats(successful_invites DESC);

CREATE INDEX IF NOT EXISTS idx_user_invite_stats_updated_at 
ON user_invite_stats(updated_at DESC);

-- 5. 创建或更新触发器
CREATE OR REPLACE FUNCTION update_user_invite_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_invite_stats_updated_at ON user_invite_stats;

CREATE TRIGGER trigger_update_user_invite_stats_updated_at
BEFORE UPDATE ON user_invite_stats
FOR EACH ROW
EXECUTE FUNCTION update_user_invite_stats_updated_at();

-- 6. 迁移现有数据
DO $$
DECLARE
  record_count INT;
  updated_count INT := 0;
BEGIN
  -- 检查是否有数据
  SELECT COUNT(*) INTO record_count FROM user_invite_stats;
  
  IF record_count > 0 THEN
    RAISE NOTICE 'ℹ️  开始迁移 % 条现有数据...', record_count;
    
    -- 从 invite_rewards 表重新计算分类奖励
    UPDATE user_invite_stats us
    SET 
      total_usage_count_rewards = (
        SELECT COALESCE(SUM(reward_amount), 0)
        FROM invite_rewards
        WHERE user_id = us.user_id
        AND reward_type = 'usage_count'
        AND status = 'granted'
      ),
      total_token_rewards = (
        SELECT COALESCE(SUM(reward_amount), 0)
        FROM invite_rewards
        WHERE user_id = us.user_id
        AND reward_type = 'token_bonus'
        AND status = 'granted'
      ),
      total_member_days_rewards = (
        SELECT COALESCE(SUM(reward_amount), 0)
        FROM invite_rewards
        WHERE user_id = us.user_id
        AND reward_type = 'member_days'
        AND status = 'granted'
      ),
      pending_invites = COALESCE(
        (
          SELECT COUNT(*)
          FROM user_invite_relations
          WHERE inviter_id = us.user_id
          AND status = 'pending'
        ), 
        0
      );
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✅ 已更新 % 条数据', updated_count;
  ELSE
    RAISE NOTICE 'ℹ️  表中没有数据，跳过迁移';
  END IF;
END $$;

-- 7. 验证更新后的表结构
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_invite_stats'
ORDER BY ordinal_position;

-- 8. 查看示例数据（如果有）
SELECT 
  user_id,
  total_invites,
  successful_invites,
  pending_invites,
  total_usage_count_rewards,
  total_token_rewards,
  total_member_days_rewards,
  updated_at
FROM user_invite_stats
ORDER BY successful_invites DESC
LIMIT 5;

-- ============================================
-- 完成提示
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ 邀请统计表结构修复完成！';
  RAISE NOTICE '';
  RAISE NOTICE '📊 表结构已更新：';
  RAISE NOTICE '  ✅ pending_invites（待处理邀请数）';
  RAISE NOTICE '  ✅ total_usage_count_rewards（总使用次数奖励）';
  RAISE NOTICE '  ✅ total_token_rewards（总Token奖励）';
  RAISE NOTICE '  ✅ total_member_days_rewards（总会员天数奖励）';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 索引和触发器已创建';
  RAISE NOTICE '📈 现有数据已迁移';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 可以开始使用优化后的邀请统计功能了！';
END $$;


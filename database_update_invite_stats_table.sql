-- ============================================
-- 更新邀请统计表结构
-- ============================================
-- 目的：将 total_rewards 拆分为三个字段，分类统计不同类型的奖励
-- ============================================

-- 1. 检查表是否存在
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_invite_stats') THEN
    RAISE EXCEPTION '❌ user_invite_stats 表不存在，请先创建该表';
  END IF;
END $$;

-- 2. 添加新字段（如果不存在）
ALTER TABLE user_invite_stats 
ADD COLUMN IF NOT EXISTS total_usage_count_rewards INT DEFAULT 0;

ALTER TABLE user_invite_stats 
ADD COLUMN IF NOT EXISTS total_token_rewards BIGINT DEFAULT 0;

ALTER TABLE user_invite_stats 
ADD COLUMN IF NOT EXISTS total_member_days_rewards INT DEFAULT 0;

-- 3. 添加字段注释
COMMENT ON COLUMN user_invite_stats.total_usage_count_rewards IS '总使用次数奖励';
COMMENT ON COLUMN user_invite_stats.total_token_rewards IS '总Token奖励';
COMMENT ON COLUMN user_invite_stats.total_member_days_rewards IS '总会员天数奖励';

-- 4. 迁移现有数据（如果 total_rewards 字段存在）
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'user_invite_stats' 
    AND column_name = 'total_rewards'
  ) THEN
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
      );
    
    RAISE NOTICE '✅ 已迁移现有数据';
    
    -- 可选：删除旧字段（谨慎操作）
    -- ALTER TABLE user_invite_stats DROP COLUMN IF EXISTS total_rewards;
    -- RAISE NOTICE '⚠️  已删除 total_rewards 字段';
  ELSE
    RAISE NOTICE 'ℹ️  total_rewards 字段不存在，跳过数据迁移';
  END IF;
END $$;

-- 5. 验证更新
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_invite_stats'
AND column_name IN (
  'total_usage_count_rewards',
  'total_token_rewards',
  'total_member_days_rewards'
)
ORDER BY ordinal_position;

-- 6. 查看示例数据
SELECT 
  user_id,
  successful_invites,
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
  RAISE NOTICE '✅ 邀请统计表结构更新完成！';
  RAISE NOTICE '📊 新增字段：';
  RAISE NOTICE '  - total_usage_count_rewards（总使用次数奖励）';
  RAISE NOTICE '  - total_token_rewards（总Token奖励）';
  RAISE NOTICE '  - total_member_days_rewards（总会员天数奖励）';
  RAISE NOTICE '🔧 现有数据已迁移';
END $$;


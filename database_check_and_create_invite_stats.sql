-- ============================================
-- 检查并创建邀请统计表
-- ============================================
-- 目的：确保 user_invite_stats 表存在，然后更新结构
-- ============================================

-- 1. 检查表是否存在
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'user_invite_stats'
    ) 
    THEN '✅ user_invite_stats 表已存在'
    ELSE '⚠️  user_invite_stats 表不存在，需要创建'
  END as status;

-- 2. 如果表不存在，创建它
CREATE TABLE IF NOT EXISTS user_invite_stats (
  -- 主键
  user_id TEXT PRIMARY KEY,
  
  -- 邀请统计
  total_invites INT DEFAULT 0,
  successful_invites INT DEFAULT 0,
  pending_invites INT DEFAULT 0,
  
  -- 奖励统计（旧字段，兼容）
  total_rewards INT DEFAULT 0,
  
  -- 分类奖励统计（新字段）
  total_usage_count_rewards INT DEFAULT 0,
  total_token_rewards BIGINT DEFAULT 0,
  total_member_days_rewards INT DEFAULT 0,
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 添加表注释
COMMENT ON TABLE user_invite_stats IS '用户邀请统计表';
COMMENT ON COLUMN user_invite_stats.user_id IS '用户ID（MongoDB ObjectId格式）';
COMMENT ON COLUMN user_invite_stats.total_invites IS '总邀请数';
COMMENT ON COLUMN user_invite_stats.successful_invites IS '成功邀请数';
COMMENT ON COLUMN user_invite_stats.pending_invites IS '待处理邀请数';
COMMENT ON COLUMN user_invite_stats.total_usage_count_rewards IS '总使用次数奖励';
COMMENT ON COLUMN user_invite_stats.total_token_rewards IS '总Token奖励';
COMMENT ON COLUMN user_invite_stats.total_member_days_rewards IS '总会员天数奖励';

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_invite_stats_successful_invites 
ON user_invite_stats(successful_invites DESC);

CREATE INDEX IF NOT EXISTS idx_user_invite_stats_updated_at 
ON user_invite_stats(updated_at DESC);

-- 5. 创建更新时间触发器
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

-- 6. 如果有现有数据，迁移到新字段
DO $$
DECLARE
  record_count INT;
BEGIN
  -- 检查是否有数据
  SELECT COUNT(*) INTO record_count FROM user_invite_stats;
  
  IF record_count > 0 THEN
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
    
    RAISE NOTICE '✅ 已迁移 % 条现有数据', record_count;
  ELSE
    RAISE NOTICE 'ℹ️  表中没有数据，跳过迁移';
  END IF;
END $$;

-- 7. 验证表结构
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
  RAISE NOTICE '✅ 邀请统计表检查和更新完成！';
  RAISE NOTICE '📊 表结构：';
  RAISE NOTICE '  - total_invites（总邀请数）';
  RAISE NOTICE '  - successful_invites（成功邀请数）';
  RAISE NOTICE '  - pending_invites（待处理邀请数）';
  RAISE NOTICE '  - total_usage_count_rewards（总使用次数奖励）';
  RAISE NOTICE '  - total_token_rewards（总Token奖励）';
  RAISE NOTICE '  - total_member_days_rewards（总会员天数奖励）';
  RAISE NOTICE '🔧 索引和触发器已创建';
  RAISE NOTICE '📈 现有数据已迁移（如果有）';
END $$;


-- ============================================
-- 邀请奖励记录表创建脚本
-- 目的：记录所有邀请奖励的发放历史
-- 执行方式：在Supabase SQL编辑器中执行
-- 预期执行时间：30秒
-- ============================================

-- 1. 创建邀请奖励记录表
CREATE TABLE IF NOT EXISTS invite_rewards (
  -- 主键
  id VARCHAR(100) PRIMARY KEY,

  -- 用户信息（使用TEXT类型存储UUID字符串）
  user_id TEXT NOT NULL,

  -- 奖励信息
  reward_type VARCHAR(50) NOT NULL,  -- 'usage_count', 'token_bonus', 'member_days'
  reward_amount INT NOT NULL,        -- 奖励数量

  -- 来源信息
  source_type VARCHAR(50) NOT NULL,  -- 'inviter', 'invitee', 'system'
  related_invite_id VARCHAR(100),    -- 关联的邀请关系ID
  related_user_id TEXT,              -- 关联的用户ID（邀请人或被邀请人）

  -- 状态信息
  status VARCHAR(20) DEFAULT 'granted',  -- 'granted', 'expired', 'revoked'

  -- 过期信息
  expires_at TIMESTAMP,              -- 过期时间（NULL表示永不过期）

  -- 元数据
  metadata JSONB,                    -- 额外的元数据

  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

  -- 注意：不使用外键约束，因为user_id可能来自不同的认证系统
  -- 应用层负责确保user_id的有效性
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_invite_rewards_user_id 
ON invite_rewards(user_id);

CREATE INDEX IF NOT EXISTS idx_invite_rewards_user_id_status 
ON invite_rewards(user_id, status);

CREATE INDEX IF NOT EXISTS idx_invite_rewards_created_at 
ON invite_rewards(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invite_rewards_related_invite_id 
ON invite_rewards(related_invite_id);

CREATE INDEX IF NOT EXISTS idx_invite_rewards_reward_type 
ON invite_rewards(reward_type);

CREATE INDEX IF NOT EXISTS idx_invite_rewards_expires_at 
ON invite_rewards(expires_at) WHERE expires_at IS NOT NULL;

-- 3. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_invite_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invite_rewards_updated_at
BEFORE UPDATE ON invite_rewards
FOR EACH ROW
EXECUTE FUNCTION update_invite_rewards_updated_at();

-- 4. 添加表注释
COMMENT ON TABLE invite_rewards IS '邀请奖励记录表';
COMMENT ON COLUMN invite_rewards.id IS '奖励记录ID';
COMMENT ON COLUMN invite_rewards.user_id IS '获得奖励的用户ID';
COMMENT ON COLUMN invite_rewards.reward_type IS '奖励类型：usage_count=使用次数, token_bonus=Token奖励, member_days=会员天数';
COMMENT ON COLUMN invite_rewards.reward_amount IS '奖励数量';
COMMENT ON COLUMN invite_rewards.source_type IS '奖励来源：inviter=邀请人, invitee=被邀请人, system=系统赠送';
COMMENT ON COLUMN invite_rewards.related_invite_id IS '关联的邀请关系ID';
COMMENT ON COLUMN invite_rewards.related_user_id IS '关联的用户ID';
COMMENT ON COLUMN invite_rewards.status IS '奖励状态：granted=已发放, expired=已过期, revoked=已撤销';
COMMENT ON COLUMN invite_rewards.expires_at IS '过期时间';
COMMENT ON COLUMN invite_rewards.metadata IS '额外的元数据（JSON格式）';

-- 5. 创建用户使用次数余额表
CREATE TABLE IF NOT EXISTS user_usage_balance (
  -- 主键（使用TEXT类型存储UUID字符串）
  user_id TEXT PRIMARY KEY,

  -- 使用次数余额
  total_count INT DEFAULT 0,         -- 总使用次数
  used_count INT DEFAULT 0,          -- 已使用次数
  remaining_count INT DEFAULT 0,     -- 剩余使用次数

  -- 来源统计
  base_count INT DEFAULT 0,          -- 套餐基础次数
  bonus_count INT DEFAULT 0,         -- 奖励次数

  -- 重置信息
  last_reset_at TIMESTAMP,           -- 上次重置时间
  reset_period VARCHAR(20) DEFAULT 'monthly',  -- 重置周期：monthly, daily, never

  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

  -- 注意：不使用外键约束，因为user_id可能来自不同的认证系统
  -- 应用层负责确保user_id的有效性
);

-- 6. 创建用户使用次数余额索引
CREATE INDEX IF NOT EXISTS idx_user_usage_balance_remaining_count 
ON user_usage_balance(remaining_count);

CREATE INDEX IF NOT EXISTS idx_user_usage_balance_last_reset_at 
ON user_usage_balance(last_reset_at);

-- 7. 创建用户使用次数余额更新触发器
CREATE OR REPLACE FUNCTION update_user_usage_balance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_usage_balance_updated_at
BEFORE UPDATE ON user_usage_balance
FOR EACH ROW
EXECUTE FUNCTION update_user_usage_balance_updated_at();

-- 8. 添加用户使用次数余额表注释
COMMENT ON TABLE user_usage_balance IS '用户使用次数余额表';
COMMENT ON COLUMN user_usage_balance.user_id IS '用户ID';
COMMENT ON COLUMN user_usage_balance.total_count IS '总使用次数';
COMMENT ON COLUMN user_usage_balance.used_count IS '已使用次数';
COMMENT ON COLUMN user_usage_balance.remaining_count IS '剩余使用次数';
COMMENT ON COLUMN user_usage_balance.base_count IS '套餐基础次数';
COMMENT ON COLUMN user_usage_balance.bonus_count IS '奖励次数';
COMMENT ON COLUMN user_usage_balance.last_reset_at IS '上次重置时间';
COMMENT ON COLUMN user_usage_balance.reset_period IS '重置周期';

-- 9. 启用行级安全策略（RLS）
ALTER TABLE invite_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage_balance ENABLE ROW LEVEL SECURITY;

-- 10. 创建RLS策略 - 用户只能查看自己的奖励记录
CREATE POLICY "Users can view their own rewards"
ON invite_rewards FOR SELECT
USING (user_id = auth.uid()::text);

-- 11. 创建RLS策略 - 用户只能查看自己的使用次数余额
CREATE POLICY "Users can view their own usage balance"
ON user_usage_balance FOR SELECT
USING (user_id = auth.uid()::text);

-- 12. 创建RLS策略 - 服务角色可以操作所有数据
CREATE POLICY "Service role can manage all rewards"
ON invite_rewards FOR ALL
USING (true);

CREATE POLICY "Service role can manage all usage balance"
ON user_usage_balance FOR ALL
USING (true);

-- ============================================================================
-- 分析表统计信息
-- ============================================================================

ANALYZE invite_rewards;
ANALYZE user_usage_balance;

-- ============================================================================
-- 完成提示
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 邀请奖励记录表创建完成！';
    RAISE NOTICE '📊 已创建以下表：';
    RAISE NOTICE '  - invite_rewards (邀请奖励记录表)';
    RAISE NOTICE '  - user_usage_balance (用户使用次数余额表)';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 已启用行级安全策略（RLS）';
    RAISE NOTICE '📝 已创建索引和触发器';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 下一步：创建邀请奖励发放服务';
END $$;


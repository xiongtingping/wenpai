-- ============================================
-- 邀请奖励系统数据库表创建脚本（无RLS版本）
-- ============================================
-- 适用于：使用 service_role key 访问 Supabase 的应用
-- 认证系统：Authing SDK
-- user_id 格式：MongoDB ObjectId（24字符十六进制）
-- ============================================

-- 1. 创建邀请奖励记录表
CREATE TABLE IF NOT EXISTS invite_rewards (
  -- 主键
  id VARCHAR(100) PRIMARY KEY,
  
  -- 用户信息（MongoDB ObjectId 格式）
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
);

COMMENT ON TABLE invite_rewards IS '邀请奖励记录表';
COMMENT ON COLUMN invite_rewards.user_id IS '用户ID（MongoDB ObjectId格式）';
COMMENT ON COLUMN invite_rewards.reward_type IS '奖励类型：usage_count=使用次数, token_bonus=Token奖励, member_days=会员天数';
COMMENT ON COLUMN invite_rewards.source_type IS '奖励来源：inviter=邀请人, invitee=被邀请人, system=系统赠送';

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_invite_rewards_user_id 
ON invite_rewards(user_id);

CREATE INDEX IF NOT EXISTS idx_invite_rewards_related_user_id 
ON invite_rewards(related_user_id);

CREATE INDEX IF NOT EXISTS idx_invite_rewards_user_id_status 
ON invite_rewards(user_id, status);

CREATE INDEX IF NOT EXISTS idx_invite_rewards_created_at 
ON invite_rewards(created_at DESC);

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

-- ============================================
-- 4. 创建用户使用次数余额表
-- ============================================

CREATE TABLE IF NOT EXISTS user_usage_balance (
  -- 主键（MongoDB ObjectId 格式）
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
);

COMMENT ON TABLE user_usage_balance IS '用户使用次数余额表';
COMMENT ON COLUMN user_usage_balance.user_id IS '用户ID（MongoDB ObjectId格式）';
COMMENT ON COLUMN user_usage_balance.total_count IS '总使用次数 = base_count + bonus_count';
COMMENT ON COLUMN user_usage_balance.remaining_count IS '剩余使用次数 = total_count - used_count';

-- 5. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_usage_balance_last_reset_at 
ON user_usage_balance(last_reset_at);

-- 6. 创建更新时间触发器
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

-- 7. 创建自动计算剩余次数的触发器
CREATE OR REPLACE FUNCTION calculate_remaining_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_count = NEW.base_count + NEW.bonus_count;
  NEW.remaining_count = NEW.total_count - NEW.used_count;
  
  -- 确保剩余次数不为负数
  IF NEW.remaining_count < 0 THEN
    NEW.remaining_count = 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_remaining_count
BEFORE INSERT OR UPDATE ON user_usage_balance
FOR EACH ROW
EXECUTE FUNCTION calculate_remaining_count();

-- ============================================
-- 完成提示
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ 邀请奖励系统表创建完成！';
  RAISE NOTICE '📊 已创建表：';
  RAISE NOTICE '  - invite_rewards（邀请奖励记录表）';
  RAISE NOTICE '  - user_usage_balance（用户使用次数余额表）';
  RAISE NOTICE '🔧 已创建索引和触发器';
  RAISE NOTICE '⚠️  注意：此版本不包含RLS策略，适用于service_role访问';
END $$;


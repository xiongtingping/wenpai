-- ============================================
-- 邀请码表创建脚本（无RLS版本）
-- ============================================
-- 适用于：使用 service_role key 访问 Supabase 的应用
-- 认证系统：Authing SDK
-- user_id 格式：MongoDB ObjectId（24字符十六进制）
-- ============================================

-- 1. 创建邀请码表
CREATE TABLE IF NOT EXISTS user_invite_codes (
  -- 主键
  code VARCHAR(20) PRIMARY KEY,
  
  -- 邀请人信息（MongoDB ObjectId 格式）
  inviter_id TEXT NOT NULL,
  
  -- 使用统计
  used_count INT DEFAULT 0,
  max_uses INT DEFAULT 0,  -- 0表示无限制
  
  -- 过期信息
  expires_at TIMESTAMP,    -- NULL表示永不过期
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE user_invite_codes IS '用户邀请码表';
COMMENT ON COLUMN user_invite_codes.code IS '邀请码（唯一）';
COMMENT ON COLUMN user_invite_codes.inviter_id IS '邀请人ID（MongoDB ObjectId格式）';
COMMENT ON COLUMN user_invite_codes.max_uses IS '最大使用次数（0=无限制）';

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_invite_codes_inviter_id 
ON user_invite_codes(inviter_id);

CREATE INDEX IF NOT EXISTS idx_user_invite_codes_created_at 
ON user_invite_codes(created_at DESC);

-- 3. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_user_invite_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_invite_codes_updated_at
BEFORE UPDATE ON user_invite_codes
FOR EACH ROW
EXECUTE FUNCTION update_user_invite_codes_updated_at();

-- 4. 创建RPC函数：增加邀请码使用次数
CREATE OR REPLACE FUNCTION increment_invite_code_usage(invite_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_used_count INT;
  current_max_uses INT;
BEGIN
  -- 获取当前使用次数和最大使用次数
  SELECT used_count, max_uses 
  INTO current_used_count, current_max_uses
  FROM user_invite_codes
  WHERE code = invite_code;

  -- 如果邀请码不存在
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- 如果已达到最大使用次数（max_uses > 0 表示有限制）
  IF current_max_uses > 0 AND current_used_count >= current_max_uses THEN
    RETURN FALSE;
  END IF;

  -- 增加使用次数
  UPDATE user_invite_codes
  SET used_count = used_count + 1
  WHERE code = invite_code;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_invite_code_usage IS '增加邀请码使用次数（原子操作）';

-- ============================================
-- 完成提示
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ 邀请码表创建完成！';
  RAISE NOTICE '📊 已创建表：user_invite_codes';
  RAISE NOTICE '🔧 已创建索引、触发器和RPC函数';
  RAISE NOTICE '⚠️  注意：此版本不包含RLS策略，适用于service_role访问';
END $$;


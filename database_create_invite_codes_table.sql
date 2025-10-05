-- ============================================
-- 邀请码表创建脚本
-- 目的：存储用户生成的邀请码和邀请链接
-- 执行方式：在Supabase SQL编辑器中执行
-- 预期执行时间：30秒
-- ============================================

-- 1. 创建邀请码表
CREATE TABLE IF NOT EXISTS user_invite_codes (
  -- 主键
  code VARCHAR(20) PRIMARY KEY,

  -- 邀请人信息（使用TEXT类型存储UUID字符串）
  inviter_id TEXT NOT NULL,

  -- 使用统计
  used_count INT DEFAULT 0,
  max_uses INT DEFAULT 0,  -- 0表示无限制

  -- 过期信息
  expires_at TIMESTAMP,    -- NULL表示永不过期

  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

  -- 注意：不使用外键约束，因为inviter_id可能来自不同的认证系统
  -- 应用层负责确保inviter_id的有效性
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_invite_codes_inviter_id 
ON user_invite_codes(inviter_id);

CREATE INDEX IF NOT EXISTS idx_user_invite_codes_created_at 
ON user_invite_codes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_invite_codes_expires_at 
ON user_invite_codes(expires_at) WHERE expires_at IS NOT NULL;

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

-- 4. 创建增加使用次数的RPC函数
CREATE OR REPLACE FUNCTION increment_invite_code_usage(p_code VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE user_invite_codes
  SET used_count = used_count + 1
  WHERE code = p_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 添加表注释
COMMENT ON TABLE user_invite_codes IS '用户邀请码表';
COMMENT ON COLUMN user_invite_codes.code IS '邀请码（唯一）';
COMMENT ON COLUMN user_invite_codes.inviter_id IS '邀请人用户ID';
COMMENT ON COLUMN user_invite_codes.used_count IS '已使用次数';
COMMENT ON COLUMN user_invite_codes.max_uses IS '最大使用次数（0表示无限制）';
COMMENT ON COLUMN user_invite_codes.expires_at IS '过期时间（NULL表示永不过期）';

-- 6. 启用行级安全策略（RLS）
ALTER TABLE user_invite_codes ENABLE ROW LEVEL SECURITY;

-- 7. 创建RLS策略 - 用户可以查看自己创建的邀请码
CREATE POLICY "Users can view their own invite codes"
ON user_invite_codes FOR SELECT
USING (inviter_id = auth.uid()::text);

-- 8. 创建RLS策略 - 用户可以创建自己的邀请码
CREATE POLICY "Users can create their own invite codes"
ON user_invite_codes FOR INSERT
WITH CHECK (inviter_id = auth.uid()::text);

-- 9. 创建RLS策略 - 所有人可以查询邀请码（用于验证）
CREATE POLICY "Anyone can validate invite codes"
ON user_invite_codes FOR SELECT
USING (true);

-- 10. 创建RLS策略 - 服务角色可以操作所有数据
CREATE POLICY "Service role can manage all invite codes"
ON user_invite_codes FOR ALL
USING (true);

-- ============================================================================
-- 分析表统计信息
-- ============================================================================

ANALYZE user_invite_codes;

-- ============================================================================
-- 完成提示
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 邀请码表创建完成！';
    RAISE NOTICE '📊 已创建表：user_invite_codes';
    RAISE NOTICE '🔒 已启用行级安全策略（RLS）';
    RAISE NOTICE '📝 已创建索引、触发器和RPC函数';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 下一步：在应用中使用InviteLinkService生成邀请链接';
END $$;


-- 简化版user_preferences表创建脚本
-- 只包含核心字段，避免字段引用错误

-- 1. 创建基础表结构
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  key VARCHAR(255) NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_key UNIQUE(user_id, key)
);

-- 2. 创建基础索引
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(key);

-- 3. 启用Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 4. 创建RLS策略 (简化版本，适用于所有操作)
DROP POLICY IF EXISTS "Users can access own preferences" ON user_preferences;
CREATE POLICY "Users can access own preferences" ON user_preferences
  USING (user_id::text = auth.uid()::text)
  WITH CHECK (user_id::text = auth.uid()::text);

-- 5. 授权给authenticated用户
GRANT ALL ON user_preferences TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
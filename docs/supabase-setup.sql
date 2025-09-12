-- 创建user_preferences表的SQL脚本
-- 请在Supabase SQL编辑器中执行此脚本

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  key VARCHAR(255) NOT NULL,
  value TEXT,
  data_category VARCHAR(50) DEFAULT 'preference',
  sync_priority INTEGER DEFAULT 5,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_key UNIQUE(user_id, key)
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(key);
CREATE INDEX IF NOT EXISTS idx_user_preferences_category ON user_preferences(data_category);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为表添加自动更新时间戳触发器
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 启用Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：用户只能访问自己的偏好设置
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own preferences" ON user_preferences
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- 插入一些示例数据（可选）
-- INSERT INTO user_preferences (user_id, key, value, data_category) VALUES 
--   ('example_user', 'theme_mode', 'dark', 'theme'),
--   ('example_user', 'theme_color', 'blue', 'theme');

-- 授权给authenticated用户
GRANT ALL ON user_preferences TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
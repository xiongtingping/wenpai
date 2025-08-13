-- ==========================================
-- Wenpai 统一存储系统数据库初始化脚本
-- 创建时间: 2025-08-13
-- 版本: v1.0.0
-- 描述: 创建用户数据隔离和云端同步所需的数据表
-- ==========================================

-- 创建用户资料表（扩展Supabase auth.users）
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname VARCHAR(50),
  avatar_url TEXT,
  tier VARCHAR(20) DEFAULT 'trial' CHECK (tier IN ('trial', 'basic', 'pro', 'premium')),
  permissions JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加用户资料表注释
COMMENT ON TABLE public.user_profiles IS '用户资料表 - 扩展Supabase认证用户信息';
COMMENT ON COLUMN public.user_profiles.id IS '用户ID - 关联auth.users表';
COMMENT ON COLUMN public.user_profiles.nickname IS '用户昵称';
COMMENT ON COLUMN public.user_profiles.avatar_url IS '头像URL';
COMMENT ON COLUMN public.user_profiles.tier IS '用户等级: trial, basic, pro, premium';
COMMENT ON COLUMN public.user_profiles.permissions IS '用户权限列表 (JSON数组)';
COMMENT ON COLUMN public.user_profiles.settings IS '用户设置 (JSON对象)';

-- 创建品牌资产表
CREATE TABLE IF NOT EXISTS public.brand_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('logo', 'color', 'font', 'image', 'document', 'other')),
  content JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建使用统计表
CREATE TABLE IF NOT EXISTS public.usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature VARCHAR(100) NOT NULL,
  tokens_used INTEGER DEFAULT 0 CHECK (tokens_used >= 0),
  usage_count INTEGER DEFAULT 1 CHECK (usage_count >= 0),
  date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户偏好表
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_brand_assets_user_id ON public.brand_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_type ON public.brand_assets(type);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON public.usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_feature ON public.usage_stats(feature);
CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON public.usage_stats(date);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON public.user_preferences(key);

-- 启用行级安全策略 (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 用户资料表的RLS策略
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 品牌资产表的RLS策略
CREATE POLICY "Users can manage own brand assets" ON public.brand_assets
  FOR ALL USING (auth.uid() = user_id);

-- 使用统计表的RLS策略
CREATE POLICY "Users can view own usage stats" ON public.usage_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage stats" ON public.usage_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- 用户偏好表的RLS策略
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- 创建触发器自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_assets_updated_at 
  BEFORE UPDATE ON public.brand_assets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 插入初始化数据和配置
-- ==========================================

-- 创建默认用户等级配置函数
CREATE OR REPLACE FUNCTION get_user_tier_limits(user_tier TEXT)
RETURNS JSONB AS $$
BEGIN
  CASE user_tier
    WHEN 'trial' THEN
      RETURN '{"daily_tokens": 1000, "monthly_tokens": 10000, "features": ["basic_adapt", "emoji_generator"]}'::jsonb;
    WHEN 'basic' THEN
      RETURN '{"daily_tokens": 5000, "monthly_tokens": 50000, "features": ["basic_adapt", "emoji_generator", "hot_topics"]}'::jsonb;
    WHEN 'pro' THEN
      RETURN '{"daily_tokens": 20000, "monthly_tokens": 200000, "features": ["all_features"]}'::jsonb;
    WHEN 'premium' THEN
      RETURN '{"daily_tokens": -1, "monthly_tokens": -1, "features": ["all_features", "priority_support"]}'::jsonb;
    ELSE
      RETURN '{"daily_tokens": 1000, "monthly_tokens": 10000, "features": ["basic_adapt"]}'::jsonb;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- 创建用户资料自动初始化触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nickname, avatar_url, tier, permissions, settings)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    'trial',
    '[]'::jsonb,
    '{
      "theme": "system",
      "language": "zh-CN",
      "notifications": {
        "email": true,
        "push": true
      },
      "privacy": {
        "profile_public": false,
        "usage_analytics": true
      }
    }'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：新用户注册时自动创建资料
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==========================================
-- 数据完整性和安全检查
-- ==========================================

-- 创建数据完整性检查函数
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE(table_name TEXT, issue_count BIGINT, issue_description TEXT) AS $$
BEGIN
  -- 检查孤立的品牌资产
  RETURN QUERY
  SELECT
    'brand_assets'::TEXT,
    COUNT(*)::BIGINT,
    'Orphaned brand assets (user not exists)'::TEXT
  FROM public.brand_assets ba
  LEFT JOIN auth.users u ON ba.user_id = u.id
  WHERE u.id IS NULL;

  -- 检查孤立的使用统计
  RETURN QUERY
  SELECT
    'usage_stats'::TEXT,
    COUNT(*)::BIGINT,
    'Orphaned usage stats (user not exists)'::TEXT
  FROM public.usage_stats us
  LEFT JOIN auth.users u ON us.user_id = u.id
  WHERE u.id IS NULL;

  -- 检查孤立的用户偏好
  RETURN QUERY
  SELECT
    'user_preferences'::TEXT,
    COUNT(*)::BIGINT,
    'Orphaned user preferences (user not exists)'::TEXT
  FROM public.user_preferences up
  LEFT JOIN auth.users u ON up.user_id = u.id
  WHERE u.id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 完成初始化
-- ==========================================

-- 显示初始化完成信息
DO $$
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Wenpai统一存储系统数据库初始化完成！';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '已创建表:';
  RAISE NOTICE '  ✅ user_profiles - 用户资料表';
  RAISE NOTICE '  ✅ brand_assets - 品牌资产表';
  RAISE NOTICE '  ✅ usage_stats - 使用统计表';
  RAISE NOTICE '  ✅ user_preferences - 用户偏好表';
  RAISE NOTICE '';
  RAISE NOTICE '已配置功能:';
  RAISE NOTICE '  ✅ 行级安全策略 (RLS)';
  RAISE NOTICE '  ✅ 自动更新时间戳';
  RAISE NOTICE '  ✅ 新用户自动初始化';
  RAISE NOTICE '  ✅ 数据完整性检查';
  RAISE NOTICE '';
  RAISE NOTICE '下一步: 在应用中测试连接和功能';
  RAISE NOTICE '==========================================';
END $$;

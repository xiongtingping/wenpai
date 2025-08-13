-- ==========================================
-- 🔧 修复用户ID类型问题
-- 支持字符串类型的用户ID（如 "dev-premium-user"）
-- ==========================================

-- 1. 删除现有表（如果存在）
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.usage_stats CASCADE;
DROP TABLE IF EXISTS public.brand_assets CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- 删除现有触发器和函数
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 2. 重新创建用户资料表（使用TEXT类型的用户ID）
CREATE TABLE public.user_profiles (
  id TEXT PRIMARY KEY,  -- 改为TEXT类型支持字符串ID
  nickname VARCHAR(50),
  avatar_url TEXT,
  tier VARCHAR(20) DEFAULT 'trial' CHECK (tier IN ('trial', 'basic', 'pro', 'premium')),
  permissions JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 重新创建品牌资产表
CREATE TABLE public.brand_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,  -- 改为TEXT类型
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('logo', 'color', 'font', 'image', 'document', 'other')),
  content JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 重新创建使用统计表
CREATE TABLE public.usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,  -- 改为TEXT类型
  feature VARCHAR(100) NOT NULL,
  tokens_used INTEGER DEFAULT 0 CHECK (tokens_used >= 0),
  usage_count INTEGER DEFAULT 1 CHECK (usage_count >= 0),
  date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 重新创建用户偏好表
CREATE TABLE public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,  -- 改为TEXT类型
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- 6. 创建索引
CREATE INDEX idx_brand_assets_user_id ON public.brand_assets(user_id);
CREATE INDEX idx_usage_stats_user_id ON public.usage_stats(user_id);
CREATE INDEX idx_usage_stats_feature ON public.usage_stats(feature);
CREATE INDEX idx_usage_stats_date ON public.usage_stats(date);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_preferences_key ON public.user_preferences(key);

-- 7. 启用行级安全策略
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 8. 创建RLS策略（适配TEXT类型用户ID）
-- 用户资料表策略
CREATE POLICY "Users can manage own profile" ON public.user_profiles 
  FOR ALL USING (
    CASE 
      WHEN auth.uid() IS NOT NULL THEN auth.uid()::text = id
      ELSE current_setting('request.jwt.claims', true)::json->>'sub' = id
    END
  );

-- 品牌资产表策略
CREATE POLICY "Users can manage own brand assets" ON public.brand_assets 
  FOR ALL USING (
    CASE 
      WHEN auth.uid() IS NOT NULL THEN auth.uid()::text = user_id
      ELSE current_setting('request.jwt.claims', true)::json->>'sub' = user_id
    END
  );

-- 使用统计表策略
CREATE POLICY "Users can view own usage stats" ON public.usage_stats 
  FOR SELECT USING (
    CASE 
      WHEN auth.uid() IS NOT NULL THEN auth.uid()::text = user_id
      ELSE current_setting('request.jwt.claims', true)::json->>'sub' = user_id
    END
  );

CREATE POLICY "System can insert usage stats" ON public.usage_stats 
  FOR INSERT WITH CHECK (
    CASE 
      WHEN auth.uid() IS NOT NULL THEN auth.uid()::text = user_id
      ELSE current_setting('request.jwt.claims', true)::json->>'sub' = user_id
    END
  );

-- 用户偏好表策略
CREATE POLICY "Users can manage own preferences" ON public.user_preferences 
  FOR ALL USING (
    CASE 
      WHEN auth.uid() IS NOT NULL THEN auth.uid()::text = user_id
      ELSE current_setting('request.jwt.claims', true)::json->>'sub' = user_id
    END
  );

-- 9. 重新创建自动更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. 重新创建触发器
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_assets_updated_at 
  BEFORE UPDATE ON public.brand_assets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON public.user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. 插入测试用户数据
INSERT INTO public.user_profiles (id, nickname, tier, settings) VALUES 
  ('dev-premium-user', 'Premium测试用户', 'premium', '{"theme": "system", "language": "zh-CN"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  nickname = EXCLUDED.nickname,
  tier = EXCLUDED.tier,
  updated_at = NOW();

-- 12. 创建用户ID兼容性函数
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
BEGIN
  -- 优先使用Supabase auth.uid()
  IF auth.uid() IS NOT NULL THEN
    RETURN auth.uid()::text;
  END IF;
  
  -- 回退到JWT claims中的sub字段
  BEGIN
    RETURN current_setting('request.jwt.claims', true)::json->>'sub';
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 完成提示
SELECT '🎉 用户ID类型修复完成！现在支持字符串类型的用户ID了。' as message;
SELECT '✅ 已为用户 "dev-premium-user" 创建测试数据。' as status;

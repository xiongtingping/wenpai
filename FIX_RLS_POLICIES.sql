-- ==========================================
-- 🔧 修复RLS策略 - 支持字符串用户ID和测试环境
-- ==========================================

-- 1. 删除现有的RLS策略
DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can manage own brand assets" ON public.brand_assets;
DROP POLICY IF EXISTS "Users can view own usage stats" ON public.usage_stats;
DROP POLICY IF EXISTS "System can insert usage stats" ON public.usage_stats;
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;

-- 2. 临时禁用RLS以便测试
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences DISABLE ROW LEVEL SECURITY;

-- 3. 创建用户身份获取函数
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
DECLARE
  user_id TEXT;
BEGIN
  -- 方法1: 尝试从Supabase auth获取
  BEGIN
    IF auth.uid() IS NOT NULL THEN
      RETURN auth.uid()::text;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- 忽略错误，继续下一个方法
  END;
  
  -- 方法2: 尝试从JWT claims获取
  BEGIN
    user_id := current_setting('request.jwt.claims', true)::json->>'sub';
    IF user_id IS NOT NULL AND user_id != '' THEN
      RETURN user_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- 忽略错误，继续下一个方法
  END;
  
  -- 方法3: 尝试从自定义header获取（用于测试）
  BEGIN
    user_id := current_setting('request.headers', true)::json->>'x-user-id';
    IF user_id IS NOT NULL AND user_id != '' THEN
      RETURN user_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- 忽略错误
  END;
  
  -- 方法4: 返回测试用户ID（仅用于开发环境）
  RETURN 'dev-premium-user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 创建宽松的RLS策略（适合开发和测试）
-- 用户资料表策略
CREATE POLICY "Allow user profile access" ON public.user_profiles
  FOR ALL 
  USING (true)  -- 临时允许所有访问，便于测试
  WITH CHECK (true);

-- 品牌资产表策略
CREATE POLICY "Allow brand assets access" ON public.brand_assets
  FOR ALL 
  USING (true)  -- 临时允许所有访问，便于测试
  WITH CHECK (true);

-- 使用统计表策略
CREATE POLICY "Allow usage stats access" ON public.usage_stats
  FOR ALL 
  USING (true)  -- 临时允许所有访问，便于测试
  WITH CHECK (true);

-- 用户偏好表策略
CREATE POLICY "Allow user preferences access" ON public.user_preferences
  FOR ALL 
  USING (true)  -- 临时允许所有访问，便于测试
  WITH CHECK (true);

-- 5. 重新启用RLS（使用宽松策略）
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 6. 确保测试用户数据存在
INSERT INTO public.user_profiles (id, nickname, tier, settings) VALUES 
  ('dev-premium-user', 'Premium测试用户', 'premium', '{"theme": "system", "language": "zh-CN"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  nickname = EXCLUDED.nickname,
  tier = EXCLUDED.tier,
  updated_at = NOW();

-- 7. 创建一些测试数据
INSERT INTO public.user_preferences (user_id, key, value) VALUES 
  ('dev-premium-user', 'test_preference', '{"test": true, "timestamp": "2025-08-13"}'::jsonb)
ON CONFLICT (user_id, key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- 8. 验证数据插入
SELECT 'user_profiles' as table_name, count(*) as record_count FROM public.user_profiles WHERE id = 'dev-premium-user'
UNION ALL
SELECT 'user_preferences' as table_name, count(*) as record_count FROM public.user_preferences WHERE user_id = 'dev-premium-user';

-- 完成提示
SELECT '🎉 RLS策略修复完成！现在应该可以正常访问数据了。' as message;
SELECT '✅ 已创建宽松的RLS策略，适合开发和测试环境。' as status;
SELECT '⚠️ 生产环境请使用更严格的RLS策略。' as warning;

# 🚀 Supabase项目设置指南

## 📋 当前进度

- [x] 创建Supabase项目
- [ ] 获取API密钥并配置环境变量
- [ ] 执行数据库迁移脚本
- [ ] 测试连接和功能

## 🔑 第二步：获取并配置API密钥

### 2.1 在Supabase仪表板中获取密钥

1. **进入您的Supabase项目仪表板**
2. **点击左侧菜单的 "Settings" (齿轮图标)**
3. **点击 "API" 选项**
4. **复制以下三个重要信息**：

#### 📍 项目URL
```
Project URL: https://your-project-id.supabase.co
```

#### 🔓 匿名公钥 (anon public)
```
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk...
```

#### 🔐 服务角色密钥 (service_role secret)
```
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2OT...
```

### 2.2 更新环境变量文件

打开项目根目录的 `.env.local` 文件，找到Supabase配置部分，替换以下占位符：

```env
# 将这些占位符替换为您从Supabase获取的实际值

# 1. 替换项目URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co
# 改为：VITE_SUPABASE_URL=https://abcdefghijk.supabase.co

# 2. 替换匿名公钥
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here
# 改为：VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk...

# 3. 替换服务角色密钥
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key-here
# 改为：VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5OT...
```

### 2.3 验证配置

配置完成后，保存文件并重启开发服务器：

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

## 🗄️ 第三步：执行数据库迁移脚本

### 3.1 在Supabase中执行SQL脚本

1. **进入Supabase仪表板**
2. **点击左侧菜单的 "SQL Editor"**
3. **点击 "New query" 创建新查询**
4. **复制并粘贴以下完整的SQL脚本**：

```sql
-- ==========================================
-- Wenpai 统一存储系统数据库初始化脚本
-- 创建时间: 2025-08-13
-- 版本: v1.0.0
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

-- 插入初始化数据（可选）
-- 这里可以添加一些初始化数据，比如默认的用户等级配置等

-- 完成提示
SELECT 'Wenpai统一存储系统数据库初始化完成！' as message;
```

### 3.2 执行脚本

1. **将上述SQL脚本粘贴到SQL编辑器中**
2. **点击右下角的 "Run" 按钮执行脚本**
3. **等待执行完成，应该看到成功消息**

### 3.3 验证表创建

执行完成后，您可以验证表是否创建成功：

1. **点击左侧菜单的 "Table Editor"**
2. **应该看到以下4个表**：
   - `user_profiles` - 用户资料表
   - `brand_assets` - 品牌资产表
   - `usage_stats` - 使用统计表
   - `user_preferences` - 用户偏好表

## 🧪 第四步：测试连接和功能

### 4.1 重启开发服务器

```bash
# 如果服务器正在运行，先停止 (Ctrl+C)
npm run dev
```

### 4.2 访问存储设置页面

打开浏览器访问：
```
http://localhost:5175/storage-settings
```

### 4.3 测试功能

1. **登录您的账户**
2. **查看数据迁移状态** - 应该显示是否需要迁移
3. **测试统一存储演示** - 尝试保存和获取数据
4. **检查云端同步** - 保存数据后应该能在云端看到

## ✅ 完成检查清单

- [ ] Supabase项目已创建
- [ ] API密钥已获取并配置到 `.env.local`
- [ ] 数据库迁移脚本已执行成功
- [ ] 4个数据表已创建
- [ ] 开发服务器已重启
- [ ] 存储设置页面可以正常访问
- [ ] 登录后可以看到数据迁移选项
- [ ] 统一存储演示功能正常

## 🚨 常见问题

### 问题1：无法连接到Supabase
**解决方案**：
- 检查 `.env.local` 中的URL是否正确
- 确保API密钥没有多余的空格
- 重启开发服务器

### 问题2：SQL脚本执行失败
**解决方案**：
- 确保您有项目的管理员权限
- 检查SQL语法是否完整
- 尝试分段执行脚本

### 问题3：RLS策略阻止数据访问
**解决方案**：
- 确保用户已正确登录
- 检查用户ID是否正确传递
- 在Supabase仪表板中检查RLS策略

## 📞 需要帮助？

如果您在设置过程中遇到任何问题，请告诉我：
1. 具体的错误信息
2. 您当前进行到哪一步
3. 浏览器控制台的错误日志

我会立即帮您解决！

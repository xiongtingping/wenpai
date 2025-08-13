# 🚀 Supabase 集成实施计划

## 📋 第一阶段：环境准备和基础设置

### 1.1 安装Supabase依赖
```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-react
```

### 1.2 环境变量配置
```env
# .env.local
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 1.3 Supabase客户端初始化
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 📊 第二阶段：数据库表结构设计

### 2.1 用户资料表
```sql
-- users 表（扩展Supabase auth.users）
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nickname VARCHAR(50),
  avatar_url TEXT,
  tier VARCHAR(20) DEFAULT 'trial',
  permissions JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS策略
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 2.2 品牌资产表
```sql
-- brand_assets 表
CREATE TABLE public.brand_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  content JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS策略
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own brand assets" ON public.brand_assets
  USING (auth.uid() = user_id);
```

### 2.3 使用统计表
```sql
-- usage_stats 表
CREATE TABLE public.usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  feature VARCHAR(100) NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS策略
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage stats" ON public.usage_stats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert usage stats" ON public.usage_stats
  FOR INSERT WITH CHECK (true);
```

### 2.4 用户偏好表
```sql
-- user_preferences 表
CREATE TABLE public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- RLS策略
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  USING (auth.uid() = user_id);
```

## 🔧 第三阶段：统一存储服务

### 3.1 创建统一存储管理器
```typescript
// src/services/unifiedStorageService.ts
import { supabase } from '@/lib/supabase'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'

export interface StorageConfig {
  key: string
  storageType: 'local' | 'session' | 'supabase'
  syncToCloud?: boolean
  userIsolated?: boolean
}

export class UnifiedStorageService {
  private user: any

  constructor(user?: any) {
    this.user = user
  }

  // 保存数据
  async setItem<T>(config: StorageConfig, value: T): Promise<void> {
    const { key, storageType, syncToCloud, userIsolated } = config
    
    // 生成存储键
    const storageKey = userIsolated && this.user?.id 
      ? `${key}_${this.user.id}` 
      : key

    try {
      // 本地存储
      if (storageType === 'local') {
        localStorage.setItem(storageKey, JSON.stringify(value))
      } else if (storageType === 'session') {
        sessionStorage.setItem(storageKey, JSON.stringify(value))
      }

      // 云端同步
      if (syncToCloud && this.user?.id) {
        await this.syncToSupabase(key, value)
      }
    } catch (error) {
      console.error('存储失败:', error)
      throw error
    }
  }

  // 获取数据
  async getItem<T>(config: StorageConfig): Promise<T | null> {
    const { key, storageType, syncToCloud } = config
    
    try {
      // 优先从云端获取
      if (syncToCloud && this.user?.id) {
        const cloudData = await this.getFromSupabase<T>(key)
        if (cloudData) return cloudData
      }

      // 本地获取
      const storageKey = config.userIsolated && this.user?.id 
        ? `${key}_${this.user.id}` 
        : key

      let stored: string | null = null
      if (storageType === 'local') {
        stored = localStorage.getItem(storageKey)
      } else if (storageType === 'session') {
        stored = sessionStorage.getItem(storageKey)
      }

      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('获取数据失败:', error)
      return null
    }
  }

  // 同步到Supabase
  private async syncToSupabase<T>(key: string, value: T): Promise<void> {
    if (!this.user?.id) return

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: this.user.id,
        key,
        value: value as any,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('同步到Supabase失败:', error)
      throw error
    }
  }

  // 从Supabase获取
  private async getFromSupabase<T>(key: string): Promise<T | null> {
    if (!this.user?.id) return null

    const { data, error } = await supabase
      .from('user_preferences')
      .select('value')
      .eq('user_id', this.user.id)
      .eq('key', key)
      .single()

    if (error || !data) return null
    return data.value as T
  }
}
```

### 3.2 创建React Hook
```typescript
// src/hooks/useUnifiedStorage.ts
import { useCallback } from 'react'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'
import { UnifiedStorageService, StorageConfig } from '@/services/unifiedStorageService'

export function useUnifiedStorage() {
  const { user } = useUnifiedAuth()
  const storageService = new UnifiedStorageService(user)

  const setItem = useCallback(async <T>(config: StorageConfig, value: T) => {
    return storageService.setItem(config, value)
  }, [user?.id])

  const getItem = useCallback(async <T>(config: StorageConfig): Promise<T | null> => {
    return storageService.getItem<T>(config)
  }, [user?.id])

  return { setItem, getItem, user }
}
```

## 📝 第四阶段：数据迁移策略

### 4.1 识别需要迁移的数据
```typescript
// src/utils/dataMigration.ts
export const MIGRATION_MAP = {
  // 需要迁移到Supabase的数据
  toSupabase: [
    'brand_assets',
    'user_preferences',
    'usage_stats',
    'subscription_data'
  ],
  
  // 保留在localStorage的数据
  keepLocal: [
    'authing_user',
    'login_redirect_to',
    'wenpai-theme',
    'ui_cache'
  ],
  
  // 保留在sessionStorage的数据
  keepSession: [
    'ai_adapter_content',
    'form_drafts',
    'navigation_state'
  ]
}
```

### 4.2 创建迁移脚本
```typescript
export class DataMigrationService {
  async migrateUserData(userId: string): Promise<void> {
    console.log(`开始迁移用户 ${userId} 的数据...`)
    
    // 迁移品牌资产
    await this.migrateBrandAssets(userId)
    
    // 迁移用户偏好
    await this.migrateUserPreferences(userId)
    
    // 迁移使用统计
    await this.migrateUsageStats(userId)
    
    console.log('数据迁移完成')
  }

  private async migrateBrandAssets(userId: string): Promise<void> {
    const localKey = `brand_assets_${userId}`
    const localData = localStorage.getItem(localKey)
    
    if (localData) {
      const assets = JSON.parse(localData)
      // 批量插入到Supabase
      const { error } = await supabase
        .from('brand_assets')
        .insert(assets.map((asset: any) => ({
          ...asset,
          user_id: userId
        })))
      
      if (!error) {
        localStorage.removeItem(localKey)
        console.log('品牌资产迁移完成')
      }
    }
  }
}
```

## 🎯 实施步骤指导

### 步骤1: 准备工作
1. 创建Supabase项目
2. 配置环境变量
3. 安装依赖包

### 步骤2: 数据库设置
1. 执行SQL脚本创建表
2. 配置RLS策略
3. 测试数据库连接

### 步骤3: 服务集成
1. 创建统一存储服务
2. 实现React Hook
3. 更新现有组件

### 步骤4: 数据迁移
1. 创建迁移脚本
2. 测试迁移流程
3. 执行生产迁移

### 步骤5: 验证和优化
1. 功能测试
2. 性能优化
3. 错误处理完善

您希望我从哪个步骤开始帮您实施？我建议先从步骤1开始，创建Supabase项目和基础配置。

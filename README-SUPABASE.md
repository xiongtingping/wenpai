# Supabase 数据库集成指南

本项目已集成 Supabase 作为主要数据库，提供完整的用户数据管理、Token 使用统计、邀请系统等功能。

## 🚀 快速开始

### 1. 环境配置

复制 `.env.example` 为 `.env.local` 并配置以下变量：

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 可选：用于数据库初始化的 Service Role Key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. 数据库初始化

#### 方法一：自动初始化脚本（推荐）

```bash
# 安装依赖
npm install @supabase/supabase-js

# 运行初始化脚本
node scripts/setup-supabase.js
```

#### 方法二：手动执行 SQL

在 Supabase Dashboard 的 SQL 编辑器中依次执行：

1. `scripts/init-database.sql` - 创建表格和索引
2. `scripts/init-database-part2.sql` - 创建触发器和 RLS 策略
3. `scripts/init-database-part3.sql` - 创建视图、函数和初始数据

### 3. 验证安装

```typescript
import { useDatabase } from '@/hooks/useSupabase'

function App() {
  const { initialized, checkDatabaseStatus } = useDatabase()
  
  useEffect(() => {
    checkDatabaseStatus()
  }, [])
  
  if (initialized === false) {
    return <div>数据库未初始化，请运行初始化脚本</div>
  }
  
  return <div>数据库已就绪</div>
}
```

## 📊 数据库结构

### 核心表格

| 表名 | 描述 | 主要字段 |
|------|------|----------|
| `user_profiles` | 用户扩展信息 | nickname, avatar_url, bio, preferences |
| `user_subscriptions` | 用户订阅信息 | tier, monthly_token_limit, usage_count_limit |
| `token_usage_records` | Token 使用记录 | feature, input_tokens, output_tokens, model |
| `usage_count_records` | 使用次数记录 | feature, amount, used_at |
| `user_invite_relations` | 邀请关系 | inviter_id, invitee_id, status, source |
| `user_invite_stats` | 邀请统计 | total_invites, successful_invites, conversion_rate |
| `user_files` | 用户文件 | filename, file_path, file_type, metadata |
| `user_notes` | 用户笔记 | title, content, category, tags |
| `user_brand_corpus` | 品牌语料库 | brand_name, tone_keywords, style_guide |
| `user_library_items` | 收藏夹 | title, url, content, category |
| `user_chat_history` | 聊天历史 | session_id, role, content, tokens_used |

### 统计视图

- `monthly_token_usage` - 月度 Token 使用统计
- `daily_token_usage` - 日度 Token 使用统计  
- `feature_usage_stats` - 功能使用统计

### 存储过程

- `get_user_monthly_token_usage()` - 获取用户月度使用量
- `check_user_token_limit()` - 检查用户 Token 限额
- `get_user_usage_count()` - 获取用户使用次数统计
- `cleanup_old_records()` - 清理过期记录

## 🔧 使用方法

### 认证和用户管理

```typescript
import { useSupabase } from '@/hooks/useSupabase'

function LoginComponent() {
  const { signIn, signUp, user, profile, updateProfile } = useSupabase()
  
  // 登录
  const handleLogin = async () => {
    await signIn('user@example.com', 'password')
  }
  
  // 注册
  const handleRegister = async () => {
    await signUp('user@example.com', 'password', { nickname: 'User' })
  }
  
  // 更新用户资料
  const handleUpdateProfile = async () => {
    await updateProfile({ nickname: 'New Name', bio: 'Updated bio' })
  }
}
```

### Token 使用统计

```typescript
import { useSupabase } from '@/hooks/useSupabase'

function AIFeatureComponent() {
  const { recordTokenUsage, checkTokenLimit, getMonthlyUsage } = useSupabase()
  
  // 记录 Token 使用
  const handleAIRequest = async () => {
    // 检查限额
    const limit = await checkTokenLimit(1000)
    if (!limit.allowed) {
      alert('Token 使用量已达上限')
      return
    }
    
    // 执行 AI 请求...
    
    // 记录使用量
    await recordTokenUsage({
      feature: 'content_generation',
      taskType: 'article_writing',
      inputTokens: 500,
      outputTokens: 1500,
      totalTokens: 2000,
      model: 'gpt-4',
      contentSummary: '生成了一篇关于AI的文章',
      success: true
    })
  }
  
  // 获取使用统计
  const handleGetStats = async () => {
    const stats = await getMonthlyUsage()
    console.log('本月使用:', stats)
  }
}
```

### 数据服务

```typescript
import {
  UserProfileService,
  TokenUsageService,
  UserNoteService,
  LibraryService
} from '@/services/supabaseService'

// 用户资料管理
const profile = await UserProfileService.getProfile(userId)
await UserProfileService.updateProfile(userId, { nickname: 'New Name' })

// 笔记管理
const notes = await UserNoteService.getUserNotes(userId)
await UserNoteService.createNote({
  user_id: userId,
  title: '我的笔记',
  content: '笔记内容',
  category: 'personal'
})

// 收藏夹管理
const items = await LibraryService.getUserLibraryItems(userId)
await LibraryService.createLibraryItem({
  user_id: userId,
  title: '有用的链接',
  url: 'https://example.com',
  category: 'resources'
})
```

## 🔒 安全特性

### Row Level Security (RLS)

所有表格都启用了行级安全策略，确保用户只能访问自己的数据：

```sql
-- 示例：用户只能查看自己的资料
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);
```

### 数据验证

- 自动时间戳更新
- 外键约束确保数据完整性
- JSONB 字段用于灵活的元数据存储

## 📈 性能优化

### 索引策略

- 用户 ID 索引：快速查询用户相关数据
- 时间索引：支持时间范围查询
- 复合索引：优化常用查询组合

### 数据清理

定期清理过期数据：

```typescript
import { useDatabase } from '@/hooks/useSupabase'

const { cleanupOldData } = useDatabase()

// 清理 6 个月前的 Token 记录、3 个月前的聊天历史等
await cleanupOldData()
```

## 🛠️ 开发工具

### 数据库状态检查

```typescript
import { useDatabase } from '@/hooks/useSupabase'

const { 
  initialized, 
  stats, 
  validateDatabase,
  getDatabaseStats 
} = useDatabase()

// 检查数据库完整性
const validation = await validateDatabase()
if (!validation.valid) {
  console.log('数据库问题:', validation.issues)
}

// 获取统计信息
const stats = await getDatabaseStats()
console.log('数据库统计:', stats)
```

### 调试和监控

- 所有服务都包含错误日志
- 支持数据库完整性验证
- 提供详细的使用统计

## 🔄 数据迁移

如果需要更新数据库结构，请：

1. 在 `scripts/` 目录创建迁移脚本
2. 使用版本控制管理迁移
3. 在生产环境谨慎执行

## 📞 支持

如果遇到问题：

1. 检查 Supabase Dashboard 中的日志
2. 验证环境变量配置
3. 确认 RLS 策略正确设置
4. 查看浏览器控制台错误信息

## 🎯 最佳实践

1. **数据建模**：合理使用 JSONB 存储灵活数据
2. **查询优化**：利用索引和视图提高性能
3. **安全第一**：始终通过 RLS 保护用户数据
4. **监控使用**：定期检查 Token 使用量和系统性能
5. **备份策略**：利用 Supabase 的自动备份功能

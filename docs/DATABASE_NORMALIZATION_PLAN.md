# 数据库清理和规范化方案

## 当前状态分析

### 有数据的表（保留）
1. ✅ **user_subscriptions** (7条) - 用户订阅记录
2. ✅ **orders** (85条) - 订单记录
3. ✅ **token_usage_records** (287条) - Token使用记录
4. ✅ **usage_count_records** (45条) - 使用次数记录
5. ✅ **user_preferences** (2条) - 用户偏好设置
6. ✅ **user_library_items** (4条) - 用户资料库
7. ✅ **user_brand_corpus** (30条) - 品牌语料库
8. ✅ **user_invite_stats** (2条) - 邀请统计

### 空表（需要决策）
1. ⚠️  **user_profiles** (0条) - 用户资料
2. ⚠️  **upgrade_orders** (0条) - 升级订单记录
3. ⚠️  **user_usage_logs** (0条) - 用户使用日志（与token_usage_records重复）
4. ⚠️  **user_chat_history** (0条) - 聊天历史
5. ⚠️  **user_brand_library** (0条) - 品牌库（与user_brand_corpus重复）
6. ⚠️  **user_invite_relations** (0条) - 邀请关系
7. ⚠️  **user_invite_events** (0条) - 邀请事件

## 问题识别

### 1. 表名不一致
- ❌ `token_usage_records` - 使用 `records` 后缀
- ❌ `usage_count_records` - 使用 `records` 后缀
- ✅ `user_subscriptions` - 使用复数形式
- ✅ `orders` - 使用复数形式

**建议**: 统一使用复数形式，去掉 `_records` 后缀

### 2. 字段名不一致

#### token_usage_records 表
- ❌ 同时有 `timestamp` 和 `created_at` 字段（重复）
- ✅ 应该只保留 `created_at`

#### usage_count_records 表
- ❌ 使用 `used_at` 字段
- ✅ 应该改为 `created_at` 保持一致

### 3. 重复的表

#### user_usage_logs vs token_usage_records
- `user_usage_logs` 为空，从未使用
- `token_usage_records` 有287条记录，正在使用
- **决策**: 删除 `user_usage_logs`，统一使用 `token_usage_records`

#### user_brand_library vs user_brand_corpus
- `user_brand_library` 为空，从未使用
- `user_brand_corpus` 有30条记录，正在使用
- **决策**: 删除 `user_brand_library`

## 清理方案

### Phase 1: 删除空的重复表（安全）

```sql
-- 1. 删除 user_usage_logs（与 token_usage_records 重复）
DROP TABLE IF EXISTS user_usage_logs;

-- 2. 删除 user_brand_library（与 user_brand_corpus 重复）
DROP TABLE IF EXISTS user_brand_library;
```

### Phase 2: 保留空表但未来可能使用的表

以下表虽然为空，但代码中可能会用到，暂时保留：

- ✅ **user_profiles** - 用户资料（未来可能需要）
- ✅ **upgrade_orders** - 升级订单（未来可能需要）
- ✅ **user_chat_history** - 聊天历史（功能已实现，只是暂无数据）
- ✅ **user_invite_relations** - 邀请关系（功能已实现，只是暂无数据）
- ✅ **user_invite_events** - 邀请事件（功能已实现，只是暂无数据）

### Phase 3: 字段名规范化

#### 3.1 token_usage_records 表

```sql
-- 删除重复的 timestamp 字段（已有 created_at）
ALTER TABLE token_usage_records DROP COLUMN IF EXISTS timestamp;
```

#### 3.2 usage_count_records 表

```sql
-- 重命名 used_at 为 created_at（保持一致性）
-- 注意：这个需要谨慎，因为可能影响现有查询
-- 建议：先添加 created_at，然后迁移数据，最后删除 used_at

-- 步骤1: 添加 created_at 字段（如果不存在）
ALTER TABLE usage_count_records 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;

-- 步骤2: 复制 used_at 的值到 created_at
UPDATE usage_count_records 
SET created_at = used_at 
WHERE created_at IS NULL;

-- 步骤3: 设置 created_at 为 NOT NULL 和默认值
ALTER TABLE usage_count_records 
ALTER COLUMN created_at SET NOT NULL,
ALTER COLUMN created_at SET DEFAULT NOW();

-- 步骤4: 删除 used_at 字段（可选，建议先测试）
-- ALTER TABLE usage_count_records DROP COLUMN used_at;
```

### Phase 4: 表名规范化（可选，影响较大）

如果要统一表名规范，需要：

```sql
-- 重命名表（保持一致性）
ALTER TABLE token_usage_records RENAME TO token_usages;
ALTER TABLE usage_count_records RENAME TO usage_counts;
```

**注意**: 这会影响所有引用这些表的代码，需要全局替换。

## 代码更新清单

### Phase 1 & 2: 删除重复表后的代码更新

#### 1. 更新 TABLE_NAMES 配置

```typescript
// src/config/supabaseTables.ts
export const TABLE_NAMES = {
  USER_PROFILES: 'user_profiles',
  USER_SUBSCRIPTIONS: 'user_subscriptions',
  USER_ORDERS: 'orders',
  UPGRADE_ORDERS: 'upgrade_orders',
  USER_NOTES: 'user_notes',
  USER_FILES: 'user_files',
  TOKEN_USAGES: 'token_usage_records', // 保持不变
  USAGE_COUNTS: 'usage_count_records', // 保持不变
  USER_LIBRARY_ITEMS: 'user_library_items',
  USER_CHAT_HISTORY: 'user_chat_history',
  USER_BRAND_CORPUS: 'user_brand_corpus',
  USER_INVITE_RELATIONS: 'user_invite_relations',
  USER_INVITE_STATS: 'user_invite_stats',
  USER_INVITE_EVENTS: 'user_invite_events'
} as const;
```

#### 2. 删除对已删除表的引用

搜索并删除所有对以下表的引用：
- `user_usage_logs`
- `user_brand_library`

### Phase 3: 字段名规范化后的代码更新

#### 1. token_usage_records 表

删除 `timestamp` 字段后，确保所有查询都使用 `created_at`：

```typescript
// ✅ 正确
.gte('created_at', startTime)

// ❌ 错误（已修复）
.gte('timestamp', startTime)
```

#### 2. usage_count_records 表

如果重命名 `used_at` 为 `created_at`，需要更新所有查询。

## 执行计划

### 第一步：备份数据库 ✅

```bash
# 使用 Supabase Dashboard 创建备份
# 或使用 pg_dump
```

### 第二步：执行 Phase 1（删除重复表）✅

```sql
DROP TABLE IF EXISTS user_usage_logs;
DROP TABLE IF EXISTS user_brand_library;
```

### 第三步：执行 Phase 3（字段规范化）✅

```sql
-- token_usage_records: 删除 timestamp
ALTER TABLE token_usage_records DROP COLUMN IF EXISTS timestamp;

-- usage_count_records: 添加 created_at
ALTER TABLE usage_count_records 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;

UPDATE usage_count_records 
SET created_at = used_at 
WHERE created_at IS NULL;

ALTER TABLE usage_count_records 
ALTER COLUMN created_at SET NOT NULL,
ALTER COLUMN created_at SET DEFAULT NOW();
```

### 第四步：更新代码 ✅

1. 删除对 `user_usage_logs` 的所有引用
2. 删除对 `user_brand_library` 的所有引用
3. 确保所有查询使用 `created_at` 而不是 `timestamp`

### 第五步：测试 ✅

1. 运行所有使用统计相关的功能
2. 验证数据正确显示
3. 检查是否有错误日志

## 风险评估

### 低风险操作
- ✅ 删除 `user_usage_logs`（空表，未使用）
- ✅ 删除 `user_brand_library`（空表，未使用）
- ✅ 删除 `token_usage_records.timestamp`（重复字段）

### 中风险操作
- ⚠️  重命名 `usage_count_records.used_at` 为 `created_at`（需要更新代码）

### 高风险操作（不建议）
- ❌ 重命名表名（影响所有代码）
- ❌ 删除有数据的表

## 回滚计划

如果出现问题：

```sql
-- 恢复 user_usage_logs 表
CREATE TABLE user_usage_logs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  feature VARCHAR(100) NOT NULL,
  -- ... 其他字段
);

-- 恢复 user_brand_library 表
CREATE TABLE user_brand_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(100) NOT NULL,
  -- ... 其他字段
);

-- 恢复 timestamp 字段
ALTER TABLE token_usage_records 
ADD COLUMN timestamp TIMESTAMP WITH TIME ZONE;

UPDATE token_usage_records 
SET timestamp = created_at;
```

## 总结

### 立即执行（安全）
1. ✅ 删除 `user_usage_logs` 表
2. ✅ 删除 `user_brand_library` 表
3. ✅ 删除 `token_usage_records.timestamp` 字段
4. ✅ 添加 `usage_count_records.created_at` 字段

### 暂缓执行（需要更多测试）
1. ⏸️  重命名表名
2. ⏸️  删除 `usage_count_records.used_at` 字段

### 不执行（风险太高）
1. ❌ 删除有数据的表
2. ❌ 修改主键或外键


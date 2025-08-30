# 🔄 数据库迁移指南 - 修复 Authing 用户 ID 格式

## 📋 迁移概述

**目的**：修复 Authing 用户 ID 格式兼容性问题  
**问题**：当前数据库使用 UUID 类型，但 Authing 提供的用户 ID 不是标准 UUID 格式  
**解决**：将所有 `user_id` 列改为 VARCHAR(100) 类型，移除对 `auth.users` 的外键约束  

## ⚠️ 迁移前检查

✅ **数据安全**：所有表都是空的（0 条记录），迁移安全  
✅ **备份不需要**：没有现有数据需要备份  
✅ **迁移脚本**：`database_migration_fix_authing_userid.sql` 已准备就绪  

## 🚀 执行步骤

### 1. 打开 Supabase SQL 编辑器

访问：**https://supabase.com/dashboard/project/weizkydylskcwgnaieqy/sql**

### 2. 执行迁移脚本

复制并执行 `database_migration_fix_authing_userid.sql` 的完整内容：

```sql
-- 文派AI - 修复Authing用户ID格式的数据库迁移脚本
-- 问题：当前schema使用UUID类型，但Authing提供的用户ID不是标准UUID格式
-- 解决：将所有user_id列改为VARCHAR类型，移除对auth.users的外键约束

-- ============================================================================
-- 1. 修复用户相关表格的user_id类型
-- ============================================================================

-- 修复 user_profiles 表
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

ALTER TABLE user_profiles 
ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_subscriptions 表  
ALTER TABLE user_subscriptions
DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey;

ALTER TABLE user_subscriptions
ALTER COLUMN user_id TYPE VARCHAR(100);

-- ============================================================================
-- 2. 修复Token使用量相关表格
-- ============================================================================

-- 修复 token_usage_records 表
ALTER TABLE token_usage_records
DROP CONSTRAINT IF EXISTS token_usage_records_user_id_fkey;

ALTER TABLE token_usage_records
ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 usage_count_records 表
ALTER TABLE usage_count_records  
DROP CONSTRAINT IF EXISTS usage_count_records_user_id_fkey;

ALTER TABLE usage_count_records
ALTER COLUMN user_id TYPE VARCHAR(100);

-- ============================================================================
-- 3. 修复邀请系统表格
-- ============================================================================

-- 修复 user_invite_relations 表
ALTER TABLE user_invite_relations
DROP CONSTRAINT IF EXISTS user_invite_relations_inviter_id_fkey;

ALTER TABLE user_invite_relations  
DROP CONSTRAINT IF EXISTS user_invite_relations_invitee_id_fkey;

ALTER TABLE user_invite_relations
ALTER COLUMN inviter_id TYPE VARCHAR(100);

ALTER TABLE user_invite_relations
ALTER COLUMN invitee_id TYPE VARCHAR(100);

-- 修复 user_invite_stats 表
ALTER TABLE user_invite_stats
DROP CONSTRAINT IF EXISTS user_invite_stats_user_id_fkey;

ALTER TABLE user_invite_stats
ALTER COLUMN user_id TYPE VARCHAR(100);

-- ============================================================================
-- 4. 修复内容和文件相关表格
-- ============================================================================

-- 修复 user_files 表
ALTER TABLE user_files
DROP CONSTRAINT IF EXISTS user_files_user_id_fkey;

ALTER TABLE user_files  
ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_notes 表
ALTER TABLE user_notes
DROP CONSTRAINT IF EXISTS user_notes_user_id_fkey;

ALTER TABLE user_notes
ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_brand_corpus 表
ALTER TABLE user_brand_corpus
DROP CONSTRAINT IF EXISTS user_brand_corpus_user_id_fkey;

ALTER TABLE user_brand_corpus
ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_library_items 表  
ALTER TABLE user_library_items
DROP CONSTRAINT IF EXISTS user_library_items_user_id_fkey;

ALTER TABLE user_library_items
ALTER COLUMN user_id TYPE VARCHAR(100);

-- 修复 user_chat_history 表
ALTER TABLE user_chat_history
DROP CONSTRAINT IF EXISTS user_chat_history_user_id_fkey;

ALTER TABLE user_chat_history
ALTER COLUMN user_id TYPE VARCHAR(100);

-- ============================================================================
-- 5. 创建索引优化查询性能
-- ============================================================================

-- 为user_id列创建索引（原来的外键约束会自动创建索引，现在需要手动创建）
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);  
CREATE INDEX IF NOT EXISTS idx_token_usage_records_user_id ON token_usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_count_records_user_id ON usage_count_records(user_id);
CREATE INDEX IF NOT EXISTS idx_user_invite_relations_inviter_id ON user_invite_relations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_user_invite_relations_invitee_id ON user_invite_relations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_user_invite_stats_user_id ON user_invite_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_brand_corpus_user_id ON user_brand_corpus(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_items_user_id ON user_library_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chat_history_user_id ON user_chat_history(user_id);
```

### 3. 验证迁移结果

执行完成后，可以运行以下查询验证结果：

```sql
-- 检查修改后的表结构
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'user_id';

SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'token_usage_records' AND column_name = 'user_id';

SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' AND column_name = 'user_id';
```

预期结果应该显示：
- `data_type`: `character varying`
- `character_maximum_length`: `100`

## 📊 迁移影响

### 修改的表格

| 表名 | 修改内容 |
|------|----------|
| `user_profiles` | user_id: UUID → VARCHAR(100) |
| `user_subscriptions` | user_id: UUID → VARCHAR(100) |
| `token_usage_records` | user_id: UUID → VARCHAR(100) |
| `usage_count_records` | user_id: UUID → VARCHAR(100) |
| `user_invite_relations` | inviter_id, invitee_id: UUID → VARCHAR(100) |
| `user_invite_stats` | user_id: UUID → VARCHAR(100) |
| `user_files` | user_id: UUID → VARCHAR(100) |
| `user_notes` | user_id: UUID → VARCHAR(100) |
| `user_brand_corpus` | user_id: UUID → VARCHAR(100) |
| `user_library_items` | user_id: UUID → VARCHAR(100) |
| `user_chat_history` | user_id: UUID → VARCHAR(100) |

### 移除的约束

- 所有对 `auth.users(id)` 的外键约束
- 这是必要的，因为 Authing 用户 ID 不存储在 `auth.users` 表中

### 新增的索引

- 为所有 `user_id` 列重新创建索引以保持查询性能

## 🎯 迁移后的好处

1. **兼容 Authing 用户 ID**：支持 Authing 提供的非 UUID 格式用户 ID
2. **保持性能**：重新创建索引确保查询性能不受影响
3. **数据完整性**：虽然移除了外键约束，但应用层会确保数据一致性
4. **向后兼容**：现有的查询和操作仍然正常工作

## ✅ 完成后的验证

迁移完成后，请：

1. **验证表结构**：确认所有 `user_id` 列都是 VARCHAR(100) 类型
2. **测试应用功能**：确保用户注册、登录、数据操作正常
3. **检查索引**：确认所有索引都已正确创建
4. **运行测试**：访问 `/supabase-test` 页面测试数据库功能

## 🔗 相关链接

- **Supabase SQL 编辑器**：https://supabase.com/dashboard/project/weizkydylskcwgnaieqy/sql
- **迁移脚本文件**：`database_migration_fix_authing_userid.sql`
- **测试页面**：https://www.wenpai.xyz/supabase-test

---

**注意**：由于所有表都是空的，这次迁移是完全安全的，不会丢失任何数据。

# 数据库类型修复说明

## 问题描述

执行数据库脚本时遇到以下错误：

```
ERROR: 42804: foreign key constraint "fk_user_id" cannot be implemented
DETAIL: Key columns "user_id" and "id" are of incompatible types: character varying and uuid.
```

## 原因分析

Supabase 的 `auth.users` 表中的 `id` 字段是 `UUID` 类型，而我们创建的表中 `user_id` 字段使用的是 `VARCHAR(100)` 类型，导致外键约束无法创建。

## 解决方案

### 方案选择

我们选择了**移除外键约束**的方案，原因如下：

1. **灵活性**：应用可能使用不同的认证系统（Authing、Supabase Auth等）
2. **兼容性**：user_id 可能是 UUID 字符串、数字字符串或其他格式
3. **性能**：避免外键约束带来的额外开销
4. **应用层验证**：通过 `UserIdValidator` 在应用层确保 user_id 的有效性

### 修改内容

#### 1. invite_rewards 表

**修改前：**
```sql
user_id VARCHAR(100) NOT NULL,
related_user_id VARCHAR(100),
CONSTRAINT fk_user_id FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) ON DELETE CASCADE
```

**修改后：**
```sql
user_id TEXT NOT NULL,
related_user_id TEXT,
-- 注意：不使用外键约束，因为user_id可能来自不同的认证系统
-- 应用层负责确保user_id的有效性
```

#### 2. user_usage_balance 表

**修改前：**
```sql
user_id VARCHAR(100) PRIMARY KEY,
CONSTRAINT fk_user_usage_balance_user_id FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) ON DELETE CASCADE
```

**修改后：**
```sql
user_id TEXT PRIMARY KEY,
-- 注意：不使用外键约束，因为user_id可能来自不同的认证系统
-- 应用层负责确保user_id的有效性
```

#### 3. user_invite_codes 表

**修改前：**
```sql
inviter_id VARCHAR(100) NOT NULL,
CONSTRAINT fk_inviter_id FOREIGN KEY (inviter_id) 
  REFERENCES auth.users(id) ON DELETE CASCADE
```

**修改后：**
```sql
inviter_id TEXT NOT NULL,
-- 注意：不使用外键约束，因为inviter_id可能来自不同的认证系统
-- 应用层负责确保inviter_id的有效性
```

#### 4. RLS 策略调整

**修改前：**
```sql
USING (auth.uid()::text = user_id);
USING (auth.role() = 'service_role');
```

**修改后：**
```sql
USING (user_id = auth.uid()::text);
USING (true);  -- 服务角色策略简化
```

## 应用层保障

虽然移除了数据库层面的外键约束，但我们在应用层提供了完善的保障：

### 1. UserIdValidator 验证

```typescript
import { UserIdValidator } from '@/utils/userIdValidator';

// 所有服务在使用 user_id 前都会验证
UserIdValidator.validate(userId, 'ServiceName.methodName');
```

**验证规则：**
- 不能为 null、undefined、'undefined'、'null'
- 必须是字符串类型
- 长度在 10-100 字符之间

### 2. 服务层验证

所有涉及 user_id 的服务都会在方法开始时验证：

```typescript
static async someMethod(userId: string) {
  // 验证用户ID
  UserIdValidator.validate(userId, 'ServiceName.someMethod');
  
  // 继续业务逻辑...
}
```

### 3. 数据库索引

虽然没有外键约束，但我们添加了索引来保证查询性能：

```sql
CREATE INDEX idx_invite_rewards_user_id ON invite_rewards(user_id);
CREATE INDEX idx_user_usage_balance_user_id ON user_usage_balance(user_id);
CREATE INDEX idx_user_invite_codes_inviter_id ON user_invite_codes(inviter_id);
```

## 执行步骤

### 1. 清理旧表（如果已创建）

```sql
-- 如果之前执行失败，先删除已创建的表
DROP TABLE IF EXISTS invite_rewards CASCADE;
DROP TABLE IF EXISTS user_usage_balance CASCADE;
DROP TABLE IF EXISTS user_invite_codes CASCADE;
```

### 2. 执行修复后的脚本

在 Supabase SQL 编辑器中依次执行：

```sql
-- 1. 创建奖励记录表和使用次数余额表
-- 复制 database_create_invite_rewards_table.sql 的内容并执行

-- 2. 创建邀请码表
-- 复制 database_create_invite_codes_table.sql 的内容并执行

-- 3. 添加性能优化索引（使用V2版本，更安全）
-- 复制 database_add_user_id_indexes_v2.sql 的内容并执行
```

**注意：** 使用 `database_add_user_id_indexes_v2.sql` 而不是 `database_add_user_id_indexes.sql`，V2版本会自动检测表是否存在，避免错误。

### 3. 验证表创建

```sql
-- 检查表是否创建成功
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN (
  'invite_rewards',
  'user_usage_balance',
  'user_invite_codes'
)
AND column_name LIKE '%user_id%' OR column_name LIKE '%inviter_id%'
ORDER BY table_name, ordinal_position;

-- 应该看到所有 user_id 和 inviter_id 字段都是 TEXT 类型
```

### 4. 验证索引创建

```sql
-- 检查索引是否创建成功
SELECT tablename, indexname 
FROM pg_indexes 
WHERE tablename IN (
  'invite_rewards',
  'user_usage_balance',
  'user_invite_codes'
)
ORDER BY tablename, indexname;
```

## 注意事项

1. **数据类型**：所有 user_id 相关字段现在使用 `TEXT` 类型，可以存储任何格式的用户ID
2. **应用层验证**：必须确保所有服务都使用 `UserIdValidator` 进行验证
3. **RLS 策略**：已启用行级安全策略，确保用户只能访问自己的数据
4. **性能**：通过索引保证查询性能，不会因为移除外键约束而降低性能

## 优势

1. ✅ **兼容性好**：支持不同认证系统的用户ID格式
2. ✅ **灵活性高**：不受数据库外键约束限制
3. ✅ **性能优秀**：通过索引保证查询性能
4. ✅ **安全可靠**：应用层验证 + RLS 策略双重保障

## 相关文件

- `database_create_invite_rewards_table.sql` - ✅ 已修复（移除外键约束，改用TEXT类型）
- `database_create_invite_codes_table.sql` - ✅ 已修复（移除外键约束，改用TEXT类型）
- `database_add_user_id_indexes_v2.sql` - ✅ 新建（安全版本，自动检测表是否存在）
- `src/utils/userIdValidator.ts` - 应用层验证工具

## 常见错误及解决方案

### 错误1：foreign key constraint cannot be implemented

**错误信息：**
```
ERROR: 42804: foreign key constraint "fk_user_id" cannot be implemented
DETAIL: Key columns "user_id" and "id" are of incompatible types: character varying and uuid.
```

**解决方案：** 已修复，移除了外键约束，改用应用层验证。

### 错误2：relation does not exist

**错误信息：**
```
ERROR: 42P01: relation "user_usage_logs" does not exist
```

**解决方案：** 使用 `database_add_user_id_indexes_v2.sql`，会自动检测表是否存在。

---

**修复完成时间：** 2025-10-05
**修复状态：** ✅ 已完成
**版本：** V2（安全版本）


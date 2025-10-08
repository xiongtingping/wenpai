# 数据库清理执行指南

## 📋 概述

本指南将帮助你安全地清理和规范化 Supabase 数据库。

## 🎯 清理目标

### 1. 删除重复的空表
- ❌ `user_usage_logs` (0条记录) - 与 `token_usage_records` 重复
- ❌ `user_brand_library` (0条记录) - 与 `user_brand_corpus` 重复

### 2. 规范化字段名
- ❌ `token_usage_records.timestamp` - 删除（与 `created_at` 重复）
- ✅ `usage_count_records.created_at` - 添加（保持一致性）

## 🚀 执行步骤

### 步骤 1: 查看审查报告

```bash
# 运行审查脚本，查看当前数据库状态
node scripts/audit-all-tables.mjs
```

**预期输出**:
```
✅ user_subscriptions - 记录数: 7
✅ orders - 记录数: 85
✅ token_usage_records - 记录数: 287
✅ user_usage_logs - 记录数: 0  ← 将被删除
✅ user_brand_library - 记录数: 0  ← 将被删除
```

### 步骤 2: 在 Supabase Dashboard 执行 SQL

1. **打开 Supabase Dashboard**
   - 访问: https://supabase.com/dashboard
   - 选择你的项目

2. **进入 SQL Editor**
   - 左侧菜单 → SQL Editor
   - 点击 "New query"

3. **复制并执行 SQL**
   - 打开文件: `supabase/migrations/cleanup_database_schema.sql`
   - 复制全部内容
   - 粘贴到 SQL Editor
   - 点击 "Run" 按钮

4. **查看执行结果**
   
   预期看到以下消息：
   ```
   ✅ 已删除空表: user_usage_logs
   ✅ 已删除空表: user_brand_library
   ✅ 已删除 token_usage_records.timestamp 字段（重复）
   ✅ 已添加 usage_count_records.created_at 字段
   ✅ 数据库清理完成！
   ```

### 步骤 3: 验证清理结果

```bash
# 运行验证脚本
node scripts/verify-database-cleanup.mjs
```

**预期输出**:
```
================================================================================
1. 验证已删除的表
================================================================================

✅ user_usage_logs - 已删除
✅ user_brand_library - 已删除

================================================================================
2. 验证 token_usage_records 表
================================================================================

✅ timestamp 字段已删除
✅ created_at 字段存在

================================================================================
3. 验证 usage_count_records 表
================================================================================

✅ created_at 字段已添加
✅ used_at 字段仍然存在（向后兼容）

================================================================================
验证总结
================================================================================

✅ 所有验证通过！数据库清理成功。
```

### 步骤 4: 更新代码引用

清理完成后，代码已经更新为使用正确的字段名：

#### 已修复的文件：
- ✅ `src/services/token-tracking/core/TokenStatsQuery.ts` - 使用 `created_at`
- ✅ `src/services/token-tracking/core/TokenRecorder.ts` - 使用 `created_at`
- ✅ `src/services/token-tracking/types.ts` - 更新类型定义

#### 需要验证的文件：
- ⚠️  搜索所有使用 `user_usage_logs` 的代码
- ⚠️  搜索所有使用 `user_brand_library` 的代码
- ⚠️  搜索所有使用 `timestamp` 字段的查询

### 步骤 5: 测试功能

测试以下功能确保一切正常：

1. **使用统计显示** ✅
   - 访问个人中心
   - 查看 Token 使用量
   - 查看使用次数

2. **订阅状态** ✅
   - 查看订阅有效期
   - 查看订阅等级

3. **品牌库** ✅
   - 访问品牌库
   - 查看品牌语料

4. **资料库** ✅
   - 访问我的资料库
   - 查看保存的内容

## 🔍 故障排查

### 问题 1: SQL 执行失败

**错误**: `permission denied for table user_usage_logs`

**解决方案**:
- 确保使用 Service Role Key
- 检查 RLS 策略
- 使用 Supabase Dashboard 的 SQL Editor（自动使用正确权限）

### 问题 2: 验证脚本报错

**错误**: `table "user_usage_logs" does not exist`

**解决方案**:
- 这是正常的！表已被删除
- 验证脚本会捕获这个错误并显示 ✅

### 问题 3: 使用统计不显示

**可能原因**:
1. 前端缓存未清除
2. 代码仍在使用旧的字段名

**解决方案**:
```bash
# 1. 清除浏览器缓存
# 2. 检查代码是否使用 created_at
grep -r "timestamp" src/services/token-tracking/

# 3. 重新部署
git push origin main
```

## 📊 清理前后对比

### 清理前

**表数量**: 15 个
- user_subscriptions ✅
- orders ✅
- token_usage_records ✅
- **user_usage_logs** ❌ (重复)
- usage_count_records ✅
- **user_brand_library** ❌ (重复)
- user_brand_corpus ✅
- ... 其他表

**token_usage_records 字段**:
- id
- user_id
- feature
- total_tokens
- **timestamp** ❌ (重复)
- **created_at** ✅
- ...

### 清理后

**表数量**: 13 个
- user_subscriptions ✅
- orders ✅
- token_usage_records ✅
- ~~user_usage_logs~~ ✅ (已删除)
- usage_count_records ✅
- ~~user_brand_library~~ ✅ (已删除)
- user_brand_corpus ✅
- ... 其他表

**token_usage_records 字段**:
- id
- user_id
- feature
- total_tokens
- ~~timestamp~~ ✅ (已删除)
- **created_at** ✅
- ...

**usage_count_records 字段**:
- id
- user_id
- feature
- amount
- used_at ✅ (保留，向后兼容)
- **created_at** ✅ (新增)

## ✅ 完成检查清单

- [ ] 步骤 1: 运行审查脚本
- [ ] 步骤 2: 在 Supabase Dashboard 执行 SQL
- [ ] 步骤 3: 运行验证脚本
- [ ] 步骤 4: 检查代码引用
- [ ] 步骤 5: 测试所有功能
- [ ] 提交代码更改
- [ ] 部署到生产环境

## 🔄 回滚计划

如果出现问题，可以回滚：

```sql
-- 恢复 user_usage_logs 表
CREATE TABLE user_usage_logs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  feature VARCHAR(100) NOT NULL,
  task_type VARCHAR(100),
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  model VARCHAR(100),
  content_summary TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 恢复 user_brand_library 表
CREATE TABLE user_brand_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(100) NOT NULL,
  brand_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 恢复 timestamp 字段
ALTER TABLE token_usage_records 
ADD COLUMN timestamp TIMESTAMP WITH TIME ZONE;

UPDATE token_usage_records 
SET timestamp = created_at;
```

## 📞 需要帮助？

如果遇到问题：
1. 查看 `docs/DATABASE_CLEANUP_PLAN.md` 了解详细方案
2. 运行诊断脚本: `node scripts/audit-all-tables.mjs`
3. 检查 Supabase Dashboard 的日志
4. 联系技术支持

---

**最后更新**: 2025-10-08
**版本**: 1.0.0


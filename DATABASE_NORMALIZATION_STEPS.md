# 执行数据库清理 - 快速指南

## 🚀 快速执行（3步完成）

### 步骤 1: 打开 SQL Editor

已经为你打开了 Supabase Dashboard 的 SQL Editor！

如果没有自动打开，请访问：
https://supabase.com/dashboard/project/weizkydylskcwgnaieqy/sql/new

### 步骤 2: 复制并执行 SQL

1. 打开文件：`supabase/migrations/cleanup_database_schema.sql`
2. 复制全部内容（Cmd+A, Cmd+C）
3. 粘贴到 SQL Editor（Cmd+V）
4. 点击右下角的 "Run" 按钮

### 步骤 3: 验证结果

执行完成后，你应该看到类似的输出：

```
✅ 已删除空表: user_usage_logs
✅ 已删除空表: user_brand_library
✅ 已删除 token_usage_records.timestamp 字段（重复）
ℹ️  usage_count_records.created_at 字段已存在，跳过
================================================================================
验证清理结果
================================================================================
✅ user_usage_logs 表已删除
✅ user_brand_library 表已删除
✅ token_usage_records.timestamp 字段已删除
✅ usage_count_records.created_at 字段已添加
================================================================================
✅ 数据库清理完成！
```

然后运行验证脚本：

```bash
node scripts/verify-database-cleanup.mjs
```

## 📋 清理内容

### 删除的表（空表）
- ❌ `user_usage_logs` - 与 `token_usage_records` 重复
- ❌ `user_brand_library` - 与 `user_brand_corpus` 重复

### 删除的字段
- ❌ `token_usage_records.timestamp` - 与 `created_at` 重复

### 添加的字段
- ✅ `usage_count_records.created_at` - 统一字段命名

## ✅ 完成后

1. 运行验证脚本确认清理成功
2. 测试使用统计功能
3. 提交代码更改

---

**注意**: 这是安全操作，只删除空表和重复字段，不会影响现有数据。


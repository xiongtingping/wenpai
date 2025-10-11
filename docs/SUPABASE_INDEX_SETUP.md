# Supabase数据库索引配置指南

## 🎯 目的
解决订阅查询性能问题（20秒 → <100ms）

## ⚠️ 当前问题
控制台出现大量"Supabase订阅查询较慢"警告，查询时间达到20秒，严重影响用户体验。

## 🔧 解决方案：添加数据库索引

### 1. 登录Supabase Dashboard
访问: https://supabase.com/dashboard

### 2. 进入SQL Editor
1. 选择你的项目
2. 点击左侧菜单 "SQL Editor"
3. 点击 "New query"

### 3. 执行索引创建SQL

```sql
-- 订阅查询优化索引
-- 用途: 优化user_subscriptions表的查询性能
-- 影响: user_id + status + created_at的联合查询将大幅加速

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_lookup
ON user_subscriptions(user_id, status, created_at DESC);

-- 验证索引创建成功
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'user_subscriptions'
ORDER BY indexname;
```

### 4. 预期效果

**优化前**：
- 查询时间: 20秒
- 数据库: 全表扫描
- 用户体验: 页面加载缓慢

**优化后**：
- 查询时间: <100ms（200倍加速）
- 数据库: 索引查找
- 用户体验: 即时响应

### 5. 验证索引效果

在Supabase SQL Editor中运行：

```sql
-- 查看查询执行计划（优化前应该是Seq Scan，优化后是Index Scan）
EXPLAIN ANALYZE
SELECT user_id, tier, status, expires_at, created_at, updated_at
FROM user_subscriptions
WHERE user_id = '你的用户ID'
  AND status = 'active'
ORDER BY created_at DESC
LIMIT 1;
```

## 📊 技术细节

### 索引结构
- **字段1**: `user_id` - 用户唯一标识
- **字段2**: `status` - 订阅状态（active/expired）
- **字段3**: `created_at DESC` - 创建时间降序

### 为什么这个索引有效？
我们的查询模式：
```sql
WHERE user_id = ? AND status = 'active'
ORDER BY created_at DESC
LIMIT 1
```

索引字段顺序与查询完全匹配，PostgreSQL可以：
1. 通过user_id快速定位
2. 在结果中过滤status='active'
3. 利用索引中的排序，无需额外排序
4. 直接返回第一条记录

## 🔒 安全注意事项
- ✅ 索引不会影响现有数据
- ✅ 使用`IF NOT EXISTS`避免重复创建
- ✅ 不会影响写入性能（订阅写入频率很低）
- ⚠️ 如果有大量数据，创建索引可能需要几秒钟

## 🎯 监控与维护

### 查看索引大小
```sql
SELECT
  pg_size_pretty(pg_relation_size('idx_user_subscriptions_lookup')) as index_size;
```

### 删除索引（如果需要）
```sql
DROP INDEX IF EXISTS idx_user_subscriptions_lookup;
```

## 📝 相关文档
- [Supabase索引最佳实践](https://supabase.com/docs/guides/database/postgres/indexes)
- [PostgreSQL索引类型](https://www.postgresql.org/docs/current/indexes-types.html)
- [项目性能优化文档](./SUBSCRIPTION_PERFORMANCE_OPTIMIZATION.md)

## ✅ 完成清单
- [ ] 登录Supabase Dashboard
- [ ] 打开SQL Editor
- [ ] 执行索引创建SQL
- [ ] 验证索引创建成功
- [ ] 查看执行计划确认使用索引
- [ ] 在应用中测试查询性能
- [ ] 确认控制台不再出现慢查询警告

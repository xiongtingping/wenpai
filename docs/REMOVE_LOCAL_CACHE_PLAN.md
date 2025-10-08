# 🚨 移除本地缓存 - 强制云端数据源

## 问题根因

**当前架构问题**:
1. ❌ 订阅状态使用 localStorage 缓存
2. ❌ 使用统计使用本地缓存
3. ❌ Token 使用量使用本地缓存
4. ❌ 用户等级从缓存读取，不是实时查询数据库

**导致的问题**:
- 用户升级后，前端仍显示旧的订阅等级
- 使用统计不更新
- 刷新页面也不会更新（因为读取的是缓存）

## 修复方案

### 原则
1. ✅ **所有订阅数据必须从 Supabase 实时查询**
2. ✅ **所有使用统计必须从 Supabase 实时查询**
3. ✅ **禁止使用 localStorage 缓存订阅和使用数据**
4. ✅ **每次页面加载都重新查询数据库**
5. ✅ **写入操作直接写入数据库，不经过本地缓存**

### 需要修改的文件

#### 1. useSubscriptionStatus.ts
**当前问题**: 使用 localStorage 缓存订阅状态
```typescript
// ❌ 错误：从缓存读取
const cached = localStorage.getItem(`subscription_status_${targetUserId}`);
```

**修复方案**: 移除所有缓存逻辑，每次都查询数据库
```typescript
// ✅ 正确：直接查询数据库
const { data, error } = await supabase
  .from('user_subscriptions')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'active')
  .gt('expires_at', now)
  .single();
```

#### 2. subscriptionSyncService.ts
**当前问题**: 查询后可能被缓存
**修复方案**: 确保每次都是新的查询

#### 3. useUnifiedUsageStats.ts
**当前问题**: 
- 从 localStorage 读取用户等级
- 使用本地缓存的使用统计

**修复方案**:
- 移除 localStorage 读取逻辑
- 每次都从数据库查询订阅等级
- 使用统计直接从 user_usage_logs 表查询

#### 4. unifiedUsageDataManager.ts
**当前问题**: 使用本地缓存管理使用统计

**修复方案**:
- 移除所有本地缓存逻辑
- 直接操作 Supabase 表
- 每次读取都查询数据库

#### 5. unified-state-store.ts
**当前问题**: 使用 localStorage 持久化

**修复方案**:
- 移除订阅相关的 localStorage 持久化
- 仅在内存中保存状态
- 每次需要时从数据库查询

## 实施步骤

### Phase 1: 移除订阅状态缓存 (CRITICAL)
1. ✅ 修改 `useSubscriptionStatus.ts`
   - 移除 localStorage 缓存读取
   - 移除缓存写入
   - 每次都查询数据库

2. ✅ 修改 `subscriptionSyncService.ts`
   - 确保查询是实时的
   - 移除任何缓存逻辑

3. ✅ 修改 `useUnifiedUsageStats.ts`
   - 移除从 localStorage 读取 tier 的逻辑
   - 强制从数据库查询订阅状态

### Phase 2: 移除使用统计缓存 (HIGH)
1. ✅ 修改 `unifiedUsageDataManager.ts`
   - 移除本地缓存
   - 所有读取直接查询 user_usage_logs 表
   - 所有写入直接写入数据库

2. ✅ 修改 `useUnifiedUsageStats.ts`
   - 移除使用统计的本地缓存
   - 每次刷新都查询数据库

### Phase 3: 清理 Store 持久化 (MEDIUM)
1. ✅ 修改 `unified-state-store.ts`
   - 移除订阅相关的 persist 配置
   - 仅保留必要的用户基本信息

## 性能优化

虽然移除缓存，但可以通过以下方式优化性能：

1. **React Query / SWR**: 使用短期内存缓存（5-10秒）
2. **防抖**: 避免频繁查询
3. **批量查询**: 一次查询获取所有需要的数据
4. **索引优化**: 确保数据库查询有适当的索引

## 验证清单

修复后必须验证：
- [ ] 用户升级后，立即刷新页面能看到新的订阅等级
- [ ] 使用统计实时更新
- [ ] 不再从 localStorage 读取订阅数据
- [ ] 浏览器控制台显示数据库查询日志
- [ ] 清除浏览器缓存后，数据仍然正确

## 风险评估

**低风险**:
- 数据始终来自数据库，保证一致性
- 不会出现缓存不同步问题

**需要注意**:
- 可能增加数据库查询次数
- 需要确保查询性能
- 需要处理网络错误情况

## 回滚计划

如果出现问题：
1. 恢复缓存逻辑
2. 但添加强制刷新机制
3. 在关键操作后清除缓存


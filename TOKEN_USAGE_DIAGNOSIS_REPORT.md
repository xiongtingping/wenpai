# Token使用量显示异常 - 系统性诊断报告

## 📊 问题概述

**症状**: Token使用量显示为"已使用 0 tokens，剩余 100.0K tokens"  
**影响**: 所有用户无法看到真实的Token消耗情况  
**严重性**: CRITICAL - 影响用户体验和限额管理  

---

## 🔍 5W1H 根因分析

### What（问题现象）
- UI显示Token使用量始终为0
- 实际已进行多次AI调用（内容适配、标题生成等）
- 刷新按钮无效，数据不更新
- 影响范围：个人资料页、内容适配器页等多处

### When（触发时机）
- 用户登录后查看个人资料
- 执行AI功能后查看统计
- 手动刷新统计数据时

### Where（问题位置）
- **UI层**: `src/components/profile/TokenUsageSection.tsx`
- **状态层**: `src/stores/unified-state-store.ts` (tokenUsage.currentStats)
- **服务层**: `src/services/tokenUsageService.ts` (getUserTokenStats)
- **数据层**: Supabase `user_usage_logs` 表

### Who（受影响对象）
- 所有用户（trial/pro/premium）
- Token统计显示组件
- 限额检查逻辑（可能受影响）

### Why（根本原因 - 待验证）
见下方根因候选清单

### How（解决方案）
见下方系统性修复方案

---

## 🎯 根因候选清单（按概率排序）

### 候选1: 状态初始化缺失 ⭐⭐⭐⭐⭐ (概率: 85%)

**假设**: `unified-state-store` 的 `tokenUsage.currentStats` 从未被正确初始化

**触发条件**:
- 用户登录后 `initializeUsageStats` 未被调用
- 或调用了但只更新 `usageCount`，未更新 `tokenUsage`

**证据**:
```typescript
// unified-state-store.ts
const initialTokenUsageState: TokenUsageState = {
  currentStats: null,  // ⚠️ 初始值为null
  usageHistory: [],
  featureStats: {},
};

// useTokenStats.ts
export function useTokenStats() {
  return {
    monthlyUsed: tokenStats?.monthlyUsed || 0,  // ⚠️ null时默认为0
    monthlyLimit: tokenStats?.monthlyLimit || 0,
  };
}
```

**验证方法**:
1. 检查浏览器控制台日志：`initializeUsageStats` 是否被调用
2. 检查 `unified-state-store` 的 `tokenUsage.currentStats` 值
3. 检查 `updateTokenStats` 是否在查询后被调用

**修复优先级**: 🔴 CRITICAL

---

### 候选2: 数据库查询失败 ⭐⭐⭐⭐ (概率: 60%)

**假设**: `getUserTokenStats` 查询Supabase时失败或返回空数据

**触发条件**:
- 表名不匹配（`user_usage_logs` vs `token_usage_records`）
- 字段名不匹配（`total_tokens` vs `totalTokens`）
- 用户ID类型不匹配（UUID vs VARCHAR）
- RLS策略阻止查询

**证据**:
```sql
-- database_migration_token_fix.sql
ALTER TABLE token_usage_records ALTER COLUMN user_id TYPE VARCHAR(100);
ALTER TABLE token_usage_records DISABLE ROW LEVEL SECURITY;
```

```typescript
// tokenUsageService.ts
const { data: monthlyData, error: monthlyError } = await client
  .from(TABLE_NAMES.USER_USAGE_LOGS)  // ⚠️ 表名
  .select('*')
  .eq('user_id', userId);  // ⚠️ 字段名

const monthlyUsed = monthlyRecords.data.reduce((sum, record: any) => {
  const tokens = record.total_tokens || record.totalTokens || 0;  // ⚠️ 兼容两种命名
  return sum + tokens;
}, 0);
```

**验证方法**:
1. 直接查询Supabase数据库：`SELECT * FROM user_usage_logs WHERE user_id = 'xxx'`
2. 检查表结构和字段名
3. 检查RLS策略是否启用
4. 查看控制台是否有Supabase错误日志

**修复优先级**: 🔴 CRITICAL

---

### 候选3: 事件系统失效 ⭐⭐⭐ (概率: 40%)

**假设**: `tokenUsageUpdated` 事件触发但刷新逻辑未执行

**触发条件**:
- 事件监听器注册时机错误
- `handleRefresh` 函数依赖缺失
- 重复注册导致冲突

**证据**:
```typescript
// TokenUsageSection.tsx - 重复的事件监听器
useEffect(() => {
  window.addEventListener('tokenUsageUpdated', handleTokenUsageUpdate);
  // ...
}, []); // ⚠️ 第一次注册

useEffect(() => {
  window.addEventListener('tokenUsageUpdated', handleTokenUsageUpdate);
  // ...
}, [handleRefresh]); // ⚠️ 第二次注册，依赖handleRefresh
```

**验证方法**:
1. 检查控制台是否有 "📢 已触发Token使用量更新事件" 日志
2. 检查 "🔄 自动刷新Token使用量统计..." 日志
3. 检查事件监听器数量

**修复优先级**: 🟡 HIGH

---

### 候选4: 缓存污染 ⭐⭐ (概率: 30%)

**假设**: `unifiedUsageDataManager` 缓存返回过期的默认值

**触发条件**:
- 缓存键冲突
- 缓存未过期但数据已更新
- 默认值生成逻辑错误

**证据**:
```typescript
// unifiedUsageDataManager.ts
async getTokenUsageStats(userId: string, userTier: SubscriptionTier) {
  const cacheKey = `token-stats-${userId}-${userTier}`;
  const cached = this.getFromCache<TokenUsageStats>(cacheKey);
  if (cached) {
    return cached;  // ⚠️ 直接返回缓存
  }
  // ...
  return this.generateDefaultTokenStats(userId, userTier);  // ⚠️ 降级到默认值
}
```

**验证方法**:
1. 清除localStorage和内存缓存
2. 检查缓存键是否正确
3. 检查缓存过期时间（60秒）

**修复优先级**: 🟡 MEDIUM

---

### 候选5: 数据写入失败 ⭐ (概率: 20%)

**假设**: `recordTokenUsage` 虽不抛异常但实际未写入数据库

**触发条件**:
- Supabase连接失败
- 主键冲突（虽已修复ID生成）
- 权限问题

**证据**:
```typescript
// tokenUsageService.ts
async recordTokenUsage(record) {
  try {
    const databaseSuccess = await this.safeInsertTokenRecord(fullRecord);
    if (!databaseSuccess) {
      throw new Error('Supabase数据库保存失败');
    }
  } catch (error) {
    logger.error('❌ Token使用量记录失败(不阻断主流程):', error);
    return;  // ⚠️ 不抛异常，静默失败
  }
}
```

**验证方法**:
1. 检查Supabase数据库是否有新记录
2. 检查控制台是否有 "❌ Token使用量记录失败" 日志
3. 检查 `safeInsertTokenRecord` 返回值

**修复优先级**: 🟢 LOW（已有重试机制）

---

## 🔧 验证计划（按优先级执行）

### 阶段1: 数据源验证（最高优先级）

**目标**: 确认Supabase数据库中是否有Token使用记录

**步骤**:
1. 直接查询Supabase数据库
2. 检查表结构和字段名
3. 验证用户ID格式
4. 检查RLS策略

**预期结果**: 
- 如果有记录 → 问题在查询或状态更新层
- 如果无记录 → 问题在数据写入层

---

### 阶段2: 状态管理验证

**目标**: 确认状态初始化和更新逻辑

**步骤**:
1. 添加详细日志到 `initializeUsageStats`
2. 添加详细日志到 `updateTokenStats`
3. 检查 `useTokenStats` 返回值
4. 检查 `unified-state-store` 持久化数据

**预期结果**:
- 确认状态是否被正确初始化
- 确认状态是否被正确更新

---

### 阶段3: 事件系统验证

**目标**: 确认事件触发和监听机制

**步骤**:
1. 检查 `tokenUsageUpdated` 事件触发日志
2. 检查事件监听器注册日志
3. 检查 `handleRefresh` 执行日志
4. 修复重复注册问题

---

## 📝 下一步行动

1. **立即执行**: 添加诊断日志到关键路径
2. **数据验证**: 查询Supabase数据库确认数据存在性
3. **状态检查**: 检查unified-state-store的实际值
4. **系统性修复**: 基于验证结果实施修复方案
5. **回归测试**: 在开发和生产环境验证修复效果

---

**报告生成时间**: 2025-10-05  
**分析方法**: 5W1H + 概率评估 + 系统性排查  
**下一步**: 执行验证计划并实施修复


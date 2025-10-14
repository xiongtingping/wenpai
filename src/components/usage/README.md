# 使用统计优化方案

## 概述

本优化方案实现了一套完整的状态管理和UI渲染策略，解决了使用统计显示中的以下问题：
- 初次加载直接显示错误状态
- 数据刷新时UI闪烁
- 旧缓存覆盖新数据
- 频繁的订阅状态变化导致抖动

## 架构设计

### 5层优化策略

```
┌─────────────────────────────────────────────────────────────┐
│ 1. UI层：Loading/Skeleton状态                                │
│    - 初次加载显示骨架屏                                        │
│    - 避免直接渲染错误状态                                      │
│    - 平滑的加载体验                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. 缓存层：Stale-While-Revalidate                            │
│    - 先展示缓存数据（如果存在）                                │
│    - 后台异步刷新                                             │
│    - 刷新完成后平滑更新UI                                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. 状态层：版本号控制                                         │
│    - 每次更新递增版本号                                        │
│    - 只接受版本号更大的数据                                    │
│    - 防止旧缓存覆盖新数据                                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. 服务层：Debounce/Throttle                                 │
│    - Debounce刷新请求（300ms）                                │
│    - Throttle消费操作（1000ms）                               │
│    - 控制频繁的状态变化                                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. 事件层：原子更新                                           │
│    - 乐观更新：立即反馈用户操作                                │
│    - 后台验证：异步确认真实状态                                │
│    - 事务锁：保证多源回写一致性                                │
└─────────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. useStaleWhileRevalidate

**文件**: `src/hooks/useStaleWhileRevalidate.ts`

**功能**: 实现SWR缓存策略

**特性**:
- 内存缓存
- 版本号控制
- 自动重新验证（30秒间隔）
- 窗口聚焦时刷新
- 数据比较函数

**用法**:
```typescript
const { data, isLoading, isStale, refresh } = useStaleWhileRevalidate({
  key: 'usage-stats',
  fetcher: async () => await fetchData(),
  revalidateInterval: 30000,
  compare: (old, new) => old.version < new.version
});
```

### 2. useOptimizedUsageStats

**文件**: `src/hooks/useOptimizedUsageStats.ts`

**功能**: 优化的使用统计Hook

**特性**:
- 基于SWR的数据获取
- 版本号防止旧数据覆盖
- Debounce/Throttle控制更新频率
- 乐观更新用户操作
- 自动事件监听

**返回值**:
```typescript
{
  // 数据
  tokenStats: TokenUsageStats | null;
  usageCountStats: UsageCountStats;
  extendedStats: ExtendedStats;
  userTier: SubscriptionTier;

  // 状态
  isInitialLoading: boolean;  // 首次加载
  isRefreshing: boolean;       // 后台刷新
  isStale: boolean;            // 是否缓存数据
  error: Error | null;
  lastUpdated: string | null;

  // 操作
  refresh: () => Promise<void>;
  consumeUsage: (amount?: number) => Promise<boolean>;
}
```

### 3. UsageStatsSkeleton

**文件**: `src/components/usage/UsageStatsSkeleton.tsx`

**功能**: 骨架屏组件集合

**组件**:
- `UsageStatsCardSkeleton`: 卡片骨架屏
- `UsageCountInlineSkeleton`: 内联骨架屏
- `TokenStatsInlineSkeleton`: Token统计骨架屏
- `UsageStatsGridSkeleton`: 网格骨架屏

### 4. OptimizedUsageDisplay

**文件**: `src/components/usage/OptimizedUsageDisplay.tsx`

**功能**: 优化的使用统计显示组件

**组件**:
- `OptimizedUsageDisplay`: 完整的使用统计卡片
- `OptimizedUsageCountInline`: 紧凑的内联显示

**特性**:
- 首次加载显示骨架屏
- 后台刷新时显示加载指示器
- 缓存数据时显示徽章提示
- 平滑的数据过渡动画
- 友好的错误提示

## 使用指南

### 在AI内容适配器中使用

```typescript
import { OptimizedUsageCountInline } from '@/components/usage/OptimizedUsageDisplay';
import { useOptimizedUsageStats } from '@/hooks/useOptimizedUsageStats';

function ContentAdapterPage() {
  // 获取优化后的统计数据
  const { consumeUsage, isInitialLoading } = useOptimizedUsageStats();

  // 在工具栏显示使用次数
  return (
    <div className="toolbar">
      <OptimizedUsageCountInline userTier="premium" />

      <Button
        onClick={async () => {
          // 消费使用次数（带节流保护）
          const success = await consumeUsage(1);
          if (success) {
            // 执行生成操作
          }
        }}
        disabled={isInitialLoading}
      >
        生成内容
      </Button>
    </div>
  );
}
```

### 在个人中心使用

```typescript
import { OptimizedUsageDisplay } from '@/components/usage/OptimizedUsageDisplay';

function ProfilePage() {
  const handleUpgrade = () => {
    // 跳转到升级页面
  };

  return (
    <div className="profile-stats">
      <OptimizedUsageDisplay
        userTier="trial"
        showDetails={true}
        showRefreshButton={true}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
```

## 性能优化

### 1. 缓存策略
- 内存缓存：避免重复请求
- SWR策略：先展示旧值，后台更新
- 30秒自动刷新：保持数据新鲜度

### 2. 更新控制
- Debounce刷新（300ms）：合并连续请求
- Throttle消费（1000ms）：防止重复操作
- 版本号控制：防止旧数据覆盖

### 3. UI优化
- 骨架屏：改善首次加载体验
- 乐观更新：立即反馈用户操作
- 平滑过渡：避免UI抖动

## 数据流

```
用户操作
   ↓
乐观更新UI（立即反馈）
   ↓
调用API（后台）
   ↓
版本号检查
   ↓
更新缓存
   ↓
触发UI更新（如果数据变化）
   ↓
通知其他组件
```

## 测试建议

### 场景1：首次加载
1. 清除缓存
2. 刷新页面
3. 应该看到骨架屏 → 真实数据

### 场景2：后台刷新
1. 页面已加载
2. 等待30秒
3. 应该看到刷新指示器，数据平滑更新

### 场景3：消费操作
1. 点击生成按钮
2. 应该立即看到使用次数+1
3. 500ms后后台验证完成

### 场景4：并发操作
1. 快速连续点击生成按钮
2. 节流机制应该限制为1秒1次
3. 避免重复消费

### 场景5：旧数据覆盖
1. 触发两次刷新请求
2. 第二次请求先返回
3. 第一次请求返回时应该被丢弃

## 迁移指南

### 从useUnifiedUsageStats迁移

**Before:**
```typescript
import { useUnifiedUsageStats } from '@/hooks/useUnifiedUsageStats';

const {
  usageCountStats,
  loading,
  refreshUsageCountStats
} = useUnifiedUsageStats(userTier);

if (loading) return <div>加载中...</div>;
```

**After:**
```typescript
import { useOptimizedUsageStats } from '@/hooks/useOptimizedUsageStats';
import { UsageStatsCardSkeleton } from '@/components/usage/UsageStatsSkeleton';

const {
  usageCountStats,
  isInitialLoading,
  refresh
} = useOptimizedUsageStats(userTier);

if (isInitialLoading) return <UsageStatsCardSkeleton />;
```

## 常见问题

### Q: 为什么使用内存缓存而不是localStorage?
A: 内存缓存速度更快，且避免了localStorage的配额限制和序列化开销。对于使用统计这种频繁更新的数据，内存缓存更合适。

### Q: 版本号会不会溢出?
A: 理论上会，但JavaScript的Number类型可以安全表示到2^53-1，按每秒100次更新计算，需要285万年才会溢出。

### Q: 如何清除缓存?
A: 使用`clearSWRCache(key)`清除指定缓存，或`clearAllSWRCache()`清除所有缓存。

### Q: 如何禁用自动刷新?
A: 将`revalidateInterval`设为0或负数即可禁用自动刷新。

## 未来优化

1. **持久化缓存**: 支持IndexedDB持久化
2. **离线支持**: PWA离线可用
3. **实时同步**: WebSocket实时推送
4. **智能预取**: 根据用户行为预取数据
5. **A/B测试**: 不同刷新策略的效果对比

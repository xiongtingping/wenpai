# 使用统计优化 - 快速启动指南

## 🚀 5分钟快速集成

### 步骤1：在AI内容适配器中添加使用次数显示

**文件**: `src/features/content-adapter/components/ContentAdapterPage.tsx`

```typescript
// 1. 导入优化组件
import { OptimizedUsageCountInline } from '@/components/usage/OptimizedUsageDisplay';
import { useOptimizedUsageStats } from '@/hooks/useOptimizedUsageStats';

// 2. 在组件中使用
function ContentAdapterPage() {
  const { consumeUsage, isInitialLoading } = useOptimizedUsageStats();

  // 3. 在工具栏显示使用次数
  return (
    <div className="toolbar flex items-center justify-between">
      <div className="actions">
        <Button onClick={handleGenerate}>生成内容</Button>
      </div>

      {/* ✅ 添加这一行即可 */}
      <OptimizedUsageCountInline />
    </div>
  );
}
```

### 步骤2：在个人中心添加详细统计

**文件**: `src/pages/ProfilePage.tsx`

```typescript
// 1. 导入优化组件
import { OptimizedUsageDisplay } from '@/components/usage/OptimizedUsageDisplay';

// 2. 在个人中心使用
function ProfilePage() {
  const handleUpgrade = () => {
    router.push('/pricing');
  };

  return (
    <div className="profile-stats">
      {/* ✅ 添加这一段即可 */}
      <OptimizedUsageDisplay
        showDetails={true}
        showRefreshButton={true}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
```

### 步骤3：集成使用次数消费逻辑

**文件**: `src/features/content-adapter/components/GenerationControls.tsx`

```typescript
import { useOptimizedUsageStats } from '@/hooks/useOptimizedUsageStats';
import { useToast } from '@/hooks/use-toast';

function GenerationControls() {
  const { consumeUsage, usageCountStats, userTier } = useOptimizedUsageStats();
  const { toast } = useToast();

  const handleGenerate = async () => {
    // ✅ 1. 检查使用次数
    if (userTier !== 'premium' && usageCountStats.remainingUses <= 0) {
      toast({
        title: '使用次数已用完',
        description: '请升级套餐以继续使用',
        variant: 'destructive'
      });
      return;
    }

    // ✅ 2. 消费使用次数（自动节流保护）
    const success = await consumeUsage(1);
    if (!success) {
      toast({
        title: '操作失败',
        description: '使用次数扣减失败',
        variant: 'destructive'
      });
      return;
    }

    // ✅ 3. 执行生成操作
    try {
      await generateContent();
      toast({ title: '生成成功' });
    } catch (error) {
      toast({
        title: '生成失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <Button onClick={handleGenerate}>
      生成内容
    </Button>
  );
}
```

## 📋 完整功能清单

### ✅ 已实现的功能

#### UI层
- [x] Skeleton加载状态
- [x] 友好的错误提示
- [x] 平滑的数据过渡
- [x] 缓存数据标识
- [x] 后台刷新指示器

#### 缓存层
- [x] 内存缓存系统
- [x] Stale-while-revalidate策略
- [x] 30秒自动刷新
- [x] 窗口聚焦刷新

#### 状态层
- [x] 版本号控制
- [x] 防止旧数据覆盖
- [x] 原子更新保证

#### 服务层
- [x] Debounce刷新（300ms）
- [x] Throttle消费（1000ms）
- [x] 请求合并优化

#### 事件层
- [x] 乐观更新
- [x] 后台验证
- [x] 事件防抖处理

## 🎯 使用场景

### 场景1：工具栏显示使用次数

```typescript
<header className="toolbar">
  <OptimizedUsageCountInline />
</header>
```

**效果**：
- 首次加载显示skeleton
- 显示实时使用次数
- 后台自动刷新
- 点击可刷新

### 场景2：侧边栏详细统计

```typescript
<aside className="sidebar">
  <OptimizedUsageDisplay
    showDetails={true}
    showRefreshButton={true}
  />
</aside>
```

**效果**：
- 显示完整统计信息
- Token使用量进度条
- 扩展统计（节省时间、生成内容）
- 手动刷新按钮
- 升级套餐按钮

### 场景3：消费使用次数

```typescript
const { consumeUsage } = useOptimizedUsageStats();

// 单次消费
await consumeUsage(1);

// 批量消费
await consumeUsage(3);
```

**特性**：
- 自动节流保护（1秒1次）
- 乐观更新（立即反馈）
- 后台验证（500ms后）
- 原子操作保证

### 场景4：检查剩余次数

```typescript
const { usageCountStats, userTier } = useOptimizedUsageStats();

if (userTier !== 'premium' && usageCountStats.remainingUses < platformCount) {
  // 提示用户次数不足
  showUpgradeDialog();
  return;
}
```

## 🔧 配置选项

### SWR配置

```typescript
useStaleWhileRevalidate({
  key: 'usage-stats',
  fetcher: fetchStats,
  revalidateInterval: 30000,      // 刷新间隔（毫秒）
  revalidateOnMount: true,        // 挂载时刷新
  revalidateOnFocus: true,        // 聚焦时刷新
  compare: (old, new) => {...}    // 数据比较函数
});
```

### 防抖/节流配置

```typescript
// Debounce刷新
const debouncedRefresh = debounce(refresh, 300);  // 300ms

// Throttle消费
const throttledConsume = throttle(consume, 1000);  // 1000ms
```

## 📊 性能指标

### 首次加载
- Skeleton显示: < 50ms
- 缓存数据显示: < 200ms
- API数据返回: < 2s

### 数据刷新
- 后台刷新: 用户无感知
- 缓存命中: < 10ms
- 版本检查: < 1ms

### 操作响应
- 乐观更新: 立即反馈
- 节流保护: 1s内只允许1次
- 防抖合并: 300ms内多次请求合并为1次

## 🐛 常见问题

### Q1: 为什么显示"缓存"徽章？
A: 这是正常现象，表示当前显示的是缓存数据，后台正在刷新最新数据。数据刷新完成后徽章会自动消失。

### Q2: 使用次数不同步怎么办？
A: 点击刷新按钮手动刷新，或等待30秒自动刷新。如果问题持续，可能是网络问题。

### Q3: 如何清除缓存？
A:
```typescript
import { clearSWRCache, clearAllSWRCache } from '@/hooks/useStaleWhileRevalidate';

// 清除指定缓存
clearSWRCache('usage-stats-user123');

// 清除所有缓存
clearAllSWRCache();
```

### Q4: 如何禁用自动刷新？
A:
```typescript
useStaleWhileRevalidate({
  revalidateInterval: 0,  // 禁用自动刷新
  revalidateOnFocus: false  // 禁用聚焦刷新
});
```

### Q5: 可以修改节流时间吗？
A: 可以，但需要修改源码。建议值：
- Debounce刷新: 300-500ms
- Throttle消费: 1000-2000ms

## 🎨 自定义样式

### 修改骨架屏样式

```typescript
<UsageStatsCardSkeleton
  className="custom-skeleton"
  showDetails={false}
/>
```

### 修改显示组件样式

```typescript
<OptimizedUsageDisplay
  className="custom-stats"
  showDetails={true}
/>
```

## 📝 调试技巧

### 开启详细日志

```typescript
// 在浏览器控制台
localStorage.setItem('debug', 'usage-stats:*');

// 查看SWR日志
[SWR] 从缓存加载数据: usage-stats-user123
[SWR] 开始验证: usage-stats-user123 (v5)
[SWR] 数据更新成功: usage-stats-user123 (duration: 1234ms)
```

### 监控版本号

```typescript
// 在组件中
const { lastUpdated } = useOptimizedUsageStats();
console.log('最后更新:', lastUpdated);
```

### 检查缓存状态

```typescript
const { isStale, isValidating } = useOptimizedUsageStats();
console.log({
  isStale,        // true = 缓存数据
  isValidating    // true = 正在刷新
});
```

## 🚦 上线检查清单

### 部署前
- [ ] 运行类型检查: `npm run type-check`
- [ ] 运行测试: `npm test`
- [ ] 检查控制台无错误
- [ ] 验证所有页面正常加载

### 部署后
- [ ] 验证首次加载显示skeleton
- [ ] 验证缓存数据正常显示
- [ ] 验证后台刷新无闪烁
- [ ] 验证使用次数消费正常
- [ ] 验证手动刷新功能
- [ ] 验证错误提示友好

## 🎓 学习资源

- [完整文档](./src/components/usage/README.md)
- [集成示例](./src/features/content-adapter/components/UsageStatsIntegration.example.tsx)
- [优化总结](./SUBSCRIPTION_OPTIMIZATION_SUMMARY.md)

## 💡 最佳实践

1. **总是使用OptimizedUsageStats**
   - 不要直接调用API
   - 利用缓存和防抖机制

2. **合理处理加载状态**
   - 首次加载显示skeleton
   - 错误时提供重试选项

3. **正确消费使用次数**
   - 先检查剩余次数
   - 使用节流保护
   - 失败时提示用户

4. **监控性能指标**
   - 定期查看刷新频率
   - 检查内存使用
   - 优化刷新策略

## 📞 支持

如有问题，请：
1. 查看[完整文档](./src/components/usage/README.md)
2. 搜索[常见问题](#常见问题)
3. 提交Issue到项目仓库

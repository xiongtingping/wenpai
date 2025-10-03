# 📊 Token跟踪系统 v2.0

**全新重构的Token使用量跟踪系统**,解决了旧架构的数据不一致、职责混乱等问题。

## 🎯 核心原则

1. **Single Source of Truth (SSOT)** - Supabase是唯一真实数据源
2. **Single Responsibility (SRP)** - 每个类只负责一件事
3. **Fail-Closed** - 错误时拒绝请求,不静默降级
4. **Cache-aside** - 缓存仅用于性能优化

## 📁 目录结构

```
src/services/token-tracking/
├── core/                         # 核心业务逻辑
│   ├── TokenRecorder.ts          # Token使用记录器
│   ├── TokenStatsQuery.ts        # Token统计查询器
│   └── TokenLimitChecker.ts      # Token限额检查器
│
├── cache/                        # 缓存管理
│   ├── TokenCacheManager.ts      # 内存缓存管理器
│   └── OfflineQueueManager.ts    # 离线队列管理器
│
├── utils/                        # 工具函数
│   ├── tokenEstimator.ts         # Token估算工具
│   └── dbConverter.ts            # 数据库字段转换工具
│
├── types.ts                      # 类型定义
├── config.ts                     # 配置常量
├── index.ts                      # 统一导出接口
└── README.md                     # 本文档
```

## 🚀 快速开始

### 基础用法

```typescript
import { tokenTracking } from '@/services/token-tracking';

// 1. 记录Token使用
await tokenTracking.recordUsage({
  userId: 'user123',
  feature: 'content-adapter',
  taskType: 'generate',
  inputTokens: 800,
  outputTokens: 1200,
  model: 'gpt-4',
  success: true
});

// 2. 查询统计
const stats = await tokenTracking.getStats({
  userId: 'user123',
  userTier: 'pro'
});

console.log(`已使用: ${stats.monthlyUsed}/${stats.monthlyLimit}`);
console.log(`使用率: ${stats.usagePercentage.toFixed(1)}%`);

// 3. 限额检查 (调用AI前)
const limitCheck = await tokenTracking.checkLimit('user123', 'pro', 1000);

if (!limitCheck.allowed) {
  throw new Error(limitCheck.reason);
}

// 4. 调用AI (略)
const aiResponse = await callAI(...);

// 5. 记录实际使用
await tokenTracking.recordUsage({
  userId: 'user123',
  feature: 'chat',
  taskType: 'conversation',
  inputTokens: aiResponse.usage.promptTokens,
  outputTokens: aiResponse.usage.completionTokens,
  model: aiResponse.model,
  success: true
});
```

### 高级用法

#### 批量记录

```typescript
const requests = [
  { userId: 'user123', feature: 'chat', taskType: 'qa', inputTokens: 100, outputTokens: 200, model: 'gpt-4', success: true },
  { userId: 'user123', feature: 'chat', taskType: 'qa', inputTokens: 150, outputTokens: 250, model: 'gpt-4', success: true }
];

const successCount = await tokenTracking.recordBatch(requests);
console.log(`批量记录成功: ${successCount}/${requests.length}`);
```

#### 使用缓存

```typescript
// 优先从缓存读取 (30秒TTL)
const stats1 = await tokenTracking.getStats({ userId, userTier });

// 强制从数据库刷新
const stats2 = await tokenTracking.getStats({ userId, userTier, forceRefresh: true });
```

#### 离线支持

```typescript
// 离线时自动添加到队列
try {
  await tokenTracking.recordUsage({...});
} catch (error) {
  if (error.message.includes('离线')) {
    console.log('已添加到离线队列,网络恢复后自动同步');
  }
}

// 手动处理离线队列
const result = await tokenTracking.processOfflineQueue();
console.log(`同步结果: ${result.success}成功, ${result.failed}失败`);

// 查看队列状态
const status = tokenTracking.getOfflineQueueStatus();
console.log(`队列中有${status.size}条记录待同步`);
```

## 🔧 API文档

### tokenTracking

#### 记录Token使用

**`recordUsage(request: TokenRecordRequest): Promise<TokenUsageRecord>`**

记录单次Token使用。

```typescript
const record = await tokenTracking.recordUsage({
  userId: 'user123',
  feature: 'content-adapter',
  taskType: 'generate',
  inputTokens: 800,
  outputTokens: 1200,
  model: 'gpt-4',
  contentSummary: '生成了一篇关于...',
  success: true
});

console.log('记录ID:', record.id);
```

**`recordBatch(requests: TokenRecordRequest[]): Promise<number>`**

批量记录Token使用。

```typescript
const successCount = await tokenTracking.recordBatch(requests);
```

#### 查询统计

**`getStats(query: TokenStatsQuery): Promise<TokenStats>`**

获取Token统计数据。

```typescript
const stats = await tokenTracking.getStats({
  userId: 'user123',
  userTier: 'pro',
  forceRefresh: false // 可选,默认使用缓存
});

// 返回:
// {
//   userId: 'user123',
//   userTier: 'pro',
//   monthlyLimit: 200000,
//   monthlyUsed: 45000,
//   monthlyRemaining: 155000,
//   dailyUsed: 5000,
//   usagePercentage: 22.5,
//   needUpgrade: false,
//   statsTime: '2025-01-09T...',
//   source: 'cache' | 'database'
// }
```

**`getHistory(query: TokenHistoryQuery): Promise<TokenUsageRecord[]>`**

获取Token使用历史。

```typescript
const history = await tokenTracking.getHistory({
  userId: 'user123',
  limit: 20,
  offset: 0,
  feature: 'content-adapter', // 可选,按功能筛选
  timeRange: { // 可选,按时间范围筛选
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-01-31T23:59:59Z'
  }
});
```

**`getStatsByFeature(userId, userTier): Promise<Record<string, FeatureStats>>`**

按功能分组统计。

```typescript
const featureStats = await tokenTracking.getStatsByFeature('user123', 'pro');

// 返回:
// {
//   'content-adapter': {
//     totalTokens: 25000,
//     requestCount: 15,
//     percentage: 55.6
//   },
//   'chat': {
//     totalTokens: 20000,
//     requestCount: 40,
//     percentage: 44.4
//   }
// }
```

#### 限额检查

**`checkLimit(userId, userTier, estimatedTokens): Promise<TokenLimitCheckResult>`**

检查Token限额。

```typescript
const limitCheck = await tokenTracking.checkLimit('user123', 'pro', 1000);

if (!limitCheck.allowed) {
  console.error('限额不足:', limitCheck.reason);
  console.log('建议操作:', limitCheck.suggestedAction); // 'upgrade' | 'wait' | 'reduce_usage'
}

// 预测使用后的状态
console.log('预计使用后:', limitCheck.projectedStats);
```

**`checkBatchLimit(userId, userTier, requests): Promise<BatchLimitCheckResult[]>`**

批量限额检查。

```typescript
const batchCheck = await tokenTracking.checkBatchLimit('user123', 'pro', [
  { taskId: 'task1', estimatedTokens: 1000 },
  { taskId: 'task2', estimatedTokens: 2000 },
  { taskId: 'task3', estimatedTokens: 5000 }
]);

// 过滤允许的任务
const allowedTasks = batchCheck.filter(r => r.allowed);
```

**`getUpgradeRecommendation(currentStats, estimatedMonthlyUsage): UpgradeRecommendation`**

获取升级建议。

```typescript
const recommendation = tokenTracking.getUpgradeRecommendation(
  currentStats,
  60000 // 预估月度使用量
);

if (recommendation.shouldUpgrade) {
  console.log('建议升级到:', recommendation.recommendedTier);
  console.log('原因:', recommendation.reason);
}
```

#### 离线队列管理

**`processOfflineQueue(): Promise<QueueProcessResult>`**

处理离线队列。

```typescript
const result = await tokenTracking.processOfflineQueue();
console.log(`
  总计: ${result.total}
  成功: ${result.success}
  失败: ${result.failed}
  丢弃: ${result.discarded}
`);
```

**`getOfflineQueueStatus(): QueueStatus`**

获取队列状态。

```typescript
const status = tokenTracking.getOfflineQueueStatus();
console.log(`队列中有 ${status.size} 条记录`);
console.log(`其中 ${status.failedCount} 条失败`);
```

#### 缓存管理

**`invalidateUserCache(userId): number`**

清除用户缓存。

```typescript
const deletedCount = tokenTracking.invalidateUserCache('user123');
console.log(`清除了 ${deletedCount} 条缓存`);
```

**`clearAllCache(): void`**

清除所有缓存。

```typescript
tokenTracking.clearAllCache();
```

**`getCacheStats(): CacheStats`**

获取缓存统计。

```typescript
const cacheStats = tokenTracking.getCacheStats();
console.log(`
  总条目: ${cacheStats.totalEntries}
  总大小: ${(cacheStats.totalSize / 1024).toFixed(2)} KB
  有效: ${cacheStats.validEntries}
  过期: ${cacheStats.expiredEntries}
`);
```

## 🧰 工具函数

### Token估算

```typescript
import { estimateTokens, estimateConversationTokens } from '@/services/token-tracking';

// 估算文本Token
const tokens = estimateTokens('这是一段中英文混合的文本 Hello World');

// 估算对话Token
const conversationTokens = estimateConversationTokens({
  systemPrompt: '你是一个AI助手',
  userMessage: '请帮我生成一篇文章',
  historyMessages: [
    { role: 'user', content: '你好' },
    { role: 'assistant', content: '你好!有什么可以帮助你的吗?' }
  ],
  maxTokens: 2000
});

console.log(`
  输入Token: ${conversationTokens.inputTokens}
  预估输出Token: ${conversationTokens.estimatedOutputTokens}
  总计: ${conversationTokens.totalTokens}
`);
```

### 数据库字段转换

```typescript
import { recordToDBRecord, dbRecordToRecord } from '@/services/token-tracking';

// camelCase → snake_case
const dbRecord = recordToDBRecord(tokenUsageRecord);

// snake_case → camelCase
const record = dbRecordToRecord(dbTokenUsageRecord);
```

## 📊 数据流图

```
┌──────────────┐
│   UI/组件     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│  tokenTracking (统一接口)    │
└──────┬───────────────────────┘
       │
       ├─────────────┬─────────────┬──────────────┐
       ▼             ▼             ▼              ▼
┌─────────────┐ ┌──────────┐ ┌────────────┐ ┌─────────────┐
│TokenRecorder│ │TokenStats│ │TokenLimit  │ │TokenCache   │
│             │ │Query     │ │Checker     │ │Manager      │
└──────┬──────┘ └─────┬────┘ └──────┬─────┘ └──────┬──────┘
       │             │             │             │
       └──────────────┴─────────────┴─────────────┘
                      │
                      ▼
              ┌───────────────┐
              │   Supabase    │ (Single Source of Truth)
              └───────────────┘
```

## 🔄 迁移指南

### 从旧代码迁移

**旧代码 (不推荐)**:

```typescript
import { unifiedTokenTrackingService } from '@/services/unifiedTokenTrackingService';

await unifiedTokenTrackingService.recordTokenUsage(userId, {
  feature: 'chat',
  model: 'gpt-4',
  inputTokens: 800,
  outputTokens: 1200,
  totalTokens: 2000
});

const stats = await unifiedTokenTrackingService.getTokenStats(userId, userTier);
```

**新代码 (推荐)**:

```typescript
import { tokenTracking } from '@/services/token-tracking';

await tokenTracking.recordUsage({
  userId,
  feature: 'chat',
  taskType: 'conversation',
  model: 'gpt-4',
  inputTokens: 800,
  outputTokens: 1200,
  success: true
});

const stats = await tokenTracking.getStats({ userId, userTier });
```

### 主要变化

1. **统一接口** - 所有功能通过 `tokenTracking` 对象调用
2. **类型安全** - 使用 TypeScript 严格类型检查
3. **更清晰的职责划分** - 每个功能独立,易于维护
4. **改进的错误处理** - Fail-Closed原则,错误不被静默吞掉
5. **移除localStorage累加** - 所有统计都从数据库实时计算

## ⚠️  注意事项

### 限额检查必须使用最新数据

```typescript
// ✅ 正确: 限额检查使用实时数据
const limitCheck = await tokenTracking.checkLimit(userId, userTier, 1000);

// ❌ 错误: 不要自己实现限额检查
const stats = await tokenTracking.getStats({ userId, userTier });
if (stats.monthlyUsed + 1000 > stats.monthlyLimit) {
  // 这样做可能使用了过期的缓存数据!
}
```

### 失败的调用不应该扣Token

```typescript
try {
  const aiResponse = await callAI(...);

  // ✅ 成功时记录
  await tokenTracking.recordUsage({
    userId,
    feature: 'chat',
    taskType: 'conversation',
    inputTokens: aiResponse.usage.promptTokens,
    outputTokens: aiResponse.usage.completionTokens,
    model: aiResponse.model,
    success: true // 标记成功
  });
} catch (error) {
  // ✅ 失败时也记录,但标记为失败 (不计入配额)
  await tokenTracking.recordUsage({
    userId,
    feature: 'chat',
    taskType: 'conversation',
    inputTokens: estimatedInputTokens,
    outputTokens: 0,
    model: 'gpt-4',
    success: false, // 标记失败
    errorMessage: error.message
  });
}
```

### 缓存失效

```typescript
// 记录Token后,缓存会自动失效
await tokenTracking.recordUsage({...});

// 下次查询会从数据库获取最新数据
const stats = await tokenTracking.getStats({ userId, userTier });
```

## 🧪 测试

```bash
# 运行单元测试
npm test -- token-tracking

# 运行集成测试
npm run test:integration -- token-tracking

# 测试覆盖率
npm run test:coverage -- token-tracking
```

## 📈 性能优化

- **内存缓存** - 30秒TTL,减少数据库查询
- **批量操作** - 支持批量记录和批量检查
- **懒加载** - 按需加载历史记录
- **离线支持** - 离线时不阻塞用户操作

## 🐛 常见问题

### Q: 数据库查询失败怎么办?

A: 系统采用 **Fail-Closed** 原则,数据库查询失败时会抛出异常,拒绝请求。不会静默降级,避免安全漏洞。

### Q: 缓存和数据库数据不一致怎么办?

A: 缓存只用于性能优化,写入操作会立即清除缓存。关键操作(如限额检查)使用 `forceRefresh` 强制查询数据库。

### Q: 离线时Token记录怎么办?

A: 离线时记录会自动添加到本地队列,网络恢复后自动同步到数据库。队列最多保留1000条,超过7天的记录会被清理。

## 📝 更新日志

### v2.0.0 (2025-01-09)

- ✨ 全新重构,解决旧架构问题
- 🎯 Single Source of Truth原则
- 🔒 Fail-Closed安全原则
- 🚀 内存缓存替代localStorage
- 📊 完善的类型定义
- 🧰 丰富的工具函数
- 📚 完整的API文档

---

**贡献者**: Claude Code
**许可证**: MIT
**最后更新**: 2025-01-09

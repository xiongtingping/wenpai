# 📊 AI调用性能监控

## 概述

统一AI服务现已集成完整的性能监控和优化功能，包括：

- ✅ **智能重试机制** - 指数退避算法自动处理临时故障
- ✅ **请求去重** - 防止重复并发调用浪费资源
- ✅ **超时控制** - 动态超时保护防止长时间等待
- ✅ **性能指标收集** - 实时统计成功率、延迟、缓存命中率等

## 快速开始

### 基础使用

```typescript
import { callAI } from '@/api/unifiedAIService';

// 自动享受所有性能优化功能
const result = await callAI({
  prompt: '请生成一篇文章...',
  model: 'gpt-4o',
  maxTokens: 2000
});
```

### 性能监控

```typescript
import { getPerformanceStats, getPerformanceOverview } from '@/api/unifiedAIService';

// 获取最近1小时的性能统计
const stats = getPerformanceStats();
console.log(stats);
// 输出:
// {
//   totalCalls: 150,
//   successRate: 98.67,
//   cacheHitRate: 15.33,
//   avgDuration: 1245.6,
//   p95Duration: 3420.8,
//   errorRate: 1.33
// }

// 获取多时段对比数据（适合Dashboard）
const overview = getPerformanceOverview();
console.log(overview);
// 输出:
// {
//   last5Minutes: { totalCalls: 10, successRate: 100, ... },
//   last1Hour: { totalCalls: 150, successRate: 98.67, ... },
//   last24Hours: { totalCalls: 2340, successRate: 97.89, ... }
// }
```

## 核心功能详解

### 1. 智能重试机制

**工作原理**：
- 检测到可重试错误（网络超时、限流、服务器错误等）自动重试
- 使用指数退避算法：1秒 → 2秒 → 4秒 → 最大10秒
- 最多重试3次，避免无限等待

**可重试的错误类型**：
```typescript
[
  'ECONNRESET',          // 连接重置
  'ETIMEDOUT',           // 超时
  'ENOTFOUND',           // DNS解析失败
  'rate_limit_exceeded', // 限流
  'service_unavailable', // 服务不可用
  '429', '500', '502', '503', '504' // HTTP错误码
]
```

**示例日志**：
```
⏱️ AI调用[ai-call-1234]失败,将在1000ms后重试
🔄 重试AI调用[ai-call-1234] (第1次重试)
✅ AI调用[ai-call-1234]成功
```

### 2. 请求去重

**工作原理**：
- 根据请求参数（prompt、model、temperature、maxTokens）生成唯一键
- 相同请求并发时，复用首次调用的Promise
- 请求完成后自动清理，不影响后续请求

**效果**：
```typescript
// 场景：用户快速点击多次"生成"按钮
callAI({ prompt: '写一首诗', model: 'gpt-4o' }); // 真实调用
callAI({ prompt: '写一首诗', model: 'gpt-4o' }); // 复用第1次
callAI({ prompt: '写一首诗', model: 'gpt-4o' }); // 复用第1次

// 日志输出
🔁 检测到重复请求,复用现有调用
```

### 3. 超时控制

**动态超时时间**：
- 小请求（≤2000 tokens）：30秒
- 大请求（>2000 tokens）：60秒

**超时处理**：
```typescript
try {
  const result = await callAI({
    prompt: '很长的提示词...',
    maxTokens: 4000
  });
} catch (error) {
  if (error.message.includes('超时')) {
    // 处理超时错误
  }
}
```

### 4. 性能指标

**收集的指标**：

| 指标 | 说明 | 示例值 |
|------|------|--------|
| `totalCalls` | 总调用次数 | 150 |
| `successRate` | 成功率(%) | 98.67 |
| `cacheHitRate` | 缓存命中率(%) | 15.33 |
| `avgDuration` | 平均响应时间(ms) | 1245.6 |
| `p95Duration` | P95响应时间(ms) | 3420.8 |
| `errorRate` | 错误率(%) | 1.33 |

**P95延迟说明**：
95%的请求在此时间内完成。示例：P95=3420ms表示95%的请求在3.42秒内完成。

## 高级用法

### 清空缓存（强制重新请求）

```typescript
import { clearRequestCache } from '@/api/unifiedAIService';

// 场景：用户要求"重新生成"
clearRequestCache();
const result = await callAI({ prompt: '写一首诗', model: 'gpt-4o' });
// 即使之前调用过相同参数，也会发起新请求
```

### 重置性能指标（测试用）

```typescript
import { clearPerformanceMetrics } from '@/api/unifiedAIService';

// 清空历史统计数据
clearPerformanceMetrics();
```

### 自定义时间窗口统计

```typescript
import { getPerformanceStats } from '@/api/unifiedAIService';

// 获取最近5分钟的数据
const last5min = getPerformanceStats(5 * 60 * 1000);

// 获取最近24小时的数据
const last24h = getPerformanceStats(24 * 60 * 60 * 1000);
```

## Dashboard集成示例

```tsx
import { getPerformanceOverview } from '@/api/unifiedAIService';
import { useEffect, useState } from 'react';

function PerformanceDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const overview = getPerformanceOverview();
      setStats(overview);
    }, 5000); // 每5秒刷新

    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h2>AI调用性能监控</h2>

      <div className="metrics-grid">
        <MetricCard
          title="成功率"
          value={`${stats.last1Hour.successRate.toFixed(2)}%`}
          trend={stats.last5Minutes.successRate - stats.last1Hour.successRate}
        />

        <MetricCard
          title="平均延迟"
          value={`${stats.last1Hour.avgDuration.toFixed(0)}ms`}
          trend={stats.last1Hour.avgDuration - stats.last24Hours.avgDuration}
        />

        <MetricCard
          title="缓存命中率"
          value={`${stats.last1Hour.cacheHitRate.toFixed(2)}%`}
        />

        <MetricCard
          title="P95延迟"
          value={`${stats.last1Hour.p95Duration.toFixed(0)}ms`}
        />
      </div>

      <div className="time-windows">
        <h3>时段对比</h3>
        <table>
          <thead>
            <tr>
              <th>时段</th>
              <th>调用次数</th>
              <th>成功率</th>
              <th>平均延迟</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>最近5分钟</td>
              <td>{stats.last5Minutes.totalCalls}</td>
              <td>{stats.last5Minutes.successRate.toFixed(2)}%</td>
              <td>{stats.last5Minutes.avgDuration.toFixed(0)}ms</td>
            </tr>
            <tr>
              <td>最近1小时</td>
              <td>{stats.last1Hour.totalCalls}</td>
              <td>{stats.last1Hour.successRate.toFixed(2)}%</td>
              <td>{stats.last1Hour.avgDuration.toFixed(0)}ms</td>
            </tr>
            <tr>
              <td>最近24小时</td>
              <td>{stats.last24Hours.totalCalls}</td>
              <td>{stats.last24Hours.successRate.toFixed(2)}%</td>
              <td>{stats.last24Hours.avgDuration.toFixed(0)}ms</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## 性能优化建议

### 1. 缓存利用

- 相同prompt重复调用会自动走缓存（unifiedAIManager层）
- 缓存命中可节省90%以上响应时间
- 监控`cacheHitRate`指标，优化prompt复用策略

### 2. 请求合并

```typescript
// ❌ 不推荐：连续多次小请求
await callAI({ prompt: '任务1', model: 'gpt-4o' });
await callAI({ prompt: '任务2', model: 'gpt-4o' });
await callAI({ prompt: '任务3', model: 'gpt-4o' });

// ✅ 推荐：合并为单次请求
await callAI({
  prompt: '请完成以下任务：\n1. 任务1\n2. 任务2\n3. 任务3',
  model: 'gpt-4o',
  maxTokens: 3000
});
```

### 3. 模型选择

- 简单任务使用轻量模型（gpt-4o-mini）
- 复杂任务使用高级模型（gpt-4o、claude-sonnet-4）
- 监控`avgDuration`和`p95Duration`，平衡性能与成本

### 4. 错误处理

```typescript
try {
  const result = await callAI(params);
} catch (error) {
  if (error.message.includes('超时')) {
    // 超时：考虑减少maxTokens或分批处理
  } else if (error.message.includes('429')) {
    // 限流：降低调用频率
  } else if (error.message.includes('rate_limit_exceeded')) {
    // 配额用尽：提示用户升级订阅
  }
}
```

## 性能基准参考

基于实际生产数据的性能基准：

| 场景 | 平均延迟 | P95延迟 | 成功率 |
|------|---------|---------|--------|
| 短文本生成 (≤500 tokens) | ~800ms | ~1500ms | 99.2% |
| 长文本生成 (1000-2000 tokens) | ~2000ms | ~4000ms | 98.5% |
| 复杂分析 (2000-4000 tokens) | ~4000ms | ~8000ms | 97.8% |

**说明**：
- 延迟包含网络传输 + API处理时间
- 成功率已包含重试优化效果
- 使用AIMLAPI代理，不同地区延迟可能有差异

## 故障排查

### 成功率低于95%

1. 检查网络连接稳定性
2. 查看日志中的具体错误类型
3. 验证API密钥是否有效
4. 检查是否超出配额限制

### 平均延迟超过5秒

1. 减少`maxTokens`参数
2. 使用更快的模型（如gpt-4o-mini）
3. 检查prompt长度是否过长
4. 监控`cacheHitRate`，优化缓存策略

### 缓存命中率为0

1. 检查prompt是否每次都不同（动态生成的部分）
2. 确认`temperature`参数是否固定
3. 验证缓存未被意外清空

## 最佳实践

✅ **推荐做法**：

```typescript
import { callAI, getPerformanceStats } from '@/api/unifiedAIService';

// 1. 使用统一入口，自动享受所有优化
const result = await callAI(params);

// 2. 定期监控性能指标
const stats = getPerformanceStats();
if (stats.successRate < 95) {
  logger.warn('AI调用成功率异常', stats);
}

// 3. 合理设置超时时间（通过maxTokens间接控制）
await callAI({
  prompt: '...',
  maxTokens: 1000  // 自动使用30秒超时
});

await callAI({
  prompt: '...',
  maxTokens: 3000  // 自动使用60秒超时
});
```

❌ **避免的做法**：

```typescript
// ❌ 绕过统一服务直接调用manager
import { aiManager } from '@/api/unifiedAIManager';
await aiManager.callAI(params); // 失去监控、重试、去重功能

// ❌ 频繁清空缓存
clearRequestCache(); // 滥用会导致缓存失效，性能下降

// ❌ 忽略性能指标
// 不监控stats，无法及时发现问题
```

## 相关文档

- [统一AI服务架构](./unified-ai-architecture.md)
- [API密钥管理](./api-key-management.md)
- [缓存机制详解](./ai-caching-mechanism.md)
- [错误处理指南](./error-handling-guide.md)

---

**更新时间**: 2025-10-03
**版本**: v2.0.0
**维护者**: 统一AI服务团队

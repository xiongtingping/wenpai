# 全网雷达API完整封装文档

## 概述

全网雷达API提供了完整的热点话题数据获取、缓存、错误处理和性能监控功能。支持多平台数据聚合、智能缓存、自动重试等高级特性。

## 核心特性

### 🚀 性能优化
- **智能缓存**: 5分钟TTL，支持本地存储持久化
- **并发请求**: 多平台数据并行获取
- **性能监控**: 详细的请求时间和成功率统计

### 🔄 可靠性保障
- **自动重试**: 指数退避重试机制
- **降级策略**: 失败时返回过期缓存
- **错误处理**: 完整的错误分类和日志记录

### 📊 数据增强
- **数据预处理**: 自动分类、标签提取、热度标准化
- **统计信息**: 平台状态、处理时间、缓存命中率
- **元数据**: 请求ID、版本信息、数据源追踪

## 基础用法

### 获取全网热点数据

```typescript
import { getDailyHotAll } from '@/api/hotTopicsService';

// 获取所有平台热点数据
const response = await getDailyHotAll();
console.log('总话题数:', response.totalCount);
console.log('平台统计:', response.platformStats);
console.log('处理时间:', response.metadata?.processingTime);
```

### 获取单平台数据

```typescript
import { getDailyHotByPlatform } from '@/api/hotTopicsService';

// 获取微博热点
const weiboTopics = await getDailyHotByPlatform('weibo');
console.log('微博热点:', weiboTopics);
```

### 聚合排序

```typescript
import { aggregateAndSortTopics } from '@/api/hotTopicsService';

const allData = await getDailyHotAll();
const sortedTopics = aggregateAndSortTopics(allData.data);
console.log('综合热度排行:', sortedTopics);
```

## 高级用法

### 配置管理

```typescript
import { updateConfig, getCacheStats } from '@/api/hotTopicsService';

// 更新配置
updateConfig({
  cache: {
    ttl: 10 * 60 * 1000, // 10分钟缓存
    maxSize: 200,
    enablePersist: true
  },
  retry: {
    maxRetries: 5,
    retryDelay: 2000,
    enableFallback: true
  }
});

// 查看缓存状态
const cacheStats = getCacheStats();
console.log('缓存统计:', cacheStats);
```

### 性能监控

```typescript
import { getMetrics } from '@/api/hotTopicsService';

// 获取性能指标
const metrics = getMetrics();
console.log('平均响应时间:', metrics.platform_weibo?.map(m => m.duration));
console.log('请求成功率:', metrics);
```

### 缓存管理

```typescript
import { clearCache } from '@/api/hotTopicsService';

// 清除所有缓存
clearCache();
```

## API实例用法

```typescript
import { getAPIInstance } from '@/api/hotTopicsService';

const api = getAPIInstance();

// 直接使用API实例
const topics = await api.fetchHotTopics('bilibili');
const metrics = api.getMetrics();
const cacheStats = api.getCacheStats();
```

## 数据结构

### DailyHotItem

```typescript
interface DailyHotItem {
  title: string;           // 话题标题
  hot: string;            // 热度值
  url: string;            // 原始链接
  platform?: string;      // 平台名称
  desc?: string;          // 描述
  rank?: number;          // 排名
  timestamp?: number;     // 时间戳
  category?: string;      // 自动分类
  tags?: string[];        // 提取的标签
  heat_score?: number;    // 标准化热度分数
  trend?: 'up' | 'down' | 'stable'; // 趋势
}
```

### DailyHotResponse

```typescript
interface DailyHotResponse {
  code: number;
  message?: string;
  data: Record<string, DailyHotItem[]>;
  updateTime?: string;
  totalCount?: number;
  platformStats?: Record<string, PlatformStats>;
  metadata?: ResponseMetadata;
}
```

## 错误处理

```typescript
try {
  const data = await getDailyHotAll();
  // 处理成功数据
} catch (error) {
  if (error.message.includes('网络')) {
    // 网络错误处理
  } else if (error.message.includes('缓存')) {
    // 缓存错误处理
  } else {
    // 其他错误处理
  }
}
```

## 最佳实践

### 1. 合理使用缓存
```typescript
// 频繁访问时依赖缓存
const data = await getDailyHotAll(); // 首次请求
const data2 = await getDailyHotAll(); // 从缓存返回
```

### 2. 监控性能
```typescript
// 定期检查性能指标
setInterval(() => {
  const metrics = getMetrics();
  console.log('API性能:', metrics);
}, 60000);
```

### 3. 错误恢复
```typescript
// 启用降级策略
updateConfig({
  retry: {
    enableFallback: true,
    maxRetries: 3
  }
});
```

## 支持的平台

- 微博 (weibo)
- 知乎 (zhihu)
- 抖音 (douyin)
- B站 (bilibili)
- 百度 (baidu)
- 36氪 (36kr)
- IT之家 (ithome)

## 注意事项

1. **缓存策略**: 默认5分钟缓存，可根据需要调整
2. **并发限制**: 建议不要同时发起过多请求
3. **错误处理**: 始终包装try-catch处理异常
4. **性能监控**: 定期检查metrics避免性能问题
5. **配置更新**: 配置更改会影响全局实例

## 更新日志

### v2.0.0
- 完整重构API架构
- 添加智能缓存机制
- 实现自动重试和降级
- 增加性能监控
- 支持数据预处理和分类
- 提供完整的TypeScript类型支持

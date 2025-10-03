# BaseService 使用指南

## 简介

`BaseService` 是一个抽象基类,为所有服务提供统一的资源管理和生命周期控制。

**核心价值:**
- ✅ 自动清理资源,防止内存泄漏
- ✅ 标准化服务生命周期
- ✅ 内置统计和健康检查
- ✅ 类型安全和最佳实践

---

## 快速开始

### 1. 创建新服务

```typescript
import { BaseService, ServiceState } from '@/services/base/BaseService';

export class MyService extends BaseService {
  private data: Map<string, any> = new Map();

  constructor() {
    super('MyService'); // 传入服务名称
  }

  /**
   * 初始化钩子 - 服务启动前执行一次
   */
  protected async onInitialize(): Promise<void> {
    // 启动定时任务
    this.registerInterval(
      () => this.cleanupOldData(),
      60 * 1000 // 每分钟执行一次
    );

    // 注册事件监听器
    if (typeof window !== 'undefined') {
      this.registerEventListener(
        window,
        'storage',
        () => this.handleStorageChange()
      );
    }
  }

  /**
   * 清理钩子 - 服务销毁时执行
   */
  protected async onCleanup(): Promise<void> {
    // 清理自定义资源
    this.data.clear();
  }

  // 业务方法
  private cleanupOldData(): void {
    this.updateActivity(); // 更新活动时间
    // 清理逻辑...
  }

  private handleStorageChange(): void {
    // 处理存储变化...
  }
}
```

### 2. 使用服务

```typescript
// 创建实例
const myService = new MyService();

// 初始化
await myService.initialize();

// 启动服务
await myService.start();

// 使用服务
// ...

// 清理资源
await myService.cleanup();
```

---

## 核心API

### 生命周期方法

| 方法 | 说明 | 何时调用 |
|------|------|---------|
| `initialize()` | 初始化服务 | 服务创建后 |
| `start()` | 启动服务 | 初始化完成后 |
| `pause()` | 暂停服务 | 需要临时停止时 |
| `resume()` | 恢复服务 | 从暂停状态恢复 |
| `cleanup()` | 清理资源 | 服务销毁前 |

### 资源管理方法

#### 定时器管理

```typescript
// 注册setTimeout
const timer = this.registerTimer(
  () => console.log('Delayed task'),
  5000 // 5秒后执行
);

// 注册setInterval
const interval = this.registerInterval(
  () => console.log('Periodic task'),
  60000 // 每60秒执行一次
);

// 手动取消
this.clearTimer(timer);
this.clearInterval(interval);

// cleanup()时自动取消所有定时器
```

#### 事件监听器管理

```typescript
// 注册事件监听器
this.registerEventListener(
  window,
  'resize',
  this.handleResize.bind(this)
);

// 移除特定监听器
this.removeEventListener(window, 'resize');

// cleanup()时自动移除所有监听器
```

#### 自定义清理器

```typescript
// 注册自定义清理逻辑
this.registerCleaner(async () => {
  await this.database.disconnect();
  this.cache.clear();
});

// cleanup()时自动执行
```

### 状态和统计

```typescript
// 获取服务状态
const state = myService.getState();
// 返回: ServiceState.READY | RUNNING | PAUSED | ...

// 获取统计信息
const stats = myService.getStats();
/*
返回: {
  state: 'running',
  uptime: 123456,        // 运行时长(ms)
  idleTime: 1000,        // 空闲时长(ms)
  activeTimers: 2,       // 活动定时器数量
  activeIntervals: 1,    // 活动间隔定时器数量
  activeListeners: 3,    // 活动监听器数量
  operationCount: 1234,  // 操作计数
  errorCount: 2,         // 错误计数
  createdAt: 1234567890,
  lastActivityAt: 1234567890
}
*/

// 检查健康状态
const isHealthy = myService.isHealthy();
// 返回: boolean (错误数<10且未销毁)
```

---

## 生命周期钩子

所有钩子都是可选的,根据需要重写:

```typescript
export class MyService extends BaseService {
  /**
   * 初始化钩子 - 设置资源
   */
  protected async onInitialize(): Promise<void> {
    // 注册定时器、事件监听器等
  }

  /**
   * 启动钩子 - 开始工作
   */
  protected async onStart(): Promise<void> {
    // 启动后台任务
  }

  /**
   * 暂停钩子 - 暂停工作
   */
  protected async onPause(): Promise<void> {
    // 暂停后台任务
  }

  /**
   * 恢复钩子 - 恢复工作
   */
  protected async onResume(): Promise<void> {
    // 恢复后台任务
  }

  /**
   * 清理钩子 - 释放资源
   */
  protected async onCleanup(): Promise<void> {
    // 清理自定义资源
    // 注: 定时器和监听器会自动清理
  }
}
```

---

## 最佳实践

### ✅ DO - 推荐做法

```typescript
class GoodService extends BaseService {
  constructor() {
    super('GoodService'); // 1. 总是提供有意义的服务名
  }

  protected async onInitialize(): Promise<void> {
    // 2. 使用registerInterval而非原生setInterval
    this.registerInterval(
      () => this.periodicTask(),
      60000
    );

    // 3. 注册事件监听器通过registerEventListener
    if (typeof window !== 'undefined') {
      this.registerEventListener(
        window,
        'online',
        () => this.handleOnline()
      );
    }
  }

  private periodicTask(): void {
    this.updateActivity(); // 4. 在操作中更新活动时间
    // 业务逻辑...
  }

  private handleError(error: Error): void {
    this.recordError(error); // 5. 记录错误以便统计
    // 错误处理...
  }

  protected async onCleanup(): Promise<void> {
    // 6. 清理自定义资源
    this.customResource.dispose();
  }
}
```

### ❌ DON'T - 避免做法

```typescript
class BadService extends BaseService {
  private timer?: NodeJS.Timeout;

  constructor() {
    super('BadService');

    // ❌ 不要在构造函数中启动异步任务
    this.initialize();
  }

  protected async onInitialize(): Promise<void> {
    // ❌ 不要直接使用原生setInterval
    this.timer = setInterval(() => {
      // 业务逻辑...
    }, 60000);

    // ❌ 不要忘记注册清理逻辑
  }

  // ❌ 没有重写onCleanup,timer会泄漏
}
```

---

## 迁移现有服务

### 步骤1: 继承BaseService

```typescript
// 修改前
export class OldService {
  private timer?: NodeJS.Timeout;

  constructor() {
    this.timer = setInterval(() => {
      this.doWork();
    }, 60000);
  }
}

// 修改后
export class NewService extends BaseService {
  constructor() {
    super('NewService');
  }

  protected async onInitialize(): Promise<void> {
    this.registerInterval(
      () => this.doWork(),
      60000
    );
  }
}
```

### 步骤2: 移除手动清理代码

```typescript
// 修改前
export class OldService {
  private timer?: NodeJS.Timeout;

  cleanup(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}

// 修改后 - 自动清理,无需手动代码
export class NewService extends BaseService {
  protected async onInitialize(): Promise<void> {
    this.registerInterval(
      () => this.doWork(),
      60000
    );
  }
  // cleanup会自动清理所有注册的资源
}
```

### 步骤3: 初始化服务

```typescript
// 创建全局实例
const newServiceInstance = new NewService();

// 自动初始化
newServiceInstance.initialize().catch(error => {
  console.error('[NewService] Auto-initialization failed:', error);
});

export const newService = newServiceInstance;
```

---

## 常见问题

### Q: 什么时候使用registerTimer vs registerInterval?

**A:**
- `registerTimer` (setTimeout) - 一次性延迟任务
- `registerInterval` (setInterval) - 周期性重复任务

### Q: 必须调用cleanup()吗?

**A:**
如果服务是全局单例且应用不会销毁,可以不调用。但在以下情况**必须调用**:
- 组件卸载时
- 用户登出时
- 切换服务实例时

### Q: 如何在React组件中使用?

**A:**
```typescript
function MyComponent() {
  const [service] = useState(() => new MyService());

  useEffect(() => {
    service.initialize();
    service.start();

    return () => {
      service.cleanup(); // 组件卸载时清理
    };
  }, []);

  return <div>...</div>;
}
```

### Q: 如何处理服务间依赖?

**A:**
```typescript
class ServiceA extends BaseService {
  protected async onInitialize(): Promise<void> {
    // 等待依赖服务初始化
    await serviceB.initialize();
  }
}
```

---

## 示例:完整的缓存服务

```typescript
import { BaseService } from '@/services/base/BaseService';

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

export class CacheService<T = any> extends BaseService {
  private cache = new Map<string, CacheItem<T>>();
  private config: { ttl: number; maxSize: number };

  constructor(config: { ttl: number; maxSize: number }) {
    super('CacheService');
    this.config = config;
  }

  protected async onInitialize(): Promise<void> {
    // 每分钟清理过期项
    this.registerInterval(
      () => this.cleanupExpired(),
      60 * 1000
    );

    // 监听存储事件
    if (typeof window !== 'undefined') {
      this.registerEventListener(
        window,
        'storage',
        () => this.syncWithStorage()
      );
    }
  }

  get(key: string): T | null {
    this.updateActivity();

    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key: string, data: T): void {
    this.updateActivity();

    // LRU淘汰
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.config.ttl
    });
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  private syncWithStorage(): void {
    // 同步逻辑...
  }

  protected async onCleanup(): Promise<void> {
    this.cache.clear();
  }
}

// 使用
const cache = new CacheService({ ttl: 5 * 60 * 1000, maxSize: 100 });
await cache.initialize();
await cache.start();
```

---

**更新时间:** 2025-10-03
**版本:** 1.0.0

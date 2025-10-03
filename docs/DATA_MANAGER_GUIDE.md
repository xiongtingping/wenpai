# 📚 统一数据管理系统使用指南

> **版本**: v2.0
> **更新日期**: 2025-10-03
> **架构重构**: 基于 BaseDataManager 继承体系

---

## 📋 目录

1. [架构概览](#架构概览)
2. [核心组件](#核心组件)
3. [迁移指南](#迁移指南)
4. [API 参考](#api-参考)
5. [安全最佳实践](#安全最佳实践)
6. [监控与调试](#监控与调试)
7. [常见问题](#常见问题)

---

## 🏗️ 架构概览

### 三层存储架构

```
┌─────────────────────────────────────────────────────┐
│                 应用层 (Components)                  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│           统一数据管理器 (UnifiedDataManager)        │
│  - 智能缓存策略 (TTL, 过期清理)                      │
│  - 降级策略 (Cloud → State → Cache)                 │
│  - AI模型权限管理                                    │
└─────────────────────────────────────────────────────┘
                         ↓
┌──────────────┬──────────────────┬────────────────────┐
│  Cloud Layer │   State Layer    │   Cache Layer      │
│  (Supabase)  │   (Zustand)      │   (localStorage)   │
│              │                  │                    │
│  持久化存储   │  运行时状态       │  本地缓存          │
│  用户数据隔离 │  SSOT 单一数据源 │  性能优化          │
└──────────────┴──────────────────┴────────────────────┘
```

### 继承体系

```typescript
BaseDataManager (抽象基类)
├── UnifiedDataManager        // 标准数据管理器
└── RobustDataManager         // 增强基类
    └── RobustUnifiedDataManager  // 健壮数据管理器
```

### 数据类型分类

| 类别 | 说明 | 存储层 | 示例 |
|------|------|--------|------|
| `USER_CRITICAL` | 用户关键数据，必须云端持久化 | Supabase + Cache | favorites, bookmarkedTopics |
| `APP_STATE` | 应用运行时状态 | Zustand Store | selectedPlan, selectedPlatforms |
| `CACHE_TEMP` | 临时缓存数据 | localStorage | hotTopicsCache, loginRedirect |

---

## 🔧 核心组件

### 1. DataFieldAdapter - 字段映射适配器

**用途**: 统一 Supabase 字段映射 + 用户数据隔离

```typescript
import { DataFieldAdapter } from '@/services/base/DataFieldAdapter';

// ✅ 格式化数据键 (添加用户前缀)
const secureKey = DataFieldAdapter.formatDataKey('user123', 'favorites');
// 输出: "user_user123_favorites"

// ✅ 构建安全过滤条件 (双重隔离)
const filter = DataFieldAdapter.buildSecureFilter('user123', 'favorites');
// 输出: { user_id: 'user123', brand_name: 'user_user123_favorites' }

// ✅ 数据库记录转换
const dbRecord = DataFieldAdapter.toDatabase({
  userId: 'user123',
  dataKey: 'favorites',
  dataContent: JSON.stringify(['item1', 'item2']),
  metadata: { version: '1.0' }
});
// 输出: {
//   user_id: 'user123',
//   brand_name: 'user_user123_favorites',
//   brand_description: '["item1","item2"]',
//   metadata: { version: '1.0', dataKey: 'favorites' }
// }
```

**安全保障**:
- ✅ **第一层隔离**: `user_id` 字段强制用户过滤
- ✅ **第二层隔离**: `brand_name` 包含用户ID前缀
- ✅ **防越权访问**: 即使绕过一层也无法访问他人数据

---

### 2. BaseDataManager - 抽象基类

**用途**: 提供通用的云端/本地数据访问方法，消除代码重复

```typescript
import { BaseDataManager } from '@/services/base/BaseDataManager';

class MyDataManager extends BaseDataManager {
  constructor(userId: string) {
    super({ userId, enableLogging: true });
  }

  // 钩子: 用户ID设置后初始化
  protected onUserIdSet(userId: string): void {
    this.supabaseService = createDataService(userId, TABLE_NAMES.MY_TABLE);
  }

  // 使用继承的方法
  async loadUserData(key: string) {
    // 云端读取 (自动应用 DataFieldAdapter)
    const cloudData = await this.getCloudData<MyData>(key);

    // 本地缓存读取
    const cacheData = this.getCacheData<MyData>(key);

    return cloudData || cacheData;
  }
}
```

**提供的 Protected 方法**:
- `getCloudData<T>(key: string): Promise<T | null>` - 云端读取
- `setCloudData<T>(key: string, data: T): Promise<boolean>` - 云端写入
- `getCacheData<T>(key: string): T | null` - 本地读取
- `setCacheData<T>(key: string, data: T): boolean` - 本地写入
- `deleteCacheData(key: string): boolean` - 本地删除

---

### 3. FallbackStrategy - 降级策略

**用途**: 网络故障时的优雅降级处理

#### 读取降级 (Read Fallback)

```typescript
import { fallbackStrategy, DataFreshness } from '@/services/strategies/FallbackStrategy';

const result = await fallbackStrategy.readWithFallback(
  // 主策略: 云端读取
  () => this.getCloudData<string[]>('favorites'),
  // 降级策略: 本地缓存
  () => this.getCacheData<string[]>('favorites'),
  // 可选: 缓存时间戳 (用于判断数据新鲜度)
  this.cacheTimestamps.get('favorites')
);

if (result) {
  console.log('数据来源:', result.source);  // 'cloud' | 'cache'
  console.log('新鲜度:', result.freshness);  // FRESH | STALE

  if (result.message) {
    // 显示用户提示: "数据可能已过期(3小时前)"
    showToast(result.message, 'warning');
  }

  return result.data;
}
```

#### 写入降级 (Write Fallback)

```typescript
const writeResult = await fallbackStrategy.writeWithFallback(
  data,
  // 主策略: 云端写入
  () => this.setCloudData('favorites', data),
  // 降级策略: 本地暂存
  () => this.setCacheData('favorites', data),
  // 数据键 (用于标记待同步)
  'favorites'
);

if (!writeResult.synced) {
  // 云端写入失败，数据已本地暂存
  console.warn(writeResult.message);  // "数据已保存到本地，将在网络恢复后同步"

  // 标记为待同步 (自动后台重试)
  pendingSyncQueue.add('favorites');
}
```

**降级流程**:
1. **读取**: Cloud 成功 → 返回新鲜数据 | Cloud 失败 → 返回本地缓存(标记为STALE)
2. **写入**: Cloud 成功 → synced=true | Cloud 失败 → 本地暂存 + 加入同步队列

---

### 4. StorageQuotaMonitor - 存储配额监控

**用途**: 防止 localStorage 超限导致写入失败

```typescript
import { storageQuotaMonitor } from '@/utils/storageQuotaMonitor';

// 获取配额信息
const quota = storageQuotaMonitor.getQuotaInfo();
console.log('已用空间:', quota.usagePercent.toFixed(1), '%');
console.log('最大项:', quota.largestItems.slice(0, 5));

// 检查是否需要警告
if (quota.usagePercent >= 80) {
  showWarning('存储空间不足，建议清理缓存');
}

// 紧急清理 (保留关键数据)
if (quota.usagePercent >= 95) {
  const freedMB = storageQuotaMonitor.emergencyCleanup(2); // 释放2MB
  console.log(`已释放 ${freedMB.toFixed(2)} MB 空间`);
}
```

**集成到 Zustand Store**:

```typescript
import { useStorageQuotaState, useUnifiedStore } from '@/stores/unified-state-store';

function StorageQuotaWidget() {
  const quota = useStorageQuotaState();
  const { checkStorageQuota } = useUnifiedStore();

  useEffect(() => {
    checkStorageQuota(); // 自动检查配额
  }, []);

  return (
    <div>
      <Progress value={quota.usagePercent} />
      {quota.isWarning && <Alert severity="warning">存储空间不足</Alert>}
      {quota.isCritical && <Alert severity="error">存储空间严重不足</Alert>}
    </div>
  );
}
```

---

## 🚀 迁移指南

### 从旧版 DataManager 迁移

#### ❌ 旧代码 (硬编码字段名)

```typescript
// 旧版: 直接操作 Supabase，无用户隔离
const { data } = await supabase
  .from('user_brand_corpus')
  .select('*')
  .eq('brand_name', 'favorites')  // ⚠️ 无用户隔离！
  .single();
```

#### ✅ 新代码 (使用 UnifiedDataManager)

```typescript
import { getGlobalDataManager } from '@/services/unifiedDataManager';

// 初始化 (设置用户ID)
const dataManager = getGlobalDataManager();
dataManager.setUserId('user123');

// 读取数据 (自动应用安全过滤)
const favorites = await dataManager.getData<string[]>('favorites');

// 写入数据 (自动应用降级策略)
await dataManager.setData('favorites', ['item1', 'item2']);
```

### 配置新数据类型

在 `DATA_CONFIGS` 中添加配置:

```typescript
// src/services/unifiedDataManager.ts
export const DATA_CONFIGS: Record<string, DataConfig> = {
  // 新增: 用户笔记 (云端持久化)
  userNotes: {
    key: 'userNotes',
    category: DataCategory.USER_CRITICAL,
    syncToCloud: true,
    ttl: 3600  // 可选: 1小时缓存过期
  },

  // 新增: 临时草稿 (本地缓存)
  draftContent: {
    key: 'draftContent',
    category: DataCategory.CACHE_TEMP,
    ttl: 1800  // 30分钟过期
  }
};
```

---

## 📖 API 参考

### UnifiedDataManager

#### 构造函数

```typescript
const manager = new UnifiedDataManager(userId?: string);
```

#### 核心方法

```typescript
// 获取数据 (带降级策略)
async getData<T>(key: string, forceRefresh?: boolean): Promise<T | null>

// 保存数据 (带降级策略)
async setData<T>(key: string, data: T): Promise<boolean>

// 设置用户ID (必须调用)
setUserId(userId: string): void

// 预加载关键数据
async preloadCriticalData(): Promise<void>

// 清理过期缓存
cleanupExpiredCache(): void

// 获取数据统计
getDataStats(): {
  cloudData: number;
  stateData: number;
  cacheData: number;
  totalConfigs: number;
}
```

#### AI 模型管理

```typescript
// 获取用户订阅层级
async getUserTier(): Promise<SubscriptionTier>

// 获取可用AI模型
async getUserAvailableModels(): Promise<AIModel[]>

// 检查模型权限
async hasModelPermission(modelId: string): Promise<boolean>

// 获取/设置首选模型
async getPreferredModel(): Promise<string>
async setPreferredModel(modelId: string): Promise<boolean>

// ⚠️ 已废弃: 使用 unifiedTokenTrackingService 替代
async recordModelUsage(...)  // @deprecated
async getModelUsageStats()   // @deprecated
```

### RobustUnifiedDataManager

增强版数据管理器，提供额外的健壮性特性:

```typescript
import { robustDataManager } from '@/services/robustUnifiedDataManager';

// 健壮读取 (带重试、校验)
const result = await robustDataManager.getData<MyData>('myKey', {
  skipCache: false,        // 是否跳过缓存
  skipValidation: false,   // 是否跳过数据校验
  timeout: 5000           // 超时时间(ms)
});

if (result.success) {
  console.log('数据:', result.data);
} else {
  console.error('错误:', result.errorMessage);
}

// 健壮写入 (带并发锁、重试)
const writeResult = await robustDataManager.setData('myKey', data, {
  skipValidation: false,
  bypassLock: false       // 是否绕过并发锁
});

// 批量获取 (控制并发数)
const batchResult = await robustDataManager.getBatchData<MyData>([
  'key1', 'key2', 'key3'
]);
console.log(batchResult.key1.data);  // 访问单个结果

// 数据存在性检查
const exists = await robustDataManager.dataExists('myKey');
```

**健壮性特性**:
- ✅ **并发写保护**: dataLockManager 防止数据竞争
- ✅ **自动重试**: retryManager 处理临时性故障
- ✅ **数据校验**: dataValidator 确保数据完整性
- ✅ **Checksum 验证**: 检测数据损坏
- ✅ **LRU 缓存**: 内存优化，自动淘汰旧数据
- ✅ **缓存命中率**: 性能监控指标

---

## 🔒 安全最佳实践

### 1. 用户数据隔离

**❌ 错误示例 (绕过隔离)**:

```typescript
// 直接操作 Supabase - 高危！
const { data } = await supabase
  .from('user_brand_corpus')
  .select('*')
  .eq('brand_name', `user_${userId}_favorites`);  // 手动拼接 - 易出错
```

**✅ 正确示例 (使用 DataFieldAdapter)**:

```typescript
// 通过 BaseDataManager - 安全！
const favorites = await this.getCloudData<string[]>('favorites');
// 内部自动调用 DataFieldAdapter.buildSecureFilter(userId, 'favorites')
```

### 2. 用户ID 强制设置

```typescript
// ✅ 初始化时设置用户ID
const manager = getGlobalDataManager();
manager.setUserId(currentUser.id);

// ❌ 未设置用户ID前调用会抛出异常
await manager.getData('favorites');  // Error: 用户ID未设置，无法访问云端数据
```

### 3. 敏感数据处理

```typescript
// ❌ 不要在 localStorage 存储敏感信息
await dataManager.setData('password', userPassword);  // 危险！

// ✅ 敏感数据仅存云端，禁用本地缓存
export const DATA_CONFIGS = {
  sensitiveData: {
    key: 'sensitiveData',
    category: DataCategory.USER_CRITICAL,
    syncToCloud: true,
    // 不设置 ttl，避免本地缓存
  }
};
```

### 4. 数据校验

```typescript
// 使用 RobustDataManager 自动校验
const result = await robustDataManager.setData('userProfile', {
  name: 'Alice',
  email: 'alice@example.com'
}, {
  skipValidation: false  // 强制校验
});

if (!result.success) {
  console.error('数据校验失败:', result.errorMessage);
}
```

---

## 📊 监控与调试

### 1. 启用日志

```typescript
// 初始化时启用详细日志
const manager = new UnifiedDataManager();
manager.setUserId('user123');  // 自动输出: ✅ 统一数据管理器已初始化，用户: user123

// 数据操作日志
await manager.getData('favorites');
// 输出: 📡 favorites: 数据可能已过期(2小时前) - 使用本地缓存
```

### 2. 数据统计

```typescript
const stats = dataManager.getDataStats();
console.log('数据分布:', {
  云端数据配置: stats.cloudData,      // 13个
  应用状态配置: stats.stateData,      // 2个
  临时缓存配置: stats.cacheData,      // 3个
  总配置数: stats.totalConfigs        // 18个
});
```

### 3. 缓存命中率监控 (RobustDataManager)

```typescript
// 获取缓存统计
const cacheStats = robustDataManager.getCacheStats();
console.log('缓存命中率:', cacheStats.hitRate.toFixed(2), '%');
console.log('缓存大小:', cacheStats.size, '/', cacheStats.maxSize);
```

### 4. 存储配额监控

```typescript
// 定期检查配额
setInterval(() => {
  const quota = storageQuotaMonitor.getQuotaInfo();

  if (quota.usagePercent >= 90) {
    logger.error('存储配额严重不足:', quota.usagePercent.toFixed(1), '%');
    storageQuotaMonitor.emergencyCleanup(2);
  }
}, 60000);  // 每分钟检查
```

### 5. 降级策略监控

```typescript
// 读取操作
const result = await fallbackStrategy.readWithFallback(...);
if (result?.message) {
  // 记录降级事件
  analytics.track('data_fallback', {
    key: 'favorites',
    freshness: result.freshness,
    source: result.source,
    message: result.message
  });
}
```

---

## ❓ 常见问题

### Q1: 什么时候使用 UnifiedDataManager vs RobustUnifiedDataManager?

**A**:
- **UnifiedDataManager**: 适用于大多数场景，提供基础的缓存、降级策略
- **RobustUnifiedDataManager**: 适用于高可靠性要求场景 (如支付数据、订单信息)，额外提供:
  - 并发写保护 (防止数据竞争)
  - 自动重试机制
  - 数据完整性校验 (Checksum)

### Q2: 降级策略如何处理离线场景?

**A**:
1. **读取**: 网络故障时自动返回本地缓存，标记为 `STALE` 并提示用户
2. **写入**: 数据先保存到本地，加入 `pendingSyncQueue`，网络恢复后自动后台同步
3. **用户提示**: 通过 `result.message` 字段告知用户数据状态

```typescript
if (result?.message) {
  showToast(result.message, 'info');  // "数据可能已过期(3小时前)"
}
```

### Q3: 如何处理 QuotaExceededError?

**A**: 三层防护:
1. **预防**: StorageQuotaMonitor 在 80% 时发出警告
2. **自动清理**: 达到 90% 时自动触发 `emergencyCleanup()`
3. **手动清理**: 提供 UI 让用户选择清理项目

```typescript
try {
  localStorage.setItem(key, value);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    storageQuotaMonitor.emergencyCleanup(2);  // 释放2MB
    localStorage.setItem(key, value);  // 重试
  }
}
```

### Q4: DataFieldAdapter 为什么需要双重隔离?

**A**: 多层防御:
- **user_id 字段**: 数据库层面强制过滤，防止 SQL 注入绕过
- **brand_name 前缀**: 即使攻击者绕过 user_id 检查，也无法访问他人数据
- **防御深度**: 单层防护失效时，第二层依然有效

### Q5: 如何迁移现有数据到新格式?

**A**: 提供迁移脚本:

```typescript
// scripts/migrateDataKeys.ts
import { DataFieldAdapter } from '@/services/base/DataFieldAdapter';

async function migrateUserData(userId: string) {
  const oldKeys = ['favorites', 'bookmarkedTopics', 'shareHistory'];

  for (const key of oldKeys) {
    // 读取旧格式数据
    const oldData = await supabase
      .from('user_brand_corpus')
      .select('*')
      .eq('brand_name', `user_${key}`)  // 旧格式
      .eq('user_id', userId)
      .single();

    if (oldData.data) {
      // 写入新格式
      const newKey = DataFieldAdapter.formatDataKey(userId, key);
      await supabase
        .from('user_brand_corpus')
        .upsert({
          user_id: userId,
          brand_name: newKey,  // 新格式: user_{userId}_{key}
          brand_description: oldData.data.brand_description
        });

      // 删除旧数据
      await supabase
        .from('user_brand_corpus')
        .delete()
        .eq('id', oldData.data.id);
    }
  }
}
```

### Q6: 如何调试数据不一致问题?

**A**: 使用 userStateSyncCoordinator:

```typescript
import { userStateSyncCoordinator } from '@/services/userStateSyncCoordinator';

// 检查各层状态
const diagnosis = await userStateSyncCoordinator.diagnoseInconsistency();
console.log('状态诊断:', diagnosis);
// 输出示例:
// {
//   contextUser: { id: 'user123', ... },
//   storeUser: { id: 'user123', ... },
//   secureUser: { id: 'user123', ... },
//   isConsistent: true,
//   differences: []
// }

// 手动同步修复
if (!diagnosis.isConsistent) {
  const syncResult = await userStateSyncCoordinator.syncOnLogin(
    diagnosis.secureUser,
    (user) => setContextUser(user)
  );
  console.log('同步结果:', syncResult);
}
```

---

## 📝 示例代码

### 完整流程示例: 用户收藏管理

```typescript
import { getGlobalDataManager } from '@/services/unifiedDataManager';
import { useUnifiedStore } from '@/stores/unified-state-store';

class FavoritesManager {
  private dataManager = getGlobalDataManager();

  // 初始化
  async init(userId: string) {
    this.dataManager.setUserId(userId);
    await this.dataManager.preloadCriticalData();
  }

  // 获取收藏列表
  async getFavorites(): Promise<string[]> {
    const favorites = await this.dataManager.getData<string[]>('favorites');
    return favorites || [];
  }

  // 添加收藏
  async addFavorite(itemId: string): Promise<boolean> {
    const current = await this.getFavorites();

    if (current.includes(itemId)) {
      return false;  // 已存在
    }

    const updated = [...current, itemId];
    const success = await this.dataManager.setData('favorites', updated);

    if (success) {
      // 同步到 Zustand Store (可选)
      const store = useUnifiedStore.getState();
      store.addFavorite({
        id: itemId,
        type: 'content',
        title: 'New Item',
        content: '',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return success;
  }

  // 移除收藏
  async removeFavorite(itemId: string): Promise<boolean> {
    const current = await this.getFavorites();
    const updated = current.filter(id => id !== itemId);

    const success = await this.dataManager.setData('favorites', updated);

    if (success) {
      const store = useUnifiedStore.getState();
      store.removeFavorite(itemId);
    }

    return success;
  }

  // 清理过期缓存
  cleanup() {
    this.dataManager.cleanupExpiredCache();
  }
}

// 使用示例
const favManager = new FavoritesManager();

// 用户登录后初始化
await favManager.init(currentUser.id);

// 添加收藏
const added = await favManager.addFavorite('article_123');
if (added) {
  showToast('收藏成功');
} else {
  showToast('已收藏过该内容');
}

// 获取收藏列表
const myFavorites = await favManager.getFavorites();
console.log('我的收藏:', myFavorites);
```

---

## 🎯 最佳实践总结

### ✅ DO

1. **总是设置用户ID**: 在任何数据操作前调用 `setUserId()`
2. **使用 DATA_CONFIGS**: 新增数据类型必须先配置
3. **利用降级策略**: 让系统自动处理网络故障
4. **监控存储配额**: 定期检查 localStorage 使用情况
5. **启用日志**: 开发环境启用详细日志便于调试
6. **批量操作**: 使用 `getBatchData()` 减少网络请求

### ❌ DON'T

1. **不要绕过 DataFieldAdapter**: 直接操作 Supabase 会破坏安全隔离
2. **不要硬编码字段名**: 使用适配器统一映射
3. **不要忽略降级提示**: `result.message` 应显示给用户
4. **不要在 localStorage 存敏感数据**: 使用仅云端配置
5. **不要忘记清理缓存**: 定期调用 `cleanupExpiredCache()`
6. **不要混用旧 API**: 已废弃的方法请尽快迁移

---

## 📚 相关文档

- [架构治理规范 (CLAUDE.md)](../CLAUDE.md)
- [统一状态管理 (unified-state-store.ts)](../src/stores/unified-state-store.ts)
- [用户状态同步协调器 (userStateSyncCoordinator.ts)](../src/services/userStateSyncCoordinator.ts)
- [Token 追踪服务 (unifiedTokenTrackingService.ts)](../src/services/unifiedTokenTrackingService.ts)

---

## 🔄 版本历史

- **v2.0** (2025-10-03): 重构为 BaseDataManager 继承体系
  - 新增 DataFieldAdapter 双重隔离
  - 新增 FallbackStrategy 降级策略
  - 新增 StorageQuotaMonitor 配额监控
  - 修复 P0 安全漏洞和 P1 性能问题

- **v1.0** (2025-09-01): 初版统一数据管理器
  - 三层存储架构
  - 基础缓存策略

---

**维护团队**: 文派AI开发组
**最后更新**: 2025-10-03
**反馈渠道**: [GitHub Issues](https://github.com/wenpai/issues)

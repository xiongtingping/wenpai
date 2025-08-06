# 🧾 AI Token 使用量统计系统

## 📋 系统概述

文派智能内容创作平台的Token使用量统计系统，实现了对所有AI调用的Token使用量进行统一管理、统计和限额控制。

### 🎯 主要功能

1. **统一Token统计** - 所有AI功能模块的Token使用量统一计入总额度
2. **实时限额检查** - AI调用前自动检查用户Token限额
3. **详细使用记录** - 记录每次AI调用的详细Token使用情况
4. **套餐管理** - 根据用户套餐类型设置不同的Token限额
5. **使用分析** - 按功能分类统计Token使用情况
6. **升级提醒** - 接近限额时自动提醒用户升级套餐

## 🏗️ 系统架构

### 核心组件

```
src/services/tokenUsageService.ts     # Token使用量统计服务
src/stores/tokenUsageStore.ts         # Token使用量状态管理
src/services/aiWithTokenTracking.ts   # AI调用Token统计包装器
src/hooks/useTokenLimitCheck.ts       # Token限额检查Hook
src/components/profile/TokenUsageSection.tsx  # Token统计展示组件
src/components/dialogs/TokenLimitDialog.tsx   # Token限额提醒对话框
```

### 数据流程

```
AI调用请求 → Token限额检查 → AI服务调用 → Token使用记录 → 统计更新 → 用户界面展示
```

## 📊 套餐配置

| 用户版本 | 月度Token限额 | 特性 |
|----------|---------------|------|
| 体验版   | 100,000      | 基础AI功能 |
| 专业版   | 200,000      | 高级AI模型 |
| 高级版   | 500,000      | 不限次数使用 |

## 🔧 使用方法

### 1. 在AI调用中集成Token统计

```typescript
import { callAIWithTokenTracking } from '@/services/aiWithTokenTracking';

// 使用带Token统计的AI调用
const response = await callAIWithTokenTracking({
  prompt: '生成内容...',
  feature: 'content_adaptation',
  taskType: AITaskType.CONTENT_ADAPTATION,
  model: 'gpt-3.5-turbo',
  userId: user.id
});

// 响应包含Token使用统计
console.log(response.tokenUsage);
```

### 2. 检查Token限额

```typescript
import { useTokenLimitCheck } from '@/hooks/useTokenLimitCheck';

const { checkTokenLimit } = useTokenLimitCheck();

// 检查是否可以使用指定数量的Token
const result = await checkTokenLimit(1000);
if (!result.allowed) {
  // 显示限额提醒
}
```

### 3. 显示Token使用统计

```typescript
import TokenUsageSection from '@/components/profile/TokenUsageSection';

// 在个人资料页面显示Token统计
<TokenUsageSection 
  userTier="pro"
  showDetails={true}
/>
```

## 📈 数据结构

### Token使用记录

```typescript
interface TokenUsageRecord {
  id: string;
  userId: string;
  feature: string;           // 功能类型
  taskType?: string;         // 任务类型
  inputTokens: number;       // 输入Token数量
  outputTokens: number;      // 输出Token数量
  totalTokens: number;       // 总Token数量
  model: string;             // AI模型
  timestamp: string;         // 使用时间
  contentSummary?: string;   // 内容摘要
  success: boolean;          // 是否成功
  error?: string;            // 错误信息
}
```

### Token使用统计

```typescript
interface TokenUsageStats {
  userId: string;
  userTier: SubscriptionTier;
  monthlyLimit: number;      // 月度限额
  monthlyUsed: number;       // 本月已使用
  monthlyRemaining: number;  // 本月剩余
  dailyUsed: number;         // 今日使用
  usagePercentage: number;   // 使用百分比
  needUpgrade: boolean;      // 是否需要升级
  lastUpdated: string;       // 最后更新时间
}
```

## 🛡️ 限额控制机制

### 检查时机
- AI调用前自动检查
- 用户主动查看统计时检查
- 页面加载时检查

### 限制策略
- **80%使用率** - 显示警告提醒
- **90%使用率** - 显示接近限额提醒
- **100%使用率** - 禁止继续使用，强制升级

### 提醒方式
- 页面内提醒横幅
- 弹窗对话框
- 个人资料页面状态显示

## 💾 数据存储

### 本地存储
- 使用localStorage缓存用户Token使用数据
- 支持离线查看历史记录
- 自动清理过期数据

### 后端存储
- Supabase数据库存储完整记录
- 支持跨设备数据同步
- 提供数据分析和报表功能

### 数据库表结构

```sql
-- Token使用记录表
CREATE TABLE token_usage_records (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL,
    feature VARCHAR(100) NOT NULL,
    task_type VARCHAR(100),
    input_tokens INTEGER NOT NULL,
    output_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    model VARCHAR(100) NOT NULL,
    content_summary TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户订阅信息表
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    tier VARCHAR(20) NOT NULL DEFAULT 'trial',
    monthly_token_limit INTEGER NOT NULL DEFAULT 100000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🧪 测试功能

访问 `/token-test` 页面可以测试Token统计系统的各项功能：

1. **AI调用测试** - 测试AI调用和Token统计
2. **限额检查测试** - 测试Token限额检查机制
3. **模拟数据生成** - 生成测试用的Token使用记录
4. **实时统计查看** - 查看实时的Token使用统计

## 🔄 集成步骤

### 1. 替换现有AI调用

将现有的 `callAI` 调用替换为 `callAIWithTokenTracking`：

```typescript
// 旧方式
const response = await callAI(params);

// 新方式（带Token统计）
const response = await callAIWithTokenTracking({
  ...params,
  feature: 'your_feature_name',
  userId: user.id
});
```

### 2. 添加限额检查

在AI功能入口添加Token限额检查：

```typescript
const { checkTokenLimit } = useTokenLimitCheck();

const handleAICall = async () => {
  const limitCheck = await checkTokenLimit(estimatedTokens);
  if (!limitCheck.allowed) {
    // 显示限额提醒，阻止调用
    return;
  }
  
  // 继续AI调用
  await callAIWithTokenTracking(params);
};
```

### 3. 显示使用统计

在相关页面添加Token使用统计展示：

```typescript
import TokenUsageSection from '@/components/profile/TokenUsageSection';

// 简单展示
<TokenUsageSection userTier={userTier} showDetails={false} />

// 详细展示
<TokenUsageSection userTier={userTier} showDetails={true} />
```

## 📝 注意事项

1. **数据一致性** - 本地和后端数据可能存在延迟，以后端数据为准
2. **错误处理** - Token统计失败不应影响AI功能的正常使用
3. **性能优化** - 大量历史记录需要分页加载
4. **隐私保护** - 内容摘要不包含敏感信息
5. **缓存策略** - 合理使用缓存减少API调用

## 🚀 未来扩展

1. **Token预测** - 基于历史使用预测月度Token消耗
2. **使用分析** - 提供更详细的使用分析和建议
3. **成本计算** - 显示Token使用对应的成本
4. **团队管理** - 支持团队Token额度分配和管理
5. **API限流** - 基于Token使用量进行API调用限流

---

## 🔗 相关文档

- [用户权限管理系统](./USER_PERMISSION_SYSTEM.md)
- [AI服务集成指南](./AI_SERVICE_INTEGRATION.md)
- [数据库设计文档](./database/token_usage_tables.sql)

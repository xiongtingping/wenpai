# 📚 邀请奖励系统完整使用指南

**创建时间：** 2025-10-05  
**版本：** v1.0  
**状态：** ✅ 生产就绪

---

## 📋 目录

1. [系统概述](#系统概述)
2. [快速开始](#快速开始)
3. [数据库设置](#数据库设置)
4. [服务使用](#服务使用)
5. [API参考](#api参考)
6. [测试指南](#测试指南)
7. [常见问题](#常见问题)

---

## 系统概述

### 功能模块

| 模块 | 功能 | 文件 |
|------|------|------|
| **邀请链接生成** | 生成唯一邀请码和链接 | `InviteLinkService.ts` |
| **邀请验证** | 验证邀请关系，防止无效邀请 | `InviteValidationService.ts` |
| **奖励发放** | 自动发放邀请奖励 | `InviteRewardService.ts` |
| **使用次数管理** | 管理AI使用次数 | `UsageCountService.ts` |
| **使用限制检查** | AI调用前检查次数 | `UsageLimitChecker.ts` |
| **邀请统计** | 统计邀请数据和排行榜 | `InviteStatsService.ts` |
| **奖励通知** | 发送奖励相关通知 | `RewardNotificationService.ts` |
| **使用次数重置** | 定时重置使用次数 | `UsageResetService.ts` |

### 奖励配置

**邀请人奖励：**
- 10次AI使用次数（永不过期）
- 50000 Token（永不过期）

**被邀请人奖励：**
- 5次AI使用次数（永不过期）
- 20000 Token（永不过期）
- 7天试用会员（7天后过期）

---

## 快速开始

### 1. 执行数据库脚本

```bash
# 在Supabase SQL编辑器中依次执行：

# 1. 创建奖励记录表和使用次数余额表
cat database_create_invite_rewards_table.sql

# 2. 创建邀请码表
cat database_create_invite_codes_table.sql

# 3. 添加用户ID索引（性能优化）
cat database_add_user_id_indexes.sql
```

### 2. 导入服务

```typescript
// 邀请链接生成
import { InviteLinkService } from '@/services/invite/InviteLinkService';

// 邀请验证和创建
import { InviteValidationService } from '@/services/inviteValidationService';

// 使用次数管理
import { UsageLimitChecker } from '@/services/usage/UsageLimitChecker';

// 邀请统计
import { InviteStatsService } from '@/services/invite/InviteStatsService';
```

### 3. 基本使用流程

```typescript
// 步骤1: 用户A生成邀请链接
const inviteLink = await InviteLinkService.generateInviteLink(userA.id);
console.log('邀请链接:', inviteLink.link);
// 输出: https://yourapp.com/invite?code=ABC12345

// 步骤2: 用户B使用邀请码注册
const validation = await InviteLinkService.validateInviteCode(
  'ABC12345',
  userB.id
);

if (validation.valid) {
  // 步骤3: 创建邀请关系（自动发放奖励）
  const result = await InviteValidationService.createInviteRelation(
    validation.inviterId!,
    userB.id,
    {
      invite_code: 'ABC12345',
      source: 'link'
    }
  );

  if (result.success) {
    console.log('✅ 邀请成功，奖励已发放！');
  }
}

// 步骤4: 用户B调用AI功能（自动检查和扣减使用次数）
const aiResult = await UsageLimitChecker.wrapAICall(
  {
    userId: userB.id,
    feature: 'content_generation'
  },
  async () => {
    return await aiService.generateContent(...);
  }
);
```

---

## 数据库设置

### 表结构

#### 1. invite_rewards（奖励记录表）

```sql
CREATE TABLE invite_rewards (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  reward_type VARCHAR(50) NOT NULL,
  reward_amount INT NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  related_invite_id VARCHAR(100),
  related_user_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'granted',
  expires_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. user_usage_balance（使用次数余额表）

```sql
CREATE TABLE user_usage_balance (
  user_id VARCHAR(100) PRIMARY KEY,
  total_count INT DEFAULT 0,
  used_count INT DEFAULT 0,
  remaining_count INT DEFAULT 0,
  base_count INT DEFAULT 0,
  bonus_count INT DEFAULT 0,
  last_reset_at TIMESTAMP,
  reset_period VARCHAR(20) DEFAULT 'monthly',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. user_invite_codes（邀请码表）

```sql
CREATE TABLE user_invite_codes (
  code VARCHAR(20) PRIMARY KEY,
  inviter_id VARCHAR(100) NOT NULL,
  used_count INT DEFAULT 0,
  max_uses INT DEFAULT 0,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 服务使用

### InviteLinkService（邀请链接生成）

#### 生成邀请链接

```typescript
const inviteLink = await InviteLinkService.generateInviteLink(userId);

console.log(inviteLink);
// {
//   code: 'ABC12345',
//   link: 'https://yourapp.com/invite?code=ABC12345',
//   inviterId: 'user_123',
//   createdAt: Date,
//   expiresAt: null,
//   usedCount: 0,
//   maxUses: 0
// }
```

#### 验证邀请码

```typescript
const validation = await InviteLinkService.validateInviteCode(
  'ABC12345',
  inviteeId
);

if (validation.valid) {
  console.log('邀请码有效，邀请人ID:', validation.inviterId);
} else {
  console.error('邀请码无效:', validation.error);
  // 可能的错误：
  // - INVALID_CODE: 邀请码不存在
  // - EXPIRED: 邀请码已过期
  // - MAX_USES_REACHED: 已达到最大使用次数
  // - SELF_INVITE: 不能使用自己的邀请码
}
```

#### 获取用户的邀请链接列表

```typescript
const inviteLinks = await InviteLinkService.getUserInviteLinks(userId);

inviteLinks.forEach(link => {
  console.log(`邀请码: ${link.code}, 使用次数: ${link.usedCount}`);
});
```

### InviteValidationService（邀请验证）

#### 创建邀请关系（自动发放奖励）

```typescript
const result = await InviteValidationService.createInviteRelation(
  inviterId,
  inviteeId,
  {
    invite_code: 'ABC12345',
    source: 'link'  // 或 'qrcode', 'share'
  }
);

if (result.success) {
  console.log('✅ 邀请关系创建成功');
  console.log('✅ 奖励已自动发放');
  console.log('✅ 邀请统计已更新');
} else {
  console.error('❌ 创建失败:', result.error);
  // 可能的错误：
  // - SELF_INVITE: 不能邀请自己
  // - ALREADY_INVITED: 该用户已被邀请
  // - CIRCULAR_INVITE: 循环邀请
}
```

### UsageLimitChecker（使用限制检查）

#### 包装AI调用（推荐方式）

```typescript
try {
  const result = await UsageLimitChecker.wrapAICall(
    {
      userId: user.id,
      feature: 'content_generation',
      usageCount: 1  // 可选，默认为1
    },
    async () => {
      // 你的AI调用逻辑
      return await aiService.generateContent({
        prompt: '生成一篇文章...'
      });
    }
  );

  console.log('AI生成结果:', result);
} catch (error) {
  if (error instanceof UsageLimitError) {
    console.error('使用次数不足:', error.getUserFriendlyMessage());
    console.log('剩余次数:', error.remainingCount);
    console.log('建议操作:', error.suggestedAction);
    // suggestedAction 可能是: 'upgrade', 'invite', 'wait'
  }
}
```

#### 手动检查使用次数

```typescript
const limitCheck = await UsageLimitChecker.checkLimit(
  userId,
  'content_generation',
  1
);

if (limitCheck.allowed) {
  console.log('✅ 可以使用，剩余次数:', limitCheck.remainingCount);
  // 执行AI调用...
} else {
  console.log('❌ 使用次数不足');
  console.log('原因:', limitCheck.reason);
  console.log('建议:', limitCheck.suggestedAction);
}
```

#### 获取剩余使用次数

```typescript
const remainingCount = await UsageLimitChecker.getRemainingCount(
  userId,
  'content_generation'
);

console.log(`剩余使用次数: ${remainingCount}`);
```

### InviteStatsService（邀请统计）

#### 获取用户邀请统计

```typescript
const stats = await InviteStatsService.getInviteStats(userId);

console.log(stats);
// {
//   userId: 'user_123',
//   totalInvites: 10,
//   successfulInvites: 8,
//   pendingInvites: 2,
//   totalRewards: 80,
//   updatedAt: Date
// }
```

#### 获取邀请排行榜

```typescript
const leaderboard = await InviteStatsService.getInviteLeaderboard(10);

leaderboard.forEach((entry, index) => {
  console.log(`${entry.rank}. 用户${entry.userId}: ${entry.successfulInvites}次成功邀请`);
});
```

#### 获取用户排名

```typescript
const rank = await InviteStatsService.getUserRank(userId);

if (rank) {
  console.log(`您的排名: 第${rank}名`);
} else {
  console.log('您还没有邀请记录');
}
```

### InviteRewardService（奖励管理）

#### 查询用户奖励记录

```typescript
const rewards = await InviteRewardService.getUserRewards(userId, {
  status: RewardStatus.GRANTED,
  rewardType: RewardType.USAGE_COUNT,
  limit: 10
});

rewards.forEach(reward => {
  console.log(`奖励类型: ${reward.rewardType}, 数量: ${reward.rewardAmount}`);
});
```

#### 统计用户总奖励

```typescript
const summary = await InviteRewardService.getUserRewardSummary(userId);

console.log(`总使用次数奖励: ${summary.totalUsageCount}`);
console.log(`总Token奖励: ${summary.totalTokenBonus}`);
console.log(`总会员天数奖励: ${summary.totalMemberDays}`);
```

---

## API参考

### 配置文件

#### inviteRewardConfig.ts

```typescript
import { INVITE_REWARDS, USAGE_COUNT_CONFIG } from '@/config/inviteRewardConfig';

// 获取邀请人奖励配置
const inviterRewards = INVITE_REWARDS.inviter;

// 获取被邀请人奖励配置
const inviteeRewards = INVITE_REWARDS.invitee;

// 获取使用次数配置
const usageConfig = USAGE_COUNT_CONFIG;
```

### 错误处理

#### UsageLimitError

```typescript
try {
  await UsageLimitChecker.wrapAICall(...);
} catch (error) {
  if (error instanceof UsageLimitError) {
    // 使用次数不足错误
    console.error(error.getUserFriendlyMessage());
    
    // 获取详细信息
    const errorInfo = error.toJSON();
    console.log(errorInfo);
    // {
    //   name: 'UsageLimitError',
    //   message: '使用次数不足',
    //   remainingCount: 0,
    //   suggestedAction: 'invite',
    //   userFriendlyMessage: '使用次数不足，邀请好友可获得额外使用次数'
    // }
  }
}
```

---

## 测试指南

### 单元测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { InviteLinkService } from '@/services/invite/InviteLinkService';

describe('InviteLinkService', () => {
  it('应该生成唯一的邀请码', async () => {
    const link1 = await InviteLinkService.generateInviteLink('user1');
    const link2 = await InviteLinkService.generateInviteLink('user1');
    
    expect(link1.code).not.toBe(link2.code);
  });

  it('应该验证有效的邀请码', async () => {
    const link = await InviteLinkService.generateInviteLink('user1');
    const validation = await InviteLinkService.validateInviteCode(link.code, 'user2');
    
    expect(validation.valid).toBe(true);
    expect(validation.inviterId).toBe('user1');
  });

  it('应该拒绝自我邀请', async () => {
    const link = await InviteLinkService.generateInviteLink('user1');
    const validation = await InviteLinkService.validateInviteCode(link.code, 'user1');
    
    expect(validation.valid).toBe(false);
    expect(validation.errorCode).toBe('SELF_INVITE');
  });
});
```

### 集成测试示例

```typescript
describe('完整邀请流程', () => {
  it('应该完成从生成链接到发放奖励的完整流程', async () => {
    // 1. 生成邀请链接
    const inviteLink = await InviteLinkService.generateInviteLink('userA');
    expect(inviteLink.code).toBeDefined();

    // 2. 验证邀请码
    const validation = await InviteLinkService.validateInviteCode(
      inviteLink.code,
      'userB'
    );
    expect(validation.valid).toBe(true);

    // 3. 创建邀请关系
    const result = await InviteValidationService.createInviteRelation(
      'userA',
      'userB',
      { invite_code: inviteLink.code }
    );
    expect(result.success).toBe(true);

    // 4. 验证奖励发放
    const userARewards = await InviteRewardService.getUserRewards('userA');
    const userBRewards = await InviteRewardService.getUserRewards('userB');
    
    expect(userARewards.length).toBeGreaterThan(0);
    expect(userBRewards.length).toBeGreaterThan(0);

    // 5. 验证使用次数增加
    const userBBalance = await UsageCountService.getRemainingCount('userB');
    expect(userBBalance.bonusCount).toBeGreaterThan(0);
  });
});
```

---

## 常见问题

### Q1: 如何修改奖励配置？

**A:** 编辑 `src/config/inviteRewardConfig.ts` 文件：

```typescript
export const INVITE_REWARDS: InviteRewardConfig = {
  inviter: [
    {
      type: RewardType.USAGE_COUNT,
      amount: 20,  // 修改为20次
      expiryDays: 0,
      description: '邀请好友成功，获得20次AI使用次数'
    }
  ],
  // ...
};
```

### Q2: 如何禁用使用次数限制？

**A:** 在 `inviteRewardConfig.ts` 中设置：

```typescript
export const USAGE_COUNT_CONFIG = {
  // ...
  enableLimit: false,  // 设置为false
  // ...
};
```

### Q3: 如何手动发放奖励？

**A:** 使用 `InviteRewardService.grantInviteReward`：

```typescript
const result = await InviteRewardService.grantInviteReward(
  inviterId,
  inviteeId,
  inviteRelationId
);
```

### Q4: 如何重置所有用户的使用次数？

**A:** 使用 `UsageResetService.executeMonthlyReset`：

```typescript
const result = await UsageResetService.executeMonthlyReset();
console.log(`成功重置 ${result.successCount} 个用户`);
```

### Q5: 如何查看用户的邀请统计？

**A:** 使用 `InviteStatsService.getInviteStats`：

```typescript
const stats = await InviteStatsService.getInviteStats(userId);
console.log(`成功邀请: ${stats.successfulInvites}次`);
```

---

## 附录

### 文件清单

**数据库脚本：**
- `database_create_invite_rewards_table.sql` - 奖励记录表
- `database_create_invite_codes_table.sql` - 邀请码表
- `database_add_user_id_indexes.sql` - 性能优化索引

**配置文件：**
- `src/config/inviteRewardConfig.ts` - 奖励配置

**服务文件：**
- `src/services/invite/InviteLinkService.ts` - 邀请链接生成
- `src/services/invite/InviteRewardService.ts` - 奖励发放
- `src/services/invite/InviteStatsService.ts` - 邀请统计
- `src/services/inviteValidationService.ts` - 邀请验证
- `src/services/usage/UsageCountService.ts` - 使用次数管理
- `src/services/usage/UsageLimitChecker.ts` - 使用限制检查
- `src/services/usage/UsageResetService.ts` - 使用次数重置
- `src/services/notification/RewardNotificationService.ts` - 奖励通知

**工具文件：**
- `src/utils/userIdValidator.ts` - 用户ID验证

---

**最后更新：** 2025-10-05  
**版本：** v1.0  
**状态：** ✅ 生产就绪


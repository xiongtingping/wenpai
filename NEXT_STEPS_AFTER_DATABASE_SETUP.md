# ✅ 数据库设置完成 - 下一步行动指南

**状态：** 数据库脚本已执行 ✅

---

## 🧪 第一步：验证安装

在 Supabase SQL 编辑器中执行以下验证脚本：

```sql
-- ============================================
-- 验证脚本
-- ============================================

-- 1. 检查表是否创建成功
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN (
  'invite_rewards',
  'user_usage_balance',
  'user_invite_codes'
)
ORDER BY table_name;

-- 应该返回3行：
-- invite_rewards (10列)
-- user_invite_codes (6列)
-- user_usage_balance (9列)

-- 2. 检查索引是否创建
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE tablename IN (
  'invite_rewards',
  'user_usage_balance',
  'user_invite_codes'
)
ORDER BY tablename, indexname;

-- 应该看到多个索引

-- 3. 检查触发器是否创建
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN (
  'invite_rewards',
  'user_usage_balance',
  'user_invite_codes'
)
ORDER BY event_object_table, trigger_name;

-- 应该看到更新时间触发器和计算触发器

-- 4. 测试插入数据（使用你的真实 user_id）
INSERT INTO user_usage_balance (user_id, base_count, bonus_count)
VALUES ('6882df3f2f9efaa6e241dce5', 10, 5);

-- 5. 验证自动计算是否工作
SELECT 
  user_id,
  base_count,
  bonus_count,
  total_count,  -- 应该是 15 (10+5)
  used_count,   -- 应该是 0
  remaining_count  -- 应该是 15 (15-0)
FROM user_usage_balance 
WHERE user_id = '6882df3f2f9efaa6e241dce5';

-- 6. 测试使用次数扣减
UPDATE user_usage_balance 
SET used_count = 3 
WHERE user_id = '6882df3f2f9efaa6e241dce5';

-- 7. 验证剩余次数自动更新
SELECT 
  user_id,
  total_count,  -- 应该还是 15
  used_count,   -- 应该是 3
  remaining_count  -- 应该是 12 (15-3)
FROM user_usage_balance 
WHERE user_id = '6882df3f2f9efaa6e241dce5';

-- 8. 清理测试数据
DELETE FROM user_usage_balance WHERE user_id = '6882df3f2f9efaa6e241dce5';

-- ============================================
-- 如果以上所有查询都成功，说明安装完成！✅
-- ============================================
```

---

## 🎯 第二步：集成到应用

### 1. 测试服务是否正常工作

创建一个测试文件：

```typescript
// test-invite-system.ts
import { InviteLinkService } from '@/services/invite/InviteLinkService';
import { InviteValidationService } from '@/services/inviteValidationService';
import { UsageCountService } from '@/services/usage/UsageCountService';
import { UsageLimitChecker } from '@/services/usage/UsageLimitChecker';

async function testInviteSystem() {
  const testUserId = '6882df3f2f9efaa6e241dce5'; // 你的真实 user_id
  
  console.log('🧪 开始测试邀请系统...\n');
  
  // 测试1: 生成邀请链接
  console.log('测试1: 生成邀请链接');
  const inviteLink = await InviteLinkService.generateInviteLink(testUserId);
  console.log('✅ 邀请链接:', inviteLink?.link);
  console.log('✅ 邀请码:', inviteLink?.code);
  
  // 测试2: 验证邀请码
  console.log('\n测试2: 验证邀请码');
  const validation = await InviteLinkService.validateInviteCode(inviteLink!.code);
  console.log('✅ 验证结果:', validation.valid ? '有效' : '无效');
  
  // 测试3: 初始化使用次数
  console.log('\n测试3: 初始化使用次数');
  const balance = await UsageCountService.getRemainingCount(testUserId);
  console.log('✅ 剩余次数:', balance.remainingCount);
  console.log('✅ 基础次数:', balance.baseCount);
  console.log('✅ 奖励次数:', balance.bonusCount);
  
  // 测试4: 扣减使用次数
  console.log('\n测试4: 扣减使用次数');
  const decrementResult = await UsageCountService.decrementUsageCount(testUserId, 'test', 1);
  console.log('✅ 扣减结果:', decrementResult.success ? '成功' : '失败');
  console.log('✅ 剩余次数:', decrementResult.remainingCount);
  
  // 测试5: 增加奖励次数
  console.log('\n测试5: 增加奖励次数');
  const incrementResult = await UsageCountService.incrementUsageCount(testUserId, 5, 'test_reward');
  console.log('✅ 增加结果:', incrementResult.success ? '成功' : '失败');
  console.log('✅ 新的剩余次数:', incrementResult.remainingCount);
  
  console.log('\n🎉 所有测试完成！');
}

// 运行测试
testInviteSystem().catch(console.error);
```

### 2. 在应用中集成使用次数检查

找到你的 AI 调用代码，添加使用次数检查：

**修改前：**
```typescript
// 直接调用 AI
const result = await aiService.generateContent({
  prompt: userPrompt
});
```

**修改后：**
```typescript
import { UsageLimitChecker } from '@/services/usage/UsageLimitChecker';

// 使用 UsageLimitChecker 包装 AI 调用
try {
  const result = await UsageLimitChecker.wrapAICall(
    {
      userId: currentUser.id,
      feature: 'content_generation'
    },
    async () => {
      return await aiService.generateContent({
        prompt: userPrompt
      });
    }
  );
  
  // 处理结果
  console.log('AI 生成结果:', result);
} catch (error) {
  if (error instanceof UsageLimitError) {
    // 使用次数不足
    console.error('使用次数不足:', error.getUserFriendlyMessage());
    
    // 根据建议操作引导用户
    if (error.suggestedAction === 'invite') {
      // 引导用户邀请好友
      showInviteDialog();
    } else if (error.suggestedAction === 'upgrade') {
      // 引导用户升级套餐
      showUpgradeDialog();
    }
  } else {
    // 其他错误
    console.error('AI 调用失败:', error);
  }
}
```

### 3. 添加邀请功能到 UI

在用户设置或个人中心页面添加邀请功能：

```typescript
// InviteSection.tsx
import { useState, useEffect } from 'react';
import { InviteLinkService } from '@/services/invite/InviteLinkService';
import { InviteStatsService } from '@/services/invite/InviteStatsService';

export function InviteSection({ userId }: { userId: string }) {
  const [inviteLink, setInviteLink] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    loadInviteData();
  }, [userId]);
  
  async function loadInviteData() {
    // 生成邀请链接
    const link = await InviteLinkService.generateInviteLink(userId);
    setInviteLink(link?.link || '');
    
    // 获取邀请统计
    const inviteStats = await InviteStatsService.getInviteStats(userId);
    setStats(inviteStats);
  }
  
  function copyInviteLink() {
    navigator.clipboard.writeText(inviteLink);
    alert('邀请链接已复制！');
  }
  
  return (
    <div className="invite-section">
      <h3>邀请好友</h3>
      <p>邀请好友注册，你和好友都能获得奖励！</p>
      
      <div className="invite-rewards">
        <div>你将获得：10次AI使用 + 50000 Token</div>
        <div>好友将获得：5次AI使用 + 20000 Token + 7天会员</div>
      </div>
      
      <div className="invite-link">
        <input type="text" value={inviteLink} readOnly />
        <button onClick={copyInviteLink}>复制链接</button>
      </div>
      
      {stats && (
        <div className="invite-stats">
          <div>成功邀请：{stats.successfulInvites} 人</div>
          <div>总奖励：{stats.totalRewards}</div>
        </div>
      )}
    </div>
  );
}
```

### 4. 处理邀请码注册流程

在用户注册页面处理邀请码：

```typescript
// RegisterPage.tsx
import { InviteLinkService } from '@/services/invite/InviteLinkService';
import { InviteValidationService } from '@/services/inviteValidationService';

async function handleRegister(userData: any) {
  // 1. 通过 Authing 注册用户
  const authingUser = await authingSDK.register(userData);
  const newUserId = authingUser.id;
  
  // 2. 检查 URL 中是否有邀请码
  const urlParams = new URLSearchParams(window.location.search);
  const inviteCode = urlParams.get('code');
  
  if (inviteCode) {
    // 3. 验证邀请码
    const validation = await InviteLinkService.validateInviteCode(inviteCode, newUserId);
    
    if (validation.valid) {
      // 4. 创建邀请关系（自动发放奖励）
      const result = await InviteValidationService.createInviteRelation(
        validation.inviterId!,
        newUserId,
        {
          invite_code: inviteCode,
          source: 'link'
        }
      );
      
      if (result.success) {
        console.log('✅ 邀请奖励已发放！');
        // 显示欢迎消息和奖励信息
        showWelcomeWithRewards();
      }
    }
  }
  
  // 5. 跳转到主页
  router.push('/');
}
```

---

## 📊 第三步：监控和维护

### 1. 设置定时任务（每月重置使用次数）

```typescript
// cron-jobs/reset-usage-counts.ts
import { UsageResetService } from '@/services/usage/UsageResetService';

// 每月1号凌晨执行
export async function monthlyResetJob() {
  console.log('🔄 开始执行月度使用次数重置...');
  
  const result = await UsageResetService.executeMonthlyReset();
  
  console.log(`✅ 重置完成！`);
  console.log(`  - 成功: ${result.successCount} 个用户`);
  console.log(`  - 失败: ${result.failureCount} 个用户`);
  
  if (result.errors.length > 0) {
    console.error('❌ 重置错误:', result.errors);
  }
}
```

### 2. 监控邀请统计

```typescript
// admin/invite-dashboard.ts
import { InviteStatsService } from '@/services/invite/InviteStatsService';

async function getInviteDashboard() {
  // 获取排行榜
  const leaderboard = await InviteStatsService.getInviteLeaderboard(10);
  
  console.log('📊 邀请排行榜：');
  leaderboard.forEach((entry, index) => {
    console.log(`${entry.rank}. 用户${entry.userId}: ${entry.successfulInvites}次成功邀请`);
  });
  
  return leaderboard;
}
```

### 3. 查询使用次数统计

```sql
-- 查看所有用户的使用次数统计
SELECT 
  user_id,
  total_count,
  used_count,
  remaining_count,
  base_count,
  bonus_count,
  last_reset_at
FROM user_usage_balance
ORDER BY remaining_count DESC
LIMIT 20;

-- 查看邀请奖励发放记录
SELECT 
  user_id,
  reward_type,
  reward_amount,
  source_type,
  status,
  created_at
FROM invite_rewards
ORDER BY created_at DESC
LIMIT 20;

-- 查看邀请码使用情况
SELECT 
  code,
  inviter_id,
  used_count,
  max_uses,
  created_at
FROM user_invite_codes
ORDER BY used_count DESC
LIMIT 20;
```

---

## 🎯 第四步：配置调整（可选）

如果需要修改奖励配置，编辑 `src/config/inviteRewardConfig.ts`：

```typescript
// 修改邀请人奖励
export const INVITE_REWARDS: InviteRewardConfig = {
  inviter: [
    {
      type: RewardType.USAGE_COUNT,
      amount: 20,  // 改为 20 次
      expiryDays: 0,
      description: '邀请好友成功，获得20次AI使用次数'
    },
    {
      type: RewardType.TOKEN_BONUS,
      amount: 100000,  // 改为 100000 Token
      expiryDays: 0,
      description: '邀请好友成功，获得100000 Token奖励'
    }
  ],
  // ...
};

// 修改使用次数配置
export const USAGE_COUNT_CONFIG = {
  baseCounts: {
    trial: 20,      // 试用版改为 20 次/月
    pro: 200,       // 专业版改为 200 次/月
    premium: 1000   // 高级版改为 1000 次/月
  },
  resetPeriod: 'monthly',  // 或改为 'daily', 'never'
  enableLimit: true,       // 是否启用使用次数限制
  // ...
};
```

---

## ✅ 完成检查清单

- [ ] 数据库表创建成功（3个表）
- [ ] 索引创建成功（多个索引）
- [ ] 触发器工作正常（自动计算剩余次数）
- [ ] 测试脚本运行成功
- [ ] AI 调用已集成使用次数检查
- [ ] 邀请功能已添加到 UI
- [ ] 注册流程已处理邀请码
- [ ] 定时任务已设置（月度重置）
- [ ] 监控和统计已配置

---

## 📚 相关文档

- `INVITE_REWARD_USAGE_COMPLETE_GUIDE.md` - 完整使用指南
- `ALL_FIXES_COMPLETE_REPORT.md` - 修复完成报告
- `FINAL_DATABASE_SETUP_GUIDE.md` - 数据库设置指南

---

**🎉 恭喜！邀请奖励系统已完全就绪！**

**下一步：** 运行验证脚本，然后开始集成到应用中！


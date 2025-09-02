/**
 * 用户权限测试脚本
 * 测试不同等级用户的权限显示是否正确
 */

// 模拟不同等级的用户数据
const testUsers = {
  // 体验版用户
  trialUser: {
    id: 'test_trial_user',
    username: 'trial_user',
    subscription: null,
    vipLevel: null,
    isVip: false,
    permissions: [],
    tier: null
  },

  // 专业版用户 - 通过vipLevel判断
  proUserByVipLevel: {
    id: 'test_pro_user_vip',
    username: 'pro_user_vip',
    subscription: null,
    vipLevel: 'pro',
    isVip: true,
    permissions: [],
    tier: null
  },

  // 专业版用户 - 通过subscription判断
  proUserBySubscription: {
    id: 'test_pro_user_sub',
    username: 'pro_user_sub',
    subscription: {
      tier: 'pro',
      isActive: true,
      expiresAt: '2025-12-31T23:59:59Z'
    },
    vipLevel: null,
    isVip: false,
    permissions: [],
    tier: null
  },

  // 专业版用户 - 通过permissions判断
  proUserByPermissions: {
    id: 'test_pro_user_perm',
    username: 'pro_user_perm',
    subscription: null,
    vipLevel: null,
    isVip: false,
    permissions: ['tier:pro'],
    tier: null
  },

  // 高级版用户 - 通过vipLevel判断
  premiumUserByVipLevel: {
    id: 'test_premium_user_vip',
    username: 'premium_user_vip',
    subscription: null,
    vipLevel: 'premium',
    isVip: true,
    permissions: [],
    tier: null
  },

  // 高级版用户 - 通过subscription判断
  premiumUserBySubscription: {
    id: 'test_premium_user_sub',
    username: 'premium_user_sub',
    subscription: {
      tier: 'premium',
      isActive: true,
      expiresAt: '2025-12-31T23:59:59Z'
    },
    vipLevel: null,
    isVip: false,
    permissions: [],
    tier: null
  },

  // 高级版用户 - 通过permissions判断
  premiumUserByPermissions: {
    id: 'test_premium_user_perm',
    username: 'premium_user_perm',
    subscription: null,
    vipLevel: null,
    isVip: false,
    permissions: ['tier:premium'],
    tier: null
  }
};

// 模拟getUserTier函数
function getUserTier(user) {
  if (!user) return 'trial';

  // 优先从用户订阅信息获取
  if (user?.subscription?.tier) {
    return user.subscription.tier;
  }
  
  // 从用户VIP等级推断
  if (user?.vipLevel === 'premium') return 'premium';
  if (user?.vipLevel === 'pro') return 'pro';
  if (user?.isVip) return 'pro';
  
  // 从权限推断
  if (user?.permissions?.includes('tier:premium')) return 'premium';
  if (user?.permissions?.includes('tier:pro')) return 'pro';
  
  // 默认为体验版
  return 'trial';
}

// 获取使用次数限制
function getUsageLimit(tier) {
  const limits = {
    trial: 10,
    pro: 30,
    premium: -1 // 无限制
  };
  return limits[tier] || 10;
}

// 获取Token限制
function getTokenLimit(tier) {
  const limits = {
    trial: 100000,
    pro: 200000,
    premium: 500000
  };
  return limits[tier] || 100000;
}

// 获取可用模型
function getAvailableModels(tier) {
  const models = {
    trial: ['GPT-4o mini', 'DeepSeek v3'],
    pro: ['GPT-4o', 'GPT-4o mini', 'DeepSeek v3'],
    premium: ['GPT-4o', 'GPT-4o mini', 'DeepSeek v3']
  };
  return models[tier] || models.trial;
}

// 获取可用功能
function getAvailableFeatures(tier) {
  const features = {
    trial: ['全网雷达', '我的资料库'],
    pro: ['全网雷达', '创意魔方', '我的资料库'],
    premium: ['全网雷达', '创意魔方', '我的资料库', '品牌库']
  };
  return features[tier] || features.trial;
}

// 测试函数
function testUserPermissions() {
  console.log('🧪 开始测试用户权限系统...\n');

  Object.entries(testUsers).forEach(([userType, user]) => {
    const tier = getUserTier(user);
    const usageLimit = getUsageLimit(tier);
    const tokenLimit = getTokenLimit(tier);
    const availableModels = getAvailableModels(tier);
    const availableFeatures = getAvailableFeatures(tier);

    console.log(`👤 ${userType}:`);
    console.log(`   用户ID: ${user.id}`);
    console.log(`   检测等级: ${tier}`);
    console.log(`   使用次数限制: ${usageLimit === -1 ? '无限制' : usageLimit + '次/月'}`);
    console.log(`   Token限制: ${tokenLimit.toLocaleString()}/月`);
    console.log(`   可用模型: ${availableModels.join(', ')}`);
    console.log(`   可用功能: ${availableFeatures.join(', ')}`);
    console.log('');
  });

  // 验证等级检测逻辑
  console.log('✅ 等级检测验证:');
  console.log(`   体验版用户: ${getUserTier(testUsers.trialUser) === 'trial' ? '✅' : '❌'}`);
  console.log(`   专业版用户(VIP): ${getUserTier(testUsers.proUserByVipLevel) === 'pro' ? '✅' : '❌'}`);
  console.log(`   专业版用户(订阅): ${getUserTier(testUsers.proUserBySubscription) === 'pro' ? '✅' : '❌'}`);
  console.log(`   专业版用户(权限): ${getUserTier(testUsers.proUserByPermissions) === 'pro' ? '✅' : '❌'}`);
  console.log(`   高级版用户(VIP): ${getUserTier(testUsers.premiumUserByVipLevel) === 'premium' ? '✅' : '❌'}`);
  console.log(`   高级版用户(订阅): ${getUserTier(testUsers.premiumUserBySubscription) === 'premium' ? '✅' : '❌'}`);
  console.log(`   高级版用户(权限): ${getUserTier(testUsers.premiumUserByPermissions) === 'premium' ? '✅' : '❌'}`);
}

// 运行测试
testUserPermissions();

// 导出测试数据供浏览器使用
if (typeof window !== 'undefined') {
  window.testUsers = testUsers;
  window.getUserTier = getUserTier;
  window.getUsageLimit = getUsageLimit;
  window.testUserPermissions = testUserPermissions;
}

module.exports = {
  testUsers,
  getUserTier,
  getUsageLimit,
  getTokenLimit,
  getAvailableModels,
  getAvailableFeatures,
  testUserPermissions
};

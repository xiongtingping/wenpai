/**
 * 后端API服务器 - Express/Node.js
 * 处理所有业务逻辑，只使用Authing的身份信息
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { AuthenticationClient } from 'authing-js-sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://www.wenpai.xyz',
  credentials: true
}));
app.use(bodyParser.json());

// Authing客户端初始化
const authingClient = new AuthenticationClient({
  appId: process.env.AUTHING_APP_ID,
  appHost: process.env.AUTHING_HOST,
});

// 内存数据库（实际项目中应使用真实数据库）
const users = new Map();
const inviteRelations = new Map();
const userUsage = new Map();
const userBalance = new Map();
const userActions = new Map();
const paymentOrders = new Map();

// 认证中间件
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const userId = req.headers['x-user-id'];

  if (!token) {
    return res.status(401).json({ error: '缺少访问令牌' });
  }

  try {
    // 验证Authing Token
    const userInfo = await authingClient.checkLoginStatus(token);
    if (!userInfo) {
      return res.status(401).json({ error: '无效的访问令牌' });
    }

    req.user = userInfo;
    req.userId = userId || userInfo.id;
    next();
  } catch (error) {
    console.error('Token验证失败:', error);
    return res.status(401).json({ error: 'Token验证失败' });
  }
};

// ==================== 用户管理API ====================

/**
 * 同步用户信息到后端
 */
app.post('/api/user/sync', authenticateToken, async (req, res) => {
  try {
    const userData = req.body;
    const userId = req.userId;

    // 存储用户信息
    users.set(userId, {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log('用户信息同步成功:', userId);
    res.json({ success: true, message: '用户信息同步成功' });
  } catch (error) {
    console.error('用户信息同步失败:', error);
    res.status(500).json({ error: '用户信息同步失败' });
  }
});

/**
 * 创建用户
 */
app.post('/api/user/create', authenticateToken, async (req, res) => {
  try {
    const userData = req.body;
    const userId = req.userId;
    const { inviterId } = userData;

    // 创建用户记录
    users.set(userId, {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 初始化用户数据
    userUsage.set(userId, {
      aiContentAdapter: 10,
      creativeCube: 0,
      hotTopics: 5,
      totalUsed: 0,
      lastDistributed: new Date().toISOString(),
    });

    userBalance.set(userId, {
      balance: 0,
      points: 0,
      rewards: 0,
    });

    // 如果有邀请人，处理邀请关系
    if (inviterId) {
      await handleInviteRelation(inviterId, userId);
    }

    console.log('用户创建成功:', userId);
    res.json({ success: true, message: '用户创建成功' });
  } catch (error) {
    console.error('用户创建失败:', error);
    res.status(500).json({ error: '用户创建失败' });
  }
});

/**
 * 获取用户资料
 */
app.get('/api/user/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    console.error('获取用户资料失败:', error);
    res.status(500).json({ error: '获取用户资料失败' });
  }
});

/**
 * 更新用户资料
 */
app.put('/api/user/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const user = users.get(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 更新用户信息
    users.set(userId, {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    console.log('用户资料更新成功:', userId);
    res.json({ success: true, message: '用户资料更新成功' });
  } catch (error) {
    console.error('用户资料更新失败:', error);
    res.status(500).json({ error: '用户资料更新失败' });
  }
});

// ==================== 邀请系统API ====================

/**
 * 生成邀请链接
 */
app.get('/api/invite/link/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const baseUrl = process.env.FRONTEND_URL || 'https://www.wenpai.xyz';
    const inviteLink = `${baseUrl}/register?inviter=${userId}`;

    console.log('邀请链接生成成功:', userId);
    res.json({ inviteLink });
  } catch (error) {
    console.error('邀请链接生成失败:', error);
    res.status(500).json({ error: '邀请链接生成失败' });
  }
});

/**
 * 绑定邀请关系
 */
app.post('/api/invite/bind', authenticateToken, async (req, res) => {
  try {
    const { inviterId, inviteeId } = req.body;

    // 检查是否已经存在邀请关系
    const existingRelation = inviteRelations.get(inviteeId);
    if (existingRelation) {
      return res.status(400).json({ error: '邀请关系已存在' });
    }

    // 创建邀请关系
    inviteRelations.set(inviteeId, {
      inviterId,
      inviteeId,
      createdAt: new Date().toISOString(),
    });

    console.log('邀请关系绑定成功:', { inviterId, inviteeId });
    res.json({ success: true, message: '邀请关系绑定成功' });
  } catch (error) {
    console.error('邀请关系绑定失败:', error);
    res.status(500).json({ error: '邀请关系绑定失败' });
  }
});

/**
 * 处理邀请奖励
 */
app.post('/api/invite/reward', authenticateToken, async (req, res) => {
  try {
    const { inviterId, inviteeId } = req.body;

    // 验证邀请关系
    const relation = inviteRelations.get(inviteeId);
    if (!relation || relation.inviterId !== inviterId) {
      return res.status(400).json({ error: '邀请关系不存在' });
    }

    // 检查是否已经发放过奖励
    if (relation.rewardProcessed) {
      return res.status(400).json({ error: '邀请奖励已发放' });
    }

    // 发放邀请奖励（双方各得20次AI内容适配器使用次数）
    const inviterUsage = userUsage.get(inviterId) || {};
    const inviteeUsage = userUsage.get(inviteeId) || {};

    inviterUsage.aiContentAdapter = (inviterUsage.aiContentAdapter || 0) + 20;
    inviteeUsage.aiContentAdapter = (inviteeUsage.aiContentAdapter || 0) + 20;

    userUsage.set(inviterId, inviterUsage);
    userUsage.set(inviteeId, inviteeUsage);

    // 标记奖励已发放
    relation.rewardProcessed = true;
    relation.rewardedAt = new Date().toISOString();

    console.log('邀请奖励发放成功:', { inviterId, inviteeId });
    res.json({ success: true, message: '邀请奖励发放成功' });
  } catch (error) {
    console.error('邀请奖励发放失败:', error);
    res.status(500).json({ error: '邀请奖励发放失败' });
  }
});

/**
 * 获取邀请关系
 */
app.get('/api/invite/relations/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const relations = [];

    // 查找该用户邀请的人
    for (const [inviteeId, relation] of inviteRelations.entries()) {
      if (relation.inviterId === userId) {
        relations.push({
          type: 'invited',
          userId: inviteeId,
          createdAt: relation.createdAt,
          rewarded: relation.rewardProcessed || false,
        });
      }
    }

    // 查找邀请该用户的人
    const invitedBy = inviteRelations.get(userId);
    if (invitedBy) {
      relations.push({
        type: 'invited_by',
        userId: invitedBy.inviterId,
        createdAt: invitedBy.createdAt,
        rewarded: invitedBy.rewardProcessed || false,
      });
    }

    console.log('获取邀请关系成功:', userId);
    res.json(relations);
  } catch (error) {
    console.error('获取邀请关系失败:', error);
    res.status(500).json({ error: '获取邀请关系失败' });
  }
});

// ==================== 使用次数管理API ====================

/**
 * 获取用户使用情况
 */
app.get('/api/user/usage/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const usage = userUsage.get(userId) || {
      aiContentAdapter: 0,
      creativeCube: 0,
      hotTopics: 0,
      totalUsed: 0,
      lastDistributed: null,
    };

    console.log('获取用户使用情况成功:', userId);
    res.json(usage);
  } catch (error) {
    console.error('获取用户使用情况失败:', error);
    res.status(500).json({ error: '获取用户使用情况失败' });
  }
});

/**
 * 发放每月使用次数
 */
app.post('/api/usage/distribute', authenticateToken, async (req, res) => {
  try {
    const { userId, userTier } = req.body;

    // 根据用户等级确定发放次数
    const usageMap = {
      'trial': 10,
      'pro': 30,
      'premium': 100,
      'vip': -1, // 不限量
    };

    const usageAmount = usageMap[userTier] || 10;
    const currentUsage = userUsage.get(userId) || {};

    if (usageAmount > 0) {
      currentUsage.aiContentAdapter = (currentUsage.aiContentAdapter || 0) + usageAmount;
    }
    currentUsage.lastDistributed = new Date().toISOString();

    userUsage.set(userId, currentUsage);

    console.log('每月使用次数发放成功:', { userId, userTier, usageAmount });
    res.json({ success: true, message: '使用次数发放成功', usageAmount });
  } catch (error) {
    console.error('使用次数发放失败:', error);
    res.status(500).json({ error: '使用次数发放失败' });
  }
});

/**
 * 消费使用次数
 */
app.post('/api/usage/consume', authenticateToken, async (req, res) => {
  try {
    const { userId, feature, amount } = req.body;
    const currentUsage = userUsage.get(userId) || {};

    // 检查是否有足够的使用次数
    const available = currentUsage[feature] || 0;
    if (available < amount && available !== -1) {
      return res.status(400).json({ error: '使用次数不足' });
    }

    // 消费使用次数
    if (available !== -1) {
      currentUsage[feature] = available - amount;
    }
    currentUsage.totalUsed = (currentUsage.totalUsed || 0) + amount;

    userUsage.set(userId, currentUsage);

    console.log('使用次数消费成功:', { userId, feature, amount });
    res.json({ success: true, message: '使用次数消费成功' });
  } catch (error) {
    console.error('使用次数消费失败:', error);
    res.status(500).json({ error: '使用次数消费失败' });
  }
});

// ==================== 余额管理API ====================

/**
 * 获取用户余额
 */
app.get('/api/user/balance/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const balance = userBalance.get(userId) || {
      balance: 0,
      points: 0,
      rewards: 0,
    };

    console.log('获取用户余额成功:', userId);
    res.json(balance);
  } catch (error) {
    console.error('获取用户余额失败:', error);
    res.status(500).json({ error: '获取用户余额失败' });
  }
});

/**
 * 更新用户余额
 */
app.put('/api/user/balance/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const currentBalance = userBalance.get(userId) || {
      balance: 0,
      points: 0,
      rewards: 0,
    };

    userBalance.set(userId, {
      ...currentBalance,
      ...updates,
    });

    console.log('用户余额更新成功:', userId);
    res.json({ success: true, message: '余额更新成功' });
  } catch (error) {
    console.error('用户余额更新失败:', error);
    res.status(500).json({ error: '余额更新失败' });
  }
});

// ==================== 用户行为记录API ====================

/**
 * 记录用户行为
 */
app.post('/api/user/action', authenticateToken, async (req, res) => {
  try {
    const { userId, action, data } = req.body;

    const userActionsList = userActions.get(userId) || [];
    userActionsList.push({
      action,
      data,
      timestamp: new Date().toISOString(),
    });

    userActions.set(userId, userActionsList);

    console.log('用户行为记录成功:', { userId, action });
    res.json({ success: true, message: '行为记录成功' });
  } catch (error) {
    console.error('用户行为记录失败:', error);
    res.status(500).json({ error: '行为记录失败' });
  }
});

/**
 * 获取用户行为记录
 */
app.get('/api/user/actions/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, limit = 50, offset = 0 } = req.query;

    let actions = userActions.get(userId) || [];

    // 按行为类型过滤
    if (action) {
      actions = actions.filter(a => a.action === action);
    }

    // 分页
    const paginatedActions = actions.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    console.log('获取用户行为记录成功:', userId);
    res.json(paginatedActions);
  } catch (error) {
    console.error('获取用户行为记录失败:', error);
    res.status(500).json({ error: '获取行为记录失败' });
  }
});

// ==================== 订阅管理API ====================

/**
 * 获取用户订阅信息
 */
app.get('/api/user/subscription/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const subscription = {
      plan: user.plan || 'trial',
      isProUser: user.isProUser || false,
      createdAt: user.createdAt,
      expiresAt: null, // 根据实际业务逻辑设置
    };

    console.log('获取用户订阅信息成功:', userId);
    res.json(subscription);
  } catch (error) {
    console.error('获取用户订阅信息失败:', error);
    res.status(500).json({ error: '获取订阅信息失败' });
  }
});

/**
 * 升级订阅
 */
app.post('/api/user/subscription/upgrade', authenticateToken, async (req, res) => {
  try {
    const { userId, planId } = req.body;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 更新用户订阅信息
    users.set(userId, {
      ...user,
      plan: planId,
      isProUser: planId !== 'trial',
      updatedAt: new Date().toISOString(),
    });

    console.log('订阅升级成功:', { userId, planId });
    res.json({ success: true, message: '订阅升级成功' });
  } catch (error) {
    console.error('订阅升级失败:', error);
    res.status(500).json({ error: '订阅升级失败' });
  }
});

// ==================== 支付相关API ====================

/**
 * 创建支付订单
 */
app.post('/api/payment/order', authenticateToken, async (req, res) => {
  try {
    const { userId, planId, amount } = req.body;
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const order = {
      id: orderId,
      userId,
      planId,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    paymentOrders.set(orderId, order);

    console.log('支付订单创建成功:', orderId);
    res.json(order);
  } catch (error) {
    console.error('支付订单创建失败:', error);
    res.status(500).json({ error: '支付订单创建失败' });
  }
});

/**
 * 验证支付
 */
app.post('/api/payment/verify', authenticateToken, async (req, res) => {
  try {
    const { orderId, paymentData } = req.body;
    const order = paymentOrders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    // 这里应该调用实际的支付验证API
    // 目前模拟验证成功
    const verified = true;

    if (verified) {
      order.status = 'completed';
      order.completedAt = new Date().toISOString();
      order.paymentData = paymentData;

      // 处理支付成功后的业务逻辑
      await handlePaymentSuccess(order);
    }

    console.log('支付验证完成:', { orderId, verified });
    res.json({ verified });
  } catch (error) {
    console.error('支付验证失败:', error);
    res.status(500).json({ error: '支付验证失败' });
  }
});

// ==================== 工具函数 ====================

/**
 * 处理邀请关系
 */
async function handleInviteRelation(inviterId, inviteeId) {
  // 创建邀请关系
  inviteRelations.set(inviteeId, {
    inviterId,
    inviteeId,
    createdAt: new Date().toISOString(),
  });

  console.log('邀请关系创建成功:', { inviterId, inviteeId });
}

/**
 * 处理支付成功
 */
async function handlePaymentSuccess(order) {
  const { userId, planId } = order;

  // 更新用户订阅
  const user = users.get(userId);
  if (user) {
    users.set(userId, {
      ...user,
      plan: planId,
      isProUser: planId !== 'trial',
      updatedAt: new Date().toISOString(),
    });
  }

  // 发放相应的使用次数
  const usageMap = {
    'pro': 30,
    'premium': 100,
    'vip': -1,
  };

  const usageAmount = usageMap[planId] || 0;
  if (usageAmount > 0) {
    const currentUsage = userUsage.get(userId) || {};
    currentUsage.aiContentAdapter = (currentUsage.aiContentAdapter || 0) + usageAmount;
    userUsage.set(userId, currentUsage);
  }

  console.log('支付成功处理完成:', { userId, planId });
}

// ==================== 启动服务器 ====================

app.listen(PORT, () => {
  console.log(`后端API服务器运行在端口 ${PORT}`);
  console.log(`API基础URL: http://localhost:${PORT}/api`);
  console.log('支持的功能:');
  console.log('- 用户管理 (创建、同步、资料管理)');
  console.log('- 邀请系统 (链接生成、关系绑定、奖励发放)');
  console.log('- 使用次数管理 (查询、发放、消费)');
  console.log('- 余额管理 (查询、更新)');
  console.log('- 用户行为记录 (记录、查询)');
  console.log('- 订阅管理 (查询、升级)');
  console.log('- 支付处理 (订单创建、验证)');
});

export default app; 
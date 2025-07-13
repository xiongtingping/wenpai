/**
 * 推荐奖励处理函数
 * @description 处理推荐人和被推荐人的奖励逻辑
 */

const { MongoClient } = require('mongodb');

// MongoDB连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'wenpai';

/**
 * 处理推荐奖励
 */
async function handleReferralReward(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: '方法不允许' })
    };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const { referrerId, referredUserId, rewardAmount, rewardType, timestamp } = requestBody;

    // 验证必要参数
    if (!referrerId || !referredUserId || !rewardAmount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          message: '缺少必要参数' 
        })
      };
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    const referralRewardsCollection = db.collection('referral_rewards');

    // 1. 给推荐人增加使用次数
    const referrerResult = await usersCollection.updateOne(
      { userId: referrerId },
      { 
        $inc: { usageRemaining: rewardAmount },
        $set: { updatedAt: new Date() }
      }
    );

    // 2. 给被推荐人增加使用次数
    const referredUserResult = await usersCollection.updateOne(
      { userId: referredUserId },
      { 
        $inc: { usageRemaining: rewardAmount },
        $set: { updatedAt: new Date() }
      }
    );

    // 3. 记录推荐奖励
    const rewardRecord = {
      referrerId,
      referredUserId,
      rewardAmount,
      rewardType,
      timestamp: new Date(timestamp),
      createdAt: new Date()
    };

    await referralRewardsCollection.insertOne(rewardRecord);

    // 4. 获取更新后的使用次数
    const referrerUser = await usersCollection.findOne({ userId: referrerId });
    const referredUser = await usersCollection.findOne({ userId: referredUserId });

    await client.close();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        message: '推荐奖励发放成功',
        referrerReward: {
          referrerId,
          rewardAmount,
          newUsageCount: referrerUser?.usageRemaining || 0
        },
        referredUserReward: {
          referredUserId,
          rewardAmount,
          newUsageCount: referredUser?.usageRemaining || 0
        }
      })
    };

  } catch (error) {
    console.error('推荐奖励处理错误:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        message: '推荐奖励处理失败',
        error: error.message
      })
    };
  }
}

/**
 * 获取推荐统计
 */
async function getReferralStats(event) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: '方法不允许' })
    };
  }

  try {
    const { referrerId } = event.queryStringParameters || {};

    if (!referrerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          message: '缺少推荐人ID参数' 
        })
      };
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const referralRewardsCollection = db.collection('referral_rewards');

    // 获取总推荐人数
    const totalReferrals = await referralRewardsCollection.countDocuments({ referrerId });

    // 获取总奖励次数
    const totalRewards = await referralRewardsCollection.aggregate([
      { $match: { referrerId } },
      { $group: { _id: null, total: { $sum: '$rewardAmount' } } }
    ]).toArray();

    // 获取本月推荐人数
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyReferrals = await referralRewardsCollection.countDocuments({
      referrerId,
      timestamp: { $gte: startOfMonth }
    });

    // 获取本月奖励次数
    const monthlyRewards = await referralRewardsCollection.aggregate([
      { 
        $match: { 
          referrerId,
          timestamp: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$rewardAmount' } } }
    ]).toArray();

    await client.close();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        data: {
          referrerId,
          totalReferrals,
          totalRewards: totalRewards[0]?.total || 0,
          monthlyReferrals,
          monthlyRewards: monthlyRewards[0]?.total || 0
        }
      })
    };

  } catch (error) {
    console.error('获取推荐统计错误:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        message: '获取推荐统计失败',
        error: error.message
      })
    };
  }
}

/**
 * 验证推荐人ID
 */
async function validateReferrerId(event) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: '方法不允许' })
    };
  }

  try {
    const { referrerId } = event.queryStringParameters || {};

    if (!referrerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          message: '缺少推荐人ID参数' 
        })
      };
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    // 检查推荐人是否存在
    const user = await usersCollection.findOne({ userId: referrerId });
    await client.close();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        isValid: !!user,
        message: user ? '推荐人ID有效' : '推荐人ID无效'
      })
    };

  } catch (error) {
    console.error('验证推荐人ID错误:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        message: '验证推荐人ID失败',
        error: error.message
      })
    };
  }
}

/**
 * 主处理函数
 */
exports.handler = async (event, context) => {
  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
      },
      body: ''
    };
  }

  const { path } = event;
  
  // 根据路径分发到不同的处理函数
  if (path.endsWith('/referral/reward')) {
    return await handleReferralReward(event);
  } else if (path.endsWith('/referral/stats')) {
    return await getReferralStats(event);
  } else if (path.endsWith('/referral/validate')) {
    return await validateReferrerId(event);
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ success: false, message: '接口不存在' })
    };
  }
}; 
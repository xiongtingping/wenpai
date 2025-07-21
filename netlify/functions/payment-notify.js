/**
 * 支付回调处理函数
 * @description 处理第三方支付平台的支付回调，更新用户订阅状态和角色
 */

const { ManagementClient } = require('authing-js-sdk');
const crypto = require('crypto');

// Authing 管理客户端配置
const AUTHING_CONFIG = {
  userPoolId: process.env.AUTHING_USER_POOL_ID || '687e0aafee2b84f86685b644',
  secret: process.env.AUTHING_SECRET || 'your-secret-key',
  host: process.env.AUTHING_HOST || 'ai-wenpai.authing.cn/687e0aafee2b84f86685b644'
};

// 支付平台配置
const PAYMENT_CONFIG = {
  // 支付宝配置
  alipay: {
    appId: process.env.ALIPAY_APP_ID,
    publicKey: process.env.ALIPAY_PUBLIC_KEY,
    privateKey: process.env.ALIPAY_PRIVATE_KEY,
  },
  // 微信支付配置
  wechat: {
    appId: process.env.WECHAT_APP_ID,
    mchId: process.env.WECHAT_MCH_ID,
    apiKey: process.env.WECHAT_API_KEY,
  }
};

/**
 * 验证支付回调签名
 * @param {Object} params 回调参数
 * @param {string} platform 支付平台
 * @returns {boolean} 验证结果
 */
function verifyPaymentSignature(params, platform) {
  try {
    switch (platform) {
      case 'alipay':
        return verifyAlipaySignature(params);
      case 'wechat':
        return verifyWechatSignature(params);
      default:
        console.warn(`未知的支付平台: ${platform}`);
        return false;
    }
  } catch (error) {
    console.error('验证支付签名失败:', error);
    return false;
  }
}

/**
 * 验证支付宝签名
 * @param {Object} params 支付宝回调参数
 * @returns {boolean} 验证结果
 */
function verifyAlipaySignature(params) {
  try {
    // 支付宝签名验证逻辑
    const { sign, sign_type, ...signParams } = params;
    
    // 按字母顺序排序参数
    const sortedParams = Object.keys(signParams)
      .sort()
      .map(key => `${key}=${signParams[key]}`)
      .join('&');
    
    // 使用支付宝公钥验证签名
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(sortedParams);
    
    return verify.verify(PAYMENT_CONFIG.alipay.publicKey, sign, 'base64');
  } catch (error) {
    console.error('支付宝签名验证失败:', error);
    return false;
  }
}

/**
 * 验证微信支付签名
 * @param {Object} params 微信回调参数
 * @returns {boolean} 验证结果
 */
function verifyWechatSignature(params) {
  try {
    // 微信支付签名验证逻辑
    const { sign, ...signParams } = params;
    
    // 按字母顺序排序参数
    const sortedParams = Object.keys(signParams)
      .sort()
      .map(key => `${key}=${signParams[key]}`)
      .join('&') + `&key=${PAYMENT_CONFIG.wechat.apiKey}`;
    
    // 计算签名
    const calculatedSign = crypto
      .createHash('md5')
      .update(sortedParams)
      .digest('hex')
      .toUpperCase();
    
    return calculatedSign === sign;
  } catch (error) {
    console.error('微信支付签名验证失败:', error);
    return false;
  }
}

/**
 * 初始化 Authing 管理客户端
 * @returns {ManagementClient} Authing 管理客户端实例
 */
function initAuthingClient() {
  try {
    return new ManagementClient({
      userPoolId: AUTHING_CONFIG.userPoolId,
      secret: AUTHING_CONFIG.secret,
      host: AUTHING_CONFIG.host
    });
  } catch (error) {
    console.error('初始化 Authing 管理客户端失败:', error);
    throw error;
  }
}

/**
 * 更新用户角色
 * @param {string} userId 用户ID
 * @param {string} planId 订阅计划ID
 * @returns {Promise<void>}
 */
async function updateUserRole(userId, planId) {
  try {
    const authing = initAuthingClient();
    
    // 根据订阅计划确定角色代码
    let roleCode;
    switch (planId) {
      case 'pro':
        roleCode = 'pro';
        break;
      case 'premium':
        roleCode = 'premium';
        break;
      case 'vip':
        roleCode = 'vip';
        break;
      default:
        roleCode = 'user';
    }
    
    console.log(`为用户 ${userId} 分配角色: ${roleCode}`);
    
    // 先移除现有角色
    try {
      await authing.removeUserRoles({
        userIds: [userId],
        roles: ['pro', 'premium', 'vip']
      });
      console.log('已移除用户现有角色');
    } catch (error) {
      console.warn('移除现有角色失败:', error.message);
    }
    
    // 分配新角色
    await authing.assignRole({
      code: roleCode,
      userId: userId,
    });
    
    console.log(`用户 ${userId} 角色更新成功: ${roleCode}`);
  } catch (error) {
    console.error('更新用户角色失败:', error);
    throw error;
  }
}

/**
 * 更新数据库中的用户订阅状态
 * @param {string} userId 用户ID
 * @param {Object} subscriptionData 订阅数据
 * @returns {Promise<void>}
 */
async function updateUserSubscription(userId, subscriptionData) {
  try {
    // 这里可以连接您的数据库（MongoDB、MySQL等）
    // 示例使用 MongoDB
    const { MongoClient } = require('mongodb');
    
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const DB_NAME = process.env.DB_NAME || 'wenpai';
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    
    // 更新用户订阅信息
    const updateData = {
      subscription: {
        planId: subscriptionData.planId,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + subscriptionData.duration * 24 * 60 * 60 * 1000), // 根据订阅时长计算
        autoRenew: subscriptionData.autoRenew || false,
        paymentMethod: subscriptionData.paymentMethod,
        amount: subscriptionData.amount,
        currency: subscriptionData.currency || 'CNY'
      },
      isVip: true,
      updatedAt: new Date()
    };
    
    await usersCollection.updateOne(
      { userId: userId },
      { $set: updateData },
      { upsert: true }
    );
    
    console.log(`用户 ${userId} 订阅状态更新成功`);
    await client.close();
  } catch (error) {
    console.error('更新用户订阅状态失败:', error);
    throw error;
  }
}

/**
 * 记录支付日志
 * @param {Object} paymentData 支付数据
 * @returns {Promise<void>}
 */
async function logPayment(paymentData) {
  try {
    const { MongoClient } = require('mongodb');
    
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const DB_NAME = process.env.DB_NAME || 'wenpai';
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const paymentsCollection = db.collection('payments');
    
    const paymentLog = {
      userId: paymentData.userId,
      orderId: paymentData.out_trade_no,
      planId: paymentData.planId,
      amount: paymentData.total_amount,
      currency: paymentData.currency || 'CNY',
      paymentMethod: paymentData.paymentMethod,
      status: paymentData.trade_status,
      platform: paymentData.platform,
      createdAt: new Date(),
      callbackData: paymentData
    };
    
    await paymentsCollection.insertOne(paymentLog);
    console.log(`支付日志记录成功: ${paymentData.out_trade_no}`);
    await client.close();
  } catch (error) {
    console.error('记录支付日志失败:', error);
    // 不抛出错误，避免影响主要流程
  }
}

/**
 * 发送通知
 * @param {string} userId 用户ID
 * @param {Object} subscriptionData 订阅数据
 * @returns {Promise<void>}
 */
async function sendNotification(userId, subscriptionData) {
  try {
    // 这里可以集成邮件、短信、推送等通知服务
    console.log(`发送订阅成功通知给用户: ${userId}`);
    
    // 示例：发送邮件通知
    // await sendEmail(userId, {
    //   subject: '订阅成功通知',
    //   template: 'subscription-success',
    //   data: subscriptionData
    // });
    
    // 示例：发送短信通知
    // await sendSMS(userId, {
    //   template: 'subscription-success',
    //   data: subscriptionData
    // });
    
  } catch (error) {
    console.error('发送通知失败:', error);
    // 不抛出错误，避免影响主要流程
  }
}

/**
 * 主处理函数
 * @param {Object} event Netlify 函数事件
 * @param {Object} context 函数上下文
 * @returns {Object} 响应对象
 */
exports.handler = async (event, context) => {
  // 设置 CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // 处理 OPTIONS 请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // 只允许 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: '方法不允许'
      })
    };
  }

  try {
    console.log('收到支付回调请求');
    console.log('请求头:', event.headers);
    console.log('请求体:', event.body);

    // 解析请求体
    let paymentData;
    try {
      paymentData = JSON.parse(event.body);
    } catch (error) {
      // 如果不是 JSON，尝试解析表单数据
      const querystring = require('querystring');
      paymentData = querystring.parse(event.body);
    }

    console.log('解析的支付数据:', paymentData);

    // 提取关键参数
    const {
      out_trade_no,      // 商户订单号
      trade_status,      // 交易状态
      total_amount,      // 交易金额
      user_id,          // 用户ID
      plan_id,          // 订阅计划ID
      payment_method,   // 支付方式
      platform,         // 支付平台
      currency,         // 货币类型
      ...otherParams
    } = paymentData;

    // 验证必要参数
    if (!out_trade_no || !trade_status || !user_id) {
      console.error('缺少必要参数:', { out_trade_no, trade_status, user_id });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: '缺少必要参数'
        })
      };
    }

    // 验证支付状态
    if (trade_status !== 'SUCCESS' && trade_status !== 'TRADE_SUCCESS') {
      console.log(`支付未成功，状态: ${trade_status}`);
      return {
        statusCode: 200,
        headers,
        body: 'fail'
      };
    }

    // 验证支付签名
    if (platform && !verifyPaymentSignature(paymentData, platform)) {
      console.error('支付签名验证失败');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: '签名验证失败'
        })
      };
    }

    console.log('开始处理支付成功回调');

    // 准备订阅数据
    const subscriptionData = {
      planId: plan_id || 'pro',
      amount: parseFloat(total_amount) || 0,
      currency: currency || 'CNY',
      paymentMethod: payment_method || 'unknown',
      platform: platform || 'unknown',
      duration: plan_id === 'premium' ? 365 : 30, // 默认月付30天，年付365天
      autoRenew: false
    };

    // 并行处理各项任务
    await Promise.allSettled([
      // 1. 更新用户角色
      updateUserRole(user_id, subscriptionData.planId),
      
      // 2. 更新数据库订阅状态
      updateUserSubscription(user_id, subscriptionData),
      
      // 3. 记录支付日志
      logPayment({
        ...paymentData,
        userId: user_id,
        planId: subscriptionData.planId,
        paymentMethod: subscriptionData.paymentMethod,
        platform: subscriptionData.platform
      }),
      
      // 4. 发送通知
      sendNotification(user_id, subscriptionData)
    ]);

    console.log(`支付回调处理成功: ${out_trade_no}`);

    // 返回成功响应
    return {
      statusCode: 200,
      headers,
      body: 'success'
    };

  } catch (error) {
    console.error('处理支付回调失败:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: '处理支付回调失败',
        error: error.message
      })
    };
  }
}; 
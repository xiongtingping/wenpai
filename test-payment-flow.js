/**
 * 完整支付流程模拟测试
 */

import crypto from 'crypto';

// BufPay 配置 - 使用正确的配置信息
const BUFPAY_CONFIG = {
  API_URL: 'https://bufpay.com/api/pay/107628',
  QUERY_URL: 'https://bufpay.com/api/query',
  APP_SECRET: '2861731746ef4189937ef4dc11f09375', // 更新为正确的 APP_SECRET
  NOTIFY_URL: 'https://www.wenpai.xyz/.netlify/functions/bufpay-notify',
  RETURN_URL: 'https://www.wenpai.xyz/payment/result',
  FEEDBACK_URL: 'https://www.wenpai.xyz/payment/feedback'
};

// 生成 MD5 签名
function generateMD5(text) {
  return crypto.createHash('md5').update(text).digest('hex').toLowerCase();
}

// 生成支付签名
function generatePaymentSign(name, payType, price, orderId, orderUid, notifyUrl, returnUrl, feedbackUrl = '') {
  const signString = name + payType + price + orderId + orderUid + notifyUrl + returnUrl + feedbackUrl + BUFPAY_CONFIG.APP_SECRET;
  return generateMD5(signString);
}

// 验证回调签名
function verifyNotifySign(aoid, orderId, orderUid, price, payPrice, sign) {
  const expectedSign = generateMD5(aoid + orderId + orderUid + price + payPrice + BUFPAY_CONFIG.APP_SECRET);
  return expectedSign === sign.toLowerCase();
}

// 生成订单号
function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WP${timestamp}${random}`;
}

/**
 * 模拟前端支付请求
 */
async function simulatePaymentRequest() {
  console.log('🛒 模拟前端支付请求...\n');

  const paymentData = {
    userId: 'test_user_123',
    userEmail: 'test@example.com',
    productName: '文派专业版月度会员',
    productType: 'professional',
    durationType: 'monthly',
    amount: 29.90,
    payType: 'alipay'
  };

  console.log('支付请求数据:', paymentData);

  // 1. 生成订单号
  const orderId = generateOrderId();
  console.log('生成订单号:', orderId);

  // 2. 生成签名
  const sign = generatePaymentSign(
    paymentData.productName,
    paymentData.payType,
    paymentData.amount.toString(),
    orderId,
    paymentData.userId,
    BUFPAY_CONFIG.NOTIFY_URL,
    BUFPAY_CONFIG.RETURN_URL,
    BUFPAY_CONFIG.FEEDBACK_URL
  );

  console.log('生成签名:', sign);

  // 3. 构造 FormData
  const formData = new FormData();
  formData.append('name', paymentData.productName);
  formData.append('pay_type', paymentData.payType);
  formData.append('price', paymentData.amount.toString());
  formData.append('order_id', orderId);
  formData.append('order_uid', paymentData.userId);
  formData.append('notify_url', BUFPAY_CONFIG.NOTIFY_URL);
  formData.append('return_url', BUFPAY_CONFIG.RETURN_URL);
  formData.append('feedback_url', BUFPAY_CONFIG.FEEDBACK_URL);
  formData.append('sign', sign);

  console.log('\n📤 发送到 BufPay API...');

  try {
    const response = await fetch(BUFPAY_CONFIG.API_URL, {
      method: 'POST',
      body: formData
    });

    console.log('响应状态:', response.status);
    const responseText = await response.text();
    
    // 检查是否是 JSON 响应
    if (responseText.startsWith('{')) {
      const result = JSON.parse(responseText);
      console.log('JSON 响应:', result);
      
      if (result.status === 'ok') {
        return {
          success: true,
          orderId,
          paymentInfo: result,
          originalRequest: paymentData
        };
      } else {
        console.log('❌ 支付接口返回错误:', result.status, result.error);
        return { success: false, error: result };
      }
    } else {
      console.log('❌ 非 JSON 响应，可能是 HTML 错误页面');
      console.log('响应内容片段:', responseText.substring(0, 200) + '...');
      return { success: false, error: 'Non-JSON response' };
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 模拟支付回调
 */
function simulatePaymentCallback(orderId, userId) {
  console.log('\n🔔 模拟支付回调...');

  const callbackData = {
    aoid: `bufpay_${Date.now()}`,
    order_id: orderId,
    order_uid: userId,
    price: '29.90',
    pay_price: '29.90'
  };

  // 生成回调签名
  const sign = generateMD5(
    callbackData.aoid + 
    callbackData.order_id + 
    callbackData.order_uid + 
    callbackData.price + 
    callbackData.pay_price + 
    BUFPAY_CONFIG.APP_SECRET
  );

  callbackData.sign = sign;

  console.log('回调数据:', callbackData);

  // 验证签名
  const isValidSign = verifyNotifySign(
    callbackData.aoid,
    callbackData.order_id,
    callbackData.order_uid,
    callbackData.price,
    callbackData.pay_price,
    callbackData.sign
  );

  console.log('签名验证:', isValidSign ? '✅ 通过' : '❌ 失败');

  return { callbackData, isValidSign };
}

/**
 * 模拟 Netlify Function 处理
 */
async function simulateNetlifyFunction(callbackData) {
  console.log('\n⚡ 模拟 Netlify Function 处理...');

  // 这里模拟 bufpay-notify.js 的处理逻辑
  console.log('1. 验证签名...');
  const isValidSign = verifyNotifySign(
    callbackData.aoid,
    callbackData.order_id,
    callbackData.order_uid,
    callbackData.price,
    callbackData.pay_price,
    callbackData.sign
  );

  if (!isValidSign) {
    console.log('❌ 签名验证失败');
    return { success: false, error: 'Invalid signature' };
  }

  console.log('✅ 签名验证通过');

  console.log('2. 查询订单...');
  // 模拟订单查询（实际应该从数据库查询）
  const mockOrder = {
    order_id: callbackData.order_id,
    user_id: callbackData.order_uid,
    product_type: 'professional',
    duration_type: 'monthly',
    amount: 29.90,
    status: 'pending'
  };

  console.log('✅ 订单查询成功:', mockOrder);

  console.log('3. 更新订单状态...');
  // 模拟订单状态更新
  mockOrder.status = 'paid';
  mockOrder.aoid = callbackData.aoid;
  mockOrder.pay_price = parseFloat(callbackData.pay_price);
  mockOrder.paid_at = new Date().toISOString();

  console.log('✅ 订单状态更新成功');

  console.log('4. 开通用户权限...');
  // 模拟权限开通
  const subscription = {
    user_id: mockOrder.user_id,
    subscription_type: mockOrder.product_type,
    status: 'active',
    started_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后
    order_id: mockOrder.order_id
  };

  console.log('✅ 用户权限开通成功:', subscription);

  return {
    success: true,
    order: mockOrder,
    subscription
  };
}

/**
 * 测试订单号生成逻辑
 */
function testOrderIdGeneration() {
  console.log('\n🔢 测试订单号生成逻辑...');

  const orderIds = [];
  for (let i = 0; i < 5; i++) {
    const orderId = generateOrderId();
    orderIds.push(orderId);
    console.log(`订单号 ${i + 1}: ${orderId}`);
  }

  // 检查唯一性
  const uniqueIds = new Set(orderIds);
  console.log('唯一性检查:', uniqueIds.size === orderIds.length ? '✅ 通过' : '❌ 失败');
}

/**
 * 测试签名生成逻辑
 */
function testSignGeneration() {
  console.log('\n🔐 测试签名生成逻辑...');

  const testData = {
    name: '文派专业版月度会员',
    payType: 'alipay',
    price: '29.90',
    orderId: 'WP1703123456789',
    orderUid: 'test_user_123'
  };

  const sign1 = generatePaymentSign(
    testData.name,
    testData.payType,
    testData.price,
    testData.orderId,
    testData.orderUid,
    BUFPAY_CONFIG.NOTIFY_URL,
    BUFPAY_CONFIG.RETURN_URL,
    BUFPAY_CONFIG.FEEDBACK_URL
  );

  const sign2 = generatePaymentSign(
    testData.name,
    testData.payType,
    testData.price,
    testData.orderId,
    testData.orderUid,
    BUFPAY_CONFIG.NOTIFY_URL,
    BUFPAY_CONFIG.RETURN_URL,
    BUFPAY_CONFIG.FEEDBACK_URL
  );

  console.log('签名 1:', sign1);
  console.log('签名 2:', sign2);
  console.log('一致性检查:', sign1 === sign2 ? '✅ 通过' : '❌ 失败');
}

/**
 * 运行完整测试流程
 */
async function runCompleteTest() {
  console.log('🚀 完整支付流程测试\n');
  console.log('='.repeat(60));

  // 1. 测试订单号生成
  testOrderIdGeneration();

  // 2. 测试签名生成
  testSignGeneration();

  // 3. 模拟支付请求
  const paymentResult = await simulatePaymentRequest();
  
  if (!paymentResult.success) {
    console.log('\n❌ 支付请求失败，跳过后续测试');
    console.log('错误信息:', paymentResult.error);
  } else {
    console.log('\n✅ 支付请求成功');
    
    // 4. 模拟支付回调
    const { callbackData, isValidSign } = simulatePaymentCallback(
      paymentResult.orderId,
      paymentResult.originalRequest.userId
    );

    if (isValidSign) {
      // 5. 模拟 Netlify Function 处理
      const functionResult = await simulateNetlifyFunction(callbackData);
      
      if (functionResult.success) {
        console.log('\n🎉 完整支付流程测试成功！');
        console.log('最终结果:', {
          订单状态: functionResult.order.status,
          用户权限: functionResult.subscription.status,
          到期时间: functionResult.subscription.expires_at
        });
      } else {
        console.log('\n❌ Netlify Function 处理失败:', functionResult.error);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ 测试完成');
}

// 运行测试
runCompleteTest().catch(console.error);

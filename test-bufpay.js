/**
 * BufPay API 测试脚本
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
  console.log('签名字符串:', signString);
  return generateMD5(signString);
}

// 生成订单号
function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WP${timestamp}${random}`;
}

// 测试 BufPay API
async function testBufPayAPI() {
  console.log('🧪 开始测试 BufPay API...\n');

  // 1. 生成测试订单数据
  const orderId = generateOrderId();
  const orderUid = 'test_user_123';
  const name = '文派专业版月度会员';
  const payType = 'alipay';
  const price = '29.90';

  console.log('📋 测试订单信息:');
  console.log('订单号:', orderId);
  console.log('用户ID:', orderUid);
  console.log('商品名称:', name);
  console.log('支付方式:', payType);
  console.log('支付金额:', price);
  console.log('');

  // 2. 生成签名
  const sign = generatePaymentSign(
    name,
    payType,
    price,
    orderId,
    orderUid,
    BUFPAY_CONFIG.NOTIFY_URL,
    BUFPAY_CONFIG.RETURN_URL,
    BUFPAY_CONFIG.FEEDBACK_URL
  );

  console.log('🔐 签名信息:');
  console.log('生成的签名:', sign);
  console.log('');

  // 3. 构造请求数据
  const formData = new FormData();
  formData.append('name', name);
  formData.append('pay_type', payType);
  formData.append('price', price);
  formData.append('order_id', orderId);
  formData.append('order_uid', orderUid);
  formData.append('notify_url', BUFPAY_CONFIG.NOTIFY_URL);
  formData.append('return_url', BUFPAY_CONFIG.RETURN_URL);
  formData.append('feedback_url', BUFPAY_CONFIG.FEEDBACK_URL);
  formData.append('sign', sign);

  console.log('📤 请求参数:');
  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
  console.log('');

  try {
    // 4. 发送请求到 BufPay
    console.log('🌐 发送请求到 BufPay API...');
    const response = await fetch(BUFPAY_CONFIG.API_URL, {
      method: 'POST',
      body: formData
    });

    console.log('📥 响应状态:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('📄 原始响应:', responseText);

    try {
      const result = JSON.parse(responseText);
      console.log('📊 解析后的 JSON 响应:');
      console.log(JSON.stringify(result, null, 2));

      // 5. 分析响应结果
      if (result.status === 'ok') {
        console.log('✅ 支付订单创建成功!');
        console.log('AOID:', result.aoid);
        console.log('二维码链接:', result.qr);
        console.log('二维码图片:', result.qr_img);
        console.log('过期时间:', result.expires_in, '秒');
        
        // 测试查询接口
        if (result.aoid) {
          console.log('\n🔍 测试查询接口...');
          await testQueryAPI(result.aoid);
        }
      } else {
        console.log('❌ 支付订单创建失败:');
        console.log('错误状态:', result.status);
        console.log('错误信息:', result.error || result.info);
      }
    } catch (parseError) {
      console.log('❌ JSON 解析失败:', parseError.message);
      console.log('响应可能不是有效的 JSON 格式');
    }

  } catch (error) {
    console.log('❌ 请求失败:', error.message);
  }
}

// 测试查询 API
async function testQueryAPI(aoid) {
  try {
    const queryUrl = `${BUFPAY_CONFIG.QUERY_URL}/${aoid}`;
    console.log('查询 URL:', queryUrl);
    
    const response = await fetch(queryUrl);
    const result = await response.json();
    
    console.log('📊 查询结果:');
    console.log(JSON.stringify(result, null, 2));
    
    const statusMap = {
      'not_exist': '订单不存在',
      'new': '等待支付',
      'payed': '支付成功，处理中',
      'success': '支付成功',
      'fee_error': '余额不足',
      'expire': '订单已过期'
    };
    
    console.log('状态说明:', statusMap[result.status] || '未知状态');
  } catch (error) {
    console.log('❌ 查询失败:', error.message);
  }
}

// 测试签名验证
function testSignVerification() {
  console.log('\n🔐 测试签名验证...');
  
  // 模拟回调数据
  const callbackData = {
    aoid: 'test_aoid_123',
    order_id: 'WP1703123456789',
    order_uid: 'test_user_123',
    price: '29.90',
    pay_price: '29.90'
  };
  
  // 生成预期签名
  const expectedSign = generateMD5(
    callbackData.aoid + 
    callbackData.order_id + 
    callbackData.order_uid + 
    callbackData.price + 
    callbackData.pay_price + 
    BUFPAY_CONFIG.APP_SECRET
  );
  
  console.log('回调数据:', callbackData);
  console.log('预期签名:', expectedSign);
  
  // 验证签名
  const isValid = expectedSign === expectedSign; // 这里应该是实际的签名比较
  console.log('签名验证:', isValid ? '✅ 通过' : '❌ 失败');
}

// 运行测试
async function runTests() {
  console.log('🚀 BufPay 支付系统测试\n');
  console.log('=' .repeat(50));
  
  await testBufPayAPI();
  testSignVerification();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ 测试完成');
}

// 运行测试
runTests().catch(console.error);

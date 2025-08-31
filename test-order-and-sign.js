/**
 * 测试订单ID生成和签名生成逻辑
 */

import crypto from 'crypto';

// BufPay 配置
const BUFPAY_CONFIG = {
  APP_SECRET: '2861731746ef4189937ef4dc11f09375',
  NOTIFY_URL: 'https://www.wenpai.xyz/.netlify/functions/bufpay-notify',
  RETURN_URL: 'https://www.wenpai.xyz/payment/result',
  FEEDBACK_URL: 'https://www.wenpai.xyz/payment/feedback'
};

// 生成 MD5 签名
function generateMD5(text) {
  return crypto.createHash('md5').update(text).digest('hex').toLowerCase();
}

// 生成订单号
function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WP${timestamp}${random}`;
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

/**
 * 测试订单ID生成逻辑
 */
async function testOrderIdGeneration() {
  console.log('🔢 测试订单ID生成逻辑\n');
  
  const orderIds = [];
  const startTime = Date.now();
  
  // 生成多个订单ID测试
  for (let i = 0; i < 10; i++) {
    const orderId = generateOrderId();
    orderIds.push(orderId);
    console.log(`订单ID ${i + 1}: ${orderId}`);
    
    // 验证格式
    const isValidFormat = /^WP\d{13}\d{4}$/.test(orderId);
    console.log(`  格式验证: ${isValidFormat ? '✅ 通过' : '❌ 失败'}`);
    
    // 验证长度
    const expectedLength = 2 + 13 + 4; // WP + timestamp + random
    console.log(`  长度验证: ${orderId.length === expectedLength ? '✅ 通过' : '❌ 失败'} (${orderId.length}/${expectedLength})`);
    
    // 短暂延迟确保时间戳不同
    if (i < 9) {
      const delay = Math.random() * 10;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  const endTime = Date.now();
  console.log(`\n生成耗时: ${endTime - startTime}ms`);
  
  // 检查唯一性
  const uniqueIds = new Set(orderIds);
  console.log(`唯一性检查: ${uniqueIds.size === orderIds.length ? '✅ 通过' : '❌ 失败'} (${uniqueIds.size}/${orderIds.length})`);
  
  // 检查时间戳部分
  const firstOrderId = orderIds[0];
  const timestampPart = firstOrderId.substring(2, 15);
  const timestamp = parseInt(timestampPart);
  const timestampDate = new Date(timestamp);
  console.log(`时间戳解析: ${timestampDate.toISOString()} (${timestamp})`);
  
  return orderIds[0]; // 返回第一个订单ID用于后续测试
}

/**
 * 测试签名生成逻辑
 */
function testSignGeneration() {
  console.log('\n🔐 测试签名生成逻辑\n');
  
  // 测试数据
  const testCases = [
    {
      name: '文派专业版月度会员',
      payType: 'alipay',
      price: '39.00',
      orderId: 'WP17566195008651270',
      orderUid: 'test_user_123'
    },
    {
      name: '文派高级版月度会员',
      payType: 'alipay',
      price: '99.00',
      orderId: 'WP17566195008651271',
      orderUid: 'test_user_456'
    },
    {
      name: '测试商品',
      payType: 'wechat',
      price: '1.00',
      orderId: 'WP17566195008651272',
      orderUid: 'test_user_789'
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`测试用例 ${index + 1}:`);
    console.log(`  商品名称: ${testCase.name}`);
    console.log(`  支付方式: ${testCase.payType}`);
    console.log(`  支付金额: ${testCase.price}`);
    console.log(`  订单号: ${testCase.orderId}`);
    console.log(`  用户ID: ${testCase.orderUid}`);
    
    // 生成签名字符串
    const signString = testCase.name + testCase.payType + testCase.price + testCase.orderId + testCase.orderUid + 
                      BUFPAY_CONFIG.NOTIFY_URL + BUFPAY_CONFIG.RETURN_URL + BUFPAY_CONFIG.FEEDBACK_URL + BUFPAY_CONFIG.APP_SECRET;
    
    console.log(`  签名字符串: ${signString}`);
    console.log(`  签名字符串长度: ${signString.length}`);
    
    // 生成签名
    const sign = generatePaymentSign(
      testCase.name,
      testCase.payType,
      testCase.price,
      testCase.orderId,
      testCase.orderUid,
      BUFPAY_CONFIG.NOTIFY_URL,
      BUFPAY_CONFIG.RETURN_URL,
      BUFPAY_CONFIG.FEEDBACK_URL
    );
    
    console.log(`  生成签名: ${sign}`);
    console.log(`  签名长度: ${sign.length}`);
    
    // 验证签名格式
    const isValidMD5 = /^[a-f0-9]{32}$/.test(sign);
    console.log(`  MD5格式验证: ${isValidMD5 ? '✅ 通过' : '❌ 失败'}`);
    
    // 重复生成验证一致性
    const sign2 = generatePaymentSign(
      testCase.name,
      testCase.payType,
      testCase.price,
      testCase.orderId,
      testCase.orderUid,
      BUFPAY_CONFIG.NOTIFY_URL,
      BUFPAY_CONFIG.RETURN_URL,
      BUFPAY_CONFIG.FEEDBACK_URL
    );
    
    console.log(`  一致性验证: ${sign === sign2 ? '✅ 通过' : '❌ 失败'}`);
    console.log('');
  });
}

/**
 * 测试回调签名验证逻辑
 */
function testCallbackSignVerification() {
  console.log('🔍 测试回调签名验证逻辑\n');
  
  // 模拟回调数据
  const callbackTestCases = [
    {
      aoid: 'bufpay_test_123456',
      orderId: 'WP17566195008651270',
      orderUid: 'test_user_123',
      price: '39.00',
      payPrice: '39.00'
    },
    {
      aoid: 'bufpay_test_789012',
      orderId: 'WP17566195008651271',
      orderUid: 'test_user_456',
      price: '99.00',
      payPrice: '99.00'
    }
  ];
  
  callbackTestCases.forEach((testCase, index) => {
    console.log(`回调测试用例 ${index + 1}:`);
    console.log(`  AOID: ${testCase.aoid}`);
    console.log(`  订单号: ${testCase.orderId}`);
    console.log(`  用户ID: ${testCase.orderUid}`);
    console.log(`  订单金额: ${testCase.price}`);
    console.log(`  实付金额: ${testCase.payPrice}`);
    
    // 生成预期签名
    const expectedSign = generateMD5(
      testCase.aoid + testCase.orderId + testCase.orderUid + testCase.price + testCase.payPrice + BUFPAY_CONFIG.APP_SECRET
    );
    
    console.log(`  预期签名: ${expectedSign}`);
    
    // 验证签名
    const isValid = verifyNotifySign(
      testCase.aoid,
      testCase.orderId,
      testCase.orderUid,
      testCase.price,
      testCase.payPrice,
      expectedSign
    );
    
    console.log(`  签名验证: ${isValid ? '✅ 通过' : '❌ 失败'}`);
    
    // 测试错误签名
    const wrongSign = 'wrong_signature_test_123456789012';
    const isInvalid = verifyNotifySign(
      testCase.aoid,
      testCase.orderId,
      testCase.orderUid,
      testCase.price,
      testCase.payPrice,
      wrongSign
    );
    
    console.log(`  错误签名验证: ${!isInvalid ? '✅ 通过' : '❌ 失败'}`);
    console.log('');
  });
}

/**
 * 测试边界情况
 */
function testEdgeCases() {
  console.log('⚠️  测试边界情况\n');
  
  // 测试特殊字符
  console.log('1. 特殊字符测试:');
  const specialChars = [
    { name: '测试商品&特殊字符', expected: 'should_handle' },
    { name: '商品名称包含空格 test', expected: 'should_handle' },
    { name: '商品名称包含中文，英文，数字123', expected: 'should_handle' }
  ];
  
  specialChars.forEach((test, index) => {
    try {
      const orderId = generateOrderId();
      const sign = generatePaymentSign(
        test.name,
        'alipay',
        '1.00',
        orderId,
        'test_user',
        BUFPAY_CONFIG.NOTIFY_URL,
        BUFPAY_CONFIG.RETURN_URL,
        BUFPAY_CONFIG.FEEDBACK_URL
      );
      console.log(`  测试 ${index + 1}: ✅ 通过 - ${test.name} -> ${sign.substring(0, 8)}...`);
    } catch (error) {
      console.log(`  测试 ${index + 1}: ❌ 失败 - ${error.message}`);
    }
  });
  
  // 测试极值
  console.log('\n2. 极值测试:');
  const extremeValues = [
    { price: '0.01', desc: '最小金额' },
    { price: '99999.99', desc: '最大金额' },
    { price: '1234567890.12', desc: '超大金额' }
  ];
  
  extremeValues.forEach((test, index) => {
    try {
      const orderId = generateOrderId();
      const sign = generatePaymentSign(
        '测试商品',
        'alipay',
        test.price,
        orderId,
        'test_user',
        BUFPAY_CONFIG.NOTIFY_URL,
        BUFPAY_CONFIG.RETURN_URL,
        BUFPAY_CONFIG.FEEDBACK_URL
      );
      console.log(`  ${test.desc}: ✅ 通过 - ${test.price} -> ${sign.substring(0, 8)}...`);
    } catch (error) {
      console.log(`  ${test.desc}: ❌ 失败 - ${error.message}`);
    }
  });
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 订单ID和签名生成逻辑测试\n');
  console.log('='.repeat(60));
  
  try {
    // 1. 测试订单ID生成
    const testOrderId = await testOrderIdGeneration();
    
    // 2. 测试签名生成
    testSignGeneration();
    
    // 3. 测试回调签名验证
    testCallbackSignVerification();
    
    // 4. 测试边界情况
    testEdgeCases();
    
    console.log('='.repeat(60));
    console.log('✅ 所有测试完成');
    
  } catch (error) {
    console.log('❌ 测试过程中出现错误:', error.message);
    console.log(error.stack);
  }
}

// 运行测试
runAllTests().catch(console.error);

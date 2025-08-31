/**
 * 高级 BufPay API 测试 - 深入分析账号异常问题
 */

import crypto from 'crypto';
import fs from 'fs';

// BufPay 配置
const BUFPAY_CONFIG = {
  API_URL: 'https://bufpay.com/api/pay/107628',
  QUERY_URL: 'https://bufpay.com/api/query',
  APP_SECRET: '2861731746ef4189937ef4dc11f09375',
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

// 生成订单号
function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WP${timestamp}${random}`;
}

/**
 * 测试不同的参数组合
 */
async function testDifferentParameters() {
  console.log('🧪 测试不同的参数组合\n');
  
  const testCases = [
    {
      name: '基础测试',
      params: {
        name: '文派专业版月度会员',
        pay_type: 'alipay',
        price: '39.00',
        order_id: generateOrderId(),
        order_uid: 'test_user_123'
      }
    },
    {
      name: '最小金额测试',
      params: {
        name: '测试商品',
        pay_type: 'alipay',
        price: '0.01',
        order_id: generateOrderId(),
        order_uid: 'test_user_min'
      }
    },
    {
      name: '微信支付测试',
      params: {
        name: '文派专业版月度会员',
        pay_type: 'wechat',
        price: '39.00',
        order_id: generateOrderId(),
        order_uid: 'test_user_wechat'
      }
    },
    {
      name: '简化参数测试',
      params: {
        name: 'Test',
        pay_type: 'alipay',
        price: '1.00',
        order_id: generateOrderId(),
        order_uid: 'test'
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}:`);
    console.log(`订单号: ${testCase.params.order_id}`);
    console.log(`商品名称: ${testCase.params.name}`);
    console.log(`支付方式: ${testCase.params.pay_type}`);
    console.log(`金额: ${testCase.params.price}`);
    
    // 生成签名
    const sign = generatePaymentSign(
      testCase.params.name,
      testCase.params.pay_type,
      testCase.params.price,
      testCase.params.order_id,
      testCase.params.order_uid,
      BUFPAY_CONFIG.NOTIFY_URL,
      BUFPAY_CONFIG.RETURN_URL,
      BUFPAY_CONFIG.FEEDBACK_URL
    );
    
    console.log(`生成签名: ${sign}`);
    
    // 构造请求数据
    const formData = new FormData();
    formData.append('name', testCase.params.name);
    formData.append('pay_type', testCase.params.pay_type);
    formData.append('price', testCase.params.price);
    formData.append('order_id', testCase.params.order_id);
    formData.append('order_uid', testCase.params.order_uid);
    formData.append('notify_url', BUFPAY_CONFIG.NOTIFY_URL);
    formData.append('return_url', BUFPAY_CONFIG.RETURN_URL);
    formData.append('feedback_url', BUFPAY_CONFIG.FEEDBACK_URL);
    formData.append('sign', sign);
    
    try {
      console.log('🌐 发送请求...');
      const response = await fetch(BUFPAY_CONFIG.API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/html, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log(`状态码: ${response.status} ${response.statusText}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      
      const responseText = await response.text();
      console.log(`响应长度: ${responseText.length} 字符`);
      
      // 分析响应内容
      if (responseText.includes('账号异常')) {
        console.log('❌ 确认：账号异常');
      } else if (responseText.includes('<!DOCTYPE')) {
        console.log('⚠️  返回 HTML 页面');
      } else if (responseText.trim().startsWith('{')) {
        console.log('✅ 返回 JSON 数据');
        try {
          const jsonData = JSON.parse(responseText);
          console.log('JSON 内容:', JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log('JSON 解析失败');
        }
      }
      
      // 保存响应到文件
      const filename = `bufpay-test-${testCase.name.replace(/\s+/g, '-')}-${Date.now()}.html`;
      fs.writeFileSync(filename, responseText);
      console.log(`响应已保存: ${filename}`);
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
    
    // 等待一下避免请求过快
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

/**
 * 测试查询接口
 */
async function testQueryAPI() {
  console.log('\n🔍 测试查询接口\n');
  
  const testOrderId = 'WP17566218349672016'; // 使用之前的订单号
  
  try {
    console.log(`查询订单: ${testOrderId}`);
    
    const response = await fetch(`${BUFPAY_CONFIG.QUERY_URL}?order_id=${testOrderId}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/html, */*'
      }
    });
    
    console.log(`状态码: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    
    const responseText = await response.text();
    console.log(`响应长度: ${responseText.length} 字符`);
    console.log(`响应内容预览: ${responseText.substring(0, 200)}...`);
    
    // 保存查询响应
    const filename = `bufpay-query-${Date.now()}.html`;
    fs.writeFileSync(filename, responseText);
    console.log(`查询响应已保存: ${filename}`);
    
  } catch (error) {
    console.log(`❌ 查询请求失败: ${error.message}`);
  }
}

/**
 * 测试不同的 User-Agent
 */
async function testDifferentUserAgents() {
  console.log('\n🤖 测试不同的 User-Agent\n');
  
  const userAgents = [
    {
      name: 'Chrome',
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    {
      name: 'Firefox',
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
    },
    {
      name: 'Safari',
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
    },
    {
      name: 'Mobile',
      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'
    }
  ];
  
  const orderId = generateOrderId();
  const sign = generatePaymentSign(
    '测试商品',
    'alipay',
    '1.00',
    orderId,
    'test_ua',
    BUFPAY_CONFIG.NOTIFY_URL,
    BUFPAY_CONFIG.RETURN_URL,
    BUFPAY_CONFIG.FEEDBACK_URL
  );
  
  for (const agent of userAgents) {
    console.log(`\n📱 测试 ${agent.name}:`);
    
    const formData = new FormData();
    formData.append('name', '测试商品');
    formData.append('pay_type', 'alipay');
    formData.append('price', '1.00');
    formData.append('order_id', orderId);
    formData.append('order_uid', 'test_ua');
    formData.append('notify_url', BUFPAY_CONFIG.NOTIFY_URL);
    formData.append('return_url', BUFPAY_CONFIG.RETURN_URL);
    formData.append('feedback_url', BUFPAY_CONFIG.FEEDBACK_URL);
    formData.append('sign', sign);
    
    try {
      const response = await fetch(BUFPAY_CONFIG.API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'User-Agent': agent.ua,
          'Accept': 'application/json, text/html, */*'
        }
      });
      
      console.log(`状态码: ${response.status}`);
      const responseText = await response.text();
      
      if (responseText.includes('账号异常')) {
        console.log('❌ 账号异常');
      } else if (responseText.includes('<!DOCTYPE')) {
        console.log('⚠️  HTML 响应');
      } else {
        console.log('✅ 可能的正常响应');
        console.log(`响应预览: ${responseText.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * 分析错误页面内容
 */
async function analyzeErrorPage() {
  console.log('\n🔍 分析错误页面内容\n');
  
  const orderId = generateOrderId();
  const sign = generatePaymentSign(
    '分析测试',
    'alipay',
    '1.00',
    orderId,
    'analyze_test',
    BUFPAY_CONFIG.NOTIFY_URL,
    BUFPAY_CONFIG.RETURN_URL,
    BUFPAY_CONFIG.FEEDBACK_URL
  );
  
  const formData = new FormData();
  formData.append('name', '分析测试');
  formData.append('pay_type', 'alipay');
  formData.append('price', '1.00');
  formData.append('order_id', orderId);
  formData.append('order_uid', 'analyze_test');
  formData.append('notify_url', BUFPAY_CONFIG.NOTIFY_URL);
  formData.append('return_url', BUFPAY_CONFIG.RETURN_URL);
  formData.append('feedback_url', BUFPAY_CONFIG.FEEDBACK_URL);
  formData.append('sign', sign);
  
  try {
    const response = await fetch(BUFPAY_CONFIG.API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const responseText = await response.text();
    
    console.log('📄 错误页面分析:');
    console.log(`页面长度: ${responseText.length} 字符`);
    
    // 提取关键信息
    const patterns = [
      { name: '页面标题', regex: /<title>(.*?)<\/title>/i },
      { name: '错误信息', regex: /账号异常|error|错误|失败/gi },
      { name: '联系方式', regex: /QQ|微信|电话|邮箱|客服/gi },
      { name: 'AID信息', regex: /AID|aid|107628/gi },
      { name: '状态码', regex: /status|code|状态/gi }
    ];
    
    for (const pattern of patterns) {
      const matches = responseText.match(pattern.regex);
      if (matches) {
        console.log(`${pattern.name}: ${matches.slice(0, 3).join(', ')}`);
      }
    }
    
    // 查找可能的解决方案提示
    const solutionPatterns = [
      /联系.*?客服/gi,
      /激活.*?账号/gi,
      /充值.*?余额/gi,
      /审核.*?通过/gi,
      /实名.*?认证/gi
    ];
    
    console.log('\n💡 可能的解决方案提示:');
    for (const pattern of solutionPatterns) {
      const matches = responseText.match(pattern);
      if (matches) {
        console.log(`- ${matches[0]}`);
      }
    }
    
    // 保存详细分析
    const filename = `bufpay-error-analysis-${Date.now()}.html`;
    fs.writeFileSync(filename, responseText);
    console.log(`\n详细错误页面已保存: ${filename}`);
    
  } catch (error) {
    console.log(`❌ 分析请求失败: ${error.message}`);
  }
}

/**
 * 运行所有测试
 */
async function runAdvancedTests() {
  console.log('🚀 BufPay API 高级测试开始\n');
  console.log('='.repeat(60));
  
  try {
    // 1. 测试不同参数组合
    await testDifferentParameters();
    
    // 2. 测试查询接口
    await testQueryAPI();
    
    // 3. 测试不同 User-Agent
    await testDifferentUserAgents();
    
    // 4. 分析错误页面
    await analyzeErrorPage();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ BufPay API 高级测试完成');
    console.log('\n📋 测试总结:');
    console.log('- 已测试多种参数组合');
    console.log('- 已测试查询接口');
    console.log('- 已测试不同浏览器标识');
    console.log('- 已分析错误页面内容');
    console.log('- 所有响应文件已保存到当前目录');
    
  } catch (error) {
    console.log('\n❌ 测试过程中出现错误:', error.message);
    console.log(error.stack);
  }
}

// 运行测试
runAdvancedTests().catch(console.error);

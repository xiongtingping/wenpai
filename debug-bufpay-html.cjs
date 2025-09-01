/**
 * BufPay HTML响应调试脚本
 */

const crypto = require('crypto');
const fs = require('fs');

// BufPay 配置
const BUFPAY_CONFIG = {
  API_URL: 'https://bufpay.com/api/pay/107628',
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
  console.log('🔐 签名字符串:', signString);
  return generateMD5(signString);
}

// 详细分析HTML响应
async function analyzeHTMLResponse() {
  console.log('🕵️ 开始分析BufPay API HTML响应...\n');
  
  // 生成测试订单数据
  const testData = {
    name: '文派AI专业版月度会员',
    pay_type: 'alipay',
    price: '29.00',
    order_id: `DEBUG_${Date.now()}`,
    order_uid: 'debug_user_analysis'
  };
  
  // 生成签名
  const sign = generatePaymentSign(
    testData.name,
    testData.pay_type,
    testData.price,
    testData.order_id,
    testData.order_uid,
    BUFPAY_CONFIG.NOTIFY_URL,
    BUFPAY_CONFIG.RETURN_URL,
    BUFPAY_CONFIG.FEEDBACK_URL
  );
  
  console.log('📋 调试参数:', {
    name: testData.name,
    payType: testData.pay_type,
    price: testData.price,
    orderId: testData.order_id,
    orderUid: testData.order_uid,
    sign: sign
  });
  
  try {
    // 构建FormData
    const formData = new FormData();
    formData.append('name', testData.name);
    formData.append('pay_type', testData.pay_type);
    formData.append('price', testData.price);
    formData.append('order_id', testData.order_id);
    formData.append('order_uid', testData.order_uid);
    formData.append('notify_url', BUFPAY_CONFIG.NOTIFY_URL);
    formData.append('return_url', BUFPAY_CONFIG.RETURN_URL);
    formData.append('feedback_url', BUFPAY_CONFIG.FEEDBACK_URL);
    formData.append('sign', sign);
    
    console.log('🚀 发送请求到:', BUFPAY_CONFIG.API_URL);
    
    // 发送请求
    const response = await fetch(BUFPAY_CONFIG.API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'WenpaiAI/1.0'
      }
    });
    
    console.log('📡 响应状态:', response.status, response.statusText);
    console.log('📄 响应头:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    
    const responseText = await response.text();
    console.log('\n📝 响应内容长度:', responseText.length, '字符');
    
    // 保存完整HTML响应到文件
    const filename = `bufpay-html-response-${Date.now()}.html`;
    fs.writeFileSync(filename, responseText);
    console.log('💾 完整响应已保存到:', filename);
    
    // 分析HTML内容
    console.log('\n🔍 HTML内容分析:');
    console.log('前500字符:', responseText.substring(0, 500));
    
    // 检查是否包含错误信息
    const errorKeywords = ['error', 'Error', 'ERROR', '错误', '失败', 'fail', 'invalid', 'missing'];
    const foundErrors = errorKeywords.filter(keyword => 
      responseText.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (foundErrors.length > 0) {
      console.log('⚠️ 发现错误关键词:', foundErrors);
    }
    
    // 检查是否包含表单或重定向
    if (responseText.includes('<form')) {
      console.log('📝 响应包含表单元素');
    }
    if (responseText.includes('redirect') || responseText.includes('location.href')) {
      console.log('🔄 响应包含重定向逻辑');
    }
    
    // 尝试提取title和任何错误消息
    const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) {
      console.log('📰 页面标题:', titleMatch[1]);
    }
    
    // 检查是否是BufPay的支付页面
    if (responseText.includes('bufpay') || responseText.includes('BufPay')) {
      console.log('✅ 确认是BufPay相关页面');
    } else {
      console.log('❌ 可能不是BufPay页面，可能被重定向');
    }
    
  } catch (error) {
    console.error('❌ 分析失败:', error);
  }
}

// 运行分析
analyzeHTMLResponse().catch(console.error);
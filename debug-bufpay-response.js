/**
 * 调试 BufPay API 响应内容
 */

import crypto from 'crypto';

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

// 生成订单号
function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WP${timestamp}${random}`;
}

async function debugBufPayResponse() {
  console.log('🔍 调试 BufPay API 响应内容\n');

  // 1. 生成测试数据
  const orderId = generateOrderId();
  const orderUid = 'test_user_123';
  const name = '文派专业版月度会员';
  const payType = 'alipay';
  const price = '39.00';

  console.log('📋 测试参数:');
  console.log('订单号:', orderId);
  console.log('用户ID:', orderUid);
  console.log('商品名称:', name);
  console.log('支付方式:', payType);
  console.log('支付金额:', price);

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

  console.log('🔐 生成的签名:', sign);

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

  console.log('\n📤 请求参数:');
  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  try {
    console.log('\n🌐 发送请求到 BufPay API...');
    console.log('请求 URL:', BUFPAY_CONFIG.API_URL);
    
    const response = await fetch(BUFPAY_CONFIG.API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    console.log('\n📥 响应信息:');
    console.log('状态码:', response.status);
    console.log('状态文本:', response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('Content-Length:', response.headers.get('content-length'));

    // 获取响应文本
    const responseText = await response.text();
    console.log('\n📄 响应内容长度:', responseText.length, '字符');
    
    // 显示响应内容的前500个字符
    console.log('\n📄 响应内容预览 (前500字符):');
    console.log('=' .repeat(50));
    console.log(responseText.substring(0, 500));
    console.log('=' .repeat(50));

    // 尝试检测响应类型
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.log('\n🔍 响应类型: HTML 页面');
      
      // 尝试提取页面标题
      const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
      if (titleMatch) {
        console.log('页面标题:', titleMatch[1]);
      }

      // 尝试提取错误信息
      const errorPatterns = [
        /账号异常/g,
        /error/gi,
        /错误/g,
        /失败/g,
        /invalid/gi,
        /forbidden/gi
      ];

      for (const pattern of errorPatterns) {
        const matches = responseText.match(pattern);
        if (matches) {
          console.log(`发现关键词 "${pattern.source}":`, matches.length, '次');
        }
      }

    } else if (responseText.trim().startsWith('{')) {
      console.log('\n🔍 响应类型: JSON 数据');
      try {
        const jsonData = JSON.parse(responseText);
        console.log('JSON 内容:', JSON.stringify(jsonData, null, 2));
      } catch (parseError) {
        console.log('JSON 解析失败:', parseError.message);
      }
    } else {
      console.log('\n🔍 响应类型: 其他格式');
      console.log('响应开头:', responseText.substring(0, 100));
    }

    // 保存完整响应到文件
    const fs = await import('fs');
    const filename = `bufpay-response-${Date.now()}.html`;
    fs.writeFileSync(filename, responseText);
    console.log(`\n💾 完整响应已保存到: ${filename}`);

  } catch (error) {
    console.log('\n❌ 请求失败:', error.message);
    console.log('错误详情:', error);
  }
}

// 运行调试
debugBufPayResponse().catch(console.error);

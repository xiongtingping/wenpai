#!/usr/bin/env node

/**
 * 检查Authing服务状态
 */

const https = require('https');
const { URL } = require('url');

console.log('🔧 检查Authing服务状态...\n');

const appId = '687c5c7f4e778a6485a4f0e0';
const host = 'wenpaiai.authing.cn';
const testUrls = [
  `https://${host}`,
  `https://${host}/oidc/auth`,
  `https://${host}/api/v3/health`,
  `https://console.authing.cn`
];

/**
 * 测试URL连接
 */
function testUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Authing-Test/1.0)'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        error: error.message,
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        error: '请求超时',
        success: false
      });
    });

    req.end();
  });
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('📋 测试配置:');
  console.log(`   App ID: ${appId}`);
  console.log(`   Host: ${host}`);
  console.log(`   回调URL: https://wenpai.netlify.app/callback`);
  console.log('');

  console.log('🌐 测试网络连接...\n');

  for (const url of testUrls) {
    console.log(`🔍 测试: ${url}`);
    const result = await testUrl(url);
    
    if (result.success) {
      console.log(`   ✅ 状态: ${result.status} ${result.statusText}`);
    } else {
      console.log(`   ❌ 错误: ${result.error || `${result.status} ${result.statusText}`}`);
    }
    console.log('');
  }

  // 测试完整的OIDC URL
  const oidcUrl = `https://${host}/oidc/auth?client_id=${appId}&redirect_uri=${encodeURIComponent('https://wenpai.netlify.app/callback')}&response_type=code&scope=openid+profile+email&state=test-${Date.now()}`;
  
  console.log('🔐 测试完整OIDC URL:');
  console.log(`   URL: ${oidcUrl}`);
  console.log('');
  
  const oidcResult = await testUrl(oidcUrl);
  if (oidcResult.success) {
    console.log(`   ✅ OIDC URL 可访问: ${oidcResult.status}`);
  } else {
    console.log(`   ❌ OIDC URL 不可访问: ${oidcResult.error || oidcResult.status}`);
  }
  console.log('');

  // 提供解决方案
  console.log('📝 如果出现连接问题，请尝试以下解决方案:');
  console.log('');
  console.log('1. 检查网络连接');
  console.log('2. 尝试使用VPN或代理');
  console.log('3. 清除浏览器缓存和Cookie');
  console.log('4. 尝试不同的浏览器');
  console.log('5. 检查防火墙设置');
  console.log('6. 等待几分钟后重试（可能是Authing服务临时问题）');
  console.log('');
  
  console.log('🔗 直接访问Authing控制台:');
  console.log(`   https://console.authing.cn/console/app/${appId}/detail`);
  console.log('');
  
  console.log('🔗 直接访问Authing登录页面:');
  console.log(`   ${oidcUrl}`);
  console.log('');
}

// 运行测试
runTests().catch(console.error); 
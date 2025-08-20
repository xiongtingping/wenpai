#!/usr/bin/env node

/**
 * 测试不同回调URL格式的脚本
 * 用于验证Authing后台配置
 */

const https = require('https');

const APP_ID = '68823897631e1ef8ff3720b2';
const HOST = 'rzcswqs4sq0f.authing.cn';

// 测试不同的回调URL格式
const testUrls = [
  'https://www.wenpai.xyz/callback',
  'https://wenpai.xyz/callback',
  'https://wenpai.netlify.app/callback',
  'http://localhost:5173/callback',
  'http://localhost:5174/callback',
  'http://localhost:8888/callback'
];

console.log('🔍 测试Authing回调URL配置');
console.log('================================');
console.log(`App ID: ${APP_ID}`);
console.log(`Host: ${HOST}`);
console.log('');

/**
 * 测试单个回调URL
 */
function testCallbackUrl(redirectUri) {
  return new Promise((resolve) => {
    const params = new URLSearchParams({
      client_id: APP_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email phone',
      state: 'test-state',
      prompt: 'login'
    });
    
    const authUrl = `https://${HOST}/${APP_ID}/oidc/auth?${params.toString()}`;
    
    console.log(`\n🔍 测试回调URL: ${redirectUri}`);
    console.log(`认证URL: ${authUrl}`);
    
    const req = https.request(authUrl, { method: 'GET' }, (res) => {
      console.log(`   状态码: ${res.statusCode}`);
      console.log(`   状态信息: ${res.statusMessage}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✅ 成功 - 回调URL在白名单中');
          resolve({ url: redirectUri, status: 'success', code: res.statusCode });
        } else if (res.statusCode === 302) {
          console.log('   ✅ 重定向 - 可能成功');
          console.log(`   重定向到: ${res.headers.location}`);
          resolve({ url: redirectUri, status: 'redirect', code: res.statusCode, location: res.headers.location });
        } else if (data.includes('redirect_uri_mismatch')) {
          console.log('   ❌ 失败 - redirect_uri_mismatch');
          resolve({ url: redirectUri, status: 'mismatch', code: res.statusCode });
        } else {
          console.log(`   ⚠️  其他错误: ${data.substring(0, 100)}...`);
          resolve({ url: redirectUri, status: 'error', code: res.statusCode, error: data.substring(0, 200) });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ 网络错误: ${err.message}`);
      resolve({ url: redirectUri, status: 'network_error', error: err.message });
    });
    
    req.setTimeout(10000, () => {
      console.log('   ❌ 请求超时');
      req.destroy();
      resolve({ url: redirectUri, status: 'timeout' });
    });
    
    req.end();
  });
}

/**
 * 主函数
 */
async function main() {
  const results = [];
  
  for (const url of testUrls) {
    const result = await testCallbackUrl(url);
    results.push(result);
    
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 测试结果汇总:');
  console.log('================================');
  
  const successful = results.filter(r => r.status === 'success' || r.status === 'redirect');
  const failed = results.filter(r => r.status === 'mismatch');
  const errors = results.filter(r => r.status === 'error' || r.status === 'network_error' || r.status === 'timeout');
  
  if (successful.length > 0) {
    console.log('\n✅ 可用的回调URL:');
    successful.forEach(result => {
      console.log(`   - ${result.url} (${result.status})`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ 不在白名单的回调URL:');
    failed.forEach(result => {
      console.log(`   - ${result.url}`);
    });
  }
  
  if (errors.length > 0) {
    console.log('\n⚠️  测试异常的回调URL:');
    errors.forEach(result => {
      console.log(`   - ${result.url} (${result.status})`);
    });
  }
  
  console.log('\n💡 建议:');
  if (failed.length === testUrls.length) {
    console.log('   所有回调URL都不在白名单中，请检查Authing控制台配置');
    console.log('   1. 登录 https://console.authing.cn');
    console.log(`   2. 找到App ID: ${APP_ID}`);
    console.log('   3. 在"应用配置" -> "登录回调URL"中添加回调地址');
  } else if (successful.length > 0) {
    console.log('   部分回调URL可用，建议使用可用的URL');
  }
  
  console.log('\n🔗 Authing控制台链接:');
  console.log(`   https://console.authing.cn/console/app/${APP_ID}/detail`);
}

// 运行测试
main().catch(console.error);

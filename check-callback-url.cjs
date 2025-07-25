#!/usr/bin/env node

/**
 * 检查实际使用的回调URL
 */

const https = require('https');

// 测试不同的回调URL
const testUrls = [
  'http://localhost:5173/callback',
  'http://localhost:5174/callback', 
  'http://localhost:5175/callback',
  'https://wenpai.netlify.app/callback',
  'https://www.wenpai.xyz/callback',
  'https://wenpai.xyz/callback'
];

/**
 * 测试单个回调URL
 */
function testCallbackUrl(redirectUri) {
  return new Promise((resolve) => {
    const params = new URLSearchParams({
      client_id: '688237f7f9e118de849dc274',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email phone',
      state: 'test-state'
    });
    
    const loginUrl = `ai-wenpai.authing.cn/688237f7f9e118de849dc274/oidc/auth?${params.toString()}`;
    
    console.log(`\n🔍 测试回调URL: ${redirectUri}`);
    
    const req = https.get(loginUrl, (res) => {
      console.log(`📋 状态码: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('✅ 成功 - 返回登录页面');
        resolve({ url: redirectUri, status: 'success', code: res.statusCode });
      } else if (res.statusCode === 302 || res.statusCode === 303) {
        console.log('✅ 成功 - 重定向到登录页面');
        resolve({ url: redirectUri, status: 'success', code: res.statusCode });
      } else if (res.statusCode === 400) {
        console.log('❌ 失败 - 400错误（可能是回调URL不匹配）');
        resolve({ url: redirectUri, status: 'error', code: res.statusCode });
      } else {
        console.log(`❌ 失败 - 状态码: ${res.statusCode}`);
        resolve({ url: redirectUri, status: 'error', code: res.statusCode });
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ 请求失败: ${error.message}`);
      resolve({ url: redirectUri, status: 'error', code: 'network_error' });
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ 请求超时');
      req.destroy();
      resolve({ url: redirectUri, status: 'error', code: 'timeout' });
    });
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始检查回调URL配置...\n');
  
  const results = [];
  
  for (const url of testUrls) {
    const result = await testCallbackUrl(url);
    results.push(result);
    
    // 如果找到成功的URL，停止测试
    if (result.status === 'success') {
      console.log(`\n🎉 找到正确的回调URL: ${url}`);
      break;
    }
  }
  
  console.log('\n📊 测试结果总结:');
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌';
    console.log(`${status} ${result.url} (${result.code})`);
  });
  
  const successfulUrls = results.filter(r => r.status === 'success');
  
  if (successfulUrls.length > 0) {
    console.log('\n✅ 找到可用的回调URL:');
    successfulUrls.forEach(result => {
      console.log(`- ${result.url}`);
    });
  } else {
    console.log('\n❌ 没有找到可用的回调URL');
    console.log('\n💡 建议:');
    console.log('1. 检查Authing控制台中的回调URL配置');
    console.log('2. 确保回调URL在Authing应用的白名单中');
    console.log('3. 检查应用ID是否正确');
  }
}

// 运行检查
main(); 
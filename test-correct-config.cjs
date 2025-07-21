#!/usr/bin/env node

/**
 * 使用正确配置测试Authing登录
 */

const https = require('https');

/**
 * 测试Authing登录URL（使用正确的配置）
 */
function testAuthingLogin() {
  const appId = '687e0aafee2b84f86685b644';
  const redirectUri = 'http://localhost:5173/callback';
  const host = 'ai-wenpai.authing.cn/687e0aafee2b84f86685b644'; // 使用Authing控制台中的实际域名
  
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email phone',
    state: 'test-state-' + Date.now()
  });
  
  const loginUrl = `https://${host}/oidc/auth?${params.toString()}`;
  
  console.log('🔍 测试Authing登录URL（使用正确配置）:');
  console.log('📋 App ID:', appId);
  console.log('📋 域名:', host);
  console.log('📋 回调URL:', redirectUri);
  console.log('📋 完整URL:', loginUrl);
  console.log('');
  
  return new Promise((resolve) => {
    const req = https.get(loginUrl, (res) => {
      console.log(`📋 响应状态码: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('✅ 成功 - 返回登录页面');
        resolve({ statusCode: res.statusCode, success: true });
      } else if (res.statusCode === 302 || res.statusCode === 303) {
        console.log('✅ 成功 - 重定向到登录页面');
        console.log('📋 重定向地址:', res.headers.location);
        resolve({ statusCode: res.statusCode, success: true, redirect: res.headers.location });
      } else if (res.statusCode === 400) {
        console.log('❌ 400错误 - 回调URL不匹配');
        resolve({ statusCode: res.statusCode, success: false });
      } else {
        console.log(`❌ 其他错误 - 状态码: ${res.statusCode}`);
        resolve({ statusCode: res.statusCode, success: false });
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ 请求失败: ${error.message}`);
      resolve({ statusCode: 'error', success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ 请求超时');
      req.destroy();
      resolve({ statusCode: 'timeout', success: false });
    });
  });
}

/**
 * 测试不同的回调URL
 */
async function testDifferentCallbackUrls() {
  console.log('\n🔍 测试不同的回调URL...');
  
  const testUrls = [
    'http://localhost:5173/callback',
    'http://localhost:5174/callback',
    'http://localhost:5175/callback'
  ];
  
  for (const url of testUrls) {
    const params = new URLSearchParams({
      client_id: '687e0aafee2b84f86685b644',
      redirect_uri: url,
      response_type: 'code',
      scope: 'openid profile email phone',
      state: 'test-state'
    });
    
    const loginUrl = `https://ai-wenpai.authing.cn/oidc/auth?${params.toString()}`;
    
    const result = await new Promise((resolve) => {
      const req = https.get(loginUrl, (res) => {
        resolve({ statusCode: res.statusCode });
      });
      
      req.on('error', () => {
        resolve({ statusCode: 'error' });
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ statusCode: 'timeout' });
      });
    });
    
    const status = result.statusCode === 200 || result.statusCode === 302 ? '✅' : '❌';
    console.log(`${status} ${url} (${result.statusCode})`);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始测试正确的Authing配置...\n');
  
  // 测试基本登录URL
  const result = await testAuthingLogin();
  
  if (result.success) {
    console.log('\n🎉 成功！Authing登录URL现在可以正常工作了！');
    console.log('✅ 真正的注册/登录功能现在应该可以正常使用');
  } else {
    console.log('\n❌ 仍然有问题，需要进一步检查');
  }
  
  // 测试不同的回调URL
  await testDifferentCallbackUrls();
  
  console.log('\n📊 测试完成');
  console.log('\n💡 如果仍然返回400错误，可能的原因:');
  console.log('1. Authing控制台配置需要时间生效');
  console.log('2. 应用状态未启用');
  console.log('3. 需要检查应用的其他配置');
}

// 运行测试
main(); 
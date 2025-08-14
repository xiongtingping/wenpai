#!/usr/bin/env node

/**
 * Authing redirect_uri 配置验证脚本
 * 用于验证当前的redirect_uri配置是否正确
 */

const https = require('https');
const { URL } = require('url');

console.log('🔍 Authing redirect_uri 配置验证');
console.log('=====================================\n');

// 当前配置
const CONFIG = {
  appId: '68823897631e1ef8ff3720b2',
  domain: 'rzcswqd4sq0f.authing.cn',
  host: 'https://rzcswqd4sq0f.authing.cn',
  redirectUris: [
    'http://localhost:5173/callback',
    'https://wenpai.netlify.app/callback'
  ],
  logoutUris: [
    'http://localhost:5173/',
    'https://wenpai.netlify.app/'
  ]
};

console.log('📋 当前配置信息:');
console.log(`   App ID: ${CONFIG.appId}`);
console.log(`   域名: ${CONFIG.domain}`);
console.log(`   认证地址: ${CONFIG.host}`);
console.log('\n🔗 需要配置的回调URL:');
console.log('   登录回调URL:');
CONFIG.redirectUris.forEach(uri => console.log(`     - ${uri}`));
console.log('   登出回调URL:');
CONFIG.logoutUris.forEach(uri => console.log(`     - ${uri}`));

/**
 * 测试认证端点连接
 */
async function testAuthEndpoint() {
  return new Promise((resolve) => {
    const testUrl = `${CONFIG.host}/oidc/auth`;
    
    console.log('\n🔍 测试认证端点连接...');
    console.log(`   测试URL: ${testUrl}`);
    
    const url = new URL(testUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      console.log(`   状态码: ${res.statusCode}`);
      if (res.statusCode === 200 || res.statusCode === 400) {
        console.log('   ✅ 认证端点连接正常');
        resolve(true);
      } else {
        console.log('   ❌ 认证端点连接异常');
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.log(`   ❌ 连接失败: ${error.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('   ❌ 连接超时');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

/**
 * 生成测试认证URL
 */
function generateTestUrls() {
  console.log('\n🔗 测试认证URL:');
  
  CONFIG.redirectUris.forEach((redirectUri, index) => {
    const params = new URLSearchParams({
      redirect_uri: redirectUri,
      response_mode: 'fragment',
      response_type: 'code',
      client_id: CONFIG.appId,
      state: `test_${Date.now()}`,
      nonce: `nonce_${Date.now()}`,
      scope: 'openid profile email phone',
      code_challenge: 'test_challenge',
      code_challenge_method: 'S256'
    });

    const testUrl = `${CONFIG.host}/oidc/auth?${params.toString()}`;
    console.log(`\n   测试URL ${index + 1} (${redirectUri}):`);
    console.log(`   ${testUrl}`);
  });
}

/**
 * 显示配置指南
 */
function showConfigGuide() {
  console.log('\n📋 Authing控制台配置指南:');
  console.log('=====================================');
  console.log('\n1. 登录Authing控制台:');
  console.log('   https://console.authing.cn/');
  
  console.log('\n2. 找到应用:');
  console.log(`   应用ID: ${CONFIG.appId}`);
  
  console.log('\n3. 配置登录回调URL (每行一个):');
  CONFIG.redirectUris.forEach(uri => console.log(`   ${uri}`));
  
  console.log('\n4. 配置登出回调URL (每行一个):');
  CONFIG.logoutUris.forEach(uri => console.log(`   ${uri}`));
  
  console.log('\n5. 保存配置并等待生效 (1-2分钟)');
}

/**
 * 主函数
 */
async function main() {
  try {
    // 测试认证端点
    const endpointOk = await testAuthEndpoint();
    
    // 生成测试URL
    generateTestUrls();
    
    // 显示配置指南
    showConfigGuide();
    
    console.log('\n📊 验证结果:');
    console.log(`   认证端点连接: ${endpointOk ? '✅ 正常' : '❌ 异常'}`);
    
    if (endpointOk) {
      console.log('\n✅ 认证服务正常，请按照上述指南配置回调URL');
      console.log('\n🔧 下一步操作:');
      console.log('   1. 在Authing控制台配置回调URL');
      console.log('   2. 保存配置并等待生效');
      console.log('   3. 使用上述测试URL验证配置');
      console.log('   4. 在应用中测试登录功能');
    } else {
      console.log('\n❌ 认证服务连接异常，请检查:');
      console.log('   1. 网络连接是否正常');
      console.log('   2. 域名配置是否正确');
      console.log('   3. Authing服务是否正常');
    }
    
  } catch (error) {
    console.error('\n❌ 验证过程中发生错误:', error.message);
  }
}

// 运行验证
main();

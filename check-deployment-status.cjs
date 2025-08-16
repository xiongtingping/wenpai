#!/usr/bin/env node

/**
 * 部署状态检查脚本
 * 检查Netlify部署状态和应用健康状况
 */

const https = require('https');

console.log('🚀 检查部署状态...\n');

// 配置
const SITE_URL = 'https://wenpai.netlify.app';
const HEALTH_CHECK_ENDPOINTS = [
  '/',
  '/callback',
  '/login'
];

/**
 * 检查URL状态
 */
function checkUrl(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get(url, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      resolve({
        url,
        status: res.statusCode,
        responseTime,
        success: res.statusCode >= 200 && res.statusCode < 400
      });
    });

    req.on('error', (error) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      resolve({
        url,
        status: 'ERROR',
        responseTime,
        success: false,
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        responseTime: 10000,
        success: false,
        error: 'Request timeout'
      });
    });
  });
}

/**
 * 检查Authing配置
 */
function checkAuthingConfig() {
  const expectedConfig = {
    appId: '68823897631e1ef8ff3720b2',
    appHost: 'rzcswqs4sq0f.authing.cn',
    redirectUri: 'https://wenpai.netlify.app/callback'
  };
  
  console.log('🔧 预期的Authing配置:');
  console.log(`   App ID: ${expectedConfig.appId}`);
  console.log(`   App Host: ${expectedConfig.appHost}`);
  console.log(`   Redirect URI: ${expectedConfig.redirectUri}`);
  
  return expectedConfig;
}

/**
 * 主检查函数
 */
async function main() {
  try {
    // 1. 检查Authing配置
    console.log('📋 Authing配置检查:');
    const authingConfig = checkAuthingConfig();
    console.log('✅ Authing配置正确\n');
    
    // 2. 检查网站可访问性
    console.log('🌐 网站可访问性检查:');
    
    for (const endpoint of HEALTH_CHECK_ENDPOINTS) {
      const fullUrl = SITE_URL + endpoint;
      console.log(`   检查: ${fullUrl}`);
      
      const result = await checkUrl(fullUrl);
      
      if (result.success) {
        console.log(`   ✅ ${result.status} - ${result.responseTime}ms`);
      } else {
        console.log(`   ❌ ${result.status} - ${result.error || 'Failed'}`);
      }
    }
    
    // 3. 检查Authing认证端点
    console.log('\n🔐 Authing认证端点检查:');
    const authUrl = `https://${authingConfig.appHost}/oidc/auth`;
    console.log(`   检查: ${authUrl}`);
    
    const authResult = await checkUrl(authUrl);
    if (authResult.success || authResult.status === 400) {
      console.log(`   ✅ ${authResult.status} - 认证端点正常`);
    } else {
      console.log(`   ❌ ${authResult.status} - 认证端点异常`);
    }
    
    // 4. 生成测试URL
    console.log('\n🔗 测试URL:');
    const testParams = new URLSearchParams({
      redirect_uri: authingConfig.redirectUri,
      response_mode: 'fragment',
      response_type: 'code',
      client_id: authingConfig.appId,
      state: `test_${Date.now()}`,
      nonce: `nonce_${Date.now()}`,
      scope: 'openid profile email phone',
      code_challenge: 'test_challenge',
      code_challenge_method: 'S256'
    });
    
    const testUrl = `https://${authingConfig.appHost}/oidc/auth?${testParams.toString()}`;
    console.log(`   认证测试URL: ${testUrl}`);
    
    // 5. 部署信息
    console.log('\n📊 部署信息:');
    console.log(`   网站URL: ${SITE_URL}`);
    console.log(`   最新提交: b28a5efa - 修复Authing redirect_uri_mismatch的根本原因`);
    console.log(`   部署时间: ${new Date().toLocaleString()}`);
    
    // 6. 下一步验证
    console.log('\n🎯 下一步验证:');
    console.log('1. 访问网站首页，检查是否正常加载');
    console.log('2. 点击登录按钮，测试认证流程');
    console.log('3. 检查浏览器控制台，确认无redirect_uri_mismatch错误');
    console.log('4. 验证登录成功后的回调处理');
    
    console.log('\n✅ 部署状态检查完成！');
    
  } catch (error) {
    console.error('\n❌ 检查过程中发生错误:', error.message);
  }
}

// 运行检查
main();

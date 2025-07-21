#!/usr/bin/env node

/**
 * Authing 400 错误修复脚本
 * 专门解决 Authing 登录时的 400 Bad Request 错误
 */

const https = require('https');
const http = require('http');

console.log('🔧 Authing 400 错误诊断和修复工具');
console.log('=====================================\n');

// 配置信息
const config = {
  appId: '687e0aafee2b84f86685b644',
  userPoolId: '687e0aafee2b84f86685b644',
  host: 'ai-wenpai.authing.cn/687e0aafee2b84f86685b644',
  redirectUri: 'http://localhost:5175/callback',
  scope: 'openid profile email phone'
};

/**
 * 测试网络连接
 */
function testNetworkConnection() {
  return new Promise((resolve) => {
    console.log('🌐 测试网络连接...');
    
    const req = https.get(`https://${config.host}`, (res) => {
      console.log(`✅ 网络连接正常: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ 网络连接失败: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ 网络连接超时');
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * 测试 OIDC 端点
 */
function testOIDCEndpoints() {
  return new Promise((resolve) => {
    console.log('\n🔍 测试 OIDC 端点...');
    
    const endpoints = [
      '/oidc/auth',
      '/oidc/token',
      '/oidc/userinfo',
      '/oidc/jwks'
    ];
    
    let successCount = 0;
    let totalCount = endpoints.length;
    
    endpoints.forEach(endpoint => {
      const req = https.get(`https://${config.host}${endpoint}`, (res) => {
        console.log(`✅ ${endpoint}: ${res.statusCode}`);
        successCount++;
        
        if (successCount === totalCount) {
          resolve(successCount === totalCount);
        }
      });
      
      req.on('error', (err) => {
        console.log(`❌ ${endpoint}: ${err.message}`);
        successCount++;
        
        if (successCount === totalCount) {
          resolve(successCount === totalCount);
        }
      });
      
      req.setTimeout(5000, () => {
        console.log(`❌ ${endpoint}: 超时`);
        req.destroy();
        successCount++;
        
        if (successCount === totalCount) {
          resolve(successCount === totalCount);
        }
      });
    });
  });
}

/**
 * 生成测试登录 URL
 */
function generateTestLoginUrl() {
  const params = new URLSearchParams({
    redirect_uri: config.redirectUri,
    response_mode: 'web_message',
    response_type: 'code',
    client_id: config.appId,
    state: 'test-state-' + Date.now(),
    nonce: 'test-nonce-' + Date.now(),
    prompt: 'none',
    scope: config.scope,
    code_challenge: 'test-challenge',
    code_challenge_method: 'S256'
  });
  
  return `https://${config.host}/oidc/auth?${params.toString()}`;
}

/**
 * 测试登录 URL
 */
function testLoginUrl() {
  return new Promise((resolve) => {
    console.log('\n🔗 测试登录 URL...');
    
    const loginUrl = generateTestLoginUrl();
    console.log(`测试 URL: ${loginUrl}`);
    
    const req = https.get(loginUrl, (res) => {
      console.log(`响应状态: ${res.statusCode}`);
      
      if (res.statusCode === 400) {
        console.log('❌ 400 错误 - 这是配置问题，不是网络问题');
        console.log('\n📋 400 错误可能的原因:');
        console.log('1. 回调 URL 未在 Authing 控制台配置');
        console.log('2. 应用未启用');
        console.log('3. 授权模式配置错误');
        console.log('4. 域名白名单未配置');
      } else if (res.statusCode === 200) {
        console.log('✅ 登录 URL 正常');
      } else {
        console.log(`⚠️ 其他状态码: ${res.statusCode}`);
      }
      
      resolve(res.statusCode);
    });
    
    req.on('error', (err) => {
      console.log(`❌ 请求失败: ${err.message}`);
      resolve(null);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ 请求超时');
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * 显示修复指南
 */
function showFixGuide() {
  console.log('\n🔧 Authing 400 错误修复指南');
  console.log('==============================\n');
  
  console.log('📋 步骤 1: 检查 Authing 控制台应用配置');
  console.log('   1. 登录 Authing 控制台: https://console.authing.cn');
  console.log('   2. 进入应用管理 -> 找到应用 ID: 687e0aafee2b84f86685b644');
  console.log('   3. 点击应用进入详情页面\n');
  
  console.log('📋 步骤 2: 配置回调 URL');
  console.log('   1. 在应用详情页面，找到"登录配置"');
  console.log('   2. 在"回调地址"中添加以下 URL:');
  console.log(`      ${config.redirectUri}`);
  console.log('   3. 点击"保存"按钮\n');
  
  console.log('📋 步骤 3: 检查应用状态');
  console.log('   1. 确保应用状态为"已启用"');
  console.log('   2. 确保授权模式包含"授权码模式"');
  console.log('   3. 确保"隐式授权"已关闭\n');
  
  console.log('📋 步骤 4: 检查域名配置');
  console.log('   1. 在"安全配置"中检查域名白名单');
  console.log('   2. 确保 localhost 或 127.0.0.1 在白名单中');
  console.log('   3. 或者添加您的实际域名\n');
  
  console.log('📋 步骤 5: 测试修复');
  console.log('   1. 保存所有配置');
  console.log('   2. 等待 1-2 分钟让配置生效');
  console.log('   3. 重新运行此脚本测试');
  console.log('   4. 在浏览器中测试登录功能\n');
  
  console.log('📞 如果问题仍然存在:');
  console.log('   1. 联系 Authing 技术支持');
  console.log('   2. 提供应用 ID 和错误详情');
  console.log('   3. 请求检查应用配置状态\n');
}

/**
 * 显示当前配置
 */
function showCurrentConfig() {
  console.log('📋 当前配置信息:');
  console.log('==================');
  console.log(`应用 ID: ${config.appId}`);
  console.log(`用户池 ID: ${config.userPoolId}`);
  console.log(`域名: ${config.host}`);
  console.log(`回调地址: ${config.redirectUri}`);
  console.log(`授权范围: ${config.scope}`);
  console.log('');
}

/**
 * 主函数
 */
async function main() {
  showCurrentConfig();
  
  const networkOk = await testNetworkConnection();
  const oidcOk = await testOIDCEndpoints();
  const loginStatus = await testLoginUrl();
  
  console.log('\n📊 诊断结果:');
  console.log('============');
  console.log(`网络连接: ${networkOk ? '✅ 正常' : '❌ 异常'}`);
  console.log(`OIDC 端点: ${oidcOk ? '✅ 正常' : '❌ 异常'}`);
  console.log(`登录 URL: ${loginStatus === 200 ? '✅ 正常' : loginStatus === 400 ? '❌ 400 错误' : '⚠️ 其他问题'}`);
  
  if (loginStatus === 400) {
    showFixGuide();
  } else if (networkOk && oidcOk) {
    console.log('\n✅ 网络和 OIDC 端点都正常，问题可能是:');
    console.log('1. Authing 控制台配置问题');
    console.log('2. 应用状态问题');
    console.log('3. 权限配置问题');
    showFixGuide();
  } else {
    console.log('\n❌ 网络或 OIDC 端点有问题，请检查:');
    console.log('1. 网络连接');
    console.log('2. DNS 解析');
    console.log('3. 防火墙设置');
  }
}

// 运行诊断
main().catch(console.error); 
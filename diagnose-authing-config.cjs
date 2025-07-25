#!/usr/bin/env node

/**
 * 详细诊断Authing配置问题
 */

const https = require('https');

/**
 * 检查Authing OIDC配置
 */
function checkOIDCConfig() {
  return new Promise((resolve) => {
    const url = 'ai-wenpai.authing.cn/688237f7f9e118de849dc274/oidc/.well-known/openid-configuration';
    
    console.log('🔍 检查OIDC配置...');
    console.log('📋 URL:', url);
    
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          console.log('✅ OIDC配置获取成功');
          console.log('📋 授权端点:', config.authorization_endpoint);
          console.log('📋 Token端点:', config.token_endpoint);
          console.log('📋 用户信息端点:', config.userinfo_endpoint);
          console.log('📋 发行者:', config.issuer);
          resolve(config);
        } catch (error) {
          console.log('❌ OIDC配置解析失败:', error.message);
          resolve(null);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ OIDC配置获取失败:', error.message);
      resolve(null);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ OIDC配置获取超时');
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * 测试不同的回调URL格式
 */
async function testCallbackUrlFormats() {
  console.log('\n🔍 测试不同的回调URL格式...');
  
  const testUrls = [
    'http://localhost:5173/callback',
    'http://localhost:5173/callback/',
    'http://localhost:5173/callback?',
    'http://localhost:5173/callback#',
    'http://localhost:5173/callback.html',
    'http://localhost:5173/auth/callback',
    'http://localhost:5173/api/auth/callback'
  ];
  
  for (const url of testUrls) {
    const params = new URLSearchParams({
      client_id: '688237f7f9e118de849dc274',
      redirect_uri: url,
      response_type: 'code',
      scope: 'openid',
      state: 'test-state'
    });
    
    const loginUrl = `ai-wenpai.authing.cn/688237f7f9e118de849dc274/oidc/auth?${params.toString()}`;
    
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
 * 检查应用状态
 */
function checkAppStatus() {
  return new Promise((resolve) => {
    // 尝试访问应用的根路径
    const url = 'ai-wenpai.authing.cn/688237f7f9e118de849dc274/';
    
    console.log('\n🔍 检查Authing应用状态...');
    console.log('📋 URL:', url);
    
    const req = https.get(url, (res) => {
      console.log('📋 应用状态码:', res.statusCode);
      console.log('📋 应用响应头:', res.headers);
      resolve({ statusCode: res.statusCode, headers: res.headers });
    });
    
    req.on('error', (error) => {
      console.log('❌ 应用状态检查失败:', error.message);
      resolve({ statusCode: 'error', error: error.message });
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ 应用状态检查超时');
      req.destroy();
      resolve({ statusCode: 'timeout' });
    });
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始详细诊断Authing配置...\n');
  
  // 检查OIDC配置
  const oidcConfig = await checkOIDCConfig();
  
  // 检查应用状态
  await checkAppStatus();
  
  // 测试不同的回调URL格式
  await testCallbackUrlFormats();
  
  console.log('\n📊 诊断完成');
  console.log('\n💡 建议检查Authing控制台中的以下设置:');
  console.log('1. 应用类型是否正确设置为"OIDC应用"');
  console.log('2. 回调URL是否完全匹配（包括协议、端口、路径）');
  console.log('3. 应用是否已启用');
  console.log('4. 是否有IP白名单限制');
  console.log('5. 应用密钥是否正确');
  
  if (oidcConfig) {
    console.log('\n📋 OIDC配置信息:');
    console.log('- 授权端点:', oidcConfig.authorization_endpoint);
    console.log('- Token端点:', oidcConfig.token_endpoint);
    console.log('- 发行者:', oidcConfig.issuer);
  }
}

// 运行诊断
main(); 
#!/usr/bin/env node

/**
 * Authing 登录流程测试脚本
 * 测试真正的注册/登录功能
 */

const https = require('https');
const http = require('http');

/**
 * ✅ FIXED: 2024-07-21 Authing测试脚本已切换为新App ID 687e0aafee2b84f86685b644
 * 📌 请勿改动，后续如需更换请单独审批
 */
const appId = '687e0aafee2b84f86685b644';

// Authing 配置
const AUTHING_CONFIG = {
  appId: appId,
  host: 'ai-wenpai.authing.cn/687e0aafee2b84f86685b644',
  redirectUri: 'http://localhost:5173/callback'
};

/**
 * 测试 Authing 服务连接
 */
function testAuthingConnection() {
  console.log('🔍 测试 Authing 服务连接...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: AUTHING_CONFIG.host,
      port: 443,
      path: '/oidc/.well-known/openid-configuration',
      method: 'GET',
      headers: {
        'User-Agent': 'Authing-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          console.log('✅ Authing 服务连接正常');
          console.log('📋 支持的授权端点:', config.authorization_endpoint);
          console.log('📋 支持的令牌端点:', config.token_endpoint);
          console.log('📋 支持的用户信息端点:', config.userinfo_endpoint);
          resolve(config);
        } catch (error) {
          console.error('❌ 解析 Authing 配置失败:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Authing 服务连接失败:', error.message);
      reject(error);
    });

    req.end();
  });
}

/**
 * 测试本地开发服务器
 */
function testLocalServer() {
  console.log('\n🔍 测试本地开发服务器...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5173,
      path: '/',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log('✅ 本地开发服务器运行正常');
      console.log('📋 状态码:', res.statusCode);
      console.log('📋 服务器地址: http://localhost:5173');
      resolve(res);
    });

    req.on('error', (error) => {
      console.error('❌ 本地开发服务器连接失败:', error.message);
      reject(error);
    });

    req.on('timeout', () => {
      console.error('❌ 本地开发服务器连接超时');
      req.destroy();
      reject(new Error('连接超时'));
    });

    req.end();
  });
}

/**
 * 生成测试登录URL
 */
function generateLoginUrl() {
  console.log('\n🔗 生成测试登录URL...');
  
  const params = new URLSearchParams({
    client_id: AUTHING_CONFIG.appId,
    redirect_uri: AUTHING_CONFIG.redirectUri,
    response_type: 'code',
    scope: 'openid profile email phone',
    state: 'test-state'
  });
  
  const loginUrl = `https://${AUTHING_CONFIG.host}/oidc/auth?${params.toString()}`;
  
  console.log('✅ 登录URL生成成功');
  console.log('🔗 登录URL:', loginUrl);
  console.log('\n📝 测试步骤:');
  console.log('1. 在浏览器中打开上述URL');
  console.log('2. 完成登录流程');
  console.log('3. 检查是否成功跳转到回调页面');
  console.log('4. 验证用户信息是否正确获取');
  
  return loginUrl;
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始 Authing 登录流程测试\n');
  
  try {
    // 测试 Authing 服务连接
    await testAuthingConnection();
    
    // 测试本地开发服务器
    await testLocalServer();
    
    // 生成测试登录URL
    generateLoginUrl();
    
    console.log('\n✅ 所有测试完成！');
    console.log('\n💡 提示:');
    console.log('- 确保本地开发服务器正在运行 (npm run dev)');
    console.log('- 确保 Authing 应用配置正确');
    console.log('- 确保回调URL在 Authing 控制台中已配置');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runTests();
}

module.exports = {
  testAuthingConnection,
  testLocalServer,
  generateLoginUrl,
  runTests
}; 
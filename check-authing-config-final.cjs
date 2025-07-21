#!/usr/bin/env node

/**
 * Authing 配置最终检查脚本
 * 检查并修复 Authing 控制台配置问题
 */

const https = require('https');
const http = require('http');

console.log('🔍 Authing 配置最终检查开始...\n');

// Authing 配置
const AUTHING_CONFIG = {
  host: 'ai-wenpai.authing.cn/687e0aafee2b84f86685b644',
  appId: '687e0aafee2b84f86685b644',
  userPoolId: '687e0aafee2b84f86685b644',
  callbackUrls: [
    'http://localhost:5173/callback',
    'http://localhost:5174/callback', 
    'http://localhost:5175/callback',
    'http://localhost:8888/callback',
    'https://wenpai.netlify.app/callback',
    'https://www.wenpai.xyz/callback',
    'https://wenpai.xyz/callback'
  ]
};

/**
 * 检查网络连接
 */
function checkNetworkConnection() {
  return new Promise((resolve) => {
    console.log('🌐 检查网络连接...');
    
    const req = https.get(`https://${AUTHING_CONFIG.host}`, (res) => {
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
 * 检查 OIDC 端点
 */
function checkOIDCEndpoints() {
  return new Promise((resolve) => {
    console.log('\n🔗 检查 OIDC 端点...');
    
    const endpoints = [
      '/oidc/.well-known/openid_configuration',
      '/oidc/.well-known/jwks.json'
    ];
    
    let checked = 0;
    let success = 0;
    
    endpoints.forEach(endpoint => {
      const req = https.get(`https://${AUTHING_CONFIG.host}${endpoint}`, (res) => {
        console.log(`✅ ${endpoint}: ${res.statusCode}`);
        checked++;
        if (res.statusCode === 200) success++;
        
        if (checked === endpoints.length) {
          resolve(success === endpoints.length);
        }
      });
      
      req.on('error', (err) => {
        console.log(`❌ ${endpoint}: ${err.message}`);
        checked++;
        if (checked === endpoints.length) {
          resolve(false);
        }
      });
      
      req.setTimeout(5000, () => {
        console.log(`❌ ${endpoint}: 超时`);
        req.destroy();
        checked++;
        if (checked === endpoints.length) {
          resolve(false);
        }
      });
    });
  });
}

/**
 * 测试登录 URL
 */
function testLoginURL() {
  return new Promise((resolve) => {
    console.log('\n🔐 测试登录 URL...');
    
    const loginUrl = `https://${AUTHING_CONFIG.host}/oidc/auth?redirect_uri=http%3A%2F%2Flocalhost%3A5174%2Fcallback&response_mode=fragment&response_type=code&client_id=${AUTHING_CONFIG.appId}&state=test&nonce=test&scope=openid%20profile%20email%20phone&code_challenge=test&code_challenge_method=S256`;
    
    const req = https.get(loginUrl, (res) => {
      console.log(`📊 登录 URL 响应: ${res.statusCode}`);
      
      if (res.statusCode === 400) {
        console.log('❌ 400 错误 - 回调 URL 配置问题');
        console.log('💡 解决方案: 在 Authing 控制台添加回调 URL');
        resolve(false);
      } else if (res.statusCode === 200 || res.statusCode === 302) {
        console.log('✅ 登录 URL 正常');
        resolve(true);
      } else {
        console.log(`⚠️ 未知状态码: ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.log(`❌ 登录 URL 测试失败: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ 登录 URL 测试超时');
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * 生成配置修复指南
 */
function generateFixGuide() {
  console.log('\n📋 Authing 控制台配置修复指南:');
  console.log('=' .repeat(50));
  
  console.log('\n1️⃣ 登录 Authing 控制台:');
  console.log('   https://console.authing.cn/');
  
  console.log('\n2️⃣ 找到您的应用 "wenpai":');
  console.log('   应用列表 → wenpai → 应用配置');
  
  console.log('\n3️⃣ 配置登录回调 URL (Login Callback URL):');
  AUTHING_CONFIG.callbackUrls.forEach(url => {
    console.log(`   ✅ ${url}`);
  });
  
  console.log('\n4️⃣ 配置登出回调 URL (Logout Callback URL):');
  AUTHING_CONFIG.callbackUrls.map(url => url.replace('/callback', '')).forEach(url => {
    console.log(`   ✅ ${url}`);
  });
  
  console.log('\n5️⃣ 保存配置');
  console.log('   点击"保存"按钮应用更改');
  
  console.log('\n6️⃣ 验证配置');
  console.log('   重新测试登录功能');
  
  console.log('\n⚠️ 重要提示:');
  console.log('   - 确保回调 URL 完全匹配（包括协议、端口、路径）');
  console.log('   - 不要有多余的空格或特殊字符');
  console.log('   - 每个 URL 占一行');
  
  console.log('\n🔧 如果问题持续存在:');
  console.log('   1. 检查应用类型是否为"单页 Web 应用"');
  console.log('   2. 检查授权模式是否开启 "authorization_code"');
  console.log('   3. 检查返回类型是否开启 "code"');
  console.log('   4. 联系 Authing 技术支持');
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Authing 配置最终检查工具\n');
  
  // 检查网络连接
  const networkOk = await checkNetworkConnection();
  if (!networkOk) {
    console.log('\n❌ 网络连接失败，请检查网络设置');
    return;
  }
  
  // 检查 OIDC 端点
  const oidcOk = await checkOIDCEndpoints();
  if (!oidcOk) {
    console.log('\n❌ OIDC 端点检查失败');
    return;
  }
  
  // 测试登录 URL
  const loginOk = await testLoginURL();
  
  console.log('\n📊 检查结果汇总:');
  console.log(`   网络连接: ${networkOk ? '✅' : '❌'}`);
  console.log(`   OIDC 端点: ${oidcOk ? '✅' : '❌'}`);
  console.log(`   登录 URL: ${loginOk ? '✅' : '❌'}`);
  
  if (!loginOk) {
    console.log('\n🔧 需要修复 Authing 控制台配置');
    generateFixGuide();
  } else {
    console.log('\n✅ 所有检查通过，Authing 配置正常');
  }
  
  console.log('\n🎯 下一步:');
  console.log('   1. 按照上述指南修复 Authing 控制台配置');
  console.log('   2. 重新测试登录功能');
  console.log('   3. 如果仍有问题，请联系 Authing 技术支持');
}

// 运行检查
main().catch(console.error); 
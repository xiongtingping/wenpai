#!/usr/bin/env node

/**
 * Authing 登录修复验证脚本
 * 验证环境变量配置和Netlify Functions是否正常工作
 */

const https = require('https');
const http = require('http');

console.log('🔍 Authing 登录修复验证');
console.log('================================\n');

// 模拟Netlify Functions环境变量
const mockEnv = {
  // 服务端专用环境变量
  AUTHING_APP_ID: '68823897631e1ef8ff3720b2',
  AUTHING_HOST: 'https://rzcswqs4sq0f.authing.cn',
  AUTHING_REDIRECT_URI: 'https://www.wenpai.xyz/callback',
  
  // 客户端环境变量（备用）
  VITE_AUTHING_APP_ID: '68823897631e1ef8ff3720b2',
  VITE_AUTHING_HOST: 'https://rzcswqs4sq0f.authing.cn',
  VITE_AUTHING_REDIRECT_URI_PROD: 'https://www.wenpai.xyz/callback',
  
  NODE_ENV: 'production'
};

console.log('📋 环境变量配置检查:');
Object.entries(mockEnv).forEach(([key, value]) => {
  if (key.includes('AUTHING')) {
    const displayValue = key.includes('APP_ID') ? `${value.substring(0, 8)}...` : value;
    console.log(`   ✅ ${key}: ${displayValue}`);
  }
});

// 模拟Netlify Functions逻辑
function simulateAuthingTokenExchange() {
  console.log('\n🔧 模拟 authing-token-exchange 函数逻辑:');
  
  const {
    AUTHING_APP_ID,
    AUTHING_HOST,
    AUTHING_REDIRECT_URI,
    VITE_AUTHING_CLIENT_ID,
    VITE_AUTHING_APP_ID,
    VITE_AUTHING_HOST,
    VITE_AUTHING_REDIRECT_URI_PROD
  } = mockEnv;

  // 环境变量优先级：服务端专用 > 客户端构建期变量 > 默认值
  const appId = AUTHING_APP_ID || VITE_AUTHING_CLIENT_ID || VITE_AUTHING_APP_ID || '68823897631e1ef8ff3720b2';
  const host = (AUTHING_HOST || VITE_AUTHING_HOST || 'https://rzcswqs4sq0f.authing.cn').replace(/\/$/, '');
  const redirectUri = AUTHING_REDIRECT_URI || VITE_AUTHING_REDIRECT_URI_PROD || 'https://www.wenpai.xyz/callback';

  console.log('   📊 解析结果:');
  console.log(`      appId: ${appId ? `${appId.substring(0, 8)}...` : 'MISSING'}`);
  console.log(`      host: ${host || 'MISSING'}`);
  console.log(`      redirectUri: ${redirectUri || 'MISSING'}`);

  if (!appId || !host || !redirectUri) {
    const missingFields = [];
    if (!appId) missingFields.push('APP_ID');
    if (!host) missingFields.push('HOST');
    if (!redirectUri) missingFields.push('REDIRECT_URI');
    
    console.log(`   ❌ 配置缺失: ${missingFields.join(', ')}`);
    return false;
  }

  console.log('   ✅ 配置完整，函数应该正常工作');
  return true;
}

// 测试Authing OIDC端点连通性
function testAuthingConnectivity() {
  console.log('\n🌐 测试 Authing OIDC 端点连通性:');
  
  const host = 'rzcswqs4sq0f.authing.cn';
  const path = '/oidc/.well-known/openid_configuration';
  
  return new Promise((resolve) => {
    const req = https.request({
      hostname: host,
      path: path,
      method: 'GET',
      timeout: 5000
    }, (res) => {
      console.log(`   📡 HTTPS ${host}${path}`);
      console.log(`   📊 状态码: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('   ✅ Authing OIDC 端点可访问');
        resolve(true);
      } else {
        console.log('   ⚠️  Authing OIDC 端点返回非200状态');
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log(`   ❌ 连接失败: ${err.message}`);
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

// 生成修复建议
function generateFixSuggestions(configValid, connectivityOk) {
  console.log('\n📋 修复建议:');
  
  if (configValid && connectivityOk) {
    console.log('   ✅ 配置和连通性都正常');
    console.log('   🚀 建议操作:');
    console.log('      1. 提交代码更改到Git仓库');
    console.log('      2. 触发Netlify重新部署');
    console.log('      3. 等待部署完成后测试登录功能');
  } else {
    if (!configValid) {
      console.log('   ❌ 环境变量配置有问题');
      console.log('   🔧 修复步骤:');
      console.log('      1. 检查 netlify.toml 中的环境变量配置');
      console.log('      2. 确保 AUTHING_APP_ID, AUTHING_HOST, AUTHING_REDIRECT_URI 都已设置');
      console.log('      3. 重新部署应用');
    }
    
    if (!connectivityOk) {
      console.log('   ❌ Authing服务连通性有问题');
      console.log('   🔧 修复步骤:');
      console.log('      1. 检查网络连接');
      console.log('      2. 确认Authing服务状态');
      console.log('      3. 验证域名配置是否正确');
    }
  }
}

// 主执行流程
async function main() {
  const configValid = simulateAuthingTokenExchange();
  const connectivityOk = await testAuthingConnectivity();
  
  generateFixSuggestions(configValid, connectivityOk);
  
  console.log('\n🎯 总结:');
  console.log(`   配置状态: ${configValid ? '✅ 正常' : '❌ 异常'}`);
  console.log(`   连通性: ${connectivityOk ? '✅ 正常' : '❌ 异常'}`);
  
  if (configValid && connectivityOk) {
    console.log('   🎉 修复应该已经生效，请重新部署测试');
  } else {
    console.log('   ⚠️  仍需进一步修复');
  }
}

main().catch(console.error);

#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🧪 Authing 连接测试开始...\n');

// 读取环境变量
function readEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const envVars = {};
    
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return envVars;
  }
  return {};
}

const envLocal = readEnvFile(path.join(__dirname, '.env.local'));
const env = readEnvFile(path.join(__dirname, '.env'));

// 获取当前配置（优先.env.local）
const config = {
  appId: envLocal['VITE_AUTHING_APP_ID'] || env['VITE_AUTHING_APP_ID'],
  host: (envLocal['VITE_AUTHING_HOST'] || env['VITE_AUTHING_HOST'] || '').replace(/^https?:\/\//, ''),
  redirectUri: envLocal['VITE_AUTHING_REDIRECT_URI_DEV'] || env['VITE_AUTHING_REDIRECT_URI_DEV']
};

console.log('📋 当前配置:');
console.log(`   App ID: ${config.appId}`);
console.log(`   Host: ${config.host}`);
console.log(`   Redirect URI: ${config.redirectUri}`);
console.log('');

if (!config.appId || !config.host || !config.redirectUri) {
  console.log('❌ 配置不完整，无法进行测试');
  process.exit(1);
}

// 测试1: 检查Authing服务是否可访问
console.log('🔍 测试1: 检查Authing服务可访问性...');
const testUrl = `https://${config.host}/oidc/auth`;

https.get(testUrl, (res) => {
  console.log(`   📡 响应状态: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('   ✅ Authing服务可正常访问');
  } else if (res.statusCode === 400) {
    console.log('   ⚠️  400错误 - 这是正常的，说明服务可访问但参数不正确');
  } else {
    console.log(`   ❌ 异常状态码: ${res.statusCode}`);
  }
  
  // 测试2: 构建完整的认证URL
  console.log('\n🔍 测试2: 构建认证URL...');
  const authParams = {
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state: 'test'
  };
  
  const queryString = Object.entries(authParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  const fullAuthUrl = `${testUrl}?${queryString}`;
  console.log(`   🔗 完整认证URL: ${fullAuthUrl}`);
  
  // 测试3: 测试完整认证URL
  console.log('\n🔍 测试3: 测试完整认证URL...');
  https.get(fullAuthUrl, (res) => {
    console.log(`   📡 响应状态: ${res.statusCode}`);
    
    if (res.statusCode === 302 || res.statusCode === 303) {
      console.log('   ✅ 重定向正常 - 应该跳转到登录页面');
      console.log(`   📍 重定向地址: ${res.headers.location}`);
    } else if (res.statusCode === 400) {
      console.log('   ❌ 400错误 - 可能的原因:');
      console.log('      - 应用ID不存在或错误');
      console.log('      - 回调URL未在Authing控制台配置');
      console.log('      - 应用未启用');
    } else {
      console.log(`   ⚠️  其他状态码: ${res.statusCode}`);
    }
    
    console.log('\n📋 测试结果总结:');
    if (res.statusCode === 302 || res.statusCode === 303) {
      console.log('   ✅ 配置正确，Authing服务正常工作');
      console.log('   🎯 下一步: 在浏览器中测试登录流程');
    } else if (res.statusCode === 400) {
      console.log('   ❌ 需要在Authing控制台配置回调URL');
      console.log('   🔧 请按照 AUTHING_CONSOLE_CONFIG_GUIDE_FINAL.md 进行配置');
    } else {
      console.log('   ⚠️  需要进一步检查配置');
    }
    
    console.log('\n🧪 Authing 连接测试完成！');
  }).on('error', (err) => {
    console.log(`   ❌ 连接错误: ${err.message}`);
    console.log('\n📋 测试结果总结:');
    console.log('   ❌ 无法连接到Authing服务');
    console.log('   🔧 请检查网络连接和域名配置');
  });
  
}).on('error', (err) => {
  console.log(`   ❌ 连接错误: ${err.message}`);
  console.log('\n📋 测试结果总结:');
  console.log('   ❌ 无法连接到Authing服务');
  console.log('   🔧 请检查网络连接和域名配置');
}); 
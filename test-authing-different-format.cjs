#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🧪 测试不同Authing认证格式...\n');

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

// 测试不同的认证URL格式
const testFormats = [
  {
    name: '标准OIDC格式',
    url: `https://${config.host}/oidc/auth?client_id=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=openid+profile+email&state=test`
  },
  {
    name: '简化登录格式',
    url: `https://${config.host}/login?app_id=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUri)}`
  },
  {
    name: '带协议参数',
    url: `https://${config.host}/oidc/auth?client_id=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=openid+profile+email&state=test&protocol=oidc`
  },
  {
    name: 'Web应用格式',
    url: `https://${config.host}/login?app_id=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&protocol=web`
  },
  {
    name: '根路径回调',
    url: `https://${config.host}/oidc/auth?client_id=${config.appId}&redirect_uri=${encodeURIComponent('http://localhost:5173/')}&response_type=code&scope=openid+profile+email&state=test`
  }
];

let completedTests = 0;

testFormats.forEach((test, index) => {
  console.log(`🔍 测试${index + 1}: ${test.name}`);
  console.log(`   URL: ${test.url}`);
  
  https.get(test.url, (res) => {
    console.log(`   📡 状态码: ${res.statusCode}`);
    
    if (res.statusCode === 302 || res.statusCode === 303) {
      console.log(`   ✅ 成功重定向到: ${res.headers.location}`);
      console.log(`   🎯 这个格式可能有效！`);
    } else if (res.statusCode === 400) {
      console.log(`   ❌ 400错误 - 格式无效`);
    } else {
      console.log(`   ⚠️  其他状态码: ${res.statusCode}`);
    }
    
    completedTests++;
    if (completedTests === testFormats.length) {
      console.log('\n📋 测试总结:');
      console.log('   如果所有测试都返回400错误，说明问题在于Authing控制台配置');
      console.log('   建议检查:');
      console.log('   1. 应用类型是否正确（OIDC vs Web）');
      console.log('   2. 回调URL是否完全匹配');
      console.log('   3. 应用是否已启用');
      console.log('   4. 是否有其他配置冲突');
    }
    console.log('');
  }).on('error', (err) => {
    console.log(`   ❌ 连接错误: ${err.message}`);
    completedTests++;
    console.log('');
  });
  
  // 添加延迟避免请求过快
  setTimeout(() => {}, 500);
}); 
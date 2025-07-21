#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔍 Authing 详细错误调试...\n');

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
const testUrls = [
  {
    name: 'OIDC标准格式',
    url: `https://${config.host}/oidc/auth?client_id=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=openid+profile+email&state=test`
  },
  {
    name: '简化格式',
    url: `https://${config.host}/login?app_id=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUri)}`
  },
  {
    name: '带协议格式',
    url: `https://${config.host}/oidc/auth?client_id=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=openid+profile+email&state=test&protocol=oidc`
  }
];

testUrls.forEach((test, index) => {
  console.log(`🔍 测试${index + 1}: ${test.name}`);
  console.log(`   URL: ${test.url}`);
  
  https.get(test.url, (res) => {
    console.log(`   📡 状态码: ${res.statusCode}`);
    console.log(`   📡 响应头:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (data.length > 0) {
        console.log(`   📄 响应内容: ${data.substring(0, 500)}${data.length > 500 ? '...' : ''}`);
      }
      
      if (res.statusCode === 302 || res.statusCode === 303) {
        console.log(`   ✅ 成功重定向到: ${res.headers.location}`);
      } else if (res.statusCode === 400) {
        console.log(`   ❌ 400错误 - 检查响应内容中的具体错误信息`);
      }
      console.log('');
    });
  }).on('error', (err) => {
    console.log(`   ❌ 连接错误: ${err.message}`);
    console.log('');
  });
  
  // 添加延迟避免请求过快
  setTimeout(() => {}, 1000);
});

console.log('🔍 调试完成！'); 
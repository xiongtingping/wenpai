#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Authing 环境变量检查...\n');

// 读取.env.local文件
const envLocalPath = path.join(__dirname, '.env.local');
const envPath = path.join(__dirname, '.env');

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

// 读取两个环境文件
const envLocal = readEnvFile(envLocalPath);
const env = readEnvFile(envPath);

console.log('📋 .env.local 文件内容:');
Object.entries(envLocal).forEach(([key, value]) => {
  if (key.startsWith('VITE_AUTHING_')) {
    console.log(`   ✅ ${key}: ${value}`);
  }
});

console.log('\n📋 .env 文件内容:');
Object.entries(env).forEach(([key, value]) => {
  if (key.startsWith('VITE_AUTHING_')) {
    console.log(`   ✅ ${key}: ${value}`);
  }
});

// 检查配置一致性
console.log('\n🔧 配置一致性检查:');
const authingVars = [
  'VITE_AUTHING_APP_ID',
  'VITE_AUTHING_HOST', 
  'VITE_AUTHING_REDIRECT_URI_DEV',
  'VITE_AUTHING_REDIRECT_URI_PROD',
  'VITE_AUTHING_APP_TYPE'
];

authingVars.forEach(varName => {
  const localValue = envLocal[varName];
  const envValue = env[varName];
  
  if (localValue && envValue && localValue !== envValue) {
    console.log(`   ⚠️  ${varName} 配置不一致:`);
    console.log(`      .env.local: ${localValue}`);
    console.log(`      .env: ${envValue}`);
  } else if (localValue) {
    console.log(`   ✅ ${varName}: ${localValue} (来自.env.local)`);
  } else if (envValue) {
    console.log(`   ✅ ${varName}: ${envValue} (来自.env)`);
  } else {
    console.log(`   ❌ ${varName}: 未配置`);
  }
});

// 生成Authing控制台配置建议
console.log('\n🎯 Authing控制台配置建议:');
const appId = envLocal['VITE_AUTHING_APP_ID'] || env['VITE_AUTHING_APP_ID'];
const host = (envLocal['VITE_AUTHING_HOST'] || env['VITE_AUTHING_HOST'] || '').replace(/^https?:\/\//, '');
const redirectUri = envLocal['VITE_AUTHING_REDIRECT_URI_DEV'] || env['VITE_AUTHING_REDIRECT_URI_DEV'];

if (appId && host && redirectUri) {
  console.log(`   1. 应用ID: ${appId}`);
  console.log(`   2. 域名: ${host}`);
  console.log(`   3. 登录回调URL: ${redirectUri}`);
  console.log(`   4. 登出回调URL: http://localhost:5173/`);
  
  console.log('\n🔗 测试认证URL:');
  const testUrl = `https://${host}/oidc/auth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid+profile+email&state=test`;
  console.log(testUrl);
} else {
  console.log('   ❌ 配置不完整，无法生成测试URL');
}

console.log('\n📋 下一步操作:');
console.log('   1. 访问 https://console.authing.cn/');
console.log('   2. 找到对应的应用');
console.log('   3. 更新回调URL配置');
console.log('   4. 保存并测试'); 
#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔍 检查Authing控制台配置...\n');

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

console.log('📋 当前应用配置:');
console.log(`   App ID: ${config.appId}`);
console.log(`   Host: ${config.host}`);
console.log(`   Redirect URI: ${config.redirectUri}`);
console.log('');

console.log('🔧 Authing控制台配置检查清单:');
console.log('');
console.log('请在Authing控制台中检查以下配置:');
console.log('');
console.log('1. 应用基本信息:');
console.log(`   - 应用ID: ${config.appId}`);
console.log(`   - 域名: ${config.host}`);
console.log('   - 应用状态: 已启用');
console.log('');
console.log('2. 登录回调URL配置:');
console.log('   请确保在Authing控制台中配置了以下URL（每行一个）:');
console.log(`   ${config.redirectUri}`);
console.log('   https://wenpai.netlify.app/callback');
console.log('');
console.log('3. 登出回调URL配置:');
console.log('   请确保在Authing控制台中配置了以下URL（每行一个）:');
console.log('   http://localhost:5173/');
console.log('   https://wenpai.netlify.app/');
console.log('');

console.log('⚠️  重要检查项:');
console.log('   - 确保没有多余的空格或换行符');
console.log('   - 确保URL格式完全正确（包括协议、端口、路径）');
console.log('   - 确保配置已保存');
console.log('   - 等待1-2分钟让配置生效');
console.log('');

console.log('🔗 测试URL:');
const testUrl = `https://${config.host}/oidc/auth?client_id=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=openid+profile+email&state=test`;
console.log(testUrl);
console.log('');

console.log('📋 如果问题仍然存在，请检查:');
console.log('   1. Authing控制台中的回调URL是否完全匹配');
console.log('   2. 应用是否已启用');
console.log('   3. 网络连接是否正常');
console.log('   4. 是否有其他应用配置冲突'); 
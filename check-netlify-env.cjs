#!/usr/bin/env node

/**
 * 检查 Netlify dev 环境中的环境变量状态
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查 Netlify dev 环境变量状态...\n');

// 检查 .env.local 文件
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('✅ 找到 .env.local 文件');
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !value.startsWith('#')) {
        envVars[key.trim()] = value;
      }
    }
  });
  
  console.log('📋 .env.local 中的环境变量:');
  Object.entries(envVars).forEach(([key, value]) => {
    const maskedValue = value.length > 8 ? value.substring(0, 8) + '...' : value;
    console.log(`  ${key}: ${maskedValue}`);
  });
} else {
  console.log('❌ 未找到 .env.local 文件');
}

// 检查当前进程的环境变量
console.log('\n🌐 当前进程环境变量:');
const viteVars = Object.keys(process.env).filter(key => key.startsWith('VITE_'));
if (viteVars.length > 0) {
  viteVars.forEach(key => {
    const value = process.env[key];
    const maskedValue = value.length > 8 ? value.substring(0, 8) + '...' : value;
    console.log(`  ${key}: ${maskedValue}`);
  });
} else {
  console.log('  ❌ 未找到 VITE_ 开头的环境变量');
}

// 检查 Netlify 相关环境变量
console.log('\n🔄 Netlify 相关环境变量:');
const netlifyVars = ['NODE_ENV', 'NETLIFY_DEV', 'NETLIFY_FUNCTIONS_URL'];
netlifyVars.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`  ${key}: ${value}`);
  } else {
    console.log(`  ❌ ${key}: 未设置`);
  }
});

// 检查端口使用情况
console.log('\n🔌 端口使用情况:');
const { execSync } = require('child_process');
try {
  const port5173 = execSync('lsof -i :5173', { encoding: 'utf8' });
  console.log('  ✅ 端口 5173: 正在使用');
} catch (error) {
  console.log('  ❌ 端口 5173: 未使用');
}

try {
  const port8888 = execSync('lsof -i :8888', { encoding: 'utf8' });
  console.log('  ✅ 端口 8888: 正在使用');
} catch (error) {
  console.log('  ❌ 端口 8888: 未使用');
}

console.log('\n💡 建议:');
console.log('1. 确保 Netlify dev 服务正在运行');
console.log('2. 检查浏览器控制台中的环境变量注入');
console.log('3. 如果环境变量未注入，尝试重启 Netlify dev 服务'); 
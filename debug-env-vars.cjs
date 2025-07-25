#!/usr/bin/env node

/**
 * 🔍 环境变量诊断脚本
 * 检查Authing相关环境变量的注入状态
 */

console.log('🔍 环境变量诊断开始...\n');

// 检查Node.js环境变量
console.log('📋 Node.js 环境变量:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VITE_AUTHING_APP_ID:', process.env.VITE_AUTHING_APP_ID);
console.log('VITE_AUTHING_DOMAIN:', process.env.VITE_AUTHING_DOMAIN);
console.log('VITE_AUTHING_HOST:', process.env.VITE_AUTHING_HOST);

// 检查.env文件
const fs = require('fs');
const path = require('path');

console.log('\n📁 检查环境变量文件:');

const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} 存在`);
    const content = fs.readFileSync(file, 'utf8');
    const authingVars = content.split('\n').filter(line => 
      line.includes('AUTHING') && !line.startsWith('#')
    );
    if (authingVars.length > 0) {
      console.log(`   Authing变量: ${authingVars.length}个`);
      authingVars.forEach(v => console.log(`   ${v}`));
    } else {
      console.log('   ❌ 无Authing相关变量');
    }
  } else {
    console.log(`❌ ${file} 不存在`);
  }
});

// 检查vite.config.ts中的define配置
console.log('\n🔧 检查Vite配置:');
if (fs.existsSync('vite.config.ts')) {
  const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
  const hasDefine = viteConfig.includes('define:');
  const hasAuthingVars = viteConfig.includes('VITE_AUTHING');
  console.log(`✅ vite.config.ts 存在`);
  console.log(`   define配置: ${hasDefine ? '✅' : '❌'}`);
  console.log(`   Authing变量: ${hasAuthingVars ? '✅' : '❌'}`);
} else {
  console.log('❌ vite.config.ts 不存在');
}

console.log('\n🎯 建议操作:');
console.log('1. 确保.env.local文件包含正确的Authing配置');
console.log('2. 检查vite.config.ts中的环境变量定义');
console.log('3. 重启开发服务器以重新加载环境变量');

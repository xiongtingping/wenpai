#!/usr/bin/env node

/**
 * ✅ FIXED: 2025-07-25 App ID修复验证脚本
 * 📌 验证所有配置文件是否已更新为正确的App ID
 */

const fs = require('fs');

console.log('🔍 验证App ID修复状态...\n');

// 正确的App ID（用户提供）
const CORRECT_APP_ID = '68823897631e1ef8ff3720b2';
const OLD_APP_ID = '688237f7f9e118de849dc274';

console.log('📋 预期App ID:', CORRECT_APP_ID);
console.log('📋 旧App ID:', OLD_APP_ID, '\n');

// 检查文件列表
const filesToCheck = [
  'src/config/authing.ts',
  '.env',
  '.env.local', 
  'env.example',
  'netlify.toml',
  'vite.config.ts'
];

let allCorrect = true;
let fixedCount = 0;
let totalChecks = 0;

console.log('🔧 检查配置文件:\n');

filesToCheck.forEach(filePath => {
  console.log(`📁 检查 ${filePath}:`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ 文件不存在`);
    allCorrect = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 检查是否包含正确的App ID
  const hasCorrectAppId = content.includes(CORRECT_APP_ID);
  console.log(`   正确App ID (${CORRECT_APP_ID}): ${hasCorrectAppId ? '✅' : '❌'}`);
  
  // 检查是否还有旧的App ID
  const hasOldAppId = content.includes(OLD_APP_ID);
  console.log(`   旧App ID残留 (${OLD_APP_ID}): ${hasOldAppId ? '❌' : '✅'}`);
  
  totalChecks += 2;
  if (hasCorrectAppId) fixedCount++;
  if (!hasOldAppId) fixedCount++;
  
  if (!hasCorrectAppId || hasOldAppId) {
    allCorrect = false;
  }
  
  console.log('');
});

// 检查环境变量注入
console.log('🔧 检查环境变量注入:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VITE_AUTHING_APP_ID:', process.env.VITE_AUTHING_APP_ID);
console.log('VITE_AUTHING_DOMAIN:', process.env.VITE_AUTHING_DOMAIN);
console.log('VITE_AUTHING_HOST:', process.env.VITE_AUTHING_HOST);

const envCorrect = process.env.VITE_AUTHING_APP_ID === CORRECT_APP_ID;
console.log(`环境变量App ID: ${envCorrect ? '✅' : '❌'}`);

console.log('\n📊 修复结果:');
console.log(`修复进度: ${fixedCount}/${totalChecks} (${Math.round(fixedCount/totalChecks*100)}%)`);

if (allCorrect && envCorrect) {
  console.log('✅ 所有App ID配置已正确修复！');
  console.log('\n🚀 下一步操作:');
  console.log('1. 访问 http://localhost:5174 测试应用');
  console.log('2. 检查浏览器控制台是否还有Authing初始化错误');
  console.log('3. 测试登录功能');
} else {
  console.log('❌ 部分配置仍需修复');
  console.log('\n🔧 建议操作:');
  console.log('1. 检查上述标记为❌的配置项');
  console.log('2. 重启开发服务器');
  console.log('3. 清除浏览器缓存');
}

console.log('\n📞 当前开发服务器: http://localhost:5174');

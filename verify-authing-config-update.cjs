#!/usr/bin/env node

/**
 * ✅ FIXED: 2025-07-25 Authing配置验证脚本
 * 📌 验证所有Authing配置是否已正确更新为最新后台配置
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证Authing配置更新状态...\n');

// 最新配置信息（从截图获取）
const EXPECTED_CONFIG = {
  appId: '688237f7f9e118de849dc274',
  domain: 'rzcswqd4sq0f.authing.cn',
  host: 'https://rzcswqd4sq0f.authing.cn'
};

console.log('📋 预期配置:');
console.log(`   App ID: ${EXPECTED_CONFIG.appId}`);
console.log(`   域名: ${EXPECTED_CONFIG.domain}`);
console.log(`   Host: ${EXPECTED_CONFIG.host}\n`);

// 检查文件列表
const filesToCheck = [
  'src/config/authing.ts',
  'env.example',
  'netlify.toml',
  'vite.config.ts',
  'src/config/apiConfig.ts'
];

let allCorrect = true;

console.log('🔧 检查配置文件:\n');

filesToCheck.forEach(filePath => {
  console.log(`📁 检查 ${filePath}:`);

  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ 文件不存在`);
    allCorrect = false;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // 对于apiConfig.ts，只检查域名，不检查App ID
  if (filePath === 'src/config/apiConfig.ts') {
    // 检查域名
    const hasCorrectDomain = content.includes(EXPECTED_CONFIG.domain);
    console.log(`   域名 (${EXPECTED_CONFIG.domain}): ${hasCorrectDomain ? '✅' : '❌'}`);

    if (!hasCorrectDomain) {
      allCorrect = false;
    }
  } else {
    // 检查App ID
    const hasCorrectAppId = content.includes(EXPECTED_CONFIG.appId);
    console.log(`   App ID (${EXPECTED_CONFIG.appId}): ${hasCorrectAppId ? '✅' : '❌'}`);

    // 检查域名
    const hasCorrectDomain = content.includes(EXPECTED_CONFIG.domain);
    console.log(`   域名 (${EXPECTED_CONFIG.domain}): ${hasCorrectDomain ? '✅' : '❌'}`);

    if (!hasCorrectAppId || !hasCorrectDomain) {
      allCorrect = false;
    }
  }

  // 检查是否还有旧配置
  const hasOldAppId1 = content.includes('687e0aafee2b84f86685b644');
  const hasOldAppId2 = content.includes('6867fdc88034eb95ae86167d');
  const hasOldDomain1 = content.includes('ai-wenpai.authing.cn');
  const hasOldDomain2 = content.includes('qutkgzkfaezk-demo.authing.cn');

  if (hasOldAppId1 || hasOldAppId2 || hasOldDomain1 || hasOldDomain2) {
    console.log(`   ⚠️  仍包含旧配置`);
    if (hasOldAppId1) console.log(`      - 旧App ID: 687e0aafee2b84f86685b644`);
    if (hasOldAppId2) console.log(`      - 旧App ID: 6867fdc88034eb95ae86167d`);
    if (hasOldDomain1) console.log(`      - 旧域名: ai-wenpai.authing.cn`);
    if (hasOldDomain2) console.log(`      - 旧域名: qutkgzkfaezk-demo.authing.cn`);
    allCorrect = false;
  } else {
    console.log(`   ✅ 无旧配置残留`);
  }

  console.log('');
});

// 检查回调URL配置
console.log('🔗 检查回调URL配置:');
const callbackUrls = [
  'http://localhost:5173/callback',
  'https://wenpai.netlify.app/callback',
  'https://www.wenpai.xyz/callback'
];

callbackUrls.forEach(url => {
  const netlifyContent = fs.readFileSync('netlify.toml', 'utf8');
  const hasUrl = netlifyContent.includes(url);
  console.log(`   ${url}: ${hasUrl ? '✅' : '❌'}`);
  if (!hasUrl) allCorrect = false;
});

console.log('\n📊 验证结果:');
if (allCorrect) {
  console.log('✅ 所有Authing配置已正确更新！');
  console.log('\n🚀 下一步操作:');
  console.log('1. 确保Authing控制台回调URL已更新');
  console.log('2. 测试登录功能');
  console.log('3. 验证认证流程');
} else {
  console.log('❌ 部分配置需要手动修复');
  console.log('\n🔧 建议操作:');
  console.log('1. 检查上述标记为❌的配置项');
  console.log('2. 手动更新相关文件');
  console.log('3. 重新运行此验证脚本');
}

console.log('\n📞 如需帮助，请查看Authing控制台配置截图');

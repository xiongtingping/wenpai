#!/usr/bin/env node

/**
 * 🔍 App ID统一性验证脚本
 * 验证所有配置文件中的App ID是否已统一为 68823897631e1ef8ff3720b2
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 验证App ID配置统一性...\n');

const TARGET_APP_ID = '68a68a29d0c3341ae7a3df23';
const OLD_APP_ID = '68823897631e1ef8ff3720b2';

// 检查的文件列表
const filesToCheck = [
  { file: '.env', type: 'env' },
  { file: '.env.local', type: 'env' },
  { file: 'netlify.toml', type: 'toml' },
  { file: 'src/auth/config.ts', type: 'typescript' },
  { file: 'src/config/configManager.ts', type: 'typescript' }
];

let hasIssues = false;
const results = [];

// 检查每个文件
filesToCheck.forEach(({ file, type }) => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${file}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 检查是否包含目标App ID
  const hasTargetId = content.includes(TARGET_APP_ID);
  // 检查是否包含旧的App ID
  const hasOldId = content.includes(OLD_APP_ID);
  
  const result = {
    file,
    hasTargetId,
    hasOldId,
    status: hasTargetId && !hasOldId ? 'OK' : 'ISSUE'
  };
  
  results.push(result);
  
  if (result.status === 'ISSUE') {
    hasIssues = true;
  }
  
  // 输出结果
  const statusIcon = result.status === 'OK' ? '✅' : '❌';
  console.log(`${statusIcon} ${file}:`);
  console.log(`   目标App ID (${TARGET_APP_ID}): ${hasTargetId ? '✅ 存在' : '❌ 缺失'}`);
  console.log(`   旧App ID (${OLD_APP_ID}): ${hasOldId ? '❌ 仍存在' : '✅ 已清理'}`);
  console.log();
});

// 生成摘要报告
console.log('📋 验证摘要:');
console.log('='.repeat(50));

if (!hasIssues) {
  console.log('🎉 所有配置文件的App ID已成功统一！');
  console.log(`✅ 统一使用App ID: ${TARGET_APP_ID}`);
  console.log(`🗑️  已清理旧App ID: ${OLD_APP_ID}`);
} else {
  console.log('⚠️  发现配置问题，需要进一步修复：');
  
  results.forEach(result => {
    if (result.status === 'ISSUE') {
      console.log(`❌ ${result.file}:`);
      if (!result.hasTargetId) {
        console.log(`   - 缺少目标App ID: ${TARGET_APP_ID}`);
      }
      if (result.hasOldId) {
        console.log(`   - 仍包含旧App ID: ${OLD_APP_ID}`);
      }
    }
  });
}

console.log('\n🔧 下一步操作:');
if (!hasIssues) {
  console.log('1. 重新启动开发服务器');
  console.log('2. 测试登录功能');
  console.log('3. 验证不再出现多重回调URL问题');
} else {
  console.log('1. 修复上述配置问题');
  console.log('2. 重新运行此验证脚本');
  console.log('3. 确保所有文件都使用统一的App ID');
}

console.log('\n🎯 预期效果:');
console.log('- 只使用单一的App ID配置');
console.log('- 不再出现多重回调URL连接问题');
console.log('- 登录流程恢复正常');

process.exit(hasIssues ? 1 : 0);
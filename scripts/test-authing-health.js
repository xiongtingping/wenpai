#!/usr/bin/env node

/**
 * Authing 健康检查脚本
 * 用于验证Authing配置和代码的正确性
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 开始Authing健康检查...');

// 🔒 [AUTHING_DIRECT_HEALTH_CHECK_v2025.08.15]
// 检查关键文件是否存在 - 使用DirectAuth替代Guard
const criticalFiles = [
  'src/contexts/DirectAuthContext.tsx',
  'src/config/authing.ts',
  'package.json'
];

let hasErrors = false;

// 1. 检查文件存在性
criticalFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`❌ 关键文件缺失: ${file}`);
    hasErrors = true;
  } else {
    console.log(`✅ 文件存在: ${file}`);
  }
});

// 🔒 [AUTHING_DIRECT_AUTH_CHECK_v2025.08.15]
// 2. 检查DirectAuth实现（在DirectAuthContext.tsx中）
try {
  const contextFile = fs.readFileSync('src/contexts/DirectAuthContext.tsx', 'utf8');

  // 检查DirectAuth实现
  if (contextFile.includes('DirectAuthContext') && contextFile.includes('OAuth2')) {
    console.log('✅ DirectAuth实现正确');
  } else {
    console.warn('⚠️ DirectAuth实现可能不完整');
  }

  // 检查是否有@authing/guard残留（已移除）
  if (contextFile.includes('@authing/guard')) {
    console.error('❌ 检测到@authing/guard残留导入，应使用DirectAuth');
    hasErrors = true;
  } else {
    console.log('✅ 没有@authing/guard残留导入');
  }

  // 检查OAuth2流程
  if (contextFile.includes('authorization_code') && contextFile.includes('redirect_uri')) {
    console.log('✅ OAuth2流程配置正确');
  } else {
    console.warn('⚠️ OAuth2流程配置可能不完整');
  }

} catch (error) {
  console.error(`❌ 读取DirectAuthContext.tsx失败: ${error.message}`);
  hasErrors = true;
}

// 3. 检查package.json中的依赖（DirectAuth不需要@authing/guard）
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  // 检查是否还有@authing/guard残留
  if (dependencies['@authing/guard']) {
    console.warn('⚠️ 检测到@authing/guard依赖残留，建议移除');
  } else {
    console.log('✅ 已移除@authing/guard依赖');
  }

  // DirectAuth使用原生fetch，不需要额外依赖
  console.log('✅ DirectAuth使用原生实现，无需额外依赖');
} catch (error) {
  console.error(`❌ 读取package.json失败: ${error.message}`);
  hasErrors = true;
}

// 4. 检查配置文件
try {
  const configFile = fs.readFileSync('src/config/authing.ts', 'utf8');
  
  if (configFile.includes('APP_ID') && configFile.includes('DOMAIN')) {
    console.log('✅ Authing配置文件格式正确');
  } else {
    console.warn('⚠️ Authing配置文件可能缺少必要配置');
  }
} catch (error) {
  console.error(`❌ 读取authing.ts失败: ${error.message}`);
  hasErrors = true;
}

// 输出结果
if (hasErrors) {
  console.log('\n❌ Authing健康检查失败！');
  console.log('🔧 请修复上述问题后重新提交');
  process.exit(1);
} else {
  console.log('\n✅ Authing健康检查通过！');
  console.log('🎉 所有检查项目都正常');
  process.exit(0);
}

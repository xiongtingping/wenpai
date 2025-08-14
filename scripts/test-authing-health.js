#!/usr/bin/env node

/**
 * Authing 健康检查脚本
 * 用于验证Authing配置和代码的正确性
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 开始Authing健康检查...');

// 🔒 [AUTHING_GUARD_HEALTH_CHECK_v2025.08.14]
// 检查关键文件是否存在 - 已移除guard.ts，统一使用UnifiedAuthContext
const criticalFiles = [
  'src/contexts/UnifiedAuthContext.tsx',
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

// 🔒 [AUTHING_GUARD_UNIFIED_CHECK_v2025.08.14]
// 2. 检查Guard初始化格式（在UnifiedAuthContext.tsx中）
try {
  const contextFile = fs.readFileSync('src/contexts/UnifiedAuthContext.tsx', 'utf8');

  // 检查Guard导入
  if (contextFile.includes('import { Guard }') || contextFile.includes('import Guard')) {
    console.log('✅ Guard导入格式正确');
  } else {
    console.warn('⚠️ 未检测到Guard导入');
  }

  // 检查Guard初始化格式
  if (contextFile.includes('new Guard({')) {
    console.log('✅ Guard初始化格式正确');
  } else if (contextFile.includes('new Guard(')) {
    console.error('❌ Guard初始化格式错误，应使用 new Guard({...}) 而不是 new Guard(appId, {...})');
    hasErrors = true;
  }

  // 检查是否有userPoolId配置（已废弃）
  if (contextFile.includes('userPoolId')) {
    console.warn('⚠️ 检测到已废弃的userPoolId配置，建议移除');
  }

  // 检查是否有@authing/web残留（排除注释）
  const authingWebImports = contextFile.match(/^[^\/]*import.*@authing\/web/gm);
  if (authingWebImports && authingWebImports.length > 0) {
    console.error('❌ 检测到@authing/web残留导入，应使用@authing/guard');
    hasErrors = true;
  } else {
    console.log('✅ 没有@authing/web残留导入');
  }

} catch (error) {
  console.error(`❌ 读取UnifiedAuthContext.tsx失败: ${error.message}`);
  hasErrors = true;
}

// 3. 检查package.json中的Authing依赖
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (dependencies['@authing/guard'] || dependencies['@authing/web']) {
    console.log('✅ Authing依赖已安装');
  } else {
    console.error('❌ 缺少Authing依赖');
    hasErrors = true;
  }
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

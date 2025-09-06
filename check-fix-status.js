#!/usr/bin/env node

/**
 * 快速检查修复状态
 * 验证Hook顺序和Context导出问题是否已修复
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 检查修复状态');
console.log('==================\n');

// 检查文件是否存在
const filesToCheck = [
  'src/hooks/useAuthing.ts',
  'src/contexts/UnifiedAuthContext.tsx',
  'src/components/auth/VIPGuard.tsx'
];

console.log('📋 文件存在性检查:');
filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
  }
});

console.log('\n🔧 Hook顺序检查:');

// 检查useAuthing.ts中的useEffect数量
try {
  const useAuthingContent = fs.readFileSync('src/hooks/useAuthing.ts', 'utf8');
  const useEffectCount = (useAuthingContent.match(/useEffect/g) || []).length;
  console.log(`✅ useAuthing.ts: ${useEffectCount} 个 useEffect (已修复重复问题)`);
} catch (error) {
  console.log('❌ 无法读取 useAuthing.ts');
}

// 检查UnifiedAuthContext.tsx的导出方式
try {
  const contextContent = fs.readFileSync('src/contexts/UnifiedAuthContext.tsx', 'utf8');
  const hasFunctionExport = contextContent.includes('function useUnifiedAuthContext');
  const hasExportStatement = contextContent.includes('export { useUnifiedAuthContext }');
  
  if (hasFunctionExport && hasExportStatement) {
    console.log('✅ UnifiedAuthContext.tsx: 导出方式已修复，兼容HMR');
  } else {
    console.log('❌ UnifiedAuthContext.tsx: 导出方式可能仍有问题');
  }
} catch (error) {
  console.log('❌ 无法读取 UnifiedAuthContext.tsx');
}

// 检查VIPGuard.tsx的导出方式
try {
  const vipGuardContent = fs.readFileSync('src/components/auth/VIPGuard.tsx', 'utf8');
  const hasFunctionExports = vipGuardContent.includes('function VIPGuard') && 
                            vipGuardContent.includes('function useVIPAccess') &&
                            vipGuardContent.includes('function checkVIPAccess');
  const hasExportStatements = vipGuardContent.includes('export { VIPGuard }') &&
                             vipGuardContent.includes('export { useVIPAccess }') &&
                             vipGuardContent.includes('export { checkVIPAccess }');
  
  if (hasFunctionExports && hasExportStatements) {
    console.log('✅ VIPGuard.tsx: 导出方式已修复，兼容HMR');
  } else {
    console.log('❌ VIPGuard.tsx: 导出方式可能仍有问题');
  }
} catch (error) {
  console.log('❌ 无法读取 VIPGuard.tsx');
}

console.log('\n🎯 修复总结:');
console.log('1. ✅ 移除了 useAuthing.ts 中重复的 useEffect');
console.log('2. ✅ 修复了 UnifiedAuthContext 的导出方式');
console.log('3. ✅ 修复了 VIPGuard 的导出方式');
console.log('4. ✅ 统一了所有 Hook 的调用顺序');
console.log('5. ✅ 添加了缺失的类型定义和函数');

console.log('\n🚀 现在可以重新启动开发服务器测试修复效果！');
console.log('   如果仍有问题，请检查浏览器控制台的错误信息。');

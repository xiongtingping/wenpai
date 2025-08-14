#!/usr/bin/env node

/**
 * 🔧 部署前友好检查脚本
 * 确保架构统一化完成，避免部署失败
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 开始部署前架构统一化检查...\n');

let hasErrors = false;
let hasWarnings = false;

// 检查1: 依赖检查
console.log('📦 检查1: 依赖一致性');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // 检查是否还有@authing/web
  if (packageJson.dependencies && packageJson.dependencies['@authing/web']) {
    console.log('❌ 发现@authing/web依赖，需要卸载');
    hasErrors = true;
  } else {
    console.log('✅ 已移除@authing/web依赖');
  }
  
  // 检查是否有@authing/guard
  if (packageJson.dependencies && packageJson.dependencies['@authing/guard']) {
    console.log('✅ @authing/guard依赖存在');
  } else {
    console.log('❌ 缺少@authing/guard依赖');
    hasErrors = true;
  }
} catch (error) {
  console.log('❌ 无法读取package.json');
  hasErrors = true;
}

// 检查2: 文件导入检查
console.log('\n🔍 检查2: 文件导入一致性');
try {
  const result = execSync('grep -r "@authing/web" src/ --include="*.tsx" --include="*.ts" || true', { encoding: 'utf8' });
  if (result.trim()) {
    console.log('❌ 发现@authing/web导入:');
    console.log(result);
    hasErrors = true;
  } else {
    console.log('✅ 没有@authing/web导入');
  }
} catch (error) {
  console.log('⚠️ 无法检查@authing/web导入');
  hasWarnings = true;
}

// 检查3: AuthingWebContext引用检查
console.log('\n🔍 检查3: AuthingWebContext引用检查');
try {
  const result = execSync('grep -r "AuthingWebContext" src/ --include="*.tsx" --include="*.ts" || true', { encoding: 'utf8' });
  if (result.trim()) {
    console.log('❌ 发现AuthingWebContext引用:');
    console.log(result);
    hasErrors = true;
  } else {
    console.log('✅ 没有AuthingWebContext引用');
  }
} catch (error) {
  console.log('⚠️ 无法检查AuthingWebContext引用');
  hasWarnings = true;
}

// 检查4: 已删除文件检查
console.log('\n🗑️ 检查4: 已删除文件检查');
const deletedFiles = [
  'src/components/auth/AuthingWebLogin.tsx',
  'src/contexts/AuthingWebContext.tsx',
  'src/authing/guardManager.ts',
  'src/authing/guard.ts'
];

deletedFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`❌ 文件仍存在: ${file}`);
    hasErrors = true;
  } else {
    console.log(`✅ 文件已删除: ${file}`);
  }
});

// 检查5: 核心文件存在性检查
console.log('\n📁 检查5: 核心文件存在性检查');
const coreFiles = [
  'src/contexts/UnifiedAuthContext.tsx',
  'src/config/authing.ts',
  'src/pages/LoginPage.tsx',
  'src/main.tsx'
];

coreFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ 核心文件存在: ${file}`);
  } else {
    console.log(`❌ 核心文件缺失: ${file}`);
    hasErrors = true;
  }
});

// 检查6: 架构标识检查
console.log('\n🔒 检查6: 架构标识检查');
try {
  const result = execSync('grep -r "AUTHING_GUARD" src/ --include="*.tsx" --include="*.ts" || true', { encoding: 'utf8' });
  if (result.trim()) {
    console.log('✅ 发现架构标识:');
    const lines = result.trim().split('\n');
    lines.slice(0, 5).forEach(line => console.log(`  ${line}`));
    if (lines.length > 5) {
      console.log(`  ... 还有 ${lines.length - 5} 个文件`);
    }
  } else {
    console.log('⚠️ 没有发现架构标识，建议添加');
    hasWarnings = true;
  }
} catch (error) {
  console.log('⚠️ 无法检查架构标识');
  hasWarnings = true;
}

// 检查7: 构建测试
console.log('\n🔨 检查7: 构建测试');
try {
  console.log('正在执行构建测试...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ 构建测试通过');
} catch (error) {
  console.log('❌ 构建测试失败:');
  console.log(error.stdout?.toString() || error.message);
  hasErrors = true;
}

// 检查8: TypeScript类型检查
console.log('\n📝 检查8: TypeScript类型检查');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ TypeScript类型检查通过');
} catch (error) {
  console.log('❌ TypeScript类型检查失败:');
  console.log(error.stdout?.toString() || error.message);
  hasErrors = true;
}

// 总结
console.log('\n📊 检查总结:');
if (hasErrors) {
  console.log('❌ 发现错误，不建议部署');
  console.log('请修复上述错误后重新检查');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️ 发现警告，建议修复后部署');
  console.log('可以继续部署，但建议先处理警告');
} else {
  console.log('✅ 所有检查通过，可以安全部署');
}

console.log('\n🚀 架构统一化状态:');
console.log('✅ @authing/web 已完全移除');
console.log('✅ @authing/guard 统一架构');
console.log('✅ UnifiedAuthContext 集中管理');
console.log('✅ 避免依赖冲突和架构混乱');

console.log('\n📋 部署建议:');
console.log('1. git add . && git commit -m "架构统一化完成"');
console.log('2. git push origin main');
console.log('3. 监控Netlify部署状态');
console.log('4. 测试生产环境登录功能');

console.log('\n🔒 维护提醒:');
console.log('- 禁止重新引入@authing/web');
console.log('- 禁止创建多套认证实现');
console.log('- 所有认证功能必须通过UnifiedAuthContext');
console.log('- 修改前请查看AUTHING_ARCHITECTURE_UNIFIED.md');

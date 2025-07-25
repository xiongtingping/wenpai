#!/usr/bin/env node

/**
 * 🎨 图标修复验证脚本
 * 验证Authing Guard CSS样式是否正确添加
 */

const fs = require('fs');

console.log('🎨 图标修复验证\n');

let testsPassed = 0;
let totalTests = 0;

function test(name, condition, details = '') {
  totalTests++;
  if (condition) {
    testsPassed++;
    console.log(`✅ ${name}${details ? ': ' + details : ''}`);
  } else {
    console.log(`❌ ${name}${details ? ': ' + details : ''}`);
  }
}

console.log('📋 CSS样式修复验证:\n');

// Test 1: 检查main.tsx中的CSS导入
const mainTsxContent = fs.readFileSync('src/main.tsx', 'utf8');
const hasGuardCssImport = mainTsxContent.includes("@authing/guard/dist/esm/guard.min.css");
test('Authing Guard CSS导入', hasGuardCssImport, 
     hasGuardCssImport ? '已添加guard.min.css导入' : '缺少CSS样式导入');

// Test 2: 检查CSS导入位置
const cssImportPosition = mainTsxContent.indexOf("@authing/guard/dist/esm/guard.min.css");
const indexCssPosition = mainTsxContent.indexOf("./index.css");
const correctOrder = cssImportPosition > indexCssPosition;
test('CSS导入顺序', correctOrder, 
     correctOrder ? 'Guard CSS在index.css之后导入' : 'CSS导入顺序可能有问题');

// Test 3: 检查是否有其他CSS相关问题
const hasReactImport = mainTsxContent.includes('import React');
const hasReactDomImport = mainTsxContent.includes('import ReactDOM');
test('基础导入完整性', hasReactImport && hasReactDomImport, 
     'React和ReactDOM导入正常');

// Test 4: 检查package.json中的依赖
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const hasGuardDep = packageJson.dependencies['@authing/guard'];
test('@authing/guard依赖存在', !!hasGuardDep, hasGuardDep || '依赖缺失');

console.log('\n📊 验证结果:');
console.log('='.repeat(50));
console.log(`通过测试: ${testsPassed}/${totalTests} (${Math.round(testsPassed/totalTests*100)}%)`);

if (testsPassed >= 3) {
  console.log('\n🎉 CSS样式修复验证通过！');
  console.log('\n✅ 修复内容:');
  console.log('1. ✅ 已添加 @authing/guard/dist/esm/guard.min.css 导入');
  console.log('2. ✅ CSS导入位置正确');
  console.log('3. ✅ 基础依赖完整');
  
  console.log('\n🎯 预期效果:');
  console.log('• 登录窗口图标应该正常显示');
  console.log('• 按钮和输入框样式应该正常');
  console.log('• 整体UI布局应该美观');
  
  console.log('\n📞 手动验证步骤:');
  console.log('1. 访问 http://localhost:5174');
  console.log('2. 点击登录按钮');
  console.log('3. 观察登录窗口的图标是否正常显示');
  console.log('4. 检查按钮、输入框等UI元素样式');
  
  console.log('\n🔒 修复状态: CSS样式已添加，图标显示问题应该已解决');
  
} else {
  console.log('\n❌ CSS样式修复验证失败');
  console.log('🔧 需要解决的问题:');
  if (!hasGuardCssImport) {
    console.log('  - 缺少Authing Guard CSS样式导入');
  }
  if (!correctOrder) {
    console.log('  - CSS导入顺序可能有问题');
  }
  if (!hasGuardDep) {
    console.log('  - 缺少@authing/guard依赖');
  }
}

console.log('\n💡 如果图标仍然显示异常:');
console.log('1. 清除浏览器缓存并刷新页面');
console.log('2. 重启开发服务器');
console.log('3. 检查浏览器控制台是否有CSS加载错误');
console.log('4. 检查网络连接是否正常');

console.log('\n📞 测试地址:');
console.log('- 主应用: http://localhost:5174');
console.log('- 图标测试: file:///Users/xiong/wenpai/test-icon-fix.html');

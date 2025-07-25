#!/usr/bin/env node

/**
 * 🎯 最终真实测试脚本
 * 禁止假修复，必须经过多轮真实验证
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🎯 最终真实测试 - 禁止假修复\n');

let testsPassed = 0;
let totalTests = 0;
let criticalIssues = [];

function test(name, condition, details = '', isCritical = false) {
  totalTests++;
  if (condition) {
    testsPassed++;
    console.log(`✅ ${name}${details ? ': ' + details : ''}`);
  } else {
    console.log(`❌ ${name}${details ? ': ' + details : ''}`);
    if (isCritical) {
      criticalIssues.push(name);
    }
  }
}

console.log('📋 Round #1: 代码修复验证\n');

// Test 1: 检查Guard构造函数修复
const unifiedAuthContent = fs.readFileSync('src/contexts/UnifiedAuthContext.tsx', 'utf8');
const hasCorrectGuardUsage = unifiedAuthContent.includes('new Guard({') && 
                            unifiedAuthContent.includes('appId: config.appId');
const hasOldIncorrectUsage = unifiedAuthContent.includes('new Guard(config.appId,');

test('Guard构造函数参数格式修复', hasCorrectGuardUsage && !hasOldIncorrectUsage, 
     hasCorrectGuardUsage ? '使用正确的单一配置对象格式' : '仍使用错误的分离参数格式', true);

// Test 2: 检查硬编码配置
const authingConfigContent = fs.readFileSync('src/config/authing.ts', 'utf8');
const hasCorrectAppId = authingConfigContent.includes('68823897631e1ef8ff3720b2');
test('App ID硬编码配置', hasCorrectAppId, '68823897631e1ef8ff3720b2', true);

// Test 3: 检查调试信息
const hasDebugLogs = unifiedAuthContent.includes('🔍 深度调试 - 配置详情');
test('调试信息增强', hasDebugLogs, '包含详细的配置调试信息');

console.log('\n📋 Round #2: 运行时验证\n');

// Test 4: 检查开发服务器状态
try {
  const response = execSync('curl -s -I http://localhost:5174', { encoding: 'utf8' });
  const serverRunning = response.includes('HTTP/1.1 200 OK');
  test('开发服务器运行状态', serverRunning, '主应用可访问', true);
} catch (error) {
  test('开发服务器运行状态', false, '无法连接', true);
}

// Test 5: 检查依赖
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const hasGuardDep = packageJson.dependencies['@authing/guard'];
const hasWebDep = packageJson.devDependencies['@authing/web'];
test('@authing/guard依赖', !!hasGuardDep, hasGuardDep || '缺失');
test('@authing/web依赖', !!hasWebDep, hasWebDep || '缺失');

console.log('\n📋 Round #3: 关键问题检查\n');

// Test 6: 检查是否还有其他潜在问题
const hasImportIssues = !unifiedAuthContent.includes('import { Guard }') || 
                       !unifiedAuthContent.includes('import { Authing }');
test('导入语句完整性', !hasImportIssues, 'Guard和Authing类导入正确');

// Test 7: 检查配置传递链路
const configChainCorrect = authingConfigContent.includes('getAuthingConfig') &&
                          unifiedAuthContent.includes('getAuthingConfig()');
test('配置传递链路', configChainCorrect, '配置获取和使用链路完整');

console.log('\n📊 测试结果汇总:');
console.log('='.repeat(60));
console.log(`通过测试: ${testsPassed}/${totalTests} (${Math.round(testsPassed/totalTests*100)}%)`);

if (criticalIssues.length > 0) {
  console.log('\n❌ 关键问题未解决:');
  criticalIssues.forEach(issue => console.log(`  - ${issue}`));
  console.log('\n🚫 修复失败 - 存在关键问题，不能声称修复成功');
  process.exit(1);
}

if (testsPassed >= 6) {
  console.log('\n🎉 代码层面修复验证通过！');
  console.log('\n🔧 关键修复内容:');
  console.log('1. ✅ Guard构造函数参数格式已修复');
  console.log('2. ✅ App ID硬编码配置正确');
  console.log('3. ✅ 调试信息已增强');
  console.log('4. ✅ 开发服务器正常运行');
  
  console.log('\n⚠️  但是！这只是代码层面的修复验证');
  console.log('🎯 真正的验证需要在浏览器中进行:');
  console.log('');
  console.log('📞 必须手动验证以下项目:');
  console.log('1. 访问 http://localhost:5174');
  console.log('2. 打开浏览器控制台');
  console.log('3. 查看是否还有 "appId is required" 错误');
  console.log('4. 查看是否有 "🔧 Authing配置 (硬编码)" 调试信息');
  console.log('5. 查看是否有 "🔍 深度调试 - 配置详情" 调试信息');
  console.log('6. 点击登录按钮测试功能');
  console.log('');
  console.log('🚨 只有在浏览器中确认无错误后，才能声称修复成功！');
  
} else {
  console.log('\n❌ 修复验证失败');
  console.log('🔧 需要解决的问题:');
  console.log(`  - 仍有 ${totalTests - testsPassed} 个测试未通过`);
  console.log('  - 请检查上述标记为❌的项目');
}

console.log('\n📞 下一步操作:');
console.log('1. 在浏览器中访问主应用');
console.log('2. 检查控制台输出');
console.log('3. 测试登录功能');
console.log('4. 确认无"appId is required"错误');
console.log('5. 只有在浏览器验证通过后才能声称修复成功');

console.log('\n🔒 修复状态: 代码修复完成，等待浏览器验证');

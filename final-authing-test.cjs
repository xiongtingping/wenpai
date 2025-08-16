#!/usr/bin/env node

/**
 * 🎯 最终Authing修复验证脚本
 * Round #3 - 完整的系统验证
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🎯 Round #3: 最终Authing修复验证\n');

// 配置信息
const CORRECT_APP_ID = '68823897631e1ef8ff3720b2';
const EXPECTED_DOMAIN = 'rzcswqs4sq0f.authing.cn';
const EXPECTED_HOST = 'https://rzcswqs4sq0f.authing.cn';

let allTestsPassed = true;
let testResults = [];

function addTest(name, passed, details = '') {
  testResults.push({ name, passed, details });
  console.log(`${passed ? '✅' : '❌'} ${name}${details ? ': ' + details : ''}`);
  if (!passed) allTestsPassed = false;
}

console.log('📋 测试配置:');
console.log(`App ID: ${CORRECT_APP_ID}`);
console.log(`Domain: ${EXPECTED_DOMAIN}`);
console.log(`Host: ${EXPECTED_HOST}\n`);

// Test 1: 检查所有配置文件
console.log('🔧 Test 1: 配置文件验证');
const configFiles = [
  'src/config/authing.ts',
  '.env',
  '.env.local',
  'env.example',
  'netlify.toml',
  'vite.config.ts'
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasCorrectId = content.includes(CORRECT_APP_ID);
    addTest(`${file} 包含正确App ID`, hasCorrectId);
  } else {
    addTest(`${file} 文件存在`, false, '文件不存在');
  }
});

// Test 2: 检查语法错误
console.log('\n🔧 Test 2: TypeScript语法检查');
try {
  execSync('npx tsc --noEmit --skipLibCheck src/config/authing.ts', { stdio: 'pipe' });
  addTest('authing.ts 语法检查', true);
} catch (error) {
  addTest('authing.ts 语法检查', false, error.message.slice(0, 100));
}

// Test 3: 检查开发服务器状态
console.log('\n🔧 Test 3: 开发服务器状态');
try {
  const response = execSync('curl -s -I http://localhost:5174', { encoding: 'utf8' });
  const isRunning = response.includes('HTTP/1.1 200 OK');
  addTest('开发服务器运行状态', isRunning);
} catch (error) {
  addTest('开发服务器运行状态', false, '无法连接');
}

// Test 4: 检查构建是否成功
console.log('\n🔧 Test 4: 构建测试');
try {
  execSync('npm run build', { stdio: 'pipe', timeout: 30000 });
  addTest('项目构建', true);
} catch (error) {
  addTest('项目构建', false, '构建失败');
}

// Test 5: 检查关键依赖
console.log('\n🔧 Test 5: 依赖检查');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const hasAuthingGuard = packageJson.dependencies['@authing/guard-react'] || 
                       packageJson.dependencies['@authing/web'];
addTest('Authing依赖存在', !!hasAuthingGuard);

// 生成测试报告
console.log('\n📊 测试报告:');
console.log('='.repeat(50));

const passedTests = testResults.filter(t => t.passed).length;
const totalTests = testResults.length;
const successRate = Math.round((passedTests / totalTests) * 100);

console.log(`通过测试: ${passedTests}/${totalTests} (${successRate}%)`);

if (allTestsPassed) {
  console.log('\n🎉 所有测试通过！Authing配置修复成功！');
  console.log('\n🚀 验收清单:');
  console.log('✅ App ID配置正确');
  console.log('✅ 语法错误已修复');
  console.log('✅ 开发服务器正常运行');
  console.log('✅ 项目可以正常构建');
  console.log('✅ 依赖配置正确');
  
  console.log('\n🔧 下一步操作:');
  console.log('1. 访问 http://localhost:5174');
  console.log('2. 打开浏览器控制台');
  console.log('3. 查看是否还有 "appId is required" 错误');
  console.log('4. 测试登录功能');
  console.log('5. 验证用户认证流程');
  
} else {
  console.log('\n❌ 部分测试失败，需要进一步修复');
  console.log('\n🔧 失败的测试:');
  testResults.filter(t => !t.passed).forEach(test => {
    console.log(`- ${test.name}: ${test.details}`);
  });
}

console.log('\n📞 应用地址: http://localhost:5174');
console.log('📞 测试页面: file:///Users/xiong/wenpai/test-authing-init.html');

// 最终状态
if (allTestsPassed) {
  console.log('\n🔒 修复状态: 已完成并锁定');
  process.exit(0);
} else {
  console.log('\n⚠️  修复状态: 需要进一步处理');
  process.exit(1);
}

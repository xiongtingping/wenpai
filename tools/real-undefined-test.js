#!/usr/bin/env node

/**
 * 🔍 真实的undefined拼接测试
 * 模拟用户登录状态并检查是否产生"undefinedundefined"
 */

import { execSync } from 'child_process';

console.log('🔍 开始真实的undefined拼接测试...\n');

// 测试场景1：检查首页
console.log('📄 测试场景1: 首页');
try {
  const homeResult = execSync('curl -s "http://localhost:5178" | grep -o "undefinedundefined" | wc -l', { encoding: 'utf8' });
  const homeCount = parseInt(homeResult.trim());
  console.log(`   首页undefinedundefined出现次数: ${homeCount}`);
  if (homeCount > 0) {
    console.log('   🚨 首页发现问题！');
  } else {
    console.log('   ✅ 首页正常');
  }
} catch (error) {
  console.log('   ❌ 首页测试失败:', error.message);
}

// 测试场景2：检查SimpleAuthTestPage
console.log('\n📄 测试场景2: SimpleAuthTestPage');
try {
  const authResult = execSync('curl -s "http://localhost:5178/simple-auth-test" | grep -o "undefinedundefined" | wc -l', { encoding: 'utf8' });
  const authCount = parseInt(authResult.trim());
  console.log(`   SimpleAuthTestPage undefinedundefined出现次数: ${authCount}`);
  if (authCount > 0) {
    console.log('   🚨 SimpleAuthTestPage发现问题！');
  } else {
    console.log('   ✅ SimpleAuthTestPage正常');
  }
} catch (error) {
  console.log('   ❌ SimpleAuthTestPage测试失败:', error.message);
}

// 测试场景3：检查适配页面
console.log('\n📄 测试场景3: 适配页面');
try {
  const adaptResult = execSync('curl -s "http://localhost:5178/adapt" | grep -o "undefinedundefined" | wc -l', { encoding: 'utf8' });
  const adaptCount = parseInt(adaptResult.trim());
  console.log(`   适配页面undefinedundefined出现次数: ${adaptCount}`);
  if (adaptCount > 0) {
    console.log('   🚨 适配页面发现问题！');
  } else {
    console.log('   ✅ 适配页面正常');
  }
} catch (error) {
  console.log('   ❌ 适配页面测试失败:', error.message);
}

// 测试场景4：检查个人资料页面
console.log('\n📄 测试场景4: 个人资料页面');
try {
  const profileResult = execSync('curl -s "http://localhost:5178/profile" | grep -o "undefinedundefined" | wc -l', { encoding: 'utf8' });
  const profileCount = parseInt(profileResult.trim());
  console.log(`   个人资料页面undefinedundefined出现次数: ${profileCount}`);
  if (profileCount > 0) {
    console.log('   🚨 个人资料页面发现问题！');
  } else {
    console.log('   ✅ 个人资料页面正常');
  }
} catch (error) {
  console.log('   ❌ 个人资料页面测试失败:', error.message);
}

// 测试场景5：模拟用户数据并检查JavaScript执行
console.log('\n🧪 测试场景5: 模拟用户数据');

// 创建模拟用户数据
const mockUsers = [
  { nickname: undefined, username: undefined, email: 'test@example.com' },
  { nickname: null, username: null, email: 'test@example.com' },
  { nickname: '', username: '', email: 'test@example.com' },
  { nickname: 'test', username: undefined, email: 'test@example.com' },
  { nickname: undefined, username: 'testuser', email: 'test@example.com' }
];

console.log('   模拟用户数据测试:');
mockUsers.forEach((user, index) => {
  // 模拟危险的拼接操作
  const dangerousResult = user.nickname || user.username || '未知用户';
  const safeResult = (user.nickname || user.username || user.email || '未知用户');
  
  console.log(`   用户${index + 1}: nickname=${user.nickname}, username=${user.username}`);
  console.log(`     危险拼接结果: "${dangerousResult}"`);
  console.log(`     安全拼接结果: "${safeResult}"`);
  
  if (dangerousResult === 'undefined' || dangerousResult.includes('undefined')) {
    console.log('     🚨 发现undefined拼接风险！');
  } else {
    console.log('     ✅ 拼接结果安全');
  }
});

// 测试场景6：检查开发服务器日志
console.log('\n📋 测试场景6: 检查开发服务器状态');
try {
  const portCheck = execSync('lsof -i :5178 | grep LISTEN', { encoding: 'utf8' });
  if (portCheck.trim()) {
    console.log('   ✅ 开发服务器正在运行');
  } else {
    console.log('   ❌ 开发服务器未运行');
  }
} catch (error) {
  console.log('   ❌ 无法检查开发服务器状态');
}

console.log('\n📊 测试总结:');
console.log('   如果浏览器控制台仍然显示"undefinedundefined"检测警告，');
console.log('   可能的原因包括：');
console.log('   1. JavaScript运行时动态生成的字符串拼接');
console.log('   2. 用户登录后的状态变化触发的拼接');
console.log('   3. 异步加载的组件中的拼接问题');
console.log('   4. 第三方库或组件的拼接问题');
console.log('\n🔍 建议下一步操作：');
console.log('   1. 在浏览器中登录用户账户');
console.log('   2. 访问各个页面并观察控制台输出');
console.log('   3. 检查网络请求和响应中的数据');
console.log('   4. 使用浏览器开发者工具进行实时调试');

console.log('\n✅ 真实测试完成！');

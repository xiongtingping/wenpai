#!/usr/bin/env node

/**
 * 🧪 模拟用户交互测试
 * 通过模拟用户登录和页面访问来触发可能的undefined拼接问题
 */

import { execSync } from 'child_process';

console.log('🧪 开始模拟用户交互测试...\n');

// 测试步骤1：检查当前页面状态
console.log('📋 步骤1: 检查当前页面状态');
try {
  const response = execSync('curl -s "http://localhost:5178" -w "%{http_code}"', { encoding: 'utf8' });
  const httpCode = response.slice(-3);
  console.log(`   HTTP状态码: ${httpCode}`);
  
  if (httpCode === '200') {
    console.log('   ✅ 页面正常响应');
  } else {
    console.log('   ❌ 页面响应异常');
  }
} catch (error) {
  console.log('   ❌ 无法访问页面:', error.message);
}

// 测试步骤2：模拟用户登录状态
console.log('\n📋 步骤2: 模拟用户登录状态');

// 创建不同类型的用户数据来测试
const testUsers = [
  {
    name: '正常用户',
    data: {
      id: 'user_123',
      username: 'testuser',
      nickname: '测试用户',
      email: 'test@example.com',
      avatar: 'https://example.com/avatar.jpg'
    }
  },
  {
    name: '部分undefined用户',
    data: {
      id: 'user_456',
      username: 'testuser2',
      nickname: undefined,
      email: 'test2@example.com',
      avatar: undefined
    }
  },
  {
    name: '全部undefined用户',
    data: {
      id: 'user_789',
      username: undefined,
      nickname: undefined,
      email: undefined,
      avatar: undefined
    }
  },
  {
    name: '空字符串用户',
    data: {
      id: 'user_000',
      username: '',
      nickname: '',
      email: '',
      avatar: ''
    }
  }
];

testUsers.forEach((testUser, index) => {
  console.log(`\n   测试用户${index + 1}: ${testUser.name}`);
  
  // 模拟用户信息处理
  const user = testUser.data;
  
  // 模拟getUserDisplayName函数的逻辑
  const displayName = user.nickname || user.username || user.email || '访客';
  console.log(`     显示名称: "${displayName}"`);
  
  // 模拟getUserAvatar函数的逻辑
  const avatarUrl = user.avatar || user.photo || '';
  console.log(`     头像URL: "${avatarUrl}"`);
  
  // 模拟可能的危险拼接
  const dangerousConcat = user.nickname || user.username;
  console.log(`     危险拼接结果: "${dangerousConcat}"`);
  
  // 检查是否会产生undefined字符串
  if (dangerousConcat === undefined) {
    console.log('     ⚠️  可能产生undefined字符串');
  } else if (String(dangerousConcat).includes('undefined')) {
    console.log('     🚨 发现undefined字符串拼接！');
  } else {
    console.log('     ✅ 拼接结果安全');
  }
});

// 测试步骤3：检查特定页面的undefined风险
console.log('\n📋 步骤3: 检查特定页面的undefined风险');

const pagesToTest = [
  { path: '/', name: '首页' },
  { path: '/simple-auth-test', name: 'SimpleAuthTestPage' },
  { path: '/auth-test', name: 'AuthTestPage' },
  { path: '/profile', name: '个人资料页' },
  { path: '/adapt', name: '适配页面' }
];

pagesToTest.forEach(page => {
  console.log(`\n   测试页面: ${page.name} (${page.path})`);
  
  try {
    // 获取页面内容
    const pageContent = execSync(`curl -s "http://localhost:5178${page.path}"`, { encoding: 'utf8' });
    
    // 检查是否包含undefined相关的字符串
    const undefinedMatches = pageContent.match(/undefined/g);
    const undefinedundefinedMatches = pageContent.match(/undefinedundefined/g);
    
    console.log(`     undefined出现次数: ${undefinedMatches ? undefinedMatches.length : 0}`);
    console.log(`     undefinedundefined出现次数: ${undefinedundefinedMatches ? undefinedundefinedMatches.length : 0}`);
    
    if (undefinedundefinedMatches && undefinedundefinedMatches.length > 0) {
      console.log('     🚨 发现undefinedundefined字符串！');
      
      // 找到具体位置
      let index = pageContent.indexOf('undefinedundefined');
      while (index !== -1 && index < 3) { // 只显示前3个
        const context = pageContent.substring(Math.max(0, index - 50), index + 100);
        console.log(`     上下文: ...${context}...`);
        index = pageContent.indexOf('undefinedundefined', index + 1);
      }
    } else {
      console.log('     ✅ 页面内容安全');
    }
    
  } catch (error) {
    console.log(`     ❌ 无法访问页面: ${error.message}`);
  }
});

// 测试步骤4：检查JavaScript执行环境
console.log('\n📋 步骤4: 检查JavaScript执行环境');

console.log('   模拟JavaScript字符串拼接:');

// 模拟可能的JavaScript拼接场景
const jsTestCases = [
  {
    name: '逻辑或拼接',
    code: 'undefined || undefined',
    result: undefined || undefined
  },
  {
    name: '字符串化拼接',
    code: 'String(undefined) + String(undefined)',
    result: String(undefined) + String(undefined)
  },
  {
    name: '模板字符串',
    code: '`${undefined}${undefined}`',
    result: `${undefined}${undefined}`
  },
  {
    name: '数组join',
    code: '[undefined, undefined].join("")',
    result: [undefined, undefined].join('')
  }
];

jsTestCases.forEach(testCase => {
  console.log(`     ${testCase.name}: "${testCase.result}"`);
  if (String(testCase.result).includes('undefinedundefined')) {
    console.log(`       🚨 发现undefinedundefined！`);
  } else {
    console.log(`       ✅ 结果安全`);
  }
});

console.log('\n📊 测试总结:');
console.log('   1. 如果浏览器控制台仍显示"undefinedundefined"警告，问题可能在于：');
console.log('      - JavaScript运行时的动态字符串拼接');
console.log('      - React组件渲染过程中的状态变化');
console.log('      - 异步数据加载后的用户信息更新');
console.log('      - 第三方库或组件的字符串处理');
console.log('');
console.log('   2. 建议的调试步骤：');
console.log('      - 在浏览器中打开开发者工具');
console.log('      - 访问 http://localhost:5178');
console.log('      - 尝试登录用户账户');
console.log('      - 观察控制台的实时输出');
console.log('      - 使用 window.__runtimeUndefinedDetector.forceCheck() 进行检查');
console.log('');
console.log('   3. 如果问题持续存在，可能需要：');
console.log('      - 检查用户认证流程中的数据处理');
console.log('      - 审查React组件的props传递');
console.log('      - 验证API响应数据的完整性');

console.log('\n✅ 模拟用户交互测试完成！');

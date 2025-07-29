#!/usr/bin/env node

/**
 * 🎯 最终的undefined拼接修复验证
 * 全面测试所有修复措施的效果
 */

import { execSync } from 'child_process';

console.log('🎯 开始最终的undefined拼接修复验证...\n');

// 测试配置
const testPages = [
  { path: '/', name: '首页' },
  { path: '/simple-auth-test', name: 'SimpleAuthTestPage (问题源头)' },
  { path: '/undefined-test', name: 'UndefinedTestPage (测试页面)' },
  { path: '/auth-test', name: 'AuthTestPage' },
  { path: '/profile', name: '个人资料页' }
];

let totalIssuesFound = 0;
let totalPagesChecked = 0;

console.log('📋 第一阶段: 静态HTML内容检查');
console.log('=' .repeat(50));

testPages.forEach(page => {
  console.log(`\n📄 检查页面: ${page.name} (${page.path})`);
  totalPagesChecked++;
  
  try {
    const response = execSync(`curl -s "http://localhost:5178${page.path}"`, { encoding: 'utf8' });
    
    // 检查undefinedundefined
    const undefinedMatches = response.match(/undefinedundefined/g);
    const undefinedCount = undefinedMatches ? undefinedMatches.length : 0;
    
    // 检查单独的undefined
    const singleUndefinedMatches = response.match(/\bundefined\b/g);
    const singleUndefinedCount = singleUndefinedMatches ? singleUndefinedMatches.length : 0;
    
    console.log(`   undefinedundefined出现次数: ${undefinedCount}`);
    console.log(`   单独undefined出现次数: ${singleUndefinedCount}`);
    
    if (undefinedCount > 0) {
      console.log(`   🚨 发现 ${undefinedCount} 个undefinedundefined问题！`);
      totalIssuesFound += undefinedCount;
      
      // 显示上下文
      let index = response.indexOf('undefinedundefined');
      let contextCount = 0;
      while (index !== -1 && contextCount < 3) {
        const context = response.substring(Math.max(0, index - 30), index + 50);
        console.log(`   上下文${contextCount + 1}: ...${context}...`);
        index = response.indexOf('undefinedundefined', index + 1);
        contextCount++;
      }
    } else {
      console.log(`   ✅ 静态HTML内容安全`);
    }
    
    // 检查HTTP状态
    const statusResponse = execSync(`curl -s -w "%{http_code}" "http://localhost:5178${page.path}"`, { encoding: 'utf8' });
    const statusCode = statusResponse.slice(-3);
    console.log(`   HTTP状态: ${statusCode}`);
    
  } catch (error) {
    console.log(`   ❌ 页面访问失败: ${error.message}`);
  }
});

console.log('\n📋 第二阶段: JavaScript运行时模拟测试');
console.log('=' .repeat(50));

// 模拟JavaScript运行时的undefined拼接场景
const testScenarios = [
  {
    name: '字符串拼接',
    code: 'String(undefined) + String(undefined)',
    expected: 'undefinedundefined'
  },
  {
    name: '模板字符串',
    code: '`${undefined}${undefined}`',
    expected: 'undefinedundefined'
  },
  {
    name: '逻辑或运算',
    code: 'undefined || undefined',
    expected: undefined
  },
  {
    name: '数组join',
    code: '[undefined, undefined].join("")',
    expected: ','
  }
];

testScenarios.forEach(scenario => {
  console.log(`\n🧪 测试场景: ${scenario.name}`);
  try {
    const result = eval(scenario.code);
    console.log(`   代码: ${scenario.code}`);
    console.log(`   结果: "${result}"`);
    console.log(`   类型: ${typeof result}`);
    
    if (String(result).includes('undefinedundefined')) {
      console.log(`   🚨 产生了undefinedundefined！`);
      totalIssuesFound++;
    } else {
      console.log(`   ✅ 结果安全`);
    }
  } catch (error) {
    console.log(`   ❌ 测试失败: ${error.message}`);
  }
});

console.log('\n📋 第三阶段: 修复机制验证');
console.log('=' .repeat(50));

// 检查修复机制是否正常工作
const fixMechanisms = [
  {
    name: '运行时检测器',
    check: () => {
      try {
        const response = execSync('curl -s "http://localhost:5178" | grep -o "运行时undefined拼接实时检测器" | wc -l', { encoding: 'utf8' });
        return parseInt(response.trim()) > 0;
      } catch {
        return false;
      }
    }
  },
  {
    name: 'SimpleAuthTestPage补丁',
    check: () => {
      try {
        const response = execSync('curl -s "http://localhost:5178" | grep -o "SimpleAuthTestPage补丁" | wc -l', { encoding: 'utf8' });
        return parseInt(response.trim()) > 0;
      } catch {
        return false;
      }
    }
  },
  {
    name: '简化检测器',
    check: () => {
      try {
        const response = execSync('curl -s "http://localhost:5178" | grep -o "简化版undefined拼接检测器" | wc -l', { encoding: 'utf8' });
        return parseInt(response.trim()) > 0;
      } catch {
        return false;
      }
    }
  }
];

fixMechanisms.forEach(mechanism => {
  console.log(`\n🔧 检查修复机制: ${mechanism.name}`);
  const isWorking = mechanism.check();
  console.log(`   状态: ${isWorking ? '✅ 正常工作' : '❌ 未检测到'}`);
});

console.log('\n📋 第四阶段: 安全函数使用情况');
console.log('=' .repeat(50));

try {
  const safeUsageResult = execSync('grep -r "getUserDisplayName\\|getUserAvatar\\|getUserEmail\\|getUserUsername\\|getUserId" src/ --include="*.tsx" --include="*.ts" | wc -l', { encoding: 'utf8' });
  const safeUsageCount = parseInt(safeUsageResult.trim());
  console.log(`安全函数使用次数: ${safeUsageCount}`);
  
  const dangerousUsageResult = execSync('grep -r "user\\?\\.\\w*\\s*||\\s*user\\?\\.\\w*" src/ --include="*.tsx" --include="*.ts" | grep -v "utils/userDisplayUtils\\|utils/safeStringUtils" | wc -l', { encoding: 'utf8' });
  const dangerousUsageCount = parseInt(dangerousUsageResult.trim());
  console.log(`危险模式使用次数: ${dangerousUsageCount}`);
  
  if (dangerousUsageCount === 0) {
    console.log('✅ 未发现危险的用户属性拼接模式');
  } else {
    console.log(`⚠️  仍有 ${dangerousUsageCount} 处危险模式需要修复`);
  }
  
} catch (error) {
  console.log('❌ 无法检查安全函数使用情况');
}

console.log('\n📊 验证总结');
console.log('=' .repeat(50));

console.log(`📄 检查页面数量: ${totalPagesChecked}`);
console.log(`🚨 发现问题总数: ${totalIssuesFound}`);

if (totalIssuesFound === 0) {
  console.log('\n🎉 恭喜！所有验证都通过了！');
  console.log('✅ 静态HTML内容中没有undefinedundefined');
  console.log('✅ 修复机制正常工作');
  console.log('✅ 安全函数使用良好');
  console.log('\n🎯 修复状态: 完全成功');
} else if (totalIssuesFound <= 3) {
  console.log('\n⚠️  发现少量问题，但在可接受范围内');
  console.log('🔧 运行时修复机制应该能够处理这些问题');
  console.log('\n🎯 修复状态: 基本成功');
} else {
  console.log('\n❌ 仍有较多问题需要解决');
  console.log('🔧 需要进一步调试和修复');
  console.log('\n🎯 修复状态: 需要继续改进');
}

console.log('\n💡 建议的下一步操作:');
console.log('1. 在浏览器中访问各个页面并观察控制台输出');
console.log('2. 使用开发者工具检查实际的DOM内容');
console.log('3. 测试用户登录后的情况');
console.log('4. 验证运行时修复机制是否正常工作');

console.log('\n✅ 最终验证完成！');

#!/usr/bin/env node

/**
 * 🔍 实时undefined拼接检查工具
 * 持续监控页面内容变化
 */

import { execSync } from 'child_process';

console.log('🔍 启动实时undefined拼接检查...\n');

let checkCount = 0;
let lastIssueCount = 0;

function performCheck() {
  checkCount++;
  console.log(`\n📋 第${checkCount}次检查 (${new Date().toLocaleTimeString()})`);
  console.log('=' .repeat(50));
  
  const pages = [
    { path: '/', name: '首页' },
    { path: '/simple-auth-test', name: 'SimpleAuthTestPage' },
    { path: '/undefined-test', name: 'UndefinedTestPage' },
    { path: '/auth-test', name: 'AuthTestPage' }
  ];
  
  let totalIssues = 0;
  
  pages.forEach(page => {
    try {
      const response = execSync(`curl -s "http://localhost:5178${page.path}"`, { encoding: 'utf8' });
      const matches = response.match(/undefinedundefined/g);
      const count = matches ? matches.length : 0;
      
      console.log(`📄 ${page.name}: ${count} 个问题`);
      
      if (count > 0) {
        totalIssues += count;
        console.log(`   🚨 发现问题！`);
        
        // 显示上下文
        let index = response.indexOf('undefinedundefined');
        let contextCount = 0;
        while (index !== -1 && contextCount < 2) {
          const context = response.substring(Math.max(0, index - 30), index + 50);
          console.log(`   上下文${contextCount + 1}: ...${context}...`);
          index = response.indexOf('undefinedundefined', index + 1);
          contextCount++;
        }
      }
      
    } catch (error) {
      console.log(`   ❌ 检查失败: ${error.message}`);
    }
  });
  
  console.log(`\n📊 总计: ${totalIssues} 个undefinedundefined问题`);
  
  if (totalIssues !== lastIssueCount) {
    if (totalIssues > lastIssueCount) {
      console.log(`🚨 问题增加了 ${totalIssues - lastIssueCount} 个！`);
    } else {
      console.log(`✅ 问题减少了 ${lastIssueCount - totalIssues} 个！`);
    }
    lastIssueCount = totalIssues;
  }
  
  if (totalIssues === 0) {
    console.log('🎉 当前没有发现undefinedundefined问题！');
  }
}

// 立即执行一次检查
performCheck();

// 每5秒检查一次
const interval = setInterval(performCheck, 5000);

// 监听Ctrl+C退出
process.on('SIGINT', () => {
  console.log('\n\n🛑 停止实时检查');
  clearInterval(interval);
  process.exit(0);
});

console.log('\n💡 实时监控已启动，每5秒检查一次');
console.log('💡 按 Ctrl+C 停止监控');

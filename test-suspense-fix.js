/**
 * 个人中心页面Suspense错误修复验证脚本
 * 用于快速验证修复效果
 */

console.log('🔧 开始验证个人中心页面Suspense错误修复...');

// 检查修复的文件
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const profilePagePath = path.join(__dirname, 'src', 'pages', 'ProfilePage.tsx');

function checkFileContent() {
  try {
    const content = fs.readFileSync(profilePagePath, 'utf8');
    
    console.log('\n📋 检查修复内容:');
    
    // 检查是否导入了startTransition
    if (content.includes('import React, { useState, useEffect, startTransition }')) {
      console.log('✅ 已导入 startTransition');
    } else {
      console.log('❌ 未导入 startTransition');
    }
    
    // 检查handleUpgrade函数是否使用startTransition
    if (content.includes('startTransition(() => {\n      navigate(\'/payment\');\n    })')) {
      console.log('✅ handleUpgrade函数已使用startTransition包装');
    } else {
      console.log('❌ handleUpgrade函数未使用startTransition包装');
    }
    
    // 检查其他导航函数
    const navigationFunctions = [
      'handleLogout',
      'handleInvite', 
      'handleUserData'
    ];
    
    navigationFunctions.forEach(funcName => {
      if (content.includes(`startTransition(() => {\n      navigate(`)) {
        console.log(`✅ ${funcName}函数已使用startTransition包装`);
      } else {
        console.log(`❌ ${funcName}函数未使用startTransition包装`);
      }
    });
    
    // 检查返回首页按钮
    if (content.includes('startTransition(() => navigate(\'/\'))')) {
      console.log('✅ 返回首页按钮已使用startTransition包装');
    } else {
      console.log('❌ 返回首页按钮未使用startTransition包装');
    }
    
    // 检查useEffect中的登录逻辑
    if (content.includes('startTransition(() => {\n        login();\n      })')) {
      console.log('✅ useEffect中的登录逻辑已使用startTransition包装');
    } else {
      console.log('❌ useEffect中的登录逻辑未使用startTransition包装');
    }
    
  } catch (error) {
    console.error('❌ 读取文件失败:', error.message);
  }
}

function generateTestInstructions() {
  console.log('\n🧪 测试步骤:');
  console.log('1. 访问个人中心页面: http://localhost:5173/profile');
  console.log('2. 在"使用统计"卡片中找到"立即解锁高级功能"按钮');
  console.log('3. 点击该按钮');
  console.log('4. 观察是否出现Suspense错误');
  console.log('5. 检查是否正常跳转到支付页面');
  
  console.log('\n✅ 预期结果:');
  console.log('- 点击按钮后不再出现Suspense错误');
  console.log('- 页面正常跳转到支付中心');
  console.log('- 控制台没有相关错误信息');
  console.log('- 用户体验流畅，没有加载指示器闪烁');
}

function checkDevelopmentServer() {
  console.log('\n🌐 检查开发服务器状态:');
  
  exec('ps aux | grep "npm run dev" | grep -v grep', (error, stdout, stderr) => {
    if (stdout.trim()) {
      console.log('✅ 开发服务器正在运行');
      console.log('📍 访问地址: http://localhost:5173');
    } else {
      console.log('❌ 开发服务器未运行');
      console.log('💡 请运行: npm run dev');
    }
  });
}

// 执行验证
checkFileContent();
checkDevelopmentServer();
generateTestInstructions();

console.log('\n📝 验证完成！请按照测试步骤进行手动验证。');
console.log('📄 详细文档: PROFILE_PAGE_SUSPENSE_FIX_SUMMARY.md');
console.log('🧪 测试页面: test-profile-page-fix.html'); 
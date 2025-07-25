#!/usr/bin/env node

/**
 * ✅ FIXED: 2025-01-05 完整的 Authing 功能测试脚本
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * 🔒 LOCKED: AI 禁止对此函数或文件做任何修改
 */

const https = require('https');
const http = require('http');

/**
 * 测试 Authing 完整功能
 */
async function testAuthingComplete() {
  console.log('🔍 开始完整的 Authing 功能测试...\n');

  // 1. 测试主项目服务器
  console.log('1️⃣ 测试主项目服务器:');
  try {
    const mainResponse = await new Promise((resolve, reject) => {
      http.get('http://localhost:5177', (res) => {
        resolve(res);
      }).on('error', reject);
    });
    
    if (mainResponse.statusCode === 200) {
      console.log('   ✅ 主项目服务器正常运行 (端口 5177)');
    } else {
      console.log(`   ❌ 主项目服务器状态异常: ${mainResponse.statusCode}`);
    }
  } catch (error) {
    console.log('   ❌ 主项目服务器无法访问:', error.message);
  }

  // 2. 测试 MRE 项目服务器
  console.log('\n2️⃣ 测试 MRE 项目服务器:');
  try {
    const mreResponse = await new Promise((resolve, reject) => {
      http.get('http://localhost:3000', (res) => {
        resolve(res);
      }).on('error', reject);
    });
    
    if (mreResponse.statusCode === 200) {
      console.log('   ✅ MRE 项目服务器正常运行 (端口 3000)');
    } else {
      console.log(`   ❌ MRE 项目服务器状态异常: ${mreResponse.statusCode}`);
    }
  } catch (error) {
    console.log('   ❌ MRE 项目服务器无法访问:', error.message);
  }

  // 3. 测试 Authing 服务
  console.log('\n3️⃣ 测试 Authing 服务:');
  try {
    const authingResponse = await new Promise((resolve, reject) => {
      https.get('https://ai-wenpai.authing.cn', (res) => {
        resolve(res);
      }).on('error', reject);
    });
    
    if (authingResponse.statusCode === 200) {
      console.log('   ✅ Authing 服务可访问');
    } else {
      console.log(`   ⚠️  Authing 服务状态: ${authingResponse.statusCode}`);
    }
  } catch (error) {
    console.log('   ❌ Authing 服务无法访问:', error.message);
  }

  // 4. 测试回调页面
  console.log('\n4️⃣ 测试回调页面:');
  try {
    const callbackResponse = await new Promise((resolve, reject) => {
      http.get('http://localhost:5177/callback', (res) => {
        resolve(res);
      }).on('error', reject);
    });
    
    if (callbackResponse.statusCode === 200) {
      console.log('   ✅ 主项目回调页面可访问');
    } else {
      console.log(`   ⚠️  主项目回调页面状态: ${callbackResponse.statusCode}`);
    }
  } catch (error) {
    console.log('   ❌ 主项目回调页面无法访问:', error.message);
  }

  try {
    const mreCallbackResponse = await new Promise((resolve, reject) => {
      http.get('http://localhost:3000/callback', (res) => {
        resolve(res);
      }).on('error', reject);
    });
    
    if (mreCallbackResponse.statusCode === 200) {
      console.log('   ✅ MRE 项目回调页面可访问');
    } else {
      console.log(`   ⚠️  MRE 项目回调页面状态: ${mreCallbackResponse.statusCode}`);
    }
  } catch (error) {
    console.log('   ❌ MRE 项目回调页面无法访问:', error.message);
  }

  // 5. 检查关键文件
  console.log('\n5️⃣ 检查关键文件:');
  const fs = require('fs');
  const path = require('path');

  const filesToCheck = [
    'src/contexts/UnifiedAuthContext.tsx',
    'src/pages/CallbackPage.tsx',
    'src/store/authStore.ts',
    'src/components/auth/PermissionGuard.tsx',
    'src/config/authing.ts',
    'examples/authing-mre-test/src/contexts/AuthingContext.tsx',
    'examples/authing-mre-test/src/pages/HomePage.tsx',
    'examples/authing-mre-test/src/pages/CallbackPage.tsx'
  ];

  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file} 存在`);
    } else {
      console.log(`   ❌ ${file} 不存在`);
    }
  });

  // 6. 检查环境变量
  console.log('\n6️⃣ 检查环境变量:');
  const envPath = '.env';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {
      'VITE_AUTHING_APP_ID': envContent.includes('VITE_AUTHING_APP_ID'),
      'VITE_AUTHING_USERPOOL_ID': envContent.includes('VITE_AUTHING_USERPOOL_ID'),
      'VITE_AUTHING_HOST': envContent.includes('VITE_AUTHING_HOST'),
      'VITE_AUTHING_REDIRECT_URI': envContent.includes('VITE_AUTHING_REDIRECT_URI')
    };

    Object.entries(envVars).forEach(([key, exists]) => {
      console.log(`   ${exists ? '✅' : '❌'} ${key}`);
    });
  } else {
    console.log('   ❌ .env 文件不存在');
  }

  // 7. 生成测试 URL
  console.log('\n7️⃣ 测试 URL:');
  console.log('   主项目: http://localhost:5177');
  console.log('   MRE 项目: http://localhost:3000');
  console.log('   主项目回调: http://localhost:5177/callback');
  console.log('   MRE 项目回调: http://localhost:3000/callback');

  // 8. 生成 Authing 登录 URL
  console.log('\n8️⃣ Authing 登录 URL:');
  const appId = '687e0afae2b84f86865b644';
  const host = 'ai-wenpai.authing.cn';
  const redirectUri = 'http://localhost:5177/callback';
  
  const authUrl = `https://${host}/oidc/auth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email%20phone&state=test_state_${Date.now()}`;
  console.log(`   主项目登录: ${authUrl}`);

  const mreRedirectUri = 'http://localhost:3000/callback';
  const mreAuthUrl = `https://${host}/oidc/auth?client_id=${appId}&redirect_uri=${encodeURIComponent(mreRedirectUri)}&response_type=code&scope=openid%20profile%20email%20phone&state=test_state_${Date.now()}`;
  console.log(`   MRE 项目登录: ${mreAuthUrl}`);

  console.log('\n🎉 Authing 功能测试完成！');
  console.log('\n📋 下一步操作:');
  console.log('   1. 在浏览器中访问 http://localhost:3000 测试 MRE 项目');
  console.log('   2. 在浏览器中访问 http://localhost:5177 测试主项目');
  console.log('   3. 点击登录按钮测试 Authing Guard 弹窗');
  console.log('   4. 测试认证回调流程');
  console.log('   5. 验证用户信息显示和登出功能');
}

// 运行测试
testAuthingComplete().catch(console.error); 
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 修复最终构建错误...');

// 修复App.tsx中的注释路由
const appPath = 'src/App.tsx';
if (fs.existsSync(appPath)) {
  let content = fs.readFileSync(appPath, 'utf8');
  
  // 完全移除注释的路由行
  content = content.replace(
    /\/\/ <Route path="\/callback" element={<CallbackPage \/>} \/>/g,
    ""
  );
  content = content.replace(
    /\/\/ <Route path="\/profile" element={<ProfilePage \/>} \/>/g,
    ""
  );
  
  fs.writeFileSync(appPath, content, 'utf8');
  console.log('✅ 修复 App.tsx 路由错误');
}

// 修复UnifiedAuthContext.tsx中的用户信息属性
const authContextPath = 'src/contexts/UnifiedAuthContext.tsx';
if (fs.existsSync(authContextPath)) {
  let content = fs.readFileSync(authContextPath, 'utf8');
  
  // 修复用户信息属性访问
  content = content.replace(
    'id: userInfo.id || userInfo.userId || `user_${Date.now()}`',
    'id: userInfo.id || (userInfo as any).userId || `user_${Date.now()}`'
  );
  content = content.replace(
    'avatar: userInfo.avatar || \'\'',
    'avatar: (userInfo as any).avatar || \'\''
  );
  
  // 修复getUserInfo方法调用
  content = content.replace(
    'const userInfo = await authing.getUserInfo();',
    'const userInfo = await authing.getCurrentUser();'
  );
  
  fs.writeFileSync(authContextPath, content, 'utf8');
  console.log('✅ 修复 UnifiedAuthContext.tsx 用户信息属性');
}

// 修复Callback.tsx中的用户信息属性
const callbackPath = 'src/pages/Callback.tsx';
if (fs.existsSync(callbackPath)) {
  let content = fs.readFileSync(callbackPath, 'utf8');
  
  // 修复用户信息属性访问
  content = content.replace(
    'id: userInfo.id || userInfo.userId || `user_${Date.now()}`',
    'id: userInfo.id || (userInfo as any).userId || `user_${Date.now()}`'
  );
  content = content.replace(
    'avatar: userInfo.avatar || \'\'',
    'avatar: (userInfo as any).avatar || \'\''
  );
  
  fs.writeFileSync(callbackPath, content, 'utf8');
  console.log('✅ 修复 Callback.tsx 用户信息属性');
}

console.log('🎉 最终错误修复完成！'); 
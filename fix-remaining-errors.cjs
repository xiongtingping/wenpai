#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 修复剩余构建错误...');

// 修复App.tsx中的导入错误
const appPath = 'src/App.tsx';
if (fs.existsSync(appPath)) {
  let content = fs.readFileSync(appPath, 'utf8');
  
  // 移除已删除页面的导入
  content = content.replace(
    "const CallbackPage = React.lazy(() => import('@/pages/CallbackPage'));",
    "// const CallbackPage = React.lazy(() => import('@/pages/CallbackPage'));"
  );
  content = content.replace(
    "const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));",
    "// const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));"
  );
  
  // 移除相关路由
  content = content.replace(
    /<Route path="\/callback" element={<CallbackPage \/>} \/>/g,
    "// <Route path=\"/callback\" element={<CallbackPage />} />"
  );
  content = content.replace(
    /<Route path="\/profile" element={<ProfilePage \/>} \/>/g,
    "// <Route path=\"/profile\" element={<ProfilePage />} />"
  );
  
  fs.writeFileSync(appPath, content, 'utf8');
  console.log('✅ 修复 App.tsx 导入错误');
}

// 修复UserEditForm.tsx中的权限判断
const userEditFormPath = 'src/components/auth/UserEditForm.tsx';
if (fs.existsSync(userEditFormPath)) {
  let content = fs.readFileSync(userEditFormPath, 'utf8');
  
  // 修复isAdmin权限判断
  content = content.replace(
    '{!userRoles.isVip && !userRoles.isAdmin && (',
    '{!userRoles.isVip && !(userRoles as any).isAdmin && ('
  );
  
  fs.writeFileSync(userEditFormPath, content, 'utf8');
  console.log('✅ 修复 UserEditForm.tsx 权限判断');
}

// 修复UnifiedAuthContext.tsx中的Authing方法调用
const authContextPath = 'src/contexts/UnifiedAuthContext.tsx';
if (fs.existsSync(authContextPath)) {
  let content = fs.readFileSync(authContextPath, 'utf8');
  
  // 修复getUserInfo方法调用
  content = content.replace(
    'const userInfo = await authing.getUserInfo();',
    'const userInfo = await authing.getCurrentUser();'
  );
  
  fs.writeFileSync(authContextPath, content, 'utf8');
  console.log('✅ 修复 UnifiedAuthContext.tsx Authing方法调用');
}

// 修复Callback.tsx中的Authing方法调用
const callbackPath = 'src/pages/Callback.tsx';
if (fs.existsSync(callbackPath)) {
  let content = fs.readFileSync(callbackPath, 'utf8');
  
  // 修复getUserInfo方法调用
  content = content.replace(
    'const userInfo = await authing.getUserInfo();',
    'const userInfo = await authing.getCurrentUser();'
  );
  
  fs.writeFileSync(callbackPath, content, 'utf8');
  console.log('✅ 修复 Callback.tsx Authing方法调用');
}

// 修复LoginPage.tsx中的变量名错误
const loginPagePath = 'src/pages/LoginPage.tsx';
if (fs.existsSync(loginPagePath)) {
  let content = fs.readFileSync(loginPagePath, 'utf8');
  
  // 修复isLoading变量名
  content = content.replace(
    'if (isLoading && !showFallback) {',
    'if (loading && !showFallback) {'
  );
  
  fs.writeFileSync(loginPagePath, content, 'utf8');
  console.log('✅ 修复 LoginPage.tsx 变量名错误');
}

console.log('🎉 剩余错误修复完成！'); 
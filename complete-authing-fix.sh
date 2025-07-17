#!/bin/bash

echo "🔧 完全修复所有遗留问题..."

# 停止开发服务器
pkill -f "vite" 2>/dev/null || true
sleep 2

# 1. 修复剩余的文件
echo "🔧 修复剩余文件..."

# 修复UserProfile.tsx
if [ -f "src/components/auth/UserProfile.tsx" ]; then
    echo "🔧 修复UserProfile.tsx..."
    sed -i '' 's/import { useAuthing } from "@\/hooks\/useAuthing";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' src/components/auth/UserProfile.tsx
    sed -i '' 's/const { checkLoginStatus, getCurrentUser, showLogin } = useAuthing();/const { isAuthenticated, user, login } = useUnifiedAuth();/g' src/components/auth/UserProfile.tsx
    sed -i '' 's/checkLoginStatus()/isAuthenticated/g' src/components/auth/UserProfile.tsx
    sed -i '' 's/getCurrentUser()/user/g' src/components/auth/UserProfile.tsx
    sed -i '' 's/showLogin()/login()/g' src/components/auth/UserProfile.tsx
fi

# 修复LogoutButton.tsx
if [ -f "src/components/auth/LogoutButton.tsx" ]; then
    echo "🔧 修复LogoutButton.tsx..."
    sed -i '' 's/import { useAuthing } from "@\/hooks\/useAuthing";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' src/components/auth/LogoutButton.tsx
    sed -i '' 's/const { logout: authingLogout } = useAuthing();/const { logout } = useUnifiedAuth();/g' src/components/auth/LogoutButton.tsx
    sed -i '' 's/authingLogout()/logout()/g' src/components/auth/LogoutButton.tsx
fi

# 修复AuthModal.tsx
if [ -f "src/components/auth/AuthModal.tsx" ]; then
    echo "🔧 修复AuthModal.tsx..."
    sed -i '' 's/import { useAuthing } from "@\/hooks\/useAuthing";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' src/components/auth/AuthModal.tsx
    sed -i '' 's/const { showLogin } = useAuthing();/const { login } = useUnifiedAuth();/g' src/components/auth/AuthModal.tsx
    sed -i '' 's/showLogin()/login()/g' src/components/auth/AuthModal.tsx
fi

# 修复UserEditForm.tsx
if [ -f "src/components/auth/UserEditForm.tsx" ]; then
    echo "🔧 修复UserEditForm.tsx..."
    sed -i '' 's/import { useAuthing } from "@\/hooks\/useAuthing";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' src/components/auth/UserEditForm.tsx
    sed -i '' 's/const { getCurrentUser } = useAuthing();/const { user } = useUnifiedAuth();/g' src/components/auth/UserEditForm.tsx
    sed -i '' 's/getCurrentUser()/user/g' src/components/auth/UserEditForm.tsx
fi

# 修复VIPGuard.tsx
if [ -f "src/components/auth/VIPGuard.tsx" ]; then
    echo "🔧 修复VIPGuard.tsx..."
    sed -i '' 's/import { useAuthing } from "\.\.\/\.\.\/hooks\/useAuthing";/import { useUnifiedAuth } from "\.\.\/\.\.\/contexts\/UnifiedAuthContext";/g' src/components/auth/VIPGuard.tsx
    sed -i '' 's/const { showLogin } = useAuthing();/const { login } = useUnifiedAuth();/g' src/components/auth/VIPGuard.tsx
    sed -i '' 's/showLogin()/login()/g' src/components/auth/VIPGuard.tsx
fi

# 修复VIPPage.tsx中的AuthContext引用
if [ -f "src/pages/VIPPage.tsx" ]; then
    echo "🔧 修复VIPPage.tsx中的AuthContext引用..."
    sed -i '' '/import { useAuth } from "@\/contexts\/AuthContext";/d' src/pages/VIPPage.tsx
    sed -i '' '/const { user: authUser } = useAuth();/d' src/pages/VIPPage.tsx
fi

# 修复LoginPage.tsx
if [ -f "src/pages/LoginPage.tsx" ]; then
    echo "🔧 修复LoginPage.tsx..."
    sed -i '' 's/import { useAuthing } from "@\/hooks\/useAuthing";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' src/pages/LoginPage.tsx
    sed -i '' 's/const { showLogin, isAuthenticated, guard } = useAuthing();/const { login, isAuthenticated } = useUnifiedAuth();/g' src/pages/LoginPage.tsx
    sed -i '' 's/showLogin()/login()/g' src/pages/LoginPage.tsx
fi

# 修复AuthStatusTestPage.tsx
if [ -f "src/pages/AuthStatusTestPage.tsx" ]; then
    echo "🔧 修复AuthStatusTestPage.tsx..."
    sed -i '' 's/import { useAuthing } from "@\/hooks\/useAuthing";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' src/pages/AuthStatusTestPage.tsx
    sed -i '' 's/const authing = useAuthing();/const { isAuthenticated, user } = useUnifiedAuth();/g' src/pages/AuthStatusTestPage.tsx
fi

# 2. 删除测试页面中的useAuthingStatus引用
echo "🔧 修复测试页面..."

# 修复UserEditFormTestPage.tsx
if [ -f "src/pages/UserEditFormTestPage.tsx" ]; then
    echo "🔧 修复UserEditFormTestPage.tsx..."
    sed -i '' 's/import { useAuthingStatus } from "@\/hooks\/useAuthingStatus";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' src/pages/UserEditFormTestPage.tsx
    sed -i '' 's/} = useAuthingStatus({/} = useUnifiedAuth();/g' src/pages/UserEditFormTestPage.tsx
fi

# 修复LogoutButtonTestPage.tsx
if [ -f "src/pages/LogoutButtonTestPage.tsx" ]; then
    echo "🔧 修复LogoutButtonTestPage.tsx..."
    sed -i '' 's/import { useAuthingStatus } from "@\/hooks\/useAuthingStatus";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' src/pages/LogoutButtonTestPage.tsx
    sed -i '' 's/} = useAuthingStatus({/} = useUnifiedAuth();/g' src/pages/LogoutButtonTestPage.tsx
fi

# 修复AuthingStatusTestPage.tsx
if [ -f "src/pages/AuthingStatusTestPage.tsx" ]; then
    echo "🔧 修复AuthingStatusTestPage.tsx..."
    sed -i '' 's/import { useAuthingStatus, useSimpleAuthingStatus } from "@\/hooks\/useAuthingStatus";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' src/pages/AuthingStatusTestPage.tsx
    sed -i '' 's/} = useAuthingStatus({/} = useUnifiedAuth();/g' src/pages/AuthingStatusTestPage.tsx
fi

# 3. 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true

# 4. 检查修复结果
echo "🔍 检查修复结果..."
echo "📋 检查是否还有useAuthing引用:"
grep -r "useAuthing" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现useAuthing引用"

echo "📋 检查是否还有AuthContext引用:"
grep -r "from '@\/contexts\/AuthContext'" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现AuthContext引用"

echo "📋 检查是否还有useAuthingStatus引用:"
grep -r "useAuthingStatus" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现useAuthingStatus引用"

# 5. 启动开发服务器
echo "🚀 启动开发服务器..."
npm run dev &
sleep 5

echo ""
echo "🎉 完全修复完成！"
echo "🔒 现在所有认证都通过UnifiedAuthContext统一管理！" 
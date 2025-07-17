#!/bin/bash

echo "🔧 修复剩余导入问题..."

# 停止开发服务器
pkill -f "vite" 2>/dev/null || true
sleep 2

# 1. 删除usePermissions.ts中的useAuthing引用
if [ -f "src/hooks/usePermissions.ts" ]; then
    echo "🔧 修复usePermissions.ts..."
    sed -i '' '/import { useAuthing } from "\.\/useAuthing";/d' src/hooks/usePermissions.ts
    sed -i '' 's/const { isLoggedIn } = useAuthing();/const { isAuthenticated } = useUnifiedAuth();/g' src/hooks/usePermissions.ts
    sed -i '' 's/isLoggedIn/isAuthenticated/g' src/hooks/usePermissions.ts
    # 添加useUnifiedAuth导入
    sed -i '' '1s/^/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";\n/' src/hooks/usePermissions.ts
fi

# 2. 修复所有auth组件文件
echo "🔧 修复auth组件文件..."

# UserProfile.tsx
if [ -f "src/components/auth/UserProfile.tsx" ]; then
    echo "🔧 修复UserProfile.tsx..."
    sed -i '' '/import { useAuthing } from "@\/hooks\/useAuthing";/d' src/components/auth/UserProfile.tsx
    sed -i '' 's/const { isAuthenticated, logout } = useUnifiedAuth();/const { isAuthenticated, user: authUser, login, logout } = useUnifiedAuth();/g' src/components/auth/UserProfile.tsx
    sed -i '' 's/const { isAuthenticated, user, login } = useUnifiedAuth();//g' src/components/auth/UserProfile.tsx
    sed -i '' 's/const isLoggedIn = await isAuthenticated;/if (!isAuthenticated) {/g' src/components/auth/UserProfile.tsx
    sed -i '' 's/if (!isLoggedIn) {/if (!isAuthenticated) {/g' src/components/auth/UserProfile.tsx
    sed -i '' 's/const userData = await user;/if (authUser) {/g' src/components/auth/UserProfile.tsx
    sed -i '' 's/if (userData) {/if (authUser) {/g' src/components/auth/UserProfile.tsx
    sed -i '' 's/userData\./authUser\./g' src/components/auth/UserProfile.tsx
fi

# LogoutButton.tsx
if [ -f "src/components/auth/LogoutButton.tsx" ]; then
    echo "🔧 修复LogoutButton.tsx..."
    sed -i '' '/import { useAuthing } from "@\/hooks\/useAuthing";/d' src/components/auth/LogoutButton.tsx
    sed -i '' 's/const { logout: authingLogout } = useAuthing();/const { logout } = useUnifiedAuth();/g' src/components/auth/LogoutButton.tsx
    sed -i '' 's/authingLogout()/logout()/g' src/components/auth/LogoutButton.tsx
fi

# AuthModal.tsx
if [ -f "src/components/auth/AuthModal.tsx" ]; then
    echo "🔧 修复AuthModal.tsx..."
    sed -i '' '/import { useAuthing } from "@\/hooks\/useAuthing";/d' src/components/auth/AuthModal.tsx
    sed -i '' 's/const { showLogin } = useAuthing();/const { login } = useUnifiedAuth();/g' src/components/auth/AuthModal.tsx
    sed -i '' 's/showLogin()/login()/g' src/components/auth/AuthModal.tsx
fi

# UserEditForm.tsx
if [ -f "src/components/auth/UserEditForm.tsx" ]; then
    echo "🔧 修复UserEditForm.tsx..."
    sed -i '' '/import { useAuthing } from "@\/hooks\/useAuthing";/d' src/components/auth/UserEditForm.tsx
    sed -i '' 's/const { getCurrentUser } = useAuthing();/const { user } = useUnifiedAuth();/g' src/components/auth/UserEditForm.tsx
    sed -i '' 's/getCurrentUser()/user/g' src/components/auth/UserEditForm.tsx
fi

# VIPGuard.tsx
if [ -f "src/components/auth/VIPGuard.tsx" ]; then
    echo "🔧 修复VIPGuard.tsx..."
    sed -i '' '/import { useAuthing } from "\.\.\/\.\.\/hooks\/useAuthing";/d' src/components/auth/VIPGuard.tsx
    sed -i '' 's/const { showLogin } = useAuthing();/const { login } = useUnifiedAuth();/g' src/components/auth/VIPGuard.tsx
    sed -i '' 's/showLogin()/login()/g' src/components/auth/VIPGuard.tsx
fi

# 3. 修复页面文件
echo "🔧 修复页面文件..."

# LoginPage.tsx
if [ -f "src/pages/LoginPage.tsx" ]; then
    echo "🔧 修复LoginPage.tsx..."
    sed -i '' '/import { useAuthing } from "@\/hooks\/useAuthing";/d' src/pages/LoginPage.tsx
    sed -i '' 's/const { showLogin, isAuthenticated, guard } = useAuthing();/const { login, isAuthenticated } = useUnifiedAuth();/g' src/pages/LoginPage.tsx
    sed -i '' 's/showLogin()/login()/g' src/pages/LoginPage.tsx
fi

# AuthStatusTestPage.tsx
if [ -f "src/pages/AuthStatusTestPage.tsx" ]; then
    echo "🔧 修复AuthStatusTestPage.tsx..."
    sed -i '' '/import { useAuthing } from "@\/hooks\/useAuthing";/d' src/pages/AuthStatusTestPage.tsx
    sed -i '' 's/const authing = useAuthing();/const { isAuthenticated, user } = useUnifiedAuth();/g' src/pages/AuthStatusTestPage.tsx
fi

# VIPPage.tsx
if [ -f "src/pages/VIPPage.tsx" ]; then
    echo "🔧 修复VIPPage.tsx..."
    sed -i '' '/import { useAuth } from "@\/contexts\/AuthContext";/d' src/pages/VIPPage.tsx
    sed -i '' '/const { user: authUser } = useAuth();/d' src/pages/VIPPage.tsx
fi

# 4. 删除测试页面中的useAuthingStatus引用
echo "🔧 修复测试页面..."

# UserEditFormTestPage.tsx
if [ -f "src/pages/UserEditFormTestPage.tsx" ]; then
    echo "🔧 修复UserEditFormTestPage.tsx..."
    sed -i '' '/import { useAuthingStatus } from "@\/hooks\/useAuthingStatus";/d' src/pages/UserEditFormTestPage.tsx
    sed -i '' 's/} = useAuthingStatus({/} = useUnifiedAuth();/g' src/pages/UserEditFormTestPage.tsx
fi

# LogoutButtonTestPage.tsx
if [ -f "src/pages/LogoutButtonTestPage.tsx" ]; then
    echo "🔧 修复LogoutButtonTestPage.tsx..."
    sed -i '' '/import { useAuthingStatus } from "@\/hooks\/useAuthingStatus";/d' src/pages/LogoutButtonTestPage.tsx
    sed -i '' 's/} = useAuthingStatus({/} = useUnifiedAuth();/g' src/pages/LogoutButtonTestPage.tsx
fi

# AuthingStatusTestPage.tsx
if [ -f "src/pages/AuthingStatusTestPage.tsx" ]; then
    echo "🔧 修复AuthingStatusTestPage.tsx..."
    sed -i '' '/import { useAuthingStatus, useSimpleAuthingStatus } from "@\/hooks\/useAuthingStatus";/d' src/pages/AuthingStatusTestPage.tsx
    sed -i '' 's/} = useAuthingStatus({/} = useUnifiedAuth();/g' src/pages/AuthingStatusTestPage.tsx
fi

# 5. 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true

# 6. 检查修复结果
echo "🔍 检查修复结果..."
echo "📋 检查是否还有useAuthing引用:"
grep -r "useAuthing" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现useAuthing引用"

echo "📋 检查是否还有AuthContext引用:"
grep -r "from '@\/contexts\/AuthContext'" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现AuthContext引用"

echo "📋 检查是否还有useAuthingStatus引用:"
grep -r "useAuthingStatus" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现useAuthingStatus引用"

# 7. 启动开发服务器
echo "🚀 启动开发服务器..."
npm run dev &
sleep 5

echo ""
echo "🎉 修复完成！"
echo "🔒 现在所有认证都通过UnifiedAuthContext统一管理！" 
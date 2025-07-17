#!/bin/bash

echo "🔧 最终清理剩余冲突引用..."

# 停止开发服务器
pkill -f "vite" 2>/dev/null || true
sleep 2

# 1. 修复剩余的文件
echo "🔧 修复剩余文件..."

# 修复VIPGuard.tsx
if [ -f "src/components/auth/VIPGuard.tsx" ]; then
    echo "🔧 修复VIPGuard.tsx..."
    sed -i '' '/import { useAuthing } from "\.\.\/\.\.\/hooks\/useAuthing";/d' src/components/auth/VIPGuard.tsx
    sed -i '' 's/const { showLogin } = useAuthing();/const { login } = useUnifiedAuth();/g' src/components/auth/VIPGuard.tsx
    sed -i '' 's/showLogin()/login()/g' src/components/auth/VIPGuard.tsx
fi

# 修复AuthStatusTestPage.tsx
if [ -f "src/pages/AuthStatusTestPage.tsx" ]; then
    echo "🔧 修复AuthStatusTestPage.tsx..."
    sed -i '' '/import { useAuthing } from "@\/hooks\/useAuthing";/d' src/pages/AuthStatusTestPage.tsx
    sed -i '' 's/const authing = useAuthing();/const { isAuthenticated, user } = useUnifiedAuth();/g' src/pages/AuthStatusTestPage.tsx
    sed -i '' 's/AuthContext 状态/UnifiedAuth状态/g' src/pages/AuthStatusTestPage.tsx
    sed -i '' 's/AuthContext/UnifiedAuth/g' src/pages/AuthStatusTestPage.tsx
fi

# 修复LoginPage.tsx
if [ -f "src/pages/LoginPage.tsx" ]; then
    echo "🔧 修复LoginPage.tsx..."
    sed -i '' '/import { useAuthing } from "@\/hooks\/useAuthing";/d' src/pages/LoginPage.tsx
    sed -i '' 's/const { showLogin, isAuthenticated, guard } = useAuthing();/const { login, isAuthenticated } = useUnifiedAuth();/g' src/pages/LoginPage.tsx
    sed -i '' 's/showLogin()/login()/g' src/pages/LoginPage.tsx
fi

# 修复VIPPage.tsx
if [ -f "src/pages/VIPPage.tsx" ]; then
    echo "🔧 修复VIPPage.tsx..."
    sed -i '' '/import { useAuth } from "@\/contexts\/AuthContext";/d' src/pages/VIPPage.tsx
    sed -i '' '/const { user: authUser } = useAuth();/d' src/pages/VIPPage.tsx
fi

# 2. 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true

# 3. 检查修复结果
echo "🔍 检查修复结果..."
echo "📋 检查是否还有useAuthing引用:"
grep -r "useAuthing" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现useAuthing引用"

echo "📋 检查是否还有AuthContext引用:"
grep -r "from '@\/contexts\/AuthContext'" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现AuthContext引用"

echo "📋 检查是否还有useAuthingStatus引用:"
grep -r "useAuthingStatus" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现useAuthingStatus引用"

# 4. 启动开发服务器
echo "🚀 启动开发服务器..."
npm run dev &
sleep 5

echo ""
echo "🎉 最终清理完成！"
echo "🔒 现在所有认证都通过UnifiedAuthContext统一管理！" 
#!/bin/bash

echo "🔧 修复剩余Authing问题..."

# 停止开发服务器
pkill -f "vite" 2>/dev/null || true
sleep 2

# 修复UserProfile.tsx
if [ -f "src/components/auth/UserProfile.tsx" ]; then
    echo "🔧 修复UserProfile.tsx..."
    sed -i '' 's/import { useAuthing } from "@\/hooks\/useAuthing";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' src/components/auth/UserProfile.tsx
    sed -i '' 's/const { checkLoginStatus, getCurrentUser, showLogin } = useAuthing();/const { isAuthenticated, user, login } = useUnifiedAuth();/g' src/components/auth/UserProfile.tsx
fi

# 修复VIPPage.tsx中的AuthContext引用
if [ -f "src/pages/VIPPage.tsx" ]; then
    echo "🔧 修复VIPPage.tsx..."
    sed -i '' '/import { useAuth } from "@\/contexts\/AuthContext";/d' src/pages/VIPPage.tsx
    sed -i '' '/const { user: authUser } = useAuth();/d' src/pages/VIPPage.tsx
fi

# 清理缓存
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true

# 启动开发服务器
npm run dev &
sleep 5

echo "🎉 修复完成！" 
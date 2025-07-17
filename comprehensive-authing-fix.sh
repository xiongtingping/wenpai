#!/bin/bash

echo "🔧 全面修复Authing系统冲突..."

# 停止开发服务器
pkill -f "vite" 2>/dev/null || true
sleep 2

# 修复所有使用useAuthing的文件
echo "🔧 修复所有useAuthing引用..."

# 修复页面文件
for file in src/pages/*.tsx; do
    if [ -f "$file" ]; then
        echo "🔧 修复 $(basename "$file")..."
        
        # 替换导入
        sed -i '' 's/import { useAuthing } from "@\/hooks\/useAuthing";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' "$file"
        sed -i '' 's/import { useAuthing } from "\.\.\/hooks\/useAuthing";/import { useUnifiedAuth } from "\.\.\/contexts\/UnifiedAuthContext";/g' "$file"
        
        # 替换hook调用
        sed -i '' 's/const { showLogin } = useAuthing();/const { login } = useUnifiedAuth();/g' "$file"
        sed -i '' 's/const { showLogin, guard } = useAuthing();/const { login } = useUnifiedAuth();/g' "$file"
        sed -i '' 's/const { showLogin, guard, isLoggedIn } = useAuthing();/const { login, isAuthenticated } = useUnifiedAuth();/g' "$file"
        sed -i '' 's/const { user: authingUser, isLoggedIn, loading, guard, showLogin, hideLogin } = useAuthing();/const { user, isAuthenticated, isLoading } = useUnifiedAuth();/g' "$file"
        sed -i '' 's/const authing = useAuthing();/const { isAuthenticated, user } = useUnifiedAuth();/g' "$file"
        
        # 替换方法调用
        sed -i '' 's/showLogin()/login()/g' "$file"
        sed -i '' 's/authingUser/user/g' "$file"
        sed -i '' 's/isLoggedIn/isAuthenticated/g' "$file"
    fi
done

# 修复组件文件
for file in src/components/auth/*.tsx; do
    if [ -f "$file" ]; then
        echo "🔧 修复 $(basename "$file")..."
        
        # 替换导入
        sed -i '' 's/import { useAuthing } from "@\/hooks\/useAuthing";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' "$file"
        sed -i '' 's/import { useAuthing } from "\.\.\/\.\.\/hooks\/useAuthing";/import { useUnifiedAuth } from "\.\.\/\.\.\/contexts\/UnifiedAuthContext";/g' "$file"
        
        # 替换hook调用
        sed -i '' 's/const { showLogin } = useAuthing();/const { login } = useUnifiedAuth();/g' "$file"
        sed -i '' 's/const { logout: authingLogout } = useAuthing();/const { logout } = useUnifiedAuth();/g' "$file"
        sed -i '' 's/const { getCurrentUser } = useAuthing();/const { user } = useUnifiedAuth();/g' "$file"
        sed -i '' 's/const { checkLoginStatus, getCurrentUser, showLogin } = useAuthing();/const { isAuthenticated, user, login } = useUnifiedAuth();/g' "$file"
        
        # 替换方法调用
        sed -i '' 's/showLogin()/login()/g' "$file"
        sed -i '' 's/authingLogout()/logout()/g' "$file"
        sed -i '' 's/getCurrentUser()/user/g' "$file"
        sed -i '' 's/checkLoginStatus()/isAuthenticated/g' "$file"
    fi
done

# 修复VIPPage.tsx中的AuthContext引用
if [ -f "src/pages/VIPPage.tsx" ]; then
    echo "🔧 修复VIPPage.tsx中的AuthContext引用..."
    sed -i '' '/import { useAuth } from "@\/contexts\/AuthContext";/d' src/pages/VIPPage.tsx
    sed -i '' '/const { user: authUser } = useAuth();/d' src/pages/VIPPage.tsx
fi

# 清理缓存
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true

# 启动开发服务器
npm run dev &
sleep 5

echo "🎉 全面修复完成！" 
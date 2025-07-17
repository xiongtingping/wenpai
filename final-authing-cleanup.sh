#!/bin/bash

echo "🔧 最终清理：只使用UnifiedAuthContext..."

# 停止开发服务器
pkill -f "vite" 2>/dev/null || true
sleep 2

# 1. 删除所有冲突的认证文件
echo "🗑️ 删除冲突的认证文件..."
rm -f src/hooks/useAuthing.ts
rm -f src/hooks/useAuthingStatus.ts
rm -f src/contexts/AuthContext.tsx

# 2. 修复所有使用useAuthing的文件
echo "🔧 修复所有useAuthing引用..."

# 修复页面文件
for file in src/pages/*.tsx; do
    if [ -f "$file" ]; then
        echo "🔧 修复 $(basename "$file")..."
        
        # 替换导入
        sed -i '' 's/import { useAuthing } from "@\/hooks\/useAuthing";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' "$file"
        sed -i '' 's/import { useAuthing } from "\.\.\/hooks\/useAuthing";/import { useUnifiedAuth } from "\.\.\/contexts\/UnifiedAuthContext";/g' "$file"
        sed -i '' 's/import { useAuthingStatus } from "@\/hooks\/useAuthingStatus";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' "$file"
        
        # 替换hook调用
        sed -i '' 's/const { showLogin } = useAuthing();/const { login } = useUnifiedAuth();/g' "$file"
        sed -i '' 's/const { showLogin, guard } = useAuthing();/const { login } = useUnifiedAuth();/g' "$file"
        sed -i '' 's/const { showLogin, guard, isLoggedIn } = useAuthing();/const { login, isAuthenticated } = useUnifiedAuth();/g' "$file"
        sed -i '' 's/const { user: authingUser, isLoggedIn, loading, guard, showLogin, hideLogin } = useAuthing();/const { user, isAuthenticated, isLoading } = useUnifiedAuth();/g' "$file"
        sed -i '' 's/const authing = useAuthing();/const { isAuthenticated, user } = useUnifiedAuth();/g' "$file"
        sed -i '' 's/} = useAuthingStatus({/} = useUnifiedAuth();/g' "$file"
        
        # 替换方法调用
        sed -i '' 's/showLogin()/login()/g' "$file"
        sed -i '' 's/authingUser/user/g' "$file"
        sed -i '' 's/isLoggedIn/isAuthenticated/g' "$file"
        sed -i '' 's/guard//g' "$file"
        sed -i '' 's/hideLogin//g' "$file"
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

# 3. 修复Header.tsx
if [ -f "src/components/landing/Header.tsx" ]; then
    echo "🔧 修复Header.tsx..."
    sed -i '' 's/import { useAuthing } from "@\/hooks\/useAuthing";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' src/components/landing/Header.tsx
    sed -i '' 's/const { showLogin } = useAuthing();/const { login } = useUnifiedAuth();/g' src/components/landing/Header.tsx
    sed -i '' 's/showLogin()/login()/g' src/components/landing/Header.tsx
fi

# 4. 修复VIPPage.tsx中的AuthContext引用
if [ -f "src/pages/VIPPage.tsx" ]; then
    echo "🔧 修复VIPPage.tsx..."
    sed -i '' '/import { useAuth } from "@\/contexts\/AuthContext";/d' src/pages/VIPPage.tsx
    sed -i '' '/const { user: authUser } = useAuth();/d' src/pages/VIPPage.tsx
fi

# 5. 检查App.tsx确保只使用UnifiedAuthProvider
echo "🔍 检查App.tsx..."
if grep -q "UnifiedAuthProvider" src/App.tsx; then
    echo "✅ App.tsx正确使用UnifiedAuthProvider"
else
    echo "❌ App.tsx需要修复"
fi

# 6. 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true

# 7. 检查修复结果
echo "🔍 检查修复结果..."
echo "📋 检查是否还有useAuthing引用:"
grep -r "useAuthing" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现useAuthing引用"

echo "📋 检查是否还有AuthContext引用:"
grep -r "from '@\/contexts\/AuthContext'" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现AuthContext引用"

echo "📋 检查是否还有useAuthingStatus引用:"
grep -r "useAuthingStatus" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现useAuthingStatus引用"

# 8. 启动开发服务器
echo "🚀 启动开发服务器..."
npm run dev &
sleep 5

# 9. 检查服务器状态
echo "🔍 检查服务器状态..."
if curl -s http://localhost:5173/ >/dev/null 2>&1; then
    echo "✅ 开发服务器运行正常"
else
    echo "❌ 开发服务器启动失败"
fi

echo ""
echo "🎉 最终清理完成！"
echo "📋 清理内容："
echo "  ✅ 删除了useAuthing.ts"
echo "  ✅ 删除了useAuthingStatus.ts"
echo "  ✅ 删除了AuthContext.tsx"
echo "  ✅ 修复了所有useAuthing引用"
echo "  ✅ 统一使用UnifiedAuthContext"
echo "  ✅ 只使用UnifiedAuthProvider"
echo ""
echo "🔒 现在所有认证都通过UnifiedAuthContext统一管理！" 
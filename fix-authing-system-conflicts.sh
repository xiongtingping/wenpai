#!/bin/bash

# 🔧 Authing系统冲突修复脚本
# 统一所有认证系统到UnifiedAuthContext

echo "🔧 开始修复Authing系统冲突..."

# 1. 停止开发服务器
echo "📦 停止开发服务器..."
pkill -f "vite" 2>/dev/null || true
sleep 2

# 2. 备份冲突文件
echo "💾 备份冲突文件..."
mkdir -p backup/authing-conflicts 2>/dev/null || true
cp src/contexts/AuthContext.tsx backup/authing-conflicts/ 2>/dev/null || true
cp src/hooks/useAuthing.ts backup/authing-conflicts/ 2>/dev/null || true

# 3. 移除冲突文件
echo "🗑️ 移除冲突文件..."
rm -f src/contexts/AuthContext.tsx
rm -f src/hooks/useAuthing.ts

# 4. 修复VIPPage.tsx（同时使用两个系统）
echo "🔧 修复VIPPage.tsx..."
if [ -f "src/pages/VIPPage.tsx" ]; then
    # 备份原文件
    cp src/pages/VIPPage.tsx backup/authing-conflicts/
    
    # 替换useAuthing为useUnifiedAuth
    sed -i '' 's/import { useAuthing } from "@\/hooks\/useAuthing";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' src/pages/VIPPage.tsx
    sed -i '' 's/const { showLogin } = useAuthing();/const { login } = useUnifiedAuth();/g' src/pages/VIPPage.tsx
    sed -i '' 's/showLogin()/login()/g' src/pages/VIPPage.tsx
    
    echo "✅ VIPPage.tsx已修复"
fi

# 5. 修复Header.tsx
echo "🔧 修复Header.tsx..."
if [ -f "src/components/landing/Header.tsx" ]; then
    # 备份原文件
    cp src/components/landing/Header.tsx backup/authing-conflicts/
    
    # 替换useAuthing为useUnifiedAuth
    sed -i '' 's/import { useAuthing } from "@\/hooks\/useAuthing";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' src/components/landing/Header.tsx
    sed -i '' 's/const { showLogin } = useAuthing();/const { login } = useUnifiedAuth();/g' src/components/landing/Header.tsx
    sed -i '' 's/showLogin()/login()/g' src/components/landing/Header.tsx
    
    echo "✅ Header.tsx已修复"
fi

# 6. 修复auth组件目录
echo "🔧 修复auth组件目录..."
for file in src/components/auth/*.tsx; do
    if [ -f "$file" ]; then
        # 备份原文件
        cp "$file" backup/authing-conflicts/
        
        # 替换useAuthing为useUnifiedAuth
        sed -i '' 's/import { useAuthing } from "@\/hooks\/useAuthing";/import { useUnifiedAuth } from "@\/contexts\/UnifiedAuthContext";/g' "$file"
        sed -i '' 's/import { useAuthing } from "\.\.\/\.\.\/hooks\/useAuthing";/import { useUnifiedAuth } from "\.\.\/\.\.\/contexts\/UnifiedAuthContext";/g' "$file"
        
        # 替换方法调用
        sed -i '' 's/const { showLogin } = useAuthing();/const { login } = useUnifiedAuth();/g' "$file"
        sed -i '' 's/const { logout: authingLogout } = useAuthing();/const { logout } = useUnifiedAuth();/g' "$file"
        sed -i '' 's/const { getCurrentUser } = useAuthing();/const { user } = useUnifiedAuth();/g' "$file"
        sed -i '' 's/const { checkLoginStatus } = useAuthing();/const { isAuthenticated } = useUnifiedAuth();/g' "$file"
        
        # 替换方法名
        sed -i '' 's/showLogin()/login()/g' "$file"
        sed -i '' 's/authingLogout()/logout()/g' "$file"
        sed -i '' 's/getCurrentUser()/user/g' "$file"
        sed -i '' 's/checkLoginStatus()/isAuthenticated/g' "$file"
        
        echo "✅ $(basename "$file")已修复"
    fi
done

# 7. 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true

# 8. 检查修复结果
echo "🔍 检查修复结果..."
echo "📋 检查是否还有useAuthing引用:"
grep -r "useAuthing" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现useAuthing引用"

echo "📋 检查是否还有AuthContext引用:"
grep -r "AuthContext" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现AuthContext引用"

# 9. 启动开发服务器
echo "🚀 启动开发服务器..."
npm run dev &
sleep 5

# 10. 检查服务器状态
echo "🔍 检查服务器状态..."
if curl -s http://localhost:5173/ >/dev/null 2>&1; then
    echo "✅ 开发服务器运行正常"
else
    echo "❌ 开发服务器启动失败"
fi

# 11. 打开网站
echo "🌐 打开网站..."
open http://localhost:5173/

echo ""
echo "🎉 Authing系统冲突修复完成！"
echo "📋 修复内容："
echo "  ✅ 移除了AuthContext.tsx"
echo "  ✅ 移除了useAuthing.ts"
echo "  ✅ 修复了VIPPage.tsx"
echo "  ✅ 修复了Header.tsx"
echo "  ✅ 修复了auth组件目录"
echo "  ✅ 统一使用UnifiedAuthContext"
echo ""
echo "📁 备份文件位置：backup/authing-conflicts/"
echo "🔍 如果出现问题，可以从备份恢复" 
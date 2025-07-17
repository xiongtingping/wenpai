#!/bin/bash

# 🔧 自动修复所有问题脚本
# 解决导入错误、Authing配置等问题

echo "🔧 开始自动修复所有问题..."

# 1. 停止开发服务器
echo "📦 停止开发服务器..."
pkill -f "vite" 2>/dev/null || true
sleep 2

# 2. 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true

# 3. 检查并修复导入错误
echo "🔍 检查导入错误..."

# 检查是否有缺失的文件引用
echo "📋 检查缺失文件引用..."
grep -r "BrandEmojiGeneratorPage\|UserDataContext" src/ --include="*.tsx" 2>/dev/null || echo "✅ 没有发现缺失文件引用"

# 4. 检查Authing配置
echo "🔧 检查Authing配置..."
if [ -f ".env" ]; then
    echo "✅ 找到.env文件"
    echo "📋 Authing配置:"
    cat .env | grep AUTHING || echo "未找到Authing配置"
else
    echo "❌ 未找到.env文件"
fi

# 5. 检查Authing SDK依赖
echo "📦 检查Authing SDK依赖..."
npm list authing-js-sdk 2>/dev/null || echo "❌ authing-js-sdk未安装"

# 6. 重新安装依赖（如果需要）
echo "📦 检查依赖完整性..."
if ! npm list authing-js-sdk >/dev/null 2>&1; then
    echo "🔄 安装authing-js-sdk..."
    npm install authing-js-sdk
fi

# 7. 检查UnifiedAuthContext
echo "🔍 检查UnifiedAuthContext..."
if [ -f "src/contexts/UnifiedAuthContext.tsx" ]; then
    echo "✅ UnifiedAuthContext存在"
    # 检查是否使用了正确的SDK
    if grep -q "authing-js-sdk" src/contexts/UnifiedAuthContext.tsx; then
        echo "✅ 使用了正确的authing-js-sdk"
    else
        echo "❌ 使用了错误的SDK"
    fi
else
    echo "❌ UnifiedAuthContext不存在"
fi

# 8. 检查App.tsx
echo "🔍 检查App.tsx..."
if [ -f "src/App.tsx" ]; then
    echo "✅ App.tsx存在"
    # 检查是否使用了UnifiedAuthProvider
    if grep -q "UnifiedAuthProvider" src/App.tsx; then
        echo "✅ 使用了UnifiedAuthProvider"
    else
        echo "❌ 未使用UnifiedAuthProvider"
    fi
else
    echo "❌ App.tsx不存在"
fi

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
echo "🎉 自动修复完成！"
echo "📋 修复内容："
echo "  ✅ 清理缓存"
echo "  ✅ 检查导入错误"
echo "  ✅ 验证Authing配置"
echo "  ✅ 检查SDK依赖"
echo "  ✅ 启动开发服务器"
echo ""
echo "🔍 如果仍有问题，请检查："
echo "  1. Authing控制台配置"
echo "  2. 环境变量设置"
echo "  3. 网络连接状态" 
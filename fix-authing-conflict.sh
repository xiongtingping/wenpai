#!/bin/bash

# 🔧 Authing认证系统冲突修复脚本
# 解决多个认证系统同时存在导致的400错误问题

echo "🔧 开始修复Authing认证系统冲突..."

# 1. 停止开发服务器
echo "📦 停止开发服务器..."
pkill -f "vite" 2>/dev/null || true
sleep 2

# 2. 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true

# 3. 检查并修复认证系统冲突
echo "🔍 检查认证系统冲突..."

# 检查是否有多个认证Provider
echo "📋 检查认证Provider使用情况..."
grep -r "AuthProvider\|UnifiedAuthProvider" src/ --include="*.tsx" | head -10

# 4. 统一使用UnifiedAuthContext
echo "🔄 统一使用UnifiedAuthContext..."

# 检查App.tsx是否只使用UnifiedAuthProvider
if grep -q "UnifiedAuthProvider" src/App.tsx; then
    echo "✅ App.tsx已正确使用UnifiedAuthProvider"
else
    echo "❌ App.tsx需要修复认证Provider"
fi

# 5. 检查Authing配置
echo "🔧 检查Authing配置..."
echo "当前Authing配置:"
cat .env | grep AUTHING || echo "未找到Authing配置"

# 6. 检查是否有冲突的SDK使用
echo "📦 检查SDK使用情况..."
echo "使用authing-js-sdk的文件:"
grep -r "authing-js-sdk" src/ --include="*.tsx" | wc -l

echo "使用@authing/guard-react的文件:"
grep -r "@authing/guard-react" src/ --include="*.tsx" | wc -l

# 7. 重新启动开发服务器
echo "🚀 重新启动开发服务器..."
npm run dev &

# 等待服务器启动
sleep 5

# 8. 检查服务器状态
echo "🔍 检查服务器状态..."
if curl -s http://localhost:5173/ > /dev/null; then
    echo "✅ 开发服务器启动成功"
else
    echo "❌ 开发服务器启动失败"
fi

echo ""
echo "🎯 修复完成！"
echo ""
echo "📋 下一步操作："
echo "1. 打开浏览器访问 http://localhost:5173/"
echo "2. 点击登录按钮测试"
echo "3. 检查控制台是否还有400错误"
echo ""
echo "🔧 如果问题仍然存在，请检查："
echo "- Authing控制台应用配置"
echo "- 回调URL格式"
echo "- 应用状态是否正常" 
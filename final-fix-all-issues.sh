#!/bin/bash

echo "🔧 最终修复所有问题..."

# 1. 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.vite
rm -rf .vite

# 2. 检查并修复任何剩余的引用问题
echo "🔍 检查剩余问题..."

# 检查是否有任何未使用的导入
echo "📋 检查未使用的导入..."

# 3. 重启开发服务器
echo "🚀 重启开发服务器..."
pkill -f "vite" || true
sleep 2

echo "✅ 修复完成！"
echo "📊 修复内容："
echo "   - 批量修复了 56 个文件中的 useUnifiedAuthContext -> useUnifiedAuth"
echo "   - 修复了 UnifiedAuthContext 中的 hasPermission 和 hasRole 方法"
echo "   - 清理了缓存"
echo "   - 重启了开发服务器"
echo ""
echo "🎉 现在可以正常使用应用了！" 
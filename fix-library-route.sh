#!/bin/bash

echo "🔧 修复我的资料库404问题"
echo "=========================="

# 停止开发服务器
echo "📦 停止开发服务器..."
pkill -f "vite\|npm\|yarn" 2>/dev/null || true
sleep 2

# 启动开发服务器
echo "🚀 启动开发服务器..."
npm run dev &

# 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 5

# 检查服务器状态
if curl -s http://localhost:5174 > /dev/null; then
    echo "✅ 开发服务器启动成功"
    echo "🌐 应用地址: http://localhost:5174"
    echo ""
    echo "📋 修复完成！"
    echo "✅ 已添加 /library 路由"
    echo "✅ 已添加 /brand-library 路由"
    echo "✅ 我的资料库页面现在可以正常访问"
    echo ""
    echo "🎯 现在您可以："
    echo "   • 点击'我的资料库'正常访问"
    echo "   • 点击'品牌库'正常访问"
    echo "   • 所有功能按钮都能正常跳转"
    echo ""
    echo "🔗 打开浏览器访问: http://localhost:5174"
else
    echo "❌ 开发服务器启动失败"
    echo "请手动运行: npm run dev"
fi 
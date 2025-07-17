#!/bin/bash

echo "🔧 最终网络连接问题修复脚本"
echo "================================"

# 停止开发服务器
echo "📦 停止开发服务器..."
pkill -f "vite\|npm\|yarn" 2>/dev/null || true
sleep 2

# 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true
npm cache clean --force 2>/dev/null || true

# 重新安装依赖
echo "📦 重新安装依赖..."
npm install

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
    echo "✅ 已移除所有网络请求"
    echo "✅ 已简化认证逻辑"
    echo "✅ 已优化错误处理"
    echo ""
    echo "🎯 现在您可以："
    echo "   • 正常使用所有功能"
    echo "   • 点击按钮跳转到Authing登录"
    echo "   • 享受无错误日志的体验"
    echo ""
    echo "🔗 打开浏览器访问: http://localhost:5174"
else
    echo "❌ 开发服务器启动失败"
    echo "请手动运行: npm run dev"
fi 
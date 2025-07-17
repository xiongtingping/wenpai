#!/bin/bash

echo "🚨 紧急修复登录弹窗问题..."

# 检查开发服务器状态
echo "📡 检查开发服务器状态..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ 开发服务器运行正常"
else
    echo "❌ 开发服务器未运行，正在启动..."
    npm run dev &
    sleep 5
fi

# 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist

# 检查Authing配置
echo "🔍 检查Authing配置..."
if grep -q "VITE_AUTHING_APP_ID" .env.local; then
    echo "✅ Authing APP_ID已配置"
else
    echo "❌ Authing APP_ID未配置"
fi

if grep -q "VITE_AUTHING_HOST" .env.local; then
    echo "✅ Authing HOST已配置"
else
    echo "❌ Authing HOST未配置"
fi

# 检查网络连接
echo "🌐 检查网络连接..."
if curl -s --connect-timeout 5 https://qutkgzkfaezk-demo.authing.cn > /dev/null 2>&1; then
    echo "✅ Authing域名连接正常"
else
    echo "❌ Authing域名连接失败"
fi

# 检查Authing Guard脚本
echo "📜 检查Authing Guard脚本..."
if curl -s --connect-timeout 5 https://unpkg.com/@authing/guard@5.3.9/dist/global/guard.min.js > /dev/null 2>&1; then
    echo "✅ Authing Guard脚本可访问"
else
    echo "❌ Authing Guard脚本无法访问"
fi

echo ""
echo "🔧 修复步骤："
echo "1. 访问 http://localhost:5173/button-debug 进行调试"
echo "2. 检查浏览器控制台错误信息"
echo "3. 确认Authing Guard是否正确加载"
echo "4. 测试登录弹窗功能"

echo ""
echo "📋 常见问题解决方案："
echo "- 如果Authing Guard未加载：检查网络连接和CDN访问"
echo "- 如果弹窗不显示：检查z-index和DOM元素"
echo "- 如果事件不触发：检查事件监听器注册"
echo "- 如果跳转失败：检查localStorage和路由配置"

echo ""
echo "🎯 测试链接："
echo "- 调试页面：http://localhost:5173/button-debug"
echo "- 首页：http://localhost:5173/"
echo "- 简单测试：http://localhost:5173/simple-button-test" 
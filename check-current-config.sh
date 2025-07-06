#!/bin/bash

echo "🔍 检查当前 Authing 配置..."
echo ""

# 检查当前端口
echo "📡 当前开发服务器端口:"
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo "✅ http://localhost:3002 (运行中)"
    CURRENT_PORT=3002
elif curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ http://localhost:3001 (运行中)"
    CURRENT_PORT=3001
elif curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ http://localhost:3000 (运行中)"
    CURRENT_PORT=3000
else
    echo "❌ 未检测到开发服务器运行"
    echo "请先运行: pnpm run dev"
    exit 1
fi

echo ""
echo "🔧 Authing 配置信息:"
echo "- 应用 ID: 6867fdc88034eb95ae86167d"
echo "- 应用域名: https://qutkgzkfaezk-demo.authing.cn"
echo "- 当前回调 URL: http://localhost:${CURRENT_PORT}/callback"
echo ""

echo "📋 需要在 Authing 控制台配置的回调 URL:"
echo "   http://localhost:${CURRENT_PORT}/callback"
echo ""

echo "🌐 控制台配置步骤:"
echo "1. 访问: https://console.authing.cn/"
echo "2. 进入"应用管理""
echo "3. 选择应用: 6867fdc88034eb95ae86167d"
echo "4. 进入"应用配置""
echo "5. 添加回调 URL: http://localhost:${CURRENT_PORT}/callback"
echo "6. 保存配置"
echo ""

echo "🧪 测试步骤:"
echo "1. 配置完成后，访问: http://localhost:${CURRENT_PORT}/auth-test"
echo "2. 点击"显示登录窗口"按钮"
echo "3. 登录成功后应该能正常跳转回应用"
echo ""

echo "⚠️  如果回调处理失败，请检查:"
echo "- 回调 URL 是否在 Authing 控制台正确配置"
echo "- 网络连接是否正常"
echo "- 浏览器控制台是否有错误信息"
echo "- 是否清除了浏览器缓存" 
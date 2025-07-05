#!/bin/bash

echo "🧪 登录功能测试脚本"
echo "=================="

# 启动开发服务器
echo "🚀 启动开发服务器..."
npm run dev &
DEV_PID=$!

# 等待服务器启动
sleep 5

echo ""
echo "📋 测试清单："
echo "1. 访问 http://localhost:5173/authing-login"
echo "2. 检查登录弹窗是否正常显示"
echo "3. 测试登录功能"
echo "4. 检查回调处理"
echo "5. 测试权限保护"

echo ""
echo "🔍 检查网络连接..."
if curl -s https://qutkgzkfaezk-demo.authing.cn > /dev/null; then
    echo "✅ Authing 服务连接正常"
else
    echo "❌ Authing 服务连接失败"
fi

echo ""
echo "📊 检查构建状态..."
if npm run build > /dev/null 2>&1; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
fi

# 停止开发服务器
kill $DEV_PID 2>/dev/null

echo ""
echo "✅ 测试完成"

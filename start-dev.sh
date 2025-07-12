#!/bin/bash

# 文派项目开发环境启动脚本
# 自动启动API服务器和Vite开发服务器

echo "🚀 启动文派开发环境..."

# 设置环境变量
# 读取本地环境变量OPENAI_API_KEY（请在.env文件或shell环境中配置）
# @env OPENAI_API_KEY 用于OpenAI API访问
export OPENAI_API_KEY="${OPENAI_API_KEY}"

# 检查端口是否被占用
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  端口 $1 已被占用，正在停止..."
        lsof -ti:$1 | xargs kill -9
        sleep 2
    fi
}

# 停止可能存在的进程
echo "🛑 清理现有进程..."
check_port 8888
check_port 3000
check_port 3001
check_port 3002
check_port 3003
check_port 3004
check_port 3005
check_port 3006
check_port 3007

# 启动API服务器
echo "📡 启动API服务器 (端口 8888)..."
node dev-api-server.js &
API_PID=$!

# 等待API服务器启动
sleep 3

# 检查API服务器是否启动成功
if curl -s http://localhost:8888/.netlify/functions/api > /dev/null; then
    echo "✅ API服务器启动成功"
else
    echo "❌ API服务器启动失败"
    exit 1
fi

# 启动Vite开发服务器
echo "🌐 启动Vite开发服务器..."
npm run dev &
VITE_PID=$!

# 等待Vite服务器启动
sleep 5

# 检查Vite服务器是否启动成功
VITE_PORT=$(lsof -ti:3000,3001,3002,3003,3004,3005,3006,3007 | head -1 | xargs lsof -i -P | grep LISTEN | awk '{print $9}' | cut -d: -f2 | head -1)

if [ ! -z "$VITE_PORT" ]; then
    echo "✅ Vite开发服务器启动成功 (端口 $VITE_PORT)"
    echo ""
    echo "🎉 开发环境启动完成！"
    echo "📱 前端地址: http://localhost:$VITE_PORT"
    echo "🔧 API地址: http://localhost:8888/.netlify/functions/api"
    echo "🧪 测试页面: http://localhost:$VITE_PORT/test-image-generation.html"
    echo ""
    echo "按 Ctrl+C 停止所有服务"
else
    echo "❌ Vite开发服务器启动失败"
    kill $API_PID 2>/dev/null
    exit 1
fi

# 等待用户中断
trap 'echo ""; echo "🛑 正在停止服务..."; kill $API_PID $VITE_PID 2>/dev/null; exit 0' INT

# 保持脚本运行
wait 
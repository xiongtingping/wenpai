#!/bin/bash

# 启动开发环境脚本
# 同时启动 Vite 开发服务器和 Netlify dev 服务

echo "🚀 启动开发环境..."

# 检查是否已安装 Netlify CLI
if ! command -v netlify >/dev/null 2>&1; then
    echo "❌ Netlify CLI 未安装，正在安装..."
    npm install -g netlify-cli
fi

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  端口 $port 已被占用"
        return 1
    else
        echo "✅ 端口 $port 可用"
        return 0
    fi
}

# 检查必要的端口
echo "📋 检查端口状态..."
check_port 5173
check_port 8888

echo ""
echo "🔧 启动 Netlify dev 服务..."
echo "这将启动 Netlify Functions 和开发服务器"
echo ""

# 启动 Netlify dev 服务
# 这会同时启动前端开发服务器和 Netlify Functions
netlify dev --port 8888 --target-port 5177

echo ""
echo "✅ 开发环境启动完成"
echo "📋 访问地址:"
echo "   - 前端应用: http://localhost:8888"
echo "   - Netlify Functions: http://localhost:8888/.netlify/functions/"
echo "   - Authing 回调: http://localhost:8888/callback"
echo ""
echo "💡 重要提醒:"
echo "1. 确保 Authing 控制台中的回调地址配置为: http://localhost:8888/callback"
echo "2. 如果遇到端口冲突，请先停止其他服务"
echo "3. 使用 Ctrl+C 停止服务" 
#!/bin/bash

# 智能端口检测和开发环境启动脚本

echo "🔍 检测当前开发环境..."

# 检测 Vite 开发服务器端口
detect_vite_port() {
    local ports=(5173 5174 5175 5176 5177 5178 5179 5180)
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo "✅ 检测到 Vite 服务器运行在端口 $port"
            return $port
        fi
    done
    echo "❌ 未检测到 Vite 服务器"
    return 0
}

# 检测 Netlify dev 服务端口
detect_netlify_port() {
    if lsof -Pi :8888 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "✅ 检测到 Netlify dev 服务运行在端口 8888"
        return 1
    else
        echo "❌ 未检测到 Netlify dev 服务"
        return 0
    fi
}

# 获取 Vite 端口
vite_port=$(detect_vite_port)
echo "📋 Vite 端口: $vite_port"

# 检查 Netlify dev 服务
netlify_running=$(detect_netlify_port)
echo "📋 Netlify dev 状态: $netlify_running"

echo ""
echo "🎯 当前状态分析:"

if [ $netlify_running -eq 1 ]; then
    echo "✅ Netlify dev 服务已运行"
    echo "🌐 访问地址: http://localhost:8888"
    echo "🔧 推荐使用 Netlify dev 服务以获得完整功能"
elif [ $vite_port -gt 0 ]; then
    echo "⚠️  仅 Vite 开发服务器运行在端口 $vite_port"
    echo "❌ 缺少 Netlify Functions 支持"
    echo "💡 建议启动 Netlify dev 服务以获得完整功能"
else
    echo "❌ 未检测到任何开发服务器"
    echo "💡 需要启动开发环境"
fi

echo ""
echo "🚀 选择启动方式:"
echo "1. 启动 Netlify dev 服务 (推荐 - 完整功能)"
echo "2. 仅启动 Vite 开发服务器 (基础功能)"
echo "3. 退出"

read -p "请选择 (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔧 启动 Netlify dev 服务..."
        echo "这将提供完整的开发环境，包括:"
        echo "  - 前端应用"
        echo "  - Netlify Functions"
        echo "  - Authing 回调处理"
        echo "  - API 支持"
        echo ""
        
        # 如果 Vite 服务器正在运行，先停止它
        if [ $vite_port -gt 0 ]; then
            echo "🛑 停止现有的 Vite 服务器..."
            lsof -ti:$vite_port | xargs kill -9 2>/dev/null
            sleep 2
        fi
        
        # 启动 Netlify dev 服务
        netlify dev --port 8888 --target-port 5177
        ;;
    2)
        echo ""
        echo "🌐 启动 Vite 开发服务器..."
        echo "注意: 此模式不支持 Authing 回调处理"
        echo ""
        npm run dev
        ;;
    3)
        echo "👋 退出"
        exit 0
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac 
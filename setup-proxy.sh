#!/bin/bash

echo "🔧 OpenAI API 代理配置工具"
echo "=============================="

# 默认代理端口
DEFAULT_PROXY_PORT="7890"

echo "请选择代理配置方式："
echo "1. 使用默认端口 7890 (Clash/Shadowsocks等)"
echo "2. 自定义代理端口"
echo "3. 清除代理设置"
echo "4. 测试当前代理设置"

read -p "请选择 (1-4): " choice

case $choice in
    1)
        echo "设置代理端口为 $DEFAULT_PROXY_PORT..."
        export http_proxy="http://127.0.0.1:$DEFAULT_PROXY_PORT"
        export https_proxy="http://127.0.0.1:$DEFAULT_PROXY_PORT"
        export HTTP_PROXY="http://127.0.0.1:$DEFAULT_PROXY_PORT"
        export HTTPS_PROXY="http://127.0.0.1:$DEFAULT_PROXY_PORT"
        echo "✅ 代理设置完成"
        echo "HTTP_PROXY=$http_proxy"
        echo "HTTPS_PROXY=$https_proxy"
        ;;
    2)
        read -p "请输入代理端口: " port
        echo "设置代理端口为 $port..."
        export http_proxy="http://127.0.0.1:$port"
        export https_proxy="http://127.0.0.1:$port"
        export HTTP_PROXY="http://127.0.0.1:$port"
        export HTTPS_PROXY="http://127.0.0.1:$port"
        echo "✅ 代理设置完成"
        echo "HTTP_PROXY=$http_proxy"
        echo "HTTPS_PROXY=$https_proxy"
        ;;
    3)
        echo "清除代理设置..."
        unset http_proxy
        unset https_proxy
        unset HTTP_PROXY
        unset HTTPS_PROXY
        echo "✅ 代理设置已清除"
        ;;
    4)
        echo "测试当前代理设置..."
        if [ -n "$http_proxy" ] || [ -n "$HTTP_PROXY" ]; then
            echo "当前代理设置:"
            echo "HTTP_PROXY=$http_proxy$HTTP_PROXY"
            echo "HTTPS_PROXY=$https_proxy$HTTPS_PROXY"
            
            echo "测试OpenAI API连接..."
            if curl -s --connect-timeout 10 https://api.openai.com/v1/models > /dev/null 2>&1; then
                echo "✅ 代理连接测试成功"
            else
                echo "❌ 代理连接测试失败"
            fi
        else
            echo "ℹ️  当前未设置代理"
        fi
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "💡 提示："
echo "1. 这些设置只在当前终端会话中有效"
echo "2. 要永久设置，请将这些命令添加到 ~/.zshrc 或 ~/.bashrc"
echo "3. 设置代理后，请重新启动API服务器" 
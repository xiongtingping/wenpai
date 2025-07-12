#!/bin/bash

echo "🔍 OpenAI API 网络连接诊断工具"
echo "=================================="

# 检查基本网络连接
echo "1. 检查基本网络连接..."
if ping -c 3 8.8.8.8 > /dev/null 2>&1; then
    echo "✅ 基本网络连接正常"
else
    echo "❌ 基本网络连接失败"
    exit 1
fi

# 检查DNS解析
echo "2. 检查DNS解析..."
if nslookup api.openai.com > /dev/null 2>&1; then
    echo "✅ DNS解析正常"
else
    echo "❌ DNS解析失败"
fi

# 检查OpenAI API连接
echo "3. 检查OpenAI API连接..."
if curl -s --connect-timeout 10 https://api.openai.com/v1/models > /dev/null 2>&1; then
    echo "✅ OpenAI API连接正常"
else
    echo "❌ OpenAI API连接失败"
fi

# 检查代理设置
echo "4. 检查代理设置..."
if [ -n "$http_proxy" ] || [ -n "$HTTP_PROXY" ]; then
    echo "✅ 检测到HTTP代理设置: $http_proxy$HTTP_PROXY"
else
    echo "ℹ️  未检测到HTTP代理设置"
fi

if [ -n "$https_proxy" ] || [ -n "$HTTPS_PROXY" ]; then
    echo "✅ 检测到HTTPS代理设置: $https_proxy$HTTPS_PROXY"
else
    echo "ℹ️  未检测到HTTPS代理设置"
fi

# 检查常见的代理端口
echo "5. 检查常见代理端口..."
common_ports=(7890 8080 1080 3128 8888)
for port in "${common_ports[@]}"; do
    if nc -z localhost $port 2>/dev/null; then
        echo "✅ 检测到本地代理服务运行在端口 $port"
    fi
done

echo ""
echo "🔧 解决方案建议："
echo "=================================="
echo "1. 如果网络连接正常但API连接失败，可能需要配置代理："
echo "   export http_proxy=http://127.0.0.1:7890"
echo "   export https_proxy=http://127.0.0.1:7890"
echo ""
echo "2. 或者使用VPN服务"
echo ""
echo "3. 检查防火墙设置"
echo ""
echo "4. 如果使用代理，确保代理服务正在运行" 
#!/bin/bash

echo "🔍 网络连接诊断工具"
echo "=================="

# 检查基本网络连接
echo "1. 检查基本网络连接..."
if ping -c 3 8.8.8.8 > /dev/null 2>&1; then
    echo "✅ 基本网络连接正常"
else
    echo "❌ 基本网络连接失败"
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
if curl -I https://api.openai.com/v1/models --connect-timeout 10 > /dev/null 2>&1; then
    echo "✅ OpenAI API连接正常"
else
    echo "❌ OpenAI API连接失败"
fi

echo ""
echo "🔧 解决方案建议："
echo "=================="
echo "1. 配置VPN或代理服务器"
echo "2. 检查防火墙设置"
echo "3. 尝试使用不同的DNS服务器"
echo "4. 检查网络代理设置"
echo ""
echo "📝 手动配置代理示例："
echo "export https_proxy=http://your-proxy:port"
echo "export http_proxy=http://your-proxy:port"
echo ""
echo "🌐 或者使用系统代理设置："
echo "系统偏好设置 > 网络 > 高级 > 代理" 
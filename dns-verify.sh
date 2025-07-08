#!/bin/bash

echo "🔍 DNS 配置验证脚本"
echo "=================="
echo ""

DOMAIN="wenpai.xyz"
WWW_DOMAIN="www.wenpai.xyz"

echo "正在检查 DNS 记录..."
echo ""

# 检查主域名
echo "🌍 检查主域名: $DOMAIN"
if command -v nslookup &> /dev/null; then
    nslookup $DOMAIN
else
    echo "nslookup 命令不可用"
fi
echo ""

# 检查 www 子域名
echo "🌐 检查 www 子域名: $WWW_DOMAIN"
if command -v nslookup &> /dev/null; then
    nslookup $WWW_DOMAIN
else
    echo "nslookup 命令不可用"
fi
echo ""

# 检查 HTTP 状态
echo "🌐 检查网站可访问性..."
if command -v curl &> /dev/null; then
    echo "检查 https://$WWW_DOMAIN"
    curl -I -s https://$WWW_DOMAIN | head -5
else
    echo "curl 命令不可用"
fi

echo ""
echo "✅ DNS 验证完成！"
echo ""
echo "如果 DNS 记录正确配置，你应该能够："
echo "1. 通过 nslookup 看到正确的 IP 地址"
echo "2. 通过浏览器访问 https://$WWW_DOMAIN"
echo ""
echo "注意：DNS 传播可能需要 24-48 小时"

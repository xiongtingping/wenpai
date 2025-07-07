#!/bin/bash

# 打开文派AI网站脚本

echo "�� 正在打开文派AI网站..."

# 网站地址
WEBSITE_URL="https://wenpaiai626.netlify.app"

# 检测操作系统并打开浏览器
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$WEBSITE_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open &> /dev/null; then
        xdg-open "$WEBSITE_URL"
    elif command -v gnome-open &> /dev/null; then
        gnome-open "$WEBSITE_URL"
    else
        echo "请手动打开浏览器访问: $WEBSITE_URL"
    fi
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows
    start "$WEBSITE_URL"
else
    echo "无法自动打开浏览器，请手动访问: $WEBSITE_URL"
fi

echo "✅ 网站地址: $WEBSITE_URL"
echo ""
echo "�� 文派AI 功能特色:"
echo "  �� AI内容适配 (多平台)"
echo "  ✨ 创意工具套件"
echo "  �� 热点话题追踪"
echo "  �� 品牌资料库"
echo "  👤 用户权限管理"
echo ""
echo "�� 支持设备: 桌面端、移动端、平板"
echo "🔧 技术栈: React + TypeScript + Vite"
echo "☁️ 部署平台: Netlify" 
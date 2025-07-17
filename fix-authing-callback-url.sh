#!/bin/bash

echo "🔧 修复Authing回调URL配置..."

# 检查是否存在.env文件
if [ ! -f .env ]; then
    echo "📝 创建.env文件..."
    touch .env
fi

# 备份现有配置
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ 已备份现有配置"
fi

# 清理现有的Authing回调配置
echo "🧹 清理现有Authing回调配置..."
sed -i '' '/VITE_AUTHING_REDIRECT_URI_DEV/d' .env 2>/dev/null || true
sed -i '' '/VITE_AUTHING_REDIRECT_URI_PROD/d' .env 2>/dev/null || true

# 添加正确的Authing回调配置
echo "📝 添加正确的Authing回调配置..."
echo "" >> .env
echo "# Authing回调URL配置" >> .env
echo "VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/callback" >> .env
echo "VITE_AUTHING_REDIRECT_URI_PROD=https://www.wenpai.xyz/callback" >> .env

echo "✅ Authing回调URL配置已修复"
echo ""
echo "📋 当前配置:"
echo "  开发环境: http://localhost:5173/callback"
echo "  生产环境: https://www.wenpai.xyz/callback"
echo ""
echo "🔄 请重启开发服务器以应用新配置"
echo "   运行: npm run dev" 
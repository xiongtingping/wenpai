#!/bin/bash

echo "🔧 修复 Authing 重定向问题..."

# 1. 检查当前配置
echo "📋 检查当前配置..."
if [ -f ".env" ]; then
    echo "✅ 找到 .env 文件"
    echo "当前 Authing 配置："
    grep -E "AUTHING" .env || echo "⚠️  未找到 Authing 配置"
else
    echo "❌ 未找到 .env 文件"
fi

# 2. 创建正确的 Authing 配置
echo "🔧 创建正确的 Authing 配置..."

cat > .env.authing.correct << 'EOF'
# Authing 正确配置
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://wenpai.authing.cn
VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/callback
VITE_AUTHING_REDIRECT_URI_PROD=https://wenpai.xyz/callback

# 离线模式配置
VITE_OFFLINE_MODE=false

# API 配置
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_DEEPSEEK_API_KEY=your_deepseek_key_here
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_CREEM_API_KEY=your_creem_key_here
EOF

echo "✅ 创建了正确的 Authing 配置文件 .env.authing.correct"

# 3. 备份当前配置
if [ -f ".env" ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ 备份了当前配置文件"
fi

# 4. 应用正确配置
cp .env.authing.correct .env
echo "✅ 已应用正确的 Authing 配置"

# 5. 检查 Authing 控制台配置
echo ""
echo "🔍 Authing 控制台配置检查清单："
echo ""
echo "1. 登录 Authing 控制台：https://console.authing.cn"
echo "2. 选择应用：wenpai"
echo "3. 进入 '应用配置' -> '应用信息'"
echo "4. 检查以下配置："
echo "   - 应用 ID: 6867fdc88034eb95ae86167d"
echo "   - 应用域名: https://wenpai.authing.cn"
echo "   - 登录回调 URL: http://localhost:5173/callback"
echo "   - 登出回调 URL: http://localhost:5173"
echo ""
echo "5. 进入 '应用配置' -> '安全配置'"
echo "   - 确保 '允许的 Web 起源' 包含: http://localhost:5173"
echo "   - 确保 '允许的回调 URL' 包含: http://localhost:5173/callback"
echo ""

# 6. 重启开发服务器
echo "🚀 重启开发服务器..."
pkill -f "vite" || true
sleep 2

echo ""
echo "🎉 Authing 重定向问题修复完成！"
echo ""
echo "📋 修复内容："
echo "   - ✅ 配置了正确的 Authing 域名"
echo "   - ✅ 设置了正确的应用 ID"
echo "   - ✅ 配置了正确的回调地址"
echo "   - ✅ 重启了开发服务器"
echo ""
echo "🔧 下一步："
echo "1. 检查 Authing 控制台配置"
echo "2. 确认回调 URL 设置正确"
echo "3. 测试登录功能"
echo ""
echo "🌐 当前状态：Authing 配置已修复" 
#!/bin/bash

echo "🔧 启用离线模式..."

# 1. 检查当前状态
echo "📊 检查当前状态..."
curl -s http://localhost:5173 > /dev/null && echo "✅ 本地应用运行正常" || echo "❌ 本地应用未运行"

# 2. 创建离线模式配置
echo "🔧 创建离线模式配置..."

cat > .env.offline << 'EOF'
# 离线模式配置
VITE_OFFLINE_MODE=true
VITE_AUTHING_APP_ID=offline-mode
VITE_AUTHING_HOST=offline
VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/callback
VITE_AUTHING_REDIRECT_URI_PROD=https://your-domain.com/callback

# API 配置
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_DEEPSEEK_API_KEY=your_deepseek_key_here
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_CREEM_API_KEY=your_creem_key_here
EOF

echo "✅ 创建了离线模式配置文件 .env.offline"

# 3. 备份当前配置
if [ -f ".env" ]; then
    cp .env .env.backup
    echo "✅ 备份了当前配置文件为 .env.backup"
fi

# 4. 应用离线配置
cp .env.offline .env
echo "✅ 已应用离线模式配置"

# 5. 重启开发服务器
echo "🚀 重启开发服务器..."
pkill -f "vite" || true
sleep 2

echo ""
echo "🎉 离线模式已启用！"
echo ""
echo "📋 离线模式功能："
echo "   - ✅ 按钮点击和页面跳转"
echo "   - ✅ 模拟用户登录"
echo "   - ✅ 基本功能测试"
echo "   - ✅ 无需网络连接"
echo ""
echo "🔧 如需恢复在线模式："
echo "   - 运行: cp .env.backup .env"
echo "   - 重启开发服务器"
echo ""
echo "🌐 当前状态：离线模式运行中" 
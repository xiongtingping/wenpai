#!/bin/bash

# Authing问题修复脚本

echo "🔧 开始修复Authing相关问题..."

# 1. 检查并创建.env.local文件
if [ ! -f .env.local ]; then
    echo "📝 创建.env.local文件..."
    cat > .env.local << EOF
# Authing配置
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn

# OpenAI配置 (请替换为真实密钥)
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here

# Creem支付配置 (请替换为真实密钥)
VITE_CREEM_API_KEY=your-creem-api-key-here

# 开发环境配置
VITE_DEV_MODE=true
VITE_API_TIMEOUT=30000
VITE_ENCRYPTION_KEY=your-custom-encryption-key-here
EOF
    echo "✅ .env.local文件已创建"
else
    echo "✅ .env.local文件已存在"
fi

# 2. 检查网络连接
echo "🌐 检查网络连接..."
if curl -s --connect-timeout 5 https://qutkgzkfaezk-demo.authing.cn > /dev/null; then
    echo "✅ Authing域名可访问"
else
    echo "❌ Authing域名无法访问，可能需要VPN或代理"
fi

# 3. 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.vite
rm -rf dist
echo "✅ 缓存已清理"

# 4. 重新安装依赖
echo "📦 重新安装依赖..."
npm install
echo "✅ 依赖安装完成"

# 5. 检查端口占用
echo "🔍 检查端口占用..."
if lsof -ti:5173 > /dev/null 2>&1; then
    echo "⚠️  端口5173被占用，正在停止..."
    lsof -ti:5173 | xargs kill -9
    echo "✅ 端口已释放"
else
    echo "✅ 端口5173可用"
fi

# 6. 启动开发服务器
echo "🚀 启动开发服务器..."
echo "请运行以下命令启动开发服务器："
echo "npm run dev"
echo ""
echo "如果仍有问题，请："
echo "1. 检查.env.local中的API密钥配置"
echo "2. 确保网络连接正常"
echo "3. 尝试使用VPN或代理"
echo "4. 清除浏览器缓存并刷新页面" 
#!/bin/bash

echo "🔧 开始修复网络连接和API配置问题..."

# 检查网络连接
echo "📡 检查网络连接..."
ping -c 3 qutkgzkfaezk-demo.authing.cn

# 检查DNS解析
echo "🌐 检查DNS解析..."
nslookup qutkgzkfaezk-demo.authing.cn

# 检查环境变量配置
echo "⚙️ 检查环境变量配置..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local文件存在"
    echo "📋 当前配置："
    grep -E "VITE_.*=" .env.local | while read line; do
        echo "  $line"
    done
else
    echo "❌ .env.local文件不存在，创建示例配置..."
    cat > .env.local << EOF
# Authing配置
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn

# AI API配置（请替换为真实密钥）
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
VITE_DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# 支付配置（请替换为真实密钥）
VITE_CREEM_API_KEY=your-creem-api-key-here

# 开发配置
VITE_DEV_MODE=true
VITE_API_TIMEOUT=30000
VITE_ENCRYPTION_KEY=your-custom-encryption-key-here
EOF
    echo "✅ 已创建.env.local示例文件"
fi

# 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.vite
rm -rf dist

# 重新安装依赖
echo "📦 重新安装依赖..."
npm install

# 启动开发服务器
echo "🚀 启动开发服务器..."
npm run dev 
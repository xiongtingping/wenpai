#!/bin/bash

echo "🔧 文派网络连接问题修复脚本"
echo "================================"

# 检查网络连接
echo "📡 检查网络连接..."
if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
    echo "✅ 网络连接正常"
else
    echo "❌ 网络连接异常，请检查网络设置"
    exit 1
fi

# 检查DNS解析
echo "🌐 检查DNS解析..."
if nslookup qutkgzkfaezk-demo.authing.cn > /dev/null 2>&1; then
    echo "✅ DNS解析正常"
else
    echo "⚠️ DNS解析可能有问题，尝试使用备用DNS"
    # 可以在这里添加DNS修复逻辑
fi

# 检查端口占用
echo "🔍 检查端口占用..."
if lsof -i :5173 > /dev/null 2>&1; then
    echo "⚠️ 端口5173被占用，尝试释放..."
    pkill -f "vite" || true
    sleep 2
fi

if lsof -i :5174 > /dev/null 2>&1; then
    echo "⚠️ 端口5174被占用，尝试释放..."
    pkill -f "vite" || true
    sleep 2
fi

# 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist

# 重新安装依赖
echo "📦 重新安装依赖..."
npm install

# 检查环境变量
echo "🔧 检查环境变量配置..."
if [ ! -f ".env.local" ]; then
    echo "⚠️ 未找到.env.local文件，创建示例配置..."
    cat > .env.local << EOF
# Authing配置
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn

# OpenAI配置
VITE_OPENAI_API_KEY=your-openai-api-key-here

# DeepSeek配置
VITE_DEEPSEEK_API_KEY=your-deepseek-api-key-here

# Gemini配置
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# Creem支付配置
VITE_CREEM_API_KEY=your-creem-api-key-here

# 开发模式
VITE_DEV_MODE=true

# API超时设置
VITE_API_TIMEOUT=30000

# 加密密钥
VITE_ENCRYPTION_KEY=your-custom-encryption-key-here-32-chars
EOF
    echo "✅ 已创建.env.local示例文件"
else
    echo "✅ .env.local文件已存在"
fi

# 启动开发服务器
echo "🚀 启动开发服务器..."
echo "📝 提示：如果仍有网络问题，请尝试以下方法："
echo "1. 检查防火墙设置"
echo "2. 尝试使用VPN"
echo "3. 更换DNS服务器（如8.8.8.8或1.1.1.1）"
echo "4. 清除浏览器缓存"
echo "5. 重启网络设备"
echo ""
echo "🔗 应用将在以下地址启动："
echo "   - 本地: http://localhost:5173/"
echo "   - 网络: http://192.168.100.102:5173/"
echo ""

npm run dev 
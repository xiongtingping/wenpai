#!/bin/bash

echo "🔑 更新API密钥配置..."

# 检查.env.local文件是否存在
if [ -f ".env.local" ]; then
    echo "✅ .env.local文件存在，备份为.env.local.backup"
    cp .env.local .env.local.backup
else
    echo "📝 创建新的.env.local文件"
fi

# 创建/更新.env.local文件
cat > .env.local << 'EOF'
# Authing配置
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn

# AI API配置（使用您之前提供的密钥）
VITE_OPENAI_API_KEY=sk-***[已隐藏]***
VITE_DEEPSEEK_API_KEY=sk-c195bdaf58941978ec7322fc6dd88
VITE_GEMINI_API_KEY=your-gemini-api-key

# 支付配置（请替换为真实密钥）
VITE_CREEM_API_KEY=your-creem-api-key-here

# 开发配置
VITE_DEV_MODE=true
VITE_API_TIMEOUT=30000
VITE_ENCRYPTION_KEY=your-custom-encryption-key-here

# OpenAI配置
VITE_OPENAI_ENDPOINT=https://api.openai.com/v1/chat/completions
VITE_OPENAI_MODEL=gpt-4o
VITE_OPENAI_TIMEOUT=30000

# DeepSeek配置
VITE_DEEPSEEK_ENDPOINT=https://api.deepseek.com/v1/chat/completions
VITE_DEEPSEEK_MODEL=deepseek-v2.5
VITE_DEEPSEEK_TIMEOUT=30000

# Gemini配置
VITE_GEMINI_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
VITE_GEMINI_MODEL=gemini-pro
VITE_GEMINI_TIMEOUT=30000

# 功能开关
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_IMAGE_GENERATION=true
VITE_ENABLE_CONTENT_ADAPTATION=true

# 调试配置
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info

# 安全配置
VITE_SECURITY_LEVEL=high
VITE_ENABLE_SECURITY_LOGGING=true

# 后端API配置
VITE_API_BASE_URL=https://www.wenpai.xyz/api
EOF

echo "✅ API密钥配置已更新"
echo ""
echo "📋 配置的API密钥："
echo "• OpenAI: sk-***[已隐藏]***"
echo "• DeepSeek: sk-c195bdaf58941978ec7322fc6dd88"
echo "• Gemini: your-gemini-api-key (需要替换为真实密钥)"
echo "• Creem: your-creem-api-key-here (需要替换为真实密钥)"
echo ""
echo "🔄 重启开发服务器以应用新配置..."
echo "请运行: npm run dev" 
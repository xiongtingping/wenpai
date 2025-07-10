#!/bin/bash

# AI API 快速配置脚本
# 用于快速设置 OpenAI API 密钥

echo "🤖 AI API 快速配置脚本"
echo "=========================="

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查 devApiProxy.ts 文件是否存在
if [ ! -f "src/api/devApiProxy.ts" ]; then
    echo "❌ 错误：找不到 src/api/devApiProxy.ts 文件"
    exit 1
fi

echo "📝 请选择配置方式："
echo "1) 直接编辑 devApiProxy.ts 文件"
echo "2) 使用环境变量 (.env.local)"
echo "3) 仅显示配置说明"
read -p "请选择 (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔧 方式一：直接编辑 devApiProxy.ts"
        echo "请手动编辑 src/api/devApiProxy.ts 文件"
        echo "找到以下行并替换为您的 API 密钥："
        echo ""
        echo "const OPENAI_CONFIG = {"
        echo "  endpoint: 'https://api.openai.com/v1/chat/completions',"
        echo "  apiKey: 'sk-your-actual-openai-api-key-here', // ← 替换这里"
        echo "  model: 'gpt-4o'"
        echo "};"
        echo ""
        echo "💡 提示：您可以从 https://platform.openai.com/api-keys 获取 API 密钥"
        ;;
    2)
        echo ""
        echo "🔧 方式二：使用环境变量"
        
        # 检查 .env.local 是否存在
        if [ -f ".env.local" ]; then
            echo "⚠️  警告：.env.local 文件已存在，将备份为 .env.local.backup"
            cp .env.local .env.local.backup
        fi
        
        # 创建或更新 .env.local
        cat > .env.local << EOF
# AI API 配置
# 请替换为您的真实 API 密钥

# OpenAI API 配置
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# DeepSeek API 配置（可选）
VITE_DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key-here

# Google Gemini API 配置（可选）
VITE_GEMINI_API_KEY=your-actual-gemini-api-key-here
EOF
        
        echo "✅ 已创建 .env.local 文件"
        echo "📝 请编辑 .env.local 文件，替换为您的真实 API 密钥"
        echo ""
        echo "💡 提示："
        echo "  - OpenAI: https://platform.openai.com/api-keys"
        echo "  - DeepSeek: https://platform.deepseek.com/api_keys"
        echo "  - Gemini: https://makersuite.google.com/app/apikey"
        ;;
    3)
        echo ""
        echo "📖 配置说明："
        echo ""
        echo "1. 获取 API 密钥："
        echo "   - OpenAI: https://platform.openai.com/api-keys"
        echo "   - DeepSeek: https://platform.deepseek.com/api_keys"
        echo "   - Gemini: https://makersuite.google.com/app/apikey"
        echo ""
        echo "2. 配置方式："
        echo "   - 开发环境：编辑 src/api/devApiProxy.ts 或使用 .env.local"
        echo "   - 生产环境：在 Netlify 控制台设置环境变量"
        echo ""
        echo "3. 验证配置："
        echo "   - 运行 npm run dev"
        echo "   - 访问 http://localhost:3000/test"
        echo "   - 尝试使用 AI 功能"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🎯 下一步："
echo "1. 配置 API 密钥"
echo "2. 运行 'npm run dev' 启动开发服务器"
echo "3. 测试 AI 功能是否正常工作"
echo ""
echo "📚 更多信息请查看 AI_API_SETUP.md" 
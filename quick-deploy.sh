#!/bin/bash

echo "🚀 文派 - 快速部署脚本"
echo "========================"

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 构建项目
echo "📦 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败！"
    exit 1
fi

echo "✅ 构建成功！"

# 显示部署选项
echo ""
echo "🌐 部署选项:"
echo "1. 拖拽部署到Netlify (推荐)"
echo "2. 使用Netlify CLI部署"
echo "3. 本地测试"
echo ""

read -p "请选择部署方式 (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📋 拖拽部署步骤:"
        echo "1. 打开 https://app.netlify.com/"
        echo "2. 点击 'Add new site' → 'Deploy manually'"
        echo "3. 将 'dist' 文件夹拖拽到部署区域"
        echo "4. 等待部署完成"
        echo ""
        echo "🔧 环境变量设置:"
        echo "在Netlify的Site settings → Environment variables中添加:"
        echo "- OPENAI_API_KEY: 你的OpenAI API密钥"
        echo "- DEEPSEEK_API_KEY: 你的DeepSeek API密钥"
        echo "- GEMINI_API_KEY: 你的Gemini API密钥"
        echo ""
        echo "📁 构建文件位置: $(pwd)/dist"
        open https://app.netlify.com/
        ;;
    2)
        echo "尝试使用Netlify CLI部署..."
        npx netlify-cli deploy --dir=dist --prod
        ;;
    3)
        echo "启动本地测试服务器..."
        echo "访问 http://localhost:3000"
        npx serve dist -p 3000
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署完成！" 
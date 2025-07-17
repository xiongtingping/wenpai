#!/bin/bash

echo "🔑 文派 API 密钥配置工具"
echo "========================"

# 检查 .env.local 文件是否存在
if [ ! -f ".env.local" ]; then
    echo "❌ 未找到 .env.local 文件"
    echo "请先运行 ./fix-environment.sh 创建环境配置文件"
    exit 1
fi

echo "📝 当前配置状态："
echo ""

# 检查 OpenAI API 密钥
OPENAI_KEY=$(grep "VITE_OPENAI_API_KEY=" .env.local | cut -d'=' -f2)
if [[ "$OPENAI_KEY" == sk-* ]]; then
    echo "✅ OpenAI API 密钥已配置"
else
    echo "❌ OpenAI API 密钥未配置"
fi

# 检查 Creem API 密钥
CREEM_KEY=$(grep "VITE_CREEM_API_KEY=" .env.local | cut -d'=' -f2)
if [[ "$CREEM_KEY" != "your-creem-api-key-here" && -n "$CREEM_KEY" ]]; then
    echo "✅ Creem API 密钥已配置"
else
    echo "❌ Creem API 密钥未配置"
fi

echo ""
echo "🔧 配置选项："
echo "1. 配置 OpenAI API 密钥"
echo "2. 配置 Creem API 密钥"
echo "3. 查看配置指南"
echo "4. 退出"
echo ""

read -p "请选择操作 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🔑 配置 OpenAI API 密钥"
        echo "获取地址：https://platform.openai.com/api-keys"
        echo ""
        read -p "请输入您的 OpenAI API 密钥: " openai_key
        
        if [[ "$openai_key" == sk-* ]]; then
            # 备份原文件
            cp .env.local .env.local.backup
            
            # 更新 OpenAI API 密钥
            sed -i '' "s/VITE_OPENAI_API_KEY=.*/VITE_OPENAI_API_KEY=$openai_key/" .env.local
            
            echo "✅ OpenAI API 密钥配置成功"
        else
            echo "❌ 无效的 OpenAI API 密钥格式，应以 'sk-' 开头"
        fi
        ;;
    2)
        echo ""
        echo "🔑 配置 Creem API 密钥"
        echo "获取地址：https://creem.io/"
        echo ""
        read -p "请输入您的 Creem API 密钥: " creem_key
        
        if [[ -n "$creem_key" ]]; then
            # 备份原文件
            cp .env.local .env.local.backup
            
            # 更新 Creem API 密钥
            sed -i '' "s/VITE_CREEM_API_KEY=.*/VITE_CREEM_API_KEY=$creem_key/" .env.local
            
            echo "✅ Creem API 密钥配置成功"
        else
            echo "❌ API 密钥不能为空"
        fi
        ;;
    3)
        echo ""
        echo "📚 配置指南"
        echo "=========="
        echo ""
        echo "🔑 OpenAI API 密钥："
        echo "1. 访问 https://platform.openai.com/api-keys"
        echo "2. 登录或注册 OpenAI 账户"
        echo "3. 点击 'Create new secret key'"
        echo "4. 复制生成的密钥（以 'sk-' 开头）"
        echo ""
        echo "🔑 Creem 支付 API 密钥："
        echo "1. 访问 https://creem.io/"
        echo "2. 注册并登录 Creem 账户"
        echo "3. 在控制台获取 API 密钥"
        echo "4. 复制密钥"
        echo ""
        echo "⚠️  安全提示："
        echo "- 不要将 API 密钥分享给他人"
        echo "- 定期轮换 API 密钥"
        echo "- 监控 API 使用情况"
        echo ""
        ;;
    4)
        echo "👋 退出配置工具"
        exit 0
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🔍 验证配置..."
./check-status.sh 
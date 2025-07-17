#!/bin/bash

# 部署环境API配置快速设置脚本
# 帮助用户快速配置各种部署平台的环境变量

echo "🚀 部署环境API配置快速设置脚本"
echo "=================================="

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 获取用户输入
get_input() {
    local prompt=$1
    local default=$2
    local required=$3
    
    if [ "$required" = "true" ]; then
        while true; do
            read -p "$prompt: " input
            if [ -n "$input" ]; then
                echo "$input"
                break
            else
                print_message $RED "❌ 此字段为必填项，请输入有效值"
            fi
        done
    else
        read -p "$prompt (可选): " input
        echo "${input:-$default}"
    fi
}

# 验证API密钥格式
validate_api_key() {
    local key=$1
    local type=$2
    
    case $type in
        "openai")
            if [[ $key =~ ^sk-[a-zA-Z0-9]{20,}$ ]]; then
                return 0
            else
                return 1
            fi
            ;;
        "deepseek")
            if [[ $key =~ ^sk-[a-zA-Z0-9]{30,}$ ]]; then
                return 0
            else
                return 1
            fi
            ;;
        "gemini")
            if [ ${#key} -ge 20 ]; then
                return 0
            else
                return 1
            fi
            ;;
        "creem")
            if [[ $key =~ ^creem_[a-zA-Z0-9]+$ ]]; then
                return 0
            else
                return 1
            fi
            ;;
        *)
            return 0
            ;;
    esac
}

echo ""
print_message $BLUE "📋 请选择配置方式："
echo "1) Netlify 部署配置"
echo "2) Vercel 部署配置"
echo "3) GitHub Pages 部署配置"
echo "4) 自建服务器部署配置"
echo "5) 生成环境变量文件"
echo "6) 显示配置说明"
read -p "请选择 (1-6): " choice

case $choice in
    1)
        print_message $BLUE "🌐 Netlify 部署配置"
        echo ""
        
        # 获取配置信息
        openai_key=$(get_input "请输入OpenAI API密钥" "" "true")
        if ! validate_api_key "$openai_key" "openai"; then
            print_message $RED "❌ OpenAI API密钥格式无效，应以 sk- 开头，长度至少20个字符"
            exit 1
        fi
        
        authing_app_id=$(get_input "请输入Authing应用ID" "6867fdc88034eb95ae86167d" "true")
        authing_host=$(get_input "请输入Authing域名" "https://qutkgzkfaezk-demo.authing.cn" "true")
        domain=$(get_input "请输入您的Netlify域名" "your-site.netlify.app" "true")
        
        deepseek_key=$(get_input "请输入DeepSeek API密钥" "" "false")
        if [ -n "$deepseek_key" ] && ! validate_api_key "$deepseek_key" "deepseek"; then
            print_message $YELLOW "⚠️ DeepSeek API密钥格式可能无效"
        fi
        
        gemini_key=$(get_input "请输入Gemini API密钥" "" "false")
        if [ -n "$gemini_key" ] && ! validate_api_key "$gemini_key" "gemini"; then
            print_message $YELLOW "⚠️ Gemini API密钥格式可能无效"
        fi
        
        creem_key=$(get_input "请输入Creem支付API密钥" "" "false")
        if [ -n "$creem_key" ] && ! validate_api_key "$creem_key" "creem"; then
            print_message $YELLOW "⚠️ Creem API密钥格式可能无效"
        fi
        
        echo ""
        print_message $GREEN "✅ Netlify 环境变量配置："
        echo ""
        echo "请在Netlify控制台中设置以下环境变量："
        echo ""
        echo "VITE_OPENAI_API_KEY=$openai_key"
        echo "VITE_AUTHING_APP_ID=$authing_app_id"
        echo "VITE_AUTHING_HOST=$authing_host"
        echo "VITE_AUTHING_REDIRECT_URI_PROD=https://$domain/callback"
        if [ -n "$deepseek_key" ]; then
            echo "VITE_DEEPSEEK_API_KEY=$deepseek_key"
        fi
        if [ -n "$gemini_key" ]; then
            echo "VITE_GEMINI_API_KEY=$gemini_key"
        fi
        if [ -n "$creem_key" ]; then
            echo "VITE_CREEM_API_KEY=$creem_key"
        fi
        echo "VITE_API_BASE_URL=https://$domain/api"
        ;;
        
    2)
        print_message $BLUE "🌐 Vercel 部署配置"
        echo ""
        
        # 获取配置信息
        openai_key=$(get_input "请输入OpenAI API密钥" "" "true")
        if ! validate_api_key "$openai_key" "openai"; then
            print_message $RED "❌ OpenAI API密钥格式无效"
            exit 1
        fi
        
        authing_app_id=$(get_input "请输入Authing应用ID" "6867fdc88034eb95ae86167d" "true")
        authing_host=$(get_input "请输入Authing域名" "https://qutkgzkfaezk-demo.authing.cn" "true")
        domain=$(get_input "请输入您的Vercel域名" "your-project.vercel.app" "true")
        
        deepseek_key=$(get_input "请输入DeepSeek API密钥" "" "false")
        gemini_key=$(get_input "请输入Gemini API密钥" "" "false")
        creem_key=$(get_input "请输入Creem支付API密钥" "" "false")
        
        echo ""
        print_message $GREEN "✅ Vercel 环境变量配置："
        echo ""
        echo "请在Vercel控制台中设置以下环境变量："
        echo ""
        echo "VITE_OPENAI_API_KEY=$openai_key"
        echo "VITE_AUTHING_APP_ID=$authing_app_id"
        echo "VITE_AUTHING_HOST=$authing_host"
        echo "VITE_AUTHING_REDIRECT_URI_PROD=https://$domain/callback"
        if [ -n "$deepseek_key" ]; then
            echo "VITE_DEEPSEEK_API_KEY=$deepseek_key"
        fi
        if [ -n "$gemini_key" ]; then
            echo "VITE_GEMINI_API_KEY=$gemini_key"
        fi
        if [ -n "$creem_key" ]; then
            echo "VITE_CREEM_API_KEY=$creem_key"
        fi
        echo "VITE_API_BASE_URL=https://$domain/api"
        ;;
        
    3)
        print_message $BLUE "🌐 GitHub Pages 部署配置"
        echo ""
        
        # 获取配置信息
        openai_key=$(get_input "请输入OpenAI API密钥" "" "true")
        if ! validate_api_key "$openai_key" "openai"; then
            print_message $RED "❌ OpenAI API密钥格式无效"
            exit 1
        fi
        
        authing_app_id=$(get_input "请输入Authing应用ID" "6867fdc88034eb95ae86167d" "true")
        authing_host=$(get_input "请输入Authing域名" "https://qutkgzkfaezk-demo.authing.cn" "true")
        username=$(get_input "请输入GitHub用户名" "" "true")
        repo=$(get_input "请输入仓库名称" "" "true")
        
        deepseek_key=$(get_input "请输入DeepSeek API密钥" "" "false")
        gemini_key=$(get_input "请输入Gemini API密钥" "" "false")
        creem_key=$(get_input "请输入Creem支付API密钥" "" "false")
        
        echo ""
        print_message $GREEN "✅ GitHub Secrets 配置："
        echo ""
        echo "请在GitHub仓库的Settings → Secrets and variables → Actions中设置："
        echo ""
        echo "VITE_OPENAI_API_KEY=$openai_key"
        echo "VITE_AUTHING_APP_ID=$authing_app_id"
        echo "VITE_AUTHING_HOST=$authing_host"
        echo "VITE_AUTHING_REDIRECT_URI_PROD=https://$username.github.io/$repo/callback"
        if [ -n "$deepseek_key" ]; then
            echo "VITE_DEEPSEEK_API_KEY=$deepseek_key"
        fi
        if [ -n "$gemini_key" ]; then
            echo "VITE_GEMINI_API_KEY=$gemini_key"
        fi
        if [ -n "$creem_key" ]; then
            echo "VITE_CREEM_API_KEY=$creem_key"
        fi
        ;;
        
    4)
        print_message $BLUE "🌐 自建服务器部署配置"
        echo ""
        
        # 获取配置信息
        openai_key=$(get_input "请输入OpenAI API密钥" "" "true")
        if ! validate_api_key "$openai_key" "openai"; then
            print_message $RED "❌ OpenAI API密钥格式无效"
            exit 1
        fi
        
        authing_app_id=$(get_input "请输入Authing应用ID" "6867fdc88034eb95ae86167d" "true")
        authing_host=$(get_input "请输入Authing域名" "https://qutkgzkfaezk-demo.authing.cn" "true")
        domain=$(get_input "请输入您的域名" "your-domain.com" "true")
        
        deepseek_key=$(get_input "请输入DeepSeek API密钥" "" "false")
        gemini_key=$(get_input "请输入Gemini API密钥" "" "false")
        creem_key=$(get_input "请输入Creem支付API密钥" "" "false")
        
        # 创建环境变量文件
        env_file=".env.production"
        cat > "$env_file" << EOF
# 生产环境API配置
# 生成时间: $(date)

# 必需配置
VITE_OPENAI_API_KEY=$openai_key
VITE_AUTHING_APP_ID=$authing_app_id
VITE_AUTHING_HOST=$authing_host
VITE_AUTHING_REDIRECT_URI_PROD=https://$domain/callback

# 可选配置
EOF
        
        if [ -n "$deepseek_key" ]; then
            echo "VITE_DEEPSEEK_API_KEY=$deepseek_key" >> "$env_file"
        fi
        if [ -n "$gemini_key" ]; then
            echo "VITE_GEMINI_API_KEY=$gemini_key" >> "$env_file"
        fi
        if [ -n "$creem_key" ]; then
            echo "VITE_CREEM_API_KEY=$creem_key" >> "$env_file"
        fi
        
        echo "VITE_API_BASE_URL=https://$domain/api" >> "$env_file"
        
        print_message $GREEN "✅ 已生成生产环境配置文件: $env_file"
        echo ""
        echo "请将此文件上传到您的服务器，并确保在构建时使用此环境变量文件。"
        ;;
        
    5)
        print_message $BLUE "📄 生成环境变量文件"
        echo ""
        
        # 获取配置信息
        openai_key=$(get_input "请输入OpenAI API密钥" "" "true")
        if ! validate_api_key "$openai_key" "openai"; then
            print_message $RED "❌ OpenAI API密钥格式无效"
            exit 1
        fi
        
        authing_app_id=$(get_input "请输入Authing应用ID" "6867fdc88034eb95ae86167d" "true")
        authing_host=$(get_input "请输入Authing域名" "https://qutkgzkfaezk-demo.authing.cn" "true")
        domain=$(get_input "请输入您的域名" "your-domain.com" "true")
        
        deepseek_key=$(get_input "请输入DeepSeek API密钥" "" "false")
        gemini_key=$(get_input "请输入Gemini API密钥" "" "false")
        creem_key=$(get_input "请输入Creem支付API密钥" "" "false")
        
        # 创建环境变量文件
        env_file=".env.deployment"
        cat > "$env_file" << EOF
# 部署环境API配置
# 生成时间: $(date)
# 注意：请根据您的部署平台选择相应的环境变量

# 必需配置
VITE_OPENAI_API_KEY=$openai_key
VITE_AUTHING_APP_ID=$authing_app_id
VITE_AUTHING_HOST=$authing_host
VITE_AUTHING_REDIRECT_URI_PROD=https://$domain/callback

# 可选配置
EOF
        
        if [ -n "$deepseek_key" ]; then
            echo "VITE_DEEPSEEK_API_KEY=$deepseek_key" >> "$env_file"
        fi
        if [ -n "$gemini_key" ]; then
            echo "VITE_GEMINI_API_KEY=$gemini_key" >> "$env_file"
        fi
        if [ -n "$creem_key" ]; then
            echo "VITE_CREEM_API_KEY=$creem_key" >> "$env_file"
        fi
        
        echo "VITE_API_BASE_URL=https://$domain/api" >> "$env_file"
        
        print_message $GREEN "✅ 已生成环境变量文件: $env_file"
        echo ""
        echo "请根据您的部署平台，将相应的环境变量配置到部署平台中。"
        ;;
        
    6)
        print_message $BLUE "📖 配置说明"
        echo ""
        echo "🔧 环境变量配置说明："
        echo ""
        echo "必需配置："
        echo "  VITE_OPENAI_API_KEY - OpenAI API密钥（以sk-开头）"
        echo "  VITE_AUTHING_APP_ID - Authing应用ID"
        echo "  VITE_AUTHING_HOST - Authing域名"
        echo "  VITE_AUTHING_REDIRECT_URI_PROD - 生产环境回调地址"
        echo ""
        echo "可选配置："
        echo "  VITE_DEEPSEEK_API_KEY - DeepSeek API密钥（以sk-开头）"
        echo "  VITE_GEMINI_API_KEY - Gemini API密钥"
        echo "  VITE_CREEM_API_KEY - Creem支付API密钥（以creem_开头）"
        echo "  VITE_API_BASE_URL - 后端API基础URL"
        echo ""
        echo "🔍 配置验证："
        echo "  部署完成后，访问 /api-config-test 页面验证配置是否正确"
        echo ""
        echo "📚 详细文档："
        echo "  查看 DEPLOYMENT_API_CONFIG_GUIDE.md 获取详细配置说明"
        ;;
        
    *)
        print_message $RED "❌ 无效选择，请重新运行脚本"
        exit 1
        ;;
esac

echo ""
print_message $GREEN "🎉 配置完成！"
echo ""
echo "📋 下一步操作："
echo "1. 将上述环境变量配置到您的部署平台"
echo "2. 重新部署项目"
echo "3. 访问 /api-config-test 验证配置"
echo "4. 测试主要功能是否正常工作"
echo ""
echo "📚 更多帮助："
echo "- 查看 DEPLOYMENT_API_CONFIG_GUIDE.md 获取详细说明"
echo "- 访问 /api-config-test 进行配置验证"
echo "- 查看控制台日志获取调试信息" 
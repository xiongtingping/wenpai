#!/bin/bash

# 部署配置状态检查脚本
# 检查当前环境变量配置状态

echo "🔍 部署配置状态检查"
echo "=================="

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

# 检查环境变量
check_env_var() {
    local var_name=$1
    local description=$2
    local required=$3
    
    if [ -n "${!var_name}" ]; then
        local value="${!var_name}"
        # 隐藏敏感信息
        if [[ $var_name == *"API_KEY"* ]] || [[ $var_name == *"SECRET"* ]]; then
            value="${value:0:8}...${value: -4}"
        fi
        print_message $GREEN "✅ $description: $value"
        return 0
    else
        if [ "$required" = "true" ]; then
            print_message $RED "❌ $description: 未设置（必需）"
            return 1
        else
            print_message $YELLOW "⚠️ $description: 未设置（可选）"
            return 0
        fi
    fi
}

# 检查文件是否存在
check_file() {
    local file_path=$1
    local description=$2
    
    if [ -f "$file_path" ]; then
        print_message $GREEN "✅ $description: 存在"
        return 0
    else
        print_message $YELLOW "⚠️ $description: 不存在"
        return 1
    fi
}

# 检查网络连接
check_network() {
    local url=$1
    local description=$2
    
    if curl -s --connect-timeout 5 "$url" > /dev/null 2>&1; then
        print_message $GREEN "✅ $description: 连接正常"
        return 0
    else
        print_message $RED "❌ $description: 连接失败"
        return 1
    fi
}

# 检查API密钥格式
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
print_message $BLUE "📋 环境变量检查"
echo ""

# 必需的环境变量
required_vars=(
    "VITE_OPENAI_API_KEY:OpenAI API密钥"
    "VITE_AUTHING_APP_ID:Authing应用ID"
    "VITE_AUTHING_HOST:Authing域名"
    "VITE_AUTHING_REDIRECT_URI_PROD:Authing回调地址"
)

# 可选的环境变量
optional_vars=(
    "VITE_DEEPSEEK_API_KEY:DeepSeek API密钥"
    "VITE_GEMINI_API_KEY:Gemini API密钥"
    "VITE_CREEM_API_KEY:Creem支付API密钥"
    "VITE_API_BASE_URL:后端API基础URL"
)

# 检查必需的环境变量
required_count=0
total_required=${#required_vars[@]}

for var_info in "${required_vars[@]}"; do
    IFS=':' read -r var_name description <<< "$var_info"
    if check_env_var "$var_name" "$description" "true"; then
        ((required_count++))
    fi
done

echo ""
print_message $BLUE "📋 可选环境变量检查"
echo ""

# 检查可选的环境变量
optional_count=0
total_optional=${#optional_vars[@]}

for var_info in "${optional_vars[@]}"; do
    IFS=':' read -r var_name description <<< "$var_info"
    if check_env_var "$var_name" "$description" "false"; then
        ((optional_count++))
    fi
done

echo ""
print_message $BLUE "📁 配置文件检查"
echo ""

# 检查配置文件
check_file ".env.local" "本地环境变量文件"
check_file ".env.production" "生产环境变量文件"
check_file ".env.deployment" "部署环境变量文件"
check_file "env.example" "环境变量示例文件"

echo ""
print_message $BLUE "🌐 网络连接检查"
echo ""

# 检查网络连接
check_network "https://api.openai.com" "OpenAI API"
check_network "https://qutkgzkfaezk-demo.authing.cn" "Authing服务"
check_network "https://api.deepseek.com" "DeepSeek API"
check_network "https://generativelanguage.googleapis.com" "Google Gemini API"

echo ""
print_message $BLUE "🔧 项目配置检查"
echo ""

# 检查项目文件
check_file "package.json" "package.json文件"
check_file "vite.config.ts" "Vite配置文件"
check_file "src/config/apiConfig.ts" "API配置文件"
check_file "src/utils/apiConfigChecker.ts" "API配置检查工具"

echo ""
print_message $BLUE "📊 配置状态总结"
echo ""

# 计算配置完成度
required_percentage=$((required_count * 100 / total_required))
optional_percentage=$((optional_count * 100 / total_optional))

print_message $BLUE "必需配置完成度: $required_count/$total_required ($required_percentage%)"
print_message $BLUE "可选配置完成度: $optional_count/$total_optional ($optional_percentage%)"

echo ""
if [ $required_count -eq $total_required ]; then
    print_message $GREEN "🎉 所有必需配置已完成！"
    echo ""
    print_message $BLUE "📋 下一步操作："
    echo "1. 运行 'npm run dev' 启动开发服务器"
    echo "2. 访问 http://localhost:5173/api-config-test 验证配置"
    echo "3. 测试主要功能是否正常工作"
else
    print_message $RED "⚠️ 必需配置未完成，请先配置缺失的环境变量"
    echo ""
    print_message $BLUE "📋 配置建议："
    echo "1. 运行 './setup-deployment-config.sh' 进行快速配置"
    echo "2. 查看 DEPLOYMENT_API_CONFIG_GUIDE.md 获取详细说明"
    echo "3. 确保所有必需的环境变量都已设置"
fi

echo ""
print_message $BLUE "🔍 配置验证工具："
echo "- 访问 /api-config-test 页面进行详细配置验证"
echo "- 查看浏览器控制台获取调试信息"
echo "- 运行 './setup-deployment-config.sh' 进行快速配置"

echo ""
print_message $BLUE "📚 相关文档："
echo "- DEPLOYMENT_API_CONFIG_GUIDE.md - 详细配置指南"
echo "- API_KEYS_CONFIG.md - API密钥配置说明"
echo "- README.md - 项目说明文档" 
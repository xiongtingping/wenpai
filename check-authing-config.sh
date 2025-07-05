#!/bin/bash

# 🔐 Authing 配置检查脚本
# 作者: AI Assistant
# 日期: 2025-01-05

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_authing() {
    echo -e "${PURPLE}🔐 $1${NC}"
}

echo "🔐 Authing 配置检查"
echo "=================="
echo ""

# Authing 配置信息
AUTHING_APP_ID="6867fdc88034eb95ae86167d"
AUTHING_HOST="https://qutkgzkfaezk-demo.authing.cn"
AUTHING_REDIRECT_DEV="http://localhost:5173/callback"
AUTHING_REDIRECT_PROD="https://www.wenpai.xyz/callback"

log_authing "当前 Authing 配置信息："
echo "   🔑 App ID: $AUTHING_APP_ID"
echo "   🌐 Host: $AUTHING_HOST"
echo "   🔄 开发环境回调: $AUTHING_REDIRECT_DEV"
echo "   🔄 生产环境回调: $AUTHING_REDIRECT_PROD"
echo ""

# 检查环境变量配置
log_info "检查环境变量配置..."
if [ -f ".env" ]; then
    log_success "找到 .env 文件"
    echo "   📋 环境变量内容："
    
    # 检查 Authing 相关环境变量
    if grep -q "VITE_AUTHING_APP_ID" .env; then
        APP_ID_VALUE=$(grep "VITE_AUTHING_APP_ID" .env | cut -d'=' -f2)
        if [ "$APP_ID_VALUE" = "$AUTHING_APP_ID" ]; then
            log_success "VITE_AUTHING_APP_ID 配置正确: $APP_ID_VALUE"
        else
            log_warning "VITE_AUTHING_APP_ID 配置不匹配: $APP_ID_VALUE (期望: $AUTHING_APP_ID)"
        fi
    else
        log_error "未找到 VITE_AUTHING_APP_ID 配置"
    fi
    
    if grep -q "VITE_AUTHING_HOST" .env; then
        HOST_VALUE=$(grep "VITE_AUTHING_HOST" .env | cut -d'=' -f2)
        if [ "$HOST_VALUE" = "$AUTHING_HOST" ]; then
            log_success "VITE_AUTHING_HOST 配置正确: $HOST_VALUE"
        else
            log_warning "VITE_AUTHING_HOST 配置不匹配: $HOST_VALUE (期望: $AUTHING_HOST)"
        fi
    else
        log_error "未找到 VITE_AUTHING_HOST 配置"
    fi
    
    if grep -q "VITE_AUTHING_REDIRECT_URI" .env; then
        REDIRECT_VALUE=$(grep "VITE_AUTHING_REDIRECT_URI" .env | cut -d'=' -f2)
        log_info "VITE_AUTHING_REDIRECT_URI: $REDIRECT_VALUE"
    else
        log_warning "未找到 VITE_AUTHING_REDIRECT_URI 配置"
    fi
    
    if grep -q "VITE_AUTHING_REDIRECT_URI_PROD" .env; then
        REDIRECT_PROD_VALUE=$(grep "VITE_AUTHING_REDIRECT_URI_PROD" .env | cut -d'=' -f2)
        if [ "$REDIRECT_PROD_VALUE" = "$AUTHING_REDIRECT_PROD" ]; then
            log_success "VITE_AUTHING_REDIRECT_URI_PROD 配置正确: $REDIRECT_PROD_VALUE"
        else
            log_warning "VITE_AUTHING_REDIRECT_URI_PROD 配置不匹配: $REDIRECT_PROD_VALUE (期望: $AUTHING_REDIRECT_PROD)"
        fi
    else
        log_error "未找到 VITE_AUTHING_REDIRECT_URI_PROD 配置"
    fi
else
    log_error "未找到 .env 文件"
fi

echo ""

# 检查 Authing 相关文件
log_info "检查 Authing 相关文件..."

# 检查 useAuthing Hook
if [ -f "src/hooks/useAuthing.ts" ]; then
    log_success "找到 useAuthing Hook: src/hooks/useAuthing.ts"
    
    # 检查 App ID 配置
    if grep -q "$AUTHING_APP_ID" src/hooks/useAuthing.ts; then
        log_success "useAuthing Hook 中的 App ID 配置正确"
    else
        log_warning "useAuthing Hook 中的 App ID 配置可能不正确"
    fi
    
    # 检查 Host 配置
    if grep -q "$AUTHING_HOST" src/hooks/useAuthing.ts; then
        log_success "useAuthing Hook 中的 Host 配置正确"
    else
        log_warning "useAuthing Hook 中的 Host 配置可能不正确"
    fi
else
    log_error "未找到 useAuthing Hook 文件"
fi

# 检查 AuthingLoginPage
if [ -f "src/pages/AuthingLoginPage.tsx" ]; then
    log_success "找到 Authing 登录页面: src/pages/AuthingLoginPage.tsx"
else
    log_error "未找到 Authing 登录页面文件"
fi

# 检查 Callback 页面
if [ -f "src/pages/Callback.tsx" ]; then
    log_success "找到 Authing 回调页面: src/pages/Callback.tsx"
else
    log_error "未找到 Authing 回调页面文件"
fi

# 检查 AuthGuard 组件
if [ -f "src/components/AuthGuard.tsx" ]; then
    log_success "找到 AuthGuard 组件: src/components/AuthGuard.tsx"
else
    log_error "未找到 AuthGuard 组件文件"
fi

# 检查 UserAvatar 组件
if [ -f "src/components/UserAvatar.tsx" ]; then
    log_success "找到 UserAvatar 组件: src/components/UserAvatar.tsx"
else
    log_error "未找到 UserAvatar 组件文件"
fi

echo ""

# 检查路由配置
log_info "检查路由配置..."
if [ -f "src/App.tsx" ]; then
    log_success "找到主应用文件: src/App.tsx"
    
    # 检查 Authing 相关路由
    if grep -q "authing-login" src/App.tsx; then
        log_success "Authing 登录路由配置正确"
    else
        log_warning "未找到 Authing 登录路由配置"
    fi
    
    if grep -q "callback" src/App.tsx; then
        log_success "Authing 回调路由配置正确"
    else
        log_warning "未找到 Authing 回调路由配置"
    fi
    
    if grep -q "auth-test" src/App.tsx; then
        log_success "Authing 测试路由配置正确"
    else
        log_warning "未找到 Authing 测试路由配置"
    fi
else
    log_error "未找到主应用文件"
fi

echo ""

# 检查依赖包
log_info "检查 Authing 依赖包..."
if [ -f "package.json" ]; then
    if grep -q "@authing/guard-react" package.json; then
        log_success "找到 @authing/guard-react 依赖"
    else
        log_error "未找到 @authing/guard-react 依赖"
    fi
    
    if grep -q "@authing/authing-js-sdk" package.json; then
        log_success "找到 @authing/authing-js-sdk 依赖"
    else
        log_warning "未找到 @authing/authing-js-sdk 依赖"
    fi
else
    log_error "未找到 package.json 文件"
fi

echo ""

# 检查 Authing 控制台配置
log_authing "Authing 控制台配置检查："
echo ""
echo "请访问 Authing 控制台检查以下配置："
echo "   🔗 控制台地址: https://console.authing.cn/"
echo "   🔑 应用 ID: $AUTHING_APP_ID"
echo "   🌐 应用域名: $AUTHING_HOST"
echo ""
echo "📋 需要配置的回调地址："
echo "   🔄 登录回调 URL: $AUTHING_REDIRECT_PROD"
echo "   🚪 登出回调 URL: https://www.wenpai.xyz"
echo ""

# 检查网络连接
log_info "检查 Authing 服务连接..."
if command -v curl &> /dev/null; then
    if curl -s -o /dev/null -w "%{http_code}" "$AUTHING_HOST" | grep -q "200\|301\|302"; then
        log_success "Authing 服务连接正常"
    else
        log_warning "Authing 服务连接异常"
    fi
else
    log_warning "curl 命令不可用，无法检查网络连接"
fi

echo ""

# 显示测试步骤
log_info "Authing 功能测试步骤："
echo ""
echo "1. 🧪 本地测试："
echo "   - 启动开发服务器: npm run dev"
echo "   - 访问: http://localhost:5173/authing-login"
echo "   - 测试登录功能"
echo ""
echo "2. 🌐 生产环境测试："
echo "   - 部署到 Netlify"
echo "   - 配置 DNS 记录"
echo "   - 访问: https://www.wenpai.xyz/authing-login"
echo "   - 测试登录功能"
echo ""
echo "3. 🔍 调试信息："
echo "   - 查看浏览器控制台"
echo "   - 检查网络请求"
echo "   - 验证回调地址"
echo ""

# 显示常见问题
log_info "常见 Authing 配置问题："
echo ""
echo "❌ 登录失败："
echo "   - 检查回调地址配置"
echo "   - 确认域名使用 HTTPS"
echo "   - 验证 App ID 和 Host"
echo ""
echo "❌ 回调错误："
echo "   - 检查回调 URL 格式"
echo "   - 确认路由配置正确"
echo "   - 验证环境变量设置"
echo ""
echo "❌ 组件加载失败："
echo "   - 检查依赖包安装"
echo "   - 确认导入语句正确"
echo "   - 验证 TypeScript 类型"
echo ""

log_success "Authing 配置检查完成！"
echo ""
echo "💡 建议："
echo "- 完成 DNS 配置后，立即更新 Authing 回调地址"
echo "- 使用浏览器开发者工具调试登录流程"
echo "- 定期检查 Authing 控制台的应用状态"
echo "" 
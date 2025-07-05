#!/bin/bash

# 🔍 文派AI内容适配器 - 部署状态检查脚本
# 作者: AI Assistant
# 日期: 2025-01-05

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

echo "🔍 文派AI内容适配器 - 部署状态检查"
echo "=================================="
echo ""

# 检查项目构建状态
log_info "检查项目构建状态..."
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    log_success "构建文件存在且不为空"
    echo "   📁 构建文件数量: $(find dist -type f | wc -l)"
    echo "   📄 主要文件:"
    ls -la dist/ | head -10
else
    log_error "构建文件不存在或为空"
fi

echo ""

# 检查 Git 状态
log_info "检查 Git 状态..."
if [ -d ".git" ]; then
    log_success "Git 仓库正常"
    
    # 检查远程仓库
    if git remote get-url origin &> /dev/null; then
        REMOTE_URL=$(git remote get-url origin)
        log_success "远程仓库: $REMOTE_URL"
    else
        log_error "未配置远程仓库"
    fi
    
    # 检查分支
    CURRENT_BRANCH=$(git branch --show-current)
    log_info "当前分支: $CURRENT_BRANCH"
    
    # 检查未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "有未提交的更改"
        git status --short
    else
        log_success "所有更改已提交"
    fi
else
    log_error "不是 Git 仓库"
fi

echo ""

# 检查环境变量配置
log_info "检查环境变量配置..."
if [ -f ".env" ]; then
    log_success "找到 .env 文件"
    echo "   📋 环境变量:"
    grep -E "VITE_" .env | while read line; do
        echo "   $line"
    done
else
    log_warning "未找到 .env 文件"
fi

echo ""

# 检查 Authing 配置
log_info "检查 Authing 配置..."
AUTHING_APP_ID="6867fdc88034eb95ae86167d"
AUTHING_HOST="https://qutkgzkfaezk-demo.authing.cn"
AUTHING_REDIRECT="https://www.wenpai.xyz/callback"

echo "   🔑 App ID: $AUTHING_APP_ID"
echo "   🌐 Host: $AUTHING_HOST"
echo "   🔄 Redirect: $AUTHING_REDIRECT"

echo ""

# 检查域名配置
log_info "检查域名配置..."
DOMAIN="www.wenpai.xyz"

echo "   🌍 目标域名: $DOMAIN"
echo "   📍 Namecheap DNS: https://ap.www.namecheap.com/domains/domaincontrolpanel/wenpai.xyz/advancedns"

# 尝试解析域名
if command -v nslookup &> /dev/null; then
    log_info "检查域名解析..."
    if nslookup $DOMAIN &> /dev/null; then
        log_success "域名解析正常"
    else
        log_warning "域名解析失败或未配置"
    fi
fi

echo ""

# 显示部署链接
log_info "部署相关链接:"
echo "   🌐 Netlify: https://app.netlify.com/"
echo "   🔐 Authing: https://console.authing.cn/"
echo "   📚 GitHub: https://github.com/xiongtingping/wenpaiai626"
echo "   📖 部署指南: NAMECHEAP_DNS_SETUP.md"

echo ""

# 显示下一步操作
log_info "下一步操作建议:"
echo "1. 访问 Netlify 并导入 GitHub 仓库"
echo "2. 配置环境变量"
echo "3. 部署应用"
echo "4. 配置 Namecheap DNS 记录"
echo "5. 配置 Authing 回调地址"
echo "6. 测试功能"

echo ""
log_success "检查完成！" 
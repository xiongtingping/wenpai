#!/bin/bash

# 🚀 文派AI内容适配器 - 自动化部署脚本
# 作者: AI Assistant
# 日期: 2025-01-05

set -e  # 遇到错误立即退出

echo "🎯 开始文派AI内容适配器部署流程..."
echo "=================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
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

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        log_error "Git 未安装，请先安装 Git"
        exit 1
    fi
    
    log_success "所有依赖检查通过"
}

# 检查项目状态
check_project_status() {
    log_info "检查项目状态..."
    
    if [ ! -f "package.json" ]; then
        log_error "未找到 package.json，请确保在项目根目录运行此脚本"
        exit 1
    fi
    
    if [ ! -d "node_modules" ]; then
        log_warning "node_modules 不存在，正在安装依赖..."
        npm install
    fi
    
    log_success "项目状态检查完成"
}

# 构建项目
build_project() {
    log_info "开始构建项目..."
    
    # 清理之前的构建
    if [ -d "dist" ]; then
        rm -rf dist
        log_info "清理旧的构建文件"
    fi
    
    # 构建项目
    npm run build
    
    if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
        log_success "项目构建成功"
    else
        log_error "项目构建失败"
        exit 1
    fi
}

# 检查 Git 状态
check_git_status() {
    log_info "检查 Git 状态..."
    
    if [ ! -d ".git" ]; then
        log_error "当前目录不是 Git 仓库"
        exit 1
    fi
    
    # 检查是否有未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "发现未提交的更改，正在提交..."
        git add .
        git commit -m "🚀 自动部署更新 - $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    log_success "Git 状态检查完成"
}

# 推送到 GitHub
push_to_github() {
    log_info "推送到 GitHub..."
    
    # 检查远程仓库
    if ! git remote get-url origin &> /dev/null; then
        log_error "未配置远程仓库，请先添加 GitHub 仓库"
        exit 1
    fi
    
    # 推送到远程仓库
    git push origin main
    
    log_success "代码已推送到 GitHub"
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "🎉 部署准备完成！"
    echo "=================================="
    echo ""
    echo "📋 下一步操作："
    echo ""
    echo "1. 🌐 Netlify 部署："
    echo "   - 访问: https://app.netlify.com/"
    echo "   - 点击 'Add new site' → 'Import an existing project'"
    echo "   - 选择 GitHub 仓库: xiongtingping/wenpaiai626"
    echo "   - 分支: main"
    echo "   - 构建命令: npm run build"
    echo "   - 发布目录: dist"
    echo ""
    echo "2. ⚙️  环境变量配置："
    echo "   VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d"
    echo "   VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn"
    echo "   VITE_AUTHING_REDIRECT_URI_PROD=https://www.wenpai.xyz/callback"
    echo ""
    echo "3. 🌍 DNS 配置："
    echo "   - 访问: https://ap.www.namecheap.com/domains/domaincontrolpanel/wenpai.xyz/advancedns"
    echo "   - 按照 NAMECHEAP_DNS_SETUP.md 中的说明配置 DNS 记录"
    echo ""
    echo "4. 🔐 Authing 配置："
    echo "   - 访问: https://console.authing.cn/"
    echo "   - 配置回调地址: https://www.wenpai.xyz/callback"
    echo ""
    echo "📖 详细指南请查看: NAMECHEAP_DNS_SETUP.md"
    echo ""
}

# 主函数
main() {
    echo "🚀 文派AI内容适配器 - 自动化部署脚本"
    echo "=================================="
    echo ""
    
    # 检查是否在正确的目录
    if [ ! -f "package.json" ]; then
        log_error "请在项目根目录运行此脚本"
        log_info "当前目录: $(pwd)"
        log_info "请切换到: /Users/xiong/AI Content Adapter/wenpaiai626"
        exit 1
    fi
    
    # 执行部署步骤
    check_dependencies
    check_project_status
    build_project
    check_git_status
    push_to_github
    show_deployment_info
    
    log_success "部署脚本执行完成！"
}

# 运行主函数
main "$@" 
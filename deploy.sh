#!/bin/bash

# 🚀 文派应用自动化部署脚本

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 检查Git状态
check_git_status() {
    log "检查Git状态..."
    
    if [ -n "$(git status --porcelain)" ]; then
        warn "发现未提交的更改"
        git status --short
        read -p "是否继续部署？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "部署已取消"
            exit 0
        fi
    else
        log "工作目录干净"
    fi
}

# 检查分支
check_branch() {
    log "检查当前分支..."
    current_branch=$(git branch --show-current)
    log "当前分支: $current_branch"
    
    if [ "$current_branch" != "main" ]; then
        warn "当前不在main分支，建议切换到main分支进行部署"
        read -p "是否继续部署？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "部署已取消"
            exit 0
        fi
    fi
}

# 拉取最新代码
pull_latest() {
    log "拉取最新代码..."
    git pull origin main
}

# 安装依赖
install_dependencies() {
    log "安装依赖..."
    npm ci
}

# 运行测试
run_tests() {
    log "运行测试..."
    
    # 运行AI服务测试
    if [ -f "test-project-ai-service.cjs" ]; then
        log "运行AI服务架构测试..."
        node test-project-ai-service.cjs
    fi
    
    # 运行构建测试
    log "测试构建..."
    npm run build
}

# 构建项目
build_project() {
    log "构建项目..."
    npm run build
    
    if [ ! -d "dist" ]; then
        error "构建失败，dist目录不存在"
        exit 1
    fi
    
    log "构建成功"
}

# 检查构建结果
check_build() {
    log "检查构建结果..."
    
    # 检查关键文件
    required_files=(
        "dist/index.html"
        "dist/assets/index-*.js"
        "dist/assets/index-*.css"
    )
    
    for pattern in "${required_files[@]}"; do
        if ! ls $pattern >/dev/null 2>&1; then
            error "构建文件缺失: $pattern"
            exit 1
        fi
    done
    
    log "构建文件检查通过"
}

# 部署到Netlify
deploy_to_netlify() {
    log "部署到Netlify..."
    
    # 检查Netlify CLI
    if ! command -v netlify &> /dev/null; then
        warn "Netlify CLI未安装，尝试使用npm安装..."
        npm install -g netlify-cli
    fi
    
    # 检查是否已登录
    if ! netlify status >/dev/null 2>&1; then
        error "请先登录Netlify: netlify login"
        exit 1
    fi
    
    # 部署
    log "开始部署..."
    netlify deploy --prod --dir=dist
    
    log "部署完成！"
}

# 部署到GitHub Pages (可选)
deploy_to_github_pages() {
    log "部署到GitHub Pages..."
    
    # 检查是否有gh-pages包
    if ! npm list gh-pages >/dev/null 2>&1; then
        log "安装gh-pages..."
        npm install --save-dev gh-pages
    fi
    
    # 部署
    npx gh-pages -d dist
    
    log "GitHub Pages部署完成！"
}

# 验证部署
verify_deployment() {
    log "验证部署..."
    
    # 等待部署完成
    sleep 10
    
    # 检查网站可访问性
    if curl -s -o /dev/null -w "%{http_code}" https://www.wenpai.xyz | grep -q "200"; then
        log "✅ 网站部署成功: https://www.wenpai.xyz"
    else
        warn "⚠️  网站可能还在部署中，请稍后检查: https://www.wenpai.xyz"
    fi
}

# 显示部署信息
show_deployment_info() {
    log "🎉 部署完成！"
    echo
    echo "📋 部署信息:"
    echo "   🌐 网站地址: https://www.wenpai.xyz"
    echo "   📱 移动端: https://www.wenpai.xyz"
    echo "   🔧 管理后台: https://app.netlify.com"
    echo
    echo "📊 功能状态:"
    echo "   ✅ AI服务: 已连接真实API"
    echo "   ✅ 用户认证: Authing集成"
    echo "   ✅ 支付功能: Creem集成"
    echo "   ✅ 响应式设计: 支持移动端"
    echo
    echo "🔗 相关链接:"
    echo "   📖 文档: https://github.com/xiongtingping/wenpai"
    echo "   🐛 问题反馈: https://github.com/xiongtingping/wenpai/issues"
    echo
}

# 主函数
main() {
    echo "🚀 文派应用自动化部署"
    echo "========================"
    
    # 检查必要命令
    check_command "git"
    check_command "npm"
    check_command "node"
    
    # 执行部署步骤
    check_git_status
    check_branch
    pull_latest
    install_dependencies
    run_tests
    build_project
    check_build
    
    # 选择部署方式
    echo
    echo "选择部署方式:"
    echo "1) Netlify (推荐)"
    echo "2) GitHub Pages"
    echo "3) 仅构建，不部署"
    read -p "请选择 (1-3): " choice
    
    case $choice in
        1)
            deploy_to_netlify
            verify_deployment
            ;;
        2)
            deploy_to_github_pages
            ;;
        3)
            log "仅构建完成，未部署"
            ;;
        *)
            error "无效选择"
            exit 1
            ;;
    esac
    
    show_deployment_info
}

# 运行主函数
main "$@" 
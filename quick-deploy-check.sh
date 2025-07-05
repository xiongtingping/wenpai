#!/bin/bash

# 🚀 快速部署检查脚本
# 用于验证 Netlify 部署状态和 DNS 配置

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

log_step() {
    echo -e "${PURPLE}📋 $1${NC}"
}

echo "🔍 快速部署检查"
echo "================"
echo ""

# 检查项目构建状态
log_step "1. 检查项目构建状态"
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    log_success "项目已构建，dist 目录存在"
    echo "   📁 构建文件数量: $(find dist -type f | wc -l)"
    echo "   📄 主页面: dist/index.html"
else
    log_error "项目未构建，请先运行: npm run build"
    exit 1
fi

# 检查 Netlify 配置
log_step "2. 检查 Netlify 配置"
if [ -f "netlify.toml" ]; then
    log_success "Netlify 配置文件存在"
    echo "   📄 配置文件: netlify.toml"
else
    log_warning "未找到 netlify.toml 配置文件"
fi

# 检查 Netlify 函数
log_step "3. 检查 Netlify 函数"
if [ -d "netlify/functions" ]; then
    log_success "Netlify 函数目录存在"
    echo "   📁 函数文件: $(ls netlify/functions/ | wc -l) 个"
else
    log_warning "未找到 Netlify 函数目录"
fi

# 检查 Git 状态
log_step "4. 检查 Git 状态"
if [ -d ".git" ]; then
    log_success "Git 仓库已初始化"
    
    # 检查远程仓库
    if git remote get-url origin > /dev/null 2>&1; then
        REMOTE_URL=$(git remote get-url origin)
        log_success "远程仓库已配置: $REMOTE_URL"
    else
        log_warning "未配置远程仓库"
    fi
    
    # 检查当前分支
    CURRENT_BRANCH=$(git branch --show-current)
    log_info "当前分支: $CURRENT_BRANCH"
    
    # 检查未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "有未提交的更改"
        echo "   建议先提交更改: git add . && git commit -m '准备部署'"
    else
        log_success "所有更改已提交"
    fi
else
    log_error "未找到 Git 仓库"
fi

echo ""
log_step "5. 部署准备检查"
echo ""

# 检查 Node.js 版本
NODE_VERSION=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    log_success "Node.js 版本: $NODE_VERSION"
    # 检查版本是否满足要求
    if [[ "$NODE_VERSION" =~ v18 ]]; then
        log_success "Node.js 版本满足要求 (18.x)"
    else
        log_warning "建议使用 Node.js 18.x 版本"
    fi
else
    log_error "未安装 Node.js"
fi

# 检查 npm 包
if [ -f "package.json" ]; then
    log_success "package.json 存在"
    if [ -d "node_modules" ]; then
        log_success "依赖已安装"
    else
        log_warning "依赖未安装，请运行: npm install"
    fi
fi

echo ""
log_step "6. 部署链接"
echo ""
echo "🌐 Netlify 部署链接:"
echo "   https://app.netlify.com/"
echo ""
echo "🔗 GitHub 仓库:"
echo "   https://github.com/xiongtingping/wenpaiai626"
echo ""
echo "🌍 目标域名:"
echo "   https://www.wenpai.xyz"
echo ""

log_step "7. 下一步操作"
echo ""
echo "1. 访问 https://app.netlify.com/"
echo "2. 点击 'New site from Git'"
echo "3. 选择 GitHub 仓库: xiongtingping/wenpaiai626"
echo "4. 选择分支: $CURRENT_BRANCH"
echo "5. 配置构建设置:"
echo "   - Build command: npm run build"
echo "   - Publish directory: dist"
echo "6. 点击 'Deploy site'"
echo ""

log_success "检查完成！项目已准备好部署到 Netlify"
echo ""
echo "📚 详细部署指南请查看: NETLIFY_DEPLOYMENT_GUIDE.md" 
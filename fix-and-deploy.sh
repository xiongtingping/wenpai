#!/bin/bash

# 修复package.json并重新部署

set -e

echo "�� 修复package.json格式错误..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 验证package.json格式
validate_package_json() {
    log_info "验证package.json格式..."
    
    if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
        log_success "package.json格式正确"
        return 0
    else
        log_error "package.json格式错误"
        return 1
    fi
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    # 清理之前的构建
    if [ -d "dist" ]; then
        rm -rf dist
        log_info "清理旧的构建文件"
    fi
    
    # 安装依赖
    log_info "安装依赖..."
    npm ci --production=false
    
    # 构建项目
    log_info "开始构建..."
    npm run build 
#!/bin/bash

# 🔍 自动化系统检查脚本
# 用途: 执行全面的项目健康检查
# 作者: Augment Agent
# 日期: 2025-08-03

set -e

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

log_header() {
    echo -e "\n${BLUE}🔍 $1${NC}"
    echo "----------------------------------------"
}

# 检查结果统计
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# 更新统计
update_stats() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    case $1 in
        "pass") PASSED_CHECKS=$((PASSED_CHECKS + 1)) ;;
        "fail") FAILED_CHECKS=$((FAILED_CHECKS + 1)) ;;
        "warn") WARNING_CHECKS=$((WARNING_CHECKS + 1)) ;;
    esac
}

# 检查开发服务器状态
check_dev_server() {
    log_header "检查开发服务器状态"
    
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        log_success "开发服务器运行正常 (http://localhost:5173)"
        update_stats "pass"
    else
        log_warning "开发服务器未运行，尝试启动..."
        update_stats "warn"
        
        # 尝试启动开发服务器
        if command -v npm > /dev/null 2>&1; then
            log_info "启动开发服务器..."
            npm run dev > /dev/null 2>&1 &
            sleep 5
            
            if curl -s http://localhost:5173 > /dev/null 2>&1; then
                log_success "开发服务器启动成功"
                update_stats "pass"
            else
                log_error "开发服务器启动失败"
                update_stats "fail"
            fi
        else
            log_error "npm 命令不可用"
            update_stats "fail"
        fi
    fi
}

# 检查依赖安装
check_dependencies() {
    log_header "检查项目依赖"
    
    if [ -f "package.json" ]; then
        log_success "package.json 存在"
        update_stats "pass"
        
        if [ -d "node_modules" ]; then
            log_success "node_modules 目录存在"
            update_stats "pass"
        else
            log_warning "node_modules 不存在，需要安装依赖"
            update_stats "warn"
            
            if command -v npm > /dev/null 2>&1; then
                log_info "正在安装依赖..."
                npm install
                log_success "依赖安装完成"
                update_stats "pass"
            else
                log_error "npm 命令不可用"
                update_stats "fail"
            fi
        fi
    else
        log_error "package.json 不存在"
        update_stats "fail"
    fi
}

# 检查环境配置
check_environment() {
    log_header "检查环境配置"
    
    if [ -f ".env" ]; then
        log_success ".env 文件存在"
        update_stats "pass"
        
        # 检查关键环境变量
        if grep -q "VITE_AUTHING_APP_ID" .env; then
            log_success "Authing 配置存在"
            update_stats "pass"
        else
            log_warning "Authing 配置缺失"
            update_stats "warn"
        fi
        
        if grep -q "VITE_OPENAI_API_KEY" .env; then
            log_info "OpenAI API 配置存在"
            update_stats "pass"
        else
            log_warning "OpenAI API 配置缺失"
            update_stats "warn"
        fi
    else
        log_warning ".env 文件不存在"
        update_stats "warn"
        
        if [ -f "env.example" ]; then
            log_info "发现 env.example，建议复制为 .env"
            cp env.example .env
            log_success "已创建 .env 文件"
            update_stats "pass"
        fi
    fi
}

# 执行类型检查
check_typescript() {
    log_header "执行 TypeScript 类型检查"
    
    if command -v npm > /dev/null 2>&1; then
        if npm run type-check > typescript-check.log 2>&1; then
            log_success "TypeScript 类型检查通过"
            update_stats "pass"
        else
            ERROR_COUNT=$(grep -c "error TS" typescript-check.log 2>/dev/null || echo "0")
            log_error "TypeScript 类型检查失败 ($ERROR_COUNT 个错误)"
            log_info "详细错误信息已保存到 typescript-check.log"
            update_stats "fail"
        fi
    else
        log_error "npm 命令不可用"
        update_stats "fail"
    fi
}

# 执行构建测试
check_build() {
    log_header "执行构建测试"
    
    if command -v npm > /dev/null 2>&1; then
        if npm run build > build-check.log 2>&1; then
            log_success "项目构建成功"
            update_stats "pass"
        else
            log_error "项目构建失败"
            log_info "详细错误信息已保存到 build-check.log"
            update_stats "fail"
        fi
    else
        log_error "npm 命令不可用"
        update_stats "fail"
    fi
}

# 执行代码质量检查
check_linting() {
    log_header "执行代码质量检查"
    
    if command -v npm > /dev/null 2>&1; then
        if npm run lint > lint-check.log 2>&1; then
            log_success "代码质量检查通过"
            update_stats "pass"
        else
            WARNING_COUNT=$(grep -c "warning" lint-check.log 2>/dev/null || echo "0")
            ERROR_COUNT=$(grep -c "error" lint-check.log 2>/dev/null || echo "0")
            
            if [ "$ERROR_COUNT" -gt 0 ]; then
                log_error "代码质量检查失败 ($ERROR_COUNT 个错误, $WARNING_COUNT 个警告)"
                update_stats "fail"
            else
                log_warning "代码质量检查有警告 ($WARNING_COUNT 个警告)"
                update_stats "warn"
            fi
            
            log_info "详细信息已保存到 lint-check.log"
        fi
    else
        log_error "npm 命令不可用"
        update_stats "fail"
    fi
}

# 检查网络连接
check_network() {
    log_header "检查网络连接"
    
    # 检查基本网络连接
    if ping -c 1 google.com > /dev/null 2>&1; then
        log_success "基本网络连接正常"
        update_stats "pass"
    else
        log_error "网络连接异常"
        update_stats "fail"
        return
    fi
    
    # 检查 Authing 域名
    if curl -s --max-time 5 https://rzcswqd4sq0f.authing.cn > /dev/null 2>&1; then
        log_success "Authing 域名可访问"
        update_stats "pass"
    else
        log_warning "Authing 域名访问异常"
        update_stats "warn"
    fi
}

# 生成检查报告
generate_report() {
    log_header "生成检查报告"
    
    REPORT_FILE="system-check-$(date +%Y%m%d-%H%M%S).log"
    
    {
        echo "🔍 自动化系统检查报告"
        echo "检查时间: $(date)"
        echo "========================================"
        echo ""
        echo "📊 检查统计:"
        echo "总检查项: $TOTAL_CHECKS"
        echo "通过: $PASSED_CHECKS"
        echo "失败: $FAILED_CHECKS"
        echo "警告: $WARNING_CHECKS"
        echo ""
        echo "成功率: $(( PASSED_CHECKS * 100 / TOTAL_CHECKS ))%"
        echo ""
        
        if [ $FAILED_CHECKS -gt 0 ]; then
            echo "❌ 系统状态: 需要修复"
            echo "建议: 请查看详细日志文件并修复失败的检查项"
        elif [ $WARNING_CHECKS -gt 0 ]; then
            echo "⚠️  系统状态: 基本正常，有警告"
            echo "建议: 建议修复警告项以提升系统稳定性"
        else
            echo "✅ 系统状态: 良好"
            echo "建议: 系统运行正常，继续保持"
        fi
    } > "$REPORT_FILE"
    
    log_success "检查报告已生成: $REPORT_FILE"
    cat "$REPORT_FILE"
}

# 主函数
main() {
    echo -e "${BLUE}"
    echo "🚀 自动化系统检查工具"
    echo "========================================"
    echo -e "${NC}"
    
    check_dependencies
    check_environment
    check_dev_server
    check_typescript
    check_build
    check_linting
    check_network
    
    echo ""
    generate_report
    
    # 返回适当的退出码
    if [ $FAILED_CHECKS -gt 0 ]; then
        exit 1
    elif [ $WARNING_CHECKS -gt 0 ]; then
        exit 2
    else
        exit 0
    fi
}

# 执行主函数
main "$@"

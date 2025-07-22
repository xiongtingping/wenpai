#!/bin/bash

# 🔍 部署状态检查脚本
# ✅ FIXED: 2024-07-22 部署配置验证
# 📌 请勿再修改该脚本，已封装稳定。如需改动请单独重构新模块。
# 🔒 LOCKED: AI 禁止对此脚本做任何修改

set -e

echo "🔍 开始检查部署状态..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1 (缺失)"
        return 1
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1 (缺失)"
        return 1
    fi
}

check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1 (未安装)"
        return 1
    fi
}

echo -e "\n${BLUE}📋 1. 基础环境检查${NC}"
check_command "node"
check_command "npm"
check_command "git"

echo -e "\n${BLUE}📋 2. 项目配置文件检查${NC}"
check_file "package.json"
check_file "tsconfig.json"
check_file "tsconfig.app.json"
check_file "tsconfig.node.json"
check_file "vite.config.ts"
check_file "netlify.toml"

echo -e "\n${BLUE}📋 3. 源代码目录检查${NC}"
check_directory "src"
check_file "src/main.tsx"
check_file "src/App.tsx"
check_directory "src/components"
check_directory "src/pages"
check_directory "src/api"

echo -e "\n${BLUE}📋 4. Netlify 函数检查${NC}"
check_directory "netlify/functions"
check_file "netlify/functions/api.cjs"

echo -e "\n${BLUE}📋 5. 构建输出检查${NC}"
if [ -d "dist" ]; then
    echo -e "${GREEN}✅${NC} dist 目录存在"
    check_file "dist/index.html"
    check_directory "dist/assets"
    
    if [ -d "dist/assets" ]; then
        echo -e "${BLUE}   📊 构建文件统计:${NC}"
        ls -la dist/assets/ | head -10
    fi
else
    echo -e "${YELLOW}⚠️${NC} dist 目录不存在，需要先构建"
fi

echo -e "\n${BLUE}📋 6. 环境变量检查${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅${NC} .env 文件存在"
else
    echo -e "${YELLOW}⚠️${NC} .env 文件不存在（可能使用 Netlify 环境变量）"
fi

echo -e "\n${BLUE}📋 7. 依赖检查${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅${NC} node_modules 存在"
else
    echo -e "${YELLOW}⚠️${NC} node_modules 不存在，需要运行 npm install"
fi

echo -e "\n${BLUE}📋 8. TypeScript 配置检查${NC}"
if npx tsc --noEmit &> /dev/null; then
    echo -e "${GREEN}✅${NC} TypeScript 配置正确"
else
    echo -e "${RED}❌${NC} TypeScript 配置有误"
fi

echo -e "\n${BLUE}📋 9. 构建测试${NC}"
if npm run build &> /dev/null; then
    echo -e "${GREEN}✅${NC} 构建成功"
else
    echo -e "${RED}❌${NC} 构建失败"
fi

echo -e "\n${BLUE}📋 10. 部署准备状态${NC}"
if [ -f "dist/index.html" ] && [ -d "dist/assets" ]; then
    echo -e "${GREEN}✅${NC} 部署文件准备就绪"
    echo -e "${BLUE}   📁 部署目录: dist/"
    echo -e "${BLUE}   📊 部署大小: $(du -sh dist/ | cut -f1)"
else
    echo -e "${RED}❌${NC} 部署文件不完整"
fi

echo -e "\n${GREEN}🎉 部署状态检查完成！${NC}"
echo -e "${BLUE}📝 如果所有检查都通过，可以安全地推送到 Git 仓库进行自动部署${NC}" 
#!/bin/bash

# 🛡️ undefined拼接安全检查脚本
# 用于CI/CD流程中的自动化检测

set -e

echo "🔍 开始undefined拼接安全检查..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查结果统计
TOTAL_ISSUES=0
CRITICAL_ISSUES=0
HIGH_ISSUES=0
MEDIUM_ISSUES=0

# 1. 运行高级检测器
echo -e "${BLUE}📊 运行代码扫描...${NC}"
if node tools/advanced-undefined-detector.js > scan-results.txt 2>&1; then
    echo -e "${GREEN}✅ 代码扫描完成${NC}"
else
    echo -e "${RED}❌ 代码扫描发现问题${NC}"
    SCAN_EXIT_CODE=$?
fi

# 解析扫描结果
if [ -f "undefined-concat-report.json" ]; then
    TOTAL_ISSUES=$(jq '.stats.issuesFound' undefined-concat-report.json)
    CRITICAL_ISSUES=$(jq '.stats.criticalIssues' undefined-concat-report.json)
    HIGH_ISSUES=$(jq '.stats.highIssues' undefined-concat-report.json)
    MEDIUM_ISSUES=$(jq '.stats.mediumIssues' undefined-concat-report.json)
    
    echo -e "${BLUE}📋 扫描统计:${NC}"
    echo -e "   总问题数: ${TOTAL_ISSUES}"
    echo -e "   🔴 严重: ${CRITICAL_ISSUES}"
    echo -e "   🟠 高危: ${HIGH_ISSUES}"
    echo -e "   🟡 中等: ${MEDIUM_ISSUES}"
fi

# 2. 检查ESLint规则
echo -e "\n${BLUE}🔧 检查ESLint配置...${NC}"
if [ -f ".eslintrc.undefined-protection.js" ]; then
    echo -e "${GREEN}✅ undefined防护ESLint配置存在${NC}"
else
    echo -e "${YELLOW}⚠️  建议使用undefined防护ESLint配置${NC}"
fi

# 3. 检查TypeScript严格配置
echo -e "\n${BLUE}📝 检查TypeScript配置...${NC}"
if grep -q '"strictNullChecks": true' tsconfig.json; then
    echo -e "${GREEN}✅ TypeScript严格null检查已启用${NC}"
else
    echo -e "${YELLOW}⚠️  建议启用TypeScript严格null检查${NC}"
fi

# 4. 检查安全工具函数的使用
echo -e "\n${BLUE}🛠️  检查安全工具函数使用情况...${NC}"

# 统计安全函数使用次数
SAFE_FUNCTION_USAGE=0
UNSAFE_PATTERNS=0

# 检查getUserDisplayName使用
GETUSERDISPLAYNAME_COUNT=$(grep -r "getUserDisplayName" src/ --include="*.tsx" --include="*.ts" | wc -l)
echo -e "   getUserDisplayName 使用次数: ${GETUSERDISPLAYNAME_COUNT}"
SAFE_FUNCTION_USAGE=$((SAFE_FUNCTION_USAGE + GETUSERDISPLAYNAME_COUNT))

# 检查危险模式
DANGEROUS_OR_PATTERN=$(grep -r "user\?\.\w\+\s*||\s*user\?\.\w\+" src/ --include="*.tsx" --include="*.ts" | grep -v "userDisplayUtils" | grep -v "eslint-undefined-concat-rules" | wc -l)
echo -e "   危险的逻辑或模式: ${DANGEROUS_OR_PATTERN}"
UNSAFE_PATTERNS=$((UNSAFE_PATTERNS + DANGEROUS_OR_PATTERN))

TEMPLATE_STRING_PATTERN=$(grep -r '\${[^}]*user\?\.\w\+[^}]*}' src/ --include="*.tsx" --include="*.ts" | grep -v "safeTemplate" | wc -l)
echo -e "   不安全的模板字符串: ${TEMPLATE_STRING_PATTERN}"
UNSAFE_PATTERNS=$((UNSAFE_PATTERNS + TEMPLATE_STRING_PATTERN))

# 5. 检查运行时检测器
echo -e "\n${BLUE}🔍 检查运行时检测器...${NC}"
if grep -q "advancedUndefinedDetector" src/main.tsx; then
    echo -e "${GREEN}✅ 运行时检测器已启用${NC}"
else
    echo -e "${YELLOW}⚠️  建议启用运行时检测器${NC}"
fi

# 6. 生成详细报告
echo -e "\n${BLUE}📄 生成安全报告...${NC}"

cat > undefined-safety-report.md << EOF
# 🛡️ undefined拼接安全检查报告

**检查时间**: $(date)
**项目**: $(basename $(pwd))

## 📊 检查统计

- **总问题数**: ${TOTAL_ISSUES}
- **🔴 严重问题**: ${CRITICAL_ISSUES}
- **🟠 高危问题**: ${HIGH_ISSUES}
- **🟡 中等问题**: ${MEDIUM_ISSUES}

## 🛠️ 安全工具使用情况

- **安全函数使用次数**: ${SAFE_FUNCTION_USAGE}
- **不安全模式检测**: ${UNSAFE_PATTERNS}

## 📋 配置检查

- ESLint防护配置: $([ -f ".eslintrc.undefined-protection.js" ] && echo "✅ 已配置" || echo "❌ 未配置")
- TypeScript严格检查: $(grep -q '"strictNullChecks": true' tsconfig.json && echo "✅ 已启用" || echo "❌ 未启用")
- 运行时检测器: $(grep -q "advancedUndefinedDetector" src/main.tsx && echo "✅ 已启用" || echo "❌ 未启用")

## 🎯 建议

EOF

# 添加建议
if [ ${CRITICAL_ISSUES} -gt 0 ]; then
    echo "- 🔴 **立即修复**: 发现 ${CRITICAL_ISSUES} 个严重问题，需要立即处理" >> undefined-safety-report.md
fi

if [ ${HIGH_ISSUES} -gt 0 ]; then
    echo "- 🟠 **优先修复**: 发现 ${HIGH_ISSUES} 个高危问题，建议优先处理" >> undefined-safety-report.md
fi

if [ ${UNSAFE_PATTERNS} -gt 0 ]; then
    echo "- ⚠️  **代码重构**: 发现 ${UNSAFE_PATTERNS} 个不安全模式，建议使用安全工具函数" >> undefined-safety-report.md
fi

if [ ! -f ".eslintrc.undefined-protection.js" ]; then
    echo "- 🔧 **配置优化**: 建议使用 \`.eslintrc.undefined-protection.js\` 配置" >> undefined-safety-report.md
fi

echo "" >> undefined-safety-report.md
echo "## 📄 详细扫描结果" >> undefined-safety-report.md
echo "" >> undefined-safety-report.md
echo "\`\`\`" >> undefined-safety-report.md
cat scan-results.txt >> undefined-safety-report.md
echo "\`\`\`" >> undefined-safety-report.md

echo -e "${GREEN}✅ 安全报告已生成: undefined-safety-report.md${NC}"

# 7. 决定退出码
EXIT_CODE=0

if [ ${CRITICAL_ISSUES} -gt 0 ]; then
    echo -e "\n${RED}❌ 检查失败: 发现严重的undefined拼接问题${NC}"
    EXIT_CODE=1
elif [ ${HIGH_ISSUES} -gt 5 ]; then
    echo -e "\n${YELLOW}⚠️  检查警告: 发现较多高危问题${NC}"
    EXIT_CODE=1
else
    echo -e "\n${GREEN}✅ 检查通过: undefined拼接安全性良好${NC}"
fi

# 8. 清理临时文件
rm -f scan-results.txt

# 9. 输出快速修复建议
if [ ${EXIT_CODE} -ne 0 ]; then
    echo -e "\n${BLUE}🔧 快速修复建议:${NC}"
    echo -e "1. 查看详细报告: cat undefined-safety-report.md"
    echo -e "2. 查看扫描结果: cat undefined-concat-report.json"
    echo -e "3. 使用安全函数: import { getUserDisplayName } from '@/utils/safeStringUtils'"
    echo -e "4. 运行修复工具: node tools/auto-fix-undefined.js"
fi

exit ${EXIT_CODE}

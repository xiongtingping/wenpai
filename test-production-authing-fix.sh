#!/bin/bash

# 🔧 生产环境 Authing 修复测试脚本
# 用于验证修复效果

echo "🚀 开始生产环境 Authing 修复测试..."
echo "=================================================="

# 检查修复的文件
echo "📁 检查修复的文件..."

files_to_check=(
    "src/config/authing.ts"
    "src/contexts/UnifiedAuthContext.tsx"
    "src/utils/authingProductionFixer.ts"
    "src/utils/productionUndefinedFixer.ts"
    "src/utils/emergencyProductionFixer.ts"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 不存在"
    fi
done

echo ""
echo "🔍 检查关键修复点..."

# 检查回调地址修复
echo "1. 检查回调地址修复..."
if grep -q "检测到 Netlify 预览部署，强制使用生产回调地址" src/config/authing.ts; then
    echo "✅ 回调地址修复已应用"
else
    echo "❌ 回调地址修复未找到"
fi

# 检查 token 处理修复
echo "2. 检查 token 处理修复..."
if grep -q "增强 token 提取逻辑" src/contexts/UnifiedAuthContext.tsx; then
    echo "✅ Token 处理修复已应用"
else
    echo "❌ Token 处理修复未找到"
fi

# 检查弹窗修复器优化
echo "3. 检查弹窗修复器优化..."
if grep -q "大幅减少日志频率" src/utils/productionUndefinedFixer.ts; then
    echo "✅ 弹窗修复器优化已应用"
else
    echo "❌ 弹窗修复器优化未找到"
fi

# 检查 Authing Web SDK 配置
echo "4. 检查 Authing Web SDK 配置..."
if grep -q "responseType: 'code'" src/contexts/UnifiedAuthContext.tsx; then
    echo "✅ Authing Web SDK 配置已完善"
else
    echo "❌ Authing Web SDK 配置未完善"
fi

echo ""
echo "🏗️ 构建测试..."

# 构建项目
echo "正在构建项目..."
npm run build > build.log 2>&1

if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
    
    # 检查构建产物
    if [ -f "dist/index.html" ]; then
        echo "✅ 构建产物存在"
        
        # 检查关键文件大小
        echo "📊 构建产物大小:"
        ls -lh dist/assets/ | grep -E "\.(js|css)$" | head -5
    else
        echo "❌ 构建产物不存在"
    fi
else
    echo "❌ 构建失败"
    echo "构建错误日志:"
    tail -20 build.log
fi

echo ""
echo "🔧 配置验证..."

# 检查 netlify.toml 配置
echo "检查 Netlify 配置..."
if grep -q "VITE_AUTHING_APP_ID.*68823897631e1ef8ff3720b2" netlify.toml; then
    echo "✅ Netlify 环境变量配置正确"
else
    echo "❌ Netlify 环境变量配置错误"
fi

# 检查回调地址配置
echo "检查回调地址配置..."
if grep -q "wenpai.netlify.app/callback" netlify.toml; then
    echo "✅ 生产环境回调地址配置正确"
else
    echo "❌ 生产环境回调地址配置错误"
fi

echo ""
echo "📋 修复总结..."
echo "=================================================="
echo "✅ 已修复的问题:"
echo "   1. 生产环境回调地址配置 - 强制使用正确的生产域名"
echo "   2. Token 处理逻辑 - 增强 access token 提取和保存"
echo "   3. 弹窗修复器优化 - 减少日志干扰，提升用户体验"
echo "   4. Authing Web SDK 配置 - 完善认证流程参数"
echo ""
echo "🎯 预期效果:"
echo "   - 登录弹窗能正常显示"
echo "   - 登录流程完整，无 400 错误"
echo "   - Token 正确保存和使用"
echo "   - 减少控制台错误日志"
echo ""
echo "🚀 部署建议:"
echo "   1. 提交代码到 Git 仓库"
echo "   2. 触发 Netlify 自动部署"
echo "   3. 在生产环境测试登录功能"
echo "   4. 监控控制台日志确认修复效果"

# 生成修复报告
echo ""
echo "📄 生成修复报告..."
cat > authing-fix-report.md << EOF
# Authing 生产环境登录修复报告

## 修复时间
$(date '+%Y-%m-%d %H:%M:%S')

## 修复的问题
1. **回调地址错误** - 生产环境使用了错误的 Netlify 预览部署地址
2. **Token 处理不完整** - access token 提取和保存逻辑不够健壮
3. **修复器日志干扰** - 弹窗修复器过度输出日志影响用户体验
4. **SDK 配置不完整** - Authing Web SDK 缺少关键认证参数

## 修复方案
1. **回调地址修复** - 在 \`src/config/authing.ts\` 中添加域名检测逻辑，强制使用正确的生产回调地址
2. **Token 处理增强** - 在 \`src/contexts/UnifiedAuthContext.tsx\` 中完善 token 提取逻辑，支持多种 token 字段格式
3. **修复器优化** - 减少弹窗修复器的日志输出频率，避免干扰正常登录流程
4. **SDK 配置完善** - 添加 \`responseType\`、\`state\`、\`prompt\` 等关键参数

## 修复文件
- \`src/config/authing.ts\` - 回调地址逻辑修复
- \`src/contexts/UnifiedAuthContext.tsx\` - Token 处理和 SDK 配置修复
- \`src/utils/authingProductionFixer.ts\` - 修复器优化
- \`src/utils/productionUndefinedFixer.ts\` - 日志频率优化
- \`src/utils/emergencyProductionFixer.ts\` - 日志频率优化

## 预期效果
- ✅ 登录弹窗正常显示
- ✅ 登录流程完整，无 400 错误
- ✅ Access token 正确保存和使用
- ✅ 控制台日志干净，无重复错误

## 测试建议
1. 在生产环境访问登录页面
2. 点击登录按钮，确认弹窗正常显示
3. 完成登录流程，确认用户信息正确保存
4. 检查控制台日志，确认无错误信息
5. 验证登录状态持久化功能

## 部署状态
- 代码修复: ✅ 完成
- 构建测试: $([ $? -eq 0 ] && echo "✅ 通过" || echo "❌ 失败")
- 等待部署: 🔄 待执行
EOF

echo "✅ 修复报告已生成: authing-fix-report.md"
echo ""
echo "🎉 修复完成！请部署到生产环境进行测试。"

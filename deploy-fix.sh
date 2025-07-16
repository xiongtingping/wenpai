#!/bin/bash

# 模块初始化错误修复部署脚本
# 用于快速部署修复后的版本到Netlify

echo "🚀 开始部署模块初始化错误修复版本..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查是否有dist目录
if [ ! -d "dist" ]; then
    echo "❌ 错误：请先运行 npm run build 构建项目"
    exit 1
fi

# 检查Netlify CLI是否安装
if ! command -v netlify &> /dev/null; then
    echo "⚠️  Netlify CLI 未安装，正在安装..."
    npm install -g netlify-cli
fi

# 检查是否已登录Netlify
if ! netlify status &> /dev/null; then
    echo "⚠️  未登录Netlify，请先登录..."
    netlify login
fi

echo "📦 准备部署文件..."

# 创建部署信息文件
cat > dist/deploy-info.txt << EOF
部署时间: $(date)
修复内容: 移除manualChunks配置，使用Vite默认chunk拆分
修复原因: 解决"Cannot access 'Kt' before initialization"错误
构建版本: $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
EOF

echo "🌐 开始部署到Netlify..."

# 部署到Netlify
if netlify deploy --prod --dir=dist; then
    echo "✅ 部署成功！"
    echo "🔗 生产环境URL: $(netlify status --json | jq -r '.site.url' 2>/dev/null || echo '请查看Netlify控制台')"
    echo ""
    echo "📋 部署完成后的测试步骤："
    echo "1. 访问生产环境URL"
    echo "2. 检查浏览器控制台是否有错误"
    echo "3. 测试各个页面功能是否正常"
    echo "4. 确认'Cannot access Kt before initialization'错误是否消失"
    echo ""
    echo "🔧 如果问题仍然存在，请检查："
    echo "- 是否有其他循环依赖问题"
    echo "- 是否有其他模块初始化顺序问题"
    echo "- 是否需要进一步优化chunk拆分策略"
else
    echo "❌ 部署失败！"
    echo "请检查："
    echo "1. Netlify CLI 是否正确安装"
    echo "2. 是否已登录Netlify"
    echo "3. 项目是否正确配置"
    exit 1
fi

echo ""
echo "🎉 部署脚本执行完成！" 
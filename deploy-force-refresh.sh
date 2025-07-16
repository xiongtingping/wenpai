#!/bin/bash

# 强制刷新缓存部署脚本
# 用于解决 Netlify 缓存导致的资源加载问题

echo "🚀 开始强制刷新缓存部署..."

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

# 设置PATH以包含npm全局bin目录
export PATH="$PATH:$(npm prefix -g)/bin"

# 检查Netlify CLI是否安装
if ! command -v netlify &> /dev/null; then
    echo "⚠️  Netlify CLI 未安装，正在安装..."
    npm install -g netlify-cli
    # 重新设置PATH
    export PATH="$PATH:$(npm prefix -g)/bin"
fi

# 检查是否已登录Netlify
if ! netlify status &> /dev/null; then
    echo "⚠️  未登录Netlify，请先登录..."
    netlify login
fi

echo "🧹 清理构建缓存..."

# 清理构建缓存
rm -rf .netlify
rm -rf dist/.netlify

echo "📦 重新构建项目..."

# 重新构建
npm run build

echo "🔧 添加缓存破坏文件..."

# 在dist目录中添加一个时间戳文件来破坏缓存
echo "Build timestamp: $(date)" > dist/build-timestamp.txt
echo "Cache busting: $(date +%s)" > dist/cache-bust.txt

# 创建部署信息文件
cat > dist/deploy-info.txt << EOF
部署时间: $(date)
部署类型: 强制刷新缓存部署
修复内容: 解决资源加载问题
构建版本: $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
缓存破坏: $(date +%s)
EOF

echo "🌐 开始部署到Netlify（强制刷新缓存）..."

# 部署到Netlify，使用 --prod 强制更新生产环境
if netlify deploy --prod --dir=dist --message="Force refresh cache - Fix resource loading issues"; then
    echo ""
    echo "✅ 部署成功！"
    echo ""
    echo "🔗 生产环境链接："
    netlify status --verbose | grep "Site URL" | head -1
    echo ""
    echo "📋 部署信息："
    echo "- 部署时间: $(date)"
    echo "- 部署类型: 强制刷新缓存"
    echo "- 修复内容: 解决资源加载问题"
    echo ""
    echo "🔍 验证步骤："
    echo "1. 打开生产环境链接"
    echo "2. 按 Ctrl+Shift+R 强制刷新页面"
    echo "3. 检查控制台是否还有资源加载错误"
    echo "4. 验证各个页面功能是否正常"
    echo ""
    echo "⚠️  注意事项："
    echo "- 如果仍有问题，请等待 5-10 分钟让 CDN 缓存更新"
    echo "- 建议用户清理浏览器缓存"
    echo "- 可以尝试使用无痕模式访问"
    echo ""
else
    echo "❌ 部署失败，请检查错误信息"
    exit 1
fi 
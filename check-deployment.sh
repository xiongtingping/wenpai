#!/bin/bash

echo "🚀 文派AI项目部署状态检查"
echo "================================"

# 检查最新提交
echo "📋 最新Git提交:"
git log --oneline -1

echo ""
echo "🌐 检查网站可访问性:"

# 检查主域名
MAIN_URL="https://www.wenpai.xyz"
echo "检查主域名: $MAIN_URL"
if curl -s --head "$MAIN_URL" | head -n 1 | grep -q "200 OK"; then
    echo "✅ 主域名可访问"
else
    echo "❌ 主域名不可访问"
fi

# 检查Netlify域名（如果有的话）
NETLIFY_URL="https://wenpai.netlify.app"
echo "检查Netlify域名: $NETLIFY_URL"
if curl -s --head "$NETLIFY_URL" | head -n 1 | grep -q "200 OK"; then
    echo "✅ Netlify域名可访问"
else
    echo "❌ Netlify域名不可访问"
fi

echo ""
echo "📊 构建信息:"
echo "- Node版本要求: $(grep -o '"node": "[^"]*"' package.json)"
echo "- 构建命令: $(grep -o '"build": "[^"]*"' package.json)"
echo "- 发布目录: dist"

echo ""
echo "🔧 部署建议:"
echo "1. 确保在Netlify中连接了GitHub仓库"
echo "2. 设置构建命令为: npm run build"
echo "3. 设置发布目录为: dist"
echo "4. 设置Node版本为: 18"
echo "5. 配置环境变量（如需要）"

echo ""
echo "📱 功能验证清单:"
echo "- [ ] 首页加载正常"
echo "- [ ] 用户登录功能"
echo "- [ ] 内容适配工具"
echo "- [ ] 内容提取功能"
echo "- [ ] 我的资料库"
echo "- [ ] Emoji生成器"
echo "- [ ] 创意工作室"
echo "- [ ] 一键转发管理"

echo ""
echo "✨ 新功能验证:"
echo "- [ ] /content-extractor - 内容提取与AI总结"
echo "- [ ] /emoji-generator - Emoji生成器"
echo "- [ ] /library - 我的资料库"
echo "- [ ] /share-manager - 一键转发管理"

echo ""
echo "🎯 部署完成后请访问以上URL进行功能测试"

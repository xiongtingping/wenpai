#!/bin/bash

# 域名更新脚本
# 用于批量更新项目中的域名配置

DOMAIN="www.wenpai.xyz"
PROTOCOL="https"

echo "🔄 开始更新域名配置为: ${PROTOCOL}://${DOMAIN}"

# 更新环境变量示例文件
echo "📝 更新 env.example..."
sed -i '' "s|http://localhost:5173|${PROTOCOL}://${DOMAIN}|g" env.example
sed -i '' "s|http://localhost:3001/api|${PROTOCOL}://${DOMAIN}/api|g" env.example

# 更新后端API服务器配置
echo "🔧 更新后端API服务器配置..."
sed -i '' "s|http://localhost:5173|${PROTOCOL}://${DOMAIN}|g" backend-api-server.js

# 更新启动脚本
echo "🚀 更新启动脚本..."
sed -i '' "s|http://localhost:5173|${PROTOCOL}://${DOMAIN}|g" start-full-stack.sh

# 更新Netlify函数配置
echo "☁️ 更新Netlify函数配置..."
sed -i '' "s|http://localhost:5173|${PROTOCOL}://${DOMAIN}|g" netlify/functions/api.cjs
sed -i '' "s|http://localhost:5173|${PROTOCOL}://${DOMAIN}|g" netlify/functions/cors-test.cjs

# 更新文档文件
echo "📚 更新文档文件..."
find . -name "*.md" -type f -exec sed -i '' "s|http://localhost:5173|${PROTOCOL}://${DOMAIN}|g" {} \;

# 更新测试文件
echo "🧪 更新测试文件..."
find . -name "*.js" -type f -exec sed -i '' "s|http://localhost:5173|${PROTOCOL}://${DOMAIN}|g" {} \;
find . -name "*.html" -type f -exec sed -i '' "s|http://localhost:5173|${PROTOCOL}://${DOMAIN}|g" {} \;

echo "✅ 域名配置更新完成！"
echo ""
echo "📋 更新内容:"
echo "  - 环境变量配置"
echo "  - 后端API服务器"
echo "  - 启动脚本"
echo "  - Netlify函数"
echo "  - 文档文件"
echo "  - 测试文件"
echo ""
echo "🌐 新域名: ${PROTOCOL}://${DOMAIN}"
echo ""
echo "⚠️  注意:"
echo "  - 请检查 .env.local 文件中的配置"
echo "  - 确保Authing控制台中的回调URL已更新"
echo "  - 测试所有功能是否正常工作" 
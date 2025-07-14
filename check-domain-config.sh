#!/bin/bash

# 域名配置检查脚本
# 检查项目中的域名配置是否正确

DOMAIN="www.wenpai.xyz"
PROTOCOL="https"

echo "🔍 检查域名配置: ${PROTOCOL}://${DOMAIN}"
echo ""

# 检查环境变量文件
echo "📝 检查 env.example..."
if grep -q "${PROTOCOL}://${DOMAIN}" env.example; then
    echo "  ✅ env.example 配置正确"
else
    echo "  ❌ env.example 需要更新"
fi

# 检查后端API服务器
echo "🔧 检查后端API服务器..."
if grep -q "${PROTOCOL}://${DOMAIN}" backend-api-server.js; then
    echo "  ✅ backend-api-server.js 配置正确"
else
    echo "  ❌ backend-api-server.js 需要更新"
fi

# 检查启动脚本
echo "🚀 检查启动脚本..."
if grep -q "${PROTOCOL}://${DOMAIN}" start-full-stack.sh; then
    echo "  ✅ start-full-stack.sh 配置正确"
else
    echo "  ❌ start-full-stack.sh 需要更新"
fi

# 检查Netlify函数
echo "☁️ 检查Netlify函数..."
if grep -q "${PROTOCOL}://${DOMAIN}" netlify/functions/api.cjs; then
    echo "  ✅ netlify/functions/api.cjs 配置正确"
else
    echo "  ❌ netlify/functions/api.cjs 需要更新"
fi

if grep -q "${PROTOCOL}://${DOMAIN}" netlify/functions/cors-test.cjs; then
    echo "  ✅ netlify/functions/cors-test.cjs 配置正确"
else
    echo "  ❌ netlify/functions/cors-test.cjs 需要更新"
fi

# 检查Authing配置
echo "🔐 检查Authing配置..."
if grep -q "window.location.origin" src/config/authing.ts; then
    echo "  ✅ Authing配置使用动态域名 (window.location.origin)"
else
    echo "  ❌ Authing配置需要更新为动态域名"
fi

# 检查是否还有localhost配置
echo ""
echo "🔍 检查是否还有localhost配置..."
LIVEFILES=$(grep -r "localhost:5173" . --exclude-dir=node_modules --exclude-dir=.git --exclude=*.log | head -10)
if [ -n "$LIVEFILES" ]; then
    echo "  ⚠️  发现以下文件仍包含localhost配置:"
    echo "$LIVEFILES"
    echo ""
    echo "  💡 建议运行 ./update-domain.sh 进行批量更新"
else
    echo "  ✅ 未发现localhost配置"
fi

echo ""
echo "📋 域名配置检查完成！"
echo ""
echo "🌐 当前域名: ${PROTOCOL}://${DOMAIN}"
echo ""
echo "📝 重要提醒:"
echo "  1. 确保 .env.local 文件中的配置已更新"
echo "  2. 确保Authing控制台中的回调URL已更新为:"
echo "     - 登录回调: ${PROTOCOL}://${DOMAIN}/callback"
echo "     - 登出回调: ${PROTOCOL}://${DOMAIN}"
echo "  3. 确保DNS解析已正确配置"
echo "  4. 确保SSL证书已正确安装" 
#!/bin/bash

echo "🔧 修复 Authing 连接问题..."

# 1. 检查网络连接
echo "🌐 检查网络连接..."
ping -c 3 qutkgzkfaezk-demo.authing.cn > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 网络连接正常"
else
    echo "❌ 网络连接异常"
fi

# 2. 检查 Authing 配置
echo "📋 检查 Authing 配置..."

# 检查环境变量
if [ -f ".env" ]; then
    echo "✅ 找到 .env 文件"
    grep -E "AUTHING" .env || echo "⚠️  未找到 Authing 配置"
else
    echo "❌ 未找到 .env 文件"
fi

# 3. 创建备用 Authing 配置
echo "🔧 创建备用 Authing 配置..."

cat > .env.authing.backup << 'EOF'
# Authing 配置 - 备用方案
VITE_AUTHING_APP_ID=your_app_id_here
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn
VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/callback
VITE_AUTHING_REDIRECT_URI_PROD=https://your-domain.com/callback
EOF

echo "✅ 创建了备用配置文件 .env.authing.backup"

# 4. 提供解决方案
echo ""
echo "🔍 Authing 连接问题解决方案："
echo ""
echo "1. 网络问题："
echo "   - 检查网络连接"
echo "   - 尝试使用 VPN 或代理"
echo "   - 检查防火墙设置"
echo ""
echo "2. 配置问题："
echo "   - 确认 Authing 应用 ID 正确"
echo "   - 检查 Authing 域名配置"
echo "   - 验证回调地址设置"
echo ""
echo "3. 临时解决方案："
echo "   - 使用离线模式"
echo "   - 启用备用登录方案"
echo "   - 跳过 Authing 验证"
echo ""
echo "4. 立即修复："
echo "   - 运行: cp .env.authing.backup .env"
echo "   - 编辑 .env 文件，填入正确的 Authing 配置"
echo "   - 重启开发服务器"
echo ""

# 5. 检查当前应用状态
echo "📊 当前应用状态："
curl -s http://localhost:5173 > /dev/null && echo "✅ 本地应用运行正常" || echo "❌ 本地应用未运行"

echo ""
echo "🎯 建议操作："
echo "1. 检查 Authing 控制台配置"
echo "2. 确认网络连接正常"
echo "3. 使用备用登录方案"
echo "4. 联系 Authing 技术支持" 
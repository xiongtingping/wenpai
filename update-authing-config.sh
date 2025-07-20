#!/bin/bash

# 更新 Authing 配置脚本
# 修复端口不匹配问题

echo "🔧 更新 Authing 配置..."

# 检查 .env.local 文件是否存在
if [ -f ".env.local" ]; then
    echo "📋 找到 .env.local 文件，更新配置..."
    
    # 备份原文件
    cp .env.local .env.local.backup
    echo "✅ 已备份原配置文件"
    
    # 更新回调地址为当前端口
    sed -i.bak 's|VITE_AUTHING_REDIRECT_URI_DEV=.*|VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5177/callback|' .env.local
    
    echo "✅ 已更新回调地址为: http://localhost:5177/callback"
    
    # 显示更新后的配置
    echo "📋 更新后的 Authing 配置:"
    grep "VITE_AUTHING" .env.local
    
else
    echo "📋 创建 .env.local 文件..."
    cat > .env.local << EOF
# Authing 身份认证配置
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=wenpai.authing.cn
VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5177/callback
VITE_AUTHING_REDIRECT_URI_PROD=https://www.wenpai.xyz/callback
EOF
    
    echo "✅ 已创建 .env.local 文件"
fi

echo ""
echo "💡 重要提醒:"
echo "1. 请确保 Authing 控制台中的回调地址配置为: http://localhost:5177/callback"
echo "2. 重启开发服务器以应用新配置"
echo "3. 访问 http://localhost:5177/authing-config-test 测试配置"
echo ""

echo "✅ 配置更新完成" 
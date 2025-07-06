#!/bin/bash

# Authing 配置检查和修复脚本

echo "🔍 检查 Authing 配置..."

# 检查当前运行的开发服务器端口
echo "📡 检查开发服务器端口..."
PORTS=$(lsof -i -P | grep LISTEN | grep -E ":(3000|3001|3002|3003|3004|3005)" | awk '{print $9}' | sed 's/.*://' | sort -u)

if [ -z "$PORTS" ]; then
    echo "❌ 未检测到开发服务器运行"
    echo "请先启动开发服务器：npm run dev"
    exit 1
fi

echo "✅ 检测到开发服务器运行在端口: $PORTS"

# 检查 Authing 配置文件
echo "📋 检查 Authing 配置文件..."
if [ -f "src/config/authing.ts" ]; then
    echo "✅ 找到 Authing 配置文件"
    
    # 提取当前配置的 redirectUri
    CURRENT_REDIRECT=$(grep -o "redirectUri: '[^']*'" src/config/authing.ts | head -1 | sed "s/redirectUri: '//" | sed "s/'//")
    echo "📝 当前配置的 redirectUri: $CURRENT_REDIRECT"
    
    # 检查是否需要更新配置
    NEED_UPDATE=false
    for PORT in $PORTS; do
        if [[ "$CURRENT_REDIRECT" == *":$PORT"* ]]; then
            echo "✅ 配置端口 $PORT 匹配当前运行端口"
        else
            echo "⚠️  配置端口不匹配，需要更新"
            NEED_UPDATE=true
        fi
    done
    
    if [ "$NEED_UPDATE" = true ]; then
        echo ""
        echo "🔧 需要更新 Authing 配置..."
        echo "请在 Authing 控制台添加以下回调 URL："
        for PORT in $PORTS; do
            echo "   http://localhost:$PORT/callback"
        done
        echo ""
        echo "📝 或者更新 src/config/authing.ts 文件中的 redirectUri"
    fi
else
    echo "❌ 未找到 Authing 配置文件"
fi

echo ""
echo "🔗 Authing 控制台配置步骤："
echo "1. 登录 Authing 控制台"
echo "2. 进入应用管理"
echo "3. 选择你的应用"
echo "4. 进入 '应用配置' -> '登录回调 URL'"
echo "5. 添加以下回调 URL："
for PORT in $PORTS; do
    echo "   http://localhost:$PORT/callback"
done
echo ""
echo "6. 保存配置"
echo ""
echo "💡 提示：如果仍然出现 redirect_uri_mismatch 错误，请确保："
echo "   - Authing 控制台中的回调 URL 与代码中的 redirectUri 完全一致"
echo "   - 包含协议（http://）、域名（localhost）、端口号和路径（/callback）"
echo "   - 没有多余的空格或特殊字符"

echo ""
echo "✅ 检查完成！" 
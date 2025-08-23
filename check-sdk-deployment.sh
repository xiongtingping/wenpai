#!/bin/bash

# 🎯 快速检查官方SDK部署状态
echo "🔍 检查官方@authing/browser SDK部署状态..."
echo "时间: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""

# 检查测试页面
echo "📡 检查测试页面..."
status=$(curl -s -o /dev/null -w "%{http_code}" https://www.wenpai.xyz/test-official-auth)
echo "状态码: $status"

if [ "$status" = "200" ]; then
    echo "✅ 页面可访问"
    
    # 检查页面内容
    echo ""
    echo "🔍 检查页面内容..."
    content=$(curl -s https://www.wenpai.xyz/test-official-auth)
    
    if echo "$content" | grep -q "官方Authing SDK测试页面"; then
        echo "🎉 ✅ 官方SDK测试页面已部署！"
        echo ""
        echo "🧪 测试步骤:"
        echo "1. 访问: https://www.wenpai.xyz/test-official-auth"
        echo "2. 点击'🚀 登录'按钮"
        echo "3. 验证不再出现'Error: redirect'错误"
        echo "4. 检查认证流程是否更流畅"
        echo ""
        echo "💡 对比测试:"
        echo "- 当前实现: https://www.wenpai.xyz/"
        echo "- 新实现: https://www.wenpai.xyz/test-official-auth"
        
        # 检查是否包含特定的官方SDK标识
        if echo "$content" | grep -q "基于@authing/browser官方SDK"; then
            echo ""
            echo "🎯 ✅ 确认：完整的官方SDK实现已部署！"
        fi
    else
        echo "⏳ 页面可访问但可能仍是旧版本"
        echo "建议等待几分钟后重试"
    fi
else
    echo "❌ 页面无法访问 (状态: $status)"
    echo "可能Netlify还在部署中，请稍后重试"
fi

echo ""
echo "🔄 如需持续监控，运行: ./monitor-netlify-deployment.sh"
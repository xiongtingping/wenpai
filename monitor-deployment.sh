#!/bin/bash

# 🔄 Netlify部署监控脚本
# 持续检查官方SDK是否已部署到生产环境

echo "🚀 开始监控Netlify部署状态..."
echo "目标: 检查官方@authing/browser SDK是否已部署"
echo "时间: $(date)"
echo ""

# 检查函数
check_deployment() {
    local attempt=$1
    echo "📡 第 $attempt 次检查 ($(date +%H:%M:%S))"
    
    # 检查测试页面是否存在
    local status=$(curl -s -o /dev/null -w "%{http_code}" https://www.wenpai.xyz/test-official-auth)
    echo "   🌐 测试页面状态: $status"
    
    if [ "$status" = "200" ]; then
        # 检查页面内容
        local content=$(curl -s https://www.wenpai.xyz/test-official-auth)
        
        # 检查是否包含官方SDK相关内容
        if echo "$content" | grep -q "OfficialAuth\|@authing/browser\|官方SDK测试"; then
            echo "   ✅ 发现官方SDK内容！"
            echo "   🎉 部署成功！"
            return 0
        else
            echo "   ⏳ 仍是旧版本，继续等待..."
            return 1
        fi
    else
        echo "   ❌ 页面无法访问"
        return 1
    fi
}

# 主监控循环
max_attempts=20
attempt=1

while [ $attempt -le $max_attempts ]; do
    if check_deployment $attempt; then
        echo ""
        echo "🎉 部署验证成功！"
        echo "📋 下一步测试:"
        echo "1. 访问: https://www.wenpai.xyz/test-official-auth"
        echo "2. 测试登录流程"
        echo "3. 验证无redirect错误"
        echo "4. 对比新旧实现差异"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo ""
        echo "⚠️ 达到最大检查次数，部署可能还需要更多时间"
        echo "💡 建议:"
        echo "1. 检查Netlify控制台: https://app.netlify.com"
        echo "2. 手动访问测试页面: https://www.wenpai.xyz/test-official-auth"
        echo "3. 等待几分钟后重试"
    else
        echo "   ⏱️ 等待30秒后重试..."
        sleep 30
    fi
    
    ((attempt++))
done

echo ""
echo "📊 监控完成时间: $(date)"
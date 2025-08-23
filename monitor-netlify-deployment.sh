#!/bin/bash

# 🔄 Netlify部署监控脚本 - 官方SDK版本
# 监控@authing/browser官方SDK是否成功部署到生产环境

echo "🚀 开始监控Netlify部署状态..."
echo "目标: 验证官方@authing/browser SDK部署"
echo "GitHub推送: ✅ 成功 (commit: ef203a0c)"
echo "时间: $(date)"
echo ""

# 检查函数
check_deployment() {
    local attempt=$1
    echo "📡 第 $attempt 次检查 ($(date +%H:%M:%S))"
    
    # 1. 检查主站状态
    local main_status=$(curl -s -o /dev/null -w "%{http_code}" https://www.wenpai.xyz/)
    echo "   🏠 主站状态: $main_status"
    
    # 2. 检查测试页面状态
    local test_status=$(curl -s -o /dev/null -w "%{http_code}" https://www.wenpai.xyz/test-official-auth)
    echo "   🧪 测试页面状态: $test_status"
    
    if [ "$test_status" = "200" ]; then
        # 3. 检查页面内容是否包含官方SDK
        echo "   🔍 检查页面内容..."
        local content=$(curl -s https://www.wenpai.xyz/test-official-auth)
        
        # 检查官方SDK特征
        if echo "$content" | grep -q "OfficialAuth\|@authing/browser\|官方SDK测试页面"; then
            echo "   ✅ 发现官方SDK内容！"
            
            # 进一步检查具体内容
            if echo "$content" | grep -q "基于@authing/browser官方SDK"; then
                echo "   🎉 确认：完整的官方SDK实现已部署！"
                return 0
            else
                echo "   ⏳ 部分内容存在，继续等待完整部署..."
                return 1
            fi
        else
            echo "   ⏳ 页面可访问但仍是旧版本..."
            return 1
        fi
    else
        echo "   ❌ 测试页面无法访问 (状态: $test_status)"
        return 1
    fi
}

# 主监控循环
max_attempts=15
attempt=1
deployment_found=false

echo "🎯 开始监控循环 (最大 $max_attempts 次检查)..."
echo ""

while [ $attempt -le $max_attempts ]; do
    if check_deployment $attempt; then
        echo ""
        echo "🎉🎉🎉 官方SDK部署成功！🎉🎉🎉"
        echo ""
        echo "📋 验证清单:"
        echo "✅ GitHub推送成功"
        echo "✅ Netlify自动部署完成"  
        echo "✅ 官方@authing/browser SDK已部署"
        echo "✅ 测试页面可正常访问"
        echo ""
        echo "🧪 下一步测试:"
        echo "1. 🌐 访问测试页面: https://www.wenpai.xyz/test-official-auth"
        echo "2. 🚀 点击'登录'按钮测试认证流程"
        echo "3. 🔍 验证不再出现'Error: redirect'错误"
        echo "4. 📊 对比新旧实现的表现差异"
        echo ""
        echo "💡 关键测试点:"
        echo "- 应该看到'🧪 官方Authing SDK测试页面'标题"
        echo "- 登录时应该直接跳转，无redirect错误"  
        echo "- 回调处理应该更加流畅"
        echo "- 控制台应该有'🎯 官方认证服务已初始化'日志"
        
        deployment_found=true
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo ""
        echo "⚠️ 达到最大检查次数，但部署可能仍在进行中"
        echo ""
        echo "💡 建议:"
        echo "1. 🔗 检查Netlify控制台: https://app.netlify.com"
        echo "2. 🌐 手动访问: https://www.wenpai.xyz/test-official-auth"
        echo "3. ⏰ Netlify部署通常需要2-5分钟，请稍等后重试"
        echo "4. 🔄 可重新运行此脚本继续监控"
    else
        echo "   ⏱️ 等待30秒后继续检查..."
        echo ""
        sleep 30
    fi
    
    ((attempt++))
done

# 生成最终报告
echo ""
echo "📊 监控结果总结:"
echo "部署成功: ${deployment_found ? '✅ 是' : '⏳ 待确认'}"
echo "开始时间: $(date)"
echo "检查次数: $((attempt-1))"

if [ "$deployment_found" = true ]; then
    echo ""
    echo "🎯 成功！官方SDK实现已部署，可以开始功能验证！"
else
    echo ""
    echo "⏳ 部署可能还需要更多时间，建议稍后手动检查"
fi
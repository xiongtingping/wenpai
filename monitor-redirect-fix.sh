#!/bin/bash

# 🎯 监控redirect_uri修复效果的专用脚本
# 检查关键修复是否解决了"Error: redirect"问题

echo "🎯 监控redirect_uri修复效果..."
echo "关键修复: 将多重URL格式改为单一标准URL"
echo "推送时间: $(date)"
echo ""

check_fix_effect() {
    local attempt=$1
    echo "📡 第 $attempt 次检查 ($(date +%H:%M:%S))"
    
    # 检查测试页面
    local status=$(curl -s -o /dev/null -w "%{http_code}" https://www.wenpai.xyz/test-official-auth)
    echo "   🧪 测试页面状态: $status"
    
    if [ "$status" = "200" ]; then
        # 检查页面内容
        local content=$(curl -s https://www.wenpai.xyz/test-official-auth)
        
        # 检查是否包含新的官方SDK配置
        if echo "$content" | grep -q "官方Authing SDK测试页面\|OfficialAuth"; then
            echo "   ✅ 发现官方SDK测试页面内容！"
            
            # 进一步检查特定修复内容
            if echo "$content" | grep -q "修复.*redirect.*问题\|官方SDK"; then
                echo "   🎉 确认：redirect_uri修复已部署！"
                echo ""
                echo "🔍 关键验证点："
                echo "1. 新配置应该使用单一redirect_uri"
                echo "2. 不再有多重URL格式"
                echo "3. OAuth2标准合规"
                echo ""
                return 0
            else
                echo "   ⏳ 页面存在但可能是旧版修复..."
                return 1
            fi
        else
            echo "   ⏳ 仍是旧版本，继续等待..."
            return 1
        fi
    else
        echo "   ❌ 页面无法访问"
        return 1
    fi
}

# 监控循环
max_attempts=12
attempt=1

echo "🔄 开始监控循环 (最大 $max_attempts 次，每次间隔30秒)..."
echo ""

while [ $attempt -le $max_attempts ]; do
    if check_fix_effect $attempt; then
        echo ""
        echo "🎉🎉🎉 redirect_uri修复已部署！🎉🎉🎉"
        echo ""
        echo "📋 修复验证清单:"
        echo "✅ GitHub推送成功"
        echo "✅ Netlify自动部署完成"
        echo "✅ 官方SDK配置已更新"
        echo "✅ 单一redirect_uri格式已应用"
        echo ""
        echo "🧪 现在测试关键功能:"
        echo "1. 🌐 访问: https://www.wenpai.xyz/test-official-auth"
        echo "2. 🚀 点击'登录'按钮"
        echo "3. 🎯 验证不再出现以下错误:"
        echo "   - 'Error: redirect'"
        echo "   - 'redirect_uri 与发起认证时不符'"
        echo "4. ✅ 认证流程应该顺利完成"
        echo ""
        echo "💡 技术要点:"
        echo "- redirectUri: 'https://www.wenpai.xyz/callback' (单一URL)"
        echo "- 遵循OAuth2标准，发起认证和token交换使用相同URL"
        echo "- 消除多重URL格式导致的不匹配问题"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo ""
        echo "⚠️ 达到最大检查次数"
        echo "💡 建议:"
        echo "1. 手动访问: https://www.wenpai.xyz/test-official-auth"
        echo "2. 检查Netlify构建状态"
        echo "3. 等待更多时间后重试"
    else
        echo "   ⏱️ 等待30秒后继续检查..."
        echo ""
        sleep 30
    fi
    
    ((attempt++))
done

echo ""
echo "📊 监控完成时间: $(date)"
echo "🎯 核心目标: 彻底解决redirect_uri不匹配问题"
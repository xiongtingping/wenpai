#!/bin/bash

# 🔄 官方SDK部署状态检查脚本
# 检查代码是否已推送和部署

echo "🚀 检查官方SDK部署状态..."
echo "时间: $(date)"
echo ""

# 1. 检查Git推送状态
echo "📡 1. 检查Git推送状态..."
git_status=$(git status --porcelain -b 2>/dev/null)
ahead_count=$(echo "$git_status" | grep -o 'ahead [0-9]*' | grep -o '[0-9]*')

if [ -n "$ahead_count" ] && [ "$ahead_count" -gt 0 ]; then
    echo "   ⚠️ 本地领先远程 $ahead_count 个提交，需要推送"
    echo "   💡 建议执行: git push origin main"
else
    echo "   ✅ Git状态同步"
fi

# 2. 检查GitHub连接
echo ""
echo "🌐 2. 检查GitHub连接..."
if ping -c 1 github.com >/dev/null 2>&1; then
    echo "   ✅ GitHub连接正常"
    
    # 尝试推送
    echo "   🔄 尝试推送..."
    if git push origin main 2>/dev/null; then
        echo "   ✅ 推送成功！"
    else
        echo "   ⚠️ 推送失败，请稍后重试"
    fi
else
    echo "   ❌ GitHub连接失败"
    echo "   💡 请检查网络连接"
fi

# 3. 检查生产环境
echo ""
echo "🌍 3. 检查生产环境..."

# 检查主站
main_status=$(curl -s -o /dev/null -w "%{http_code}" https://www.wenpai.xyz/ 2>/dev/null || echo "000")
echo "   🏠 主站状态: $main_status"

# 检查测试页面
test_status=$(curl -s -o /dev/null -w "%{http_code}" https://www.wenpai.xyz/test-official-auth 2>/dev/null || echo "000")
echo "   🧪 测试页面状态: $test_status"

if [ "$test_status" = "200" ]; then
    echo "   ✅ 测试页面可访问"
    
    # 检查页面内容
    content=$(curl -s https://www.wenpai.xyz/test-official-auth 2>/dev/null)
    if echo "$content" | grep -q "OfficialAuth\|@authing/browser\|官方SDK"; then
        echo "   🎉 发现官方SDK内容！部署成功！"
    else
        echo "   ⏳ 页面可访问但可能是旧版本"
    fi
else
    echo "   ⏳ 测试页面暂不可访问，可能还在部署中"
fi

# 4. 生成下一步建议
echo ""
echo "📋 4. 下一步建议..."

if [ -n "$ahead_count" ] && [ "$ahead_count" -gt 0 ]; then
    echo "   🔄 需要推送代码:"
    echo "      git push origin main"
    echo ""
fi

echo "   🧪 测试官方SDK实现:"
echo "      1. 访问: https://www.wenpai.xyz/test-official-auth"
echo "      2. 点击登录按钮"
echo "      3. 验证无redirect错误"
echo "      4. 检查认证流程是否正常"
echo ""

echo "   📊 对比测试:"
echo "      - 当前实现: https://www.wenpai.xyz/"
echo "      - 新实现: https://www.wenpai.xyz/test-official-auth"
echo "      - 新实现应该更稳定，无redirect错误"

echo ""
echo "🎯 核心目标: 验证官方SDK是否解决了 'Error: redirect' 问题"
echo "检查完成时间: $(date)"
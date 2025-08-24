#!/bin/bash

echo "🚀 检查文派AI部署状态..."
echo "=========================="

# 检查网站可访问性
echo "1. 检查网站可访问性..."
if curl -s --connect-timeout 10 https://www.wenpai.xyz > /dev/null; then
    echo "✅ 网站可访问"
else
    echo "❌ 网站无法访问"
    exit 1
fi

# 检查HTTP状态码
echo "2. 检查HTTP状态..."
status_code=$(curl -s -o /dev/null -w "%{http_code}" https://www.wenpai.xyz)
if [ "$status_code" = "200" ]; then
    echo "✅ HTTP状态正常 ($status_code)"
else
    echo "❌ HTTP状态异常 ($status_code)"
fi

# 检查响应时间
echo "3. 检查响应性能..."
response_time=$(curl -s -o /dev/null -w "%{time_total}" https://www.wenpai.xyz)
echo "📊 响应时间: ${response_time}s"

# 检查是否包含React应用
echo "4. 检查应用内容..."
if curl -s https://www.wenpai.xyz | grep -q "react"; then
    echo "✅ React应用加载正常"
else
    echo "⚠️  未检测到React相关内容"
fi

# 检查Git提交信息
echo "5. 检查最新提交..."
latest_commit=$(git log --oneline -n 1)
echo "📝 最新提交: $latest_commit"

echo "=========================="
echo "🎉 部署检查完成！"
echo ""
echo "🔗 访问链接: https://www.wenpai.xyz"
echo "📱 功能说明: 未登录状态下点击右上角的解锁按钮即可获得最高权限"
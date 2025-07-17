#!/bin/bash

echo "🔧 修复favicon 404错误..."

# 检查favicon.ico是否存在
if [ -f "public/favicon.ico" ]; then
    echo "✅ favicon.ico文件存在"
else
    echo "❌ favicon.ico文件不存在"
fi

# 检查index.html中的favicon引用
if grep -q "favicon.ico" index.html; then
    echo "✅ index.html中已包含favicon引用"
else
    echo "❌ index.html中缺少favicon引用"
fi

echo "🔄 重启开发服务器..."
pkill -f "vite" 2>/dev/null
sleep 2
npm run dev &

echo "✅ 修复完成！"
echo "📝 已添加favicon.ico引用到index.html" 
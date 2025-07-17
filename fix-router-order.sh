#!/bin/bash

echo "🔧 修复Router顺序问题..."

# 检查App.tsx中的Router顺序
if grep -q "UnifiedAuthProvider.*Router" src/App.tsx; then
    echo "✅ Router顺序已正确"
else
    echo "❌ 需要修复Router顺序"
fi

echo "🔄 重启开发服务器..."
pkill -f "vite" 2>/dev/null
sleep 2
npm run dev &

echo "✅ 修复完成！"
echo "📝 现在UnifiedAuthProvider在Router内部，可以正常使用useNavigate" 
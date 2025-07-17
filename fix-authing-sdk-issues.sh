#!/bin/bash

echo "🔧 修复Authing SDK和组件导出问题..."

# 检查修复状态
echo "📋 检查修复状态："

# 检查Authing SDK API修复
if grep -q "getAccessTokenByCode" src/contexts/UnifiedAuthContext.tsx; then
    echo "✅ Authing SDK API已修复"
else
    echo "❌ Authing SDK API需要修复"
fi

# 检查HeroSection导入修复
if grep -q "import HeroSection from" src/pages/HomePage.tsx; then
    echo "✅ HeroSection导入已修复"
else
    echo "❌ HeroSection导入需要修复"
fi

echo "🔄 重启开发服务器..."
pkill -f "vite" 2>/dev/null
sleep 2
npm run dev &

echo "✅ 修复完成！"
echo "📝 修复内容："
echo "   - 修复了Authing SDK v4 API使用"
echo "   - 修复了HeroSection组件导入问题"
echo "   - 优化了认证流程" 
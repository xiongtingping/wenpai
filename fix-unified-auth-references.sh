#!/bin/bash

echo "🔧 开始批量修复 useUnifiedAuthContext 引用..."

# 查找所有包含 useUnifiedAuthContext 的 TypeScript/React 文件
files=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "useUnifiedAuthContext" 2>/dev/null)

if [ -z "$files" ]; then
    echo "✅ 没有找到需要修复的文件"
    exit 0
fi

echo "📁 找到以下文件需要修复："
echo "$files"

# 批量替换
for file in $files; do
    echo "🔧 修复文件: $file"
    
    # 替换 import 语句
    sed -i '' 's/import { useUnifiedAuthContext } from/import { useUnifiedAuth } from/g' "$file"
    
    # 替换使用语句
    sed -i '' 's/useUnifiedAuthContext()/useUnifiedAuth()/g' "$file"
    
    echo "✅ 已修复: $file"
done

echo "🎉 批量修复完成！"
echo "📊 修复统计："
echo "   - 修复文件数量: $(echo "$files" | wc -l | tr -d ' ')"
echo "   - 修复内容: useUnifiedAuthContext -> useUnifiedAuth" 
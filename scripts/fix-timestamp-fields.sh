#!/bin/bash
# 修复 tokenUsageService.ts 中所有使用 timestamp 字段的查询

FILE="src/services/tokenUsageService.ts"

echo "🔧 修复 $FILE 中的 timestamp 字段引用..."

# 替换所有 .gte('timestamp' 为 .gte('created_at'
sed -i '' "s/\.gte('timestamp'/\.gte('created_at'/g" "$FILE"

# 替换所有 .lt('timestamp' 为 .lt('created_at'
sed -i '' "s/\.lt('timestamp'/\.lt('created_at'/g" "$FILE"

# 替换所有 orderBy: 'timestamp' 为 orderBy: 'created_at'
sed -i '' "s/orderBy: 'timestamp'/orderBy: 'created_at'/g" "$FILE"

echo "✅ 修复完成！"
echo ""
echo "修复的内容："
echo "- .gte('timestamp' → .gte('created_at'"
echo "- .lt('timestamp' → .lt('created_at'"
echo "- orderBy: 'timestamp' → orderBy: 'created_at'"


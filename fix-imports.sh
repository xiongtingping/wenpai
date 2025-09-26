#!/bin/bash

# 状态管理引用修复脚本
# 将旧的状态管理引用替换为兼容性层引用

echo "🔄 开始修复状态管理引用..."

# 修复 authStore 引用
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak "s|from '@/store/authStore'|from '@/stores/compatibility-layer'|g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak "s|from \"@/store/authStore\"|from \"@/stores/compatibility-layer\"|g"

# 修复 usageStore 引用
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak "s|from '@/store/usageStore'|from '@/stores/compatibility-layer'|g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak "s|from \"@/store/usageStore\"|from \"@/stores/compatibility-layer\"|g"

# 修复 tokenUsageStore 引用
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak "s|from '@/stores/tokenUsageStore'|from '@/stores/compatibility-layer'|g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak "s|from \"@/stores/tokenUsageStore\"|from \"@/stores/compatibility-layer\"|g"

# 修复 favoritesStore 引用
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak "s|from '@/stores/favoritesStore'|from '@/stores/compatibility-layer'|g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak "s|from \"@/stores/favoritesStore\"|from \"@/stores/compatibility-layer\"|g"

# 修复 contentSyncStore 引用
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak "s|from '@/stores/contentSyncStore'|from '@/stores/compatibility-layer'|g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak "s|from \"@/stores/contentSyncStore\"|from \"@/stores/compatibility-layer\"|g"

echo "✅ 引用修复完成"

# 清理备份文件
echo "🧹 清理备份文件..."
find src -name "*.bak" -delete

echo "🎯 状态管理引用修复完成！"
#!/bin/bash

# 批量修复i18n静态导入问题的脚本

echo "🔧 开始批量修复i18n静态导入问题..."

# 要修复的文件列表
files=(
  "src/services/standardBufpayService.ts"
  "src/services/enhancedDataPreloader.ts" 
  "src/services/dataSyncConflictResolver.ts"
  "src/services/databaseHealthService.ts"
  "src/services/dataAccessLayer.ts"
  "src/services/userSettingsService.ts"
  "src/services/userDataService.ts"
)

# 逐个修复文件
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "🔧 修复文件: $file"
    
    # 注释掉静态导入
    sed -i.bak "s/import i18n from '@\/i18n';/\/\/ import i18n from '@\/i18n'; \/\/ 改为动态导入避免TDZ/g" "$file"
    
    # 替换常见的i18n.t()调用为直接字符串
    sed -i.bak "s/i18n\.t('common\.errors\.未知错误')/'未知错误'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.数据保存失败')/'数据保存失败'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.数据加载失败')/'数据加载失败'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.网络错误')/'网络错误'/g" "$file"
    sed -i.bak "s/i18n\.t('common\.errors\.操作失败')/'操作失败'/g" "$file"
    
    # 删除备份文件
    rm -f "$file.bak"
    
    echo "✅ $file 修复完成"
  else
    echo "⚠️ 文件不存在: $file"
  fi
done

echo "✅ 批量修复完成！"
#!/bin/bash

# 批量修复所有缺少useTranslation钩子的TSX文件
count=0
total=0

echo "开始批量修复useTranslation钩子问题..."

find src -name "*.tsx" | while read file; do
  if grep -q "\\bt(" "$file" 2>/dev/null; then
    if ! grep -q "const.*t.*=.*useTranslation\|useI18n" "$file" 2>/dev/null; then
      echo "修复 $file"
      
      # 检查是否已导入useTranslation
      if ! grep -q "import.*useTranslation" "$file"; then
        # 添加导入
        sed -i.bak '1i\
import { useTranslation } from '\''react-i18next'\'';' "$file"
      fi
      
      # 找到组件定义并添加钩子
      if grep -q "export.*function\|export.*=.*=>\|const.*=.*=>" "$file"; then
        # 查找组件函数开始位置
        line=$(grep -n "export.*function\|export.*=.*=>\|const.*=.*=>" "$file" | head -1 | cut -d: -f1)
        if [ ! -z "$line" ]; then
          # 在函数开始后添加useTranslation钩子
          next_line=$((line + 1))
          sed -i.bak "${next_line}i\\
  const { t } = useTranslation();" "$file"
          echo "✅ 已修复 $file"
          ((count++))
        fi
      fi
      ((total++))
    fi
  fi
done

echo "修复完成: $count/$total 个文件"

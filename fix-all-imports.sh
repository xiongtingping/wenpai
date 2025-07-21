#!/bin/bash

echo "🔧 全面修复导入问题..."

# 修复所有文件中的导入语句
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "import.*useAuth.*from.*@/contexts/AuthContext" "$file"; then
    echo "修复导入: $file"
    # 修复不同的导入格式
    sed -i '' 's|import { useAuth } from "@/contexts/AuthContext"|import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext"|g' "$file"
    sed -i '' 's|import { useAuth } from "@/contexts/AuthContext";|import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";|g' "$file"
    sed -i '' 's|import { useAuth } from "@/contexts/AuthContext"|import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext"|g' "$file"
    sed -i '' 's|import { useAuth } from "../contexts/AuthContext"|import { useUnifiedAuth } from "../contexts/UnifiedAuthContext"|g' "$file"
    sed -i '' 's|import { useAuth } from "../contexts/AuthContext";|import { useUnifiedAuth } from "../contexts/UnifiedAuthContext";|g' "$file"
  fi
done

# 修复所有文件中的useAuth()调用
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "useAuth()" "$file"; then
    echo "修复useAuth调用: $file"
    sed -i '' 's/useAuth()/useUnifiedAuth()/g' "$file"
  fi
done

echo "✅ 导入修复完成" 
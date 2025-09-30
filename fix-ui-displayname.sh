#!/bin/bash

# 🔧 批量修复UI组件中的Primitive.displayName安全访问
# 解决 "Cannot read properties of undefined (reading 'displayName')" TDZ错误

echo "🔧 开始批量修复UI组件displayName安全访问..."

# 定义需要修复的模式：Component.displayName = Primitive.displayName
# 替换为：Component.displayName = Primitive.displayName || 'Component'

# 查找所有需要修复的文件
files=$(find src/components/ui -name "*.tsx" -exec grep -l "\.displayName = .*Primitive.*\.displayName" {} \;)

if [ -z "$files" ]; then
    echo "❌ 没有找到需要修复的文件"
    exit 1
fi

echo "📂 找到需要修复的文件："
echo "$files"

# 备份计数器
backup_count=0

for file in $files; do
    echo "🔧 修复文件: $file"
    
    # 创建备份
    backup_file="${file}.backup.$(date +%s)"
    cp "$file" "$backup_file"
    backup_count=$((backup_count + 1))
    
    # 执行替换：在Primitive.displayName后添加安全检查
    # 匹配模式：ComponentName.displayName = PrimitiveName.displayName
    # 替换为：ComponentName.displayName = PrimitiveName.displayName || 'ComponentName'
    
    sed -i '' 's/\([A-Za-z][A-Za-z0-9]*\)\.displayName = \([A-Za-z][A-Za-z0-9]*Primitive[A-Za-z0-9]*\)\.\([A-Za-z][A-Za-z0-9]*\)\.displayName$/\1.displayName = \2.\3.displayName || "\1"/g' "$file"
    
    echo "✅ 修复完成: $file"
done

echo ""
echo "📊 修复总结："
echo "- 修复文件数量: $(echo "$files" | wc -l)"
echo "- 创建备份数量: $backup_count"
echo ""
echo "🔍 验证修复结果："

# 验证修复结果
for file in $files; do
    echo "📝 $file:"
    grep "\.displayName.*||" "$file" | head -3
done

echo ""
echo "✅ 批量修复完成！"
echo "💡 如果需要回滚，备份文件位于: *.backup.*"
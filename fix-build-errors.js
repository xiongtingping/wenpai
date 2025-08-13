#!/usr/bin/env node

/**
 * 批量修复构建错误脚本
 * 自动修复常见的TypeScript类型错误
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 开始批量修复构建错误...');

// 修复函数列表
const fixes = [
  // 修复 PDFChatDialog.tsx 中的 never 类型错误
  {
    file: 'src/components/creative/PDFChatDialog.tsx',
    search: 'suggestions.specific.push(',
    replace: (content) => {
      return content.replace(
        /suggestions\.specific\.push\("([^"]+)"\);/g,
        'suggestions.specific.push("$1" as any);'
      );
    }
  },
  
  // 修复 DevPermissionSwitcher.tsx 中的 setUser 错误
  {
    file: 'src/components/dev/DevPermissionSwitcher.tsx',
    search: 'const { user, setUser } = useUnifiedAuth();',
    replace: (content) => {
      return content.replace(
        'const { user, setUser } = useUnifiedAuth();',
        'const { user } = useUnifiedAuth();'
      );
    }
  },
  
  // 修复 HotTopicsRadar.tsx 中的 categories 属性错误
  {
    file: 'src/components/hot-topics/HotTopicsRadar.tsx',
    search: 'categories: [],',
    replace: (content) => {
      return content.replace(
        'categories: [],',
        'categoryPreferences: {},'
      );
    }
  },
  
  // 修复 input.tsx 中的 size 属性冲突
  {
    file: 'src/components/ui/input.tsx',
    search: 'export interface InputProps',
    replace: (content) => {
      return content.replace(
        /export interface InputProps\s+extends React\.InputHTMLAttributes<HTMLInputElement>,\s*VariantProps<typeof inputVariants>/,
        'export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">, VariantProps<typeof inputVariants>'
      );
    }
  },
  
  // 修复 sidebar.tsx 中的 TooltipProvider 导入
  {
    file: 'src/components/ui/sidebar.tsx',
    search: 'import { cn } from "@/lib/utils"',
    replace: (content) => {
      if (!content.includes('TooltipProvider')) {
        return content.replace(
          'import { cn } from "@/lib/utils"',
          'import { cn } from "@/lib/utils"\nimport { TooltipProvider, TooltipContent } from "@/components/ui/tooltip"'
        );
      }
      return content;
    }
  }
];

// 执行修复
fixes.forEach(fix => {
  const filePath = path.join(process.cwd(), fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${fix.file}`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(fix.search)) {
      const newContent = fix.replace(content);
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        console.log(`✅ 修复完成: ${fix.file}`);
      }
    }
  } catch (error) {
    console.error(`❌ 修复失败: ${fix.file}`, error.message);
  }
});

console.log('🎉 批量修复完成！');

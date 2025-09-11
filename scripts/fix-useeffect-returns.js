#!/usr/bin/env node

/**
 * 修复 useEffect 缺少返回值的问题
 * 这个脚本会查找所有有条件返回但缺少默认返回的 useEffect
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 查找所有 TypeScript/TSX 文件
const files = glob.sync('src/**/*.{ts,tsx}', { 
  ignore: ['node_modules/**', 'dist/**', '**/*.d.ts'] 
});

let fixedCount = 0;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 匹配 useEffect 模式，查找有条件返回但缺少默认返回的情况
    const useEffectRegex = /useEffect\(\(\) => \{([\s\S]*?)\}, \[.*?\]\);/g;
    
    content = content.replace(useEffectRegex, (match, body) => {
      // 检查是否有条件返回语句
      const hasConditionalReturn = /if\s*\([^)]+\)\s*\{[^}]*return[^}]*\}/.test(body);
      const hasUnconditionalReturn = /^\s*return\s+/.test(body.trim());
      
      if (hasConditionalReturn && !hasUnconditionalReturn && !body.includes('return undefined;')) {
        // 在最后添加 return undefined;
        const trimmedBody = body.trim();
        const newBody = trimmedBody + '\n    return undefined;';
        modified = true;
        return `useEffect(() => {\n${newBody}\n  }, [${match.match(/\[(.*?)\]/)[1]}]);`;
      }
      
      return match;
    });

    // 修复事件处理函数
    const eventHandlerRegex = /(\w+\.addEventListener\([^,]+,\s*)\(([^)]*)\)\s*=>\s*\{([\s\S]*?)\}/g;
    
    content = content.replace(eventHandlerRegex, (match, prefix, params, body) => {
      if (!body.includes('return') && body.trim().length > 0) {
        modified = true;
        return `${prefix}(${params}) => {\n${body}\n    return undefined;\n  }`;
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedCount++;
      console.log(`✅ Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files with useEffect return issues.`);

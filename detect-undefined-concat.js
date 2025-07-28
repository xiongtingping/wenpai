#!/usr/bin/env node

/**
 * 🔍 undefined拼接问题检测脚本
 * 扫描项目中可能导致"undefinedundefined"的危险模式
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 危险模式正则表达式
const dangerousPatterns = [
  {
    name: '用户属性直接拼接',
    regex: /user\?\.(\w+)\s*\|\|\s*user\?\.(\w+)/g,
    severity: 'high'
  },
  {
    name: '模板字符串中的用户属性',
    regex: /\$\{[^}]*user\?\.\w+[^}]*\}/g,
    severity: 'high'
  },
  {
    name: '字符串拼接用户属性',
    regex: /['"`][^'"`]*\$\{[^}]*user\?\.\w+[^}]*\}[^'"`]*['"`]/g,
    severity: 'medium'
  },
  {
    name: 'JSX中的用户属性拼接',
    regex: /\{[^}]*user\?\.\w+\s*\|\|\s*user\?\.\w+[^}]*\}/g,
    severity: 'high'
  },
  {
    name: 'alt属性中的用户属性',
    regex: /alt\s*=\s*\{[^}]*user\?\.\w+[^}]*\}/g,
    severity: 'medium'
  }
];

// 扫描文件
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];
    
    dangerousPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(content)) !== null) {
        const lines = content.substring(0, match.index).split('\n');
        const lineNumber = lines.length;
        const lineContent = lines[lines.length - 1] + match[0];
        
        results.push({
          file: filePath,
          line: lineNumber,
          pattern: pattern.name,
          severity: pattern.severity,
          match: match[0],
          context: lineContent.trim()
        });
      }
    });
    
    return results;
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error.message);
    return [];
  }
}

// 递归扫描目录
function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const results = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 跳过node_modules和其他不需要的目录
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          results.push(...scanDirectory(fullPath, extensions));
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (extensions.includes(ext)) {
          results.push(...scanFile(fullPath));
        }
      }
    }
  } catch (error) {
    console.error(`扫描目录失败: ${dir}`, error.message);
  }
  
  return results;
}

// 主函数
function main() {
  console.log('🔍 开始扫描undefined拼接问题...\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const results = scanDirectory(srcDir);
  
  if (results.length === 0) {
    console.log('✅ 未发现危险的undefined拼接模式');
    return;
  }
  
  console.log(`🚨 发现 ${results.length} 个潜在问题:\n`);
  
  // 按严重程度分组
  const grouped = results.reduce((acc, result) => {
    if (!acc[result.severity]) acc[result.severity] = [];
    acc[result.severity].push(result);
    return acc;
  }, {});
  
  // 输出结果
  ['high', 'medium', 'low'].forEach(severity => {
    if (grouped[severity]) {
      const icon = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢';
      console.log(`${icon} ${severity.toUpperCase()} 严重程度 (${grouped[severity].length}个):`);
      
      grouped[severity].forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.file}:${result.line}`);
        console.log(`     模式: ${result.pattern}`);
        console.log(`     代码: ${result.context}`);
        console.log(`     匹配: ${result.match}`);
        console.log('');
      });
    }
  });
  
  console.log('💡 修复建议:');
  console.log('1. 使用 getUserDisplayName(user, fallback) 替代直接拼接');
  console.log('2. 使用 getUserAvatar(user) 获取头像URL');
  console.log('3. 使用 getUserAltText(user, context) 生成alt文本');
  console.log('4. 导入: import { getUserDisplayName } from "@/utils/userDisplayUtils"');
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

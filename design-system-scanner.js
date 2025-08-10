#!/usr/bin/env node

/**
 * 设计系统扫描器 - 自动化检查硬编码颜色和设计令牌使用情况
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 硬编码颜色模式
const HARDCODED_PATTERNS = {
  textColors: [
    'text-blue-50', 'text-blue-100', 'text-blue-200', 'text-blue-300', 'text-blue-400',
    'text-blue-500', 'text-blue-600', 'text-blue-700', 'text-blue-800', 'text-blue-900',
    'text-white', 'text-black',
    'text-gray-50', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400',
    'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
    'text-slate-50', 'text-slate-100', 'text-slate-200', 'text-slate-300', 'text-slate-400',
    'text-slate-500', 'text-slate-600', 'text-slate-700', 'text-slate-800', 'text-slate-900'
  ],
  backgroundColors: [
    'bg-blue-50', 'bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400',
    'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800', 'bg-blue-900',
    'bg-white', 'bg-black',
    'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400',
    'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900',
    'bg-slate-50', 'bg-slate-100', 'bg-slate-200', 'bg-slate-300', 'bg-slate-400',
    'bg-slate-500', 'bg-slate-600', 'bg-slate-700', 'bg-slate-800', 'bg-slate-900'
  ],
  borderColors: [
    'border-blue-200', 'border-blue-300', 'border-blue-400', 'border-blue-500',
    'border-white', 'border-black',
    'border-gray-200', 'border-gray-300', 'border-gray-400', 'border-gray-500',
    'border-slate-200', 'border-slate-300', 'border-slate-400', 'border-slate-500'
  ]
};

// 正确的设计令牌映射
const DESIGN_TOKEN_MAPPING = {
  'text-white': 'text-primary-foreground',
  'text-black': 'text-primary',
  'text-gray-500': 'text-secondary',
  'text-gray-600': 'text-secondary',
  'text-gray-700': 'text-primary',
  'text-gray-800': 'text-primary',
  'text-gray-900': 'text-primary',
  'text-blue-500': 'text-accent',
  'text-blue-600': 'text-accent',
  'text-blue-700': 'text-accent',
  'bg-white': 'bg-background',
  'bg-gray-50': 'bg-background',
  'bg-gray-100': 'bg-accent',
  'bg-blue-50': 'bg-accent',
  'bg-blue-500': 'bg-primary',
  'border-gray-200': 'border-border',
  'border-blue-200': 'border-border'
};

// 扫描结果
let scanResults = {
  totalFiles: 0,
  scannedFiles: 0,
  totalIssues: 0,
  issuesByType: {},
  issuesByFile: {},
  summary: {}
};

/**
 * 扫描单个文件
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];
    
    lines.forEach((line, lineNumber) => {
      // 检查硬编码文字颜色
      HARDCODED_PATTERNS.textColors.forEach(pattern => {
        if (line.includes(pattern)) {
          issues.push({
            type: 'hardcoded-text-color',
            pattern: pattern,
            suggested: DESIGN_TOKEN_MAPPING[pattern] || 'text-primary',
            line: lineNumber + 1,
            content: line.trim(),
            severity: 'high'
          });
        }
      });
      
      // 检查硬编码背景颜色
      HARDCODED_PATTERNS.backgroundColors.forEach(pattern => {
        if (line.includes(pattern)) {
          issues.push({
            type: 'hardcoded-background-color',
            pattern: pattern,
            suggested: DESIGN_TOKEN_MAPPING[pattern] || 'bg-background',
            line: lineNumber + 1,
            content: line.trim(),
            severity: 'high'
          });
        }
      });
      
      // 检查硬编码边框颜色
      HARDCODED_PATTERNS.borderColors.forEach(pattern => {
        if (line.includes(pattern)) {
          issues.push({
            type: 'hardcoded-border-color',
            pattern: pattern,
            suggested: DESIGN_TOKEN_MAPPING[pattern] || 'border-border',
            line: lineNumber + 1,
            content: line.trim(),
            severity: 'medium'
          });
        }
      });
      
      // 检查内联样式
      if (line.includes('style=') && 
          (line.includes('color:') || line.includes('background-color:') || 
           line.includes('font-size:') || line.includes('font-weight:'))) {
        issues.push({
          type: 'inline-styles',
          pattern: 'style attribute',
          suggested: '使用Tailwind类替换内联样式',
          line: lineNumber + 1,
          content: line.trim(),
          severity: 'medium'
        });
      }
    });
    
    if (issues.length > 0) {
      scanResults.issuesByFile[filePath] = issues;
      scanResults.totalIssues += issues.length;
      
      // 按类型统计
      issues.forEach(issue => {
        if (!scanResults.issuesByType[issue.type]) {
          scanResults.issuesByType[issue.type] = 0;
        }
        scanResults.issuesByType[issue.type]++;
      });
    }
    
    scanResults.scannedFiles++;
    return issues;
    
  } catch (error) {
    console.error(`❌ 扫描文件失败: ${filePath}`, error.message);
    return [];
  }
}

/**
 * 递归扫描目录
 */
function scanDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // 跳过某些目录
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
          scanDirectory(itemPath, extensions);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          scanResults.totalFiles++;
          scanFile(itemPath);
        }
      }
    });
  } catch (error) {
    console.error(`❌ 扫描目录失败: ${dirPath}`, error.message);
  }
}

/**
 * 生成报告
 */
function generateReport() {
  console.log('\n🎨 设计系统扫描报告');
  console.log('=' .repeat(60));
  
  console.log(`\n📊 扫描统计:`);
  console.log(`  总文件数: ${scanResults.totalFiles}`);
  console.log(`  已扫描: ${scanResults.scannedFiles}`);
  console.log(`  总问题数: ${scanResults.totalIssues}`);
  
  if (scanResults.totalIssues === 0) {
    console.log('\n🎉 恭喜！没有发现设计系统问题！');
    return;
  }
  
  console.log(`\n📈 问题分类统计:`);
  Object.keys(scanResults.issuesByType).forEach(type => {
    const count = scanResults.issuesByType[type];
    const icon = type.includes('hardcoded') ? '🔴' : '🟡';
    console.log(`  ${icon} ${type}: ${count} 个`);
  });
  
  console.log(`\n📁 问题文件列表:`);
  const sortedFiles = Object.keys(scanResults.issuesByFile)
    .sort((a, b) => scanResults.issuesByFile[b].length - scanResults.issuesByFile[a].length);
  
  sortedFiles.slice(0, 10).forEach((filePath, index) => {
    const issues = scanResults.issuesByFile[filePath];
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`  ${index + 1}. ${relativePath} (${issues.length} 个问题)`);
    
    // 显示前3个问题
    issues.slice(0, 3).forEach(issue => {
      console.log(`     行${issue.line}: ${issue.pattern} → ${issue.suggested}`);
    });
    
    if (issues.length > 3) {
      console.log(`     ... 还有 ${issues.length - 3} 个问题`);
    }
  });
  
  if (sortedFiles.length > 10) {
    console.log(`  ... 还有 ${sortedFiles.length - 10} 个文件有问题`);
  }
  
  console.log(`\n🛠️ 修复建议:`);
  console.log(`  1. 优先修复硬编码颜色问题（高优先级）`);
  console.log(`  2. 将 text-blue-* 替换为 text-accent`);
  console.log(`  3. 将 text-gray-* 替换为 text-primary/text-secondary`);
  console.log(`  4. 将 bg-blue-* 替换为 bg-primary/bg-accent`);
  console.log(`  5. 将 bg-gray-* 替换为 bg-background/bg-accent`);
  console.log(`  6. 移除内联样式，使用Tailwind类`);
  
  // 生成修复脚本建议
  console.log(`\n📝 自动修复命令建议:`);
  console.log(`  # 批量替换常见硬编码颜色`);
  console.log(`  find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/text-gray-500/text-secondary/g'`);
  console.log(`  find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/text-gray-700/text-primary/g'`);
  console.log(`  find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/bg-gray-50/bg-background/g'`);
  console.log(`  find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/text-blue-500/text-accent/g'`);
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始设计系统扫描...');
  console.log('🔍 扫描目录: src/');
  
  const startTime = Date.now();
  
  // 扫描src目录
  if (fs.existsSync('src')) {
    scanDirectory('src');
  } else {
    console.error('❌ src目录不存在');
    process.exit(1);
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log(`✅ 扫描完成，耗时 ${duration.toFixed(2)} 秒`);
  
  // 生成报告
  generateReport();
  
  // 保存详细报告到文件
  const reportData = {
    timestamp: new Date().toISOString(),
    duration: duration,
    ...scanResults
  };
  
  fs.writeFileSync('design-system-scan-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n💾 详细报告已保存到: design-system-scan-report.json');
  
  // 退出码
  process.exit(scanResults.totalIssues > 0 ? 1 : 0);
}

// 运行扫描
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  scanFile,
  scanDirectory,
  generateReport,
  HARDCODED_PATTERNS,
  DESIGN_TOKEN_MAPPING
};

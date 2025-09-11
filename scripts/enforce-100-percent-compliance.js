#!/usr/bin/env node

/**
 * 强制实现100%样式系统合规性检查
 * 零容忍硬编码值，确保完美合规
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 100%合规性检查规则
const STRICT_COMPLIANCE_RULES = {
  // 🚫 零容忍硬编码颜色
  hardcodedColors: {
    patterns: [
      /#[0-9a-fA-F]{3,6}/g,                    // 十六进制颜色
      /rgb\([^)]+\)/g,                         // RGB颜色
      /rgba\([^)]+\)/g,                        // RGBA颜色
      /hsl\((?!var\(--)[^)]+\)/g,              // HSL颜色（非变量）
      /hsla\((?!var\(--)[^)]+\)/g,             // HSLA颜色（非变量）
    ],
    severity: 'error',
    tolerance: 0, // 零容忍
    message: '发现硬编码颜色值，必须使用设计令牌',
    autoFix: true
  },
  
  // 🚫 零容忍硬编码尺寸
  hardcodedSizes: {
    patterns: [
      /(?:width|height|margin|padding|top|left|right|bottom|font-size|border-radius|gap|space):\s*\d+(px|rem|em)(?!\s*\/\*\s*allowed\s*\*\/)/g,
    ],
    severity: 'error',
    tolerance: 0, // 零容忍
    message: '发现硬编码尺寸值，必须使用设计令牌',
    autoFix: true,
    exceptions: ['1px', '0px'] // 仅允许边框和零值
  },
  
  // 🚫 零容忍内联样式
  inlineStyles: {
    patterns: [
      /style\s*=\s*\{\{[^}]*(?:color|background|margin|padding|width|height|border|font):[^}]*\}\}/g,
    ],
    severity: 'error',
    tolerance: 0,
    message: '发现静态内联样式，必须使用CSS类或设计令牌',
    autoFix: false
  },
  
  // 🚫 零容忍Tailwind硬编码类
  tailwindHardcoded: {
    patterns: [
      /(?:bg|text|border)-(?:red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-\d+/g,
    ],
    severity: 'error',
    tolerance: 0,
    message: '发现硬编码Tailwind颜色类，必须使用语义化类',
    autoFix: true
  },
  
  // 🚫 限制!important使用
  importantOveruse: {
    patterns: [
      /!important(?!\s*\/\*\s*(?:override|fix|necessary)\s*\*\/)/g,
    ],
    severity: 'warning',
    tolerance: 5, // 最多允许5个
    message: '发现!important使用，请确认是否必要并添加注释',
    autoFix: false
  },
  
  // ✅ 强制使用设计令牌
  designTokenUsage: {
    patterns: [
      /var\(--[a-z][a-z0-9]*(?:-[a-z0-9]+)*\)/g,
    ],
    severity: 'info',
    message: '正确使用设计令牌',
    required: true
  }
};

// 自动修复映射
const AUTO_FIX_MAPPING = {
  // 颜色自动修复
  colors: {
    '#ffffff': 'hsl(var(--background))',
    '#000000': 'hsl(var(--foreground))',
    '#3b82f6': 'hsl(var(--primary))',
    '#ef4444': 'hsl(var(--destructive))',
    '#22c55e': 'hsl(var(--success))',
    '#f59e0b': 'hsl(var(--warning))',
    'rgb(255, 255, 255)': 'hsl(var(--background))',
    'rgb(0, 0, 0)': 'hsl(var(--foreground))',
  },
  
  // Tailwind类自动修复
  tailwindClasses: {
    'bg-white': 'bg-background',
    'bg-black': 'bg-foreground',
    'bg-blue-500': 'bg-primary',
    'bg-red-500': 'bg-destructive',
    'bg-green-500': 'bg-success',
    'bg-yellow-500': 'bg-warning',
    'text-white': 'text-background',
    'text-black': 'text-foreground',
    'text-blue-500': 'text-primary',
    'text-red-500': 'text-destructive',
    'text-green-500': 'text-success',
    'text-yellow-500': 'text-warning',
  },
  
  // 尺寸自动修复
  sizes: {
    '4px': 'var(--spacing-1)',
    '8px': 'var(--spacing-2)',
    '12px': 'var(--spacing-3)',
    '16px': 'var(--spacing-4)',
    '20px': 'var(--spacing-5)',
    '24px': 'var(--spacing-6)',
    '32px': 'var(--spacing-8)',
    '0.25rem': 'var(--spacing-1)',
    '0.5rem': 'var(--spacing-2)',
    '0.75rem': 'var(--spacing-3)',
    '1rem': 'var(--spacing-4)',
    '1.25rem': 'var(--spacing-5)',
    '1.5rem': 'var(--spacing-6)',
    '2rem': 'var(--spacing-8)',
  }
};

/**
 * 执行100%合规性检查
 */
function enforce100PercentCompliance(autoFix = false) {
  console.log('🎯 开始100%样式系统合规性检查...');
  
  const files = getAllFiles('./src');
  const results = {
    totalFiles: files.length,
    checkedFiles: 0,
    violations: [],
    fixed: [],
    summary: {
      errors: 0,
      warnings: 0,
      autoFixed: 0
    }
  };
  
  files.forEach(file => {
    const violations = checkFileCompliance(file, autoFix);
    results.violations.push(...violations);
    results.checkedFiles++;
    
    violations.forEach(violation => {
      if (violation.severity === 'error') {
        results.summary.errors++;
      } else if (violation.severity === 'warning') {
        results.summary.warnings++;
      }
      
      if (violation.fixed) {
        results.summary.autoFixed++;
        results.fixed.push(violation);
      }
    });
  });
  
  // 生成合规性报告
  generateComplianceReport(results);
  
  // 计算合规性评分
  const complianceScore = calculateComplianceScore(results);
  
  if (complianceScore === 100) {
    console.log('🎉 恭喜！已实现100%样式系统合规性！');
    return true;
  } else {
    console.log(`❌ 当前合规性评分: ${complianceScore}%`);
    console.log('🔧 请修复所有违规项以达到100%合规性');
    return false;
  }
}

/**
 * 检查单个文件合规性
 */
function checkFileCompliance(filePath, autoFix = false) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  const violations = [];
  
  Object.entries(STRICT_COMPLIANCE_RULES).forEach(([ruleName, rule]) => {
    if (!rule.patterns) return;
    
    rule.patterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      
      matches.forEach(match => {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        const line = content.split('\n')[lineNumber - 1];
        
        // 跳过注释中的匹配
        if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
          return;
        }
        
        // 检查例外情况
        if (rule.exceptions && rule.exceptions.includes(match[0])) {
          return;
        }
        
        const violation = {
          file: filePath,
          line: lineNumber,
          rule: ruleName,
          severity: rule.severity,
          message: rule.message,
          content: match[0],
          context: line.trim(),
          fixed: false
        };
        
        // 自动修复
        if (autoFix && rule.autoFix) {
          const fixedContent = applyAutoFix(match[0], ruleName);
          if (fixedContent !== match[0]) {
            modifiedContent = modifiedContent.replace(match[0], fixedContent);
            violation.fixed = true;
            violation.fixedTo = fixedContent;
          }
        }
        
        violations.push(violation);
      });
    });
  });
  
  // 保存修复后的文件
  if (autoFix && modifiedContent !== content) {
    fs.writeFileSync(filePath, modifiedContent);
  }
  
  return violations;
}

/**
 * 应用自动修复
 */
function applyAutoFix(value, ruleName) {
  switch (ruleName) {
    case 'hardcodedColors':
      return AUTO_FIX_MAPPING.colors[value] || value;
    
    case 'tailwindHardcoded':
      return AUTO_FIX_MAPPING.tailwindClasses[value] || value;
    
    case 'hardcodedSizes':
      // 提取尺寸值
      const sizeMatch = value.match(/(\d+(?:\.\d+)?)(px|rem|em)/);
      if (sizeMatch) {
        const [, num, unit] = sizeMatch;
        const key = `${num}${unit}`;
        return AUTO_FIX_MAPPING.sizes[key] || value;
      }
      return value;
    
    default:
      return value;
  }
}

/**
 * 计算合规性评分
 */
function calculateComplianceScore(results) {
  const totalViolations = results.summary.errors + results.summary.warnings;
  const totalChecks = results.checkedFiles * 10; // 假设每个文件平均10个检查点
  
  if (totalChecks === 0) return 100;
  
  // 错误权重更高
  const weightedViolations = results.summary.errors * 2 + results.summary.warnings;
  const score = Math.max(0, Math.round((1 - weightedViolations / totalChecks) * 100));
  
  return score;
}

/**
 * 生成合规性报告
 */
function generateComplianceReport(results) {
  console.log('\n📊 100%合规性检查报告');
  console.log('='.repeat(60));
  
  console.log(`📁 检查文件: ${results.checkedFiles} 个`);
  console.log(`❌ 错误: ${results.summary.errors} 个`);
  console.log(`⚠️ 警告: ${results.summary.warnings} 个`);
  console.log(`🔧 自动修复: ${results.summary.autoFixed} 个`);
  
  // 按规则分组显示违规
  const violationsByRule = {};
  results.violations.forEach(violation => {
    if (!violationsByRule[violation.rule]) {
      violationsByRule[violation.rule] = [];
    }
    violationsByRule[violation.rule].push(violation);
  });
  
  Object.entries(violationsByRule).forEach(([rule, violations]) => {
    console.log(`\n🔍 ${rule}: ${violations.length} 个违规`);
    violations.slice(0, 3).forEach(violation => {
      console.log(`  ${violation.file}:${violation.line} - ${violation.content}`);
      if (violation.fixed) {
        console.log(`    ✅ 已修复为: ${violation.fixedTo}`);
      }
    });
    if (violations.length > 3) {
      console.log(`  ... 还有 ${violations.length - 3} 个违规`);
    }
  });
  
  // 保存详细报告
  fs.writeFileSync(
    'style-compliance-100-percent-report.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n✅ 详细报告已保存到 style-compliance-100-percent-report.json');
}

/**
 * 获取所有文件
 */
function getAllFiles(dir) {
  const files = [];
  const extensions = ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss'];
  
  function scanDirectory(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
          scanDirectory(fullPath);
        } else if (stat.isFile() && extensions.includes(path.extname(fullPath))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️ 无法扫描目录: ${currentDir}`);
    }
  }
  
  scanDirectory(dir);
  return files;
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const autoFix = process.argv.includes('--fix');
  const success = enforce100PercentCompliance(autoFix);
  process.exit(success ? 0 : 1);
}

export { enforce100PercentCompliance };

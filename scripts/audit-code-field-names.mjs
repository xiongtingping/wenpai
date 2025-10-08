#!/usr/bin/env node
/**
 * 代码字段名审查脚本
 * 检查所有代码文件中是否使用了错误的字段名
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80));
}

// 需要检查的错误字段名模式
const FIELD_ISSUES = [
  {
    name: 'subscription_type (应该使用 tier)',
    pattern: /subscription_type/g,
    severity: 'CRITICAL',
    correctField: 'tier',
    description: 'user_subscriptions 表使用 tier 字段，不是 subscription_type'
  },
  {
    name: 'duration_type (应该使用 period)',
    pattern: /duration_type/g,
    severity: 'HIGH',
    correctField: 'period',
    description: 'user_subscriptions 表使用 period 字段，不是 duration_type',
    exceptions: ['orders 表中的 duration_type 是正确的']
  }
];

// 需要检查的目录
const DIRECTORIES_TO_CHECK = [
  'src/services',
  'src/hooks',
  'src/components',
  'src/features',
  'netlify/functions'
];

// 文件扩展名
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// 排除的文件和目录
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.deprecated',
  '.backup'
];

/**
 * 递归获取所有文件
 */
function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const relativePath = relative(rootDir, filePath);

    // 检查是否应该排除
    if (EXCLUDE_PATTERNS.some(pattern => relativePath.includes(pattern))) {
      return;
    }

    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (FILE_EXTENSIONS.some(ext => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * 检查文件中的字段名问题
 */
function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const relativePath = relative(rootDir, filePath);
  const issues = [];

  FIELD_ISSUES.forEach(issue => {
    const matches = content.match(issue.pattern);
    if (matches) {
      const lines = content.split('\n');
      const occurrences = [];

      lines.forEach((line, index) => {
        if (issue.pattern.test(line)) {
          occurrences.push({
            lineNumber: index + 1,
            line: line.trim(),
            context: lines.slice(Math.max(0, index - 1), Math.min(lines.length, index + 2))
          });
        }
      });

      issues.push({
        ...issue,
        file: relativePath,
        count: matches.length,
        occurrences
      });
    }
  });

  return issues;
}

/**
 * 主函数
 */
function main() {
  log('\n🔍 开始代码字段名审查...', 'cyan');

  const allIssues = {
    CRITICAL: [],
    HIGH: [],
    MEDIUM: [],
    LOW: []
  };

  let totalFiles = 0;
  let filesWithIssues = 0;

  // 检查每个目录
  DIRECTORIES_TO_CHECK.forEach(dir => {
    const fullPath = join(rootDir, dir);
    
    try {
      const files = getAllFiles(fullPath);
      totalFiles += files.length;

      files.forEach(file => {
        const issues = checkFile(file);
        if (issues.length > 0) {
          filesWithIssues++;
          issues.forEach(issue => {
            allIssues[issue.severity].push(issue);
          });
        }
      });
    } catch (error) {
      log(`⚠️ 无法检查目录 ${dir}: ${error.message}`, 'yellow');
    }
  });

  // 输出结果
  section('审查结果总结');
  
  log(`\n📊 统计信息:`, 'blue');
  log(`  - 检查文件总数: ${totalFiles}`, 'blue');
  log(`  - 发现问题文件: ${filesWithIssues}`, filesWithIssues > 0 ? 'yellow' : 'green');
  log(`  - CRITICAL 问题: ${allIssues.CRITICAL.length}`, allIssues.CRITICAL.length > 0 ? 'red' : 'green');
  log(`  - HIGH 问题: ${allIssues.HIGH.length}`, allIssues.HIGH.length > 0 ? 'yellow' : 'green');

  // 输出详细问题
  ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].forEach(severity => {
    if (allIssues[severity].length > 0) {
      section(`${severity} 级别问题`);

      const groupedByFile = {};
      allIssues[severity].forEach(issue => {
        if (!groupedByFile[issue.file]) {
          groupedByFile[issue.file] = [];
        }
        groupedByFile[issue.file].push(issue);
      });

      Object.entries(groupedByFile).forEach(([file, issues]) => {
        log(`\n📄 ${file}`, 'cyan');
        
        issues.forEach(issue => {
          log(`  ❌ ${issue.name}`, 'red');
          log(`     出现次数: ${issue.count}`, 'yellow');
          log(`     应该使用: ${issue.correctField}`, 'green');
          log(`     说明: ${issue.description}`, 'blue');

          if (issue.exceptions) {
            log(`     例外: ${issue.exceptions.join(', ')}`, 'magenta');
          }

          log(`\n     位置:`, 'yellow');
          issue.occurrences.slice(0, 3).forEach(occ => {
            log(`       第 ${occ.lineNumber} 行: ${occ.line}`, 'yellow');
          });

          if (issue.occurrences.length > 3) {
            log(`       ... 还有 ${issue.occurrences.length - 3} 处`, 'yellow');
          }
        });
      });
    }
  });

  // 生成修复建议
  section('修复建议');

  if (allIssues.CRITICAL.length > 0) {
    log('\n🚨 CRITICAL 问题必须立即修复:', 'red');
    log('   这些问题会导致 400/500 错误，影响核心功能', 'red');
    log('\n   修复步骤:', 'yellow');
    log('   1. 在每个文件中搜索 "subscription_type"', 'yellow');
    log('   2. 替换为 "tier"', 'yellow');
    log('   3. 确保上下文逻辑正确（如映射关系）', 'yellow');
    log('   4. 运行测试验证', 'yellow');
  }

  if (allIssues.HIGH.length > 0) {
    log('\n⚠️ HIGH 问题应尽快修复:', 'yellow');
    log('   这些问题可能导致数据不一致', 'yellow');
    log('\n   修复步骤:', 'yellow');
    log('   1. 检查是否在 orders 表上下文中（如果是，则正确）', 'yellow');
    log('   2. 如果在 user_subscriptions 上下文中，替换为 "period"', 'yellow');
    log('   3. 验证数据流向', 'yellow');
  }

  // 生成修复脚本建议
  if (filesWithIssues > 0) {
    section('自动修复脚本');
    
    log('\n可以使用以下命令批量替换（请先备份！）:', 'cyan');
    log('\n# 替换 subscription_type 为 tier', 'blue');
    log('find src netlify/functions -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \\) \\', 'yellow');
    log('  -exec sed -i.bak "s/subscription_type/tier/g" {} \\;', 'yellow');
    
    log('\n⚠️ 注意:', 'red');
    log('  - 这会创建 .bak 备份文件', 'yellow');
    log('  - 替换后需要手动检查每个文件', 'yellow');
    log('  - 某些上下文中的 duration_type 可能是正确的（orders 表）', 'yellow');
    log('  - 建议使用 IDE 的查找替换功能，逐个确认', 'yellow');
  }

  // 退出码
  if (allIssues.CRITICAL.length > 0) {
    log('\n❌ 发现 CRITICAL 问题，请立即修复', 'red');
    process.exit(1);
  } else if (allIssues.HIGH.length > 0) {
    log('\n⚠️ 发现 HIGH 问题，建议尽快修复', 'yellow');
    process.exit(1);
  } else {
    log('\n✅ 未发现严重问题', 'green');
    process.exit(0);
  }
}

main();


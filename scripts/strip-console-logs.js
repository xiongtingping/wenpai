#!/usr/bin/env node

/**
 * 🔧 生产环境Console.log清理工具
 * 
 * 解决问题：
 * 1. 自动清理生产环境中的调试日志
 * 2. 保留错误和警告日志
 * 3. 提供详细的清理报告
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class ConsoleLogStripper {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      logsRemoved: 0,
      errorsFound: 0,
      warningsFound: 0
    };
    
    // 需要清理的console方法
    this.stripMethods = ['log', 'debug', 'info', 'trace'];
    
    // 保留的console方法
    this.keepMethods = ['error', 'warn'];
  }

  /**
   * 处理单个文件
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      let modifiedContent = content;
      let removedCount = 0;

      // 匹配console.log等调试语句的正则表达式
      const consoleRegex = /console\.(log|debug|info|trace)\s*\([^)]*\);?/g;
      
      // 更复杂的多行console语句匹配
      const multiLineConsoleRegex = /console\.(log|debug|info|trace)\s*\(\s*[\s\S]*?\);?/g;
      
      // 替换单行console语句
      modifiedContent = modifiedContent.replace(consoleRegex, (match) => {
        removedCount++;
        return `// STRIPPED: ${match}`;
      });
      
      // 处理多行console语句
      modifiedContent = modifiedContent.replace(multiLineConsoleRegex, (match) => {
        if (!match.includes('// STRIPPED:')) {
          removedCount++;
          return `// STRIPPED: ${match}`;
        }
        return match;
      });

      // 统计保留的错误和警告日志
      const errorMatches = content.match(/console\.error/g) || [];
      const warnMatches = content.match(/console\.warn/g) || [];
      
      this.stats.errorsFound += errorMatches.length;
      this.stats.warningsFound += warnMatches.length;

      // 如果有修改，写回文件
      if (modifiedContent !== originalContent) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        console.log(`✅ 处理文件: ${filePath} (移除 ${removedCount} 个日志)`);
      }

      this.stats.filesProcessed++;
      this.stats.logsRemoved += removedCount;

    } catch (error) {
      console.error(`❌ 处理文件失败: ${filePath}`, error.message);
    }
  }

  /**
   * 处理目录中的所有文件
   */
  processDirectory(directory) {
    console.log(`🔍 扫描目录: ${directory}`);
    
    const patterns = [
      `${directory}/**/*.ts`,
      `${directory}/**/*.tsx`,
      `${directory}/**/*.js`,
      `${directory}/**/*.jsx`
    ];

    patterns.forEach(pattern => {
      const files = glob.sync(pattern, {
        ignore: [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/*.d.ts',
          '**/scripts/**'
        ]
      });

      files.forEach(file => this.processFile(file));
    });
  }

  /**
   * 生成清理报告
   */
  generateReport() {
    console.log('\n📊 Console.log清理报告:');
    console.log('================================');
    console.log(`📁 处理文件数: ${this.stats.filesProcessed}`);
    console.log(`🗑️  移除日志数: ${this.stats.logsRemoved}`);
    console.log(`❌ 保留错误日志: ${this.stats.errorsFound}`);
    console.log(`⚠️  保留警告日志: ${this.stats.warningsFound}`);
    console.log('================================');
    
    if (this.stats.logsRemoved > 0) {
      console.log('✅ 生产环境日志清理完成！');
    } else {
      console.log('ℹ️  没有发现需要清理的日志');
    }
  }

  /**
   * 验证清理结果
   */
  verifyCleanup(directory) {
    console.log('\n🔍 验证清理结果...');
    
    const patterns = [
      `${directory}/**/*.ts`,
      `${directory}/**/*.tsx`,
      `${directory}/**/*.js`,
      `${directory}/**/*.jsx`
    ];

    let remainingLogs = 0;
    
    patterns.forEach(pattern => {
      const files = glob.sync(pattern, {
        ignore: [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/*.d.ts',
          '**/scripts/**'
        ]
      });

      files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.match(/console\.(log|debug|info|trace)/g) || [];
        
        // 排除已经被标记为STRIPPED的
        const activeMatches = matches.filter(match => 
          !content.includes(`// STRIPPED: ${match}`)
        );
        
        if (activeMatches.length > 0) {
          remainingLogs += activeMatches.length;
          console.log(`⚠️  ${file}: 发现 ${activeMatches.length} 个未清理的日志`);
        }
      });
    });

    if (remainingLogs === 0) {
      console.log('✅ 验证通过：没有发现遗留的调试日志');
    } else {
      console.log(`❌ 验证失败：发现 ${remainingLogs} 个遗留的调试日志`);
      process.exit(1);
    }
  }

  /**
   * 恢复被清理的日志（用于开发环境）
   */
  restoreLogs(directory) {
    console.log('🔄 恢复被清理的日志...');
    
    const patterns = [
      `${directory}/**/*.ts`,
      `${directory}/**/*.tsx`,
      `${directory}/**/*.js`,
      `${directory}/**/*.jsx`
    ];

    let restoredCount = 0;

    patterns.forEach(pattern => {
      const files = glob.sync(pattern, {
        ignore: [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/*.d.ts'
        ]
      });

      files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const restoredContent = content.replace(/\/\/ STRIPPED: (console\.(log|debug|info|trace).*)/g, '$1');
        
        if (restoredContent !== content) {
          fs.writeFileSync(file, restoredContent, 'utf8');
          restoredCount++;
        }
      });
    });

    console.log(`✅ 恢复完成：处理了 ${restoredCount} 个文件`);
  }
}

// 命令行接口
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'strip';
  const directory = args[1] || 'src';

  const stripper = new ConsoleLogStripper();

  switch (command) {
    case 'strip':
      console.log('🧹 开始清理生产环境console.log...');
      stripper.processDirectory(directory);
      stripper.generateReport();
      stripper.verifyCleanup(directory);
      break;

    case 'verify':
      stripper.verifyCleanup(directory);
      break;

    case 'restore':
      stripper.restoreLogs(directory);
      break;

    default:
      console.log('用法:');
      console.log('  node strip-console-logs.js strip [directory]   # 清理日志');
      console.log('  node strip-console-logs.js verify [directory] # 验证清理');
      console.log('  node strip-console-logs.js restore [directory] # 恢复日志');
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ConsoleLogStripper;

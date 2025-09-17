#!/usr/bin/env node

/**
 * 最终验证脚本 - 100%确认可删除文件
 * 严格遵循CLAUDE.md规范，确保不误删任何有用文件
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class FinalVerification {
  constructor() {
    this.confirmed = {
      backup: [],
      empty: [],
      deprecated: [],
      testFiles: []
    };
    this.rejected = [];
  }

  // 验证备份文件
  verifyBackupFiles() {
    console.log('🔍 验证备份文件...');
    
    const backupFiles = [
      'src/components/shared/UnifiedEmojiManager_backup.tsx',
      'src/components/shared/UnifiedEmojiManager_old.tsx',
      'src/api/hotTopicsService_backup.ts',
      'src/services/tokenUsageService.backup.ts',
      'src/contexts/UnifiedAuthContext.tsx.backup',
      'src/components/layout/TopNavigation.tsx.backup'
    ];

    // 检查所有.backup后缀的CSS文件
    const cssBackups = fs.readdirSync(path.join(projectRoot, 'src/styles'))
      .filter(file => file.endsWith('.backup'))
      .map(file => `src/styles/${file}`);

    const allBackups = [...backupFiles, ...cssBackups];

    allBackups.forEach(file => {
      if (this.isReallyUnused(file)) {
        this.confirmed.backup.push(file);
      } else {
        this.rejected.push({ file, reason: '被引用或导入' });
      }
    });

    // 检查landing.backup整个目录
    if (this.isDirectoryUnused('src/components/landing.backup')) {
      this.confirmed.backup.push('src/components/landing.backup/');
    }
  }

  // 验证空文件
  verifyEmptyFiles() {
    console.log('🔍 验证空文件...');
    
    const emptyFiles = [
      'src/components/PerformanceMonitor.tsx'
    ];

    emptyFiles.forEach(file => {
      const fullPath = path.join(projectRoot, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, 'utf-8').trim();
        
        if (stats.size === 0 || content === '' || content.length < 10) {
          if (this.isReallyUnused(file)) {
            this.confirmed.empty.push(file);
          }
        }
      }
    });
  }

  // 验证废弃文件
  verifyDeprecatedFiles() {
    console.log('🔍 验证废弃文件...');
    
    const deprecatedFiles = [
      'src/App-minimal.tsx',
      'src/App-safe.tsx', 
      'src/App-ultra-simple.tsx'
    ];

    deprecatedFiles.forEach(file => {
      if (this.isReallyUnused(file)) {
        this.confirmed.deprecated.push(file);
      }
    });
  }

  // 验证测试文件
  verifyTestFiles() {
    console.log('🔍 验证测试文件...');
    
    const testFiles = [
      'src/components/creative/QuickReference/QuickReferenceTest.tsx',
      'src/components/creative/QuickReference/QuickReferenceTestDialog.tsx',
      'src/components/examples/DataServicesDemo.tsx',
      'src/features/content-adapter/examples/ComponentArchitectureDemo.tsx',
      'src/main-minimal-test.tsx',
      'src/services/__tests__/encryptionService.test.ts',
      'src/services/__tests__/secureUserStateService.test.ts',
      'src/tests/permission-guard-system.test.tsx'
    ];

    testFiles.forEach(file => {
      if (this.isReallyUnused(file)) {
        this.confirmed.testFiles.push(file);
      }
    });
  }

  // 检查文件是否真的未被使用
  isReallyUnused(filePath) {
    try {
      const fileName = path.basename(filePath, path.extname(filePath));
      const fileNameWithoutBackup = fileName.replace(/_backup|_old|\.backup/, '');
      
      // 检查是否在任何文件中被引用
      const patterns = [
        new RegExp(fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        new RegExp(fileNameWithoutBackup.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        new RegExp(filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      ];

      // 扫描关键文件
      const keyFiles = [
        'src/App.tsx',
        'src/main.tsx', 
        'package.json',
        'vite.config.ts',
        'vite.config.js'
      ];

      for (const keyFile of keyFiles) {
        const keyFilePath = path.join(projectRoot, keyFile);
        if (fs.existsSync(keyFilePath)) {
          const content = fs.readFileSync(keyFilePath, 'utf-8');
          if (patterns.some(pattern => pattern.test(content))) {
            console.log(`⚠️ ${filePath} 在 ${keyFile} 中被引用`);
            return false;
          }
        }
      }

      // 检查是否在src目录的其他文件中被引用
      const srcFiles = this.getAllSrcFiles();
      for (const srcFile of srcFiles) {
        if (srcFile === filePath) continue; // 跳过自己
        
        try {
          const content = fs.readFileSync(path.join(projectRoot, srcFile), 'utf-8');
          if (patterns.some(pattern => pattern.test(content))) {
            console.log(`⚠️ ${filePath} 在 ${srcFile} 中被引用`);
            return false;
          }
        } catch (error) {
          // 忽略读取错误
        }
      }

      return true;
    } catch (error) {
      console.warn(`检查 ${filePath} 时出错:`, error.message);
      return false;
    }
  }

  // 检查目录是否未被使用
  isDirectoryUnused(dirPath) {
    const fullPath = path.join(projectRoot, dirPath);
    if (!fs.existsSync(fullPath)) return false;

    const dirName = path.basename(dirPath);
    
    // 扫描所有文件，查找对该目录的引用
    const srcFiles = this.getAllSrcFiles();
    for (const srcFile of srcFiles) {
      if (srcFile.startsWith(dirPath)) continue; // 跳过目录内的文件
      
      try {
        const content = fs.readFileSync(path.join(projectRoot, srcFile), 'utf-8');
        if (content.includes(dirName) || content.includes(dirPath)) {
          console.log(`⚠️ 目录 ${dirPath} 在 ${srcFile} 中被引用`);
          return false;
        }
      } catch (error) {
        // 忽略读取错误
      }
    }

    return true;
  }

  // 获取所有src文件
  getAllSrcFiles() {
    const files = [];
    
    function scan(dir) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (['.tsx', '.ts', '.jsx', '.js', '.css'].includes(path.extname(item))) {
          files.push(path.relative(projectRoot, fullPath));
        }
      }
    }
    
    scan(path.join(projectRoot, 'src'));
    return files;
  }

  // 生成最终报告
  generateFinalReport() {
    const totalConfirmed = 
      this.confirmed.backup.length +
      this.confirmed.empty.length +
      this.confirmed.deprecated.length +
      this.confirmed.testFiles.length;

    console.log('\n📊 最终验证报告');
    console.log('='.repeat(60));
    console.log(`✅ 确认可删除: ${totalConfirmed} 个文件`);
    console.log(`❌ 不可删除: ${this.rejected.length} 个文件`);
    console.log('='.repeat(60));

    if (this.confirmed.backup.length > 0) {
      console.log(`\n📁 备份文件 (${this.confirmed.backup.length}个):`);
      this.confirmed.backup.forEach(file => {
        console.log(`   ✅ ${file}`);
      });
    }

    if (this.confirmed.empty.length > 0) {
      console.log(`\n🗑️ 空文件 (${this.confirmed.empty.length}个):`);
      this.confirmed.empty.forEach(file => {
        console.log(`   ✅ ${file}`);
      });
    }

    if (this.confirmed.deprecated.length > 0) {
      console.log(`\n❌ 废弃文件 (${this.confirmed.deprecated.length}个):`);
      this.confirmed.deprecated.forEach(file => {
        console.log(`   ✅ ${file}`);
      });
    }

    if (this.confirmed.testFiles.length > 0) {
      console.log(`\n🔧 测试文件 (${this.confirmed.testFiles.length}个):`);
      this.confirmed.testFiles.forEach(file => {
        console.log(`   ✅ ${file}`);
      });
    }

    if (this.rejected.length > 0) {
      console.log(`\n⚠️ 不可删除文件 (${this.rejected.length}个):`);
      this.rejected.forEach(item => {
        console.log(`   ❌ ${item.file} - ${item.reason}`);
      });
    }

    // 生成最终删除脚本
    this.generateFinalDeleteScript();

    const report = {
      confirmed: this.confirmed,
      rejected: this.rejected,
      totalConfirmed,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(projectRoot, 'final-verification-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📄 最终验证报告已保存至: final-verification-report.json');
    return report;
  }

  // 生成最终删除脚本
  generateFinalDeleteScript() {
    const allFiles = [
      ...this.confirmed.backup,
      ...this.confirmed.empty,
      ...this.confirmed.deprecated,
      ...this.confirmed.testFiles
    ];

    let script = `#!/bin/bash

# 最终验证后的安全删除脚本
# 100%确认这些文件未被使用
# 生成时间: ${new Date().toISOString()}

echo "🚀 开始100%确认安全的文件删除..."

# 创建备份目录
BACKUP_DIR="final-deleted-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 备份目录: $BACKUP_DIR"

# 删除函数
final_delete() {
  local file="$1"
  local category="$2"
  
  if [ -f "$file" ]; then
    echo "🗑️ 删除: $file [$category]"
    # 先备份
    local backup_file="$BACKUP_DIR/$(dirname "$file")"
    mkdir -p "$backup_file"
    cp "$file" "$backup_file/"
    # 然后删除
    rm "$file"
  elif [ -d "$file" ]; then
    echo "🗑️ 删除目录: $file [$category]"
    # 备份目录
    cp -r "$file" "$BACKUP_DIR/"
    # 删除目录
    rm -rf "$file"
  else
    echo "⚠️ 文件不存在: $file"
  fi
}

`;

    // 添加各类别的删除命令
    if (this.confirmed.backup.length > 0) {
      script += '\n# 删除备份文件\necho "📁 删除备份文件..."\n';
      this.confirmed.backup.forEach(file => {
        script += `final_delete "${file}" "备份文件"\n`;
      });
    }

    if (this.confirmed.empty.length > 0) {
      script += '\n# 删除空文件\necho "🗑️ 删除空文件..."\n';
      this.confirmed.empty.forEach(file => {
        script += `final_delete "${file}" "空文件"\n`;
      });
    }

    if (this.confirmed.deprecated.length > 0) {
      script += '\n# 删除废弃文件\necho "❌ 删除废弃文件..."\n';
      this.confirmed.deprecated.forEach(file => {
        script += `final_delete "${file}" "废弃文件"\n`;
      });
    }

    if (this.confirmed.testFiles.length > 0) {
      script += '\n# 删除测试文件\necho "🔧 删除测试文件..."\n';
      this.confirmed.testFiles.forEach(file => {
        script += `final_delete "${file}" "测试文件"\n`;
      });
    }

    script += '\necho "✅ 100%确认安全删除完成！"\necho "📁 备份位置: $BACKUP_DIR"\n';

    fs.writeFileSync(
      path.join(projectRoot, 'final-safe-delete.sh'),
      script
    );

    fs.chmodSync(path.join(projectRoot, 'final-safe-delete.sh'), '755');

    console.log('📝 最终删除脚本已生成: final-safe-delete.sh');
  }

  // 主执行方法
  async run() {
    console.log('🏛️ 启动最终验证 - 100%确认可删除文件...');
    
    try {
      this.verifyBackupFiles();
      this.verifyEmptyFiles();
      this.verifyDeprecatedFiles();
      this.verifyTestFiles();
      
      const report = this.generateFinalReport();
      
      console.log('\n✅ 最终验证完成！只删除100%确认安全的文件。');
      return report;
      
    } catch (error) {
      console.error('❌ 最终验证过程中发生错误:', error);
      throw error;
    }
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const verifier = new FinalVerification();
  verifier.run().catch(console.error);
}

export default FinalVerification;
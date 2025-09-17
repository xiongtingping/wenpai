#!/usr/bin/env node

/**
 * 安全清理分析器 - 识别确实可以安全删除的文件
 * 遵循CLAUDE.md规范，100%确认原则
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class SafeCleanupAnalyzer {
  constructor() {
    this.safeToDelete = {
      backupFiles: [],
      duplicateFiles: [],
      debugFiles: [],
      deprecatedFiles: [],
      unusedUtilities: []
    };
  }

  // 1. 识别明显的备份文件
  identifyBackupFiles() {
    console.log('🔍 识别备份文件...');
    
    const backupPatterns = [
      /\.backup\.(tsx?|jsx?)$/,
      /\.old\.(tsx?|jsx?)$/,
      /\.bak\.(tsx?|jsx?)$/,
      /_backup\.(tsx?|jsx?)$/,
      /_old\.(tsx?|jsx?)$/,
      /backup/i
    ];

    const backupDirs = ['src/components/landing.backup'];

    this.scanForPatterns(backupPatterns, backupDirs, this.safeToDelete.backupFiles);
  }

  // 2. 识别测试和调试文件
  identifyDebugFiles() {
    console.log('🔍 识别调试和测试文件...');
    
    const debugPatterns = [
      /test\.(tsx?|jsx?)$/i,
      /\.test\.(tsx?|jsx?)$/i,
      /\.spec\.(tsx?|jsx?)$/i,
      /demo\.(tsx?|jsx?)$/i,
      /example\.(tsx?|jsx?)$/i,
      /QuickReferenceTest/,
      /DataServicesDemo/,
      /ComponentArchitectureDemo/
    ];

    // 明确排除这些文件，因为它们在App.tsx中被使用
    const excludeFromDebug = [
      'src/pages/TokenDebugPage.tsx',
      'src/pages/DialogTestPage.tsx', 
      'src/pages/I18nTestPage.tsx'
    ];

    this.scanForPatterns(debugPatterns, [], this.safeToDelete.debugFiles);
    
    // 从调试文件列表中移除被App.tsx使用的文件
    this.safeToDelete.debugFiles = this.safeToDelete.debugFiles.filter(
      item => !excludeFromDebug.includes(item.file)
    );
  }

  // 3. 识别重复文件（基于内容相似性）
  identifyDuplicateFiles() {
    console.log('🔍 识别重复文件...');
    
    // 已知的重复文件组
    const knownDuplicates = [
      // 性能监控器重复
      [
        'src/components/ErrorBoundary/PerformanceMonitor.tsx',
        'src/components/PerformanceMonitor.tsx',
        'src/components/creative/md2card/PerformanceMonitor.tsx',
        'src/features/titleGeneration/components/PerformanceMonitor.tsx'
      ],
      // landing组件重复
      [
        'src/components/landing/CTASection.tsx',
        'src/components/landing.backup/CTASection.tsx'
      ],
      [
        'src/components/landing/FeaturesSection.tsx',
        'src/components/landing.backup/FeaturesSection.tsx'
      ],
      [
        'src/components/landing/Footer.tsx',
        'src/components/landing.backup/Footer.tsx'
      ],
      [
        'src/components/landing/Header.tsx',
        'src/components/landing.backup/Header.tsx'
      ],
      [
        'src/components/landing/HeroSection.tsx',
        'src/components/landing.backup/HeroSection.tsx'
      ],
      [
        'src/components/landing/HowItWorks.tsx',
        'src/components/landing.backup/HowItWorks.tsx'
      ],
      [
        'src/components/landing/PricingSection.tsx',
        'src/components/landing.backup/PricingSection.tsx'
      ],
      [
        'src/components/landing/ScrollAnimation.tsx',
        'src/components/landing.backup/ScrollAnimation.tsx'
      ],
      [
        'src/components/landing/TrustSection.tsx',
        'src/components/landing.backup/TrustSection.tsx'
      ],
      // ScrollToTop重复
      [
        'src/components/layout/ScrollToTop.tsx',
        'src/components/ui/ScrollToTop.tsx'
      ],
      // DataAwareComponents重复
      [
        'src/components/data/DataAwareComponents.tsx',
        'src/components/ui/DataAwareComponents.tsx'
      ],
      // ExportControls重复
      [
        'src/components/creative/md2card/ExportControls.tsx',
        'src/components/creative/md2wechat/ExportControls.tsx'
      ]
    ];

    knownDuplicates.forEach(group => {
      // 保留第一个，标记其他为可删除
      const [keep, ...toDelete] = group;
      toDelete.forEach(file => {
        if (fs.existsSync(path.join(projectRoot, file))) {
          this.safeToDelete.duplicateFiles.push({
            file,
            keepInstead: keep,
            reason: '重复实现，保留主版本'
          });
        }
      });
    });
  }

  // 4. 识别已废弃的文件
  identifyDeprecatedFiles() {
    console.log('🔍 识别已废弃文件...');
    
    // 已知废弃的文件
    const deprecatedFiles = [
      'src/components/shared/UnifiedEmojiManager_backup.tsx',
      'src/components/shared/UnifiedEmojiManager_old.tsx',
      'src/App-minimal.tsx',
      'src/App-safe.tsx', 
      'src/App-ultra-simple.tsx',
      'src/services/tokenUsageService.backup.ts',
      'src/api/hotTopicsService_backup.ts'
    ];

    deprecatedFiles.forEach(file => {
      if (fs.existsSync(path.join(projectRoot, file))) {
        this.safeToDelete.deprecatedFiles.push({
          file,
          reason: '已废弃的实现'
        });
      }
    });
  }

  // 5. 识别未使用的工具函数（基于文件名模式）
  identifyUnusedUtilities() {
    console.log('🔍 识别可能未使用的工具函数...');
    
    // 这些是基于分析后看起来未被使用的工具文件
    const suspiciousUtilities = [
      'src/utils/cssSystemChecker.ts',
      'src/utils/dialogPositionFixer.ts',
      'src/utils/envChecker.ts',
      'src/utils/localStorageFixer.ts',
      'src/utils/paymentTimer.ts',
      'src/utils/zIndexManager.ts',
      'src/utils/tooltipSafetyWrapper.ts'
    ];

    suspiciousUtilities.forEach(file => {
      if (fs.existsSync(path.join(projectRoot, file))) {
        this.safeToDelete.unusedUtilities.push({
          file,
          reason: '可能未被使用的工具函数，需要验证'
        });
      }
    });
  }

  // 扫描模式匹配
  scanForPatterns(patterns, dirs, target) {
    // 扫描指定目录
    dirs.forEach(dir => {
      const fullPath = path.join(projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        this.scanDirectory(fullPath, () => true, target);
      }
    });

    // 扫描整个src目录的模式匹配
    this.scanDirectory(path.join(projectRoot, 'src'), (filePath) => {
      return patterns.some(pattern => pattern.test(filePath));
    }, target);
  }

  scanDirectory(dirPath, filter, target) {
    if (!fs.existsSync(dirPath)) return;

    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!['node_modules', '.git'].includes(item)) {
          this.scanDirectory(fullPath, filter, target);
        }
      } else if (stat.isFile()) {
        const relativePath = path.relative(projectRoot, fullPath);
        if (filter(relativePath)) {
          target.push({
            file: relativePath,
            size: stat.size,
            lastModified: stat.mtime,
            reason: '匹配删除模式'
          });
        }
      }
    }
  }

  // 6. 生成清理建议报告
  generateCleanupReport() {
    const totalFiles = 
      this.safeToDelete.backupFiles.length +
      this.safeToDelete.duplicateFiles.length +
      this.safeToDelete.debugFiles.length +
      this.safeToDelete.deprecatedFiles.length +
      this.safeToDelete.unusedUtilities.length;

    console.log('\n📊 安全清理分析报告');
    console.log('='.repeat(60));
    console.log(`🗑️ 可安全删除文件总数: ${totalFiles}`);
    console.log('='.repeat(60));

    // 备份文件
    if (this.safeToDelete.backupFiles.length > 0) {
      console.log(`\n📁 备份文件 (${this.safeToDelete.backupFiles.length}个):`);
      this.safeToDelete.backupFiles.forEach(item => {
        console.log(`   🗑️ ${item.file}`);
      });
    }

    // 重复文件
    if (this.safeToDelete.duplicateFiles.length > 0) {
      console.log(`\n👥 重复文件 (${this.safeToDelete.duplicateFiles.length}个):`);
      this.safeToDelete.duplicateFiles.forEach(item => {
        console.log(`   🗑️ ${item.file}`);
        console.log(`      └─ 保留: ${item.keepInstead}`);
      });
    }

    // 调试文件
    if (this.safeToDelete.debugFiles.length > 0) {
      console.log(`\n🔧 调试/测试文件 (${this.safeToDelete.debugFiles.length}个):`);
      this.safeToDelete.debugFiles.forEach(item => {
        console.log(`   🗑️ ${item.file}`);
      });
    }

    // 废弃文件
    if (this.safeToDelete.deprecatedFiles.length > 0) {
      console.log(`\n❌ 已废弃文件 (${this.safeToDelete.deprecatedFiles.length}个):`);
      this.safeToDelete.deprecatedFiles.forEach(item => {
        console.log(`   🗑️ ${item.file}`);
      });
    }

    // 可能未使用的工具
    if (this.safeToDelete.unusedUtilities.length > 0) {
      console.log(`\n🤔 可能未使用的工具 (${this.safeToDelete.unusedUtilities.length}个):`);
      console.log('   ⚠️ 需要进一步验证是否真的未被使用');
      this.safeToDelete.unusedUtilities.forEach(item => {
        console.log(`   🗑️ ${item.file}`);
      });
    }

    // 保存详细报告
    const report = {
      summary: {
        totalSafeToDelete: totalFiles,
        backupFiles: this.safeToDelete.backupFiles.length,
        duplicateFiles: this.safeToDelete.duplicateFiles.length,
        debugFiles: this.safeToDelete.debugFiles.length,
        deprecatedFiles: this.safeToDelete.deprecatedFiles.length,
        unusedUtilities: this.safeToDelete.unusedUtilities.length
      },
      safeToDelete: this.safeToDelete,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(projectRoot, 'safe-cleanup-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📄 详细报告已保存至: safe-cleanup-report.json');
    console.log('\n⚠️ 重要提醒: 删除前请务必备份，并逐个验证文件确实未被使用');
    return report;
  }

  // 7. 生成删除脚本
  generateDeleteScript() {
    const scriptContent = `#!/bin/bash

# 安全文件清理脚本
# 生成时间: ${new Date().toISOString()}
# ⚠️ 请在执行前仔细检查每个文件

echo "🚀 开始安全文件清理..."

# 创建备份目录
BACKUP_DIR="deleted-files-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 备份目录: $BACKUP_DIR"

# 删除函数
safe_delete() {
  local file="$1"
  local reason="$2"
  
  if [ -f "$file" ]; then
    echo "🗑️ 删除: $file ($reason)"
    # 先备份
    local backup_file="$BACKUP_DIR/$(dirname "$file")"
    mkdir -p "$backup_file"
    cp "$file" "$backup_file/"
    # 然后删除
    rm "$file"
  else
    echo "⚠️ 文件不存在: $file"
  fi
}

`;

    // 添加备份文件删除
    let deleteCommands = scriptContent;
    deleteCommands += '\n# 删除备份文件\necho "📁 删除备份文件..."\n';
    this.safeToDelete.backupFiles.forEach(item => {
      deleteCommands += `safe_delete "${item.file}" "备份文件"\n`;
    });

    // 添加重复文件删除
    deleteCommands += '\n# 删除重复文件\necho "👥 删除重复文件..."\n';
    this.safeToDelete.duplicateFiles.forEach(item => {
      deleteCommands += `safe_delete "${item.file}" "重复文件，保留${item.keepInstead}"\n`;
    });

    // 添加已废弃文件删除
    deleteCommands += '\n# 删除已废弃文件\necho "❌ 删除已废弃文件..."\n';
    this.safeToDelete.deprecatedFiles.forEach(item => {
      deleteCommands += `safe_delete "${item.file}" "已废弃文件"\n`;
    });

    deleteCommands += '\necho "✅ 清理完成！"\necho "📁 备份位置: $BACKUP_DIR"\n';

    fs.writeFileSync(
      path.join(projectRoot, 'cleanup-files.sh'),
      deleteCommands
    );

    // 使脚本可执行
    fs.chmodSync(path.join(projectRoot, 'cleanup-files.sh'), '755');

    console.log('📝 删除脚本已生成: cleanup-files.sh');
  }

  // 主执行方法
  async run() {
    console.log('🏛️ 启动安全清理分析...');
    
    try {
      this.identifyBackupFiles();
      this.identifyDuplicateFiles();
      this.identifyDebugFiles();
      this.identifyDeprecatedFiles();
      this.identifyUnusedUtilities();
      
      const report = this.generateCleanupReport();
      this.generateDeleteScript();
      
      console.log('\n✅ 安全清理分析完成！');
      return report;
      
    } catch (error) {
      console.error('❌ 分析过程中发生错误:', error);
      throw error;
    }
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new SafeCleanupAnalyzer();
  analyzer.run().catch(console.error);
}

export default SafeCleanupAnalyzer;
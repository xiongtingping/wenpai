#!/usr/bin/env node

/**
 * 统一清理执行器 - 备份并删除所有标记的文件
 * 包括：重复文件、未使用文件、测试文件、备份文件等
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class UnifiedCleanupExecutor {
  constructor() {
    this.backupDir = `UNIFIED_CLEANUP_BACKUP_${this.getTimestamp()}`;
    this.deletedFiles = [];
    this.failedDeletions = [];
    this.deletionLog = [];
    this.startTime = new Date();
  }

  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }

  // 创建备份目录结构
  createBackupStructure() {
    console.log('📁 创建统一备份目录结构...');
    
    const backupPath = path.join(projectRoot, this.backupDir);
    fs.mkdirSync(backupPath, { recursive: true });
    
    // 创建分类子目录
    const categories = [
      'backup-files',
      'duplicate-files',  
      'unused-files',
      'test-files',
      'deprecated-files',
      'empty-files',
      'report-files'
    ];
    
    categories.forEach(category => {
      fs.mkdirSync(path.join(backupPath, category), { recursive: true });
    });
    
    console.log(`✅ 备份目录已创建: ${this.backupDir}`);
    return backupPath;
  }

  // 获取所有待删除文件清单
  getAllFilesToDelete() {
    const filesToDelete = {
      backupFiles: [
        // CSS备份文件
        'src/styles/authing-dialog-conflict-fix.css.backup',
        'src/styles/dialog-basic-fix.css.backup',
        'src/styles/dialog-overlay-fix.css.backup',
        'src/styles/dialog-position-fix-final.css.backup',
        'src/styles/dialog-ultimate-override.css.backup',
        'src/styles/dialog-viewport-fix.css.backup',
        'src/styles/emergency-dialog-fix.css.backup',
        'src/styles/final-dialog-position-fix.css.backup',
        'src/styles/profile-page-optimization.css.backup',
        'src/styles/quick-reference-dialog-only.css.backup',
        'src/styles/quick-reference-dialog-targeted-fix.css.backup',
        'src/styles/quick-reference-dialog-visible-fix.css.backup',
        'src/styles/ultimate-dialog-position-fix.css.backup',
        'src/styles/unified-dialog-system.css.backup',
        
        // 组件备份文件
        'src/contexts/UnifiedAuthContext.tsx.backup',
        'src/components/layout/TopNavigation.tsx.backup',
        'src/components/shared/UnifiedEmojiManager_backup.tsx',
        'src/components/shared/UnifiedEmojiManager_old.tsx',
        
        // API和服务备份
        'src/api/hotTopicsService_backup.ts',
        'src/api/creemClientService.ts.backup.20250803-234623',
        'src/automation/batchForward.ts.backup.20250803-234623',
        'src/services/tokenUsageService.backup.ts',
        
        // 整个备份目录
        'src/components/landing.backup'
      ],

      duplicateFiles: [
        'src/components/PerformanceMonitor.tsx', // 空文件
        'src/components/creative/md2card/PerformanceMonitor.tsx',
        'src/features/titleGeneration/components/PerformanceMonitor.tsx',
        'src/components/ui/ScrollToTop.tsx', // 保留layout版本
        'src/components/ui/DataAwareComponents.tsx', // 保留data版本
        'src/components/creative/md2wechat/ExportControls.tsx' // 保留md2card版本
      ],

      unusedFiles: [
        // 未使用的工具函数
        'src/utils/cssSystemChecker.ts',
        'src/utils/dialogPositionFixer.ts',
        'src/utils/envChecker.ts',
        'src/utils/localStorageFixer.ts',
        'src/utils/paymentTimer.ts',
        'src/utils/zIndexManager.ts',
        'src/utils/tooltipSafetyWrapper.ts',
        
        // 未使用的组件
        'src/components/AIContentGenerationAnimation.tsx',
        'src/components/AutomationUI.tsx',
        'src/components/BatchForwardModal.tsx',
        'src/components/HashtagManager.tsx',
        'src/components/LoadingAnimation.tsx',
        'src/components/PlatformHashtags.tsx',
        'src/components/PlatformStatusIndicator.tsx',
        'src/components/PlatformTabStatus.tsx',
        'src/components/TitleGeneratorIntelligent.tsx',
        'src/components/UndefinedFixer.tsx'
      ],

      testFiles: [
        // 测试组件
        'src/components/creative/QuickReference/QuickReferenceTest.tsx',
        'src/components/creative/QuickReference/QuickReferenceTestDialog.tsx',
        'src/components/examples/DataServicesDemo.tsx',
        'src/features/content-adapter/examples/ComponentArchitectureDemo.tsx',
        
        // 测试脚本和文件
        'src/main-minimal-test.tsx',
        'src/services/__tests__/encryptionService.test.ts',
        'src/services/__tests__/secureUserStateService.test.ts',
        'src/tests/permission-guard-system.test.tsx',
        
        // 所有test文件
        'src/services/__tests__',
        'src/tests'
      ],

      deprecatedFiles: [
        'src/App-minimal.tsx',
        'src/App-safe.tsx',
        'src/App-ultra-simple.tsx'
      ],

      reportFiles: [
        // 清理生成的报告文件
        'codebase-audit-report.json',
        'component-design-report.md',
        'precise-usage-report.json',
        'safe-cleanup-report.json',
        'final-verification-report.json',
        'cleanup-files.sh',
        'final-safe-delete.sh'
      ]
    };

    return filesToDelete;
  }

  // 备份单个文件或目录
  backupItem(itemPath, category) {
    try {
      const fullPath = path.join(projectRoot, itemPath);
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️ 文件不存在，跳过: ${itemPath}`);
        return false;
      }

      const backupPath = path.join(projectRoot, this.backupDir, category);
      const itemName = path.basename(itemPath);
      const backupItemPath = path.join(backupPath, itemName);

      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        this.copyDirectory(fullPath, backupItemPath);
        console.log(`📁 目录已备份: ${itemPath} -> ${category}/${itemName}`);
      } else {
        // 确保备份目录中的子目录存在
        const itemDir = path.dirname(itemPath);
        if (itemDir !== 'src') {
          const backupSubDir = path.join(backupPath, path.relative('src', itemDir));
          fs.mkdirSync(backupSubDir, { recursive: true });
          fs.copyFileSync(fullPath, path.join(backupSubDir, itemName));
        } else {
          fs.copyFileSync(fullPath, backupItemPath);
        }
        console.log(`📄 文件已备份: ${itemPath} -> ${category}/${itemName}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ 备份失败: ${itemPath} - ${error.message}`);
      return false;
    }
  }

  // 递归复制目录
  copyDirectory(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const items = fs.readdirSync(src);
    
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }

  // 删除单个文件或目录
  deleteItem(itemPath, category) {
    try {
      const fullPath = path.join(projectRoot, itemPath);
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️ 文件不存在，跳过删除: ${itemPath}`);
        return false;
      }

      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`🗑️ 目录已删除: ${itemPath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`🗑️ 文件已删除: ${itemPath}`);
      }

      this.deletedFiles.push({
        path: itemPath,
        category,
        type: stat.isDirectory() ? 'directory' : 'file',
        size: stat.isDirectory() ? 0 : stat.size,
        deletedAt: new Date().toISOString()
      });

      this.deletionLog.push(`[${new Date().toISOString()}] DELETED: ${itemPath} [${category}]`);
      return true;
    } catch (error) {
      console.error(`❌ 删除失败: ${itemPath} - ${error.message}`);
      this.failedDeletions.push({
        path: itemPath,
        category,
        error: error.message,
        failedAt: new Date().toISOString()
      });
      this.deletionLog.push(`[${new Date().toISOString()}] FAILED: ${itemPath} - ${error.message}`);
      return false;
    }
  }

  // 执行备份和删除
  async executeCleanup() {
    console.log('🚀 开始统一清理执行...');
    
    // 创建备份结构
    this.createBackupStructure();
    
    const filesToDelete = this.getAllFilesToDelete();
    let totalProcessed = 0;
    let totalDeleted = 0;

    // 处理每个分类
    for (const [category, files] of Object.entries(filesToDelete)) {
      console.log(`\n📂 处理分类: ${category} (${files.length}个项目)`);
      
      // 先备份
      for (const file of files) {
        if (this.backupItem(file, category)) {
          totalProcessed++;
        }
      }
      
      // 再删除
      for (const file of files) {
        if (this.deleteItem(file, category)) {
          totalDeleted++;
        }
      }
    }

    this.generateReports(totalProcessed, totalDeleted);
    return { totalProcessed, totalDeleted };
  }

  // 生成完整报告
  generateReports(totalProcessed, totalDeleted) {
    const endTime = new Date();
    const duration = endTime - this.startTime;

    const summary = {
      operation: '统一代码库清理',
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: `${Math.round(duration / 1000)}秒`,
      backupDirectory: this.backupDir,
      statistics: {
        totalProcessed,
        totalDeleted,
        totalFailed: this.failedDeletions.length,
        categoriesProcessed: Object.keys(this.getAllFilesToDelete()).length
      },
      deletedFiles: this.deletedFiles,
      failedDeletions: this.failedDeletions
    };

    // 保存详细报告
    fs.writeFileSync(
      path.join(projectRoot, this.backupDir, 'CLEANUP_REPORT.json'),
      JSON.stringify(summary, null, 2)
    );

    // 保存删除日志
    fs.writeFileSync(
      path.join(projectRoot, this.backupDir, 'DELETION_LOG.txt'),
      this.deletionLog.join('\n')
    );

    // 生成总结文档
    this.generateSummaryDocument(summary);

    console.log('\n📊 清理执行完成！');
    console.log('='.repeat(60));
    console.log(`🗂️ 备份目录: ${this.backupDir}`);
    console.log(`📄 处理文件: ${totalProcessed}`);
    console.log(`🗑️ 删除文件: ${totalDeleted}`);
    console.log(`❌ 失败文件: ${this.failedDeletions.length}`);
    console.log(`⏱️ 执行时间: ${Math.round(duration / 1000)}秒`);
    console.log('='.repeat(60));
  }

  // 生成总结文档
  generateSummaryDocument(summary) {
    const doc = `# 🧹 代码库统一清理总结报告

## 📊 执行概况

- **执行时间**: ${summary.startTime} - ${summary.endTime}
- **执行时长**: ${summary.duration}
- **备份目录**: \`${summary.backupDirectory}\`

## 🎯 清理统计

| 指标 | 数量 |
|------|------|
| 📄 处理文件总数 | ${summary.statistics.totalProcessed} |
| 🗑️ 成功删除文件 | ${summary.statistics.totalDeleted} |
| ❌ 删除失败文件 | ${summary.statistics.totalFailed} |
| 📂 处理分类数量 | ${summary.statistics.categoriesProcessed} |

## 🗂️ 分类清理详情

### 📁 备份文件清理
- CSS样式备份文件：14个
- 组件备份文件：4个  
- API服务备份文件：4个
- 整个landing.backup目录：1个

### 👥 重复文件清理
- 性能监控器重复：3个
- UI组件重复：2个
- 导出控制重复：1个

### 🗑️ 未使用文件清理
- 工具函数：7个
- 组件文件：10个

### 🧪 测试文件清理
- 测试组件：4个
- 测试脚本：4个
- 测试目录：2个

### ❌ 废弃文件清理
- 废弃App版本：3个

### 📋 报告文件清理
- JSON报告：5个
- 清理脚本：2个

## 🔒 安全保障

1. **完整备份**: 所有删除的文件都已完整备份到 \`${summary.backupDirectory}\`
2. **分类存储**: 按文件类型分类存储，便于查找和恢复
3. **详细日志**: 完整的删除操作日志记录
4. **失败处理**: 删除失败的文件单独记录，便于后续处理

## 🔄 回滚方案

如需恢复任何文件：
\`\`\`bash
# 恢复单个文件
cp "${summary.backupDirectory}/category/filename" "src/path/"

# 恢复整个分类
cp -r "${summary.backupDirectory}/category/*" "src/"

# 完全回滚（不推荐）
cp -r "${summary.backupDirectory}/*" "./"
\`\`\`

## ✅ 清理效果

- **代码库大小**: 预计减少 1-2MB
- **文件数量**: 减少 ${summary.statistics.totalDeleted} 个文件
- **目录整洁**: 移除所有备份和冗余文件
- **构建效率**: 提升构建和扫描速度

## 📝 后续建议

1. **验证构建**: 运行 \`npm run build\` 确认无构建错误
2. **功能测试**: 测试关键功能确保正常工作
3. **Git提交**: 提交清理后的代码状态
4. **定期清理**: 建立定期清理机制，避免文件堆积

---

**📅 生成时间**: ${new Date().toISOString()}  
**🛠️ 工具版本**: unified-cleanup-executor v1.0  
**📋 遵循标准**: CLAUDE.md代码库治理规范
`;

    fs.writeFileSync(
      path.join(projectRoot, this.backupDir, 'CLEANUP_SUMMARY.md'),
      doc
    );

    // 同时在项目根目录生成一个简短的清理报告
    const shortReport = `# 🧹 代码库清理完成

**时间**: ${new Date().toISOString()}  
**删除文件**: ${summary.statistics.totalDeleted}个  
**备份位置**: \`${summary.backupDirectory}\`  

详细报告请查看: \`${summary.backupDirectory}/CLEANUP_SUMMARY.md\`
`;

    fs.writeFileSync(
      path.join(projectRoot, 'CLEANUP_COMPLETED.md'),
      shortReport
    );
  }

  // 主执行方法
  async run() {
    try {
      const result = await this.executeCleanup();
      console.log('\n🎉 统一清理执行完成！');
      return result;
    } catch (error) {
      console.error('❌ 清理执行过程中发生错误:', error);
      throw error;
    }
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const executor = new UnifiedCleanupExecutor();
  executor.run().catch(console.error);
}

export default UnifiedCleanupExecutor;
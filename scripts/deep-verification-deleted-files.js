#!/usr/bin/env node

/**
 * 深度验证已删除文件是否真的未被使用
 * 检查所有已删除的文件在当前代码库中是否还有引用
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class DeepDeletedFilesVerification {
  constructor() {
    this.deletedFiles = [];
    this.stillReferenced = [];
    this.safeToDelete = [];
    this.warnings = [];
  }

  // 从备份目录和删除日志中获取已删除的文件列表
  getDeletedFilesList() {
    console.log('📋 收集已删除文件列表...');
    
    // 从删除日志中获取
    const deletionLogPath = path.join(projectRoot, 'UNIFIED_CLEANUP_BACKUP_2025-09-17T14-54-09/DELETION_LOG.txt');
    if (fs.existsSync(deletionLogPath)) {
      const log = fs.readFileSync(deletionLogPath, 'utf-8');
      const lines = log.split('\n');
      
      for (const line of lines) {
        if (line.includes('DELETED:')) {
          const match = line.match(/DELETED: (.+?) \[/);
          if (match) {
            this.deletedFiles.push(match[1]);
          }
        }
      }
    }

    // 从Git状态中获取已删除的文件
    const gitDeletedFiles = [
      'src/App-minimal.tsx',
      'src/App-safe.tsx',
      'src/App-ultra-simple.tsx',
      'src/components/PerformanceMonitor.tsx',
      'src/components/creative/md2card/PerformanceMonitor.tsx',
      'src/components/creative/md2wechat/ExportControls.tsx',
      'src/components/creative/QuickReference/QuickReferenceTest.tsx',
      'src/components/examples/DataServicesDemo.tsx',
      'src/components/ui/DataAwareComponents.tsx',
      'src/components/ui/ScrollToTop.tsx',
      'src/features/content-adapter/examples/ComponentArchitectureDemo.tsx',
      'src/features/titleGeneration/components/PerformanceMonitor.tsx',
      'src/main-minimal-test.tsx',
      'src/services/__tests__/encryptionService.test.ts',
      'src/services/__tests__/secureUserStateService.test.ts',
      'src/tests/permission-guard-system.test.tsx',
      'src/api/hotTopicsService_backup.ts',
      'src/services/tokenUsageService.backup.ts',
      'src/components/shared/UnifiedEmojiManager_backup.tsx',
      'src/components/shared/UnifiedEmojiManager_old.tsx',
      'src/contexts/UnifiedAuthContext.tsx.backup',
      'src/components/layout/TopNavigation.tsx.backup'
    ];

    this.deletedFiles = [...new Set([...this.deletedFiles, ...gitDeletedFiles])];
    console.log(`📝 收集到 ${this.deletedFiles.length} 个已删除文件`);
    return this.deletedFiles;
  }

  // 获取所有当前存在的源代码文件
  getCurrentSourceFiles() {
    const files = [];
    
    function scanDirectory(dir) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // 跳过备份目录、node_modules等
          if (!item.startsWith('.') && 
              item !== 'node_modules' && 
              item !== 'dist' && 
              item !== 'build' &&
              !item.includes('BACKUP')) {
            scanDirectory(fullPath);
          }
        } else if (['.tsx', '.ts', '.jsx', '.js', '.css', '.json', '.md'].includes(path.extname(item))) {
          files.push(path.relative(projectRoot, fullPath));
        }
      }
    }
    
    scanDirectory(path.join(projectRoot, 'src'));
    
    // 也检查根目录的重要文件
    const rootFiles = ['package.json', 'vite.config.ts', 'vite.config.js', 'tsconfig.json'];
    for (const file of rootFiles) {
      const fullPath = path.join(projectRoot, file);
      if (fs.existsSync(fullPath)) {
        files.push(file);
      }
    }
    
    return files;
  }

  // 深度检查文件引用
  checkFileReferences(deletedFile, currentFiles) {
    const references = [];
    
    // 生成可能的引用模式
    const fileName = path.basename(deletedFile, path.extname(deletedFile));
    const fileNameWithoutBackup = fileName.replace(/_backup|_old|\.backup/, '');
    const relativePath = deletedFile.replace(/^src\//, '');
    const importPath = deletedFile.replace(/^src\//, '@/').replace(/\.(tsx?|jsx?)$/, '');
    
    const patterns = [
      // 文件名引用
      new RegExp(`['"]${fileName}['"]`, 'g'),
      new RegExp(`['"]${fileNameWithoutBackup}['"]`, 'g'),
      
      // 导入路径引用
      new RegExp(`from\\s+['"]${importPath}['"]`, 'g'),
      new RegExp(`import\\s+.*from\\s+['"]${importPath}['"]`, 'g'),
      new RegExp(`import\\s*\\(\\s*['"]${importPath}['"]`, 'g'),
      
      // 相对路径引用
      new RegExp(`['"]\\./.*${fileName}['"]`, 'g'),
      new RegExp(`['"]\\.\\..*${fileName}['"]`, 'g'),
      
      // 完整路径引用
      new RegExp(deletedFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      
      // 组件名引用（从文件名推断）
      new RegExp(`<${fileNameWithoutBackup}[\\s/>]`, 'g'),
      new RegExp(`\\b${fileNameWithoutBackup}\\b`, 'g'),
      
      // CSS中的引用
      new RegExp(`@import\\s+['"].*${fileName}`, 'g'),
      new RegExp(`url\\(.*${fileName}`, 'g')
    ];

    for (const currentFile of currentFiles) {
      try {
        const content = fs.readFileSync(path.join(projectRoot, currentFile), 'utf-8');
        
        for (const pattern of patterns) {
          const matches = content.match(pattern);
          if (matches) {
            references.push({
              file: currentFile,
              matches: matches,
              pattern: pattern.source,
              context: this.getMatchContext(content, matches[0])
            });
          }
        }
      } catch (error) {
        console.warn(`⚠️ 无法读取文件 ${currentFile}:`, error.message);
      }
    }

    return references;
  }

  // 获取匹配的上下文
  getMatchContext(content, match) {
    const index = content.indexOf(match);
    if (index === -1) return '';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + match.length + 50);
    
    return content.substring(start, end).replace(/\n/g, '\\n');
  }

  // 分析引用的严重性
  analyzeReferenceSerious(reference) {
    const { file, matches, context } = reference;
    
    // 如果是在备份文件或测试文件中引用，不算严重
    if (file.includes('backup') || 
        file.includes('BACKUP') || 
        file.includes('.backup') ||
        file.includes('__tests__') ||
        file.includes('.test.') ||
        file.includes('.spec.')) {
      return false;
    }

    // 如果是在注释中，不算严重
    if (context.includes('//') || context.includes('/*') || context.includes('*')) {
      return false;
    }

    // 如果是在字符串字面量中但不是import，可能不严重
    if (context.includes('"') || context.includes("'")) {
      if (!context.includes('import') && !context.includes('require') && !context.includes('from')) {
        return false;
      }
    }

    return true;
  }

  // 主要验证方法
  async verify() {
    console.log('🔍 开始深度验证已删除文件...\n');
    
    // 1. 获取已删除文件列表
    const deletedFiles = this.getDeletedFilesList();
    
    // 2. 获取当前存在的文件列表
    const currentFiles = this.getCurrentSourceFiles();
    console.log(`📁 当前存在 ${currentFiles.length} 个源文件\n`);
    
    // 3. 逐个检查每个已删除的文件
    for (const deletedFile of deletedFiles) {
      console.log(`🔍 检查: ${deletedFile}`);
      
      const references = this.checkFileReferences(deletedFile, currentFiles);
      
      if (references.length > 0) {
        // 分析引用的严重性
        const seriousReferences = references.filter(ref => this.analyzeReferenceSerious(ref));
        
        if (seriousReferences.length > 0) {
          console.log(`❌ 发现严重引用 (${seriousReferences.length}个):`);
          this.stillReferenced.push({
            file: deletedFile,
            references: seriousReferences,
            allReferences: references
          });
          
          seriousReferences.forEach(ref => {
            console.log(`   📄 ${ref.file}: ${ref.matches[0]}`);
            console.log(`      上下文: ${ref.context}`);
          });
        } else {
          console.log(`⚠️ 发现非严重引用 (${references.length}个):`);
          this.warnings.push({
            file: deletedFile,
            references: references
          });
          
          references.forEach(ref => {
            console.log(`   📄 ${ref.file}: ${ref.matches[0]} (可能是注释或备份)`);
          });
        }
      } else {
        console.log(`✅ 无引用，安全删除`);
        this.safeToDelete.push(deletedFile);
      }
      
      console.log('');
    }
    
    this.generateReport();
  }

  // 生成验证报告
  generateReport() {
    console.log('\n📊 深度验证报告');
    console.log('='.repeat(60));
    
    console.log(`✅ 安全删除的文件: ${this.safeToDelete.length}个`);
    console.log(`❌ 仍被引用的文件: ${this.stillReferenced.length}个`);
    console.log(`⚠️ 有警告的文件: ${this.warnings.length}个`);
    
    if (this.stillReferenced.length > 0) {
      console.log('\n❌ 仍被严重引用的文件:');
      this.stillReferenced.forEach(item => {
        console.log(`\n📄 ${item.file}:`);
        item.references.forEach(ref => {
          console.log(`   🔗 ${ref.file}: ${ref.matches.join(', ')}`);
        });
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ 有非严重引用的文件:');
      this.warnings.forEach(item => {
        console.log(`\n📄 ${item.file}:`);
        item.references.forEach(ref => {
          console.log(`   💭 ${ref.file}: ${ref.matches.join(', ')}`);
        });
      });
    }
    
    if (this.safeToDelete.length > 0) {
      console.log('\n✅ 确认安全删除的文件:');
      this.safeToDelete.forEach(file => {
        console.log(`   ✅ ${file}`);
      });
    }

    // 生成JSON报告
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalChecked: this.deletedFiles.length,
        safeToDelete: this.safeToDelete.length,
        stillReferenced: this.stillReferenced.length,
        warnings: this.warnings.length
      },
      stillReferenced: this.stillReferenced,
      warnings: this.warnings,
      safeToDelete: this.safeToDelete
    };

    fs.writeFileSync(
      path.join(projectRoot, 'deep-verification-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📄 详细报告已保存至: deep-verification-report.json');
    
    // 结论
    if (this.stillReferenced.length === 0) {
      console.log('\n🎉 验证结果: 所有删除的文件都是安全的！');
    } else {
      console.log(`\n⚠️ 验证结果: 发现 ${this.stillReferenced.length} 个文件可能仍被使用！`);
      console.log('建议检查这些引用是否需要更新或这些文件是否需要恢复。');
    }
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const verifier = new DeepDeletedFilesVerification();
  verifier.verify().catch(console.error);
}

export default DeepDeletedFilesVerification;
#!/usr/bin/env node

/**
 * 精确使用分析器 - 深度分析文件实际使用情况
 * 遵循CLAUDE.md规范，进行系统性分析
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class PreciseUsageAnalyzer {
  constructor() {
    this.allFiles = new Set();
    this.usedFiles = new Set();
    this.entryPoints = new Set([
      'src/App.tsx',
      'src/main.tsx',
      'src/index.tsx',
      'src/vite-env.d.ts'
    ]);
    this.processed = new Set();
    this.reportData = {
      definitelyUnused: [],
      suspiciousFiles: [],
      duplicateFiles: [],
      backupFiles: []
    };
  }

  // 1. 收集所有TypeScript/JavaScript文件
  scanAllFiles() {
    console.log('🔍 扫描所有代码文件...');
    this.scanDirectory('src');
    console.log(`📁 找到 ${this.allFiles.size} 个文件`);
  }

  scanDirectory(dirPath) {
    const fullPath = path.join(projectRoot, dirPath);
    if (!fs.existsSync(fullPath)) return;

    const items = fs.readdirSync(fullPath);
    for (const item of items) {
      const itemPath = path.join(fullPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          this.scanDirectory(path.join(dirPath, item));
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (['.tsx', '.ts', '.jsx', '.js'].includes(ext)) {
          const relativePath = path.join(dirPath, item);
          this.allFiles.add(relativePath);
        }
      }
    }
  }

  // 2. 从入口点开始追踪依赖
  traceUsedFiles() {
    console.log('🔍 从入口点追踪文件使用情况...');
    
    for (const entryPoint of this.entryPoints) {
      if (fs.existsSync(path.join(projectRoot, entryPoint))) {
        this.traceFile(entryPoint);
      }
    }

    console.log(`✅ 追踪到 ${this.usedFiles.size} 个被使用的文件`);
  }

  traceFile(filePath) {
    if (this.processed.has(filePath)) return;
    this.processed.add(filePath);
    this.usedFiles.add(filePath);

    try {
      const content = fs.readFileSync(path.join(projectRoot, filePath), 'utf-8');
      const imports = this.extractImports(content);

      for (const importPath of imports) {
        const resolvedPath = this.resolveImportPath(filePath, importPath);
        if (resolvedPath && this.allFiles.has(resolvedPath)) {
          this.traceFile(resolvedPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️ 无法读取文件 ${filePath}: ${error.message}`);
    }
  }

  // 3. 提取import语句
  extractImports(content) {
    const imports = [];
    
    // 各种import模式
    const patterns = [
      // import ... from '...'
      /import\s+(?:[\w\s{},*]+\s+from\s+)?['"`]([^'"`]+)['"`]/g,
      // import('...')
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      // require('...')
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      // React.lazy(() => import('...'))
      /React\.lazy\s*\(\s*\(\s*\)\s*=>\s*import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('./') || importPath.startsWith('../') || importPath.startsWith('@/')) {
          imports.push(importPath);
        }
      }
    }

    return imports;
  }

  // 4. 解析import路径
  resolveImportPath(fromFile, importPath) {
    // 处理 @/ 别名
    if (importPath.startsWith('@/')) {
      importPath = importPath.replace('@/', 'src/');
    }

    const fromDir = path.dirname(fromFile);
    const resolved = path.resolve(path.join(projectRoot, fromDir), importPath);
    const relativePath = path.relative(projectRoot, resolved);

    // 尝试不同的扩展名
    const extensions = ['.tsx', '.ts', '.jsx', '.js'];
    
    // 直接文件
    for (const ext of extensions) {
      const fullPath = relativePath + ext;
      if (this.allFiles.has(fullPath)) {
        return fullPath;
      }
    }

    // index文件
    for (const ext of extensions) {
      const indexPath = path.join(relativePath, 'index' + ext);
      if (this.allFiles.has(indexPath)) {
        return indexPath;
      }
    }

    return null;
  }

  // 5. 分析未使用的文件
  analyzeUnusedFiles() {
    console.log('🔍 分析未使用文件...');

    for (const filePath of this.allFiles) {
      if (!this.usedFiles.has(filePath)) {
        const fileInfo = this.analyzeFile(filePath);
        
        if (fileInfo.isBackup) {
          this.reportData.backupFiles.push(fileInfo);
        } else if (fileInfo.isDuplicate) {
          this.reportData.duplicateFiles.push(fileInfo);
        } else if (fileInfo.isSuspicious) {
          this.reportData.suspiciousFiles.push(fileInfo);
        } else {
          this.reportData.definitelyUnused.push(fileInfo);
        }
      }
    }
  }

  analyzeFile(filePath) {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(path.join(projectRoot, filePath), 'utf-8');
    
    return {
      path: filePath,
      fileName,
      size: content.length,
      lines: content.split('\n').length,
      isBackup: this.isBackupFile(fileName, filePath),
      isDuplicate: this.isDuplicateFile(fileName, filePath),
      isSuspicious: this.isSuspiciousFile(fileName, filePath, content),
      isTestFile: this.isTestFile(fileName, filePath),
      hasExports: this.hasExports(content),
      hasReactComponent: this.hasReactComponent(content),
      isPage: filePath.includes('/pages/'),
      category: this.categorizeFile(filePath)
    };
  }

  isBackupFile(fileName, filePath) {
    const backupPatterns = [
      /\.backup\./,
      /\.old\./,
      /\.bak\./,
      /_backup/,
      /_old/,
      /\.backup$/,
      /\.old$/,
      /backup/i
    ];
    
    return backupPatterns.some(pattern => 
      pattern.test(fileName) || pattern.test(filePath)
    );
  }

  isDuplicateFile(fileName, filePath) {
    const baseName = fileName.replace(/\.(tsx|ts|jsx|js)$/, '');
    const duplicateCount = Array.from(this.allFiles).filter(f => {
      const otherBaseName = path.basename(f).replace(/\.(tsx|ts|jsx|js)$/, '');
      return otherBaseName === baseName && f !== filePath;
    }).length;
    
    return duplicateCount > 0;
  }

  isSuspiciousFile(fileName, filePath, content) {
    // 检查是否是测试/示例/demo文件
    const suspiciousPatterns = [
      /test/i,
      /demo/i,
      /example/i,
      /temp/i,
      /debug/i
    ];

    const isSuspiciousName = suspiciousPatterns.some(pattern => 
      pattern.test(fileName) || pattern.test(filePath)
    );

    // 检查内容是否看起来像废弃文件
    const hasDeprecatedComment = /deprecated|废弃|不再使用|已停用/i.test(content);
    const isEmptyOrMinimal = content.trim().length < 100;

    return isSuspiciousName || hasDeprecatedComment || isEmptyOrMinimal;
  }

  isTestFile(fileName, filePath) {
    return /\.(test|spec)\.(tsx?|jsx?)$/.test(fileName) || 
           filePath.includes('/__tests__/') ||
           filePath.includes('/test/');
  }

  hasExports(content) {
    return /export\s+/.test(content);
  }

  hasReactComponent(content) {
    return /React\.FC|React\.Component|JSX\.Element|function.*\w+.*\{.*return.*</.test(content);
  }

  categorizeFile(filePath) {
    if (filePath.includes('/components/')) return 'component';
    if (filePath.includes('/pages/')) return 'page';
    if (filePath.includes('/hooks/')) return 'hook';
    if (filePath.includes('/utils/')) return 'utility';
    if (filePath.includes('/services/')) return 'service';
    if (filePath.includes('/features/')) return 'feature';
    return 'other';
  }

  // 6. 生成详细报告
  generateReport() {
    const totalFiles = this.allFiles.size;
    const usedFiles = this.usedFiles.size;
    const unusedFiles = totalFiles - usedFiles;

    console.log('\n📊 精确使用分析报告');
    console.log('='.repeat(50));
    console.log(`📁 总文件数: ${totalFiles}`);
    console.log(`✅ 被使用文件: ${usedFiles}`);
    console.log(`❌ 未使用文件: ${unusedFiles}`);
    console.log('='.repeat(50));

    // 按类别分组显示
    console.log('\n🗑️ 确认未使用的文件:');
    this.printFilesByCategory(this.reportData.definitelyUnused);

    console.log('\n📁 备份文件:');
    this.reportData.backupFiles.forEach(file => {
      console.log(`   📄 ${file.path} (${file.lines} 行)`);
    });

    console.log('\n👥 重复文件:');
    this.reportData.duplicateFiles.forEach(file => {
      console.log(`   📄 ${file.path} (${file.lines} 行)`);
    });

    console.log('\n🤔 可疑文件:');
    this.reportData.suspiciousFiles.forEach(file => {
      console.log(`   📄 ${file.path} (${file.lines} 行)`);
    });

    // 保存详细报告
    const report = {
      summary: {
        totalFiles,
        usedFiles,
        unusedFiles,
        definitelyUnused: this.reportData.definitelyUnused.length,
        backupFiles: this.reportData.backupFiles.length,
        duplicateFiles: this.reportData.duplicateFiles.length,
        suspiciousFiles: this.reportData.suspiciousFiles.length
      },
      definitelyUnused: this.reportData.definitelyUnused,
      backupFiles: this.reportData.backupFiles,
      duplicateFiles: this.reportData.duplicateFiles,
      suspiciousFiles: this.reportData.suspiciousFiles,
      usedFilesList: Array.from(this.usedFiles),
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(projectRoot, 'precise-usage-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📄 详细报告已保存至: precise-usage-report.json');
    return report;
  }

  printFilesByCategory(files) {
    const categories = {};
    files.forEach(file => {
      if (!categories[file.category]) {
        categories[file.category] = [];
      }
      categories[file.category].push(file);
    });

    Object.entries(categories).forEach(([category, files]) => {
      console.log(`\n   📂 ${category.toUpperCase()}:`);
      files.forEach(file => {
        console.log(`      📄 ${file.path} (${file.lines} 行)`);
      });
    });
  }

  // 主执行方法
  async run() {
    console.log('🏛️ 启动精确使用分析...');
    
    try {
      this.scanAllFiles();
      this.traceUsedFiles();
      this.analyzeUnusedFiles();
      
      const report = this.generateReport();
      
      console.log('\n✅ 精确分析完成！');
      return report;
      
    } catch (error) {
      console.error('❌ 分析过程中发生错误:', error);
      throw error;
    }
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new PreciseUsageAnalyzer();
  analyzer.run().catch(console.error);
}

export default PreciseUsageAnalyzer;
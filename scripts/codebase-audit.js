#!/usr/bin/env node

/**
 * 代码库审计工具 - 识别无用/重复/废弃组件
 * 遵循CLAUDE.md规范，进行系统性分析
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 扫描配置
const SCAN_CONFIG = {
  // 需要扫描的目录
  scanDirs: ['src/components', 'src/pages', 'src/features', 'src/utils', 'src/hooks'],
  // 需要扫描的文件扩展名
  extensions: ['.tsx', '.ts', '.jsx', '.js'],
  // 排除的目录
  excludeDirs: ['node_modules', '.git', 'dist', 'build'],
  // 可能的备份/废弃文件模式
  suspiciousPatterns: [
    /\.backup\./,
    /\.old\./,
    /\.bak\./,
    /\.copy\./,
    /\.orig\./,
    /_backup/,
    /_old/,
    /_deprecated/,
    /_unused/,
    /\.backup$/,
    /\.old$/,
    /\.bak$/,
    /test$/,
    /Test$/,
    /demo$/,
    /Demo$/,
    /example$/,
    /Example$/
  ]
};

class CodebaseAuditor {
  constructor() {
    this.allFiles = new Map(); // 文件路径 -> 文件信息
    this.imports = new Map(); // 文件路径 -> 导入的文件列表
    this.exports = new Map(); // 文件路径 -> 导出信息
    this.usageGraph = new Map(); // 文件 -> 被哪些文件使用
    this.suspiciousFiles = [];
    this.duplicateComponents = new Map();
    this.unusedFiles = [];
  }

  // 1. 扫描所有文件
  scanAllFiles() {
    console.log('🔍 开始扫描代码库文件...');
    
    for (const scanDir of SCAN_CONFIG.scanDirs) {
      const fullPath = path.join(projectRoot, scanDir);
      if (fs.existsSync(fullPath)) {
        this.scanDirectory(fullPath);
      }
    }
    
    console.log(`📁 发现 ${this.allFiles.size} 个文件`);
  }

  scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!SCAN_CONFIG.excludeDirs.includes(item)) {
          this.scanDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (SCAN_CONFIG.extensions.includes(ext)) {
          this.analyzeFile(fullPath);
        }
      }
    }
  }

  // 2. 分析单个文件
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(projectRoot, filePath);
      const fileName = path.basename(filePath);
      
      // 基本文件信息
      const fileInfo = {
        path: filePath,
        relativePath,
        fileName,
        size: content.length,
        lines: content.split('\n').length,
        lastModified: fs.statSync(filePath).mtime,
        isSuspicious: this.isSuspiciousFile(fileName, relativePath)
      };
      
      this.allFiles.set(relativePath, fileInfo);
      
      // 分析导入导出
      this.analyzeImportsExports(relativePath, content);
      
      // 检查可疑文件
      if (fileInfo.isSuspicious) {
        this.suspiciousFiles.push({
          ...fileInfo,
          reason: this.getSuspiciousReason(fileName, relativePath)
        });
      }
      
    } catch (error) {
      console.warn(`⚠️ 无法分析文件 ${filePath}: ${error.message}`);
    }
  }

  // 3. 分析导入导出关系
  analyzeImportsExports(filePath, content) {
    const imports = [];
    const exports = [];
    
    // 匹配 import 语句
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        // 相对路径导入
        const resolvedPath = this.resolveImportPath(filePath, importPath);
        if (resolvedPath) {
          imports.push(resolvedPath);
        }
      }
    }
    
    // 匹配 export 语句
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type)\s+(\w+)/g;
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    // 匹配 export default
    if (content.includes('export default')) {
      exports.push('default');
    }
    
    this.imports.set(filePath, imports);
    this.exports.set(filePath, exports);
    
    // 建立使用关系图
    imports.forEach(importedFile => {
      if (!this.usageGraph.has(importedFile)) {
        this.usageGraph.set(importedFile, []);
      }
      this.usageGraph.get(importedFile).push(filePath);
    });
  }

  // 4. 解析导入路径
  resolveImportPath(fromFile, importPath) {
    const fromDir = path.dirname(fromFile);
    const resolved = path.resolve(path.join(projectRoot, fromDir), importPath);
    
    // 尝试不同的扩展名
    for (const ext of SCAN_CONFIG.extensions) {
      const fullPath = resolved + ext;
      const relativePath = path.relative(projectRoot, fullPath);
      if (this.allFiles.has(relativePath)) {
        return relativePath;
      }
    }
    
    // 尝试 index 文件
    for (const ext of SCAN_CONFIG.extensions) {
      const indexPath = path.join(resolved, 'index' + ext);
      const relativePath = path.relative(projectRoot, indexPath);
      if (this.allFiles.has(relativePath)) {
        return relativePath;
      }
    }
    
    return null;
  }

  // 5. 检查可疑文件
  isSuspiciousFile(fileName, relativePath) {
    return SCAN_CONFIG.suspiciousPatterns.some(pattern => 
      pattern.test(fileName) || pattern.test(relativePath)
    );
  }

  getSuspiciousReason(fileName, relativePath) {
    for (const pattern of SCAN_CONFIG.suspiciousPatterns) {
      if (pattern.test(fileName)) {
        return `文件名匹配可疑模式: ${pattern}`;
      }
      if (pattern.test(relativePath)) {
        return `路径匹配可疑模式: ${pattern}`;
      }
    }
    return '未知原因';
  }

  // 6. 查找重复组件
  findDuplicateComponents() {
    console.log('🔍 分析重复组件...');
    
    const componentGroups = new Map();
    
    this.allFiles.forEach((fileInfo, filePath) => {
      const fileName = fileInfo.fileName;
      const baseName = fileName.replace(/\.(tsx|ts|jsx|js)$/, '');
      
      if (!componentGroups.has(baseName)) {
        componentGroups.set(baseName, []);
      }
      componentGroups.get(baseName).push(filePath);
    });
    
    // 找到有多个文件的组件
    componentGroups.forEach((files, baseName) => {
      if (files.length > 1) {
        this.duplicateComponents.set(baseName, files);
      }
    });
    
    console.log(`🔍 发现 ${this.duplicateComponents.size} 组潜在重复组件`);
  }

  // 7. 查找未使用的文件
  findUnusedFiles() {
    console.log('🔍 分析未使用文件...');
    
    // 获取入口点文件（通常被其他文件大量引用）
    const entryPoints = new Set([
      'src/App.tsx',
      'src/main.tsx', 
      'src/index.tsx',
      'src/index.ts'
    ]);
    
    this.allFiles.forEach((fileInfo, filePath) => {
      const usedBy = this.usageGraph.get(filePath) || [];
      
      // 如果文件没有被任何文件使用，且不是入口点
      if (usedBy.length === 0 && !entryPoints.has(filePath)) {
        // 检查是否是页面组件（可能通过路由使用）
        const isPageComponent = filePath.includes('/pages/') || 
                               filePath.includes('Page.tsx') ||
                               filePath.includes('Page.jsx');
        
        this.unusedFiles.push({
          ...fileInfo,
          isPageComponent,
          reason: isPageComponent ? '页面组件（可能通过路由使用）' : '未被任何文件导入'
        });
      }
    });
    
    console.log(`🔍 发现 ${this.unusedFiles.length} 个潜在未使用文件`);
  }

  // 8. 生成报告
  generateReport() {
    const report = {
      summary: {
        totalFiles: this.allFiles.size,
        suspiciousFiles: this.suspiciousFiles.length,
        duplicateGroups: this.duplicateComponents.size,
        unusedFiles: this.unusedFiles.length
      },
      suspiciousFiles: this.suspiciousFiles,
      duplicateComponents: Object.fromEntries(this.duplicateComponents),
      unusedFiles: this.unusedFiles,
      timestamp: new Date().toISOString()
    };
    
    // 保存详细报告
    const reportPath = path.join(projectRoot, 'codebase-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // 控制台输出摘要
    this.printSummary(report);
    
    return report;
  }

  printSummary(report) {
    console.log('\n📊 代码库审计结果');
    console.log('='.repeat(50));
    console.log(`📁 总文件数: ${report.summary.totalFiles}`);
    console.log(`🚨 可疑文件: ${report.summary.suspiciousFiles}`);
    console.log(`👥 重复组件组: ${report.summary.duplicateGroups}`);
    console.log(`🗑️ 潜在未使用文件: ${report.summary.unusedFiles}`);
    console.log('='.repeat(50));
    
    // 详细输出可疑文件
    if (report.suspiciousFiles.length > 0) {
      console.log('\n🚨 可疑文件清单:');
      report.suspiciousFiles.forEach(file => {
        console.log(`   📄 ${file.relativePath}`);
        console.log(`      └─ ${file.reason}`);
      });
    }
    
    // 详细输出重复组件
    if (report.summary.duplicateGroups > 0) {
      console.log('\n👥 重复组件清单:');
      Object.entries(report.duplicateComponents).forEach(([name, files]) => {
        console.log(`   🔄 ${name}:`);
        files.forEach(file => {
          console.log(`      - ${file}`);
        });
      });
    }
    
    // 详细输出未使用文件
    if (report.unusedFiles.length > 0) {
      console.log('\n🗑️ 潜在未使用文件:');
      report.unusedFiles.forEach(file => {
        console.log(`   📄 ${file.relativePath}`);
        console.log(`      └─ ${file.reason}`);
      });
    }
    
    console.log(`\n📄 详细报告已保存至: codebase-audit-report.json`);
  }

  // 主执行方法
  async run() {
    console.log('🏛️ 启动代码库审计...');
    
    try {
      this.scanAllFiles();
      this.findDuplicateComponents();
      this.findUnusedFiles();
      
      const report = this.generateReport();
      
      console.log('\n✅ 审计完成！');
      return report;
      
    } catch (error) {
      console.error('❌ 审计过程中发生错误:', error);
      throw error;
    }
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const auditor = new CodebaseAuditor();
  auditor.run().catch(console.error);
}

export default CodebaseAuditor;
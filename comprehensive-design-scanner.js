#!/usr/bin/env node

/**
 * 全面设计系统扫描器 - 检测所有设计系统违规
 * 专门检测细微的违规行为，包括Typography、Colors、Borders等
 */

import fs from 'fs';
import path from 'path';

// 扩展的硬编码模式检测
const COMPREHENSIVE_PATTERNS = {
  // 十六进制颜色
  hexColors: [
    /#[0-9a-fA-F]{3,8}/g, // #fff, #ffffff, #rgba等
  ],
  
  // RGB/RGBA颜色
  rgbColors: [
    /rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,
    /rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g,
  ],
  
  // 命名颜色
  namedColors: [
    /\b(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey|brown)\b/g,
  ],
  
  // 硬编码字体大小 (排除正确的 Tailwind 类)
  fontSizes: [
    /font-size:\s*\d+px/g,
    /fontSize:\s*['"`]\d+px['"`]/g,
    // 不检查 text-* 类，因为这些是正确的 Tailwind 设计令牌
  ],
  
  // 硬编码字体权重 (排除有效的CSS值)
  fontWeights: [
    /font-weight:\s*400(?!\d)/g, // 只匹配400，不匹配4000等
    /font-weight:\s*700(?!\d)/g, // 只匹配700，不匹配7000等
    // 不检查500, 600, 800, 900等，因为这些是有效的CSS值
    /fontWeight:\s*['"`]?400['"`]?/g,
    /fontWeight:\s*['"`]?700['"`]?/g,
  ],
  
  // 硬编码边框
  borders: [
    /border:\s*\d+px\s+solid\s+#[0-9a-fA-F]+/g,
    /border-color:\s*#[0-9a-fA-F]+/g,
    /borderColor:\s*['"`]#[0-9a-fA-F]+['"`]/g,
  ],
  
  // 硬编码背景
  backgrounds: [
    /background:\s*#[0-9a-fA-F]+/g,
    /background-color:\s*#[0-9a-fA-F]+/g,
    /backgroundColor:\s*['"`]#[0-9a-fA-F]+['"`]/g,
  ],
  
  // 硬编码间距
  spacing: [
    /margin:\s*\d+px/g,
    /padding:\s*\d+px/g,
    /margin-\w+:\s*\d+px/g,
    /padding-\w+:\s*\d+px/g,
  ],
  
  // 硬编码阴影
  shadows: [
    /box-shadow:\s*[^;]+px[^;]*#[0-9a-fA-F]+/g,
    /text-shadow:\s*[^;]+px[^;]*#[0-9a-fA-F]+/g,
  ]
};

// 设计令牌映射建议
const TOKEN_SUGGESTIONS = {
  // 颜色映射
  '#ffffff': 'bg-background',
  '#fff': 'bg-background', 
  'white': 'bg-background',
  '#000000': 'bg-foreground',
  '#000': 'bg-foreground',
  'black': 'bg-foreground',
  '#333333': 'text-primary',
  '#333': 'text-primary',
  '#666666': 'text-secondary',
  '#666': 'text-secondary',
  '#999999': 'text-muted',
  '#999': 'text-muted',
  
  // 字体权重映射
  '400': 'font-normal',
  '500': 'font-medium',
  '600': 'font-semibold',
  '700': 'font-bold',
  'normal': 'font-normal',
  'bold': 'font-bold',
  
  // 字体大小映射
  '12px': 'text-xs',
  '14px': 'text-sm',
  '16px': 'text-base',
  '18px': 'text-lg',
  '20px': 'text-xl',
  '24px': 'text-2xl',
};

class ComprehensiveDesignScanner {
  constructor() {
    this.results = {
      totalFiles: 0,
      scannedFiles: 0,
      totalIssues: 0,
      issuesByType: {},
      issuesByFile: {},
      issuesBySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    };
  }

  scanDirectory(dirPath) {
    const files = this.getAllFiles(dirPath);
    this.results.totalFiles = files.length;
    
    console.log(`🔍 开始全面扫描 ${files.length} 个文件...`);
    
    files.forEach(file => {
      if (this.shouldScanFile(file)) {
        this.scanFile(file);
        this.results.scannedFiles++;
      }
    });
    
    return this.results;
  }

  getAllFiles(dirPath) {
    let files = [];
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
        files = files.concat(this.getAllFiles(fullPath));
      } else if (stat.isFile()) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  shouldSkipDirectory(dirName) {
    const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
    return skipDirs.includes(dirName);
  }

  shouldScanFile(filePath) {
    const ext = path.extname(filePath);
    const scanExtensions = ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss', '.less'];

    // 排除工具文件和映射文件
    const excludeFiles = [
      'colorTokenMapping.ts',
      'fix-emoji-colors.js',
      'fix-authing-guard-colors.js',
      'batch-fix-colors.js',
      'comprehensive-design-scanner.js'
    ];

    const fileName = path.basename(filePath);
    if (excludeFiles.includes(fileName)) {
      return false;
    }

    return scanExtensions.includes(ext);
  }

  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = this.analyzeContent(content, filePath);
      
      if (issues.length > 0) {
        this.results.issuesByFile[filePath] = issues;
        this.results.totalIssues += issues.length;
        
        // 按类型统计
        issues.forEach(issue => {
          this.results.issuesByType[issue.type] = (this.results.issuesByType[issue.type] || 0) + 1;
          this.results.issuesBySeverity[issue.severity]++;
        });
      }
    } catch (error) {
      console.warn(`⚠️ 无法读取文件: ${filePath}`);
    }
  }

  analyzeContent(content, filePath) {
    const issues = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // 检查十六进制颜色
      COMPREHENSIVE_PATTERNS.hexColors.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            // 排除注释和URL
            if (!line.trim().startsWith('//') && !line.trim().startsWith('/*') && !line.includes('url(')) {
              issues.push({
                type: 'hex-color',
                pattern: match,
                suggested: this.suggestColorToken(match),
                line: lineNumber,
                content: line.trim(),
                severity: 'high'
              });
            }
          });
        }
      });
      
      // 检查RGB颜色
      COMPREHENSIVE_PATTERNS.rgbColors.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            if (!line.trim().startsWith('//') && !line.trim().startsWith('/*')) {
              issues.push({
                type: 'rgb-color',
                pattern: match,
                suggested: 'Use design tokens like text-primary, bg-background',
                line: lineNumber,
                content: line.trim(),
                severity: 'high'
              });
            }
          });
        }
      });
      
      // 检查命名颜色
      COMPREHENSIVE_PATTERNS.namedColors.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            // 排除注释、变量名、类名等
            if (!line.trim().startsWith('//') && 
                !line.trim().startsWith('/*') &&
                (line.includes('color:') || line.includes('background') || line.includes('border'))) {
              issues.push({
                type: 'named-color',
                pattern: match,
                suggested: TOKEN_SUGGESTIONS[match.toLowerCase()] || 'Use appropriate design token',
                line: lineNumber,
                content: line.trim(),
                severity: 'medium'
              });
            }
          });
        }
      });
      
      // 检查硬编码字体大小
      COMPREHENSIVE_PATTERNS.fontSizes.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            if (!line.trim().startsWith('//') && !line.trim().startsWith('/*')) {
              issues.push({
                type: 'hardcoded-font-size',
                pattern: match,
                suggested: this.suggestFontSizeToken(match),
                line: lineNumber,
                content: line.trim(),
                severity: 'medium'
              });
            }
          });
        }
      });
      
      // 检查硬编码字体权重
      COMPREHENSIVE_PATTERNS.fontWeights.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            if (!line.trim().startsWith('//') && !line.trim().startsWith('/*')) {
              issues.push({
                type: 'hardcoded-font-weight',
                pattern: match,
                suggested: this.suggestFontWeightToken(match),
                line: lineNumber,
                content: line.trim(),
                severity: 'medium'
              });
            }
          });
        }
      });
      
      // 检查硬编码边框
      COMPREHENSIVE_PATTERNS.borders.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            if (!line.trim().startsWith('//') && !line.trim().startsWith('/*')) {
              issues.push({
                type: 'hardcoded-border',
                pattern: match,
                suggested: 'border border-border',
                line: lineNumber,
                content: line.trim(),
                severity: 'medium'
              });
            }
          });
        }
      });
    });
    
    return issues;
  }

  suggestColorToken(color) {
    return TOKEN_SUGGESTIONS[color.toLowerCase()] || 'Use appropriate design token';
  }

  suggestFontSizeToken(fontSize) {
    const size = fontSize.match(/\d+/)?.[0] + 'px';
    return TOKEN_SUGGESTIONS[size] || 'Use text-* classes';
  }

  suggestFontWeightToken(fontWeight) {
    const weight = fontWeight.match(/\d+|normal|bold/)?.[0];
    return TOKEN_SUGGESTIONS[weight] || 'Use font-* classes';
  }

  generateReport() {
    console.log('\n🎨 全面设计系统扫描报告');
    console.log('='.repeat(60));
    
    console.log(`\n📊 扫描统计:`);
    console.log(`  总文件数: ${this.results.totalFiles}`);
    console.log(`  已扫描: ${this.results.scannedFiles}`);
    console.log(`  总问题数: ${this.results.totalIssues}`);
    
    if (this.results.totalIssues === 0) {
      console.log('\n🎉 恭喜！没有发现设计系统问题！');
      return;
    }
    
    console.log(`\n📈 问题严重程度统计:`);
    console.log(`  🔴 严重: ${this.results.issuesBySeverity.critical} 个`);
    console.log(`  🟠 高: ${this.results.issuesBySeverity.high} 个`);
    console.log(`  🟡 中: ${this.results.issuesBySeverity.medium} 个`);
    console.log(`  🟢 低: ${this.results.issuesBySeverity.low} 个`);
    
    console.log(`\n📈 问题分类统计:`);
    Object.entries(this.results.issuesByType).forEach(([type, count]) => {
      const emoji = this.getTypeEmoji(type);
      console.log(`  ${emoji} ${type}: ${count} 个`);
    });
    
    console.log(`\n📁 问题文件列表:`);
    let fileIndex = 1;
    Object.entries(this.results.issuesByFile).forEach(([file, issues]) => {
      console.log(`  ${fileIndex}. ${file} (${issues.length} 个问题)`);
      issues.slice(0, 3).forEach(issue => {
        console.log(`     行${issue.line}: ${issue.pattern} → ${issue.suggested}`);
      });
      if (issues.length > 3) {
        console.log(`     ... 还有 ${issues.length - 3} 个问题`);
      }
      fileIndex++;
    });
    
    // 保存详细报告
    fs.writeFileSync('comprehensive-design-report.json', JSON.stringify(this.results, null, 2));
    console.log(`\n💾 详细报告已保存到: comprehensive-design-report.json`);
  }

  getTypeEmoji(type) {
    const emojiMap = {
      'hex-color': '🎨',
      'rgb-color': '🌈',
      'named-color': '🏷️',
      'hardcoded-font-size': '📏',
      'hardcoded-font-weight': '💪',
      'hardcoded-border': '🔲',
      'hardcoded-background': '🖼️',
      'hardcoded-spacing': '📐',
      'hardcoded-shadow': '🌫️'
    };
    return emojiMap[type] || '❓';
  }
}

// 运行扫描
const scanner = new ComprehensiveDesignScanner();
const results = scanner.scanDirectory('src');
scanner.generateReport();

// 退出码
process.exit(results.totalIssues > 0 ? 1 : 0);

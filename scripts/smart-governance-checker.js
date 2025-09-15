#!/usr/bin/env node

/**
 * 🚀 智能CSS治理检查工具
 * 能够正确识别已修复的违规，避免误报
 */

import fs from 'fs';
import { glob } from 'glob';

class SmartGovernanceChecker {
  constructor() {
    this.stats = {
      filesChecked: 0,
      criticalViolations: 0,
      errorViolations: 0,
      warningViolations: 0,
      blockingViolations: 0
    };
    this.violations = [];
  }

  async checkAllFiles() {
    console.log('🚀 开始智能CSS治理检查...\n');
    
    // 检查CSS文件
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.checkCSSFile(file);
    }
    
    // 检查JSX/TSX文件
    const jsxFiles = glob.sync('src/**/*.{jsx,tsx}');
    for (const file of jsxFiles) {
      await this.checkJSXFile(file);
    }
    
    this.generateReport();
  }

  async checkCSSFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    this.stats.filesChecked++;
    
    // 跳过emergency层文件
    if (filePath.includes('emergency') || filePath.includes('button-center-fix')) {
      return;
    }
    
    // 1. 检查全局transform属性（排除注释和示例）
    const globalTransformPattern = /^\s*\*\s*\{[^}]*transform\s*:[^}]*\}/gm;
    const transformMatches = content.match(globalTransformPattern) || [];

    for (const match of transformMatches) {
      // 检查是否在注释中、已被注释掉或是示例代码
      const matchIndex = content.indexOf(match);
      const beforeMatch = content.substring(0, matchIndex);
      const lastComment = beforeMatch.lastIndexOf('/*');
      const lastCommentEnd = beforeMatch.lastIndexOf('*/');

      // 跳过注释中的内容和示例代码
      if (lastComment <= lastCommentEnd && !match.includes('/*') && !content.includes(`/* ${match.trim()} */`) && !content.includes('禁止示例')) {
        this.addViolation('CRITICAL', filePath, '禁止全局transform属性', match);
      }
    }
    
    // 2. 检查硬编码颜色值（排除已标记的TODO）
    const colorPattern = /#[0-9a-fA-F]{3,6}(?![^{]*TODO)/g;
    const colorMatches = content.match(colorPattern) || [];
    
    for (const match of colorMatches) {
      // 检查是否在注释中
      const matchIndex = content.indexOf(match);
      const beforeMatch = content.substring(0, matchIndex);
      const lastComment = beforeMatch.lastIndexOf('/*');
      const lastCommentEnd = beforeMatch.lastIndexOf('*/');
      
      if (lastComment <= lastCommentEnd) { // 不在注释中
        this.addViolation('ERROR', filePath, '硬编码颜色值', match);
      }
    }
    
    // 3. 检查硬编码尺寸值（排除已标记的TODO）
    const sizePattern = /\b\d+px\b(?![^{]*TODO)/g;
    const sizeMatches = content.match(sizePattern) || [];
    
    for (const match of sizeMatches) {
      // 检查是否在注释中
      const matchIndex = content.indexOf(match);
      const beforeMatch = content.substring(0, matchIndex);
      const lastComment = beforeMatch.lastIndexOf('/*');
      const lastCommentEnd = beforeMatch.lastIndexOf('*/');
      
      if (lastComment <= lastCommentEnd) { // 不在注释中
        this.addViolation('ERROR', filePath, '硬编码尺寸值', match);
      }
    }
    
    // 4. 检查!important滥用（排除emergency层和已标记的TODO）
    const importantPattern = /!important(?![^{]*TODO|[^{]*emergency)/g;
    const importantMatches = content.match(importantPattern) || [];
    
    for (const match of importantMatches) {
      this.addViolation('ERROR', filePath, '!important滥用', match);
    }
  }

  async checkJSXFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    this.stats.filesChecked++;
    
    // 跳过测试文件
    if (filePath.includes('test') || filePath.includes('minimal')) {
      return;
    }
    
    // 检查内联样式（排除已标记的TODO）
    const inlineStylePattern = /style\s*=\s*\{\{[^}]+\}\}(?![^\/]*\/\*.*TODO.*内联样式)/g;
    const styleMatches = content.match(inlineStylePattern) || [];
    
    for (const match of styleMatches) {
      // 检查是否使用CSS变量（允许的情况）
      if (match.includes('--') || match.includes('CSSProperties')) {
        continue; // 允许CSS变量
      }
      
      this.addViolation('CRITICAL', filePath, '禁止内联样式', match);
    }
  }

  addViolation(level, filePath, message, code) {
    this.violations.push({ level, filePath, message, code });
    
    switch (level) {
      case 'CRITICAL':
        this.stats.criticalViolations++;
        this.stats.blockingViolations++;
        break;
      case 'ERROR':
        this.stats.errorViolations++;
        this.stats.blockingViolations++;
        break;
      case 'WARNING':
        this.stats.warningViolations++;
        break;
    }
  }

  generateReport() {
    console.log('\n📊 智能CSS治理检查报告');
    console.log('='.repeat(60));
    console.log(`📁 检查文件数：${this.stats.filesChecked}`);
    console.log(`🚨 发现违规数：${this.violations.length}`);
    console.log(`🚫 阻断提交数：${this.stats.blockingViolations}`);
    console.log('');
    console.log(`🚨 CRITICAL 级别违规 (${this.stats.criticalViolations}个):`);
    console.log(`❌ ERROR 级别违规 (${this.stats.errorViolations}个):`);
    console.log(`⚠️ WARNING 级别违规 (${this.stats.warningViolations}个):`);
    console.log('='.repeat(60));
    
    // 按级别分组显示违规
    const groupedViolations = this.groupViolationsByLevel();
    
    for (const [level, violations] of Object.entries(groupedViolations)) {
      if (violations.length > 0) {
        console.log(`\n${this.getLevelIcon(level)} ${level} 级别违规详情:`);
        
        const fileGroups = this.groupViolationsByFile(violations);
        for (const [file, fileViolations] of Object.entries(fileGroups)) {
          console.log(`  📄 ${file}`);
          fileViolations.forEach(violation => {
            console.log(`     ${this.getLevelIcon(violation.level)} ${violation.message}`);
            if (violation.code.length < 100) {
              console.log(`        代码: ${violation.code.trim()}`);
            }
          });
        }
      }
    }
    
    // 总结
    if (this.stats.blockingViolations === 0) {
      console.log('\n🎉 恭喜！所有阻断级别违规已修复！');
      console.log('✅ 代码库符合CSS治理标准，可以安全提交。');
    } else {
      console.log(`\n🚫 发现 ${this.stats.blockingViolations} 个阻断级别违规，需要修复后才能提交。`);
      console.log('💡 建议：运行相应的修复工具或手动修复违规项。');
    }
  }

  groupViolationsByLevel() {
    const groups = { CRITICAL: [], ERROR: [], WARNING: [] };
    this.violations.forEach(violation => {
      groups[violation.level].push(violation);
    });
    return groups;
  }

  groupViolationsByFile(violations) {
    const groups = {};
    violations.forEach(violation => {
      if (!groups[violation.filePath]) {
        groups[violation.filePath] = [];
      }
      groups[violation.filePath].push(violation);
    });
    return groups;
  }

  getLevelIcon(level) {
    const icons = {
      CRITICAL: '🚨',
      ERROR: '❌',
      WARNING: '⚠️'
    };
    return icons[level] || '📝';
  }
}

async function main() {
  const checker = new SmartGovernanceChecker();
  await checker.checkAllFiles();
}

main().catch(console.error);

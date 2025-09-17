#!/usr/bin/env node

/**
 * 🔍 Dialog CSS文件分析脚本
 * 分析所有Dialog相关的CSS文件，识别重复和核心文件
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 开始分析Dialog CSS文件...\n');

const projectRoot = process.cwd();
const stylesDir = path.join(projectRoot, 'src/styles');

let analysis = {
  dialogFiles: [],
  duplicates: [],
  coreFiles: [],
  obsoleteFiles: [],
  totalSize: 0
};

/**
 * 获取所有Dialog相关的CSS文件
 */
function getDialogCSSFiles() {
  console.log('📁 扫描styles目录...');
  
  const files = fs.readdirSync(stylesDir);
  const dialogFiles = files.filter(file => 
    file.endsWith('.css') && 
    (file.includes('dialog') || file.includes('Dialog'))
  );
  
  console.log(`找到 ${dialogFiles.length} 个Dialog相关CSS文件:`);
  dialogFiles.forEach(file => console.log(`  • ${file}`));
  console.log('');
  
  return dialogFiles;
}

/**
 * 分析文件内容和用途
 */
function analyzeFileContent(fileName) {
  const filePath = path.join(stylesDir, fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  const stats = fs.statSync(filePath);
  
  const analysis = {
    fileName,
    size: stats.size,
    lines: content.split('\n').length,
    hasQuickReference: content.includes('quick-reference'),
    hasHistoryDialog: content.includes('history') || content.includes('History'),
    hasPositioning: content.includes('position') || content.includes('top:') || content.includes('left:'),
    hasViewportUnits: content.includes('vh') || content.includes('vw'),
    hasImportant: (content.match(/!important/g) || []).length,
    hasInsetReset: content.includes('inset:'),
    selectors: extractSelectors(content),
    purpose: determinePurpose(fileName, content)
  };
  
  return analysis;
}

/**
 * 提取CSS选择器
 */
function extractSelectors(content) {
  const selectorRegex = /([.#]?[\w-]+(?:\[[\w-="':*\]]+\])?(?:::?[\w-]+)?)\s*{/g;
  const selectors = [];
  let match;
  
  while ((match = selectorRegex.exec(content)) !== null) {
    selectors.push(match[1].trim());
  }
  
  return [...new Set(selectors)].slice(0, 10); // 取前10个唯一选择器
}

/**
 * 判断文件用途
 */
function determinePurpose(fileName, content) {
  if (fileName.includes('emergency')) return 'emergency-fix';
  if (fileName.includes('ultimate') || fileName.includes('final')) return 'ultimate-fix';
  if (fileName.includes('basic')) return 'basic-fix';
  if (fileName.includes('unified')) return 'unified-system';
  if (fileName.includes('enhanced-history')) return 'history-dialog-fix';
  if (fileName.includes('quick-reference')) return 'quick-reference-fix';
  if (content.includes('position') && content.includes('dialog')) return 'positioning-fix';
  return 'unknown';
}

/**
 * 识别重复和冗余文件
 */
function identifyDuplicatesAndObsolete(analyses) {
  console.log('🔍 识别重复和冗余文件...');
  
  // 按用途分组
  const purposeGroups = {};
  analyses.forEach(analysis => {
    const purpose = analysis.purpose;
    if (!purposeGroups[purpose]) {
      purposeGroups[purpose] = [];
    }
    purposeGroups[purpose].push(analysis);
  });
  
  console.log('📊 按用途分组:');
  Object.entries(purposeGroups).forEach(([purpose, files]) => {
    console.log(`  ${purpose}: ${files.map(f => f.fileName).join(', ')}`);
  });
  console.log('');
  
  // 识别核心文件
  const coreFiles = [
    'enhanced-history-dialog-fix.css',
    'quick-reference-dialog-emergency-fix.css',
    'unified-dialog-positioning.css'
  ];
  
  // 识别可能的重复文件
  const potentialDuplicates = [
    'dialog-basic-fix.css',
    'final-dialog-position-fix.css',
    'ultimate-dialog-position-fix.css',
    'emergency-dialog-fix.css',
    'dialog-position-fix-final.css',
    'dialog-ultimate-override.css',
    'dialog-viewport-fix.css'
  ];
  
  return { coreFiles, potentialDuplicates, purposeGroups };
}

/**
 * 生成重命名建议
 */
function generateRenamingSuggestions(analyses) {
  console.log('💡 生成重命名建议...');
  
  const suggestions = [];
  
  analyses.forEach(analysis => {
    let newName = analysis.fileName;
    
    // 应用新的命名规范
    if (analysis.fileName === 'enhanced-history-dialog-fix.css') {
      newName = 'fix-history-dialog-positioning.css';
    } else if (analysis.fileName === 'quick-reference-dialog-emergency-fix.css') {
      newName = 'fix-quick-reference-dialog-positioning.css';
    } else if (analysis.fileName === 'unified-dialog-positioning.css') {
      newName = 'unified-dialog-positioning.css'; // 保持不变
    }
    
    if (newName !== analysis.fileName) {
      suggestions.push({
        oldName: analysis.fileName,
        newName: newName,
        reason: '应用统一命名规范'
      });
    }
  });
  
  return suggestions;
}

/**
 * 生成分析报告
 */
function generateReport(analyses, duplicateInfo, suggestions) {
  console.log('📊 Dialog CSS文件分析报告');
  console.log('==================================================');
  console.log(`📁 总文件数: ${analyses.length}`);
  console.log(`📦 总大小: ${Math.round(analysis.totalSize / 1024)}KB`);
  console.log(`🎯 核心文件: ${duplicateInfo.coreFiles.length}`);
  console.log(`🔄 可能重复: ${duplicateInfo.potentialDuplicates.length}`);
  console.log('==================================================\n');
  
  console.log('📋 文件详细分析:');
  analyses.forEach(file => {
    console.log(`\n📄 ${file.fileName}`);
    console.log(`   📦 大小: ${Math.round(file.size / 1024)}KB (${file.lines} 行)`);
    console.log(`   🎯 用途: ${file.purpose}`);
    console.log(`   ✨ 特性: ${[
      file.hasQuickReference && '快速引用',
      file.hasHistoryDialog && '历史记录',
      file.hasPositioning && '定位修复',
      file.hasViewportUnits && '视窗单位',
      file.hasInsetReset && 'inset重置'
    ].filter(Boolean).join(', ') || '无特殊特性'}`);
    console.log(`   🔧 !important数量: ${file.hasImportant}`);
    console.log(`   🎨 主要选择器: ${file.selectors.slice(0, 3).join(', ')}`);
  });
  
  console.log('\n🎯 核心文件 (保留):');
  duplicateInfo.coreFiles.forEach(file => {
    const analysis = analyses.find(a => a.fileName === file);
    if (analysis) {
      console.log(`  ✅ ${file} - ${analysis.purpose}`);
    }
  });
  
  console.log('\n🗑️ 建议删除的重复文件:');
  duplicateInfo.potentialDuplicates.forEach(file => {
    const analysis = analyses.find(a => a.fileName === file);
    if (analysis) {
      console.log(`  ❌ ${file} - ${analysis.purpose} (${Math.round(analysis.size / 1024)}KB)`);
    }
  });
  
  console.log('\n🔄 重命名建议:');
  if (suggestions.length > 0) {
    suggestions.forEach(suggestion => {
      console.log(`  📝 ${suggestion.oldName} → ${suggestion.newName}`);
      console.log(`     💡 ${suggestion.reason}`);
    });
  } else {
    console.log('  ✅ 无需重命名');
  }
  
  console.log('\n🎯 下一步操作:');
  console.log('1. 🗑️ 删除重复和冗余文件');
  console.log('2. 🔄 重命名核心文件');
  console.log('3. 📝 更新import引用');
  console.log('4. 🧪 验证功能完整性');
  console.log('5. 🎨 应用BEM命名规范');
}

// 执行分析
const dialogFiles = getDialogCSSFiles();
const analyses = dialogFiles.map(analyzeFileContent);
analysis.totalSize = analyses.reduce((sum, file) => sum + file.size, 0);

const duplicateInfo = identifyDuplicatesAndObsolete(analyses);
const suggestions = generateRenamingSuggestions(analyses);

generateReport(analyses, duplicateInfo, suggestions);

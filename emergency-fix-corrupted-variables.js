#!/usr/bin/env node

/**
 * 紧急修复被错误替换的变量名和属性
 * 修复 "red" 被替换为 "hsl(var(--destructive))" 导致的变量名损坏
 */

import fs from 'fs';
import path from 'path';

// 需要修复的错误替换模式
const CORRUPTION_FIXES = [
  // 修复变量名中的错误替换
  ['filtehsl(var(--destructive))Categories', 'filteredCategories'],
  ['requihsl(var(--destructive))', 'required'],
  ['requihsl(var(--destructive))="', 'required="'],
  ['prefehsl(var(--destructive))', 'preferred'],
  ['registehsl(var(--destructive))', 'registered'],
  ['centehsl(var(--destructive))', 'centered'],
  ['ordehsl(var(--destructive))', 'ordered'],
  ['rendehsl(var(--destructive))', 'rendered'],
  ['storehsl(var(--destructive))', 'stored'],
  ['sharhsl(var(--destructive))', 'shared'],
  ['clearhsl(var(--destructive))', 'cleared'],
  ['preparehsl(var(--destructive))', 'prepared'],
  ['comparehsl(var(--destructive))', 'compared'],
  ['declarehsl(var(--destructive))', 'declared'],
  ['explorehsl(var(--destructive))', 'explored'],
  ['ignorehsl(var(--destructive))', 'ignored'],
  ['securehsl(var(--destructive))', 'secured'],
  ['ensurehsl(var(--destructive))', 'ensured'],
  ['measurehsl(var(--destructive))', 'measured'],
  ['treasurehsl(var(--destructive))', 'treasured'],
  ['featurehsl(var(--destructive))', 'featured'],
  ['picturehsl(var(--destructive))', 'pictured'],
  ['structurehsl(var(--destructive))', 'structured'],
  ['culturehsl(var(--destructive))', 'cultured'],
  ['naturehsl(var(--destructive))', 'natured'],
  ['adventurehsl(var(--destructive))', 'adventured'],
  ['departurehsl(var(--destructive))', 'departured'],
  ['capturehsl(var(--destructive))', 'captured'],
  ['gesturehsl(var(--destructive))', 'gestured'],
  ['lecturehsl(var(--destructive))', 'lectured'],
  ['manufacturehsl(var(--destructive))', 'manufactured'],
  ['procedurehsl(var(--destructive))', 'procedured'],
  ['temperaturehsl(var(--destructive))', 'temperatured'],
  ['literaturehsl(var(--destructive))', 'literatured'],
  ['signaturehsl(var(--destructive))', 'signatured'],
  ['miniaturehsl(var(--destructive))', 'miniatured'],
  ['furniturehsl(var(--destructive))', 'furnitured'],
  ['architecturehsl(var(--destructive))', 'architectured'],
  
  // 修复属性名中的错误替换
  ['data-requihsl(var(--destructive))', 'data-required'],
  ['aria-requihsl(var(--destructive))', 'aria-required'],
  ['is-requihsl(var(--destructive))', 'is-required'],
  
  // 修复类名中的错误替换
  ['class="requihsl(var(--destructive))', 'class="required'],
  ['className="requihsl(var(--destructive))', 'className="required'],
  
  // 修复函数名中的错误替换
  ['function requihsl(var(--destructive))', 'function required'],
  ['const requihsl(var(--destructive))', 'const required'],
  ['let requihsl(var(--destructive))', 'let required'],
  ['var requihsl(var(--destructive))', 'var required'],
  
  // 修复对象属性中的错误替换
  ['.requihsl(var(--destructive))', '.required'],
  ['[requihsl(var(--destructive))]', '[required]'],
  ['{requihsl(var(--destructive))', '{required'],
  
  // 修复字符串中的错误替换（但要小心不要影响真正的CSS）
  ['"requihsl(var(--destructive))"', '"required"'],
  ["'requihsl(var(--destructive))'", "'required'"],
  ['`requihsl(var(--destructive))`', '`required`'],
];

function fixCorruptedFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalReplacements = 0;
    let hasChanges = false;
    
    // 执行所有修复
    CORRUPTION_FIXES.forEach(([corrupted, fixed]) => {
      const regex = new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, fixed);
        totalReplacements += matches.length;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ ${filePath}: 修复了 ${totalReplacements} 个损坏的变量/属性`);
    }
    
    return totalReplacements;
  } catch (error) {
    console.warn(`  ⚠️ 无法处理文件: ${filePath} - ${error.message}`);
    return 0;
  }
}

function getAllFiles(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
        files = files.concat(getAllFiles(fullPath, extensions));
      } else if (stat.isFile() && extensions.includes(path.extname(fullPath))) {
        // 排除工具文件
        const fileName = path.basename(fullPath);
        if (!fileName.includes('fix-') && 
            !fileName.includes('comprehensive-design-scanner.js') &&
            !fileName.includes('colorTokenMapping.ts')) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`无法读取目录: ${dirPath}`);
  }
  
  return files;
}

function emergencyFixCorruption() {
  console.log('🚨 开始紧急修复被损坏的变量名和属性...');
  
  const files = getAllFiles('src');
  let totalReplacements = 0;
  let processedFiles = 0;
  
  files.forEach(file => {
    const replacements = fixCorruptedFile(file);
    if (replacements > 0) {
      processedFiles++;
      totalReplacements += replacements;
    }
  });
  
  console.log(`🎉 紧急修复完成！`);
  console.log(`  处理文件: ${processedFiles} 个`);
  console.log(`  总修复数: ${totalReplacements} 个`);
  
  if (totalReplacements > 0) {
    console.log('\n✅ 建议立即重启开发服务器以应用修复！');
  }
}

// 运行紧急修复
emergencyFixCorruption();

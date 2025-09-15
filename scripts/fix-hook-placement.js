#!/usr/bin/env node

/**
 * 修复Hook位置错误脚本
 * 修复错误放置在函数参数中的useTranslation hook
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class HookPlacementFixer {
  constructor() {
    this.fixedCount = 0;
    this.fileCount = 0;
  }

  /**
   * 运行修复
   */
  async run() {
    console.log('🔧 开始修复Hook位置错误...\n');

    try {
      // 查找所有TSX文件
      const tsxFiles = await glob('src/**/*.tsx', { cwd: process.cwd() });
      
      console.log(`📁 找到 ${tsxFiles.length} 个TSX文件`);
      
      for (const filePath of tsxFiles) {
        await this.fixFile(filePath);
      }
      
      console.log(`\n✅ Hook位置修复完成！`);
      console.log(`📊 处理了 ${this.fileCount} 个文件，修复了 ${this.fixedCount} 处错误`);
      
    } catch (error) {
      console.error('❌ Hook位置修复失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 修复单个文件
   */
  async fixFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileFixedCount = 0;

    // 修复函数参数中错误放置的useTranslation hook
    // 模式1: export const Component = ({ const { t } = useTranslation(); prop1, prop2 }) => {
    const pattern1 = /export const (\w+): React\.FC<[^>]*> = \(\{\s*const \{ t \} = useTranslation\(\);\s*([^}]*)\}\) => \{/g;
    const matches1 = content.match(pattern1);
    if (matches1) {
      content = content.replace(pattern1, (match, componentName, props) => {
        const cleanProps = props.trim();
        return `export const ${componentName}: React.FC<any> = ({ ${cleanProps} }) => {
  const { t } = useTranslation();`;
      });
      fileFixedCount += matches1.length;
    }

    // 模式2: 在对象字面量中错误放置的hook
    const pattern2 = /const (\w+) = \{\s*const \{ t \} = useTranslation\(\);\s*([^}]*)\}/g;
    const matches2 = content.match(pattern2);
    if (matches2) {
      content = content.replace(pattern2, (match, varName, objContent) => {
        return `const { t } = useTranslation();
  const ${varName} = {
    ${objContent}
  }`;
      });
      fileFixedCount += matches2.length;
    }

    // 模式3: 在类组件中错误使用hook
    const pattern3 = /const \{ t \} = useTranslation\(\);\s*(\w+): this\.state\.(\w+),/g;
    const matches3 = content.match(pattern3);
    if (matches3) {
      content = content.replace(pattern3, '$1: this.state.$2,');
      fileFixedCount += matches3.length;
    }

    // 模式4: 修复函数参数中的hook（更通用的模式）
    const pattern4 = /(\w+): React\.FC<[^>]*> = \(\{\s*const \{ t \} = useTranslation\(\);\s*/g;
    const matches4 = content.match(pattern4);
    if (matches4) {
      content = content.replace(pattern4, (match, componentName) => {
        return `${componentName}: React.FC<any> = ({ `;
      });
      
      // 在函数体开始处添加hook
      content = content.replace(/\}\) => \{(\s*)/g, '}) => {\n  const { t } = useTranslation();$1');
      fileFixedCount += matches4.length;
    }

    // 如果有修改，保存文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      this.fileCount++;
      this.fixedCount += fileFixedCount;
      console.log(`✅ ${filePath} 修复了 ${fileFixedCount} 处Hook位置错误`);
    }
  }
}

// 运行修复
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new HookPlacementFixer();
  fixer.run().catch(console.error);
}

export default HookPlacementFixer;

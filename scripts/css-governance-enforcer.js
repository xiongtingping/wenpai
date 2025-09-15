#!/usr/bin/env node

/**
 * 🏛️ CSS治理强制执行器
 * 
 * 功能：
 * 1. 检测CSS治理违规行为
 * 2. 自动修复可修复的问题
 * 3. 生成治理合规性报告
 * 4. 阻断不合规的代码提交
 * 
 * 使用方法：
 * npm run css:governance:check    # 检查模式
 * npm run css:governance:fix     # 修复模式
 * npm run css:governance:report  # 报告模式
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// 🎯 治理规则配置
const GOVERNANCE_RULES = {
  // Level 4 - 紧急阻断
  CRITICAL: {
    GLOBAL_TRANSFORM: {
      pattern: /^\s*\*\s*\{[^}]*transform\s*:[^}]*\}/gm,
      message: '🚨 严重违规：禁止全局transform属性',
      autoFix: false,
      blockCommit: true
    },
    INLINE_STYLES: {
      pattern: /style\s*=\s*\{\{[^}]+\}\}(?![^\/]*\/\*.*TODO.*内联样式)/g,
      message: '🚨 严重违规：禁止内联样式',
      autoFix: false,
      blockCommit: true
    }
  },
  
  // Level 3 - 错误阻断
  ERROR: {
    HARDCODED_COLORS: {
      pattern: /#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g,
      message: '❌ 错误：禁止硬编码颜色值',
      autoFix: true,
      blockCommit: true,
      fixSuggestion: 'var(--color-primary)'
    },
    HARDCODED_SIZES: {
      pattern: /\b\d+px\b(?![^{]*var\()/g,
      message: '❌ 错误：禁止硬编码尺寸值',
      autoFix: true,
      blockCommit: true,
      fixSuggestion: 'var(--spacing-*)'
    },
    IMPORTANT_ABUSE: {
      pattern: /!\s*important(?![^{]*@layer\s+emergency)/g,
      message: '❌ 错误：!important只能在emergency层使用',
      autoFix: false,
      blockCommit: true
    }
  },
  
  // Level 2 - 警告
  WARNING: {
    MISSING_LAYER: {
      pattern: /^(?!.*@layer)[^@]*\{/gm,
      message: '⚠️ 警告：样式应该在@layer中定义',
      autoFix: true,
      blockCommit: false
    },
    NO_DESIGN_TOKENS: {
      pattern: /(?:color|background|border|font-size|padding|margin):\s*(?!var\()/g,
      message: '⚠️ 警告：应使用设计令牌',
      autoFix: false,
      blockCommit: false
    }
  }
};

// 🎯 层级顺序验证
const LAYER_ORDER = ['reset', 'tokens', 'base', 'components', 'utilities', 'overrides', 'emergency'];

class CSSGovernanceEnforcer {
  constructor() {
    this.violations = [];
    this.stats = {
      filesChecked: 0,
      violationsFound: 0,
      autoFixed: 0,
      blocked: 0
    };
  }

  /**
   * 🔍 检查所有CSS文件
   */
  async checkAllFiles() {
    const cssFiles = glob.sync('src/**/*.css');
    const jsxFiles = glob.sync('src/**/*.{jsx,tsx}');
    
    console.log('🏛️ CSS治理检查开始...\n');
    
    for (const file of [...cssFiles, ...jsxFiles]) {
      await this.checkFile(file);
    }
    
    this.generateReport();
    return this.violations;
  }

  /**
   * 🔍 检查单个文件
   */
  async checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    this.stats.filesChecked++;
    
    // 检查所有治理规则
    for (const [level, rules] of Object.entries(GOVERNANCE_RULES)) {
      for (const [ruleName, rule] of Object.entries(rules)) {
        const matches = content.match(rule.pattern);
        
        if (matches) {
          const violation = {
            file: filePath,
            rule: ruleName,
            level: level,
            message: rule.message,
            matches: matches,
            autoFix: rule.autoFix,
            blockCommit: rule.blockCommit,
            fixSuggestion: rule.fixSuggestion
          };
          
          this.violations.push(violation);
          this.stats.violationsFound++;
          
          if (rule.blockCommit) {
            this.stats.blocked++;
          }
        }
      }
    }
    
    // 检查层级顺序
    this.checkLayerOrder(filePath, content);
  }

  /**
   * 🔍 检查@layer顺序
   */
  checkLayerOrder(filePath, content) {
    const layerMatches = content.match(/@layer\s+([^;{]+)/g);
    if (!layerMatches) return;
    
    const definedLayers = layerMatches[0]
      .replace('@layer', '')
      .split(',')
      .map(layer => layer.trim());
    
    // 验证层级顺序
    for (let i = 0; i < definedLayers.length; i++) {
      const currentLayer = definedLayers[i];
      const expectedIndex = LAYER_ORDER.indexOf(currentLayer);
      
      if (expectedIndex === -1) {
        this.violations.push({
          file: filePath,
          rule: 'INVALID_LAYER',
          level: 'ERROR',
          message: `❌ 错误：未知的层级 "${currentLayer}"`,
          blockCommit: true
        });
      } else if (i > 0) {
        const prevLayer = definedLayers[i - 1];
        const prevIndex = LAYER_ORDER.indexOf(prevLayer);
        
        if (expectedIndex <= prevIndex) {
          this.violations.push({
            file: filePath,
            rule: 'WRONG_LAYER_ORDER',
            level: 'ERROR',
            message: `❌ 错误：层级顺序错误 "${currentLayer}" 应该在 "${prevLayer}" 之前`,
            blockCommit: true
          });
        }
      }
    }
  }

  /**
   * 🔧 自动修复违规
   */
  async autoFix() {
    console.log('🔧 开始自动修复...\n');
    
    for (const violation of this.violations) {
      if (violation.autoFix) {
        await this.fixViolation(violation);
        this.stats.autoFixed++;
      }
    }
    
    console.log(`✅ 自动修复完成：${this.stats.autoFixed} 个问题已修复\n`);
  }

  /**
   * 🔧 修复单个违规
   */
  async fixViolation(violation) {
    const content = fs.readFileSync(violation.file, 'utf8');
    let fixedContent = content;
    
    switch (violation.rule) {
      case 'HARDCODED_COLORS':
        fixedContent = content.replace(
          violation.pattern,
          'var(--color-primary) /* TODO: 使用正确的设计令牌 */'
        );
        break;
        
      case 'HARDCODED_SIZES':
        fixedContent = content.replace(
          violation.pattern,
          'var(--spacing-4) /* TODO: 使用正确的间距令牌 */'
        );
        break;
        
      case 'MISSING_LAYER':
        // 为样式添加适当的@layer包装
        fixedContent = this.wrapWithLayer(content);
        break;
    }
    
    if (fixedContent !== content) {
      fs.writeFileSync(violation.file, fixedContent);
      console.log(`🔧 已修复：${violation.file} - ${violation.rule}`);
    }
  }

  /**
   * 🔧 为样式添加@layer包装
   */
  wrapWithLayer(content) {
    // 简单的启发式方法来确定适当的层级
    if (content.includes('.button') || content.includes('.card')) {
      return `@layer components {\n${content}\n}`;
    } else if (content.includes('.u-') || content.includes('.utility')) {
      return `@layer utilities {\n${content}\n}`;
    } else {
      return `@layer components {\n${content}\n}`;
    }
  }

  /**
   * 📊 生成治理报告
   */
  generateReport() {
    console.log('📊 CSS治理合规性报告');
    console.log('='.repeat(50));
    console.log(`📁 检查文件数：${this.stats.filesChecked}`);
    console.log(`🚨 发现违规数：${this.stats.violationsFound}`);
    console.log(`🔧 自动修复数：${this.stats.autoFixed}`);
    console.log(`🚫 阻断提交数：${this.stats.blocked}`);
    console.log('='.repeat(50));
    
    if (this.violations.length === 0) {
      console.log('✅ 恭喜！所有文件都符合CSS治理规范！');
      return;
    }
    
    // 按级别分组显示违规
    const violationsByLevel = this.violations.reduce((acc, violation) => {
      if (!acc[violation.level]) acc[violation.level] = [];
      acc[violation.level].push(violation);
      return acc;
    }, {});
    
    for (const [level, violations] of Object.entries(violationsByLevel)) {
      console.log(`\n${this.getLevelIcon(level)} ${level} 级别违规 (${violations.length}个):`);
      
      violations.forEach(violation => {
        console.log(`  📄 ${violation.file}`);
        console.log(`     ${violation.message}`);
        if (violation.fixSuggestion) {
          console.log(`     💡 建议：使用 ${violation.fixSuggestion}`);
        }
      });
    }
    
    // 检查是否需要阻断提交
    if (this.stats.blocked > 0) {
      console.log('\n🚫 代码提交被阻断！');
      console.log('请修复所有ERROR和CRITICAL级别的违规后再提交。');
      process.exit(1);
    }
  }

  /**
   * 🎨 获取级别图标
   */
  getLevelIcon(level) {
    const icons = {
      CRITICAL: '🚨',
      ERROR: '❌',
      WARNING: '⚠️'
    };
    return icons[level] || '📋';
  }
}

// 🚀 主执行逻辑
async function main() {
  const enforcer = new CSSGovernanceEnforcer();
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      await enforcer.checkAllFiles();
      break;
      
    case 'fix':
      await enforcer.checkAllFiles();
      await enforcer.autoFix();
      break;
      
    case 'report':
      await enforcer.checkAllFiles();
      // 报告已在checkAllFiles中生成
      break;
      
    default:
      console.log('🏛️ CSS治理强制执行器');
      console.log('使用方法：');
      console.log('  node css-governance-enforcer.js check   # 检查模式');
      console.log('  node css-governance-enforcer.js fix     # 修复模式');
      console.log('  node css-governance-enforcer.js report  # 报告模式');
  }
}

// 运行主函数
main().catch(console.error);

export default CSSGovernanceEnforcer;

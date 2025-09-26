#!/usr/bin/env node

/**
 * UI组件职责冲突自动化检测脚本
 * 
 * 检测"两套定位系统叠加"等违反UI组件职责分离的代码模式
 * 根据CLAUDE.md规则和您的分析建立的检测机制
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// 检测规则配置
const DETECTION_RULES = {
  CRITICAL: {
    // Level 4 - 立即阻断
    patterns: [
      {
        name: 'DUAL_POSITIONING_SYSTEMS',
        regex: /(fixed.*left.*%.*top.*%|top.*%.*left.*%.*fixed)/g,
        description: '两套定位系统叠加：fixed + top/left + %',
        severity: 'CRITICAL'
      },
      {
        name: 'INSET_TRANSFORM_CONFLICT', 
        regex: /(inset.*transform.*translate|transform.*translate.*inset)/g,
        description: 'inset与transform定位冲突',
        severity: 'CRITICAL'
      },
      {
        name: 'MANUAL_POSITIONING_WITH_RADIX',
        regex: /(left-\[50%\].*top-\[50%\].*translate-|translate-.*left-\[50%\].*top-\[50%\])/g,
        description: 'Radix组件中使用手动居中定位',
        severity: 'CRITICAL'
      }
    ]
  },
  ERROR: {
    // Level 3 - 阻断提交
    patterns: [
      {
        name: 'TRANSITION_DATA_STATE_CONFLICT',
        regex: /(transition.*data-\[state|data-\[state.*transition)/g,
        description: '通用transition与data-[state]动画冲突',
        severity: 'ERROR'
      },
      {
        name: 'SIZE_OVERRIDE_IN_DIALOG',
        regex: /(w-full.*dialog|dialog.*w-full|h-full.*dialog|dialog.*h-full)/gi,
        description: 'Dialog组件中强制覆盖尺寸',
        severity: 'ERROR'
      },
      {
        name: 'MANUAL_BODY_OVERFLOW_WITH_RADIX',
        regex: /(overflow.*radix|radix.*overflow)/gi,
        description: '手动控制body overflow与Radix冲突',
        severity: 'ERROR'
      },
      {
        name: 'SLIDE_ANIMATION_WITH_POSITIONING',
        regex: /(slide-in-from.*left.*%|slide-in-from.*top.*%)/g,
        description: 'slide动画与百分比定位冲突',
        severity: 'ERROR'
      }
    ]
  },
  WARNING: {
    // Level 2 - 警告
    patterns: [
      {
        name: 'HIGH_Z_INDEX_POTENTIAL_CONFLICT',
        regex: /z-index:\s*\d{4,}|z-\d{4,}/g,
        description: '过高的z-index可能与组件库冲突',
        severity: 'WARNING'
      },
      {
        name: 'HARDCODED_ANIMATION_DURATION',
        regex: /(duration-\d+.*data-\[state|data-\[state.*duration-\d+)/g,
        description: '硬编码动画时长可能与库冲突',
        severity: 'WARNING'
      },
      {
        name: 'MANUAL_OVERLAY_Z_INDEX',
        regex: /(position:\s*absolute.*z-index:\s*\d{4,})/g,
        description: '手动创建高z-index遮罩可能与库冲突',
        severity: 'WARNING'
      }
    ]
  }
};

// 文件扫描配置
const SCAN_CONFIG = {
  patterns: [
    'src/**/*.{tsx,ts,jsx,js}',
    'src/**/*.css'
  ],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/backup/**',
    '**/UNIFIED_CLEANUP_BACKUP_*/**'
  ]
};

class UIConflictDetector {
  constructor() {
    this.violations = [];
    this.stats = {
      totalFiles: 0,
      violationFiles: 0,
      totalViolations: 0,
      byLevel: {
        CRITICAL: 0,
        ERROR: 0,
        WARNING: 0
      }
    };
  }

  /**
   * 扫描文件内容查找违规模式
   */
  scanFileContent(filePath, content) {
    const violations = [];

    // 移除注释内容，避免误报
    const cleanContent = this.removeComments(content, filePath);

    // 扫描所有级别的规则
    Object.entries(DETECTION_RULES).forEach(([level, ruleSet]) => {
      ruleSet.patterns.forEach(rule => {
        let match;
        while ((match = rule.regex.exec(cleanContent)) !== null) {
          const lineNumber = this.getLineNumber(content, match.index);
          
          // 检查是否在注释中（双重检查）
          if (this.isInComment(content, match.index)) {
            continue;
          }
          
          violations.push({
            file: filePath,
            line: lineNumber,
            rule: rule.name,
            severity: rule.severity,
            description: rule.description,
            match: match[0],
            position: match.index
          });

          // 统计
          this.stats.byLevel[rule.severity]++;
          this.stats.totalViolations++;
        }
        
        // 重置正则表达式状态
        rule.regex.lastIndex = 0;
      });
    });

    return violations;
  }

  /**
   * 移除注释内容
   */
  removeComments(content, filePath) {
    const ext = filePath.split('.').pop();
    
    if (ext === 'css') {
      // CSS注释 /* ... */
      return content.replace(/\/\*[\s\S]*?\*\//g, '');
    } else if (['tsx', 'ts', 'jsx', 'js'].includes(ext)) {
      // JS/TS注释 // ... 和 /* ... */
      return content
        .replace(/\/\*[\s\S]*?\*\//g, '') // 多行注释
        .replace(/\/\/.*$/gm, ''); // 单行注释
    }
    
    return content;
  }

  /**
   * 检查位置是否在注释中
   */
  isInComment(content, position) {
    const beforeContent = content.substring(0, position);
    
    // 检查是否在CSS多行注释中
    const lastCommentStart = beforeContent.lastIndexOf('/*');
    const lastCommentEnd = beforeContent.lastIndexOf('*/');
    if (lastCommentStart > lastCommentEnd) {
      return true;
    }
    
    // 检查是否在单行注释中
    const lines = beforeContent.split('\n');
    const currentLine = lines[lines.length - 1];
    if (currentLine.includes('//')) {
      return true;
    }
    
    return false;
  }

  /**
   * 获取匹配位置的行号
   */
  getLineNumber(content, position) {
    return content.substring(0, position).split('\\n').length;
  }

  /**
   * 扫描单个文件
   */
  async scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const violations = this.scanFileContent(filePath, content);
      
      if (violations.length > 0) {
        this.violations.push(...violations);
        this.stats.violationFiles++;
      }
      
      this.stats.totalFiles++;
      return violations;
    } catch (error) {
      console.error(`❌ 读取文件失败: ${filePath}`, error.message);
      return [];
    }
  }

  /**
   * 扫描所有匹配的文件
   */
  async scanAllFiles() {
    console.log('🔍 开始扫描UI组件职责冲突...');
    
    const allFiles = [];
    
    // 收集所有要扫描的文件
    for (const pattern of SCAN_CONFIG.patterns) {
      const files = await glob(pattern, { 
        ignore: SCAN_CONFIG.exclude,
        absolute: true 
      });
      allFiles.push(...files);
    }

    // 去重
    const uniqueFiles = [...new Set(allFiles)];
    
    console.log(`📁 找到 ${uniqueFiles.length} 个文件需要检查`);

    // 扫描每个文件
    for (const filePath of uniqueFiles) {
      await this.scanFile(filePath);
    }

    return this.violations;
  }

  /**
   * 生成检测报告
   */
  generateReport() {
    const report = {
      summary: this.stats,
      violations: this.violations,
      recommendation: this.generateRecommendations()
    };

    return report;
  }

  /**
   * 生成修复建议
   */
  generateRecommendations() {
    const recommendations = [];
    
    // 根据违规类型生成具体建议
    const violationsByRule = {};
    this.violations.forEach(v => {
      if (!violationsByRule[v.rule]) {
        violationsByRule[v.rule] = [];
      }
      violationsByRule[v.rule].push(v);
    });

    Object.entries(violationsByRule).forEach(([rule, violations]) => {
      switch (rule) {
        case 'DUAL_POSITIONING_SYSTEMS':
          recommendations.push({
            rule,
            count: violations.length,
            suggestion: '移除手动的 fixed + top/left + % 定位，完全交由 Radix UI 控制定位',
            action: '删除 className 中的 fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]'
          });
          break;
        case 'TRANSITION_DATA_STATE_CONFLICT':
          recommendations.push({
            rule,
            count: violations.length,
            suggestion: '移除通用的 transition 类，只使用 data-[state] 动画系统',
            action: '删除 transition-* duration-* ease-* 等类，保留 data-[state=open]:animate-in 等'
          });
          break;
        case 'INSET_TRANSFORM_CONFLICT':
          recommendations.push({
            rule,
            count: violations.length,
            suggestion: '移除 inset 属性，避免与 transform 冲突',
            action: '删除 inset-0, inset-x-0 等可能与居中定位冲突的类'
          });
          break;
        default:
          recommendations.push({
            rule,
            count: violations.length,
            suggestion: '检查并修复此类违规',
            action: '请参考UI组件职责分离规范文档'
          });
      }
    });

    return recommendations;
  }

  /**
   * 格式化输出报告
   */
  printReport() {
    console.log('\\n' + '='.repeat(80));
    console.log('📊 UI组件职责冲突检测报告');
    console.log('='.repeat(80));
    
    // 概览统计
    console.log(`\\n📈 扫描概览：`);
    console.log(`📁 检查文件数：${this.stats.totalFiles}`);
    console.log(`🚨 发现违规数：${this.stats.totalViolations}`);
    console.log(`🔧 自动修复数：0`);
    console.log(`🚫 阻断提交数：${this.stats.byLevel.CRITICAL + this.stats.byLevel.ERROR}`);
    
    // 分级统计
    console.log(`\\n📊 违规等级分布：`);
    console.log(`🚨 CRITICAL 级别违规 (${this.stats.byLevel.CRITICAL}个):`);
    console.log(`❌ ERROR 级别违规 (${this.stats.byLevel.ERROR}个):`);
    console.log(`⚠️ WARNING 级别违规 (${this.stats.byLevel.WARNING}个):`);

    // 详细违规列表
    if (this.violations.length > 0) {
      console.log(`\\n🔍 详细违规列表：`);
      
      const violationsByFile = {};
      this.violations.forEach(v => {
        if (!violationsByFile[v.file]) {
          violationsByFile[v.file] = [];
        }
        violationsByFile[v.file].push(v);
      });

      Object.entries(violationsByFile).forEach(([file, violations]) => {
        const relativePath = path.relative(process.cwd(), file);
        console.log(`\\n📄 ${relativePath}:`);
        
        violations.forEach(v => {
          const icon = v.severity === 'CRITICAL' ? '🚨' : 
                     v.severity === 'ERROR' ? '❌' : '⚠️';
          console.log(`   ${icon} 第${v.line}行: ${v.description}`);
          console.log(`      匹配内容: "${v.match}"`);
        });
      });
    }

    // 修复建议
    if (this.generateRecommendations().length > 0) {
      console.log(`\\n💡 修复建议：`);
      this.generateRecommendations().forEach(rec => {
        console.log(`\\n🔧 ${rec.rule} (${rec.count}处):`);
        console.log(`   💭 建议: ${rec.suggestion}`);
        console.log(`   🎯 操作: ${rec.action}`);
      });
    }

    // 总结
    console.log(`\\n` + '='.repeat(80));
    
    if (this.stats.byLevel.CRITICAL > 0) {
      console.log('🚨 发现 CRITICAL 级别违规，必须立即修复！');
      process.exit(1);
    } else if (this.stats.byLevel.ERROR > 0) {
      console.log('❌ 发现 ERROR 级别违规，禁止提交！');
      process.exit(1);
    } else if (this.stats.byLevel.WARNING > 0) {
      console.log('⚠️ 发现 WARNING 级别违规，建议修复');
      process.exit(0);
    } else {
      console.log('✅ 恭喜！未发现UI组件职责冲突');
      process.exit(0);
    }
  }
}

// 主执行函数
async function main() {
  const detector = new UIConflictDetector();
  
  try {
    await detector.scanAllFiles();
    detector.printReport();
  } catch (error) {
    console.error('💥 检测过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default UIConflictDetector;
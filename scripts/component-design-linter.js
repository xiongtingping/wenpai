#!/usr/bin/env node

/**
 * 🏛️ 组件设计缺陷检测工具
 * 
 * 功能：
 * 1. 检测组件库中的设计缺陷
 * 2. 识别职责混淆和语义冲突
 * 3. 提供修复建议
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// 设计缺陷检测规则
const designLintRules = {
  // 冲突的定位属性
  conflictingPositioning: {
    name: "冲突的定位属性",
    description: "检测 inset-* 与 top-*/left-* 的冲突",
    severity: "error",
    patterns: [
      /inset-\d+.*(?:top-|left-|right-|bottom-)/,
      /(?:top-|left-|right-|bottom-).*inset-\d+/
    ],
    fix: "移除 inset-* 类，使用 top-*/left-* 或相反"
  },

  // 语义矛盾的尺寸声明
  semanticContradiction: {
    name: "语义矛盾的尺寸声明",
    description: "检测全屏与限制尺寸的矛盾",
    severity: "error", 
    patterns: [
      /w-full.*max-w-/,
      /h-full.*max-h-/,
      /w-screen.*max-w-/,
      /h-screen.*max-h-/
    ],
    fix: "移除 w-full/h-full 或 max-w-*/max-h-* 中的一个"
  },

  // 职责混淆
  responsibilityMixing: {
    name: "组件职责混淆",
    description: "内容组件使用了容器组件的样式",
    severity: "warning",
    patterns: [
      /fixed.*inset-0.*(?:max-w|max-h)/,
      /absolute.*inset-0.*(?:w-\d|h-\d)/
    ],
    fix: "将布局职责和内容职责分离到不同组件"
  },

  // 过度复杂的定位
  complexPositioning: {
    name: "过度复杂的定位逻辑",
    description: "单个元素包含过多定位相关类",
    severity: "info",
    patterns: [
      /(?:fixed|absolute|relative).*(?:top-|left-|right-|bottom-).*(?:translate|transform)/
    ],
    fix: "考虑简化定位逻辑或拆分为多个元素"
  }
};

// 组件文件扫描
function scanComponentFiles() {
  const componentPatterns = [
    'src/components/**/*.tsx',
    'src/components/**/*.jsx',
    'src/ui/**/*.tsx',
    'src/ui/**/*.jsx'
  ];

  let allFiles = [];
  componentPatterns.forEach(pattern => {
    const files = glob.sync(pattern);
    allFiles = allFiles.concat(files);
  });

  return [...new Set(allFiles)]; // 去重
}

// 提取className内容
function extractClassNames(content) {
  const classNameRegex = /className={cn\(([\s\S]*?)\)}/g;
  const simpleClassNameRegex = /className="([^"]+)"/g;
  const templateClassNameRegex = /className={`([^`]+)`}/g;

  let classNames = [];
  let match;

  // 提取 cn() 包装的类名
  while ((match = classNameRegex.exec(content)) !== null) {
    const cnContent = match[1];
    // 提取字符串中的类名
    const stringMatches = cnContent.match(/"([^"]+)"/g);
    if (stringMatches) {
      stringMatches.forEach(str => {
        classNames.push(str.replace(/"/g, ''));
      });
    }
  }

  // 提取简单的className
  while ((match = simpleClassNameRegex.exec(content)) !== null) {
    classNames.push(match[1]);
  }

  // 提取模板字符串className
  while ((match = templateClassNameRegex.exec(content)) !== null) {
    classNames.push(match[1]);
  }

  return classNames;
}

// 检测单个规则
function checkRule(className, rule) {
  for (const pattern of rule.patterns) {
    if (pattern.test(className)) {
      return {
        rule: rule.name,
        description: rule.description,
        severity: rule.severity,
        fix: rule.fix,
        matched: className
      };
    }
  }
  return null;
}

// 分析文件
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const classNames = extractClassNames(content);
  const issues = [];

  classNames.forEach(className => {
    Object.values(designLintRules).forEach(rule => {
      const issue = checkRule(className, rule);
      if (issue) {
        issues.push({
          file: filePath,
          line: getLineNumber(content, className),
          ...issue
        });
      }
    });
  });

  return issues;
}

// 获取行号（简单实现）
function getLineNumber(content, searchText) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchText)) {
      return i + 1;
    }
  }
  return 0;
}

// 格式化输出
function formatIssues(allIssues) {
  const groupedByFile = {};
  
  allIssues.forEach(issue => {
    if (!groupedByFile[issue.file]) {
      groupedByFile[issue.file] = [];
    }
    groupedByFile[issue.file].push(issue);
  });

  let output = '';
  let totalIssues = 0;
  const severityCounts = { error: 0, warning: 0, info: 0 };

  Object.entries(groupedByFile).forEach(([file, issues]) => {
    output += `\n📁 ${file}\n`;
    output += '=' .repeat(50) + '\n';
    
    issues.forEach(issue => {
      const severityIcon = {
        error: '🚨',
        warning: '⚠️',
        info: 'ℹ️'
      };
      
      output += `${severityIcon[issue.severity]} ${issue.rule}\n`;
      output += `   行 ${issue.line}: ${issue.matched}\n`;
      output += `   问题: ${issue.description}\n`;
      output += `   建议: ${issue.fix}\n\n`;
      
      severityCounts[issue.severity]++;
      totalIssues++;
    });
  });

  // 输出统计信息
  output += '\n🏆 检测结果统计\n';
  output += '=' .repeat(30) + '\n';
  output += `总问题数: ${totalIssues}\n`;
  output += `🚨 错误: ${severityCounts.error}\n`;
  output += `⚠️ 警告: ${severityCounts.warning}\n`;
  output += `ℹ️ 信息: ${severityCounts.info}\n`;

  return output;
}

// 主函数
function main() {
  console.log('🏛️ 启动组件设计缺陷检测...\n');

  const componentFiles = scanComponentFiles();
  console.log(`📋 扫描到 ${componentFiles.length} 个组件文件\n`);

  let allIssues = [];
  
  componentFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const issues = analyzeFile(file);
      allIssues = allIssues.concat(issues);
    }
  });

  if (allIssues.length === 0) {
    console.log('🎉 恭喜！未检测到组件设计缺陷');
    return;
  }

  console.log(formatIssues(allIssues));

  // 生成报告文件
  const reportPath = 'component-design-report.md';
  const reportContent = `# 组件设计缺陷检测报告

生成时间: ${new Date().toLocaleString()}

${formatIssues(allIssues)}

## 修复优先级建议

1. **🚨 错误级别**: 必须立即修复，会导致功能异常
2. **⚠️ 警告级别**: 建议修复，影响代码质量
3. **ℹ️ 信息级别**: 可选修复，代码优化建议

## 修复后验证

修复完成后，请重新运行此检测工具验证修复效果：

\`\`\`bash
node scripts/component-design-linter.js
\`\`\`
`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`\n📄 详细报告已生成: ${reportPath}`);
}

// 运行检测
main();

export {
  designLintRules,
  analyzeFile,
  scanComponentFiles
};
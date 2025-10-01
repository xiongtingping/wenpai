/**
 * 标题生成器验证工具
 * 用于验证重构后的标题生成是否修复了语病问题
 */

// 语病检测模式
const GRAMMAR_ERROR_PATTERNS = [
  {
    pattern: /\d+[个种款项次倍人家]的[^，。！？]+/,
    name: "数字+的+名词语法错误",
    example: "5个的工具",
    fix: "应该是'5个工具'或'发现5个工具'"
  },
  {
    pattern: /[工具软件平台应用]$/,
    name: "词汇截断问题",
    example: "AI工具",
    fix: "应该保持完整，如'AI工具推荐'"
  },
  {
    pattern: /让我真的$/,
    name: "不完整结尾",
    example: "让我真的",
    fix: "应该完整表达，如'让我真的震惊'"
  },
  {
    pattern: /我超爱它让我真的$/,
    name: "典型截断问题",
    example: "我超爱它让我真的",
    fix: "应该完整表达情感"
  },
  {
    pattern: /推荐200%发现宝藏.*真的$/,
    name: "推荐类截断",
    example: "推荐200%发现宝藏AI工具！真的",
    fix: "应该完整表达推荐理由"
  },
  {
    pattern: /音脚本直接给到热方法详解/,
    name: "语序错误",
    example: "音脚本直接给到热方法详解",
    fix: "应该调整语序"
  },
  {
    pattern: /的的/,
    name: "重复'的'字",
    example: "好用的的工具",
    fix: "应该去掉重复的'的'"
  },
  {
    pattern: /！！/,
    name: "重复感叹号",
    example: "太棒了！！",
    fix: "应该使用单个感叹号"
  }
];

// 完整性检测
const COMPLETENESS_CHECKS = [
  {
    check: (title: string) => title.length >= 5,
    name: "最小长度检查",
    description: "标题长度应至少5个字符"
  },
  {
    check: (title: string) => !title.endsWith(i18n.t('utils.labels.真的')),
    name: "完整结尾检查",
    description: "标题不应以i18n.t('utils.labels.真的')结尾"
  },
  {
    check: (title: string) => !title.endsWith(i18n.t('utils.labels.让我')),
    name: "完整表达检查", 
    description: "标题不应以i18n.t('utils.labels.让我')结尾"
  },
  {
    check: (title: string) => !/^[，。！？\s]*$/.test(title),
    name: "内容有效性检查",
    description: "标题不应只包含标点符号"
  },
  {
    check: (title: string) => title.trim().length > 0,
    name: "非空检查",
    description: "标题不应为空"
  }
];

/**
 * 验证单个标题
 */
export function validateTitle(title: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 语病检测
  GRAMMAR_ERROR_PATTERNS.forEach(({ pattern, name, fix }) => {
    if (pattern.test(title)) {
      errors.push(`${name}: ${fix}`);
    }
  });

  // 完整性检测
  COMPLETENESS_CHECKS.forEach(({ check, name, description }) => {
    if (!check(title)) {
      errors.push(`${name}: ${description}`);
    }
  });

  // 长度检查
  if (title.length > 50) {
    warnings.push("标题可能过长，建议控制在50字符以内");
  }

  // 计算分数
  const totalChecks = GRAMMAR_ERROR_PATTERNS.length + COMPLETENESS_CHECKS.length;
  const errorCount = errors.length;
  const score = Math.max(0, ((totalChecks - errorCount) / totalChecks) * 100);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.round(score)
  };
}

/**
 * 批量验证标题
 */
export function validateTitles(titles: string[]): {
  totalCount: number;
  validCount: number;
  invalidCount: number;
  averageScore: number;
  results: Array<{
    title: string;
    validation: ReturnType<typeof validateTitle>;
  }>;
} {
  const results = titles.map(title => ({
    title,
    validation: validateTitle(title)
  }));

  const validCount = results.filter(r => r.validation.isValid).length;
  const invalidCount = results.length - validCount;
  const averageScore = results.reduce((sum, r) => sum + r.validation.score, 0) / results.length;

  return {
    totalCount: results.length,
    validCount,
    invalidCount,
    averageScore: Math.round(averageScore),
    results
  };
}

/**
 * 生成测试报告
 */
export function generateTestReport(validationResults: ReturnType<typeof validateTitles>): string {
  const { totalCount, validCount, invalidCount, averageScore, results } = validationResults;
  
  let report = `
📊 标题生成质量报告
==================

总体统计:
- 总标题数: ${totalCount}
- 有效标题: ${validCount} (${((validCount / totalCount) * 100).toFixed(1)}%)
- 无效标题: ${invalidCount} (${((invalidCount / totalCount) * 100).toFixed(1)}%)
- 平均分数: ${averageScore}/100

详细结果:
`;

  results.forEach((result, index) => {
    const { title, validation } = result;
    const status = validation.isValid ? '✅' : '❌';
    
    report += `
${index + 1}. ${status} "${title}" (${validation.score}/100)`;
    
    if (validation.errors.length > 0) {
      report += `
   错误: ${validation.errors.join('; ')}`;
    }
    
    if (validation.warnings.length > 0) {
      report += `
   警告: ${validation.warnings.join('; ')}`;
    }
  });

  return report;
}

/**
 * 测试特定内容的标题生成
 */
export function testContentTitleGeneration(content: string, generateTitleFn: (content: string, platform: string, style: string) => string) {
  const platforms = ['xiaohongshu', 'weibo', 'zhihu'];
  const styles = ['engaging', 'informative', 'emotional'];
  
  const generatedTitles: string[] = [];
  
  platforms.forEach(platform => {
    styles.forEach(style => {
      try {
        const title = generateTitleFn(content, platform, style);
        generatedTitles.push(title);
      } catch (error) {
        console.error(`生成failed (${platform}-${style}):`, error);
        generatedTitles.push(`[生成失败: ${platform}-${style}]`);
      }
    });
  });
  
  return validateTitles(generatedTitles);
}

// 预设测试内容
export const TEST_CONTENTS = [
  {
    name: "AI工具推荐",
    content: "发现了5个超好用的AI工具，真的让我震惊了！这些工具不仅功能强大，而且使用简单。第一个是ChatGPT，第二个是Midjourney，第三个是Notion AI。"
  },
  {
    name: "教程分享",
    content: "今天分享一个超实用的视频剪辑方法，让你的视频制作效率翻倍！核心方法就是使用快捷键和模板。"
  },
  {
    name: "产品体验",
    content: "我最近体验了一款新的学习软件，感觉真的很棒！界面设计很用心，功能也很实用。最重要的是，它让我重新找回了学习的乐趣。"
  }
];

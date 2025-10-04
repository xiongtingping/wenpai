/**
 * 标题截断检测和修复服务
 * 专门处理平台字符限制下的标题截断问题
 */

import { safeTrimTitle, detectTruncationIssues, fixTruncatedTitle } from '@/utils/safeTrimTitle';
import type { PlatformId } from '../types/titleGeneration.types';
import { TitleGenerationConfig } from '../config/titleGeneration.config';

export interface TruncationAnalysis {
  original: string;
  truncated: string;
  fixed: string;
  hasTruncation: boolean;
  issues: string[];
  severity: 'low' | 'medium' | 'high';
  platformLimit: number;
  improvementScore: number; // 修复后的改进分数
}

export class TitleTruncationService {
  /**
   * 分析和修复标题截断问题
   */
  analyzAndFix(title: string, platform: PlatformId): TruncationAnalysis {
    const platformConfig = TitleGenerationConfig.platforms[platform];
    const maxLength = platformConfig.maxLength;

    // 1. 检测原始标题问题
    const detection = detectTruncationIssues(title);

    // 2. 如果超出长度限制，先截断
    let truncated = title;
    if (title.length > maxLength) {
      truncated = safeTrimTitle(title, maxLength);
    }

    // 3. 修复截断后的问题
    const fixed = fixTruncatedTitle(truncated, maxLength);

    // 4. 计算改进分数
    const improvementScore = this.calculateImprovement(title, fixed);

    return {
      original: title,
      truncated,
      fixed,
      hasTruncation: detection.hasTruncation,
      issues: detection.issues,
      severity: detection.severity,
      platformLimit: maxLength,
      improvementScore
    };
  }

  /**
   * 批量处理标题
   */
  batchAnalyzeAndFix(titles: string[], platform: PlatformId): TruncationAnalysis[] {
    return titles.map(title => this.analyzAndFix(title, platform));
  }

  /**
   * 智能截断标题 - 确保语义完整性
   */
  smartTruncate(title: string, maxLength: number): string {
    // 使用增强的safeTrimTitle，包含词边界识别
    return safeTrimTitle(title, maxLength);
  }

  /**
   * 验证标题是否符合平台要求
   */
  validateTitle(title: string, platform: PlatformId): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const platformConfig = TitleGenerationConfig.platforms[platform];
    const issues: string[] = [];
    const suggestions: string[] = [];

    // 1. 长度检查
    if (title.length < platformConfig.minLength) {
      issues.push(`标题过短，至少需要${platformConfig.minLength}个字符`);
      suggestions.push('增加更多描述性内容');
    }

    if (title.length > platformConfig.maxLength) {
      issues.push(`标题超长，最多${platformConfig.maxLength}个字符`);
      suggestions.push('使用智能截断功能');
    }

    // 2. 截断问题检查
    const detection = detectTruncationIssues(title);
    if (detection.hasTruncation) {
      issues.push(...detection.issues);
      suggestions.push('使用修复功能处理截断问题');
    }

    // 3. 语义完整性检查
    if (!this.hasSemanticClosure(title)) {
      issues.push('标题语义不完整');
      suggestions.push('确保标题有自然的结尾');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * 计算改进分数
   */
  private calculateImprovement(original: string, fixed: string): number {
    const originalDetection = detectTruncationIssues(original);
    const fixedDetection = detectTruncationIssues(fixed);

    // 计算问题减少的百分比
    const originalIssueCount = originalDetection.issues.length;
    const fixedIssueCount = fixedDetection.issues.length;

    if (originalIssueCount === 0) {
      return 1.0; // 没有问题，满分
    }

    const reduction = (originalIssueCount - fixedIssueCount) / originalIssueCount;
    return Math.max(0, Math.min(1, reduction));
  }

  /**
   * 检查是否有语义闭合
   */
  private hasSemanticClosure(title: string): boolean {
    // 好的结尾
    const goodEndings = ['了', '的', '！', '？', '。', '吧', '呢', '啊', '哦'];
    const lastChar = title[title.length - 1];

    // 检查最后一个字符
    if (goodEndings.includes(lastChar)) {
      return true;
    }

    // 检查完整的句式结构
    const completePatterns = [
      /.*了$/,        // "...了"
      /.*的$/,        // "...的"
      /.*吗[？]?$/,   // "...吗？"
      /.*呢[？]?$/,   // "...呢？"
      /.*！$/,        // "...！"
      /.*。$/,        // "...。"
    ];

    return completePatterns.some(pattern => pattern.test(title));
  }

  /**
   * 生成修复报告
   */
  generateReport(analysis: TruncationAnalysis): string {
    const lines: string[] = [];

    lines.push('📊 标题截断分析报告');
    lines.push('═'.repeat(50));
    lines.push(`原始标题: ${analysis.original}`);
    lines.push(`平台限制: ${analysis.platformLimit} 字符`);
    lines.push('');

    if (analysis.hasTruncation) {
      lines.push(`⚠️  检测到问题 (严重程度: ${analysis.severity})`);
      analysis.issues.forEach(issue => {
        lines.push(`  • ${issue}`);
      });
      lines.push('');
      lines.push(`✂️  截断后: ${analysis.truncated}`);
      lines.push(`✅ 修复后: ${analysis.fixed}`);
      lines.push(`📈 改进分数: ${(analysis.improvementScore * 100).toFixed(0)}%`);
    } else {
      lines.push('✅ 标题质量良好，无截断问题');
      lines.push(`最终标题: ${analysis.fixed}`);
    }

    return lines.join('\n');
  }

  /**
   * 获取平台特定的截断策略
   */
  getPlatformStrategy(platform: PlatformId): {
    maxLength: number;
    recommendedLength: number;
    strategy: string;
  } {
    const platformConfig = TitleGenerationConfig.platforms[platform];

    let strategy = '';
    switch (platform) {
      case 'xiaohongshu':
        strategy = '小红书标题限制20字，建议15-18字，重点突出情绪和体验';
        break;
      case 'wechat':
        strategy = '微信公众号限制64字，建议30-50字，可以适当长一些';
        break;
      case 'douyin':
        strategy = '抖音限制2200字，几乎无限制，建议20-30字保持简洁';
        break;
      case 'weibo':
        strategy = '微博限制2000字，建议30-50字，可以包含话题标签';
        break;
      case 'zhihu':
        strategy = '知乎限制10000字，建议40-60字，可以较长以体现深度';
        break;
      case 'bilibili':
        strategy = 'B站限制80字，建议30-50字，可以有创意和趣味性';
        break;
      case 'toutiao':
        strategy = '今日头条限制30字，建议20-25字，突出新闻性和时效性';
        break;
      default:
        strategy = '通用平台，建议20-30字，平衡信息量和可读性';
    }

    return {
      maxLength: platformConfig.maxLength,
      recommendedLength: platformConfig.recommendedLength,
      strategy
    };
  }
}

// 创建单例实例
export const titleTruncationService = new TitleTruncationService();
export default titleTruncationService;

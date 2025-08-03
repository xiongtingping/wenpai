/**
 * 质量评分服务
 * 负责标题质量评估和验证
 */

import {
  calculateOverallScore,
  calculateSemanticCompleteness
} from '@/utils/titleGenerationUtils';
import { TitleGenerationConfig } from '../config/titleGeneration.config';
import type { 
  IQualityScoreService, 
  QualityScore, 
  PlatformId 
} from '../types/titleGeneration.types';

export class QualityScoreService implements IQualityScoreService {
  
  /**
   * 计算标题综合质量评分
   */
  async calculateScore(
    title: string, 
    content: string, 
    platform: PlatformId
  ): Promise<QualityScore> {
    const platformConfig = TitleGenerationConfig.platforms[platform];
    const weights = TitleGenerationConfig.weights;
    
    // 计算各维度评分
    const semanticFit = this.calculateSemanticFit(title, content);
    const emotionalAppeal = this.calculateEmotionalAppeal(title);
    const diversityScore = this.calculateDiversityScore(title);
    const semanticCompleteness = calculateSemanticCompleteness(title);
    const utilizationScore = this.calculateUtilizationScore(title, platformConfig.maxLength);
    
    // 计算综合评分
    const overallScore = calculateOverallScore(
      semanticFit,
      emotionalAppeal,
      diversityScore,
      semanticCompleteness,
      utilizationScore,
      weights
    );
    
    // 生成质量问题和建议
    const { qualityIssues, suggestions } = this.generateQualityFeedback(
      title, 
      content, 
      platform,
      {
        semanticFit,
        emotionalAppeal,
        diversityScore,
        semanticCompleteness,
        utilizationScore
      }
    );
    
    return {
      semanticFit,
      emotionalAppeal,
      diversityScore,
      semanticCompleteness,
      utilizationScore,
      overallScore,
      qualityIssues,
      suggestions
    };
  }

  /**
   * 验证标题是否符合平台要求
   */
  validateTitle(title: string, platform: PlatformId): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    const platformConfig = TitleGenerationConfig.platforms[platform];
    const qualityRules = TitleGenerationConfig.qualityRules;
    
    // 长度检查
    if (title.length < platformConfig.minLength) {
      issues.push(`标题过短，最少需要${platformConfig.minLength}个字符`);
    }
    
    if (title.length > platformConfig.maxLength) {
      issues.push(`标题过长，最多允许${platformConfig.maxLength}个字符`);
    }
    
    // 内容检查
    if (title.trim().length === 0) {
      issues.push('标题不能为空');
    }
    
    // 禁用模式检查
    for (const pattern of qualityRules.forbiddenPatterns) {
      if (pattern.test(title)) {
        issues.push('标题包含无效内容');
        break;
      }
    }
    
    // 通用词汇检查
    const genericWordCount = qualityRules.genericWords.filter(word => 
      title.includes(word)
    ).length;
    
    if (genericWordCount > qualityRules.maxGenericWords) {
      issues.push('标题过于空泛，建议使用更具体的表达');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * 计算语义贴合度
   */
  private calculateSemanticFit(title: string, content: string): number {
    // 简化的语义相似度计算
    const titleWords = this.extractKeywords(title);
    const contentWords = this.extractKeywords(content);
    
    if (titleWords.length === 0 || contentWords.length === 0) {
      return 0.5; // 默认中等相关性
    }
    
    const commonWords = titleWords.filter(word => 
      contentWords.some(cWord => cWord.includes(word) || word.includes(cWord))
    );
    
    const similarity = commonWords.length / Math.max(titleWords.length, contentWords.length);
    
    // 调整到合理范围
    return Math.min(Math.max(similarity * 1.2, 0.3), 1.0);
  }

  /**
   * 计算情绪吸引力
   */
  private calculateEmotionalAppeal(title: string): number {
    const emotionalWords = [
      '惊艳', '震撼', '必看', '绝对', '完美', '神奇', '超级', '极致',
      '独家', '秘密', '揭秘', '爆料', '真相', '内幕', '首次', '最新',
      '免费', '限时', '抢购', '优惠', '折扣', '特价', '福利', '礼品'
    ];
    
    const questionWords = ['如何', '怎么', '为什么', '什么', '哪个', '哪些'];
    const actionWords = ['学会', '掌握', '提升', '改善', '解决', '实现'];
    
    let score = 0.5; // 基础分
    
    // 情感词汇加分
    const emotionalCount = emotionalWords.filter(word => title.includes(word)).length;
    score += Math.min(emotionalCount * 0.1, 0.3);
    
    // 疑问句加分
    const questionCount = questionWords.filter(word => title.includes(word)).length;
    score += Math.min(questionCount * 0.1, 0.2);
    
    // 行动词汇加分
    const actionCount = actionWords.filter(word => title.includes(word)).length;
    score += Math.min(actionCount * 0.1, 0.2);
    
    // 标点符号加分
    if (title.includes('!') || title.includes('？') || title.includes('！')) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * 计算结构多样性
   */
  private calculateDiversityScore(title: string): number {
    let score = 0.5; // 基础分
    
    // 长度多样性
    if (title.length >= 10 && title.length <= 30) {
      score += 0.2;
    }
    
    // 结构多样性
    const hasNumbers = /\d/.test(title);
    const hasSymbols = /[：:、，。！？]/.test(title);
    const hasParentheses = /[（）()]/.test(title);
    
    if (hasNumbers) score += 0.1;
    if (hasSymbols) score += 0.1;
    if (hasParentheses) score += 0.1;
    
    // 避免重复结构
    const commonPatterns = [
      /^\d+个.+/, // "5个技巧"
      /^如何.+/, // "如何做"
      /.+攻略$/, // "xxx攻略"
      /.+指南$/, // "xxx指南"
    ];
    
    const hasCommonPattern = commonPatterns.some(pattern => pattern.test(title));
    if (hasCommonPattern) {
      score -= 0.1;
    }
    
    return Math.min(Math.max(score, 0.2), 1.0);
  }

  /**
   * 计算字符利用率
   */
  private calculateUtilizationScore(title: string, maxLength: number): number {
    const utilization = title.length / maxLength;
    
    // 最佳利用率在70%-90%之间
    if (utilization >= 0.7 && utilization <= 0.9) {
      return 1.0;
    } else if (utilization >= 0.5 && utilization < 0.7) {
      return 0.8;
    } else if (utilization > 0.9) {
      return 0.9; // 接近上限但不扣分太多
    } else {
      return Math.max(utilization * 1.2, 0.3);
    }
  }

  /**
   * 提取关键词
   */
  private extractKeywords(text: string): string[] {
    // 简化的关键词提取
    const words = text
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 2)
      .slice(0, 10); // 限制数量
    
    return [...new Set(words)]; // 去重
  }

  /**
   * 生成质量反馈
   */
  private generateQualityFeedback(
    title: string,
    content: string,
    platform: PlatformId,
    scores: {
      semanticFit: number;
      emotionalAppeal: number;
      diversityScore: number;
      semanticCompleteness: number;
      utilizationScore: number;
    }
  ): { qualityIssues: string[]; suggestions: string[] } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const platformConfig = TitleGenerationConfig.platforms[platform];
    
    // 语义相关性问题
    if (scores.semanticFit < 0.6) {
      issues.push('标题与内容相关性不足');
      suggestions.push('增强标题与原文内容的关联性');
    }
    
    // 情绪吸引力问题
    if (scores.emotionalAppeal < 0.5) {
      issues.push('标题吸引力不足');
      suggestions.push('适当使用情感词汇或疑问句式');
    }
    
    // 结构多样性问题
    if (scores.diversityScore < 0.5) {
      issues.push('标题结构过于单一');
      suggestions.push('尝试不同的表达结构和句式');
    }
    
    // 语义完整性问题
    if (scores.semanticCompleteness < 0.7) {
      issues.push('标题语义不完整');
      suggestions.push('确保标题表达完整，避免残词');
    }
    
    // 字符利用率问题
    if (scores.utilizationScore < 0.6) {
      if (title.length < platformConfig.recommendedLength) {
        issues.push('标题长度偏短');
        suggestions.push(`建议标题长度在${platformConfig.recommendedLength}字符左右`);
      } else {
        issues.push('字符利用率不佳');
        suggestions.push('优化标题长度以提高信息密度');
      }
    }
    
    return { qualityIssues: issues, suggestions };
  }
}

// 创建单例实例
export const qualityScoreService = new QualityScoreService();
export default qualityScoreService;

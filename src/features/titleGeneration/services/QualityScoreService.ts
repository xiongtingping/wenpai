/**
 * 质量评分服务
 * 负责标题质量评估和验证
 */

import {
  calculateOverallScore,
  calculateSemanticCompleteness
} from '@/utils/titleGenerationUtils';
import { detectTruncationIssues, fixTruncatedTitle } from '@/utils/safeTrimTitle';
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

    // 截断问题检查
    const truncationDetection = detectTruncationIssues(title);
    if (truncationDetection.hasTruncation) {
      issues.push(...truncationDetection.issues);
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * 修复标题截断问题
   */
  fixTruncation(title: string, platform: PlatformId): string {
    const platformConfig = TitleGenerationConfig.platforms[platform];
    return fixTruncatedTitle(title, platformConfig.maxLength);
  }

  /**
   * 计算语义贴合度
   * 基于实体匹配度 + 主题相关性 + 核心词汇覆盖
   */
  private calculateSemanticFit(title: string, content: string): number {
    let semanticScore = 0.5; // 基础分

    // 1. 提取关键信息
    const titleWords = this.extractKeywords(title);
    const contentWords = this.extractKeywords(content);
    const entities = this.extractEntities(content); // 实体识别
    const mainTopic = this.extractMainTopic(content); // 主题提取

    if (titleWords.length === 0 || contentWords.length === 0) {
      return 0.5; // 默认中等相关性
    }

    // 2. 实体匹配度 (30%)
    const entityMatches = entities.filter(entity => title.includes(entity));
    semanticScore += (entityMatches.length / Math.max(entities.length, 1)) * 0.3;

    // 3. 主题相关性 (20%)
    if (mainTopic && title.includes(mainTopic)) {
      semanticScore += 0.2;
    }

    // 4. 核心词汇覆盖 (20%)
    const commonWords = titleWords.filter(word =>
      contentWords.some(cWord => cWord.includes(word) || word.includes(cWord))
    );
    const wordCoverage = commonWords.length / Math.max(titleWords.length, 1);
    semanticScore += wordCoverage * 0.2;

    // 5. 关键词密度检查
    const keywordDensity = commonWords.length / titleWords.length;
    if (keywordDensity < 0.3) {
      semanticScore -= 0.1; // 关键词密度过低扣分
    }

    // 调整到合理范围
    return Math.min(Math.max(semanticScore, 0.3), 1.0);
  }

  /**
   * 提取实体（人名、地名、产品名等）
   */
  private extractEntities(content: string): string[] {
    const entities: string[] = [];

    // 简化的实体识别：查找常见模式
    const entityPatterns = [
      /AI|GPT|Claude|ChatGPT|文派|小红书|微信|抖音/g,
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g, // 英文专有名词
    ];

    entityPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        entities.push(...matches);
      }
    });

    return [...new Set(entities)].slice(0, 5); // 去重并限制数量
  }

  /**
   * 提取主题
   */
  private extractMainTopic(content: string): string {
    // 简化的主题提取：找出现频率最高的关键词
    const words = this.extractKeywords(content);
    const wordFreq = new Map<string, number>();

    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    let maxFreq = 0;
    let mainTopic = '';

    wordFreq.forEach((freq, word) => {
      if (freq > maxFreq && word.length >= 2) {
        maxFreq = freq;
        mainTopic = word;
      }
    });

    return mainTopic;
  }

  /**
   * 计算情绪吸引力
   * 基于冲突感、对比感、转变、情绪词四个维度
   */
  private calculateEmotionalAppeal(title: string): number {
    let score = 0.3; // 基础分

    // 1. 冲突感关键词 - 强化惊讶和意外
    const conflictWords = ['没想到', '出乎意料', '竟然', '居然', '意外', '震撼', '惊艳'];
    const conflictMatches = conflictWords.filter(word => title.includes(word));
    score += conflictMatches.length > 0 ? 0.25 : 0;

    // 2. 对比感关键词 - 强化前后对比
    const contrastWords = ['之前', '现在', '从', '到', '比', '更', '最', '原来', '以前'];
    const contrastMatches = contrastWords.filter(word => title.includes(word));
    score += contrastMatches.length > 0 ? 0.2 : 0;

    // 3. 转变关键词 - 强化效果转变
    const transformationWords = ['改变', '提升', '改善', '优化', '翻倍', '节省', '实现'];
    const transformationMatches = transformationWords.filter(word => title.includes(word));
    score += transformationMatches.length > 0 ? 0.2 : 0;

    // 4. 情绪词 - 强化情感表达
    const emotionalWords = [
      '爱了', '太棒了', '绝了', '真的', '超预期', '相见恨晚',
      '必须', '效率', '效果', '值得', '推荐', '安利', '太爽了', '太惊艳了'
    ];
    const emotionalMatches = emotionalWords.filter(word => title.includes(word));
    score += emotionalMatches.length > 0 ? 0.25 : 0;

    // 疑问句加分
    const questionWords = ['如何', '怎么', '为什么', '什么', '哪个', '哪些'];
    const questionMatches = questionWords.filter(word => title.includes(word));
    if (questionMatches.length > 0) {
      score += 0.1;
    }

    // 标点符号加分
    if (title.includes('!') || title.includes('？') || title.includes('！')) {
      score += 0.05;
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
   * 增强的语义完整性检查
   * 检查句末闭合性、主谓宾结构、语法通顺性
   */
  private checkSemanticCompleteness(title: string): number {
    let score = 0.5; // 基础分

    // 1. 检查句末闭合性
    const goodEndings = ['了', '的', '！', '？', '。', '吧', '呢', '啊', '哦'];
    const badEndings = [
      '、', '是', '我', '和', '让', '要', '在', '对', '为', '把', '给', '向',
      '从', '到', '由', '被', '得', '着', '过', '吗',
      '这', '那', '它', '他', '她', '们', '个', '种', '些', '点', '下', '上', '里',
      '外', '前', '后', '左', '右', '中', '间', '边', '面', '方', '位', '处'
    ];

    const lastChar = title[title.length - 1];
    if (goodEndings.includes(lastChar)) {
      score += 0.35; // 句末自然闭合
    } else if (badEndings.includes(lastChar)) {
      score -= 0.3; // 句末不完整
    }

    // 2. 检查主谓宾结构完整性
    const hasSubject = /[我你他她它我们你们他们]/.test(title);
    const hasVerb = /[用做写看学试体验感受发现获得提升改善优化].*[了过]/.test(title) ||
                    /[是能会可以].*[的]/.test(title);

    if (hasSubject && hasVerb) {
      score += 0.25; // 有主谓结构
    }

    // 3. 检查语法通顺性
    const grammarPatterns = [
      /我用.*后.*/,      // "我用X后Y" 模式
      /为什么.*/,        // "为什么X" 模式
      /如何.*/,          // "如何X" 模式
      /.*让我.*/,        // "X让我Y" 模式
      /.*帮我.*/,        // "X帮我Y" 模式
      /.*真的.*/,        // "X真的Y" 模式
      /.*太.*了/,        // "X太Y了" 模式
    ];

    const hasGoodGrammar = grammarPatterns.some(pattern => pattern.test(title));
    if (hasGoodGrammar) {
      score += 0.15; // 语法通顺
    }

    // 4. 避免断尾和省略号
    if (title.includes('...') || title.includes('…')) {
      score -= 0.3; // 有省略号表示不完整
    }

    // 5. 检查禁止的残词
    const prohibitedWords = ['文', '工', '图', '说', '表'];
    const hasProhibitedWord = prohibitedWords.some(word => title.endsWith(word));
    if (hasProhibitedWord) {
      score -= 0.4; // 有禁止的残词
    }

    // 6. 检查是否有未完成的句子
    const incompletePatterns = [
      /^[的了用后时]/,   // 以助词开头
      /[，,]$/,          // 以逗号结尾
      /[：:]$/,          // 以冒号结尾
      /[和与及]$/,       // 以连词结尾
    ];

    const hasIncompletePattern = incompletePatterns.some(pattern => pattern.test(title));
    if (hasIncompletePattern) {
      score -= 0.4; // 句子不完整
    }

    return Math.max(0, Math.min(1, score)); // 确保在 0-1 范围内
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

/**
 * 智能去重算法服务
 * 解决用户反馈的问题1：智能去重算法 (相似度阈值0.8)
 */

import { DailyHotItem } from '@/api/hotTopicsService';

export interface DeduplicationConfig {
  similarityThreshold: number; // 相似度阈值，默认0.8
  titleWeight: number; // 标题权重，默认0.6
  contentWeight: number; // 内容权重，默认0.3
  sourceWeight: number; // 来源权重，默认0.1
  enableSemanticAnalysis: boolean; // 是否启用语义分析
}

export interface DeduplicationResult {
  uniqueItems: DailyHotItem[];
  duplicateGroups: DailyHotItem[][];
  totalProcessed: number;
  duplicatesRemoved: number;
  processingTime: number;
}

class IntelligentDeduplicationService {
  private config: DeduplicationConfig = {
    similarityThreshold: 0.8,
    titleWeight: 0.6,
    contentWeight: 0.3,
    sourceWeight: 0.1,
    enableSemanticAnalysis: true
  };

  /**
   * 智能去重主函数
   */
  async deduplicate(items: DailyHotItem[], config?: Partial<DeduplicationConfig>): Promise<DeduplicationResult> {
    const startTime = Date.now();
    
    if (config) {
      this.config = { ...this.config, ...config };
    }

    const duplicateGroups: DailyHotItem[][] = [];
    const processed = new Set<string>();
    const uniqueItems: DailyHotItem[] = [];

    for (let i = 0; i < items.length; i++) {
      if (processed.has(items[i].url || items[i].title)) continue;

      const currentGroup = [items[i]];
      processed.add(items[i].url || items[i].title);

      // 查找相似项
      for (let j = i + 1; j < items.length; j++) {
        if (processed.has(items[j].url || items[j].title)) continue;

        const similarity = await this.calculateSimilarity(items[i], items[j]);
        
        if (similarity >= this.config.similarityThreshold) {
          currentGroup.push(items[j]);
          processed.add(items[j].url || items[j].title);
        }
      }

      if (currentGroup.length > 1) {
        duplicateGroups.push(currentGroup);
        // 选择最佳代表项
        const bestItem = this.selectBestRepresentative(currentGroup);
        uniqueItems.push(bestItem);
      } else {
        uniqueItems.push(items[i]);
      }
    }

    const processingTime = Date.now() - startTime;

    if (import.meta.env.DEV) {
      console.log('🔄 智能去重完成:', {
        totalProcessed: items.length,
        duplicatesRemoved: items.length - uniqueItems.length,
        duplicateGroups: duplicateGroups.length,
        processingTime: `${processingTime}ms`
      });
    }

    return {
      uniqueItems,
      duplicateGroups,
      totalProcessed: items.length,
      duplicatesRemoved: items.length - uniqueItems.length,
      processingTime
    };
  }

  /**
   * 计算两个热点项的相似度
   */
  private async calculateSimilarity(item1: DailyHotItem, item2: DailyHotItem): Promise<number> {
    let totalScore = 0;

    // 1. 标题相似度
    const titleSimilarity = this.calculateTextSimilarity(item1.title, item2.title);
    totalScore += titleSimilarity * this.config.titleWeight;

    // 2. 内容相似度
    const content1 = item1.desc || item1.title;
    const content2 = item2.desc || item2.title;
    const contentSimilarity = this.calculateTextSimilarity(content1, content2);
    totalScore += contentSimilarity * this.config.contentWeight;

    // 3. 来源相似度
    const sourceSimilarity = item1.platform === item2.platform ? 1.0 : 0.0;
    totalScore += sourceSimilarity * this.config.sourceWeight;

    // 4. 语义相似度（如果启用）
    if (this.config.enableSemanticAnalysis) {
      const semanticSimilarity = this.calculateSemanticSimilarity(item1.title, item2.title);
      totalScore += semanticSimilarity * 0.2; // 语义分析权重20%
    }

    return Math.min(totalScore, 1.0);
  }

  /**
   * 计算文本相似度
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2 || typeof text1 !== 'string' || typeof text2 !== 'string') return 0;

    // 标准化文本
    const normalize = (text: string) => {
      return text.toLowerCase()
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '') // 保留中文、英文、数字
        .trim();
    };

    const normalized1 = normalize(text1);
    const normalized2 = normalize(text2);

    // 1. 完全匹配
    if (normalized1 === normalized2) return 1.0;

    // 2. 包含关系
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      const shorter = normalized1.length < normalized2.length ? normalized1 : normalized2;
      const longer = normalized1.length >= normalized2.length ? normalized1 : normalized2;
      return shorter.length / longer.length * 0.9;
    }

    // 3. 编辑距离相似度
    const editDistance = this.levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);
    const editSimilarity = maxLength > 0 ? (maxLength - editDistance) / maxLength : 0;

    // 4. 词汇重叠度
    const words1 = normalized1.split(/\s+/).filter(w => w.length > 0);
    const words2 = normalized2.split(/\s+/).filter(w => w.length > 0);
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    const jaccardSimilarity = union.size > 0 ? intersection.size / union.size : 0;

    // 综合相似度
    return Math.max(editSimilarity * 0.6 + jaccardSimilarity * 0.4, 0);
  }

  /**
   * 计算语义相似度
   */
  private calculateSemanticSimilarity(text1: string, text2: string): number {
    // 简化的语义相似度计算
    const keywords1 = this.extractKeywords(text1);
    const keywords2 = this.extractKeywords(text2);

    if (keywords1.length === 0 || keywords2.length === 0) return 0;

    const commonKeywords = keywords1.filter(k1 => 
      keywords2.some(k2 => k1.includes(k2) || k2.includes(k1))
    );

    return commonKeywords.length / Math.max(keywords1.length, keywords2.length);
  }

  /**
   * 提取关键词
   */
  private extractKeywords(text: string): string[] {
    const stopWords = new Set(['的', '了', '在', '是', '有', '和', '与', '或', '但', '而', '也', '都', '被', '把', '给', '让', '使', '对', '向', '从', '到', '为', '以', '及', '等', '如', '像', '比', 'than', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    return text.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopWords.has(word));
  }

  /**
   * 选择最佳代表项
   */
  private selectBestRepresentative(group: DailyHotItem[]): DailyHotItem {
    // 选择策略：热度最高 > 内容最完整 > 时间最新
    return group.reduce((best, current) => {
      const bestHot = parseFloat(best.hot) || 0;
      const currentHot = parseFloat(current.hot) || 0;

      // 1. 热度优先
      if (currentHot > bestHot) return current;
      if (bestHot > currentHot) return best;

      // 2. 内容完整度
      const bestContentLength = (best.desc || '').length + best.title.length;
      const currentContentLength = (current.desc || '').length + current.title.length;
      if (currentContentLength > bestContentLength) return current;
      if (bestContentLength > currentContentLength) return best;

      // 3. 默认选择第一个
      return best;
    });
  }

  /**
   * 计算编辑距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<DeduplicationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): DeduplicationConfig {
    return { ...this.config };
  }
}

export const intelligentDeduplicationService = new IntelligentDeduplicationService();
export default intelligentDeduplicationService;

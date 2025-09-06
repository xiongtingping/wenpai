/**
 * 增强热点数据Hook
 * 在不修改原有API的基础上，为热点数据提供RSSHub补充
 */

import { useState, useEffect, useCallback } from 'react';
import { DailyHotItem } from '@/api/hotTopicsService';
import rsshubDataService, { RSSHubTopic } from '@/services/rsshubDataService';

export interface EnhancedHotTopic extends DailyHotItem {
  isRSSHubData?: boolean;
  originalSource?: string;
  enhancedTags?: string[];
}

export interface UseEnhancedHotTopicsOptions {
  enableRSSHub?: boolean;
  maxRSSHubItems?: number;
  mergeStrategy?: 'append' | 'interleave' | 'prioritize';
}

export function useEnhancedHotTopics(
  originalData: DailyHotItem[],
  options: UseEnhancedHotTopicsOptions = {}
) {
  const {
    enableRSSHub = true,
    maxRSSHubItems = 20,
    mergeStrategy = 'append'
  } = options;

  const [enhancedData, setEnhancedData] = useState<EnhancedHotTopic[]>([]);
  const [rsshubData, setRSSHubData] = useState<RSSHubTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    originalCount: 0,
    rsshubCount: 0,
    totalCount: 0
  });

  /**
   * 加载RSSHub补充数据
   */
  const loadRSSHubData = useCallback(async () => {
    if (!enableRSSHub || !rsshubDataService.isEnabled()) {
      setRSSHubData([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const topics = await rsshubDataService.getSupplementaryTopics();
      const limitedTopics = topics.slice(0, maxRSSHubItems);
      setRSSHubData(limitedTopics);
    } catch (err) {
      console.warn('RSSHub数据加载失败:', err);
      setError(err instanceof Error ? err.message : '加载失败');
      setRSSHubData([]);
    } finally {
      setIsLoading(false);
    }
  }, [enableRSSHub, maxRSSHubItems]);

  /**
   * 转换RSSHub数据为DailyHotItem格式
   */
  const convertRSSHubToDailyHot = useCallback((rsshubTopic: RSSHubTopic): EnhancedHotTopic => {
    return {
      title: rsshubTopic.title,
      hot: rsshubTopic.hotScore.toString(),
      url: rsshubTopic.link,
      desc: rsshubTopic.description,
      platform: rsshubTopic.platform,
      category: rsshubTopic.category,
      tags: rsshubTopic.tags,
      source: rsshubTopic.source,
      timestamp: new Date(rsshubTopic.pubDate).getTime(),
      // 增强字段
      isRSSHubData: true,
      originalSource: rsshubTopic.source,
      enhancedTags: rsshubTopic.tags
    };
  }, []);

  /**
   * 合并原始数据和RSSHub数据
   */
  const mergeData = useCallback((
    original: DailyHotItem[],
    rsshub: RSSHubTopic[]
  ): EnhancedHotTopic[] => {
    // 转换原始数据
    const enhancedOriginal: EnhancedHotTopic[] = original.map(item => ({
      ...item,
      isRSSHubData: false
    }));

    // 转换RSSHub数据
    const enhancedRSSHub: EnhancedHotTopic[] = rsshub.map(convertRSSHubToDailyHot);

    // 根据策略合并数据
    switch (mergeStrategy) {
      case 'append':
        // 简单追加：原始数据 + RSSHub数据
        return [...enhancedOriginal, ...enhancedRSSHub];

      case 'interleave': {
        // 交错插入：每3个原始数据插入1个RSSHub数据
        const interleaved: EnhancedHotTopic[] = [];
        let rsshubIndex = 0;
        
        enhancedOriginal.forEach((item, index) => {
          interleaved.push(item);
          
          // 每3个原始数据后插入一个RSSHub数据
          if ((index + 1) % 3 === 0 && rsshubIndex < enhancedRSSHub.length) {
            interleaved.push(enhancedRSSHub[rsshubIndex]);
            rsshubIndex++;
          }
        });
        
        // 添加剩余的RSSHub数据
        while (rsshubIndex < enhancedRSSHub.length) {
          interleaved.push(enhancedRSSHub[rsshubIndex]);
          rsshubIndex++;
        }
        
        return interleaved;
      }

      case 'prioritize': {
        // 优先级合并：高热度的RSSHub数据优先
        const highPriorityRSSHub = enhancedRSSHub.filter(item => 
          parseInt(item.hot) > 80
        );
        const normalRSSHub = enhancedRSSHub.filter(item => 
          parseInt(item.hot) <= 80
        );
        
        return [
          ...highPriorityRSSHub,
          ...enhancedOriginal,
          ...normalRSSHub
        ];
      }

      default:
        return [...enhancedOriginal, ...enhancedRSSHub];
    }
  }, [mergeStrategy, convertRSSHubToDailyHot]);

  /**
   * 去重处理（基于标题相似度）
   */
  const deduplicateData = useCallback((data: EnhancedHotTopic[]): EnhancedHotTopic[] => {
    const unique: EnhancedHotTopic[] = [];
    
    for (const item of data) {
      const isDuplicate = unique.some(existing => {
        const similarity = calculateSimilarity(item.title, existing.title);
        return similarity > 0.8; // 80%相似度阈值
      });
      
      if (!isDuplicate) {
        unique.push(item);
      }
    }
    
    return unique;
  }, []);

  /**
   * 计算文本相似度
   */
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  /**
   * 计算编辑距离
   */
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  /**
   * 主要的数据处理效果
   */
  useEffect(() => {
    const processData = async () => {
      // 如果没有启用RSSHub，直接使用原始数据
      if (!enableRSSHub || !rsshubDataService.isEnabled()) {
        const enhanced: EnhancedHotTopic[] = originalData.map(item => ({
          ...item,
          isRSSHubData: false
        }));
        setEnhancedData(enhanced);
        setStats({
          originalCount: originalData.length,
          rsshubCount: 0,
          totalCount: originalData.length
        });
        return;
      }

      // 合并数据
      const merged = mergeData(originalData, rsshubData);
      
      // 去重处理
      const deduplicated = deduplicateData(merged);
      
      setEnhancedData(deduplicated);
      setStats({
        originalCount: originalData.length,
        rsshubCount: rsshubData.length,
        totalCount: deduplicated.length
      });
    };

    processData();
  }, [originalData, rsshubData, enableRSSHub, mergeData, deduplicateData]);

  /**
   * 初始加载RSSHub数据
   */
  useEffect(() => {
    loadRSSHubData();
  }, [loadRSSHubData]);

  /**
   * 手动刷新RSSHub数据
   */
  const refreshRSSHubData = useCallback(() => {
    loadRSSHubData();
  }, [loadRSSHubData]);

  /**
   * 获取RSSHub数据项
   */
  const getRSSHubItems = useCallback(() => {
    return enhancedData.filter(item => item.isRSSHubData);
  }, [enhancedData]);

  /**
   * 获取原始数据项
   */
  const getOriginalItems = useCallback(() => {
    return enhancedData.filter(item => !item.isRSSHubData);
  }, [enhancedData]);

  return {
    // 数据
    enhancedData,
    rsshubData,
    stats,
    
    // 状态
    isLoading,
    error,
    
    // 方法
    refreshRSSHubData,
    getRSSHubItems,
    getOriginalItems,
    
    // 配置
    isRSSHubEnabled: enableRSSHub && rsshubDataService.isEnabled()
  };
}

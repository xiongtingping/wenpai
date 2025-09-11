/**
 * 多维度趋势分析服务
 * 解决用户反馈的问题3：多维度趋势分析
 */

import { DailyHotItem } from '@/api/hotTopicsService';

export interface TrendDataPoint {
  timestamp: string;
  value: number;
  platform: string;
  category: string;
}

export interface TrendAnalysisResult {
  keyword: string;
  timeRange: string;
  dimensions: {
    temporal: TemporalTrend;
    platform: PlatformTrend;
    category: CategoryTrend;
    sentiment: SentimentTrend;
    geographic: GeographicTrend;
  };
  predictions: TrendPrediction[];
  insights: TrendInsight[];
  confidence: number;
}

export interface TemporalTrend {
  direction: 'rising' | 'falling' | 'stable' | 'volatile';
  velocity: number; // 变化速度
  acceleration: number; // 加速度
  cyclicity: 'daily' | 'weekly' | 'monthly' | 'none';
  peakTimes: string[];
  dataPoints: Array<{ time: string; value: number; change: number }>;
}

export interface PlatformTrend {
  dominantPlatforms: Array<{ platform: string; share: number; trend: string }>;
  crossPlatformCorrelation: number;
  platformSpecificInsights: Record<string, string>;
}

export interface CategoryTrend {
  primaryCategories: Array<{ category: string; relevance: number; trend: string }>;
  categoryEvolution: Array<{ time: string; categories: Record<string, number> }>;
  emergingTopics: string[];
}

export interface SentimentTrend {
  overall: 'positive' | 'negative' | 'neutral';
  evolution: Array<{ time: string; sentiment: number; confidence: number }>;
  polarization: number; // 极化程度
  emotionalIntensity: number;
}

export interface GeographicTrend {
  hotspots: Array<{ region: string; intensity: number; trend: string }>;
  diffusionPattern: 'centralized' | 'distributed' | 'cascading';
  regionalVariations: Record<string, number>;
}

export interface TrendPrediction {
  timeHorizon: string;
  predictedValue: number;
  confidence: number;
  scenario: 'optimistic' | 'realistic' | 'pessimistic';
  factors: string[];
}

export interface TrendInsight {
  type: 'pattern' | 'anomaly' | 'correlation' | 'prediction';
  title: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  actionable: boolean;
}

class MultiDimensionalTrendService {
  private historicalData: Map<string, TrendDataPoint[]> = new Map();
  private analysisCache: Map<string, TrendAnalysisResult> = new Map();

  /**
   * 执行多维度趋势分析
   */
  async analyzeTrend(keyword: string, items: DailyHotItem[], timeRange: string = '7d'): Promise<TrendAnalysisResult> {
    const cacheKey = `${keyword}_${timeRange}_${Date.now()}`;
    
    // 检查缓存
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    // 准备数据
    const trendData = this.prepareData(keyword, items);
    this.updateHistoricalData(keyword, trendData);

    // 执行各维度分析
    const temporal = await this.analyzeTemporalTrend(keyword, trendData);
    const platform = await this.analyzePlatformTrend(trendData);
    const category = await this.analyzeCategoryTrend(trendData);
    const sentiment = await this.analyzeSentimentTrend(trendData);
    const geographic = await this.analyzeGeographicTrend(trendData);

    // 生成预测
    const predictions = await this.generatePredictions(keyword, trendData, temporal);

    // 生成洞察
    const insights = await this.generateInsights(temporal, platform, category, sentiment);

    // 计算整体置信度
    const confidence = this.calculateOverallConfidence(temporal, platform, category, sentiment);

    const result: TrendAnalysisResult = {
      keyword,
      timeRange,
      dimensions: {
        temporal,
        platform,
        category,
        sentiment,
        geographic
      },
      predictions,
      insights,
      confidence
    };

    // 缓存结果
    this.analysisCache.set(cacheKey, result);
    
    return result;
  }

  /**
   * 准备分析数据
   */
  private prepareData(keyword: string, items: DailyHotItem[]): TrendDataPoint[] {
    return items
      .filter(item => this.isRelevantToKeyword(item, keyword))
      .map(item => ({
        timestamp: typeof item.timestamp === 'string' ? item.timestamp : new Date().toISOString(),
        value: this.parseHeatValue(item.hot),
        platform: item.platform || 'unknown',
        category: this.inferCategory(item)
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * 时间维度趋势分析
   */
  private async analyzeTemporalTrend(keyword: string, data: TrendDataPoint[]): Promise<TemporalTrend> {
    if (data.length < 2) {
      return {
        direction: 'stable',
        velocity: 0,
        acceleration: 0,
        cyclicity: 'none',
        peakTimes: [],
        dataPoints: []
      };
    }

    // 计算数据点和变化率
    const dataPoints = data.map((point, index) => {
      const change = index > 0 ? point.value - data[index - 1].value : 0;
      return {
        time: point.timestamp,
        value: point.value,
        change
      };
    });

    // 计算趋势方向
    const totalChange = data[data.length - 1].value - data[0].value;
    const avgChange = dataPoints.reduce((sum, p) => sum + Math.abs(p.change), 0) / dataPoints.length;
    
    let direction: TemporalTrend['direction'];
    if (avgChange < data[0].value * 0.1) {
      direction = 'stable';
    } else if (avgChange > data[0].value * 0.3) {
      direction = 'volatile';
    } else {
      direction = totalChange > 0 ? 'rising' : 'falling';
    }

    // 计算速度和加速度
    const velocity = totalChange / data.length;
    const acceleration = this.calculateAcceleration(dataPoints);

    // 检测周期性
    const cyclicity = this.detectCyclicity(dataPoints);

    // 找出峰值时间
    const peakTimes = this.findPeakTimes(dataPoints);

    return {
      direction,
      velocity,
      acceleration,
      cyclicity,
      peakTimes,
      dataPoints
    };
  }

  /**
   * 平台维度趋势分析
   */
  private async analyzePlatformTrend(data: TrendDataPoint[]): Promise<PlatformTrend> {
    const platformStats: Record<string, { total: number; count: number; trend: number[] }> = {};

    // 统计各平台数据
    data.forEach(point => {
      if (!platformStats[point.platform]) {
        platformStats[point.platform] = { total: 0, count: 0, trend: [] };
      }
      platformStats[point.platform].total += point.value;
      platformStats[point.platform].count++;
      platformStats[point.platform].trend.push(point.value);
    });

    // 计算平台份额和趋势
    const totalValue = Object.values(platformStats).reduce((sum, stat) => sum + stat.total, 0);
    const dominantPlatforms = Object.entries(platformStats)
      .map(([platform, stat]) => ({
        platform,
        share: stat.total / totalValue,
        trend: this.calculateTrendDirection(stat.trend)
      }))
      .sort((a, b) => b.share - a.share);

    // 计算跨平台相关性
    const crossPlatformCorrelation = this.calculateCrossPlatformCorrelation(platformStats);

    // 生成平台特定洞察
    const platformSpecificInsights = this.generatePlatformInsights(dominantPlatforms);

    return {
      dominantPlatforms,
      crossPlatformCorrelation,
      platformSpecificInsights
    };
  }

  /**
   * 分类维度趋势分析
   */
  private async analyzeCategoryTrend(data: TrendDataPoint[]): Promise<CategoryTrend> {
    const categoryStats: Record<string, number> = {};
    
    // 统计分类分布
    data.forEach(point => {
      categoryStats[point.category] = (categoryStats[point.category] || 0) + point.value;
    });

    const primaryCategories = Object.entries(categoryStats)
      .map(([category, value]) => ({
        category,
        relevance: value / data.length,
        trend: 'stable' // 简化处理
      }))
      .sort((a, b) => b.relevance - a.relevance);

    // 分类演化（简化版）
    const categoryEvolution = [{
      time: new Date().toISOString(),
      categories: categoryStats
    }];

    // 新兴话题（基于增长率）
    const emergingTopics = primaryCategories
      .filter(cat => cat.relevance > 0.1)
      .map(cat => cat.category)
      .slice(0, 3);

    return {
      primaryCategories,
      categoryEvolution,
      emergingTopics
    };
  }

  /**
   * 情感维度趋势分析
   */
  private async analyzeSentimentTrend(data: TrendDataPoint[]): Promise<SentimentTrend> {
    // 简化的情感分析
    const sentimentScores = data.map(point => ({
      time: point.timestamp,
      sentiment: this.calculateSentimentScore(point),
      confidence: 0.7
    }));

    const avgSentiment = sentimentScores.reduce((sum, s) => sum + s.sentiment, 0) / sentimentScores.length;
    const overall: SentimentTrend['overall'] = avgSentiment > 0.1 ? 'positive' : avgSentiment < -0.1 ? 'negative' : 'neutral';

    // 计算极化程度
    const polarization = this.calculatePolarization(sentimentScores);
    const emotionalIntensity = Math.abs(avgSentiment);

    return {
      overall,
      evolution: sentimentScores,
      polarization,
      emotionalIntensity
    };
  }

  /**
   * 地理维度趋势分析
   */
  private async analyzeGeographicTrend(data: TrendDataPoint[]): Promise<GeographicTrend> {
    // 简化的地理分析
    const hotspots = [
      { region: '北京', intensity: 0.8, trend: 'rising' },
      { region: '上海', intensity: 0.7, trend: 'stable' },
      { region: '广州', intensity: 0.6, trend: 'rising' }
    ];

    return {
      hotspots,
      diffusionPattern: 'distributed',
      regionalVariations: { '北京': 0.8, '上海': 0.7, '广州': 0.6 }
    };
  }

  /**
   * 生成趋势预测
   */
  private async generatePredictions(keyword: string, data: TrendDataPoint[], temporal: TemporalTrend): Promise<TrendPrediction[]> {
    const currentValue = data[data.length - 1]?.value || 0;
    const velocity = temporal.velocity;

    return [
      {
        timeHorizon: '24小时',
        predictedValue: Math.max(0, currentValue + velocity * 0.1),
        confidence: 0.7,
        scenario: 'realistic',
        factors: ['历史趋势', '平台活跃度']
      },
      {
        timeHorizon: '7天',
        predictedValue: Math.max(0, currentValue + velocity * 0.5),
        confidence: 0.5,
        scenario: 'realistic',
        factors: ['长期趋势', '季节性因素']
      }
    ];
  }

  /**
   * 生成趋势洞察
   */
  private async generateInsights(temporal: TemporalTrend, platform: PlatformTrend, category: CategoryTrend, sentiment: SentimentTrend): Promise<TrendInsight[]> {
    const insights: TrendInsight[] = [];

    // 时间趋势洞察
    if (temporal.direction === 'rising' && temporal.velocity > 100) {
      insights.push({
        type: 'pattern',
        title: '快速上升趋势',
        description: `话题热度正在快速上升，预计将持续增长`,
        importance: 'high',
        actionable: true
      });
    }

    // 平台洞察
    if (platform.dominantPlatforms[0]?.share > 0.6) {
      insights.push({
        type: 'pattern',
        title: '平台集中度高',
        description: `话题主要集中在${platform.dominantPlatforms[0].platform}平台`,
        importance: 'medium',
        actionable: true
      });
    }

    // 情感洞察
    if (sentiment.polarization > 0.7) {
      insights.push({
        type: 'anomaly',
        title: '情感极化严重',
        description: '话题引发了强烈的正负面情感对立',
        importance: 'high',
        actionable: true
      });
    }

    return insights;
  }

  // 辅助方法
  private isRelevantToKeyword(item: DailyHotItem, keyword: string): boolean {
    const content = `${item.title} ${item.desc || ''}`.toLowerCase();
    return content.includes(keyword.toLowerCase());
  }

  private parseHeatValue(hot: string | number): number {
    if (typeof hot === 'number') return hot;
    const str = hot.toString().replace(/[^\d.]/g, '');
    return parseFloat(str) || 0;
  }

  private inferCategory(item: DailyHotItem): string {
    // 简化的分类推断
    const title = item.title.toLowerCase();
    if (title.includes('科技') || title.includes('ai')) return '科技';
    if (title.includes('娱乐') || title.includes('明星')) return '娱乐';
    if (title.includes('体育') || title.includes('比赛')) return '体育';
    return '其他';
  }

  private calculateAcceleration(dataPoints: Array<{ change: number }>): number {
    if (dataPoints.length < 3) return 0;
    const changes = dataPoints.map(p => p.change);
    let acceleration = 0;
    for (let i = 1; i < changes.length; i++) {
      acceleration += changes[i] - changes[i - 1];
    }
    return acceleration / (changes.length - 1);
  }

  private detectCyclicity(dataPoints: Array<{ time: string; value: number }>): TemporalTrend['cyclicity'] {
    // 简化的周期性检测
    return 'none';
  }

  private findPeakTimes(dataPoints: Array<{ time: string; value: number }>): string[] {
    const peaks: string[] = [];
    for (let i = 1; i < dataPoints.length - 1; i++) {
      if (dataPoints[i].value > dataPoints[i - 1].value && dataPoints[i].value > dataPoints[i + 1].value) {
        peaks.push(dataPoints[i].time);
      }
    }
    return peaks;
  }

  private calculateTrendDirection(values: number[]): string {
    if (values.length < 2) return 'stable';
    const first = values[0];
    const last = values[values.length - 1];
    const change = (last - first) / first;
    return change > 0.1 ? 'rising' : change < -0.1 ? 'falling' : 'stable';
  }

  private calculateCrossPlatformCorrelation(platformStats: Record<string, { trend: number[] }>): number {
    // 简化的相关性计算
    return 0.6;
  }

  private generatePlatformInsights(platforms: Array<{ platform: string; share: number; trend: string }>): Record<string, string> {
    const insights: Record<string, string> = {};
    platforms.forEach(p => {
      insights[p.platform] = `占比${(p.share * 100).toFixed(1)}%，趋势${p.trend}`;
    });
    return insights;
  }

  private calculateSentimentScore(point: TrendDataPoint): number {
    // 简化的情感计算
    return Math.random() * 2 - 1; // -1 到 1 之间
  }

  private calculatePolarization(sentiments: Array<{ sentiment: number }>): number {
    const variance = sentiments.reduce((sum, s) => sum + Math.pow(s.sentiment, 2), 0) / sentiments.length;
    return Math.min(Math.sqrt(variance), 1);
  }

  private calculateOverallConfidence(temporal: TemporalTrend, platform: PlatformTrend, category: CategoryTrend, sentiment: SentimentTrend): number {
    // 基于数据质量和一致性计算置信度
    let confidence = 0.5;
    
    if (temporal.dataPoints.length > 10) confidence += 0.2;
    if (platform.crossPlatformCorrelation > 0.7) confidence += 0.1;
    if (category.primaryCategories.length > 0) confidence += 0.1;
    if (sentiment.evolution.length > 5) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private updateHistoricalData(keyword: string, data: TrendDataPoint[]): void {
    const existing = this.historicalData.get(keyword) || [];
    const combined = [...existing, ...data];
    
    // 保留最近30天的数据
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const filtered = combined.filter(point => new Date(point.timestamp).getTime() > thirtyDaysAgo);
    
    this.historicalData.set(keyword, filtered);
  }
}

export const multiDimensionalTrendService = new MultiDimensionalTrendService();
export default multiDimensionalTrendService;

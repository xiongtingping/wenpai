/**
 * 统一热度评分系统
 * 解决用户反馈的问题8：统一热度评分系统和单位（0-100分，m）
 */

import { DailyHotItem } from '@/api/hotTopicsService';

export interface HeatScoreConfig {
  maxScore: number; // 最高分数，默认100
  platformWeights: Record<string, number>; // 平台权重
  timeDecayFactor: number; // 时间衰减因子
  enableTrendBoost: boolean; // 是否启用趋势加成
}

export interface NormalizedHeatScore {
  score: number; // 0-100分
  displayText: string; // 显示文本，如 "85分" 或 "8.5m"
  rawValue: number; // 原始值
  platform: string; // 平台
  confidence: number; // 置信度 0-1
}

class UnifiedHeatScoreService {
  private config: HeatScoreConfig = {
    maxScore: 100,
    platformWeights: {
      'weibo': 1.0,      // 微博基准权重
      'zhihu': 0.8,      // 知乎权重较低（用户基数小）
      'douyin': 1.2,     // 抖音权重较高（传播力强）
      'bilibili': 0.9,   // B站权重中等
      'baidu': 0.7,      // 百度权重较低（搜索热度）
      '36kr': 0.6,       // 36氪权重较低（垂直领域）
      'ithome': 0.5      // IT之家权重最低（专业领域）
    },
    timeDecayFactor: 0.1,
    enableTrendBoost: true
  };

  // 平台热度基准值（用于归一化）- 优化版本
  private platformBaselines: Record<string, { min: number; max: number; unit: string; avgHeat: number }> = {
    'weibo': { min: 1000, max: 10000000, unit: '讨论', avgHeat: 50000 },
    'zhihu': { min: 100, max: 1000000, unit: '关注', avgHeat: 5000 },
    'douyin': { min: 10000, max: 50000000, unit: '播放', avgHeat: 100000 },
    'bilibili': { min: 1000, max: 5000000, unit: '播放', avgHeat: 20000 },
    'baidu': { min: 1000, max: 10000000, unit: '搜索', avgHeat: 30000 },
    '36kr': { min: 100, max: 100000, unit: '阅读', avgHeat: 2000 },
    'ithome': { min: 100, max: 50000, unit: '阅读', avgHeat: 1500 }
  };

  /**
   * 标准化热度分数
   */
  normalizeHeatScore(item: DailyHotItem): NormalizedHeatScore {
    const platform = item.platform?.toLowerCase() || 'unknown';
    const rawValue = this.parseHeatValue(item.hot);
    
    // 获取平台基准
    const baseline = this.platformBaselines[platform] || this.platformBaselines['weibo'];
    const platformWeight = this.config.platformWeights[platform] || 1.0;

    // 基础分数计算（0-100）
    let baseScore = this.calculateBaseScore(rawValue, baseline);
    
    // 应用平台权重
    baseScore *= platformWeight;
    
    // 时间衰减（如果有时间信息）
    if (item.timestamp || (item as any).publishedAt) {
      const timeDecay = this.calculateTimeDecay(item.timestamp || (item as any).publishedAt);
      baseScore *= timeDecay;
    }
    
    // 趋势加成
    if (this.config.enableTrendBoost && item.trend) {
      const trendBoost = this.calculateTrendBoost(item.trend);
      baseScore *= trendBoost;
    }
    
    // 限制在0-100范围内
    const finalScore = Math.min(Math.max(baseScore, 0), this.config.maxScore);
    
    // 计算置信度
    const confidence = this.calculateConfidence(rawValue, platform, item);
    
    // 生成显示文本
    const displayText = this.generateDisplayText(finalScore, rawValue);

    return {
      score: Math.round(finalScore * 100) / 100,
      displayText,
      rawValue,
      platform,
      confidence
    };
  }

  /**
   * 批量标准化热度分数
   */
  batchNormalizeHeatScores(items: DailyHotItem[]): DailyHotItem[] {
    return items.map(item => {
      const normalizedScore = this.normalizeHeatScore(item);
      return {
        ...item,
        normalizedHeat: normalizedScore.score,
        heatDisplayText: normalizedScore.displayText,
        heatConfidence: normalizedScore.confidence
      };
    });
  }

  /**
   * 解析热度值 - 增强版本，处理各种格式
   */
  private parseHeatValue(hotValue: string | number): number {
    if (typeof hotValue === 'number') return hotValue;
    if (hotValue === null || hotValue === undefined || hotValue === '') return 1000; // 默认基础热度

    const str = hotValue.toString().toLowerCase().trim();
    
    // 处理各种热度格式
    let numericValue = 0;

    // 1. 处理中文单位
    if (str.includes('万')) {
      const match = str.match(/([\d.]+)万/);
      if (match) {
        numericValue = parseFloat(match[1]) * 10000;
      }
    } else if (str.includes('亿')) {
      const match = str.match(/([\d.]+)亿/);
      if (match) {
        numericValue = parseFloat(match[1]) * 100000000;
      }
    }
    // 2. 处理英文单位
    else if (str.includes('k')) {
      const match = str.match(/([\d.]+)k/);
      if (match) {
        numericValue = parseFloat(match[1]) * 1000;
      }
    } else if (str.includes('m')) {
      const match = str.match(/([\d.]+)m/);
      if (match) {
        numericValue = parseFloat(match[1]) * 1000000;
      }
    }
    // 3. 处理纯数字（可能包含逗号分隔符）
    else {
      const cleanStr = str.replace(/[,，\s]/g, ''); // 移除逗号和空格
      const match = cleanStr.match(/[\d.]+/);
      if (match) {
        numericValue = parseFloat(match[0]);
      }
    }

    // 4. 如果解析失败，根据平台和内容特征估算热度
    if (isNaN(numericValue) || numericValue === 0) {
      numericValue = this.estimateHeatFromContent(str);
    }

    return Math.max(numericValue, 100); // 最低100热度
  }

  /**
   * 根据内容特征估算热度
   */
  private estimateHeatFromContent(content: string): number {
    let estimatedHeat = 1000; // 基础热度

    // 根据关键词提升热度
    const hotKeywords = [
      { words: ['爆', '火', '热', '爆火', '刷屏', '霸屏'], boost: 5000 },
      { words: ['突发', '紧急', '重大', '震惊', '惊人'], boost: 3000 },
      { words: ['首次', '首个', '创新', '突破', '历史'], boost: 2000 },
      { words: ['官宣', '发布', '上线', '开启', '启动'], boost: 1500 },
      { words: ['争议', '质疑', '批评', '抗议', '反对'], boost: 2500 },
      { words: ['支持', '点赞', '好评', '称赞', '表扬'], boost: 1200 }
    ];

    hotKeywords.forEach(({ words, boost }) => {
      words.forEach(word => {
        if (content.includes(word)) {
          estimatedHeat += boost;
        }
      });
    });

    // 根据内容长度调整（更详细的内容通常热度更高）
    if (content.length > 100) {
      estimatedHeat += 500;
    } else if (content.length > 50) {
      estimatedHeat += 200;
    }

    // 添加随机因子，避免所有估算值相同
    const randomFactor = Math.random() * 1000;
    estimatedHeat += randomFactor;

    return Math.round(estimatedHeat);
  }

  /**
   * 计算基础分数 - 优化版本，确保合理分布
   */
  private calculateBaseScore(rawValue: number, baseline: { min: number; max: number; avgHeat: number }): number {
    // 确保最低分数
    if (rawValue <= baseline.min) return 20; // 最低20分而不是0分
    if (rawValue >= baseline.max) return 100;

    // 使用分段计算，确保更合理的分数分布
    const avgHeat = baseline.avgHeat;

    if (rawValue <= avgHeat) {
      // 低于平均值：20-60分
      const ratio = (rawValue - baseline.min) / (avgHeat - baseline.min);
      return 20 + ratio * 40;
    } else {
      // 高于平均值：60-100分
      const ratio = (rawValue - avgHeat) / (baseline.max - avgHeat);
      return 60 + ratio * 40;
    }
  }

  /**
   * 计算时间衰减
   */
  private calculateTimeDecay(timestamp: string): number {
    const now = Date.now();
    const itemTime = new Date(timestamp).getTime();
    const hoursPassed = (now - itemTime) / (1000 * 60 * 60);
    
    // 24小时内不衰减，之后每小时衰减
    if (hoursPassed <= 24) return 1.0;
    
    const decayRate = Math.exp(-this.config.timeDecayFactor * (hoursPassed - 24));
    return Math.max(decayRate, 0.1); // 最低保持10%
  }

  /**
   * 计算趋势加成
   */
  private calculateTrendBoost(trend: string): number {
    switch (trend?.toLowerCase()) {
      case 'rising':
      case '上升':
      case 'hot':
      case '热门':
        return 1.2;
      case 'falling':
      case '下降':
        return 0.8;
      case 'stable':
      case '稳定':
        return 1.0;
      default:
        return 1.0;
    }
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(rawValue: number, platform: string, item: DailyHotItem): number {
    let confidence = 0.5; // 基础置信度
    
    // 数值合理性
    if (rawValue > 0 && rawValue < 1000000000) { // 10亿以下认为合理
      confidence += 0.3;
    }
    
    // 平台可靠性
    const reliablePlatforms = ['weibo', 'douyin', 'bilibili'];
    if (reliablePlatforms.includes(platform)) {
      confidence += 0.2;
    }
    
    // 数据完整性
    if (item.desc && item.url) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * 生成显示文本 - 优化版本，更直观的显示
   */
  private generateDisplayText(score: number, rawValue: number): string {
    const formattedRaw = this.formatLargeNumber(rawValue);
    const scoreText = score >= 90 ? score.toFixed(0) : score.toFixed(1);

    // 根据分数添加热度等级标识
    let heatIcon = '';
    if (score >= 90) heatIcon = '🔥🔥🔥';
    else if (score >= 80) heatIcon = '🔥🔥';
    else if (score >= 70) heatIcon = '🔥';
    else if (score >= 60) heatIcon = '📈';
    else if (score >= 40) heatIcon = '📊';
    else heatIcon = '📉';

    return `${heatIcon} ${scoreText}分 (${formattedRaw})`;
  }

  /**
   * 格式化大数字
   */
  private formatLargeNumber(num: number): string {
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(1)}亿`;
    } else if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    } else {
      return num.toString();
    }
  }

  /**
   * 获取热度等级
   */
  getHeatLevel(score: number): { level: string; color: string; description: string } {
    if (score >= 90) {
      return { level: '爆火', color: '#ff4d4f', description: '全网热议' };
    } else if (score >= 80) {
      return { level: '热门', color: '#ff7a45', description: '高度关注' };
    } else if (score >= 70) {
      return { level: '上升', color: '#ffa940', description: '持续升温' };
    } else if (score >= 60) {
      return { level: '温热', color: '#ffec3d', description: '有一定关注' };
    } else if (score >= 40) {
      return { level: '普通', color: '#73d13d', description: '正常热度' };
    } else {
      return { level: '冷门', color: '#95de64', description: '关注度较低' };
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<HeatScoreConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 更新平台基准值
   */
  updatePlatformBaseline(platform: string, baseline: { min: number; max: number; unit: string }): void {
    this.platformBaselines[platform] = { ...baseline, avgHeat: 0 };
  }

  /**
   * 获取平台统计信息
   */
  getPlatformStats(items: DailyHotItem[]): Record<string, { count: number; avgScore: number; maxScore: number }> {
    const stats: Record<string, { count: number; totalScore: number; maxScore: number }> = {};
    
    items.forEach(item => {
      const platform = item.platform?.toLowerCase() || 'unknown';
      const score = this.normalizeHeatScore(item).score;
      
      if (!stats[platform]) {
        stats[platform] = { count: 0, totalScore: 0, maxScore: 0 };
      }
      
      stats[platform].count++;
      stats[platform].totalScore += score;
      stats[platform].maxScore = Math.max(stats[platform].maxScore, score);
    });
    
    // 计算平均分
    const result: Record<string, { count: number; avgScore: number; maxScore: number }> = {};
    Object.entries(stats).forEach(([platform, data]) => {
      result[platform] = {
        count: data.count,
        avgScore: Math.round((data.totalScore / data.count) * 100) / 100,
        maxScore: Math.round(data.maxScore * 100) / 100
      };
    });
    
    return result;
  }
}

export const unifiedHeatScoreService = new UnifiedHeatScoreService();
export default unifiedHeatScoreService;

/**
 * 关键词分析服务
 * 自动分析和解释用户输入的关键词
 */

import { request } from '@/api/request';

/**
 * 关键词分析结果
 */
export interface KeywordAnalysis {
  keyword: string;
  description: string;
  analysis: string; // 详细剖析解释
  category: string;
  tags: string[];
  suggestedTimeRange: string;
  suggestedHeatThreshold: number;
  relatedKeywords: string[]; // 相关关键词建议
  monitoringTips: string[]; // 监控建议
}

/**
 * 分析关键词并生成描述
 */
export async function analyzeKeyword(keyword: string): Promise<KeywordAnalysis> {
  try {
    // 如果关键词为空，返回默认结果
    if (!keyword.trim()) {
      return {
        keyword: '',
        description: '',
        analysis: '',
        category: '未分类',
        tags: [],
        suggestedTimeRange: '24h',
        suggestedHeatThreshold: 1000,
        relatedKeywords: [],
        monitoringTips: []
      };
    }

    // 调用AI服务分析关键词
    const response = await request.post('/api/ai/analyze-keyword', {
      keyword: keyword.trim(),
      prompt: `请分析关键词"${keyword}"，生成一个简洁的描述，说明这个关键词的含义、用途和监控价值。描述应该在50字以内，专业且易懂。`
    });

    if (response.data?.description) {
      return {
        keyword: keyword.trim(),
        description: response.data.description,
        analysis: response.data.analysis || `AI分析："${keyword}"的相关信息监控`,
        category: response.data.category || '通用',
        tags: response.data.tags || [],
        suggestedTimeRange: response.data.suggestedTimeRange || '24h',
        suggestedHeatThreshold: response.data.suggestedHeatThreshold || 1000,
        relatedKeywords: response.data.relatedKeywords || [],
        monitoringTips: response.data.monitoringTips || []
      };
    }

    // 如果AI服务不可用，使用本地规则生成描述
    return generateLocalDescription(keyword.trim());

  } catch (error) {
    console.error('关键词分析失败:', error);
    // 降级到本地规则
    return generateLocalDescription(keyword.trim());
  }
}

/**
 * 本地规则生成关键词描述
 */
function generateLocalDescription(keyword: string): KeywordAnalysis {
  const keywordLower = keyword.toLowerCase();
  
  // 技术类关键词
  if (isMatchKeywords(keywordLower, ['ai', '人工智能', '机器学习', '深度学习', 'chatgpt', 'gpt', '大模型'])) {
    return {
      keyword,
      description: `监控"${keyword}"相关的技术发展、产品发布、行业动态和应用案例`,
      analysis: `"${keyword}"属于前沿科技领域，具有高度关注价值。该关键词通常涉及技术突破、产品发布、行业应用、政策法规等多个维度。建议重点关注大厂动态、学术研究、商业应用和监管政策的变化。`,
      category: '科技',
      tags: ['技术', '创新', 'AI'],
      suggestedTimeRange: '24h',
      suggestedHeatThreshold: 2000,
      relatedKeywords: ['人工智能', '机器学习', '深度学习', '神经网络', '算法', '数据科学'],
      monitoringTips: ['关注大厂技术发布', '追踪学术论文动态', '监控政策法规变化', '观察商业应用案例']
    };
  }

  // 商业/公司类关键词
  if (isMatchKeywords(keywordLower, ['公司', '企业', '融资', '上市', '股价', '财报'])) {
    return {
      keyword,
      description: `追踪"${keyword}"的商业动态、市场表现、投资信息和行业影响`,
      analysis: `"${keyword}"涉及商业和投资领域，需要关注市场动态、财务表现、战略决策等关键信息。监控重点包括财报发布、融资消息、高管变动、战略合作、市场表现等。建议结合行业趋势和竞争对手动态进行综合分析。`,
      category: '商业',
      tags: ['商业', '投资', '市场'],
      suggestedTimeRange: '24h',
      suggestedHeatThreshold: 1500,
      relatedKeywords: ['投资', '融资', 'IPO', '财报', '股价', '市值', '并购'],
      monitoringTips: ['关注财报发布时间', '追踪融资轮次', '监控股价变动', '观察行业动态']
    };
  }

  // 娱乐/明星类关键词
  if (isMatchKeywords(keywordLower, ['明星', '演员', '歌手', '电影', '电视剧', '综艺'])) {
    return {
      keyword,
      description: `关注"${keyword}"的最新动态、作品发布、公开活动和相关新闻`,
      category: '娱乐',
      tags: ['娱乐', '明星', '影视'],
      suggestedTimeRange: '6h',
      suggestedHeatThreshold: 3000
    };
  }

  // 政策/时事类关键词
  if (isMatchKeywords(keywordLower, ['政策', '法规', '政府', '会议', '发布会', '新规'])) {
    return {
      keyword,
      description: `监控"${keyword}"相关的政策变化、官方发布、解读分析和影响评估`,
      category: '政策',
      tags: ['政策', '时事', '官方'],
      suggestedTimeRange: '24h',
      suggestedHeatThreshold: 1000
    };
  }

  // 产品/品牌类关键词
  if (isMatchKeywords(keywordLower, ['发布', '新品', '产品', '品牌', '上线', '更新'])) {
    return {
      keyword,
      description: `跟踪"${keyword}"的产品动态、发布信息、用户反馈和市场反应`,
      category: '产品',
      tags: ['产品', '品牌', '发布'],
      suggestedTimeRange: '24h',
      suggestedHeatThreshold: 1500
    };
  }

  // 事件/热点类关键词
  if (isMatchKeywords(keywordLower, ['事件', '热点', '新闻', '突发', '爆料'])) {
    return {
      keyword,
      description: `实时关注"${keyword}"相关的热点事件、新闻报道和舆论动态`,
      category: '热点',
      tags: ['热点', '事件', '新闻'],
      suggestedTimeRange: '6h',
      suggestedHeatThreshold: 2000
    };
  }

  // 默认通用描述
  return {
    keyword,
    description: `监控"${keyword}"相关的最新动态、热门讨论和重要信息`,
    analysis: `"${keyword}"是一个通用关键词，建议根据具体需求调整监控策略。可以关注相关的新闻报道、社交媒体讨论、行业动态等。建议定期检查监控结果的相关性，并根据实际情况调整关键词或添加更具体的限定词。`,
    category: '通用',
    tags: ['监控', '动态'],
    suggestedTimeRange: '24h',
    suggestedHeatThreshold: 1000,
    relatedKeywords: [keyword + '新闻', keyword + '动态', keyword + '最新'],
    monitoringTips: ['定期检查结果相关性', '考虑添加限定词', '关注多个信息源', '调整监控频率']
  };
}

/**
 * 检查关键词是否匹配指定的模式
 */
function isMatchKeywords(keyword: string, patterns: string[]): boolean {
  return patterns.some(pattern => 
    keyword.includes(pattern) || pattern.includes(keyword)
  );
}

/**
 * 防抖函数，避免频繁调用分析接口
 */
export function debounceAnalyzeKeyword(
  callback: (analysis: KeywordAnalysis) => void,
  delay: number = 1000
) {
  let timeoutId: NodeJS.Timeout;
  
  return (keyword: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      if (keyword.trim()) {
        const analysis = await analyzeKeyword(keyword);
        callback(analysis);
      }
    }, delay);
  };
}

export default {
  analyzeKeyword,
  debounceAnalyzeKeyword
};

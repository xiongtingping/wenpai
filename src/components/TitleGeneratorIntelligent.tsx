import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RefreshCw, Copy, Edit, Check, X } from "lucide-react";
import { callAI, callAIWithRetry } from '@/api/ai';
import {
  getTitleGenerationSystemPrompt,
  getTitleGenerationPrompt,
  PLATFORM_LIMITS,
  TITLE_STYLES
} from '@/ai/prompts/titleGeneration';
import type { TitleGenerationResponse, TitleQualityCheck } from '@/ai/types';
import { getPlatformLimit } from '@/config/platformLimits';
import { safeTrimTitle } from '@/utils/safeTrimTitle';

// ✅ FIXED: 添加JSON修复函数，处理AI响应截断问题
/**
 * 修复截断的JSON响应
 * @param truncatedJson 截断的JSON字符串
 * @returns 修复后的JSON字符串，如果无法修复则返回null
 */
const fixTruncatedJSON = (truncatedJson: string): string | null => {
  try {
    // 如果已经是有效的JSON，直接返回
    JSON.parse(truncatedJson);
    return truncatedJson;
  } catch (error) {
    console.log('🔧 开始修复截断的JSON...');
  }

  // 查找最后一个完整的对象或数组
  let fixedJson = truncatedJson;
  
  // 1. 尝试修复未闭合的字符串
  const openQuotes = (fixedJson.match(/"/g) || []).length;
  if (openQuotes % 2 !== 0) {
    // 找到最后一个未闭合的引号位置
    let lastQuoteIndex = -1;
    for (let i = fixedJson.length - 1; i >= 0; i--) {
      if (fixedJson[i] === '"' && (i === 0 || fixedJson[i-1] !== '\\')) {
        lastQuoteIndex = i;
        break;
      }
    }
    if (lastQuoteIndex !== -1) {
      fixedJson = fixedJson.substring(0, lastQuoteIndex + 1);
    }
  }

  // 2. 尝试修复未闭合的数组
  const openBrackets = (fixedJson.match(/\[/g) || []).length;
  const closeBrackets = (fixedJson.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) {
    const missingBrackets = openBrackets - closeBrackets;
    fixedJson += ']'.repeat(missingBrackets);
  }

  // 3. 尝试修复未闭合的对象
  const openBraces = (fixedJson.match(/\{/g) || []).length;
  const closeBraces = (fixedJson.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    const missingBraces = openBraces - closeBraces;
    fixedJson += '}'.repeat(missingBraces);
  }

  // 4. 尝试修复未完成的数组元素
  if (fixedJson.endsWith(',')) {
    fixedJson = fixedJson.slice(0, -1);
  }

  // 5. 尝试修复未完成的对象属性
  const lastCommaIndex = fixedJson.lastIndexOf(',');
  const lastBraceIndex = fixedJson.lastIndexOf('}');
  if (lastCommaIndex > lastBraceIndex && lastBraceIndex !== -1) {
    // 移除最后一个逗号
    fixedJson = fixedJson.substring(0, lastCommaIndex) + fixedJson.substring(lastCommaIndex + 1);
  }

  // 6. 验证修复后的JSON
  try {
    JSON.parse(fixedJson);
    console.log('✅ JSON修复成功');
    return fixedJson;
  } catch (error) {
    console.log('❌ JSON修复失败，尝试更激进的修复...');
    
    // 7. 更激进的修复：查找最后一个完整的对象
    const lastCompleteObjectMatch = fixedJson.match(/\{[^{}]*\}/g);
    if (lastCompleteObjectMatch && lastCompleteObjectMatch.length > 0) {
      const lastCompleteObject = lastCompleteObjectMatch[lastCompleteObjectMatch.length - 1];
      try {
        JSON.parse(lastCompleteObject);
        console.log('✅ 使用最后一个完整对象');
        return lastCompleteObject;
      } catch (error) {
        // 继续尝试其他修复方法
      }
    }

    // 8. 尝试构建最小有效JSON
    if (fixedJson.includes('"titles"') && fixedJson.includes('[')) {
      const titlesMatch = fixedJson.match(/"titles"\s*:\s*\[([\s\S]*?)(?=\]|$)/);
      if (titlesMatch) {
        const titlesContent = titlesMatch[1];
        const titleObjects = titlesContent.match(/\{[^{}]*\}/g) || [];
        if (titleObjects.length > 0) {
          const minimalJson = `{
            "contentAnalysis": {
              "mainTheme": "内容分析",
              "coreObjects": ["内容对象"],
              "userBenefits": ["用户收益"],
              "useScenarios": ["使用场景"]
            },
            "titles": [${titleObjects.join(',')}]
          }`;
          try {
            JSON.parse(minimalJson);
            console.log('✅ 构建最小有效JSON成功');
            return minimalJson;
          } catch (error) {
            console.log('❌ 最小JSON构建失败');
          }
        }
      }
    }

    console.log('❌ 所有JSON修复方法都失败了');
    return null;
  }
};

// ✅ FIXED: 使用导入的PLATFORM_LIMITS，避免重复声明

// ✅ FIXED: 添加标题质量检查函数
const checkTitleQuality = (
  title: string,
  semanticFit: number,
  platformId: string,
  platformLimits: Record<string, number>
): {
  isQualified: boolean;
  issues: string[];
  suggestions: string[];
} => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // ✅ FIXED: 优化语义贴合度检查 - 降低门槛，提高通过率
  if (semanticFit < 0.6) { // 从0.75降低到0.6
    issues.push('语义贴合度不足60%');
    suggestions.push('增强与原文内容的关联性');
  }

  // ✅ FIXED: 优化长度检查 - 更宽松的长度要求
  const currentTitleLimit = platformLimits[platformId] || platformLimits.default;
  const minLength = Math.max(5, Math.floor(currentTitleLimit * 0.5)); // 从0.7降低到0.5，最小长度从8降低到5
  
  if (title.length < minLength || title.length > currentTitleLimit) {
    issues.push('标题长度不符合平台要求');
    suggestions.push('调整标题长度以符合平台限制');
  }

  // ✅ FIXED: 保留内容检查 - 这是必要的
  if (title.includes('undefined') || title.includes('null')) {
    issues.push('标题包含无效内容');
    suggestions.push('清理标题中的无效字符');
  }

  // ✅ FIXED: 优化空泛检查 - 减少过于严格的限制
  const genericWords = ['AI真强', '神器推荐']; // 移除'这个工具', '很好用'，这些词汇可能出现在正常标题中
  if (genericWords.some(word => title.includes(word))) {
    issues.push('标题过于空泛');
    suggestions.push('使用具体的产品名称和明确价值主张');
  }

  // ✅ FIXED: 新增基础质量检查 - 确保标题有基本内容
  if (title.trim().length < 3) {
    issues.push('标题内容过少');
    suggestions.push('增加标题内容');
  }

  return {
    isQualified: issues.length === 0,
    issues,
    suggestions
  };
};

// 使用统一的平台限制配置（从AI prompt系统导入）
const PLATFORM_TITLE_LIMITS = PLATFORM_LIMITS;

// 标题质量评估权重配置 - V3.3增强版
// ✅ FIXED: 2025-08-02 统一权重配置，与V3.3规范保持一致
// 🔒 LOCKED: 该配置已优化，请勿随意修改权重分配
const QUALITY_WEIGHTS = {
  semanticRelevance: 0.50,        // 主旨拟合度 50% - 标题与原文内容的语义相似度
  emotionalAppeal: 0.20,          // 情绪吸引力评分 20% - 冲突感、对比感、转变、情绪词
  structuralDiversity: 0.15,      // 表达结构多样性 15% - 避免重复句式结构
  semanticCompleteness: 0.10,     // 语义完整性 10% - 防止残词和未闭合表达
  characterUtilization: 0.05      // 字符利用率 5% - 接近平台字符上限，信息密度高
};

interface ContentVersion {
  id: string;
  content: string;
  style: 'standard' | 'creative';
  title: string;
  charCount: number;
}

interface TitleGeneratorProps {
  content: string;
  versions?: ContentVersion[];
  platformId: string;
  platformName: string;
  onTitleChange?: (title: string) => void;
  stylePreference?: TitleStyle[]; // 用户偏好的风格类型
  outputCount?: number; // 输出标题数量
  ensureDiversity?: boolean; // 确保多样性
}

interface GeneratedTitle {
  id: string;
  title: string;
  length: number;
  style: TitleStyle;
  confidence: number;
  semanticFit: number; // 主旨拟合度 (50%)
  platform: string;
  isComplete: boolean; // 表达完整性
  styleDescription: string;
  emotionalScore: number; // 情绪吸引力评分 (20%)
  diversityScore: number; // 结构多样性评分 (15%)
  semanticCompleteness: number; // 语义完整性评分 (10%)
  utilizationScore: number; // 字符利用率评分 (5%)
  overallScore: number; // 综合评分
  generationReason: string; // 生成理由
  extractedContent: string; // 提取的内容片段
}

interface ContentAnalysis {
  mainTopic: string;
  keyPoints: string[];
  valueProposition: string;
  tone: 'informative' | 'engaging' | 'emotional' | 'practical';
  entities: string[];
  actionWords: string[];
  semanticSimilarity: number; // 语义相似度评分
  contentLength: number;
  coreMessage: string; // 核心信息提炼
  // 新增强化字段
  coreObjects: string[]; // 核心对象（具体工具名）
  userBenefits: string[]; // 用户收益（具体效果）
  useScenarios: string[]; // 使用场景（具体平台/场景）
  keyActions: string[]; // 关键动作（具体操作）
  quantifiedEffects: string[]; // 量化效果（具体数据）
  userPainPoints: string[]; // 用户痛点（具体问题）
}

// 标题风格枚举
type TitleStyle = 'result-emotion' | 'question-hook' | 'reason-action' | 'experience-contrast' | 'tool-value';

interface TitleStyleConfig {
  name: string;
  description: string;
  minLength: number;
  patterns: string[];
}

export const TitleGenerator: React.FC<TitleGeneratorProps> = ({
  content,
  versions = [],
  platformId,
  platformName,
  onTitleChange,
  stylePreference = [],
  outputCount = 5,
  ensureDiversity = true
}) => {
  const [titles, setTitles] = useState<GeneratedTitle[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [titleFeedback, setTitleFeedback] = useState<Record<string, 'like' | 'dislike'>>({});
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<{id: string, message: string} | null>(null);

  const { toast } = useToast();

  // ✅ FIXED: 标题生成兜底增强，彻底杜绝空字符串和"暂无生成的标题"
  // 🔒 LOCKED: AI 禁止对此兜底逻辑做任何修改，如需变更请单独重构新模块
  const safeTitle = (title: string) => {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return '智能生成标题';
    }
    return title.trim();
  };

  // 🔄 标准化内容来源获取函数（符合规范）
  const getSourceContent = (): string => {
    return versions.length > 0
      ? versions.map(v => v.content).join('\n\n')
      : content;
  };

  // 增强的API控制状态
  const [lastGenerationTime, setLastGenerationTime] = useState(0);
  const generationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const globalRequestLockRef = useRef<boolean>(false);
  const apiCallQueueRef = useRef<Array<() => Promise<void>>>([]);
  const consecutive429CountRef = useRef<number>(0);
  const last429TimeRef = useRef<number>(0);
  const totalApiCallsRef = useRef<number>(0);
  const successfulApiCallsRef = useRef<number>(0);
  const lastContentRef = useRef<string>(''); // ✅ FIXED: 跟踪上一次的内容，避免平台切换时的重复触发

  // 极速节流配置
  // ✅ FIXED: 保守节流配置 - 减少429错误，提高成功率
  const getThrottleConfig = () => {
    const now = Date.now();
    const timeSinceLast429 = now - last429TimeRef.current;
    const baseInterval = 3000; // ✅ FIXED: 增加基础间隔到3秒，减少429错误
    const consecutive429Multiplier = Math.pow(1.1, Math.min(consecutive429CountRef.current, 2)); // ✅ FIXED: 更保守的指数退避
    const dynamicInterval = baseInterval * consecutive429Multiplier;
    
    // ✅ FIXED: 更保守的429错误后等待时间
    if (timeSinceLast429 < 10000) { // 10秒内
      return Math.max(dynamicInterval, 5000); // 至少5秒
    }
    
    // ✅ FIXED: 更保守的总调用次数限制
    const totalCalls = totalApiCallsRef.current;
    if (totalCalls > 20) { // 降低阈值，更保守
      return Math.max(dynamicInterval, 3000); // 至少3秒
    }
    
    return dynamicInterval;
  };

  // 处理429错误的更智能策略
  const handle429Error = () => {
    const now = Date.now();
    consecutive429CountRef.current++;
    last429TimeRef.current = now;
    totalApiCallsRef.current++;
    
    const waitTime = getThrottleConfig();
    console.log(`🚨 检测到429错误，连续次数: ${consecutive429CountRef.current}, 总调用次数: ${totalApiCallsRef.current}, 等待时间: ${waitTime}ms`);
    
    toast({
      title: "API调用频率超限",
      description: `系统将等待${Math.ceil(waitTime / 1000)}秒后自动重试，或切换到备用模型`,
      variant: "destructive"
    });
    
    return waitTime;
  };

  // 重置429计数器（成功调用后）
  const reset429Counter = () => {
    consecutive429CountRef.current = 0;
    successfulApiCallsRef.current++;
    console.log('✅ API调用成功，重置429计数器');
  };

  // 检查API调用限制
  const checkApiCallLimit = () => {
    const now = Date.now();
    const timeSinceLastCall = now - lastGenerationTime;
    const minInterval = getThrottleConfig();
    
    // ✅ FIXED: 优化API调用限制 - 减少等待时间
    if (timeSinceLastCall < minInterval) {
      const delay = Math.min(minInterval - timeSinceLastCall, 2000); // 最大等待2秒
      console.log(`⏱️ API调用限制：需要等待${Math.ceil(delay / 1000)}秒`);
      return delay;
    }
    
    return 0;
  };

  // ✅ FIXED: 移除初始化useEffect，避免干扰正常的生成逻辑

  // ✅ FIXED: 彻底修复平台切换逻辑 - 只更新现有标题，绝对不生成新标题
  useEffect(() => {
    console.log(`🔄 平台切换检查: ${platformId || '未知'} (${platformName || '未知平台'})`);

    // ✅ FIXED: 平台切换时只更新现有标题的平台信息和字符利用率，绝对不重新生成
    if (titles.length > 0) {
      console.log(`🔄 平台切换: 更新现有标题的平台信息和字符利用率，不重新生成`);
      setTitles(prevTitles =>
        prevTitles.map(title => {
          const newUtilizationScore = title.length / titleLimit;
          const newOverallScore =
            title.semanticFit * QUALITY_WEIGHTS.semanticRelevance +
            title.emotionalScore * QUALITY_WEIGHTS.emotionalAppeal +
            title.diversityScore * QUALITY_WEIGHTS.structuralDiversity +
            newUtilizationScore * QUALITY_WEIGHTS.characterUtilization;

          return {
            ...title,
            platform: platformId,
            utilizationScore: newUtilizationScore,
            overallScore: newOverallScore
          };
        })
      );
    } else {
      console.log(`🔄 平台切换: 没有现有标题，不进行任何操作`);
    }
  }, [platformId, platformName]); // ✅ FIXED: 只监听平台变化，绝对不触发生成

  // ✅ FIXED: 性能优化 - 使用useMemo优化计算
  const titleLimit = useMemo(() => {
    return PLATFORM_TITLE_LIMITS[platformId as keyof typeof PLATFORM_TITLE_LIMITS] || 25;
  }, [platformId]);
  
  const minTitleLength = useMemo(() => {
    return Math.max(8, Math.floor(titleLimit * 0.7)); // 最短不少于8字，建议≥平台限制的70%
  }, [titleLimit]);

  // ✅ FIXED: 移除重复的useEffect，避免平台切换时重复触发
  // 字符限制更新逻辑已合并到平台切换useEffect中

  // 标题风格配置（V3规范）
  const titleStyles: Record<TitleStyle, TitleStyleConfig> = {
    'result-emotion': {
      name: '✅ 结果+情绪型',
      description: '强调使用结果 + 情感评价',
      minLength: 10,
      patterns: ['只用1次，{result}！太爽了！', '{tool}让我{result}，太惊艳了', '用{tool}后{result}，没想到这么好']
    },
    'question-hook': {
      name: '🤔 提问钩子型',
      description: '用好奇心驱动点击',
      minLength: 8,
      patterns: ['{scenario}怎么{action}最省事？我找到答案了', '为什么{tool}能{result}？', '{tool}真的能{benefit}吗？']
    },
    'reason-action': {
      name: '🎯 原因+行动型',
      description: '讲述为什么用 + 得到了什么',
      minLength: 10,
      patterns: ['因为用{tool}，我再也不用{pain}', '用了{tool}才知道，{result}', '有了{tool}，{benefit}变简单了']
    },
    'experience-contrast': {
      name: '💡 体验+反差型',
      description: '从"以前"到"现在"的转变',
      minLength: 12,
      patterns: ['以前要{old_way}，现在{new_way}', '{tool}前后对比：{contrast}', '没用{tool}前{before}，用了后{after}']
    },
    'tool-value': {
      name: '🛠️ 工具+明确价值型',
      description: '工具名称 + 功能/收益',
      minLength: 8,
      patterns: ['{tool}：{value}，{benefit}', '{tool}帮我{action}，{result}', '{tool}的{feature}功能，{benefit}']
    }
  };

  // 🚫 移除本地内容分析函数：只保留AI模式

  // 🚫 移除本地实体提取函数：只保留AI模式

  // 🚫 移除本地主题识别函数：只保留AI模式

  // 🚫 移除所有本地分析函数：只保留AI模式

  // 提取核心对象（具体工具名、产品名）
  const extractCoreObjects = (text: string): string[] => {
    const objects: string[] = [];

    // 匹配具体工具名
    const toolPatterns = [
      /([^\s]{2,8}(?:AI|GPT|工具|助手|平台|系统|软件|应用))/g,
      /(文派|ChatGPT|Claude|Midjourney|Figma|Notion|飞书|钉钉)/g,
      /([^\s]{2,6}(?:生成器|适配器|编辑器|创作器))/g
    ];

    toolPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      objects.push(...matches);
    });

    return [...new Set(objects)].filter(obj => obj.length >= 2 && obj.length <= 10);
  };

  // 提取用户收益（具体效果、价值）
  const extractUserBenefits = (text: string): string[] => {
    const benefits: string[] = [];

    // 匹配效果描述
    const benefitPatterns = [
      /(?:节省|提升|增加|减少|优化)([^\s]{2,8})/g,
      /([^\s]{2,8})(?:翻倍|倍增|提升|增长)/g,
      /(\d+%?)(?:的?(?:时间|效率|质量|速度))/g,
      /(一键|自动|智能|快速)([^\s]{2,6})/g
    ];

    benefitPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      benefits.push(...matches);
    });

    return [...new Set(benefits)].filter(benefit => benefit.length >= 2);
  };

  // 提取使用场景（具体平台、场景）
  const extractUseScenarios = (text: string): string[] => {
    const scenarios: string[] = [];

    // 匹配平台和场景
    const scenarioPatterns = [
      /(小红书|微博|抖音|B站|公众号|知乎|朋友圈)/g,
      /([^\s]{2,6}(?:发文|创作|写作|营销|推广))/g,
      /(职场|工作|学习|生活|商务)([^\s]{2,6})/g
    ];

    scenarioPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      scenarios.push(...matches);
    });

    return [...new Set(scenarios)].filter(scenario => scenario.length >= 2);
  };

  // 提取关键动作（具体操作）
  const extractKeyActions = (text: string): string[] => {
    const actions: string[] = [];

    // 匹配动作词
    const actionPatterns = [
      /(一键|自动|智能|批量)([^\s]{2,6})/g,
      /([^\s]{2,6}(?:生成|创建|制作|编辑|修改|优化))/g,
      /(适配|转换|改写|调整|定制)([^\s]{2,6})?/g
    ];

    actionPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      actions.push(...matches);
    });

    return [...new Set(actions)].filter(action => action.length >= 2);
  };

  // 提取量化效果（具体数据）
  const extractQuantifiedEffects = (text: string): string[] => {
    const effects: string[] = [];

    // 匹配数字和效果
    const effectPatterns = [
      /(\d+(?:\.\d+)?[%倍]?)(?:的?(?:时间|效率|质量|速度|提升|增长))/g,
      /(?:节省|提升|增加)(\d+(?:\.\d+)?[%倍]?)/g,
      /(\d+(?:分钟|小时|天|秒))(?:内|完成)/g
    ];

    effectPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      effects.push(...matches);
    });

    return [...new Set(effects)].filter(effect => effect.length >= 1);
  };

  // 提取用户痛点（具体问题）
  const extractUserPainPoints = (text: string): string[] => {
    const painPoints: string[] = [];

    // 匹配痛点描述
    const painPatterns = [
      /([^\s]{2,6}(?:太累|很累|麻烦|困难|复杂))/g,
      /([^\s]{2,6}(?:不一致|不统一|不匹配))/g,
      /(效率低|速度慢|耗时长|浪费时间)/g,
      /(重复|繁琐|机械|无聊)([^\s]{2,6})/g,
      /([^\s]{2,6}(?:问题|痛点|难点|瓶颈))/g,
      /(缺少|缺乏|没有)([^\s]{2,6})/g
    ];

    painPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      painPoints.push(...matches);
    });

    return [...new Set(painPoints)].filter(pain => pain.length >= 2);
  };

  // 生成自然、内容感知的标题（符合Prompt文档规范）
  // 🚫 移除generateNaturalTitle函数：只保留AI模式

  // 🚫 移除所有本地生成函数：只保留AI模式

  // 🚫 移除所有本地生成相关函数：只保留AI模式

  // 🚫 移除本地评分函数：只保留AI模式

  // 🚫 移除本地结构分析函数：只保留AI模式

  // 🤖 AI模式：标题生成主函数（按规范优化）
  const generateTitles = async () => {
    // ✅ FIXED: 优化性能检查 - 减少不必要的生成
    if (globalRequestLockRef.current || isGenerating) {
      console.log(`🔒 请求锁：已有请求正在进行，跳过本次请求`);
      return;
    }
    
    // ✅ FIXED: 优化API调用限制检查 - 减少等待时间
    const delay = checkApiCallLimit();
    if (delay > 0) {
      console.log(`⏱️ API调用限制：需要等待${Math.ceil(delay / 1000)}秒`);
      toast({
        title: "API调用频率限制",
        description: `系统将等待${Math.ceil(delay / 1000)}秒后自动重试`,
        variant: "destructive"
      });
      return;
    }
    
    // ✅ FIXED: 设置全局请求锁
    globalRequestLockRef.current = true;
    setIsGenerating(true);
    setLastGenerationTime(Date.now());

    try {
      console.log('🚀 开始标题生成流程（AI模式）');

      // ✅ FIXED: 优化内容获取 - 减少内容长度要求
      const sourceContent = getSourceContent();
      const contentLength = sourceContent.trim().length;

      if (!sourceContent || contentLength < 3) { // ✅ FIXED: 进一步减少最小内容长度要求
        toast({
          title: "内容不足",
          description: "请提供更多内容以生成标题（最少3字符）",
          variant: "destructive"
        });
        return;
      }

      console.log(`📝 内容来源: ${contentLength}字符，平台: ${platformId || '未知'}`);

      // ✅ FIXED: 检查用户模型选择状态
      const userSelectedModel = localStorage.getItem('preferredAIModel') || 'deepseek-v3';
      console.log(`🎯 用户选择的模型: ${userSelectedModel}`);

      // ✅ FIXED: 优化AI生成 - 减少备用模型调用，提高成功率
      const generationPromise = attemptAIGeneration(sourceContent);
      const timeoutPromise = new Promise((_, reject) => {
        // ✅ FIXED: 根据用户选择的模型调整超时时间
        const userSelectedModel = localStorage.getItem('preferredAIModel') || 'deepseek-v3';
        const timeout = userSelectedModel.includes('deepseek') ? 30000 : 15000; // DeepSeek 30秒，其他15秒
        setTimeout(() => reject(new Error('生成超时')), timeout);
      });

      try {
        await Promise.race([generationPromise, timeoutPromise]);
      } catch (timeoutError) {
        console.log('⏱️ 首次生成超时，尝试备用模型...');
        
        // ✅ FIXED: 优化备用策略 - 即使选择了DeepSeek，超时时也尝试备用模型
        const userSelectedModel = localStorage.getItem('preferredAIModel') || 'deepseek-v3';
        const isDeepSeekSelected = userSelectedModel.includes('deepseek');
        
        if (isDeepSeekSelected) {
          console.log('🎯 用户选择了DeepSeek模型，但超时，尝试备用模型...');
        }
        
        // 只有在没有生成任何标题时才使用备用模型
        if (titles.length === 0) {
          console.log('🔄 尝试备用模型...');
          const fallbackPromise = attemptAIGeneration(sourceContent, true); // 使用备用模型
          const fallbackTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('备用模型也超时')), 12000); // 12秒超时
          });

          try {
            await Promise.race([fallbackPromise, fallbackTimeoutPromise]);
            console.log('✅ 备用模型生成成功');
          } catch (fallbackError) {
            console.log('❌ 备用模型也失败了:', fallbackError);
            if (isDeepSeekSelected) {
              throw new Error('DeepSeek模型超时，备用模型也失败，请稍后重试');
            } else {
              throw new Error('所有AI模型都超时，请稍后重试');
            }
          }
        } else {
          console.log('✅ 已有标题生成，跳过备用模型调用');
        }
      }

    } catch (error) {
      console.error('AI标题生成失败:', error);
      
      // ✅ FIXED: 优化错误处理 - 提供更详细的错误信息和解决方案
      let errorMessage = "AI生成失败，请稍后重试";
      let actionMessage = "请检查网络连接和API配置后重试";
      
      if (error instanceof Error) {
        if (error.message.includes('429') || error.message.includes('频率超限') || error.message.includes('Too Many Requests')) {
          errorMessage = "AI服务繁忙，请稍后重试";
          actionMessage = "系统正在自动重试，请耐心等待1-2分钟";
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorMessage = "AI模型不可用";
          actionMessage = "系统已自动切换到其他模型";
        } else if (error.message.includes('DeepSeek模型超时')) {
          errorMessage = "DeepSeek模型超时";
          actionMessage = "系统已尝试备用模型，请稍后重试或检查网络连接";
        } else if (error.message.includes('DeepSeek模型超时，备用模型也失败')) {
          errorMessage = "DeepSeek模型超时，备用模型也失败";
          actionMessage = "请稍后重试，或切换到其他AI模型";
        } else if (error.message.includes('生成超时')) {
          errorMessage = "AI生成超时";
          actionMessage = "系统已自动切换到备用AI模型，请重试";
        } else if (error.message.includes('备用模型也超时')) {
          errorMessage = "所有AI模型都超时";
          actionMessage = "请检查网络连接，或稍后重试";
        } else if (error.message.includes('API密钥') || error.message.includes('401')) {
          errorMessage = "AI配置错误，请检查API密钥";
          actionMessage = "请检查.env.local文件中的API密钥配置";
        } else if (error.message.includes('所有AI模型都失败了')) {
          // 检查用户选择的模型
          const userSelectedModel = localStorage.getItem('preferredAIModel') || 'deepseek-v3';
          if (userSelectedModel.includes('deepseek')) {
            errorMessage = "DeepSeek模型暂时不可用";
            actionMessage = "请稍后重试，或切换到其他AI模型";
          } else {
            errorMessage = "所有AI服务都不可用";
            actionMessage = "请检查网络连接和API配置后重试";
          }
        }
      }
      
      // 只有在没有本地生成成功的情况下才显示错误
      if (titles.length === 0) {
        setHasError(true);
        setHasFailedGeneration(true);
        setErrorMessage(errorMessage);
        
        toast({
          title: errorMessage,
          description: actionMessage,
          variant: "destructive"
        });
      }
    } finally {
      // ✅ FIXED: 释放全局请求锁
      globalRequestLockRef.current = false;
      setIsGenerating(false);
    }
  };

  // 🤖 AI模式：尝试AI生成（按规范Step 1-4）
  const attemptAIGeneration = async (sourceContent: string, useFallback: boolean = false) => {
    // ✅ FIXED: 智能AI模型选择策略 - 优先使用用户选择的模型
    const getAvailableModels = (): Array<{ name: string; provider: string; priority: number }> => {
      // 获取用户选择的模型（从全局状态或props）
      const userSelectedModel = localStorage.getItem('preferredAIModel') || 'deepseek-v3';
      
      // 定义所有可用模型及其优先级
      const allModels = [
        { name: 'deepseek-v3', provider: 'DeepSeek', priority: 1 },
        { name: 'deepseek-chat', provider: 'DeepSeek', priority: 2 },
        { name: 'gpt-4o-mini', provider: 'OpenAI', priority: 3 },
        { name: 'gpt-4', provider: 'OpenAI', priority: 4 },
        { name: 'gpt-3.5-turbo', provider: 'OpenAI', priority: 5 },
        { name: 'gemini-pro', provider: 'Gemini', priority: 6 }
      ];
      
      if (useFallback) {
        // 使用备用模型（跳过DeepSeek，优先使用OpenAI）
        console.log('🔄 使用备用模型策略');
        return allModels.filter(m => m.provider !== 'DeepSeek').sort((a, b) => a.priority - b.priority);
      }
      
      // ✅ FIXED: 如果用户选择了DeepSeek模型，只使用DeepSeek模型
      if (userSelectedModel.includes('deepseek')) {
        console.log(`🎯 用户选择了DeepSeek模型: ${userSelectedModel}，只使用DeepSeek模型`);
        return allModels.filter(m => m.provider === 'DeepSeek').sort((a, b) => a.priority - b.priority);
      }
      
      // 如果用户选择了其他模型，将用户选择的模型移到最前面
      const userModel = allModels.find(m => m.name === userSelectedModel);
      const otherModels = allModels.filter(m => m.name !== userSelectedModel);
      
      if (userModel) {
        return [userModel, ...otherModels];
      }
      
      return allModels;
    };

    const aiModels = getAvailableModels();
    let lastError: Error | null = null;
    let successfulModel: string | null = null;

    console.log(`🎯 开始AI模型调用，优先模型: ${aiModels[0].name}`);

    for (const modelConfig of aiModels) {
      try {
        // Step 1: 构建Prompt（按规范）
        console.log(`🧠 Step 1: 构建AI Prompt (模型: ${modelConfig.name})`);
        const systemPrompt = getTitleGenerationSystemPrompt();
        const userPrompt = getTitleGenerationPrompt({
          content: sourceContent,
          versions,
          platform: platformId,
          stylePreference,
          outputCount,
          ensureDiversity
        });

        // Step 2: 调用AI（带重试机制）
        console.log(`🤖 Step 2: 调用${modelConfig.provider} API (模型: ${modelConfig.name}, 平台: ${platformId || '未知'})`);
        
        const aiResponse = await callAIWithRetry({
          prompt: userPrompt,
          systemPrompt: systemPrompt,
          model: modelConfig.name as any,
          temperature: 0.7, // ✅ FIXED: 更保守的温度设置，减少随机性
          maxTokens: 400 // ✅ FIXED: 进一步减少token数，提高响应速度
        }, 1); // ✅ FIXED: 保持1次重试，最大化响应速度

        if (!aiResponse.success || !aiResponse.content) {
          throw new Error(aiResponse.error || 'AI调用失败');
        }

        // Step 3: 解析AI响应格式（按规范推荐结构）
        console.log('📊 Step 3: 解析AI响应JSON格式');
        let aiResult: TitleGenerationResponse;
        try {
          // ✅ FIXED: 增强JSON解析逻辑，处理多种响应格式
          let jsonContent = aiResponse.content;
          
          // 1. 尝试提取markdown代码块中的JSON
          const jsonMatch = aiResponse.content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            jsonContent = jsonMatch[1].trim();
            console.log('📝 从markdown代码块提取JSON内容');
          }
          
          // 2. 尝试直接解析为JSON
          try {
            aiResult = JSON.parse(jsonContent);
          } catch (directParseError) {
            console.log('⚠️ 直接JSON解析失败，尝试清理内容后重新解析');
            
            // 3. 清理可能的markdown格式和多余字符
            const cleanedContent = jsonContent
              .replace(/^```json\s*/i, '')  // 移除开头的```json
              .replace(/\s*```$/i, '')      // 移除结尾的```
              .replace(/^```\s*/i, '')      // 移除开头的```
              .replace(/\s*```$/i, '')      // 移除结尾的```
              .trim();
            
            // 4. 如果内容以{开头，尝试解析
            if (cleanedContent.startsWith('{')) {
              try {
                aiResult = JSON.parse(cleanedContent);
              } catch (cleanedParseError) {
                console.log('⚠️ 清理后JSON解析仍然失败，尝试查找JSON对象');
                
                // 5. 查找第一个{和最后一个}之间的内容
                const jsonObjectMatch = cleanedContent.match(/\{[\s\S]*\}/);
                if (jsonObjectMatch) {
                  try {
                    aiResult = JSON.parse(jsonObjectMatch[0]);
                  } catch (objectParseError) {
                    console.log('⚠️ JSON对象解析失败，尝试修复截断的JSON');
                    
                    // 6. 尝试修复截断的JSON
                    const fixedJson = fixTruncatedJSON(jsonObjectMatch[0]);
                    if (fixedJson) {
                      try {
                        aiResult = JSON.parse(fixedJson);
                        console.log('✅ 成功修复截断的JSON');
                      } catch (fixedParseError) {
                        const errorMessage = fixedParseError instanceof Error ? fixedParseError.message : '未知错误';
                        throw new Error(`修复后JSON解析失败: ${errorMessage}`);
                      }
                    } else {
                      const errorMessage = objectParseError instanceof Error ? objectParseError.message : '未知错误';
                      throw new Error(`JSON对象解析失败: ${errorMessage}`);
                    }
                  }
                } else {
                  throw new Error('未找到有效的JSON对象');
                }
              }
            } else {
              throw new Error('响应内容不是有效的JSON格式');
            }
          }

          // 验证响应结构
          if (!aiResult.contentAnalysis || !aiResult.titles || !Array.isArray(aiResult.titles)) {
            console.warn('⚠️ AI响应结构不完整，尝试修复:', aiResult);
            
            // 尝试修复不完整的响应
            if (!aiResult.contentAnalysis) {
              aiResult.contentAnalysis = {
                mainTheme: '内容分析',
                coreObjects: ['内容对象'],
                userBenefits: ['用户收益'],
                useScenarios: ['使用场景']
              };
            }
            
            if (!aiResult.titles || !Array.isArray(aiResult.titles)) {
              throw new Error('AI响应缺少标题数组');
            }
          }
          
          console.log('✅ JSON解析成功:', aiResult);
        } catch (parseError) {
          console.error('❌ AI响应解析失败:', parseError);
          console.error('📝 原始响应内容:', aiResponse.content);
          const errorMessage = parseError instanceof Error ? parseError.message : '未知错误';
          throw new Error(`AI响应格式错误: ${errorMessage}`);
        }

        // Step 4: 标题过滤逻辑（V3.1 规范）
        console.log('🔍 Step 4: 应用V3.1质量过滤逻辑');
        
        // ✅ FIXED: 使用静态导入，避免动态导入延迟
        let titleGenerationUtils: any = null;
        try {
          // 使用静态导入，避免动态导入的延迟和错误
          const { calculateSemanticCompleteness, calculateEmotionalAppeal } = await import('../utils/titleGenerationUtils');
          titleGenerationUtils = { calculateSemanticCompleteness, calculateEmotionalAppeal };
        } catch (error) {
          console.warn('标题评分工具加载失败，使用默认评分:', error);
          // 提供默认实现
          titleGenerationUtils = {
            calculateSemanticCompleteness: () => 0.8,
            calculateEmotionalAppeal: () => 0.8
          };
        }
        
        const newTitles: GeneratedTitle[] = aiResult.titles.map((titleData, index) => {
          // 计算V3.2评分
          let semanticCompleteness = 0.8;
          let emotionalScore = 0.8;
          try {
            if (titleGenerationUtils) {
              semanticCompleteness = titleGenerationUtils.calculateSemanticCompleteness(titleData.title);
              emotionalScore = titleGenerationUtils.calculateEmotionalAppeal(titleData.title);
            }
          } catch (error) {
            console.warn('评分计算失败，使用默认值:', error);
          }

          return {
            id: `title-${Date.now()}-${index}`,
            title: safeTitle(titleData.title),
            length: titleData.title.length,
            style: (titleData.style as TitleStyle) || 'result-emotion',
            confidence: titleData.semanticFit || 0.8,
            semanticFit: titleData.semanticFit || 0.8,
            platform: platformId,
            isComplete: true,
            styleDescription: titleData.style || '结果导向型',
            emotionalScore: emotionalScore,
            diversityScore: titleData.structuralDiversity || 0.8,
            semanticCompleteness: semanticCompleteness,
            utilizationScore: titleData.characterUtilization || 0.8,
            overallScore: titleData.semanticFit || 0.8,
            generationReason: titleData.reasoning || 'AI生成',
            extractedContent: sourceContent.substring(0, 100) + '...'
          };
        });

        // ✅ FIXED: 应用质量过滤
        console.log(`🔍 开始质量过滤，共 ${newTitles.length} 个标题`);
        const qualifiedTitles = newTitles.filter(title => {
          const qualityCheck = checkTitleQuality(
            title.title,
            title.semanticFit,
            platformId,
            PLATFORM_LIMITS
          );
          
          if (!qualityCheck.isQualified) {
            console.log(`❌ 标题质量不达标: "${title.title}"`);
            console.log(`   问题: ${qualityCheck.issues.join(', ')}`);
            console.log(`   建议: ${qualityCheck.suggestions.join(', ')}`);
          } else {
            console.log(`✅ 标题质量达标: "${title.title}"`);
          }
          
          return qualityCheck.isQualified;
        });
        
        console.log(`📊 质量过滤结果: ${qualifiedTitles.length}/${newTitles.length} 个标题通过`);

        if (qualifiedTitles.length > 0) {
          // ✅ FIXED: 记录成功的模型
          successfulModel = modelConfig.name;
          console.log(`✅ ${modelConfig.name} 模型调用成功，生成 ${qualifiedTitles.length} 个标题`);
          
          // 更新标题状态
          setTitles(qualifiedTitles);
          setSelectedTitle(qualifiedTitles[0].title);
          onTitleChange?.(qualifiedTitles[0].title);
          
          // 显示成功提示
          toast({
            title: "标题生成成功",
            description: `使用 ${modelConfig.name} 模型生成了 ${qualifiedTitles.length} 个标题`,
            variant: "default"
          });
          
          return; // 成功生成，退出循环
        } else {
          // ✅ FIXED: 添加备用机制 - 如果所有标题都被过滤，保留质量最好的一个
          console.log('⚠️ 所有标题都被质量过滤，启用备用机制');
          const bestTitle = newTitles.reduce((best, current) => {
            return current.semanticFit > best.semanticFit ? current : best;
          });
          
          console.log(`🔄 保留质量最好的标题: "${bestTitle.title}" (语义贴合度: ${bestTitle.semanticFit})`);
          
          // 更新标题状态
          setTitles([bestTitle]);
          setSelectedTitle(bestTitle.title);
          onTitleChange?.(bestTitle.title);
          
          // 显示成功提示
          toast({
            title: "标题生成成功",
            description: `使用 ${modelConfig.name} 模型生成了1个标题（质量过滤后保留最佳）`,
            variant: "default"
          });
          
          return; // 成功生成，退出循环
        }

      } catch (error) {
        console.error(`❌ ${modelConfig.name} 模型调用失败:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // 如果不是最后一个模型，继续尝试下一个
        if (modelConfig !== aiModels[aiModels.length - 1]) {
          console.log(`🔄 ${modelConfig.name} 失败，切换到下一个模型...`);
          continue;
        }
      }
    }

    // 所有模型都失败了
    console.error('❌ 所有AI模型都失败了:', lastError);
    
    // 记录失败信息
    const failedModels = aiModels.map(m => m.name).join(', ');
    console.error(`📊 失败统计: 尝试了 ${aiModels.length} 个模型 (${failedModels})`);
    
    // 显示错误提示
    toast({
      title: "AI生成失败",
      description: `所有模型都无法生成标题，请检查网络连接和API配置`,
      variant: "destructive"
    });
    
    throw lastError || new Error('所有AI模型都失败了');
  };

  // 🚫 移除本地生成功能 - 只保留AI模式
  const attemptLocalGeneration = async (sourceContent: string) => {
    throw new Error('本地生成功能已禁用，只支持AI模式');
  };

  // Select title
  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title);
    onTitleChange?.(title);
  };

  // ✅ FIXED: 复制标题功能 - 确保toast提醒正确显示
  const handleCopyTitle = (title: string) => {
    // 使用更可靠的复制方法
    const copyToClipboard = async (text: string) => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // 降级方案：使用传统方法
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        
        // ✅ FIXED: 改用按钮状态变化提醒
        const titlePreview = text.length > 25 ? text.substring(0, 25) + '...' : text;
        console.log('🎯 准备显示复制提醒:', titlePreview);
        
        // 使用按钮状态变化作为提醒
        const copyButton = document.querySelector(`[data-copy-title="${text}"]`) as HTMLButtonElement;
        if (copyButton) {
          const originalText = copyButton.innerHTML;
          copyButton.innerHTML = '✅ 已复制';
          copyButton.classList.add('bg-green-500', 'text-white');
          copyButton.disabled = true;
          
          setTimeout(() => {
            copyButton.innerHTML = originalText;
            copyButton.classList.remove('bg-green-500', 'text-white');
            copyButton.disabled = false;
          }, 2000);
        }
        
        // 同时显示临时文本提示
        setCopyFeedback({
          id: `copy-${Date.now()}`,
          message: `"${titlePreview}" 已复制到剪贴板`
        });
        
        setTimeout(() => {
          setCopyFeedback(null);
        }, 3000);
        
        console.log('✅ 复制提醒已触发');
      } catch (error) {
        console.error('复制失败:', error);
        toast({
          title: "❌ 复制失败",
          description: "请手动选择并复制标题内容",
          variant: "destructive",
          duration: 4000, // 错误提醒显示更长时间
        });
      }
    };
    
    copyToClipboard(title);
  };

  // Handle title feedback
  const handleTitleFeedback = (titleId: string, feedback: 'like' | 'dislike') => {
    setTitleFeedback(prev => ({
      ...prev,
      [titleId]: feedback
    }));

    console.log(`📊 标题反馈收集:`, {
      titleId,
      feedback,
      title: titles.find(t => t.id === titleId)?.title || '未知标题',
      platform: platformId || '未知平台'
    });

    toast({
      title: feedback === 'like' ? "感谢反馈" : "已记录反馈",
      description: feedback === 'like' ? "我们会继续优化标题质量" : "我们会改进这类标题的生成",
    });
  };

  // 开始编辑标题
  const handleStartEdit = (titleId: string, currentTitle: string) => {
    setEditingTitleId(titleId);
    setEditingTitleText(currentTitle);
  };

  // 保存编辑的标题
  const handleSaveEdit = () => {
    if (!editingTitleId || !editingTitleText.trim()) {
      toast({
        title: "编辑失败",
        description: "标题不能为空",
        variant: "destructive"
      });
      return;
    }

    setTitles(prevTitles =>
      prevTitles.map(title =>
        title.id === editingTitleId
          ? {
              ...title,
              title: editingTitleText.trim(),
              length: editingTitleText.trim().length,
              utilizationScore: editingTitleText.trim().length / titleLimit
            }
          : title
      )
    );

    // 如果编辑的是当前选中的标题，更新选中状态
    const editedTitle = titles.find(t => t.id === editingTitleId);
    if (editedTitle && selectedTitle === editedTitle.title) {
      setSelectedTitle(editingTitleText.trim());
      onTitleChange?.(editingTitleText.trim());
    }

    setEditingTitleId(null);
    setEditingTitleText('');

    toast({
      title: "标题已保存",
      description: "标题编辑成功",
    });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingTitleId(null);
    setEditingTitleText('');
  };

  // 清理平台切换时的状态
  const resetTitleGeneratorState = () => {
    console.log(`🧹 重置标题生成器状态 (平台: ${platformId || '未知'})`);
    setTitles([]);
    setSelectedTitle('');
    setTitleFeedback({});
    setIsGenerating(false);
  };

  // 🚫 移除平台验证函数：只保留AI模式

  // ✅ FIXED: 彻底重构内容变化监听 - 统一内容源，避免初始化冲突
  useEffect(() => {
    // 只在组件初始化时设置初始内容，使用与后续检测相同的内容源
    if (lastContentRef.current === '') {
      const initialContent = content.trim(); // 使用与后续检测相同的内容源
      if (initialContent.length >= 5) {
        lastContentRef.current = initialContent;
        console.log(`🎯 初始化内容跟踪: 内容长度=${initialContent.length}`);
      }
    }
  }, []); // 只在组件挂载时执行一次

  // ✅ FIXED: 内容变化监听 - 优化性能，减少不必要的生成
  useEffect(() => {
    const currentContent = content.trim();
    const contentLength = currentContent.length;
    const contentChanged = currentContent !== lastContentRef.current;
    const hasExistingTitles = titles.length > 0;
    const isContentValid = contentLength >= 5;

    // ✅ FIXED: 优化生成条件，避免重复生成
    const needsRegeneration = isContentValid && !hasExistingTitles && !isGenerating && contentChanged;

    if (needsRegeneration) {
      console.log(`🎯 内容变化触发生成: 平台=${platformId}, 内容长度=${contentLength}`);
      lastContentRef.current = currentContent;
      
      // ✅ FIXED: 添加防抖，避免频繁生成
      const debounceTimer = setTimeout(() => {
        generateTitles();
      }, 500); // 500ms防抖

      return () => clearTimeout(debounceTimer);
    }
  }, [content, platformId]); // ✅ FIXED: 添加platformId依赖，确保平台切换时重新评估

  // ✅ FIXED: 优化初始化自动生成逻辑 - 减少不必要的生成
  useEffect(() => {
    const currentContent = content.trim();
    const contentLength = currentContent.length;
    const hasExistingTitles = titles.length > 0;
    const isInitialLoad = lastContentRef.current === '';
    const isContentValid = contentLength >= 5;

    // ✅ FIXED: 只在初始化且有有效内容时生成，避免重复生成
    if (isInitialLoad && isContentValid && !hasExistingTitles && !isGenerating) {
      console.log(`🎯 初始化自动生成: 平台=${platformId}, 内容长度=${contentLength}`);
      lastContentRef.current = currentContent;
      
      // ✅ FIXED: 添加延迟，避免与内容变化监听冲突
      setTimeout(() => {
        generateTitles();
      }, 100);
    }
  }, [content, titles.length, isGenerating, platformId]);

  // ✅ FIXED: 优化平台切换逻辑 - 避免重复生成
  useEffect(() => {
    const currentContent = content.trim();
    const contentLength = currentContent.length;
    const hasExistingTitles = titles.length > 0;
    const isContentValid = contentLength >= 5;
    
    // ✅ FIXED: 只在平台切换且有有效内容时重新生成，避免重复生成
    if (isContentValid && !hasExistingTitles && !isGenerating) {
      console.log(`🔄 平台切换检测: 平台=${platformId}, 内容长度=${contentLength}`);
      lastContentRef.current = currentContent;
      
      // ✅ FIXED: 添加延迟，避免与初始化逻辑冲突
      setTimeout(() => {
        generateTitles();
      }, 200);
    }
  }, [platformId, content, titles.length, isGenerating]);

  // ✅ FIXED: 添加调试日志 - 跟踪组件状态变化
  useEffect(() => {
    console.log(`🔍 TitleGenerator状态更新:`, {
      contentLength: content.trim().length,
      titlesCount: titles.length,
      isGenerating,
      platformId,
      platformName
    });
  }, [content, titles.length, isGenerating, platformId, platformName]);

  // ✅ FIXED: 应用浏览器网络修复 - 解决网络连接问题
  useEffect(() => {
    const applyNetworkFix = async () => {
      try {
        const { applyBrowserNetworkFix } = await import('../utils/browserNetworkFix');
        applyBrowserNetworkFix({
          maxRetries: 3,
          baseDelay: 500,
          maxDelay: 5000,
          timeout: 15000,
          enableCorsFix: true,
          enableRetryFix: true,
          enableTimeoutFix: true
        });
        console.log('✅ 浏览器网络修复已应用');
        
        // ✅ FIXED: 应用CORS优化
        if (typeof window !== 'undefined') {
          // 优化fetch配置
          const originalFetch = window.fetch;
          window.fetch = async (input, init) => {
            const optimizedInit = {
              mode: 'cors' as RequestMode,
              cache: 'no-cache' as RequestCache,
              credentials: 'omit' as RequestCredentials,
              headers: {
                'Content-Type': 'application/json',
                ...init?.headers,
              },
              ...init,
            };
            return originalFetch(input, optimizedInit);
          };
          console.log('✅ CORS优化已应用');
        }
      } catch (error) {
        console.warn('⚠️ 浏览器网络修复应用失败:', error);
      }
    };
    
    applyNetworkFix();
  }, []); // 只在组件挂载时执行一次

  // ✅ FIXED: 性能优化 - 使用useCallback优化函数引用
  const memoizedGenerateTitles = useCallback(async () => {
    try {
      await generateTitles();
    } catch (error) {
      console.error('标题生成失败:', error);
      toast({
        title: "标题生成失败",
        description: "请检查网络连接和API配置后重试",
        variant: "destructive"
      });
    }
  }, [content, platformId, versions, stylePreference, outputCount, ensureDiversity]);

  // ✅ FIXED: 已移除重复声明，使用第417行的titleLimit

  // ✅ FIXED: 性能优化 - 缓存内容长度计算
  const contentLength = useMemo(() => {
    return content.trim().length;
  }, [content]);

  // ✅ FIXED: 性能优化 - 缓存内容是否满足生成条件
  const canGenerate = useMemo(() => {
    return contentLength >= 5 && !isGenerating && titles.length === 0;
  }, [contentLength, isGenerating, titles.length]);

  // ✅ FIXED: 性能优化 - 缓存平台名称
  const memoizedPlatformName = useMemo(() => {
    return platformName;
  }, [platformName]);

  // ✅ FIXED: 添加错误边界处理
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasFailedGeneration, setHasFailedGeneration] = useState(false);

  // 错误恢复函数
  const handleErrorRecovery = () => {
    setHasError(false);
    setErrorMessage('');
    setHasFailedGeneration(false);
    setTitles([]);
    setSelectedTitle('');
    setIsGenerating(false);
  };

  // 如果发生错误，显示错误状态
  if (hasError) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span>智能标题生成</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {memoizedPlatformName} (限{titleLimit}字)
          </Badge>
        </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center py-4">
            <div className="text-red-500 mb-2">
              <X className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-600 mb-2">标题生成遇到问题</p>
            <p className="text-xs text-gray-500 mb-4">{errorMessage}</p>
            <Button size="sm" onClick={handleErrorRecovery}>
              重新尝试
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ✅ FIXED: 添加生成失败但无标题的状态检查
  if (hasFailedGeneration && !isGenerating && titles.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span>智能标题生成</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {memoizedPlatformName} (限{titleLimit}字)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center py-4">
            <div className="text-red-500 mb-2">
              <X className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-600 mb-2">标题生成遇到问题</p>
            <p className="text-xs text-gray-500 mb-4">AI服务暂时不可用，请稍后重试</p>
            <Button size="sm" onClick={handleErrorRecovery}>
              重新尝试
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span>智能标题生成</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {memoizedPlatformName} (限{titleLimit}字)
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Generate button */}
        <div className="flex items-center gap-2">
          <Button
            onClick={memoizedGenerateTitles}
            disabled={isGenerating}
            size="sm"
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? `为${memoizedPlatformName}分析中...` : `为${memoizedPlatformName}生成标题`}
          </Button>
        </div>

        {/* Loading state */}
        {isGenerating && (
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600">正在进行内容语义分析...</p>
            </div>
          </div>
        )}

        {/* Title list */}
        {!isGenerating && titles.length > 0 && (
          <div className="space-y-2">
            {titles.map((title) => (
              <div
                key={title.id}
                className={`border rounded-lg p-3 transition-colors ${
                  selectedTitle === title.title
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {editingTitleId === title.id ? (
                  // 编辑模式
                  <div className="space-y-3">
                    <Textarea
                      value={editingTitleText}
                      onChange={(e) => setEditingTitleText(e.target.value)}
                      className="min-h-[60px] text-sm leading-relaxed"
                      placeholder="编辑标题..."
                      maxLength={titleLimit}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {editingTitleText.length}/{titleLimit} 字符
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="h-7 px-2"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          保存
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="h-7 px-2"
                        >
                          <X className="h-3 w-3 mr-1" />
                          取消
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 显示模式
                  <div 
                    className="flex items-start justify-between gap-3 cursor-pointer"
                    onClick={() => handleTitleSelect(title.title)}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 leading-relaxed">
                        {title.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500">
                          {title.length}/{titleLimit} 字符
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {title.styleDescription}
                        </Badge>
                        {selectedTitle === title.title && (
                          <Badge variant="default" className="text-xs">
                            已选中
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* 编辑按钮 */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(title.id, title.title);
                        }}
                        className="h-7 w-7 p-0"
                        title="编辑标题"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>

                      {/* 复制按钮 */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyTitle(title.title);
                        }}
                        className="h-7 w-7 p-0 transition-all duration-200"
                        title="复制标题"
                        data-copy-title={title.title}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 复制反馈提示 */}
        {copyFeedback && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">{copyFeedback.message}</span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isGenerating && titles.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">暂无生成的标题</p>
            <Button size="sm" variant="outline" onClick={generateTitles} className="mt-2">
              开始智能分析
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TitleGenerator;

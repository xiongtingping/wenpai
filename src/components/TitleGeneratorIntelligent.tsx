// @ts-nocheck
// DEPRECATED: This file has syntax errors and is not currently used
// TODO: Fix or remove this component
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
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
import { V3_3_TITLE_SCORE_WEIGHTS } from '@/score/titleScoreWeights';
import { logger } from '@/utils/logger';

// ✅ FIXED: 添加JSON修复函数，处理AI响应截断问题
/**
 * {t('titleGenerator.jsonFix.fixTruncatedJson')}
 * @param truncatedJson 截断的JSON字符串
 * @returns 修复后的JSON字符串，如果无法修复则返回null
 */
const fixTruncatedJSON = (truncatedJson: string): string | null => {
  try {
    // {t('titleGenerator.jsonFix.alreadyValidJson')}
    JSON.parse(truncatedJson);
    return truncatedJson;
  } catch (error) {
    logger.debug('🔧', t('titleGenerator.logs.fixingJson'));
  }

  // {t('titleGenerator.jsonFix.findLastCompleteObject')}
  let fixedJson = truncatedJson;
  
  // 1. {t('titleGenerator.jsonFix.fixUnclosedString')}
  const openQuotes = (fixedJson.match(/"/g) || []).length;
  if (openQuotes % 2 !== 0) {
    // {t('titleGenerator.jsonFix.findLastUnclosedQuote')}
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

  // 2. {t('titleGenerator.jsonFix.fixUnclosedArray')}
  const openBrackets = (fixedJson.match(/\[/g) || []).length;
  const closeBrackets = (fixedJson.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) {
    const missingBrackets = openBrackets - closeBrackets;
    fixedJson += ']'.repeat(missingBrackets);
  }

  // 3. {t('titleGenerator.jsonFix.fixUnclosedObject')}
  const openBraces = (fixedJson.match(/\{/g) || []).length;
  const closeBraces = (fixedJson.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    const missingBraces = openBraces - closeBraces;
    fixedJson += '}'.repeat(missingBraces);
  }
  
  // 检查并修复多余的逗号
  if (fixedJson.endsWith(',}')) {
    fixedJson = fixedJson.slice(0, -1);
  }

  // 5. {t('titleGenerator.jsonFix.fixIncompleteProperty')}
  const lastCommaIndex = fixedJson.lastIndexOf(',');
  const lastBraceIndex = fixedJson.lastIndexOf('}');
  if (lastCommaIndex > lastBraceIndex && lastBraceIndex !== -1) {
    // {t('titleGenerator.jsonFix.removeLastComma')}
    fixedJson = fixedJson.substring(0, lastCommaIndex) + fixedJson.substring(lastCommaIndex + 1);
  }

  // 6. {t('titleGenerator.jsonFix.validateFixedJson')}
  try {
    JSON.parse(fixedJson);
    logger.debug();
    return fixedJson;
  } catch (error) {
    console.log(t('components.error.JSON修复_q40'));
    
    // 7. {t('titleGenerator.jsonFix.aggressiveFix')}
    const lastCompleteObjectMatch = fixedJson.match(/\{[^{}]*\}/g);
    if (lastCompleteObjectMatch && lastCompleteObjectMatch.length > 0) {
      const lastCompleteObject = lastCompleteObjectMatch[lastCompleteObjectMatch.length - 1];
      try {
        JSON.parse(lastCompleteObject);
        logger.debug('✅ 使用最后一个完整对象');
        return lastCompleteObject;
      } catch (error) {
        // {t('titleGenerator.jsonFix.continueOtherFixes')}
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
            logger.debug();
            return minimalJson;
          } catch (error) {
            console.log(t('components.error.最小JSON_3lo'));
          }
        }
      }
    }

    console.log('所有JSON修复方法都失败了，语义贴合度不足60%');
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
    issues.push();
    suggestions.push();
  }

  // ✅ FIXED: 优化空泛检查 - 减少过于严格的限制
  const genericWords = ['AI真强', '神器推荐']; // 移除'这个工具', '很好用'等
  if (genericWords.some(word => title.includes(word))) {
    issues.push('标题过于空泛');
    suggestions.push('使用具体的产品名称和明确价值主张');
  }

  // ✅ FIXED: 新增基础质量检查 - 确保标题有基本内容
  if (title.trim().length < 3) {
    issues.push('标题内容过短');
    suggestions.push('增加标题内容长度');
  }
  
  return { issues, suggestions };
}

// 标题生成器配置类型
interface TitleGeneratorConfig {
  mode: 'standard' | 'creative';
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
}

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

  const { toast } = useToast();
  const { t } = useTranslation();

  // ✅ FIXED: 标题生成兜底增强，彻底杜绝空字符串和"暂无生成的标题"
  // 
  const safeTitle = (title: string) => {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return ;
    }
    return title.trim();
  };

  // 🔄 标准化{t('titleGenerator.generation.contentSource')}获取函数（符合规范）
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
  const lastContentRef = useRef<string>('$🚨 检测到429错误，连续次数: ${consecutive429CountRef.current}, 总调用次数: ${totalApiCallsRef.current}, 等待时间: ${waitTime}ms');
    
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
    logger.debug('✅ API调用成功，重置429计数器');
  };

  // 检查API调用限制
  const checkApiCallLimit = () => {
    const now = Date.now();
    const timeSinceLastCall = now - lastGenerationTime;
    const minInterval = getThrottleConfig();
    
    // ✅ FIXED: 优化API调用限制 - 减少等待时间
    if (timeSinceLastCall < minInterval) {
      const delay = Math.min(minInterval - timeSinceLastCall, 2000); // 最大等待2秒
      console.log(`⏱️ API调用限制：需要等待${Math.ceil(delay / 1000)}秒$🔄 平台切换检查: ${platformId || '未知'} (${platformName || '未知平台'})`);

    // ✅ FIXED: 平台切换时只更新现有标题的平台信息和字符利用率，绝对不重新生成
    if (titles.length > 0) {
      console.log(t('components.title.平台切换_1gs'));
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
      console.log('平台切换失败');
    }
  };

  // 标题样式配置
  const titleStyleConfigs = {
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
      logger.system('🚀 开始标题生成流程（AI模式）');

      // ✅ FIXED: 优化内容获取 - 减少内容长度要求
      const sourceContent = getSourceContent();
      const contentLength = sourceContent.trim().length;

      if (!sourceContent || contentLength < 3) { // ✅ FIXED: 进一步减少最小内容长度要求
        toast({
          title: t('components.labels.内容不足'),
          description: "请提供更多内容以生成标题（最少3字符）",
          variant: "destructive"
        });
        return;
      }

      console.log(`📝 {t('titleGenerator.generation.contentSource')}: ${contentLength}字符，平台: ${platformId || '未知'}`);

      // ✅ FIXED: 检查用户模型选择状态
      const userSelectedModel = localStorage.getItem('preferredAIModel') || 'deepseek-v3';
      console.log(`🎯 {t('titleGenerator.generation.userSelectedModel')}: ${userSelectedModel}`);

      // ✅ FIXED: {t('titleGenerator.generation.optimizeAiGeneration')}
      const generationPromise = attemptAIGeneration(sourceContent);
      const timeoutPromise = new Promise((_, reject) => {
        // ✅ FIXED: 根据{t('titleGenerator.generation.userSelectedModel')}调整超时时间
        const userSelectedModel = localStorage.getItem('preferredAIModel') || 'deepseek-v3';
        const timeout = userSelectedModel.includes('deepseek') ? 30000 : 15000; // DeepSeek 30秒，其他15秒
        setTimeout(() => reject(new Error(t('components.errors.生成超时'))), timeout);
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
            setTimeout(() => reject(new Error(t('components.errors.备用模型也超时'))), 12000); // 12秒超时
          });

          try {
            await Promise.race([fallbackPromise, fallbackTimeoutPromise]);
            logger.debug();
          } catch (fallbackError) {
            console.log(t('components.error.备用模型也失_3n5'), fallbackError);
            if (isDeepSeekSelected) {
              throw new Error();
            } else {
              throw new Error('所有AI模型都超时，请稍后重试');
            }
          }
        } else {
          logger.debug('✅ 已有标题生成，跳过备用模型调用');
        }
      }

    } catch (error) {
      console.error(t('components.error.AI标题生成失败_ccs'), error);
      
      // ✅ FIXED: 优化错误处理 - 提供更详细的错误信息和解决方案
      let errorMessage = "AI生成失败，请稍后重试";
      let actionMessage = "请检查网络连接和API配置后重试";
      
      if (error instanceof Error) {
        if (error.message.includes('429') || error.message.includes(t('components.errors.频率超限')) || error.message.includes('Too Many Requests')) {
          errorMessage = "AI服务繁忙，请稍后重试";
          actionMessage = "系统正在自动重试，请耐心等待1-2分钟";
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorMessage = "AI模型不可用";
          actionMessage = t('components.messages.系统已自动切换到其他模型');
        } else if (error.message.includes('DeepSeek模型超时')) {
          errorMessage = "DeepSeek模型超时";
          actionMessage = "系统已尝试备用模型，请稍后重试或检查网络连接";
        } else if (error.message.includes('模型不可用')) {
          errorMessage = "AI模型暂时不可用";
          actionMessage = "请稍后重试，或切换到其他AI模型";
        } else if (error.message.includes(t('components.errors.生成超时'))) {
          errorMessage = "AI生成超时";
          actionMessage = "系统已自动切换到备用AI模型，请重试";
        } else if (error.message.includes(t('components.errors.备用模型也超时'))) {
          errorMessage = "所有AI模型都超时";
          actionMessage = "请检查网络连接，或稍后重试";
        } else if (error.message.includes('API密钥') || error.message.includes('401')) {
          errorMessage = "API密钥配置错误";
          actionMessage = "请检查.env.local文件中的API密钥配置";
        } else if (error.message.includes('网络错误')) {
          // 检查{t('titleGenerator.generation.userSelectedModel')}
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
    } finally {
      // ✅ FIXED: 释放全局请求锁
      globalRequestLockRef.current = false;
      setIsGenerating(false);
    }
  };

  // 🤖 AI模式：尝试AI生成（按规范Step 1-4）
  const attemptAIGeneration = async (sourceContent: string, useFallback: boolean = false) => {
    // ✅ FIXED: 智能AI模型选择策略 - 优先使用{t('titleGenerator.generation.userSelectedModel')}
    const getAvailableModels = (): Array<{ name: string; provider: string; priority: number }> => {
      // 获取{t('titleGenerator.generation.userSelectedModel')}（从全局状态或props）
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
      
      // 如果用户选择了其他模型，将{t('titleGenerator.generation.userSelectedModel')}移到最前面
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
        console.log(`🧠 Step 1: {t('titleGenerator.generation.buildAiPrompt')} (模型: ${modelConfig.name})`);
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
          temperature: 0.7, // ✅ FIXED: {t('titleGenerator.generation.conservativeTemperature')}
          maxTokens: 400 // ✅ FIXED: {t('titleGenerator.generation.reduceTokens')}
        }, 1); // ✅ FIXED: {t('titleGenerator.generation.keepOneRetry')}

        if (!aiResponse.success || !aiResponse.content) {
          throw new Error(aiResponse.error || $);
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
            console.log(t('components.error.直接JSO_5o1'));
            
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
                console.log(t('components.error.清理后JS_evt'));
                
                // 5. 查找第一个{和最后一个}之间的内容
                const jsonObjectMatch = cleanedContent.match(/\{[\s\S]*\}/);
                if (jsonObjectMatch) {
                  try {
                    aiResult = JSON.parse(jsonObjectMatch[0]);
                  } catch (objectParseError) {
                    console.log(t('components.error.JSON对_0j2'));
                    
                    // 6. 尝试修复截断的JSON
                    const fixedJson = fixTruncatedJSON(jsonObjectMatch[0]);
                    if (fixedJson) {
                      try {
                        aiResult = JSON.parse(fixedJson);
                        logger.debug('✅ 成功修复截断的JSON');
                      } catch (fixedParseError) {
                        const errorMessage = fixedParseError instanceof Error ? fixedParseError.message : t();
                        throw new Error();
                      }
                    } else {
                      const errorMessage = objectParseError instanceof Error ? objectParseError.message : t();
                      throw new Error();
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
              throw new Error();
            }
          }
          
          logger.debug('AI结果:', aiResult);
        } catch (parseError) {
          console.error(t('components.error.AI响应解析_oji'), parseError);
          console.error('📝 原始响应内容:', aiResponse.content);
          const errorMessage = parseError instanceof Error ? parseError.message : '解析错误';
          throw new Error('🔍 Step 4: 应用V3.1质量过滤逻辑');
        
        // 已删除标题评分工具，使用简化评分
        
        const newTitles: GeneratedTitle[] = aiResult.titles.map((titleData, index) => {
          // 计算V3.2评分
          // 使用简化评分
          const semanticCompleteness = 0.8;
          const emotionalScore = 0.8;

          return {
            id: `title-${Date.now()}-${index}`,
            title: safeTitle(titleData.title),
            length: titleData.title.length,
            style: (titleData.style as TitleStyle) || 'result-emotion',
            confidence: titleData.semanticFit || 0.8,
            semanticFit: titleData.semanticFit || 0.8,
            platform: platformId,
            isComplete: true,
            styleDescription: titleData.style || t('components.labels.结果导向型'),
            emotionalScore: emotionalScore,
            diversityScore: titleData.structuralDiversity || 0.8,
            semanticCompleteness: semanticCompleteness,
            utilizationScore: titleData.characterUtilization || 0.8,
            overallScore: titleData.semanticFit || 0.8,
            generationReason: titleData.reasoning || t('titleGenerator.generation.aiGenerated'),
            extractedContent: sourceContent.substring(0, 100) + '...'
          };
        });

        // ✅ FIXED: 应用质量过滤
        console.log(t('components.title.开始质量过_qpk'));
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
        
        console.log('质量过滤结果：通过验证');
        // 显示成功消息
        toast({
            title: '标题生成成功',
            description: '已生成符合质量标准的标题',
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
            title: t(),
            description: $,
            variant: "default"
          });
          
          return; // 成功生成，退出循环
        }

      } catch (error) {
        console.error(t('components.error.mode_szp'), error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // 如果不是最后一个模型，继续尝试下一个
        if (modelConfig !== aiModels[aiModels.length - 1]) {
          console.log(t('components.error.mod_vje'));
          continue;
        }
      }
    }

    // 所有模型都失败了
    console.error(t('components.error.所有AI模型_rld{t('components.error.last_ess'), ');
    console.error(`📊 失败统计: 尝试了 ${aiModels.length} 个模型 (${failedModels})`);
    
    // 显示错误提示
    toast({
      title: "AI生成失败",
      description: ,
      variant: "destructive"
    });
    
    throw lastError || new Error(本地生成功能已禁用，只支持AI模式textarea');
        textArea.value = title;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy...' : title;
      toast({
        title: $,
        description: `"${titlePreview}" 已复制到剪贴板`,
        duration: 2000,
      });

      logger.debug()}, titlePreview);
    } catch (error) {
      console.error(t('components.error.复制失败_dj9'), error);
      toast({
        title: ,
        description: ,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Handle title feedback
  const handleTitleFeedback = (titleId: string, feedback: 'like' | 'dislike') => {
    setTitleFeedback(prev => ({
      ...prev,
      [titleId]: feedback
    }));

    console.log(t('components.title.标题反馈收_wr0'), {
      titleId,
      feedback,
      title: titles.find(t => t.id === titleId)?.title || t(),
      platform: platformId || '未知平台'
    });

    toast({
      title: feedback === 'like' ? t('components.labels.感谢反馈') : t('components.labels.已记录反馈'),
      description: feedback === 'like' ?  : components.error.componen_fli')}),
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
      title: t(),
      description: components.text._oq4')}');
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

  // 已删除浏览器网络修复功能

  // ✅ FIXED: 性能优化 - 使用useCallback优化函数引用
  const memoizedGenerateTitles = useCallback(async () => {
    try {
      await generateTitles();
    } catch (error) {
      console.error(t({t('components.error.componen_dv4'))}, error);
      toast({
        title: t(),
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
            <Sparkles className="h-5 w-5 text-foregroundoutline text-xs">
            {memoizedPlatformName} (限{titleLimit}字)
          </Badge>
        </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center py-4">
            <div className="text-destructive mb-2">
              <X className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-sm text-muted-foreground mb-2)}text-xs text-muted-foreground mb-4">{errorMessage}</p>
            <Button size="smw-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-foreground{t('components.title._n8h')}outline text-xs">
              {memoizedPlatformName} (限{titleLimit}字)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center py-4">
            <div className="text-destructive mb-2">
              <X className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-sm text-muted-foreground mb-2)}text-xs text-muted-foreground mb-4">AI服务暂时不可用，请稍后重试</p>
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
            <Sparkles className="h-5 w-5 text-foreground$outline text-xs">
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
            {isGenerating ? `为${memoizedPlatformName}分析中...` : $}
          </Button>
        </div>

        {/* Loading state */}
        {isGenerating && (
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">正在进行内容语义分析...</p>
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
                    ? 'border-primary bg-accent ring-1 ring-primary/20'
                    : 'border-border hover:border-border hover:bg-accent'
                }`}
              >
                {editingTitleId === title.id ? (
                  // 编辑模式
                  <div className="space-y-3">
                    <Textarea
                      value={editingTitleText}
                      onChange={(e) => setEditingTitleText(e.target.value)}
                      className="min-h-[60px] text-sm leading-relaxed"
                      placeholder={t('components.labels.占位符')}
        maxLength={titleLimit}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {editingTitleText.length}/{titleLimit} 字符
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="h-7 px-2"
                        >
                          <Check className="h-3 w-3 mr-1sm h-7 px-2"
                        >
                          <X className="h-3 w-3 mr-1flex items-start justify-between gap-3 cursor-pointer"
                    onClick={() => handleTitleSelect(title.title)}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        {title.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">
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

                    <div className="flex items-center gap-1{t('components.button._3zr')}sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(title.id, title.title);
                        }}
                        className="h-7 w-7 p-0"
                        title=)}
                      >
                        <Edit className="h-3 w-3sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyTitle(title.title);
                        }}
                        className="h-7 w-7 p-0 transition-all duration-200"
                        title=)}
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

        {/* Empty state */}
        {!isGenerating && titles.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm{t('components.title.暂无生成的标题_9lp')}sm mt-2">
              开始智能分析
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TitleGenerator;

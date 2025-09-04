/**
 * 内容生成Hook
 * 负责AI内容生成的逻辑处理
 */

import { useCallback } from 'react';
import { useAdaptPage } from '../AdaptPageProvider';
import { GenerationRequest, GeneratedContent } from '../types';

// ========================================================================================
// 内容生成Hook
// ========================================================================================

export function useContentGeneration() {
  const { state, events } = useAdaptPage();

  /**
   * 生成内容
   */
  const generateContent = useCallback(async (request: GenerationRequest) => {
    try {
      // 设置生成状态
      const dispatch = (state as any).dispatch;
      dispatch({ type: 'SET_GENERATION_STATE', payload: { isGenerating: true, progress: 0 } });
      dispatch({ type: 'SET_RESULTS', payload: [] });

      // 模拟生成过程
      const results: GeneratedContent[] = [];
      const totalPlatforms = request.platforms.length;

      for (let i = 0; i < totalPlatforms; i++) {
        const platformId = request.platforms[i];
        const progress = ((i + 1) / totalPlatforms) * 100;
        
        // 更新进度
        dispatch({ type: 'SET_GENERATION_STATE', payload: { isGenerating: true, progress } });

        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 生成模拟内容
        const generatedContent = await generatePlatformContent(platformId, request);
        results.push(generatedContent);

        // 添加结果
        dispatch({ type: 'ADD_RESULT', payload: generatedContent });
      }

      // 完成生成
      dispatch({ type: 'SET_GENERATION_STATE', payload: { isGenerating: false, progress: 100 } });

      return results;
    } catch (error) {
      console.error('Content generation failed:', error);
      const dispatch = (state as any).dispatch;
      dispatch({ type: 'SET_GENERATION_STATE', payload: { isGenerating: false, progress: 0 } });
      throw error;
    }
  }, [state]);

  /**
   * 重新生成单个平台内容
   */
  const regenerateContent = useCallback(async (platformId: string) => {
    try {
      // 构建重新生成请求
      const request: GenerationRequest = {
        content: state.inputContent,
        platforms: [platformId],
        contentForm: state.selectedContentForm,
        contentScheme: state.selectedContentScheme,
        aiModel: state.selectedAIModel,
        customPrompt: state.customPrompt,
        brandLibraryEnabled: state.brandLibraryEnabled,
        platformSettings: state.platformSettings,
      };

      // 生成新内容
      const generatedContent = await generatePlatformContent(platformId, request);

      // 更新结果
      const dispatch = (state as any).dispatch;
      dispatch({ 
        type: 'UPDATE_RESULT', 
        payload: { 
          platformId, 
          content: generatedContent 
        } 
      });

      return generatedContent;
    } catch (error) {
      console.error('Content regeneration failed:', error);
      throw error;
    }
  }, [state]);

  return {
    generateContent,
    regenerateContent,
  };
}

// ========================================================================================
// 辅助函数
// ========================================================================================

/**
 * 为单个平台生成内容
 */
async function generatePlatformContent(
  platformId: string, 
  request: GenerationRequest
): Promise<GeneratedContent> {
  // 获取平台信息
  const platformInfo = getPlatformInfo(platformId);
  
  // 获取平台设置
  const platformSettings = request.platformSettings?.[platformId];
  
  // 构建提示词
  const prompt = buildPrompt(request, platformInfo, platformSettings);
  
  // 模拟AI API调用
  const content = await callAIAPI(prompt, request.aiModel);
  
  // 生成标签
  const tags = generateTags(content, platformId);
  
  // 生成标题（如果需要）
  const title = generateTitle(content, platformId);

  return {
    platformId,
    platformName: platformInfo.name,
    content,
    title,
    tags,
    metadata: {
      characterCount: content.length,
      wordCount: content.trim().split(/\s+/).length,
      generatedAt: new Date().toISOString(),
      modelUsed: request.aiModel,
      promptUsed: prompt,
    },
  };
}

/**
 * 获取平台信息
 */
function getPlatformInfo(platformId: string) {
  const platforms: Record<string, any> = {
    xiaohongshu: { name: '小红书', icon: '🔴', maxLength: 1000 },
    weibo: { name: '微博', icon: '🐦', maxLength: 280 },
    zhihu: { name: '知乎', icon: '🧠', maxLength: 2000 },
    douyin: { name: '抖音', icon: '🎵', maxLength: 200 },
    wechat: { name: '微信公众号', icon: '💬', maxLength: 3000 },
    bilibili: { name: 'B站', icon: '📺', maxLength: 500 },
  };
  
  return platforms[platformId] || { name: platformId, icon: '📱', maxLength: 1000 };
}

/**
 * 构建提示词
 */
function buildPrompt(
  request: GenerationRequest, 
  platformInfo: any, 
  platformSettings: any
): string {
  let prompt = `请将以下内容适配为适合${platformInfo.name}平台的内容：\n\n${request.content}\n\n`;
  
  // 添加内容形式要求
  if (request.contentForm && request.contentForm !== 'auto') {
    prompt += `内容形式：${request.contentForm}\n`;
  }
  
  // 添加内容风格要求
  if (request.contentScheme && request.contentScheme !== 'auto') {
    prompt += `内容风格：${request.contentScheme}\n`;
  }
  
  // 添加字符数限制
  if (platformSettings?.characterLimit) {
    const { min, max } = platformSettings.characterLimit;
    prompt += `字符数要求：${min}-${max}字符\n`;
  }
  
  // 添加平台特定要求
  if (platformSettings?.customPrompt) {
    prompt += `特殊要求：${platformSettings.customPrompt}\n`;
  }
  
  // 添加自定义提示词
  if (request.customPrompt) {
    prompt += `额外要求：${request.customPrompt}\n`;
  }
  
  prompt += '\n请生成适合该平台的内容，保持原意的同时优化表达方式。';
  
  return prompt;
}

/**
 * 模拟AI API调用
 */
async function callAIAPI(prompt: string, model: string): Promise<string> {
  // 这里应该调用真实的AI API
  // 现在返回模拟内容
  
  const sampleContents = [
    '🌟 今天想和大家分享一个超实用的小技巧！经过我的亲身体验，这个方法真的太好用了～\n\n相信很多小伙伴都遇到过类似的问题，之前我也是各种尝试都没有找到好的解决方案。直到发现了这个方法，简直是打开了新世界的大门！\n\n具体操作步骤：\n1️⃣ 首先...\n2️⃣ 然后...\n3️⃣ 最后...\n\n真的超级简单，而且效果立竿见影！小伙伴们快去试试吧～\n\n#实用技巧 #生活小妙招 #经验分享',
    
    '💡 最近发现了一个宝藏方法，必须来分享给大家！\n\n作为一个踩过无数坑的过来人，我想说这个真的值得收藏。不仅操作简单，而且效果超出预期。\n\n重点来了：\n✨ 优点一：...\n✨ 优点二：...\n✨ 优点三：...\n\n注意事项：\n⚠️ 记得要...\n⚠️ 避免...\n\n希望对大家有帮助！有问题欢迎评论区交流～\n\n#干货分享 #实用工具 #效率提升',
    
    '🔥 今日分享｜这个发现让我惊喜不已！\n\n说实话，一开始我也是抱着试试看的心态，没想到效果这么好。现在已经成为我的日常必备了。\n\n为什么推荐：\n🎯 解决了核心痛点\n🎯 操作门槛很低\n🎯 性价比超高\n\n使用心得：\n📝 建议新手从...开始\n📝 进阶用法可以...\n📝 避坑指南：...\n\n总的来说，这个真的值得一试！\n\n#好物推荐 #使用心得 #避坑指南'
  ];
  
  // 随机选择一个示例内容
  const randomIndex = Math.floor(Math.random() * sampleContents.length);
  return sampleContents[randomIndex];
}

/**
 * 生成标签
 */
function generateTags(content: string, platformId: string): string[] {
  // 根据内容和平台生成相关标签
  const commonTags = ['实用', '分享', '推荐', '干货', '经验'];
  const platformTags: Record<string, string[]> = {
    xiaohongshu: ['种草', '好物', '生活', '美好', '推荐'],
    weibo: ['热门', '话题', '分享', '互动', '讨论'],
    zhihu: ['知识', '专业', '深度', '分析', '见解'],
    douyin: ['热门', '有趣', '创意', '娱乐', '潮流'],
    wechat: ['深度', '思考', '专业', '见解', '分析'],
    bilibili: ['有趣', '创意', '分享', '学习', '娱乐'],
  };
  
  const tags = [...commonTags.slice(0, 2), ...(platformTags[platformId] || []).slice(0, 3)];
  return tags;
}

/**
 * 生成标题
 */
function generateTitle(content: string, platformId: string): string | undefined {
  // 某些平台需要标题
  if (['wechat', 'zhihu'].includes(platformId)) {
    // 从内容中提取或生成标题
    const firstLine = content.split('\n')[0];
    if (firstLine.length > 10 && firstLine.length < 50) {
      return firstLine.replace(/[🌟💡🔥✨🎯📝⚠️]/g, '').trim();
    }
    return '实用分享：值得收藏的小技巧';
  }
  return undefined;
}

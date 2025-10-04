/**
 * 高级提示词系统使用示例
 */

import { AdvancedPromptBuilder } from '../services/AdvancedPromptBuilder';
import type { StyleType } from '@/config/contentSchemes';

// ==================== 示例1: 基础使用 ====================

export function example1_BasicUsage() {
  const builder = new AdvancedPromptBuilder();

  // 最简单的使用：只有原始内容和平台
  const context = {
    originalContent: '今天试用了一个AI写作工具，效率提升很明显',
    platform: 'xiaohongshu'
  };

  const systemPrompt = builder.buildSystemPrompt(context);
  const userPrompt = builder.buildUserPrompt(context);

  console.log('=== 基础使用示例 ===');
  console.log('System Prompt:', systemPrompt);
  console.log('\nUser Prompt:', userPrompt);
  console.log('\n使用的维度:', builder.getDimensions());
}

// ==================== 示例2: 完整维度使用 ====================

export function example2_FullDimensions() {
  const builder = new AdvancedPromptBuilder();

  const context = {
    originalContent: '用了这个AI工具后，写小红书笔记的速度提升了3倍',
    platform: 'xiaohongshu',
    formId: 'product-review',
    style: 'real' as StyleType,
    charCount: 800,
    useEmoji: true,
    useMdFormat: true,
    useAutoFormat: true,
    customPrompt: '要突出使用前后的对比，强调真实体验'
  };

  const systemPrompt = builder.buildSystemPrompt(context);
  const userPrompt = builder.buildUserPrompt(context);

  console.log('=== 完整维度使用示例 ===');
  console.log('\n使用的维度:', builder.getDimensions());
  console.log('维度数量:', builder.getDimensions().length);
}

// ==================== 示例3: 品牌库使用（最高优先级） ====================

export function example3_BrandLibrary() {
  const builder = new AdvancedPromptBuilder();

  const context = {
    originalContent: '我们的产品帮助用户提升工作效率',
    platform: 'wechat',
    useBrandLibrary: true,
    brandProfile: {
      brandName: '效率大师',
      brandTone: '专业、可靠、温暖',
      brandValues: '让每个人都能高效工作',
      keyWords: '效率、专业、简单、可靠',
      forbiddenWords: '免费、便宜、最好',
      voiceTemplate: '我们相信...'
    },
    style: 'professional' as StyleType,
    charCount: 1500
  };

  const userPrompt = builder.buildUserPrompt(context);

  console.log('=== 品牌库使用示例（最高优先级） ===');
  console.log('\n提示词中的品牌要求:');
  console.log(userPrompt.substring(0, 500));
  console.log('\n使用的维度:', builder.getDimensions());
}

// ==================== 示例4: 多平台适配 ====================

export function example4_MultiplePlatforms() {
  const builder = new AdvancedPromptBuilder();

  const context = {
    originalContent: '发现一个超好用的AI写作助手，写文案效率翻倍',
    platform: 'xiaohongshu', // 主平台
    multiplePlatforms: ['xiaohongshu', 'weibo', 'wechat', 'douyin'],
    style: 'funny' as StyleType
  };

  const userPrompt = builder.buildUserPrompt(context);

  console.log('=== 多平台适配示例 ===');
  console.log('\n多平台提示词:');
  console.log(userPrompt.substring(0, 800));
}

// ==================== 示例5: 不同风格对比 ====================

export function example5_StyleComparison() {
  const builder = new AdvancedPromptBuilder();
  const baseContext = {
    originalContent: 'AI工具帮我节省了大量时间',
    platform: 'xiaohongshu',
    charCount: 500
  };

  const styles: StyleType[] = ['professional', 'funny', 'real', 'hook'];

  console.log('=== 不同风格对比示例 ===\n');

  styles.forEach(style => {
    const context = { ...baseContext, style };
    const userPrompt = builder.buildUserPrompt(context);

    console.log(`\n--- ${style}风格 ---`);
    console.log(userPrompt.substring(0, 400));
    console.log('...\n');
  });
}

// ==================== 示例6: 优先级机制演示 ====================

export function example6_PriorityMechanism() {
  const builder = new AdvancedPromptBuilder();

  // 场景1: 品牌库 + 平台默认
  const context1 = {
    originalContent: '产品介绍',
    platform: 'xiaohongshu',
    useBrandLibrary: true,
    brandProfile: {
      brandName: '品牌A',
      brandTone: '专业严谨'
    }
  };

  // 场景2: 用户选择 + 平台默认
  const context2 = {
    originalContent: '产品介绍',
    platform: 'xiaohongshu',
    style: 'professional' as StyleType
  };

  // 场景3: 仅平台默认
  const context3 = {
    originalContent: '产品介绍',
    platform: 'xiaohongshu'
  };

  console.log('=== 优先级机制演示 ===\n');
  console.log('场景1（品牌库>平台）:',builder.getDimensions().length, '个维度');
  console.log('场景2（用户选择>平台）:', builder.getDimensions().length, '个维度');
  console.log('场景3（仅平台默认）:', builder.getDimensions().length, '个维度');
}

// ==================== 示例7: 实际使用流程 ====================

export async function example7_RealWorldFlow() {
  const builder = new AdvancedPromptBuilder();

  // 模拟用户输入
  const userInput = {
    content: `我最近发现一个宝藏AI工具，叫做文派智能。
用它写小红书笔记，效率提升了3倍！
以前写一篇笔记要1小时，现在只需要20分钟。
而且生成的内容质量很高，点赞收藏都比以前多。
真的太好用了，强烈推荐给大家！`,

    selectedPlatform: 'xiaohongshu',
    selectedStyle: 'real' as StyleType,
    targetCharCount: 800,
    enableBrand: true,
    brandData: {
      brandName: '文派智能',
      brandTone: '专业、友好、高效',
      keyWords: '智能、高效、专业'
    },
    enableEmoji: true,
    enableMarkdown: true
  };

  // 构建提示词
  const context = {
    originalContent: userInput.content,
    platform: userInput.selectedPlatform,
    style: userInput.selectedStyle,
    charCount: userInput.targetCharCount,
    useBrandLibrary: userInput.enableBrand,
    brandProfile: userInput.brandData,
    useEmoji: userInput.enableEmoji,
    useMdFormat: userInput.enableMarkdown,
    useAutoFormat: true
  };

  const systemPrompt = builder.buildSystemPrompt(context);
  const userPrompt = builder.buildUserPrompt(context);

  console.log('=== 实际使用流程示例 ===\n');
  console.log('用户输入:', userInput.content.substring(0, 100) + '...');
  console.log('\n配置的维度:', builder.getDimensions());
  console.log('维度数量:', builder.getDimensions().length);
  console.log('\n生成的系统提示词长度:', systemPrompt.length, '字符');
  console.log('生成的用户提示词长度:', userPrompt.length, '字符');

  // 模拟AI调用
  console.log('\n--- 可以将这些提示词发送给AI模型 ---');
  console.log('API调用示例:');
  console.log(`
  const response = await callAI({
    systemPrompt: systemPrompt,
    userPrompt: userPrompt,
    model: 'deepseek-v3',
    temperature: 0.7,
    maxTokens: 2000
  });
  `);
}

// ==================== 运行所有示例 ====================

export function runAllExamples() {
  console.log('\n🚀 高级提示词系统使用示例\n');
  console.log('='.repeat(60));

  example1_BasicUsage();
  console.log('\n' + '='.repeat(60));

  example2_FullDimensions();
  console.log('\n' + '='.repeat(60));

  example3_BrandLibrary();
  console.log('\n' + '='.repeat(60));

  example4_MultiplePlatforms();
  console.log('\n' + '='.repeat(60));

  example5_StyleComparison();
  console.log('\n' + '='.repeat(60));

  example6_PriorityMechanism();
  console.log('\n' + '='.repeat(60));

  example7_RealWorldFlow();
  console.log('\n' + '='.repeat(60));

  console.log('\n✅ 所有示例运行完成\n');
}

// 如果直接运行此文件
if (require.main === module) {
  runAllExamples();
}

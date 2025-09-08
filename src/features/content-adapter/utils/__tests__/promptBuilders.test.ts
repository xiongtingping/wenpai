/**
 * AI内容适配器提示词构建器测试
 * 验证迁移后的函数功能正常
 */

import { describe, it, expect } from 'vitest';
import {
  generateMatrixPrompt,
  getPlatformCharacteristics,
  getAlternativeContentForm,
  getAlternativeStyle,
  generatePlatformDimension,
  generateContentFormDimension,
  generateContentDimension,
  generateBrandDimension,
  generateStyleDimension,
  generateCustomDimension,
  generateDifferentiationDimension,
  generateMeaningfulTitle
} from '../promptBuilders';

describe('promptBuilders - 内容生成函数迁移验证', () => {
  
  describe('getPlatformCharacteristics', () => {
    it('应该返回抖音平台特色', () => {
      const result = getPlatformCharacteristics('douyin');
      expect(result.tone).toBe('轻松有趣、节奏感强');
      expect(result.features).toContain('短视频脚本格式');
      expect(result.contentStyle).toBe('快节奏、高密度信息、强视觉效果');
    });

    it('应该返回小红书平台特色', () => {
      const result = getPlatformCharacteristics('xiaohongshu');
      expect(result.tone).toBe('真实分享、种草推荐');
      expect(result.features).toContain('个人体验感');
    });

    it('应该为未知平台返回默认值', () => {
      const result = getPlatformCharacteristics('unknown');
      expect(result.tone).toBe('自然真实');
      expect(result.features).toContain('内容适配');
    });
  });

  describe('getAlternativeContentForm', () => {
    it('应该为抖音返回替代内容形式', () => {
      const result = getAlternativeContentForm('douyin', 'comedy-reversal');
      expect(['drama-script', 'tutorial-guide']).toContain(result);
    });

    it('应该为小红书返回替代内容形式', () => {
      const result = getAlternativeContentForm('xiaohongshu');
      expect(['product-review', 'lifestyle-sharing', 'tutorial-guide']).toContain(result);
    });
  });

  describe('getAlternativeStyle', () => {
    it('应该返回正确的替代风格', () => {
      expect(getAlternativeStyle('professional')).toBe('real');
      expect(getAlternativeStyle('funny')).toBe('professional');
      expect(getAlternativeStyle('real')).toBe('funny');
      expect(getAlternativeStyle('hook')).toBe('professional');
    });
  });

  describe('generatePlatformDimension', () => {
    it('应该生成平台维度提示词', () => {
      const result = generatePlatformDimension('douyin');
      expect(result).toContain('平台差异化要求');
      expect(result).toContain('目标平台：douyin');
      expect(result).toContain('轻松有趣、节奏感强');
    });
  });

  describe('generateContentDimension', () => {
    it('应该生成内容维度提示词', () => {
      const content = '这是一段测试内容';
      const result = generateContentDimension(content);
      expect(result).toContain('原始内容作为创作基础');
      expect(result).toContain(content);
      expect(result).toContain('短文内容');
    });

    it('应该识别长文内容', () => {
      const longContent = 'a'.repeat(600);
      const result = generateContentDimension(longContent);
      expect(result).toContain('长文内容');
    });
  });

  describe('generateBrandDimension', () => {
    it('应该生成品牌维度提示词', async () => {
      const profile = {
        name: '测试品牌',
        tone: '专业友好',
        keywords: ['创新', '品质'],
        values: ['用户至上']
      };
      const result = await generateBrandDimension(profile, '测试内容');
      expect(result).toContain('品牌调性覆盖所有默认设定');
      expect(result).toContain('测试品牌');
      expect(result).toContain('专业友好');
      expect(result).toContain('创新、品质');
    });
  });

  describe('generateStyleDimension', () => {
    it('应该生成专业风格维度', () => {
      const result = generateStyleDimension('professional');
      expect(result).toContain('专业权威');
      expect(result).toContain('用词准确、逻辑清晰、可信度高');
    });

    it('应该处理无风格情况', () => {
      const result = generateStyleDimension();
      expect(result).toContain('自然表达');
      expect(result).toContain('根据内容特点自然选择最合适的表达方式');
    });
  });

  describe('generateCustomDimension', () => {
    it('应该生成自定义维度提示词', () => {
      const customText = '请突出产品的创新特点';
      const result = generateCustomDimension(customText);
      expect(result).toContain('用户个性化要求');
      expect(result).toContain(customText);
      expect(result).toContain('高优先级');
    });
  });

  describe('generateDifferentiationDimension', () => {
    it('应该生成差异化维度提示词', () => {
      const result = generateDifferentiationDimension();
      expect(result).toContain('防模板化差异化要求');
      expect(result).toContain('差异化策略');
      expect(result).toContain('避免使用常见的模板化表达');
    });

    it('应该包含随机策略', () => {
      const result1 = generateDifferentiationDimension();
      const result2 = generateDifferentiationDimension();
      // 由于随机性，两次结果可能不同（但不是必须的）
      expect(result1).toContain('差异化策略');
      expect(result2).toContain('差异化策略');
    });
  });

  describe('generateMeaningfulTitle', () => {
    it('应该从内容中提取标题', () => {
      const content = '今天分享一个很棒的产品。它有很多优点。';
      const result = generateMeaningfulTitle(content, 'xiaohongshu');
      expect(result).toBe('今天分享一个很棒的产品');
    });

    it('应该处理短内容', () => {
      const content = '短内容测试';
      const result = generateMeaningfulTitle(content, 'douyin');
      expect(result).toBe('短内容测试');
    });

    it('应该处理空内容', () => {
      const result = generateMeaningfulTitle('', 'weibo');
      expect(result).toBe('内容标题');
    });

    it('应该截断长标题', () => {
      const content = '这是一个非常非常长的内容，应该被截断为合适的标题长度，不能太长，超过30个字符的部分应该被截断';
      const result = generateMeaningfulTitle(content, 'zhihu');
      expect(result).toContain('...');
      expect(result.length).toBeLessThanOrEqual(33); // 30 + '...'
    });
  });

  describe('generateMatrixPrompt', () => {
    it('应该生成完整的矩阵提示词', async () => {
      const result = await generateMatrixPrompt(
        '测试原始内容',
        'douyin',
        'comedy-reversal',
        'funny',
        200,
        '请突出幽默感'
      );

      expect(result).toContain('你是一位专业的多维度内容创作专家');
      expect(result).toContain('【原始内容维度】');
      expect(result).toContain('【目标平台维度】');
      expect(result).toContain('【内容形式维度】');
      expect(result).toContain('【表达风格维度】');
      expect(result).toContain('【用户自定义维度】');
      expect(result).toContain('【差异化维度】');
      expect(result).toContain('请开始生成：');
    });

    it('应该支持品牌库', async () => {
      const brandProfile = {
        name: '测试品牌',
        tone: '专业友好'
      };

      const result = await generateMatrixPrompt(
        '测试内容',
        'xiaohongshu',
        undefined,
        undefined,
        undefined,
        undefined,
        true,
        brandProfile
      );

      expect(result).toContain('【品牌维度 - 最高优先级】');
      expect(result).toContain('测试品牌');
    });
  });
});

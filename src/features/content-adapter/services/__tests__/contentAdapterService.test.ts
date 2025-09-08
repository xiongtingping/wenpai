/**
 * 内容适配器服务测试
 * 验证服务层封装正确性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentAdapterService } from '../contentAdapterService';
import type { GlobalSettings, PlatformSettings } from '../contentAdapterService';

// Mock dependencies
vi.mock('@/services/aiWithTokenTracking', () => ({
  callAIWithTokenTracking: vi.fn()
}));

vi.mock('@/config/platformLimits', () => ({
  getUnifiedCharCountLimit: vi.fn(() => ({
    finalLimit: 500,
    source: 'preset',
    range: { min: 400, max: 600 },
    description: '标准预设'
  })),
  getPlatformCharCountAdvice: vi.fn(() => '建议控制在合理范围内')
}));

vi.mock('../utils/promptBuilders', () => ({
  generateMatrixPrompt: vi.fn()
}));

vi.mock('../utils/promptBuilders.stateful', () => ({
  createMatrixPromptGenerator: vi.fn(() => vi.fn()),
  createFormatDimensionGenerator: vi.fn(() => vi.fn())
}));

describe('ContentAdapterService', () => {
  let service: ContentAdapterService;
  let mockGlobalSettings: GlobalSettings;
  let mockPlatformSettings: Record<string, PlatformSettings>;

  beforeEach(() => {
    mockGlobalSettings = {
      charCountPreset: 'standard',
      globalEmoji: false,
      globalMd: false,
      globalAutoFormat: true
    };

    mockPlatformSettings = {
      'douyin': {
        charCount: 200,
        useEmoji: true,
        useMdFormat: false,
        useAutoFormat: true
      },
      'xiaohongshu': {
        charCount: 500,
        useEmoji: true,
        useMdFormat: false,
        useAutoFormat: true
      }
    };

    service = new ContentAdapterService(mockGlobalSettings, mockPlatformSettings);
  });

  describe('构造函数和设置更新', () => {
    it('应该正确初始化服务', () => {
      expect(service).toBeInstanceOf(ContentAdapterService);
    });

    it('应该能够更新设置', () => {
      const newGlobalSettings: GlobalSettings = {
        charCountPreset: 'detailed',
        globalEmoji: true,
        globalMd: true,
        globalAutoFormat: false
      };

      const newPlatformSettings = {
        'weibo': {
          charCount: 300,
          useEmoji: false
        }
      };

      service.updateSettings(newGlobalSettings, newPlatformSettings);
      
      // 验证设置已更新（通过调用依赖设置的方法）
      const charCountControl = service.getCharCountControl('weibo');
      expect(charCountControl).toBeDefined();
    });
  });

  describe('generateContent', () => {
    it('应该生成内容', async () => {
      // Mock AI调用返回
      const { callAIWithTokenTracking } = await import('@/services/aiWithTokenTracking');
      const mockCallAI = callAIWithTokenTracking as any;
      mockCallAI.mockResolvedValue({
        success: true,
        content: '生成的测试内容',
        tokenUsage: {
          inputTokens: 100,
          outputTokens: 200,
          totalTokens: 300
        }
      });

      // Mock 提示词生成
      const { generateMatrixPrompt } = await import('../utils/promptBuilders');
      const mockGeneratePrompt = generateMatrixPrompt as any;
      mockGeneratePrompt.mockResolvedValue('测试提示词');

      const request = {
        originalContent: '原始测试内容',
        platform: 'douyin',
        formId: 'comedy-reversal',
        style: 'funny' as const,
        charCount: 200
      };

      const result = await service.generateContent(request);

      expect(result.success).toBe(true);
      expect(result.content).toBe('生成的测试内容');
      expect(result.tokenUsage).toBeDefined();
      expect(mockCallAI).toHaveBeenCalledWith(
        expect.objectContaining({
          feature: 'AI内容适配器',
          model: 'deepseek-chat',
          temperature: 0.7,
          maxTokens: 2000
        })
      );
    });

    it('应该处理生成失败的情况', async () => {
      const { callAIWithTokenTracking } = await import('@/services/aiWithTokenTracking');
      const mockCallAI = callAIWithTokenTracking as any;
      mockCallAI.mockResolvedValue({
        success: false,
        error: 'AI调用失败'
      });

      const request = {
        originalContent: '原始测试内容',
        platform: 'douyin'
      };

      const result = await service.generateContent(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('AI调用失败');
    });
  });

  describe('generateVersionContent', () => {
    it('应该为标准版本使用正确的温度', async () => {
      const { callAIWithTokenTracking } = await import('@/services/aiWithTokenTracking');
      const mockCallAI = callAIWithTokenTracking as any;
      mockCallAI.mockResolvedValue({
        success: true,
        content: '标准版本内容'
      });

      const request = {
        originalContent: '原始内容',
        platform: 'xiaohongshu',
        versionType: 'standard' as const
      };

      await service.generateVersionContent(request);

      expect(mockCallAI).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.7
        })
      );
    });

    it('应该为创意版本使用正确的温度', async () => {
      const { callAIWithTokenTracking } = await import('@/services/aiWithTokenTracking');
      const mockCallAI = callAIWithTokenTracking as any;
      mockCallAI.mockResolvedValue({
        success: true,
        content: '创意版本内容'
      });

      const request = {
        originalContent: '原始内容',
        platform: 'xiaohongshu',
        versionType: 'creative' as const
      };

      await service.generateVersionContent(request);

      expect(mockCallAI).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.9
        })
      );
    });
  });

  describe('generateTitle', () => {
    it('应该生成标题', async () => {
      const { callAIWithTokenTracking } = await import('@/services/aiWithTokenTracking');
      const mockCallAI = callAIWithTokenTracking as any;
      mockCallAI.mockResolvedValue({
        success: true,
        content: '1. 生成的标题\n2. 另一个标题\n3. 第三个标题'
      });

      const result = await service.generateTitle('测试内容');

      expect(result.success).toBe(true);
      expect(result.content).toBe('生成的标题');
      expect(mockCallAI).toHaveBeenCalledWith(
        expect.objectContaining({
          feature: '标题生成',
          maxTokens: 200
        })
      );
    });
  });

  describe('工具方法', () => {
    it('应该获取字符数控制信息', () => {
      const result = service.getCharCountControl('douyin', 300);
      expect(result).toBeDefined();
      expect(result.finalLimit).toBe(500);
    });

    it('应该获取平台建议', () => {
      const advice = service.getPlatformAdvice('douyin');
      expect(advice).toBe('建议控制在合理范围内');
    });
  });
});

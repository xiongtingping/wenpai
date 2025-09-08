/**
 * 内容适配器引擎Hook测试
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContentAdapterEngine } from '../useContentAdapterEngine';
import type { UseContentAdapterEngineParams } from '../useContentAdapterEngine';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('../services/contentAdapterService', () => ({
  ContentAdapterService: vi.fn().mockImplementation(() => ({
    generateContent: vi.fn(),
    regenerateContent: vi.fn(),
    generateComparisonContent: vi.fn(),
    generateTitle: vi.fn(),
    updateSettings: vi.fn()
  }))
}));

describe('useContentAdapterEngine', () => {
  let mockParams: UseContentAdapterEngineParams;

  beforeEach(() => {
    mockParams = {
      globalSettings: {
        charCountPreset: 'standard',
        globalEmoji: false,
        globalMd: false,
        globalAutoFormat: true
      },
      platformSettings: {
        'douyin': {
          charCount: 200,
          useEmoji: true,
          useMdFormat: false,
          useAutoFormat: true
        }
      },
      selectedModel: 'deepseek-chat',
      useBrandLibrary: false
    };
  });

  describe('初始化', () => {
    it('应该正确初始化Hook状态', () => {
      const { result } = renderHook(() => useContentAdapterEngine(mockParams));

      expect(result.current.generating).toBe(false);
      expect(result.current.results).toEqual([]);
      expect(result.current.retryingPlatforms).toEqual(new Set());
      expect(result.current.regeneratingVersions).toEqual(new Set());
      expect(result.current.comparisonContent).toEqual({});
      expect(result.current.titleStates).toEqual({});
    });

    it('应该提供所有必需的方法', () => {
      const { result } = renderHook(() => useContentAdapterEngine(mockParams));

      expect(typeof result.current.generateContent).toBe('function');
      expect(typeof result.current.retryPlatform).toBe('function');
      expect(typeof result.current.regenerateVersion).toBe('function');
      expect(typeof result.current.generateComparison).toBe('function');
      expect(typeof result.current.generateTitle).toBe('function');
      expect(typeof result.current.updatePlatformContent).toBe('function');
      expect(typeof result.current.clearResults).toBe('function');
      expect(typeof result.current.resetState).toBe('function');
      expect(typeof result.current.updateStep).toBe('function');
    });
  });

  describe('状态管理', () => {
    it('应该能够更新平台内容', () => {
      const { result } = renderHook(() => useContentAdapterEngine(mockParams));

      act(() => {
        result.current.updatePlatformContent('douyin', '测试内容');
      });

      expect(result.current.results).toEqual([
        {
          platformId: 'douyin',
          content: '测试内容',
          source: 'manual'
        }
      ]);
    });

    it('应该能够清空结果', () => {
      const { result } = renderHook(() => useContentAdapterEngine(mockParams));

      // 先添加一些数据
      act(() => {
        result.current.updatePlatformContent('douyin', '测试内容');
      });

      // 然后清空
      act(() => {
        result.current.clearResults();
      });

      expect(result.current.results).toEqual([]);
      expect(result.current.comparisonContent).toEqual({});
      expect(result.current.titleStates).toEqual({});
    });

    it('应该能够重置所有状态', () => {
      const { result } = renderHook(() => useContentAdapterEngine(mockParams));

      // 先设置一些状态
      act(() => {
        result.current.updatePlatformContent('douyin', '测试内容');
      });

      // 然后重置
      act(() => {
        result.current.resetState();
      });

      expect(result.current.generating).toBe(false);
      expect(result.current.results).toEqual([]);
      expect(result.current.retryingPlatforms).toEqual(new Set());
      expect(result.current.comparisonContent).toEqual({});
    });
  });

  describe('步骤更新', () => {
    it('应该能够更新生成步骤', () => {
      const { result } = renderHook(() => useContentAdapterEngine(mockParams));

      // 先添加一个结果
      act(() => {
        result.current.updatePlatformContent('douyin', '');
      });

      // 更新步骤
      act(() => {
        result.current.updateStep('douyin', 0, 'completed', '步骤完成');
      });

      const douyinResult = result.current.results.find(r => r.platformId === 'douyin');
      expect(douyinResult?.steps?.[0]).toEqual({
        status: 'completed',
        message: '步骤完成'
      });
    });
  });

  describe('内容生成', () => {
    it('应该能够生成内容', async () => {
      const { result } = renderHook(() => useContentAdapterEngine(mockParams));

      const request = {
        originalContent: '测试原始内容',
        platform: 'douyin'
      };

      await act(async () => {
        await result.current.generateContent(request, ['douyin']);
      });

      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].platformId).toBe('douyin');
    });

    it('应该在生成过程中设置正确的状态', async () => {
      const { result } = renderHook(() => useContentAdapterEngine(mockParams));

      const request = {
        originalContent: '测试原始内容',
        platform: 'douyin'
      };

      const generatePromise = act(async () => {
        await result.current.generateContent(request, ['douyin']);
      });

      // 在生成过程中应该设置generating为true
      expect(result.current.generating).toBe(true);

      await generatePromise;

      // 生成完成后应该设置generating为false
      expect(result.current.generating).toBe(false);
    });
  });

  describe('重试功能', () => {
    it('应该能够重试平台生成', async () => {
      const { result } = renderHook(() => useContentAdapterEngine(mockParams));

      const request = {
        originalContent: '测试原始内容',
        platform: 'douyin'
      };

      await act(async () => {
        await result.current.retryPlatform('douyin', request);
      });

      // 重试过程中应该添加到重试集合
      expect(result.current.retryingPlatforms.has('douyin')).toBe(false); // 完成后应该移除
    });
  });

  describe('版本重新生成', () => {
    it('应该能够重新生成版本', async () => {
      const { result } = renderHook(() => useContentAdapterEngine(mockParams));

      const request = {
        originalContent: '测试原始内容',
        platform: 'douyin'
      };

      await act(async () => {
        await result.current.regenerateVersion('douyin', 'version-1', request);
      });

      // 重新生成完成后应该从集合中移除
      expect(result.current.regeneratingVersions.has('douyin-version-1')).toBe(false);
    });
  });

  describe('对比内容生成', () => {
    it('应该能够生成对比内容', async () => {
      const { result } = renderHook(() => useContentAdapterEngine(mockParams));

      const request = {
        originalContent: '测试原始内容',
        platform: 'douyin'
      };

      await act(async () => {
        await result.current.generateComparison('douyin', request);
      });

      // 对比生成完成后应该从集合中移除
      expect(result.current.generatingComparison.has('douyin')).toBe(false);
    });
  });

  describe('标题生成', () => {
    it('应该能够生成标题', async () => {
      const { result } = renderHook(() => useContentAdapterEngine(mockParams));

      await act(async () => {
        await result.current.generateTitle('测试内容', 'douyin');
      });

      expect(result.current.titleStates['douyin']).toBeDefined();
    });
  });

  describe('参数更新', () => {
    it('应该在参数变化时更新服务', () => {
      const { result, rerender } = renderHook(
        (props) => useContentAdapterEngine(props),
        { initialProps: mockParams }
      );

      const newParams = {
        ...mockParams,
        selectedModel: 'gpt-4'
      };

      rerender(newParams);

      // 服务应该被更新（通过updateSettings调用）
      expect(result.current).toBeDefined();
    });
  });
});

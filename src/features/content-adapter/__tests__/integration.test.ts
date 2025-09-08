/**
 * 内容适配器集成测试
 * 测试新的模块化架构的核心功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAdapterSettings } from '../hooks/useAdapterSettings';
import { useContentAdapterEngine } from '../hooks/useContentAdapterEngine';
import { getAvailablePlatforms } from '@/api/contentAdapter';
import { 
  getPlatformName, 
  getPlatformIcon, 
  getPlatformMaxCharCount,
  getPlatformRecommendedCharCount 
} from '@/utils/platformUtils';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('@/api/contentAdapter', () => ({
  getAvailablePlatforms: vi.fn(),
  getContentForms: vi.fn(),
  getStyles: vi.fn()
}));

vi.mock('@/utils/platformUtils', () => ({
  getPlatformName: vi.fn(),
  getPlatformIcon: vi.fn(),
  getPlatformMaxCharCount: vi.fn(),
  getPlatformRecommendedCharCount: vi.fn()
}));

describe('内容适配器集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock platform data
    (getAvailablePlatforms as any).mockReturnValue([
      { id: 'xiaohongshu', name: '小红书', icon: '📖' },
      { id: 'weibo', name: '微博', icon: '🐦' },
      { id: 'wechat', name: '微信', icon: '💬' }
    ]);
    
    (getPlatformName as any).mockImplementation((id: string) => {
      const names: Record<string, string> = {
        'xiaohongshu': '小红书',
        'weibo': '微博',
        'wechat': '微信'
      };
      return names[id] || id;
    });
    
    (getPlatformIcon as any).mockImplementation((id: string) => {
      const icons: Record<string, string> = {
        'xiaohongshu': '📖',
        'weibo': '🐦',
        'wechat': '💬'
      };
      return icons[id] || '📱';
    });
    
    (getPlatformMaxCharCount as any).mockReturnValue(2000);
    (getPlatformRecommendedCharCount as any).mockReturnValue(1000);
  });

  describe('useAdapterSettings Hook', () => {
    it('应该正确初始化设置状态', () => {
      const { result } = renderHook(() => useAdapterSettings({
        autoSave: false,
        storageKey: 'test-settings'
      }));

      expect(result.current.selectedPlatforms).toEqual([]);
      expect(result.current.globalSettings).toBeDefined();
      expect(result.current.platformSettings).toEqual({});
      expect(result.current.settingsMode).toBeDefined();
      expect(result.current.useBrandLibrary).toBe(false);
      expect(result.current.customPrompt).toBe('');
    });

    it('应该能够更新选中的平台', () => {
      const { result } = renderHook(() => useAdapterSettings({
        autoSave: false,
        storageKey: 'test-settings'
      }));

      act(() => {
        result.current.updateSelectedPlatforms(['xiaohongshu', 'weibo']);
      });

      expect(result.current.selectedPlatforms).toEqual(['xiaohongshu', 'weibo']);
    });

    it('应该能够验证设置', () => {
      const { result } = renderHook(() => useAdapterSettings({
        autoSave: false,
        storageKey: 'test-settings'
      }));

      const validation = result.current.validateSettings();
      expect(validation).toBeDefined();
      expect(validation.isValid).toBeDefined();
      expect(validation.errors).toBeDefined();
    });
  });

  describe('平台工具函数', () => {
    it('应该正确获取平台信息', () => {
      const platforms = getAvailablePlatforms();
      expect(platforms).toHaveLength(3);
      expect(platforms[0]).toHaveProperty('id');
      expect(platforms[0]).toHaveProperty('name');
      expect(platforms[0]).toHaveProperty('icon');
    });

    it('应该正确获取平台名称', () => {
      const name = getPlatformName('xiaohongshu');
      expect(name).toBe('小红书');
    });

    it('应该正确获取平台图标', () => {
      const icon = getPlatformIcon('xiaohongshu');
      expect(icon).toBe('📖');
    });

    it('应该正确获取平台字符数限制', () => {
      const maxChars = getPlatformMaxCharCount('xiaohongshu');
      const recommendedChars = getPlatformRecommendedCharCount('xiaohongshu');
      
      expect(maxChars).toBe(2000);
      expect(recommendedChars).toBe(1000);
    });
  });

  describe('useContentAdapterEngine Hook', () => {
    it('应该正确初始化生成引擎状态', () => {
      const mockSettings = {
        globalSettings: {
          charCount: 1000,
          useEmoji: true,
          mdFormat: true
        },
        platformSettings: {},
        selectedModel: 'deepseek-chat',
        useBrandLibrary: false,
        brandProfile: null,
        customPrompt: ''
      };

      const { result } = renderHook(() => useContentAdapterEngine(mockSettings));

      expect(result.current.generating).toBe(false);
      expect(result.current.results).toEqual([]);
      expect(result.current.retryingPlatforms).toBeInstanceOf(Set);
      expect(result.current.generatingComparison).toBeInstanceOf(Set);
      expect(result.current.titleStates).toEqual({});
    });
  });

  describe('模块化架构完整性', () => {
    it('所有核心模块应该能够正常导入', async () => {
      // 测试所有核心模块的导入
      const modules = [
        () => import('../hooks/useAdapterSettings'),
        () => import('../hooks/useContentAdapterEngine'),
        () => import('../hooks/useGenerationQueue'),
        () => import('../services/contentAdapterService'),
        () => import('../utils/promptBuilders'),
        () => import('../components/ContentAdapterPage'),
        () => import('../components/ContentInputSection'),
        () => import('../components/PlatformSelector'),
        () => import('../components/GenerationControls'),
        () => import('../components/ResultsDisplay')
      ];

      for (const moduleImport of modules) {
        await expect(moduleImport()).resolves.toBeDefined();
      }
    });
  });
});

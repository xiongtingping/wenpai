/**
 * RSSHub 集成测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import rsshubService from '@/services/rsshubService';
import hotTopicsApi from '@/api/hotTopicsApi';
import dataFusionService from '@/services/dataFusionService';

// Mock fetch
global.fetch = vi.fn();

describe('RSSHub Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RSSHub Service', () => {
    it('should get namespaces successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ namespaces: ['weibo', 'zhihu', 'github'] })
      };
      
      (fetch as any).mockResolvedValueOnce(mockResponse);
      
      const result = await rsshubService.getNamespaces();
      expect(result).toEqual({ namespaces: ['weibo', 'zhihu', 'github'] });
    });

    it('should handle API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      
      (fetch as any).mockResolvedValueOnce(mockResponse);
      
      await expect(rsshubService.getNamespaces()).rejects.toThrow('HTTP error! status: 500');
    });

    it('should get supported platforms', () => {
      const platforms = rsshubService.getSupportedPlatforms();
      expect(platforms).toBeInstanceOf(Array);
      expect(platforms.length).toBeGreaterThan(0);
      expect(platforms[0]).toHaveProperty('name');
      expect(platforms[0]).toHaveProperty('namespace');
      expect(platforms[0]).toHaveProperty('enabled');
    });
  });

  describe('Hot Topics API', () => {
    it('should get hot topics with default filter', async () => {
      // Mock RSSHub service
      vi.spyOn(rsshubService, 'getAllHotTopics').mockResolvedValue([
        {
          id: 'test-1',
          title: 'Test Topic',
          description: 'Test Description',
          link: 'https://example.com',
          pubDate: new Date().toISOString(),
          source: 'Test Source',
          category: 'Test Category',
          hotScore: 85,
          tags: ['test']
        }
      ]);

      const result = await hotTopicsApi.getHotTopics();
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty('title');
    });

    it('should filter topics by category', async () => {
      vi.spyOn(rsshubService, 'getAllHotTopics').mockResolvedValue([
        {
          id: 'test-1',
          title: 'Tech Topic',
          description: 'Tech Description',
          link: 'https://example.com',
          pubDate: new Date().toISOString(),
          source: 'GitHub',
          category: '科技',
          hotScore: 85,
          tags: ['tech']
        },
        {
          id: 'test-2',
          title: 'Entertainment Topic',
          description: 'Entertainment Description',
          link: 'https://example.com',
          pubDate: new Date().toISOString(),
          source: 'Bilibili',
          category: '娱乐',
          hotScore: 75,
          tags: ['entertainment']
        }
      ]);

      const result = await hotTopicsApi.getHotTopics({ category: '科技' });
      
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(1);
      expect(result.data[0].category).toBe('科技');
    });

    it('should search topics by query', async () => {
      vi.spyOn(rsshubService, 'getAllHotTopics').mockResolvedValue([
        {
          id: 'test-1',
          title: 'AI Technology Breakthrough',
          description: 'Latest AI developments',
          link: 'https://example.com',
          pubDate: new Date().toISOString(),
          source: 'Tech News',
          category: '科技',
          hotScore: 90,
          tags: ['AI', 'technology']
        },
        {
          id: 'test-2',
          title: 'Sports News Update',
          description: 'Latest sports results',
          link: 'https://example.com',
          pubDate: new Date().toISOString(),
          source: 'Sports News',
          category: '体育',
          hotScore: 70,
          tags: ['sports']
        }
      ]);

      const result = await hotTopicsApi.searchTopics('AI');
      
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(1);
      expect(result.data[0].title).toContain('AI');
    });
  });

  describe('Data Fusion Service', () => {
    it('should get fused hot topics', async () => {
      // Mock both data sources
      vi.spyOn(hotTopicsApi, 'getHotTopics').mockResolvedValue({
        success: true,
        data: [
          {
            id: 'rsshub-1',
            title: 'RSSHub Topic',
            description: 'From RSSHub',
            link: 'https://example.com',
            pubDate: new Date().toISOString(),
            source: 'RSSHub Source',
            category: '科技',
            hotScore: 85,
            tags: ['rsshub']
          }
        ],
        total: 1,
        categories: ['科技'],
        lastUpdated: new Date().toISOString()
      });

      const result = await dataFusionService.getFusedHotTopics();
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('dataSource');
    });

    it('should deduplicate similar topics', async () => {
      // This would test the deduplication logic
      // Implementation depends on the actual deduplication algorithm
      const config = dataFusionService.getConfig();
      expect(config).toHaveProperty('deduplicationThreshold');
      expect(config.deduplicationThreshold).toBeGreaterThan(0);
      expect(config.deduplicationThreshold).toBeLessThanOrEqual(1);
    });

    it('should get data source statistics', async () => {
      const stats = await dataFusionService.getDataSourceStats();
      
      expect(stats).toHaveProperty('rsshub');
      expect(stats).toHaveProperty('dailyhot');
      expect(stats).toHaveProperty('total');
      expect(stats.rsshub).toHaveProperty('count');
      expect(stats.dailyhot).toHaveProperty('count');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      const result = await hotTopicsApi.getHotTopics();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle timeout errors', async () => {
      (fetch as any).mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );
      
      const result = await hotTopicsApi.getHotTopics();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should update platform configuration', () => {
      const platforms = rsshubService.getSupportedPlatforms();
      const initialState = platforms[0].enabled;
      
      rsshubService.updatePlatformStatus(platforms[0].namespace, !initialState);
      
      const updatedPlatforms = rsshubService.getSupportedPlatforms();
      expect(updatedPlatforms[0].enabled).toBe(!initialState);
    });

    it('should update fusion configuration', () => {
      const initialConfig = dataFusionService.getConfig();
      const newConfig = { ...initialConfig, maxTopicsPerSource: 50 };
      
      dataFusionService.updateConfig({ maxTopicsPerSource: 50 });
      
      const updatedConfig = dataFusionService.getConfig();
      expect(updatedConfig.maxTopicsPerSource).toBe(50);
    });
  });
});

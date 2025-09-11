/**
 * MD2Card缓存管理器
 * 提供模板缓存、预览缓存、设置缓存等功能
 */

import { CardTemplate, CardConfiguration, CardData } from '@/components/creative/MD2CardPage';
import { ParsedContent } from '@/components/creative/md2card/MarkdownParser';

// 缓存配置
interface CacheConfig {
  maxSize: number;
  ttl: number; // 生存时间（毫秒）
}

// 缓存项
interface CacheItem<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

// 缓存键
type CacheKey = string;

/**
 * LRU缓存实现
 */
class LRUCache<T> {
  private cache = new Map<CacheKey, CacheItem<T>>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  /**
   * 获取缓存项
   */
  get(key: CacheKey): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问信息
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    // 移到最前面（LRU策略）
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.data;
  }

  /**
   * 设置缓存项
   */
  set(key: CacheKey, data: T): void {
    // 如果缓存已满，移除最少使用的项
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    };

    this.cache.set(key, item);
  }

  /**
   * 删除缓存项
   */
  delete(key: CacheKey): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 获取缓存统计信息
   */
  stats() {
    const items = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      totalAccess: items.reduce((sum, item) => sum + item.accessCount, 0),
      avgAccessCount: items.length > 0 ? 
        items.reduce((sum, item) => sum + item.accessCount, 0) / items.length : 0,
      oldestTimestamp: Math.min(...items.map(item => item.timestamp)),
      newestTimestamp: Math.max(...items.map(item => item.timestamp))
    };
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > this.config.ttl;
  }

  /**
   * 移除最少使用的缓存项
   */
  private evictLeastUsed(): void {
    let lruKey: CacheKey | null = null;
    let minScore = Infinity;

    for (const [key, item] of this.cache.entries()) {
      // 计算分数：最近访问时间权重更高
      const timeFactor = (Date.now() - item.lastAccessed) / 1000; // 秒
      const accessFactor = 1 / (item.accessCount + 1);
      const score = timeFactor * accessFactor;

      if (score > minScore) {
        minScore = score;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }
}

/**
 * MD2Card缓存管理器
 */
export class MD2CardCacheManager {
  private templateCache: LRUCache<CardTemplate>;
  private previewCache: LRUCache<string>; // Base64图片数据
  private parsedContentCache: LRUCache<ParsedContent>;
  private settingsCache: LRUCache<CardConfiguration>;
  private historyCache: LRUCache<CardData>;

  constructor() {
    // 模板缓存 - 长期缓存
    this.templateCache = new LRUCache<CardTemplate>({
      maxSize: 50,
      ttl: 24 * 60 * 60 * 1000 // 24小时
    });

    // 预览缓存 - 中期缓存
    this.previewCache = new LRUCache<string>({
      maxSize: 100,
      ttl: 30 * 60 * 1000 // 30分钟
    });

    // 解析内容缓存 - 短期缓存
    this.parsedContentCache = new LRUCache<ParsedContent>({
      maxSize: 200,
      ttl: 10 * 60 * 1000 // 10分钟
    });

    // 设置缓存 - 长期缓存
    this.settingsCache = new LRUCache<CardConfiguration>({
      maxSize: 20,
      ttl: 7 * 24 * 60 * 60 * 1000 // 7天
    });

    // 历史记录缓存 - 中期缓存
    this.historyCache = new LRUCache<CardData>({
      maxSize: 50,
      ttl: 60 * 60 * 1000 // 1小时
    });

    // 定期清理过期缓存
    this.startCleanupTimer();
  }

  /**
   * 模板缓存操作
   */
  template = {
    get: (templateId: string): CardTemplate | null => {
      return this.templateCache.get(templateId);
    },

    set: (templateId: string, template: CardTemplate): void => {
      this.templateCache.set(templateId, template);
    },

    preload: async (templates: CardTemplate[]): Promise<void> => {
      for (const template of templates) {
        this.templateCache.set(template.id, template);
      }
    },

    stats: () => this.templateCache.stats()
  };

  /**
   * 预览缓存操作
   */
  preview = {
    get: (cacheKey: string): string | null => {
      return this.previewCache.get(cacheKey);
    },

    set: (cacheKey: string, imageData: string): void => {
      this.previewCache.set(cacheKey, imageData);
    },

    generateKey: (
      markdown: string, 
      templateId: string, 
      config: CardConfiguration
    ): string => {
      const configHash = this.hashObject({
        templateId,
        colors: config.colors,
        typography: config.typography,
        layout: config.layout
      });
      const contentHash = this.hashString(markdown);
      return `preview_${contentHash}_${configHash}`;
    },

    clear: (): void => {
      this.previewCache.clear();
    },

    stats: () => this.previewCache.stats()
  };

  /**
   * 解析内容缓存操作
   */
  parsedContent = {
    get: (markdown: string): ParsedContent | null => {
      const key = this.hashString(markdown);
      return this.parsedContentCache.get(key);
    },

    set: (markdown: string, parsed: ParsedContent): void => {
      const key = this.hashString(markdown);
      this.parsedContentCache.set(key, parsed);
    },

    stats: () => this.parsedContentCache.stats()
  };

  /**
   * 设置缓存操作
   */
  settings = {
    get: (userId: string): CardConfiguration | null => {
      return this.settingsCache.get(`settings_${userId}`);
    },

    set: (userId: string, config: CardConfiguration): void => {
      this.settingsCache.set(`settings_${userId}`, config);
    },

    clear: (userId: string): boolean => {
      return this.settingsCache.delete(`settings_${userId}`);
    },

    stats: () => this.settingsCache.stats()
  };

  /**
   * 历史记录缓存操作
   */
  history = {
    get: (cardId: string): CardData | null => {
      return this.historyCache.get(cardId);
    },

    set: (cardData: CardData): void => {
      this.historyCache.set(cardData.id, cardData);
    },

    getRecent: (limit: number = 10): CardData[] => {
      const allItems = Array.from(this.historyCache['cache'].entries())
        .map(([_, item]) => item)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
      
      return allItems.map(item => item.data);
    },

    clear: (): void => {
      this.historyCache.clear();
    },

    stats: () => this.historyCache.stats()
  };

  /**
   * 获取所有缓存统计信息
   */
  getAllStats() {
    return {
      template: this.template.stats(),
      preview: this.preview.stats(),
      parsedContent: this.parsedContent.stats(),
      settings: this.settings.stats(),
      history: this.history.stats(),
      totalMemoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * 清空所有缓存
   */
  clearAll(): void {
    this.templateCache.clear();
    this.previewCache.clear();
    this.parsedContentCache.clear();
    this.settingsCache.clear();
    this.historyCache.clear();
  }

  /**
   * 预热缓存
   */
  async warmup(config: {
    templates?: CardTemplate[];
    commonSettings?: CardConfiguration[];
    commonMarkdown?: string[];
  }): Promise<void> {
    // 预加载模板
    if (config.templates) {
      await this.template.preload(config.templates);
    }

    // 预加载常用设置
    if (config.commonSettings) {
      config.commonSettings.forEach((setting, index) => {
        this.settingsCache.set(`warmup_${index}`, setting);
      });
    }

    // 预解析常用Markdown
    if (config.commonMarkdown) {
      const { MarkdownParser } = await import('./MarkdownParser');
      const parser = new MarkdownParser();
      
      config.commonMarkdown.forEach(markdown => {
        const parsed = parser.parse(markdown);
        this.parsedContent.set(markdown, parsed);
      });
    }
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    // 每5分钟清理一次过期缓存
    setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000);
  }

  /**
   * 清理过期缓存
   */
  private cleanupExpired(): void {
    const caches = [
      this.templateCache,
      this.previewCache,
      this.parsedContentCache,
      this.settingsCache,
      this.historyCache
    ];

    caches.forEach(cache => {
      const expiredKeys: string[] = [];
      
      for (const [key, item] of cache['cache'].entries()) {
        if ((cache as any)['isExpired'](item)) {
          expiredKeys.push(key);
        }
      }
      
      expiredKeys.forEach(key => cache.delete(key));
    });
  }

  /**
   * 估算内存使用量
   */
  private estimateMemoryUsage(): number {
    const stats = this.getAllStats();
    
    // 粗略估算每个缓存项的平均大小
    const estimatedSizes = {
      template: 2048, // 2KB per template
      preview: 51200, // 50KB per preview image
      parsedContent: 1024, // 1KB per parsed content
      settings: 512, // 512B per settings
      history: 4096 // 4KB per history item
    };

    return (
      stats.template.size * estimatedSizes.template +
      stats.preview.size * estimatedSizes.preview +
      stats.parsedContent.size * estimatedSizes.parsedContent +
      stats.settings.size * estimatedSizes.settings +
      stats.history.size * estimatedSizes.history
    );
  }

  /**
   * 字符串哈希
   */
  private hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * 对象哈希
   */
  private hashObject(obj: any): string {
    return this.hashString(JSON.stringify(obj));
  }
}

// 全局缓存管理器实例
export const md2cardCache = new MD2CardCacheManager();

/**
 * React Hook：使用MD2Card缓存
 */
export function useMD2CardCache() {
  return {
    cache: md2cardCache,
    
    // 便捷方法
    getCachedPreview: (markdown: string, templateId: string, config: CardConfiguration) => {
      const key = md2cardCache.preview.generateKey(markdown, templateId, config);
      return md2cardCache.preview.get(key);
    },
    
    setCachedPreview: (markdown: string, templateId: string, config: CardConfiguration, imageData: string) => {
      const key = md2cardCache.preview.generateKey(markdown, templateId, config);
      md2cardCache.preview.set(key, imageData);
    },
    
    getCachedParsedContent: (markdown: string) => {
      return md2cardCache.parsedContent.get(markdown);
    },
    
    setCachedParsedContent: (markdown: string, parsed: ParsedContent) => {
      md2cardCache.parsedContent.set(markdown, parsed);
    },
    
    getStats: () => md2cardCache.getAllStats(),
    
    clearCache: () => md2cardCache.clearAll()
  };
}
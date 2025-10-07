/**
 * 快速引用数据服务
 * 统一管理品牌库、资料库、雷达收藏的数据获取
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { globalDataManager } from '@/services/unifiedDataManager';
import { bookmarkService } from '@/services/bookmarkService';
import { favoritesService } from '@/services/favoritesService';

export interface QuickReferenceItem {
  id: string;
  title: string;
  content: string;
  type: 'brand' | 'library' | 'radar';
  format: 'text' | 'link' | 'image' | 'pdf';
  source?: string;
  tags: string[];
  createdAt: string;
  summary?: string;
  metadata?: Record<string, any>;
  // 新增字段用于数据验证和可靠性
  verified?: boolean;
  lastUpdated?: string;
  reliability?: 'high' | 'medium' | 'low';
  sourceUrl?: string;
}

export interface QuickReferenceDataService {
  getBrandItems(): Promise<QuickReferenceItem[]>;
  getLibraryItems(): Promise<QuickReferenceItem[]>;
  getRadarItems(): Promise<QuickReferenceItem[]>;
  searchItems(query: string, type?: 'brand' | 'library' | 'radar'): Promise<QuickReferenceItem[]>;
  validateItem(item: QuickReferenceItem): boolean;
  refreshData(type: 'brand' | 'library' | 'radar'): Promise<void>;
  clearCache(): void;
}

// 统一的内容清洗器：移除<head>/<script>/<style>等非正文标签，仅保留<body>或文本内容
function sanitizeToPlainText(input: string): string {
  if (!input) return '';
  try {
    // 快速路径：如果不存在HTML标签，直接返回去掉多余空白的文本
    const hasTag = /<[^>]+>/.test(input);
    if (!hasTag) return input.trim();

    // 优先尝试浏览器环境的DOM解析
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const container = document.createElement('html');
      container.innerHTML = input;

      // 删除<head>/<script>/<style>/<noscript>
      container.querySelectorAll('head, script, style, noscript, meta, link').forEach(el => el.remove());

      // 若存在<body>，优先从<body>提取文本，否则整个文档文本
      const body = container.querySelector('body');
      const text = (body?.textContent ?? container.textContent ?? '').trim();

      // 规范化空白
      return text.replace(/\s+/g, ' ').trim();
    }

    // 非浏览器环境的兜底：粗略移除<head>块与所有标签
    const withoutHead = input.replace(/<head[\s\S]*?>[\s\S]*?<\/head>/gi, '');
    const withoutScripts = withoutHead.replace(/<(script|style|noscript)[\s\S]*?>[\s\S]*?<\/\1>/gi, '');
    const stripped = withoutScripts.replace(/<[^>]+>/g, ' ');
    return stripped.replace(/\s+/g, ' ').trim();
  } catch {
    return input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

class QuickReferenceDataServiceImpl implements QuickReferenceDataService {
  private cache = new Map<string, { data: QuickReferenceItem[]; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  /**
   * 获取品牌库内容
   */
  async getBrandItems(): Promise<QuickReferenceItem[]> {
    const cacheKey = 'brand-items';

    if (this.isCacheValid(cacheKey)) {
      console.log('📦 使用缓存的品牌库数据');
      return this.cache.get(cacheKey)!.data;
    }

    try {
      console.log('🔍 开始加载品牌库数据...');

      // 从品牌资产数据获取（强制刷新，避免缓存导致不同步）
      const brandAssets = await globalDataManager.getData<any[]>('brand_assets', true) || [];
      console.log(`📊 品牌库原始数据数量: ${brandAssets.length}`);

      const items: QuickReferenceItem[] = brandAssets
        .map(asset => this.enhanceItem({
          id: asset.id || `brand-${Date.now()}-${Math.random()}`,
          title: sanitizeToPlainText(asset.name || asset.title || 'u64cdu4f5cu5931u8d25'),
          content: sanitizeToPlainText(asset.description || asset.content || ''),
          type: 'brand' as const,
          format: this.detectFormat(asset),
          source: '品牌库',
          tags: asset.tags || [],
          createdAt: asset.createdAt || new Date().toISOString(),
          summary: sanitizeToPlainText(asset.summary || this.generateSummary(asset.description || asset.content || '')),
          metadata: {
            assetType: asset.type,
            category: asset.category
          }
        }))
        .filter(item => this.validateItem(item)); // 过滤无效数据

      console.log(`✅ 品牌库有效数据数量: ${items.length}`);

      // 缓存结果
      this.cache.set(cacheKey, { data: items, timestamp: Date.now() });

      return items;
    } catch (error) {
      console.error('❌ 获取品牌库内容失败:', error);
      return [];
    }
  }

  /**
   * 获取资料库内容
   */
  async getLibraryItems(): Promise<QuickReferenceItem[]> {
    const cacheKey = 'library-items';

    if (this.isCacheValid(cacheKey)) {
      console.log('📦 使用缓存的资料库数据');
      return this.cache.get(cacheKey)!.data;
    }

    try {
      console.log('🔍 开始加载资料库数据...');

      // 从收藏服务获取所有收藏（强制刷新，避免缓存导致不同步）
      const favorites = await favoritesService.getFavorites(true);
      console.log(`📊 收藏服务返回数据数量: ${favorites.length}`);

      // 🔧 修复：不再过滤类型，显示所有收藏内容
      // 原来的过滤条件太严格，导致很多内容无法显示
      const items: QuickReferenceItem[] = favorites.map(fav => ({
        id: fav.id,
        title: sanitizeToPlainText(fav.title),
        content: sanitizeToPlainText(fav.content),
        type: 'library' as const,
        format: this.detectFormatFromContent(fav.content),
        source: fav.source || '我的资料库',
        tags: fav.tags,
        createdAt: new Date(fav.createdAt).toISOString(),
        summary: sanitizeToPlainText(fav.description || this.generateSummary(fav.content)),
        metadata: fav.metadata
      }));

      console.log(`✅ 资料库有效数据数量: ${items.length}`);

      // 缓存结果
      this.cache.set(cacheKey, { data: items, timestamp: Date.now() });

      return items;
    } catch (error) {
      console.error('❌ 获取资料库内容失败:', error);
      return [];
    }
  }

  /**
   * 获取雷达收藏内容
   */
  async getRadarItems(): Promise<QuickReferenceItem[]> {
    const cacheKey = 'radar-items';

    if (this.isCacheValid(cacheKey)) {
      console.log('📦 使用缓存的雷达收藏数据');
      return this.cache.get(cacheKey)!.data;
    }

    try {
      console.log('🔍 开始加载雷达收藏数据...');

      // 从书签服务获取热点话题书签（强制刷新，避免缓存）
      const topicBookmarks = await bookmarkService.getTopicBookmarks(true);
      console.log(`📊 雷达收藏原始数据数量: ${topicBookmarks.length}`);

      const items: QuickReferenceItem[] = topicBookmarks.map(bookmark => ({
        id: bookmark.id,
        title: sanitizeToPlainText(bookmark.title),
        content: sanitizeToPlainText(bookmark.content || bookmark.description || ''),
        type: 'radar' as const,
        format: bookmark.url ? 'link' : 'text',
        source: bookmark.platform || '全网雷达',
        tags: bookmark.tags || [],
        createdAt: new Date(bookmark.timestamp || bookmark.createdAt).toISOString(),
        summary: sanitizeToPlainText(this.generateSummary(bookmark.content || bookmark.description || '')),
        metadata: {
          url: bookmark.url,
          platform: bookmark.platform,
          category: bookmark.category
        }
      }));

      console.log(`✅ 雷达收藏有效数据数量: ${items.length}`);

      // 缓存结果
      this.cache.set(cacheKey, { data: items, timestamp: Date.now() });

      return items;
    } catch (error) {
      console.error('❌ 获取雷达收藏内容失败:', error);
      return [];
    }
  }

  /**
   * 搜索内容
   */
  async searchItems(query: string, type?: 'brand' | 'library' | 'radar'): Promise<QuickReferenceItem[]> {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    let allItems: QuickReferenceItem[] = [];

    // 根据类型获取数据
    if (!type || type === 'brand') {
      const brandItems = await this.getBrandItems();
      allItems.push(...brandItems);
    }
    
    if (!type || type === 'library') {
      const libraryItems = await this.getLibraryItems();
      allItems.push(...libraryItems);
    }
    
    if (!type || type === 'radar') {
      const radarItems = await this.getRadarItems();
      allItems.push(...radarItems);
    }

    // 执行搜索
    return allItems.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.content.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      (item.summary && item.summary.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * 检测资产格式
   */
  private detectFormat(asset: any): 'text' | 'link' | 'image' | 'pdf' {
    if (asset.url) return 'link';
    if (asset.type === 'image' || asset.format === 'image') return 'image';
    if (asset.type === 'pdf' || asset.format === 'pdf') return 'pdf';
    return 'text';
  }

  /**
   * 从内容检测格式
   */
  private detectFormatFromContent(content: string): 'text' | 'link' | 'image' | 'pdf' {
    if (content.startsWith('http')) return 'link';
    if (content.includes('.jpg') || content.includes('.png') || content.includes('.gif')) return 'image';
    if (content.includes('.pdf')) return 'pdf';
    return 'text';
  }

  /**
   * 生成内容摘要
   */
  private generateSummary(content: string): string {
    if (!content) return '';
    const maxLength = 100;
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...'
      : content;
  }

  /**
   * 验证引用项目的数据完整性和可靠性
   */
  validateItem(item: QuickReferenceItem): boolean {
    // 基础字段验证
    if (!item.id || !item.title || !item.content || !item.type) {
      return false;
    }

    // 内容长度验证
    if (item.content.length < 10 || item.content.length > 50000) {
      return false;
    }

    // 标题长度验证
    if (item.title.length < 2 || item.title.length > 200) {
      return false;
    }

    // 标签验证
    if (item.tags && item.tags.length > 20) {
      return false;
    }

    // URL格式验证（如果是链接类型）
    if (item.format === 'link' && item.sourceUrl) {
      try {
        new URL(item.sourceUrl);
      } catch {
        return false;
      }
    }

    return true;
  }

  /**
   * 增强数据项目，添加可靠性评估
   */
  private enhanceItem(item: QuickReferenceItem): QuickReferenceItem {
    const enhanced = { ...item };

    // 评估可靠性
    enhanced.reliability = this.assessReliability(item);

    // 设置验证状态
    enhanced.verified = this.validateItem(item);

    // 更新时间戳
    enhanced.lastUpdated = new Date().toISOString();

    return enhanced;
  }

  /**
   * 评估内容可靠性
   */
  private assessReliability(item: QuickReferenceItem): 'high' | 'medium' | 'low' {
    let score = 0;

    // 内容长度评分
    if (item.content.length > 100) score += 1;
    if (item.content.length > 500) score += 1;

    // 标签数量评分
    if (item.tags.length > 0) score += 1;
    if (item.tags.length > 2) score += 1;

    // 来源评分
    if (item.source) score += 1;
    if (item.sourceUrl) score += 1;

    // 摘要评分
    if (item.summary) score += 1;

    // 元数据评分
    if (item.metadata && Object.keys(item.metadata).length > 0) score += 1;

    // 时效性评分
    if (item.createdAt) {
      const createdDate = new Date(item.createdAt);
      const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 30) score += 1; // 30天内的内容更可靠
    }

    if (score >= 7) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
    console.log('快速引用datacachealreadyclearing');
  }

  /**
   * 刷新指定类型的数据
   */
  async refreshData(type: 'brand' | 'library' | 'radar'): Promise<void> {
    const cacheKey = `${type}-items`;
    this.cache.delete(cacheKey);
    
    // 重新获取数据
    switch (type) {
      case 'brand':
        await this.getBrandItems();
        break;
      case 'library':
        await this.getLibraryItems();
        break;
      case 'radar':
        await this.getRadarItems();
        break;
    }
  }
}

// 导出单例实例
export const quickReferenceDataService = new QuickReferenceDataServiceImpl();

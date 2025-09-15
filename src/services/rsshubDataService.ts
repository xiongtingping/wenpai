/**
 * RSSHub 数据服务 - 独立服务，不影响原有功能
 * 为现有全网雷达提供额外的数据源支持
 */

export interface RSSHubTopic {
  id: string;
  title: string;
  description?: string;
  link: string;
  pubDate: string;
  source: string;
  platform: string;
  category: string;
  hotScore: number;
  tags: string[];
}

export interface RSSHubConfig {
  enabled: boolean;
  baseUrl: string;
  timeout: number;
  platforms: {
    weibo: boolean;
    zhihu: boolean;
    github: boolean;
    bilibili: boolean;
  };
}

class RSSHubDataService {
  private config: RSSHubConfig;
  private cache: Map<string, { data: RSSHubTopic[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟

  constructor() {
    this.config = {
      enabled: true,
      baseUrl: import.meta.env.VITE_RSSHUB_API_URL || 'https://rsshub.app',
      timeout: parseInt(import.meta.env.VITE_RSSHUB_TIMEOUT || '10000'),
      platforms: {
        weibo: true,
        zhihu: true,
        github: true,
        bilibili: true
      }
    };
  }

  /**
   * 获取RSSHub热点数据（作为原有数据的补充）
   */
  async getSupplementaryTopics(): Promise<RSSHubTopic[]> {
    if (!this.config.enabled) {
      if (import.meta.env.DEV) {
        console.log('ℹ️ RSSHub功能已禁用');
      }
      return [];
    }

    try {
      const cacheKey = 'rsshub_topics';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        if (import.meta.env.DEV) {
          console.log('📦 使用RSSHub缓存数据:', cached.length, '条');
        }
        return cached;
      }

      // 先检查服务是否可用
      const isAvailable = await this.isServiceAvailable();
      if (!isAvailable) {
        if (import.meta.env.DEV) {
          console.log('ℹ️ RSSHub服务不可用，跳过数据获取');
        }
        return [];
      }

      const topics = await this.fetchRSSHubData();
      this.setCache(cacheKey, topics);

      if (import.meta.env.DEV) {
        console.log('✅ 获取RSSHub数据成功:', topics.length, '条');
      }

      return topics;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('ℹ️ RSSHub数据获取失败，继续使用原有数据源');
      }
      return [];
    }
  }

  /**
   * 获取分类热点的RSSHub补充数据
   */
  async getCategorizedSupplementaryTopics(): Promise<Record<string, RSSHubTopic[]>> {
    if (!this.config.enabled) {
      return {};
    }

    try {
      const cacheKey = 'rsshub_categorized_topics';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        if (import.meta.env.DEV) {
          console.log('📦 使用RSSHub分类缓存数据');
        }
        return this.categorizeCachedTopics(cached);
      }

      const topics = await this.getSupplementaryTopics();
      const categorized = this.categorizeTopics(topics);

      if (import.meta.env.DEV) {
        console.log('📊 RSSHub分类数据统计:', Object.keys(categorized).map(cat => `${cat}: ${categorized[cat].length}`));
      }

      return categorized;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('ℹ️ RSSHub分类数据获取失败');
      }
      return {};
    }
  }

  /**
   * 将RSSHub数据按分类整理
   */
  private categorizeTopics(topics: RSSHubTopic[]): Record<string, RSSHubTopic[]> {
    const categories: Record<string, RSSHubTopic[]> = {
      '社会': [],
      '科技': [],
      '娱乐': [],
      '体育': [],
      '财经': [],
      '汽车': [],
      '文化': [],
      '游戏': [],
      '生活': [],
      '美食': [],
      '天气': [],
      '农业': [],
      '宠物': [],
      '房产': [],
      '健康': [],
      '旅游': [],
      '环保': []
    };

    topics.forEach(topic => {
      const category = this.classifyTopic(topic);
      if (categories[category]) {
        categories[category].push(topic);
      } else {
        // 如果没有匹配的分类，放入社会分类
        categories['社会'].push(topic);
      }
    });

    return categories;
  }

  /**
   * 智能分类单个话题
   */
  private classifyTopic(topic: RSSHubTopic): string {
    const content = `${topic.title} ${topic.description}`.toLowerCase();

    // 科技关键词
    if (this.containsKeywords(content, ['ai', '人工智能', '科技', '技术', '互联网', '手机', '电脑', '软件', '硬件', '芯片', '5g', '区块链', '云计算'])) {
      return '科技';
    }

    // 娱乐关键词
    if (this.containsKeywords(content, ['明星', '电影', '音乐', '娱乐', '综艺', '演员', '导演', '歌手', '演唱会', '电视剧'])) {
      return '娱乐';
    }

    // 体育关键词
    if (this.containsKeywords(content, ['体育', '运动', '比赛', '足球', '篮球', '奥运', '世界杯', '冠军', '球员', '赛事'])) {
      return '体育';
    }

    // 财经关键词
    if (this.containsKeywords(content, ['股票', '经济', '金融', '投资', '银行', '基金', '货币', '财经', '市场', '企业'])) {
      return '财经';
    }

    // 汽车关键词
    if (this.containsKeywords(content, ['汽车', '车', '新能源', '电动车', '自动驾驶', '特斯拉', '比亚迪', '汽车品牌'])) {
      return '汽车';
    }

    // 游戏关键词
    if (this.containsKeywords(content, ['游戏', '电竞', '手游', '网游', '主机', '游戏机', 'steam', '王者荣耀', '原神'])) {
      return '游戏';
    }

    // 美食关键词
    if (this.containsKeywords(content, ['美食', '餐厅', '菜谱', '烹饪', '食物', '小吃', '饮食', '厨师', '料理'])) {
      return '美食';
    }

    // 健康关键词
    if (this.containsKeywords(content, ['健康', '医疗', '医院', '疾病', '药物', '养生', '健身', '医生', '治疗'])) {
      return '健康';
    }

    // 旅游关键词
    if (this.containsKeywords(content, ['旅游', '旅行', '景点', '酒店', '机票', '度假', '出行', '攻略'])) {
      return '旅游';
    }

    // 默认分类为社会
    return '社会';
  }

  /**
   * 检查内容是否包含关键词
   */
  private containsKeywords(content: string, keywords: string[]): boolean {
    return keywords.some(keyword => content.includes(keyword));
  }

  /**
   * 处理缓存的分类数据
   */
  private categorizeCachedTopics(topics: RSSHubTopic[]): Record<string, RSSHubTopic[]> {
    return this.categorizeTopics(topics);
  }

  /**
   * 检查RSSHub服务是否可用
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      // 使用内部API代理检查服务可用性，避免CORS问题
      if (import.meta.env.DEV) {
        console.log('🔍 通过内部API检查热点数据服务可用性...');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时

      // 通过我们的API代理检查服务可用性
      const response = await fetch('/.netlify/functions/api?action=hot-topics&platform=weibo', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (import.meta.env.DEV) {
        console.log('✅ 热点数据服务检查完成:', response.ok);
      }

      return response.ok;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('ℹ️ 热点数据服务暂时不可用:', error instanceof Error ? error.message : 'Unknown error');
      }
      return false;
    }
  }

  /**
   * 获取RSSHub数据统计
   */
  async getDataStats(): Promise<{
    available: boolean;
    count: number;
    platforms: string[];
    lastUpdate: string;
  }> {
    try {
      const available = await this.isServiceAvailable();
      if (!available) {
        return {
          available: false,
          count: 0,
          platforms: [],
          lastUpdate: ''
        };
      }

      const topics = await this.getSupplementaryTopics();
      const platforms = [...new Set(topics.map(t => t.platform))];

      return {
        available: true,
        count: topics.length,
        platforms,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('ℹ️ 获取RSSHub统计数据失败');
      }
      return {
        available: false,
        count: 0,
        platforms: [],
        lastUpdate: ''
      };
    }
  }

  /**
   * 私有方法：获取RSSHub数据
   */
  private async fetchRSSHubData(): Promise<RSSHubTopic[]> {
    const topics: RSSHubTopic[] = [];
    const enabledPlatforms = Object.entries(this.config.platforms)
      .filter(([_, enabled]) => enabled)
      .map(([platform]) => platform);

    if (import.meta.env.DEV) {
      console.log('🔄 开始获取RSSHub数据，启用平台:', enabledPlatforms);
    }

    // 并发获取所有平台数据，但限制并发数量
    const platformPromises = enabledPlatforms.map(async (platform) => {
      try {
        const platformTopics = await this.fetchPlatformData(platform);
        return platformTopics;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.log(`ℹ️ ${platform}平台数据获取失败`);
        }
        return [];
      }
    });

    try {
      const results = await Promise.allSettled(platformPromises);
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          topics.push(...result.value);
        }
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('ℹ️ RSSHub数据获取过程中出现问题');
      }
    }

    const limitedTopics = topics.slice(0, 50); // 限制数量，避免影响性能

    if (import.meta.env.DEV) {
      console.log('📊 RSSHub数据获取完成:', limitedTopics.length, '条');
    }

    return limitedTopics;
  }

  /**
   * 私有方法：获取特定平台数据（通过内部API代理）
   */
  private async fetchPlatformData(platform: string): Promise<RSSHubTopic[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      // 通过内部API代理获取数据，避免CORS问题
      const response = await fetch(`/.netlify/functions/api?action=hot-topics&platform=${platform}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // 将API返回的数据转换为RSSHubTopic格式
        return this.convertApiDataToTopics(data, platform);
      }
      
      return [];
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log(`ℹ️ ${platform}平台数据暂时不可用`);
      }
      return [];
    }
  }

  /**
   * 私有方法：将API数据转换为RSSHubTopic格式
   */
  private convertApiDataToTopics(apiData: any, platform: string): RSSHubTopic[] {
    try {
      const topics: RSSHubTopic[] = [];
      
      if (apiData && apiData.data && Array.isArray(apiData.data)) {
        apiData.data.forEach((item: any, index: number) => {
          topics.push({
            id: `api-${platform}-${Date.now()}-${index}`,
            title: item.title || item.name || i18n.t('common.labels.未知标题'),
            description: item.desc || item.description || item.content || '',
            link: item.url || item.link || '#',
            pubDate: item.time || item.date || new Date().toISOString(),
            source: `API-${platform}`,
            platform,
            category: this.mapPlatformToCategory(platform),
            hotScore: item.hot || item.score || Math.max(0, 100 - index * 2),
            tags: this.extractTags(item.title || '', item.desc || '')
          });
        });
      }
      
      return topics;
    } catch (error) {
      console.warn('API数据转换失败:', error);
      return [];
    }
  }

  /**
   * 私有方法：获取平台路由配置（已弃用，改用API代理）
   */
  private getPlatformRoutes(platform: string): string[] {
    // 保留方法以避免破坏现有代码，但实际不再使用
    return [];
  }

  /**
   * 私有方法：解析RSS数据
   */
  private parseRSSData(xmlText: string, platform: string): RSSHubTopic[] {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');
      const topics: RSSHubTopic[] = [];

      items.forEach((item, index) => {
        const title = item.querySelector('title')?.textContent?.trim();
        const link = item.querySelector('link')?.textContent?.trim();
        const description = item.querySelector('description')?.textContent?.trim();
        const pubDate = item.querySelector('pubDate')?.textContent?.trim();

        if (title && link) {
          topics.push({
            id: `rsshub-${platform}-${Date.now()}-${index}`,
            title,
            description: description || '',
            link,
            pubDate: pubDate || new Date().toISOString(),
            source: `RSSHub-${platform}`,
            platform,
            category: this.mapPlatformToCategory(platform),
            hotScore: Math.max(0, 100 - index * 2), // 简单的热度计算
            tags: this.extractTags(title, description || '')
          });
        }
      });

      return topics;
    } catch (error) {
      console.warn('RSS数据解析失败:', error);
      return [];
    }
  }

  /**
   * 私有方法：平台分类映射
   */
  private mapPlatformToCategory(platform: string): string {
    const categoryMap: Record<string, string> = {
      weibo: '社交',
      zhihu: '知识',
      github: '科技',
      bilibili: '娱乐'
    };
    return categoryMap[platform] || '其他';
  }

  /**
   * 私有方法：提取标签
   */
  private extractTags(title: string, description: string): string[] {
    const content = `${title} ${description}`.toLowerCase();
    const tags: string[] = [];

    const tagKeywords = {
      '热门': ['热搜', '热门', '爆火'],
      '科技': ['ai', '人工智能', '科技', '技术'],
      '娱乐': ['明星', '电影', '音乐', '娱乐'],
      '体育': ['体育', '运动', '比赛'],
      '财经': ['股票', '经济', '金融']
    };

    Object.entries(tagKeywords).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        tags.push(tag);
      }
    });

    return tags;
  }

  /**
   * 缓存相关方法
   */
  private getFromCache(key: string): RSSHubTopic[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: RSSHubTopic[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * 配置管理
   */
  updateConfig(newConfig: Partial<RSSHubConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.cache.clear(); // 清除缓存以应用新配置
  }

  getConfig(): RSSHubConfig {
    return { ...this.config };
  }

  /**
   * 启用/禁用RSSHub功能
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled) {
      this.cache.clear();
    }
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }
}

export default new RSSHubDataService();

/**
 * RSSHub API 集成服务
 * 用于获取各平台热点数据
 */

export interface RSSHubConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export interface HotTopicItem {
  id: string;
  title: string;
  description?: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  hotScore?: number;
  tags?: string[];
}

export interface PlatformConfig {
  name: string;
  namespace: string;
  routes: string[];
  category: string;
  enabled: boolean;
}

class RSSHubService {
  private config: RSSHubConfig;
  private platforms: PlatformConfig[];

  constructor() {
    this.config = {
      baseUrl: import.meta.env.VITE_RSSHUB_API_URL || 'https://rsshub.app',
      timeout: parseInt(import.meta.env.VITE_RSSHUB_TIMEOUT || '10000'),
      retryAttempts: 3
    };

    // 支持的平台配置
    this.platforms = [
      {
        name: '微博热搜',
        namespace: 'weibo',
        routes: ['search/hot'],
        category: '社交媒体',
        enabled: true
      },
      {
        name: '知乎热榜',
        namespace: 'zhihu',
        routes: ['hotlist'],
        category: '问答社区',
        enabled: true
      },
      {
        name: 'GitHub趋势',
        namespace: 'github',
        routes: ['trending/daily'],
        category: '技术开发',
        enabled: true
      },
      {
        name: 'B站热门',
        namespace: 'bilibili',
        routes: ['popular'],
        category: '视频娱乐',
        enabled: true
      },
      {
        name: '抖音热点',
        namespace: 'douyin',
        routes: ['hot'],
        category: '短视频',
        enabled: true
      },
      {
        name: '小红书热门',
        namespace: 'xiaohongshu',
        routes: ['user/notes'],
        category: '生活方式',
        enabled: true
      }
    ];
  }

  /**
   * 获取所有可用的命名空间
   */
  async getNamespaces(): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/namespace`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('getting命名empty间failed:', error);
      throw error;
    }
  }

  /**
   * 获取特定平台的热点数据
   */
  async getPlatformHotTopics(platform: PlatformConfig): Promise<HotTopicItem[]> {
    const results: HotTopicItem[] = [];

    for (const route of platform.routes) {
      try {
        const url = `${this.config.baseUrl}/${platform.namespace}/${route}`;
        const response = await this.fetchWithRetry(url);
        
        if (response) {
          const items = await this.parseRSSResponse(response, platform);
          results.push(...items);
        }
      } catch (error) {
        console.error(`fetching ${platform.name} datafailed:`, error);
      }
    }

    return results;
  }

  /**
   * 获取所有平台的热点数据
   */
  async getAllHotTopics(): Promise<HotTopicItem[]> {
    const allTopics: HotTopicItem[] = [];
    const enabledPlatforms = this.platforms.filter(p => p.enabled);

    // 并发获取所有平台数据
    const promises = enabledPlatforms.map(platform => 
      this.getPlatformHotTopics(platform)
    );

    try {
      const results = await Promise.allSettled(promises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allTopics.push(...result.value);
        } else {
          console.error(`平台 ${enabledPlatforms[index].name} datagettingfailed:`, result.reason);
        }
      });

      // 按热度排序并去重
      return this.sortAndDeduplicateTopics(allTopics);
    } catch (error) {
      console.error('getting热点datafailed:', error);
      throw error;
    }
  }

  /**
   * 带重试的请求方法
   */
  private async fetchWithRetry(url: string, attempt = 1): Promise<Response | null> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        console.warn(`requestfailed，the ${attempt} timesretrying: ${url}`);
        await this.delay(1000 * attempt); // 递增延迟
        return this.fetchWithRetry(url, attempt + 1);
      }
      
      console.error(`request最终failed: ${url}`, error);
      return null;
    }
  }

  /**
   * 解析RSS响应数据
   */
  private async parseRSSResponse(response: Response, platform: PlatformConfig): Promise<HotTopicItem[]> {
    try {
      const text = await response.text();
      
      // 这里需要根据RSSHub返回的格式进行解析
      // 通常是RSS XML格式，需要解析成JSON
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      
      const items = xmlDoc.querySelectorAll('item');
      const hotTopics: HotTopicItem[] = [];

      items.forEach((item, index) => {
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();

        if (title && link) {
          hotTopics.push({
            id: `${platform.namespace}-${Date.now()}-${index}`,
            title: title.trim(),
            description: description.trim(),
            link,
            pubDate,
            source: platform.name,
            category: platform.category,
            hotScore: this.calculateHotScore(title, description, index),
            tags: this.extractTags(title, description)
          });
        }
      });

      return hotTopics;
    } catch (error) {
      console.error('parsingRSSdatafailed:', error);
      return [];
    }
  }

  /**
   * 计算热度分数
   */
  private calculateHotScore(title: string, description: string, index: number): number {
    let score = 100 - index; // 基础分数，排名越前分数越高
    
    // 根据标题长度调整
    if (title.length > 20) score += 5;
    
    // 根据描述长度调整
    if (description && description.length > 50) score += 3;
    
    // 检查热门关键词
    const hotKeywords = ['热搜', '爆火', '突发', '重大', '独家', '最新'];
    const hasHotKeyword = hotKeywords.some(keyword => 
      title.includes(keyword) || description.includes(keyword)
    );
    if (hasHotKeyword) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 提取标签
   */
  private extractTags(title: string, description: string): string[] {
    const tags: string[] = [];
    const content = `${title} ${description}`.toLowerCase();

    // 预定义标签映射
    const tagMap = {
      '科技': ['ai', '人工智能', '科技', '技术', '互联网', '数码'],
      '娱乐': ['明星', '电影', '音乐', '综艺', '娱乐'],
      '体育': ['足球', '篮球', '体育', '运动', '比赛'],
      '财经': ['股票', '经济', '金融', '投资', '财经'],
      '社会': ['社会', '新闻', '事件', '热点'],
      '游戏': ['游戏', '电竞', '手游', '网游']
    };

    Object.entries(tagMap).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        tags.push(tag);
      }
    });

    return tags;
  }

  /**
   * 排序和去重（更稳健）：
   * 1) 先用规范化后的链接做精准去重
   * 2) 再用规范化标题做相似度去重（阈值更严格）
   * 3) 合并重复项的来源/标签/热度（取最大）
   */
  private sortAndDeduplicateTopics(topics: HotTopicItem[]): HotTopicItem[] {
    const byCanonicalLink = new Map<string, HotTopicItem>();
    const results: HotTopicItem[] = [];

    for (const topic of topics) {
      const canonical = this.getCanonicalLink(topic.link);
      const normTitle = this.normalizeTitle(topic.title);

      // 1) 基于规范化链接的精确去重
      if (canonical) {
        const existed = byCanonicalLink.get(canonical);
        if (existed) {
          // 合并：保留更高热度，合并标签与来源
          existed.hotScore = Math.max(existed.hotScore || 0, topic.hotScore || 0);
          const tags = new Set([...(existed.tags || []), ...(topic.tags || [])]);
          existed.tags = Array.from(tags);
          // 若来源不同，可在需要时扩展 source 为“来源A/来源B”
          continue;
        } else {
          byCanonicalLink.set(canonical, topic);
        }
      }

      // 2) 标题相似度去重（更严格阈值）
      let merged = false;
      for (const item of byCanonicalLink.size > 0 ? Array.from(byCanonicalLink.values()) : results) {
        const sim = this.calculateSimilarity(this.normalizeTitle(item.title), normTitle);
        if (sim >= 0.87) {
          item.hotScore = Math.max(item.hotScore || 0, topic.hotScore || 0);
          const tags = new Set([...(item.tags || []), ...(topic.tags || [])]);
          item.tags = Array.from(tags);
          merged = true;
          break;
        }
      }
      if (!merged) {
        results.push(topic);
      }
    }

    const deduped = byCanonicalLink.size > 0 ? Array.from(new Set([...byCanonicalLink.values(), ...results])) : results;

    // 3) 排序：热度优先，其次时间
    return deduped.sort((a, b) => {
      const hs = (b.hotScore || 0) - (a.hotScore || 0);
      if (hs !== 0) return hs;
      const ta = new Date(a.pubDate).getTime();
      const tb = new Date(b.pubDate).getTime();
      return tb - ta;
    });
  }

  /** 规范化标题：去标点/空白/大小写，保留中文与字母数字 */
  private normalizeTitle(input: string): string {
    return (input || '')
      .toLowerCase()
      .replace(/[\u3000\s]+/g, '') // 空白（含全角空格）
      .replace(/[\p{P}\p{S}]/gu, '') // 标点与符号
      .replace(/[“”‘’·••]/g, '')
      .trim();
  }

  /** 规范化链接：去查询与哈希，仅保留 origin+pathname */
  private getCanonicalLink(link?: string): string | null {
    if (!link) return null;
    try {
      const u = new URL(link);
      return `${u.origin}${u.pathname}`;
    } catch {
      return null;
    }
  }

  /**
   * 计算文本相似度
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 计算编辑距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取支持的平台列表
   */
  getSupportedPlatforms(): PlatformConfig[] {
    return this.platforms;
  }

  /**
   * 更新平台启用状态
   */
  updatePlatformStatus(namespace: string, enabled: boolean): void {
    const platform = this.platforms.find(p => p.namespace === namespace);
    if (platform) {
      platform.enabled = enabled;
    }
  }
}

export default new RSSHubService();

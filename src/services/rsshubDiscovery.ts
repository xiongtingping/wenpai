/**
 * RSSHub 动态路由发现服务
 * 利用 RSSHub OpenAPI 自动发现和测试可用路由
 */

export interface RSSHubRoute {
  path: string;
  name: string;
  example: string;
  categories: string[];
  features: {
    requireConfig: boolean;
    requirePuppeteer: boolean;
    antiCrawler: boolean;
  };
}

export interface PlatformInfo {
  name: string;
  namespace: string;
  routes: Record<string, RSSHubRoute>;
  availableRoutes: string[]; // 实际可用的路由
}

class RSSHubDiscoveryService {
  private baseUrl = 'https://rsshub.app';
  private cache = new Map<string, any>();
  private cacheExpiry = 60 * 60 * 1000; // 1小时缓存

  /**
   * 获取所有可用的命名空间
   */
  async getAllNamespaces(): Promise<Record<string, any>> {
    const cacheKey = 'all_namespaces';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/api/namespace`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('获取命名空间失败:', error);
      return {};
    }
  }

  /**
   * 获取热门分类的平台和路由
   */
  async getPopularPlatforms(): Promise<Record<string, any>> {
    const cacheKey = 'popular_platforms';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/api/category/popular`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('获取热门平台失败:', error);
      return {};
    }
  }

  /**
   * 获取特定平台的详细信息
   */
  async getPlatformInfo(namespace: string): Promise<PlatformInfo | null> {
    const cacheKey = `platform_${namespace}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/api/namespace/${namespace}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      const platformInfo: PlatformInfo = {
        name: data.name || namespace,
        namespace,
        routes: data.routes || {},
        availableRoutes: []
      };

      // 提取所有路由路径
      platformInfo.availableRoutes = Object.values(data.routes || {})
        .map((route: any) => route.example)
        .filter(Boolean);

      this.setCache(cacheKey, platformInfo);
      return platformInfo;
    } catch (error) {
      console.error(`获取平台 ${namespace} 信息失败:`, error);
      return null;
    }
  }

  /**
   * 测试路由是否可用
   */
  async testRoute(route: string): Promise<boolean> {
    // 更稳健的可用性检测：优先HEAD，失败或405/501则回退GET（仅探测，不解析）
    const url = `${this.baseUrl}${route}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const headResp = await fetch(url, { method: 'HEAD', signal: controller.signal });
      if (headResp.ok || headResp.status === 304) return true;
      // 某些RSSHub路由不支持HEAD，返回405/501，此时尝试GET探测
      if (headResp.status === 405 || headResp.status === 501) {
        const getController = new AbortController();
        const getTimer = setTimeout(() => getController.abort(), 7000);
        try {
          const getResp = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/rss+xml,text/xml;q=0.9,*/*;q=0.1' }, signal: getController.signal });
          return getResp.ok || getResp.status === 304;
        } finally {
          clearTimeout(getTimer);
        }
      }
      return false;
    } catch (error) {
      // HEAD 出错也尝试一次 GET
      try {
        const getResp = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/rss+xml,text/xml;q=0.9,*/*;q=0.1' } });
        return getResp.ok || getResp.status === 304;
      } catch {
        return false;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * 发现热点话题相关的可用平台
   */
  async discoverHotTopicsPlatforms(): Promise<PlatformInfo[]> {
    console.log('🔍 开始发现热点话题平台...');

    const popularPlatforms = await this.getPopularPlatforms();
    const hotTopicsPlatforms: PlatformInfo[] = [];

    // 目标平台列表
    const targetPlatforms = ['weibo', 'zhihu', 'bilibili', 'douyin', '36kr', 'ithome'];

    for (const namespace of targetPlatforms) {
      const platformInfo = await getPlatformInfo(namespace);

      if (platformInfo && platformInfo.availableRoutes.length > 0) {
        console.log(`✅ 发现平台: ${platformInfo.name} (${platformInfo.availableRoutes.length} 个路由)`);
        hotTopicsPlatforms.push(platformInfo);
      }
    }

    console.log(`🎉 共发现 ${hotTopicsPlatforms.length} 个可用平台`);
    return hotTopicsPlatforms;
  }

  /**
   * 智能选择最佳路由
   */
  async selectBestRoutes(): Promise<{ platform: string; route: string }[]> {
    const platforms = await this.discoverHotTopicsPlatforms();
    const bestRoutes: { platform: string; route: string }[] = [];

    for (const platform of platforms) {
      // 查找包含"热"、"hot"、"trending"等关键词的路由
      const hotRoute = platform.availableRoutes.find(route =>
        route.toLowerCase().includes('hot') ||
        route.toLowerCase().includes('trending') ||
        route.includes('热')
      );

      if (hotRoute) {
        // 测试路由是否真的可用
        const isAvailable = await this.testRoute(hotRoute);
        if (isAvailable) {
          bestRoutes.push({
            platform: platform.name,
            route: hotRoute
          });
          console.log(`✅ ${platform.name}: ${hotRoute} 可用`);
        } else {
          console.log(`❌ ${platform.name}: ${hotRoute} 不可用`);
        }
      }
    }

    return bestRoutes;
  }

  // 缓存管理
  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// 导出单例
export const rsshubDiscovery = new RSSHubDiscoveryService();

// 导出便捷函数
export async function getAllNamespaces() {
  return rsshubDiscovery.getAllNamespaces();
}

export async function getPlatformInfo(namespace: string) {
  return rsshubDiscovery.getPlatformInfo(namespace);
}

export async function discoverHotTopicsPlatforms() {
  return rsshubDiscovery.discoverHotTopicsPlatforms();
}

export async function selectBestRoutes() {
  return rsshubDiscovery.selectBestRoutes();
}

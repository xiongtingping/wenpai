/**
 * RSSHub 动态路由发现服务
 * 利用 RSSHub OpenAPI 自动发现和测试可用路由
 */

import request, { axiosInstance } from '@/api/request';

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
  private pending = new Map<string, Promise<any>>(); // 去重正在进行的请求
  private cacheExpiry = 60 * 60 * 1000; // 1小时缓存

  /**
   * 获取所有可用的命名空间
   */
  async getAllNamespaces(): Promise<Record<string, any>> {
    const cacheKey = 'all_namespaces';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    if (this.pending.has(cacheKey)) return this.pending.get(cacheKey)!;

    const p = (async () => {
      try {
        const data = await request.get('/.netlify/functions/rsshub-proxy', {
          params: { path: '/api/namespace' }
        });
        this.setCache(cacheKey, data);
        return data;
      } catch (error) {
        console.error('获取命名空间失败:', error);
        return {};
      } finally {
        this.pending.delete(cacheKey);
      }
    })();

    this.pending.set(cacheKey, p);
    return p;
  }

  /**
   * 获取热门分类的平台和路由
   */
  async getPopularPlatforms(): Promise<Record<string, any>> {
    const cacheKey = 'popular_platforms';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    if (this.pending.has(cacheKey)) return this.pending.get(cacheKey)!;

    const p = (async () => {
      try {
        const data = await request.get('/.netlify/functions/rsshub-proxy', {
          params: { path: '/api/category/popular' }
        });
        this.setCache(cacheKey, data);
        return data;
      } catch (error) {
        console.error('获取热门平台失败:', error);
        return {};
      } finally {
        this.pending.delete(cacheKey);
      }
    })();

    this.pending.set(cacheKey, p);
    return p;
  }

  /**
   * 获取特定平台的详细信息
   */
  async getPlatformInfo(namespace: string): Promise<PlatformInfo | null> {
    const cacheKey = `platform_${namespace}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    if (this.pending.has(cacheKey)) return this.pending.get(cacheKey)! as Promise<PlatformInfo | null>;

    const p = (async () => {
      try {
        const data = await request.get('/.netlify/functions/rsshub-proxy', {
          params: { path: `/api/namespace/${namespace}` }
        });

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
      } finally {
        this.pending.delete(cacheKey);
      }
    })();

    this.pending.set(cacheKey, p);
    return p;
  }

  /**
   * 测试路由是否可用
   */
  async testRoute(route: string): Promise<boolean> {
    // 通过 Netlify 代理检测路由可用性，优先 HEAD，回退 GET
    const params = { path: route } as const;
    try {
      const headResp = await axiosInstance.request({
        url: '/.netlify/functions/rsshub-proxy',
        method: 'HEAD',
        params
      });
      if (headResp.status >= 200 && headResp.status < 400) return true;
      if (headResp.status === 405 || headResp.status === 501) {
        const getResp = await axiosInstance.request({
          url: '/.netlify/functions/rsshub-proxy',
          method: 'GET',
          params,
          headers: { Accept: 'application/rss+xml,text/xml;q=0.9,*/*;q=0.1' }
        });
        return getResp.status >= 200 && getResp.status < 400;
      }
      return false;
    } catch {
      try {
        const getResp = await axiosInstance.request({
          url: '/.netlify/functions/rsshub-proxy',
          method: 'GET',
          params,
          headers: { Accept: 'application/rss+xml,text/xml;q=0.9,*/*;q=0.1' }
        });
        return getResp.status >= 200 && getResp.status < 400;
      } catch {
        return false;
      }
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

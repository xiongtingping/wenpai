/**
 * Markdown转微信公众号转换服务
 * 集成第三方API，提供转换功能和缓存机制
 */

import { request } from '@/api/request';
import { logger } from '@/utils/logger';

// 转换请求接口
export interface ConversionRequest {
  markdown: string;
  theme: string;
  fontSize: 'small' | 'medium' | 'large';
  customSettings?: Record<string, any>;
}

// 转换响应接口
export interface ConversionResponse {
  success: boolean;
  html: string;
  preview: string;
  error?: string;
  quotaUsed?: number;
  quotaRemaining?: number;
  processingTime?: number;
}

// 配额状态接口
export interface QuotaStatus {
  used: number;
  remaining: number;
  total: number;
  resetTime: string;
}

// 缓存项接口
interface CacheItem {
  data: ConversionResponse;
  timestamp: number;
  ttl: number;
}

/**
 * 简单的内存缓存类
 */
class SimpleCache {
  private cache = new Map<string, CacheItem>();
  private maxSize = 100;
  private defaultTTL = 5 * 60 * 1000; // 5分钟

  set(key: string, data: ConversionResponse, ttl?: number): void {
    // 清理过期的缓存项
    this.cleanup();
    
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get(key: string): ConversionResponse | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

/**
 * MD2WeChat转换服务类
 *
 * 🔧 FIXED: 移除单例模式，改为依赖注入管理
 */
export class MD2WeChatService {
  private cache = new SimpleCache();
  private baseUrl = '/api/md2wechat';
  private enableLogging = process.env.NODE_ENV === 'development';

  constructor() {}

  /**
   * 转换Markdown为HTML
   */
  async convertToHTML(request: ConversionRequest): Promise<ConversionResponse> {
    const startTime = Date.now();
    
    try {
      // 生成缓存键
      const cacheKey = this.generateCacheKey(request);
      
      // 检查缓存
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult) {
        this.log('使用缓存结果', { cacheKey });
        return cachedResult;
      }

      this.log('开始转换', { theme: request.theme, contentLength: request.markdown.length });

      // 调用转换API
      const result = await this.callConversionAPI(request);
      
      // 缓存结果
      if (result.success) {
        this.cache.set(cacheKey, result);
      }

      const processingTime = Date.now() - startTime;
      result.processingTime = processingTime;

      this.log('转换完成', { success: result.success, processingTime });
      
      return result;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.log('转换失败', { error: error instanceof Error ? error.message : String(error), processingTime });
      
      return {
        success: false,
        html: '',
        preview: '',
        error: error instanceof Error ? error.message : '转换失败',
        processingTime
      };
    }
  }

  /**
   * 调用转换API
   */
  private async callConversionAPI(conversionRequest: ConversionRequest): Promise<ConversionResponse> {
    try {
      // 这里集成实际的转换API
      // 目前先使用简单的Markdown转HTML逻辑
      const html = this.simpleMarkdownToHTML(conversionRequest.markdown, conversionRequest.theme);
      
      return {
        success: true,
        html,
        preview: html,
        quotaUsed: 1,
        quotaRemaining: 99
      };

      // 真实API调用示例（暂时注释）
      /*
      const response = await request.post(`${this.baseUrl}/convert`, {
        markdown: conversionRequest.markdown,
        theme: conversionRequest.theme,
        fontSize: conversionRequest.fontSize,
        customSettings: conversionRequest.customSettings
      });

      return {
        success: true,
        html: response.html,
        preview: response.preview,
        quotaUsed: response.quotaUsed,
        quotaRemaining: response.quotaRemaining
      };
      */

    } catch (error) {
      throw new Error(`API调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 简单的Markdown转HTML实现
   * 用于演示，实际应该调用专业的转换API
   */
  private simpleMarkdownToHTML(markdown: string, theme: string): string {
    let html = markdown;

    // 标题转换
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // 粗体和斜体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 代码
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // 图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

    // 引用
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // 无序列表
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // 有序列表
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

    // 段落（简单处理）
    html = html.split('\n\n').map(paragraph => {
      if (paragraph.startsWith('<h') || 
          paragraph.startsWith('<ul') || 
          paragraph.startsWith('<ol') || 
          paragraph.startsWith('<blockquote') ||
          paragraph.startsWith('<img') ||
          paragraph.trim() === '') {
        return paragraph;
      }
      return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return html;
  }

  /**
   * 获取支持的主题列表
   */
  async getAvailableThemes(): Promise<string[]> {
    try {
      // 实际实现中应该从API获取
      return [
        'default',
        'bytedance',
        'apple',
        'sports', 
        'chinese',
        'cyber'
      ];
    } catch (error) {
      this.log('获取主题列表失败', { error });
      return ['default'];
    }
  }

  /**
   * 验证API密钥
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // 实际实现中验证API密钥
      return Boolean(apiKey && apiKey.length > 0);
    } catch (error) {
      this.log('API密钥验证失败', { error });
      return false;
    }
  }

  /**
   * 获取用户转换配额
   */
  async getQuotaStatus(): Promise<QuotaStatus> {
    try {
      // 实际实现中从API获取
      return {
        used: 10,
        remaining: 90,
        total: 100,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    } catch (error) {
      this.log('获取配额状态失败', { error });
      return {
        used: 0,
        remaining: 100,
        total: 100,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(request: ConversionRequest): string {
    const content = request.markdown.substring(0, 100); // 只使用前100个字符
    const hash = this.simpleHash(content + request.theme + request.fontSize);
    return `md2wechat_${hash}`;
  }

  /**
   * 简单哈希函数
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 日志记录
   */
  private log(message: string, data?: any): void {
    if (this.enableLogging) {
      logger.info(`[MD2WeChat] ${message}`, data);
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.log('缓存已清除');
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

// 导出服务实例
// 🔧 FIXED: 移除getInstance调用，改为通过DI容器获取
// export const md2wechatService = MD2WeChatService.getInstance();

// 临时兼容性导出，建议使用DI容器获取服务
export const md2wechatService = new MD2WeChatService();

// 导出便捷函数
export const convertMarkdownToHTML = (request: ConversionRequest) => 
  md2wechatService.convertToHTML(request);

export const getAvailableThemes = () => 
  md2wechatService.getAvailableThemes();

export const validateApiKey = (apiKey: string) => 
  md2wechatService.validateApiKey(apiKey);

export const getQuotaStatus = () => 
  md2wechatService.getQuotaStatus();
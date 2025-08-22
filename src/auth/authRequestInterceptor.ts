/**
 * 🛡️ 认证请求拦截器 (Round #3 终极解决方案)
 * 在发送请求到Authing前，强制修正redirect_uri参数，彻底解决多重回调URL问题
 */

import { logger } from '@/utils/logger';
import { callbackUrlNormalizer } from './callbackUrlNormalizer';

export class AuthRequestInterceptor {
  private originalFetch: typeof fetch;
  private isIntercepting = false;

  constructor() {
    this.originalFetch = window.fetch;
    this.setupInterception();
  }

  /**
   * 设置请求拦截
   */
  private setupInterception(): void {
    if (this.isIntercepting) return;

    const self = this;
    
    // 拦截所有fetch请求
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      // 检查是否是Authing相关请求
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      if (self.shouldInterceptRequest(url)) {
        return self.interceptAuthingRequest.call(self, input, init);
      }
      
      // 非Authing请求，正常处理
      return self.originalFetch.call(window, input, init);
    };

    this.isIntercepting = true;
    logger.info('🛡️ 认证请求拦截器已启动 - Round #3终极防护');
  }

  /**
   * 判断是否应该拦截请求
   */
  private shouldInterceptRequest(url: string): boolean {
    const authingPatterns = [
      'rzcswqs4sq0f.authing.cn',
      'authing.co',
      'authing.cn',
      '/oidc/',
      '/oauth/',
      'client_id=',
      'redirect_uri='
    ];

    return authingPatterns.some(pattern => url.includes(pattern));
  }

  /**
   * 拦截并修正Authing请求
   */
  private async interceptAuthingRequest(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    try {
      let url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method || 'GET';

      logger.info('🔍 拦截到Authing请求:', { url: url.substring(0, 100) + '...', method });

      // 检查并修正redirect_uri参数
      if (url.includes('redirect_uri=')) {
        const correctedUrl = this.fixRedirectUri(url);
        
        if (correctedUrl !== url) {
          logger.warn('🔧 修正了redirect_uri参数:', {
            original: this.extractRedirectUri(url),
            corrected: this.extractRedirectUri(correctedUrl)
          });
          url = correctedUrl;
        }
      }

      // 如果是POST请求，也要检查请求体
      if (method.toUpperCase() === 'POST' && init?.body) {
        const correctedInit = this.fixPostRequestBody(init);
        if (correctedInit !== init) {
          logger.info('🔧 修正了POST请求体中的redirect_uri');
          init = correctedInit;
        }
      }

      // 发送修正后的请求
      const modifiedInput = typeof input === 'string' ? url : 
                           input instanceof URL ? new URL(url) : 
                           new Request(url, input);

      return await this.originalFetch.call(window, modifiedInput, init);

    } catch (error) {
      logger.error('❌ 请求拦截处理失败:', error);
      // 如果拦截处理失败，使用原始请求
      return await this.originalFetch.call(window, input, init);
    }
  }

  /**
   * 修正URL中的redirect_uri参数
   */
  private fixRedirectUri(url: string): string {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      
      const originalRedirectUri = params.get('redirect_uri');
      if (!originalRedirectUri) return url;

      // 检查是否包含多重URL
      const hasMultipleUrls = originalRedirectUri.includes('%20') || 
                             originalRedirectUri.includes(' ') ||
                             originalRedirectUri.match(/https?:\/\/.*?https?:\/\//);

      if (hasMultipleUrls) {
        const correctRedirectUri = callbackUrlNormalizer.getForcedCallbackUri();
        params.set('redirect_uri', correctRedirectUri);
        
        logger.warn('🚨 检测到多重redirect_uri，已强制修正:', {
          original: originalRedirectUri,
          corrected: correctRedirectUri
        });
        
        return urlObj.toString();
      }

      return url;
    } catch (error) {
      logger.error('URL修正失败:', error);
      return url;
    }
  }

  /**
   * 修正POST请求体中的redirect_uri
   */
  private fixPostRequestBody(init: RequestInit): RequestInit {
    try {
      if (!init.body) return init;

      let bodyContent = '';
      
      if (typeof init.body === 'string') {
        bodyContent = init.body;
      } else if (init.body instanceof FormData) {
        // FormData暂时不处理，比较复杂
        return init;
      } else if (init.body instanceof URLSearchParams) {
        bodyContent = init.body.toString();
      } else {
        return init;
      }

      // 检查是否包含redirect_uri
      if (bodyContent.includes('redirect_uri=')) {
        const params = new URLSearchParams(bodyContent);
        const originalRedirectUri = params.get('redirect_uri');
        
        if (originalRedirectUri && (originalRedirectUri.includes('%20') || originalRedirectUri.includes(' '))) {
          const correctRedirectUri = callbackUrlNormalizer.getForcedCallbackUri();
          params.set('redirect_uri', correctRedirectUri);
          
          return {
            ...init,
            body: params.toString()
          };
        }
      }

      return init;
    } catch (error) {
      logger.error('POST请求体修正失败:', error);
      return init;
    }
  }

  /**
   * 从URL中提取redirect_uri参数
   */
  private extractRedirectUri(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('redirect_uri') || '未找到';
    } catch {
      return '解析失败';
    }
  }

  /**
   * 停止拦截（调试用）
   */
  public stopInterception(): void {
    if (this.isIntercepting) {
      window.fetch = this.originalFetch;
      this.isIntercepting = false;
      logger.info('🛑 认证请求拦截器已停止');
    }
  }

  /**
   * 获取拦截状态
   */
  public getStatus(): {
    isIntercepting: boolean;
    interceptorActive: boolean;
  } {
    return {
      isIntercepting: this.isIntercepting,
      interceptorActive: window.fetch !== this.originalFetch
    };
  }
}

// 导出单例实例
export const authRequestInterceptor = new AuthRequestInterceptor();
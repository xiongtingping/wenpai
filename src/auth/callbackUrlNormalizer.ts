/**
 * 🔧 URL规范化器 - 强制单一回调URL策略
 * 无论外部服务返回什么格式，都强制使用单一正确的回调URL
 */

import { logger } from '@/utils/logger';

export interface CallbackUrlInfo {
  originalUrl: string;
  cleanedUrl: string;
  hasMultipleUrls: boolean;
  extractedParams: {
    code?: string;
    state?: string;
    error?: string;
    error_description?: string;
  };
}

/**
 * 强制单一回调URL规范化器
 * 解决Authing控制台配置问题导致的多重URL连接
 */
export class CallbackUrlNormalizer {
  private readonly ALLOWED_ORIGINS = [
    'https://www.wenpai.xyz',
    'https://wenpai.xyz', 
    'https://wenpai.netlify.app',
    'http://localhost:5173',
    'http://localhost:5175',
    'http://localhost:8888'
  ];

  /**
   * 检测URL是否包含多重回调URL格式
   */
  private detectMultipleUrls(url: string): boolean {
    const multiUrlPatterns = [
      /%20%20https?:\/\//,           // 编码空格 + URL
      /\s+https?:\/\//,              // 空格 + URL
      /callback.*callback/,           // 多个callback
      /callback.*?(wenpai\.xyz|netlify\.app|localhost).*?(wenpai\.xyz|netlify\.app|localhost)/ // 多域名
    ];

    return multiUrlPatterns.some(pattern => pattern.test(url));
  }

  /**
   * 提取URL参数（从可能损坏的URL中）
   */
  private extractUrlParams(url: string): CallbackUrlInfo['extractedParams'] {
    try {
      // 尝试从URL中提取参数，即使URL格式有问题
      const params: CallbackUrlInfo['extractedParams'] = {};
      
      // 查找code参数
      const codeMatch = url.match(/[?&]code=([^&%\s]+)/);
      if (codeMatch) {
        params.code = decodeURIComponent(codeMatch[1]);
      }

      // 查找state参数
      const stateMatch = url.match(/[?&]state=([^&%\s]+)/);
      if (stateMatch) {
        params.state = decodeURIComponent(stateMatch[1]);
      }

      // 查找error参数
      const errorMatch = url.match(/[?&]error=([^&%\s]+)/);
      if (errorMatch) {
        params.error = decodeURIComponent(errorMatch[1]);
      }

      // 查找error_description参数
      const errorDescMatch = url.match(/[?&]error_description=([^&%\s]+)/);
      if (errorDescMatch) {
        params.error_description = decodeURIComponent(errorDescMatch[1]);
      }

      return params;
    } catch (e) {
      logger.error('URL参数提取失败:', e);
      return {};
    }
  }

  /**
   * 获取当前环境的正确回调URL
   */
  private getCorrectCallbackUrl(): string {
    if (typeof window === 'undefined') {
      return 'https://www.wenpai.xyz/callback';
    }

    const { hostname, port, protocol } = window.location;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const actualPort = port || '5173';
      return `http://localhost:${actualPort}/callback`;
    } else if (hostname === 'wenpai.netlify.app') {
      return 'https://wenpai.netlify.app/callback';
    } else if (hostname === 'wenpai.xyz') {
      return 'https://wenpai.xyz/callback';
    } else {
      // 默认使用主域名
      return 'https://www.wenpai.xyz/callback';
    }
  }

  /**
   * 规范化回调URL
   */
  public normalizeCallbackUrl(originalUrl: string): CallbackUrlInfo {
    const hasMultipleUrls = this.detectMultipleUrls(originalUrl);
    const extractedParams = this.extractUrlParams(originalUrl);
    const correctBaseUrl = this.getCorrectCallbackUrl();

    // 构建干净的URL
    let cleanedUrl = correctBaseUrl;
    const queryParams = new URLSearchParams();

    if (extractedParams.code) {
      queryParams.set('code', extractedParams.code);
    }
    if (extractedParams.state) {
      queryParams.set('state', extractedParams.state);
    }
    if (extractedParams.error) {
      queryParams.set('error', extractedParams.error);
    }
    if (extractedParams.error_description) {
      queryParams.set('error_description', extractedParams.error_description);
    }

    const queryString = queryParams.toString();
    if (queryString) {
      cleanedUrl += '?' + queryString;
    }

    const result: CallbackUrlInfo = {
      originalUrl,
      cleanedUrl,
      hasMultipleUrls,
      extractedParams
    };

    if (hasMultipleUrls) {
      logger.warn('检测到多重回调URL，已规范化:', result);
    }

    return result;
  }

  /**
   * 自动重定向到规范化的URL（如果需要）
   */
  public autoRedirectIfNeeded(): boolean {
    if (typeof window === 'undefined') return false;

    const currentUrl = window.location.href;
    const urlInfo = this.normalizeCallbackUrl(currentUrl);

    if (urlInfo.hasMultipleUrls && urlInfo.cleanedUrl !== currentUrl) {
      logger.info('自动重定向到规范化URL:', {
        from: currentUrl,
        to: urlInfo.cleanedUrl
      });

      // 使用replace避免在历史记录中留下错误URL
      window.location.replace(urlInfo.cleanedUrl);
      return true;
    }

    return false;
  }

  /**
   * 🚨 强制获取单一回调URI - 最终修复方案
   * 无论环境如何，都强制使用生产环境的主回调URL
   * 这是解决redirect_uri不匹配问题的最后手段
   */
  public getForcedCallbackUri(): string {
    // 🚨 强制使用生产环境主域名，避免所有动态计算问题
    const forcedUri = 'https://www.wenpai.xyz/callback';
    
    logger.info('🚨 强制回调URI修复:', {
      forcedUri,
      reason: '避免redirect_uri不匹配问题',
      strategy: 'force_production_uri'
    });
    
    return forcedUri;
  }
}

// 导出单例实例
export const callbackUrlNormalizer = new CallbackUrlNormalizer();
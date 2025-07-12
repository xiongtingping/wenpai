/**
 * 性能优化工具函数
 * 提供代码分割、懒加载、缓存等性能优化功能
 */

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @param immediate 是否立即执行
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 限制时间（毫秒）
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 图片懒加载
 * @param img 图片元素
 * @param src 图片源
 */
export function lazyLoadImage(img: HTMLImageElement, src: string): void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        img.src = src;
        observer.unobserve(img);
      }
    });
  });
  
  observer.observe(img);
}

/**
 * 虚拟滚动优化
 * @param items 列表项
 * @param itemHeight 每项高度
 * @param containerHeight 容器高度
 * @param scrollTop 滚动位置
 */
export function getVisibleItems<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
): { items: T[]; startIndex: number; endIndex: number } {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  return {
    items: items.slice(startIndex, endIndex),
    startIndex,
    endIndex
  };
}

/**
 * 内存缓存
 */
export class MemoryCache<K, V> {
  private cache = new Map<K, { value: V; timestamp: number; ttl: number }>();
  
  /**
   * 设置缓存
   * @param key 键
   * @param value 值
   * @param ttl 生存时间（毫秒）
   */
  set(key: K, value: V, ttl = 60000): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }
  
  /**
   * 获取缓存
   * @param key 键
   */
  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }
  
  /**
   * 删除缓存
   * @param key 键
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * 本地存储缓存
 */
export class LocalStorageCache {
  private prefix: string;
  
  constructor(prefix = 'app_cache_') {
    this.prefix = prefix;
  }
  
  /**
   * 设置缓存
   * @param key 键
   * @param value 值
   * @param ttl 生存时间（毫秒）
   */
  set(key: string, value: any, ttl = 3600000): void {
    const item = {
      value,
      timestamp: Date.now(),
      ttl
    };
    
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('LocalStorage cache set failed:', error);
    }
  }
  
  /**
   * 获取缓存
   * @param key 键
   */
  get<T>(key: string): T | undefined {
    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      if (!itemStr) return undefined;
      
      const item = JSON.parse(itemStr);
      if (Date.now() - item.timestamp > item.ttl) {
        this.delete(key);
        return undefined;
      }
      
      return item.value;
    } catch (error) {
      console.warn('LocalStorage cache get failed:', error);
      return undefined;
    }
  }
  
  /**
   * 删除缓存
   * @param key 键
   */
  delete(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('LocalStorage cache delete failed:', error);
    }
  }
  
  /**
   * 清空缓存
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('LocalStorage cache clear failed:', error);
    }
  }
}

/**
 * 性能监控
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  /**
   * 开始计时
   * @param name 指标名称
   */
  startTimer(name: string): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(performance.now());
  }
  
  /**
   * 结束计时
   * @param name 指标名称
   */
  endTimer(name: string): number | undefined {
    const times = this.metrics.get(name);
    if (!times || times.length === 0) return undefined;
    
    const startTime = times.pop()!;
    const duration = performance.now() - startTime;
    
    // 保留最近10次记录
    const allTimes = this.metrics.get(name)!;
    if (allTimes.length > 10) {
      allTimes.splice(0, allTimes.length - 10);
    }
    
    return duration;
  }
  
  /**
   * 获取指标统计
   * @param name 指标名称
   */
  getMetrics(name: string): { avg: number; min: number; max: number; count: number } | undefined {
    const times = this.metrics.get(name);
    if (!times || times.length === 0) return undefined;
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    return { avg, min, max, count: times.length };
  }
  
  /**
   * 清空指标
   */
  clear(): void {
    this.metrics.clear();
  }
}

/**
 * 资源预加载
 * @param urls 资源URL列表
 */
export function preloadResources(urls: string[]): Promise<void[]> {
  const promises = urls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload: ${url}`));
      document.head.appendChild(link);
    });
  });
  
  return Promise.all(promises);
}

/**
 * 图片预加载
 * @param urls 图片URL列表
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  const promises = urls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
      img.src = url;
    });
  });
  
  return Promise.all(promises);
}

/**
 * 批量DOM操作优化
 * @param operations DOM操作函数数组
 */
export function batchDOMOperations(operations: (() => void)[]): void {
  // 使用 requestAnimationFrame 批量执行DOM操作
  requestAnimationFrame(() => {
    operations.forEach(operation => operation());
  });
}

/**
 * 检查网络状态
 */
export function getNetworkInfo(): { effectiveType: string; downlink: number; rtt: number } {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  return {
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || 0,
    rtt: connection?.rtt || 0
  };
}

/**
 * 根据网络状态调整图片质量
 * @param baseUrl 基础URL
 * @param quality 质量参数
 */
export function getOptimizedImageUrl(baseUrl: string, quality: 'low' | 'medium' | 'high' = 'medium'): string {
  const networkInfo = getNetworkInfo();
  
  // 根据网络类型调整质量
  if (networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g') {
    quality = 'low';
  } else if (networkInfo.effectiveType === '3g') {
    quality = 'medium';
  } else {
    quality = 'high';
  }
  
  // 添加质量参数到URL
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}quality=${quality}`;
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

// 全局内存缓存实例
export const memoryCache = new MemoryCache<string, any>();

// 全局本地存储缓存实例
export const localStorageCache = new LocalStorageCache(); 
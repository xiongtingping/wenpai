/**
 * 页面访问记录组件
 * @description 自动记录用户的页面访问行为到数据库
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface PageTrackerProps {
  /** 页面标题 */
  title?: string;
  /** 页面描述 */
  description?: string;
  /** 额外元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * 页面访问记录组件
 */
const PageTracker: React.FC<PageTrackerProps> = ({ 
  title, 
  description, 
  metadata = {} 
}) => {
  const location = useLocation();
  const { recordUserAction } = useAuthStore();

  useEffect(() => {
    // 🔍 FIXED: 2025-08-04 防止无限循环的页面访问记录
    const pageData = {
      page: location.pathname,
      title: title || document.title,
      description,
      metadata: {
        ...metadata,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString()
      }
    };

    // ✅ FIXED: 使用防抖机制避免频繁调用，防止无限循环
    const timeoutId = setTimeout(() => {
      try {
        recordUserAction(`pageVisit:${location.pathname}`);
      } catch (error) {
        console.warn('📊 PageTracker: recordUserAction failed', error);
      }
    }, 100);

    // 记录页面停留时间（在组件卸载时）
    const startTime = Date.now();

    return () => {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      if (duration > 1000) { // 只记录停留超过1秒的页面
        try {
          recordUserAction(`pageLeave:${location.pathname}:${duration}ms`);
        } catch (error) {
          console.warn('📊 PageTracker: pageLeave recordUserAction failed', error);
        }
      }
    };
  }, [location.pathname, title, description]); // ✅ FIXED: 移除recordUserAction依赖，防止无限循环

  return null; // 这是一个纯记录组件，不渲染任何内容
};

export { PageTracker };
export default PageTracker;

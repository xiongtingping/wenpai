/**
 * 页面访问记录组件
 * @description 自动记录用户的页面访问行为到数据库
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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

  useEffect(() => {
    // 🔧 简化的页面访问记录：仅记录到localStorage供开发调试使用
    const pageData = {
      page: location.pathname,
      title: title || document.title,
      description,
      metadata: {
        ...metadata,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      }
    };

    // ✅ 使用简化的本地记录替代废弃的recordUserAction
    const timeoutId = setTimeout(() => {
      try {
        // 记录到localStorage (仅开发环境)
        if (import.meta.env.DEV) {
          const visits = JSON.parse(localStorage.getItem('page_visits') || '[]');
          visits.push({ action: `pageVisit:${location.pathname}`, timestamp: Date.now() });
          localStorage.setItem('page_visits', JSON.stringify(visits.slice(-100))); // 保留最近100条
        }
      } catch (error) {
        console.warn('📊 PageTracker: 本地记录失败', error);
      }
    }, 100);

    // 记录页面停留时间（在组件卸载时）
    const startTime = Date.now();

    return () => {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      if (duration > 1000 && import.meta.env.DEV) { // 只在开发环境记录停留时间
        try {
          const visits = JSON.parse(localStorage.getItem('page_visits') || '[]');
          visits.push({ action: `pageLeave:${location.pathname}:${duration}ms`, timestamp: Date.now() });
          localStorage.setItem('page_visits', JSON.stringify(visits.slice(-100)));
        } catch (error) {
          console.warn('📊 PageTracker: 页面离开记录失败', error);
        }
      }
    };
  }, [location.pathname, title, description]);

  return null; // 这是一个纯记录组件，不渲染任何内容
};

export { PageTracker };
export default PageTracker;

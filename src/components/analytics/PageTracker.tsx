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
    // 记录页面访问
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

    recordUserAction('pageVisit', pageData);

    // 记录页面停留时间（在组件卸载时）
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      if (duration > 1000) { // 只记录停留超过1秒的页面
        recordUserAction('pageVisit', {
          ...pageData,
          duration,
          action: 'page_leave'
        });
      }
    };
  }, [location.pathname, title, description, metadata, recordUserAction]);

  return null; // 这是一个纯记录组件，不渲染任何内容
};

export { PageTracker };
export default PageTracker; 
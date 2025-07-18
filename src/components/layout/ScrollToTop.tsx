/**
 * 滚动到顶部组件
 * 在路由变化时自动滚动到页面顶部（可选）
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopProps {
  /** 是否启用自动滚动到顶部 */
  enabled?: boolean;
  /** 滚动行为 */
  behavior?: ScrollBehavior;
}

/**
 * 滚动到顶部组件
 */
export const ScrollToTop: React.FC<ScrollToTopProps> = ({ 
  enabled = false, // 默认不启用自动滚动
  behavior = 'smooth' 
}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 只有在启用时才执行滚动
    if (enabled) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior
      });
    }
  }, [pathname, enabled, behavior]);

  return null;
}; 
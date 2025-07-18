/**
 * 滚动管理组件
 * 控制页面滚动行为，防止自动滚动到顶部
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollManagerProps {
  /** 是否启用自动滚动到顶部 */
  autoScrollToTop?: boolean;
  /** 滚动行为 */
  behavior?: ScrollBehavior;
}

/**
 * 滚动管理组件
 * 用于控制页面滚动行为，防止React Router的默认自动滚动
 */
export const ScrollManager: React.FC<ScrollManagerProps> = ({ 
  autoScrollToTop = false, // 默认不自动滚动到顶部
  behavior = 'smooth' 
}) => {
  const { pathname } = useLocation();
  const previousPathname = useRef<string>('');

  useEffect(() => {
    // 只有在启用且路径真正变化时才执行滚动
    if (autoScrollToTop && previousPathname.current !== pathname) {
      // 延迟执行，确保页面内容已加载
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior
        });
      }, 100);

      return () => clearTimeout(timer);
    }

    // 更新前一个路径
    previousPathname.current = pathname;
  }, [pathname, autoScrollToTop, behavior]);

  return null;
}; 
/**
 * 滚动到顶部组件
 * 在路由变化时自动滚动到页面顶部
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 滚动到顶部组件
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 路由变化时滚动到顶部
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}; 
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUp } from 'lucide-react';
import { Button } from './button';

interface BackToTopProps {
  threshold?: number;
  className?: string;
}

export const BackToTop: React.FC<any> = ({ threshold = 300,
  className = '' }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 🔧 性能优化：添加节流减少滚动事件处理频率
    let timeoutId: number | null = null;
    
    const toggleVisibility = () => {
      // 使用requestAnimationFrame确保在下一帧执行，减少性能影响
      if (timeoutId) {
        cancelAnimationFrame(timeoutId);
      }
      
      timeoutId = requestAnimationFrame(() => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        setIsVisible(scrollY > threshold);
      });
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      if (timeoutId) {
        cancelAnimationFrame(timeoutId);
      }
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      size="sm"
      className={`fixed bottom-6 right-6 z-[90] h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground ${className}`}
      aria-label={t('components.labels.返回顶部')}
        title={t('components.labels.返回顶部')}
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};

export default BackToTop;

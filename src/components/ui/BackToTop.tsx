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
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
       } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
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
      aria-label={t('components.labels.标签')}
        title={t('components.labels.返回顶部')}
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};

export default BackToTop;

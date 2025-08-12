/**
 * 主题感知的Logo组件
 * 根据当前主题自动切换logo颜色，确保在所有主题下都有良好的可见性
 */

import React from 'react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeAwareLogoProps {
  /** Logo尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 自定义类名 */
  className?: string;
  /** 是否显示悬停效果 */
  showHoverEffect?: boolean;
  /** 是否显示背景圆圈（深色模式下） */
  showBackground?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-9 h-9',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12'
};

export const ThemeAwareLogo: React.FC<ThemeAwareLogoProps> = ({
  size = 'md',
  className = '',
  showHoverEffect = true,
  showBackground = true
}) => {
  const { theme } = useTheme();
  
  // 判断是否为深色主题
  const isDarkTheme = theme === 'dark';
  
  // 选择合适的logo文件
  const logoSrc = isDarkTheme ? '/logo-panda-white.svg' : '/logo-panda.svg';
  
  // 构建容器类名
  const containerClasses = [
    sizeClasses[size],
    'relative',
    showHoverEffect ? 'group-hover:scale-105 transition-all duration-300' : '',
    className
  ].filter(Boolean).join(' ');
  
  // 背景圆圈类名（仅在深色模式下显示）
  const backgroundClasses = [
    'absolute inset-0 rounded-full',
    'bg-background/80 border border-border/50',
    'dark:bg-white/10 dark:border-white/20',
    'opacity-0 dark:opacity-100',
    'transition-opacity duration-300'
  ].join(' ');
  
  return (
    <div className={containerClasses}>
      {/* 深色模式背景圆圈，提升可见性 */}
      {showBackground && (
        <div className={backgroundClasses} />
      )}
      
      {/* Logo图片 */}
      <img
        src={logoSrc}
        alt="文派Logo"
        className={[
          'w-full h-full object-contain relative z-10',
          // 深色模式下的额外优化
          'dark:brightness-110 dark:contrast-110',
          // 确保图片在所有主题下都有良好的对比度
          isDarkTheme ? 'filter-none' : ''
        ].filter(Boolean).join(' ')}
        style={{
          // 为深色主题提供额外的阴影效果
          filter: isDarkTheme ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' : 'none'
        }}
      />
    </div>
  );
};

/**
 * 带文字的Logo组件
 */
interface LogoWithTextProps extends ThemeAwareLogoProps {
  /** 文字内容 */
  text?: string;
  /** 文字大小 */
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  /** 文字样式 */
  textClassName?: string;
  /** Logo和文字之间的间距 */
  spacing?: 'sm' | 'md' | 'lg';
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl'
};

const spacingClasses = {
  sm: 'space-x-2',
  md: 'space-x-3',
  lg: 'space-x-4'
};

export const LogoWithText: React.FC<LogoWithTextProps> = ({
  text = '文派',
  textSize = 'lg',
  textClassName = '',
  spacing = 'md',
  ...logoProps
}) => {
  const defaultTextClasses = [
    'font-bold',
    textSizeClasses[textSize],
    'transition-all duration-200',
    'text-foreground group-hover:text-primary',
    textClassName
  ].filter(Boolean).join(' ');
  
  return (
    <div className={`flex items-center ${spacingClasses[spacing]} group`}>
      <ThemeAwareLogo {...logoProps} />
      <span className={defaultTextClasses}>
        {text}
      </span>
    </div>
  );
};

export default ThemeAwareLogo;

/**
 * 主题感知文字组件
 * 确保文字在所有主题下都有良好的可读性和对比度
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ThemeAwareTextProps {
  children: React.ReactNode;
  /** 文字类型 */
  variant?: 'primary' | 'secondary' | 'muted' | 'accent' | 'destructive';
  /** 文字大小 */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  /** 文字权重 */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** 自定义类名 */
  className?: string;
  /** HTML元素类型 */
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

// 主题感知的文字颜色映射
const textVariants = {
  primary: 'text-foreground dark:text-foreground',
  secondary: 'text-secondary-foreground dark:text-secondary-foreground',
  muted: 'text-muted-foreground dark:text-slate-400',
  accent: 'text-accent-foreground dark:text-accent-foreground',
  destructive: 'text-destructive dark:text-red-400'
};

const textSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl'
};

const textWeights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
};

/**
 * 主题感知文字组件
 */
export const ThemeAwareText: React.FC<ThemeAwareTextProps> = ({
  children,
  variant = 'primary',
  size = 'base',
  weight = 'normal',
  className = '',
  as: Component = 'span'
}) => {
  const classes = cn(
    textVariants[variant],
    textSizes[size],
    textWeights[weight],
    className
  );

  return (
    <Component className={classes}>
      {children}
    </Component>
  );
};

/**
 * 权限提示文字组件（特化版本）
 */
interface PermissionTextProps extends Omit<ThemeAwareTextProps, 'variant'> {
  /** 权限文字类型 */
  type?: 'title' | 'description' | 'hint' | 'warning' | 'success';
}

const permissionTextVariants = {
  title: 'text-foreground dark:text-background font-semibold',
  description: 'text-muted-foreground dark:text-slate-300',
  hint: 'text-muted-foreground dark:text-slate-400 text-xs',
  warning: 'text-orange-600 dark:text-orange-400',
  success: 'text-success dark:text-green-400'
};

export const PermissionText: React.FC<PermissionTextProps> = ({
  children,
  type = 'description',
  size = 'sm',
  weight = 'normal',
  className = '',
  as: Component = 'p'
}) => {
  const classes = cn(
    permissionTextVariants[type],
    textSizes[size],
    textWeights[weight],
    // 确保在深色模式下有足够的对比度
    'transition-colors duration-200',
    className
  );

  return (
    <Component className={classes}>
      {children}
    </Component>
  );
};

/**
 * 升级提示文字组件
 */
interface UpgradeTextProps extends Omit<ThemeAwareTextProps, 'variant'> {
  /** 升级文字类型 */
  type?: 'title' | 'feature' | 'price' | 'discount' | 'cta';
}

const upgradeTextVariants = {
  title: 'text-foreground dark:text-background font-bold',
  feature: 'text-foreground dark:text-slate-200',
  price: 'text-foreground dark:text-background font-bold',
  discount: 'text-destructive dark:text-red-400 font-medium',
  cta: 'text-primary-foreground dark:text-background font-semibold'
};

export const UpgradeText: React.FC<UpgradeTextProps> = ({
  children,
  type = 'feature',
  size = 'sm',
  weight = 'normal',
  className = '',
  as: Component = 'span'
}) => {
  const classes = cn(
    upgradeTextVariants[type],
    textSizes[size],
    // 覆盖默认权重，使用类型特定的权重
    type !== 'feature' ? '' : textWeights[weight],
    // 确保良好的可读性
    'transition-colors duration-200',
    className
  );

  return (
    <Component className={classes}>
      {children}
    </Component>
  );
};

/**
 * 获取主题感知的文字类名
 */
export const getThemeAwareTextClass = (
  variant: 'primary' | 'secondary' | 'muted' | 'accent' | 'destructive' = 'primary',
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' = 'base',
  weight: 'normal' | 'medium' | 'semibold' | 'bold' = 'normal'
): string => {
  return cn(
    textVariants[variant],
    textSizes[size],
    textWeights[weight]
  );
};

/**
 * 获取权限相关的主题感知文字类名
 */
export const getPermissionTextClass = (
  type: 'title' | 'description' | 'hint' | 'warning' | 'success' = 'description',
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' = 'sm'
): string => {
  return cn(
    permissionTextVariants[type],
    textSizes[size],
    'transition-colors duration-200'
  );
};

export default ThemeAwareText;

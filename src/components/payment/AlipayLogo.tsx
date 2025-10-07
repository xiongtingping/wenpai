/**
 * 支付宝Logo组件
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface AlipayLogoProps {
  /** Logo尺寸 */
  size?: number;
  /** 自定义类名 */
  className?: string;
  /** 是否显示文字 */
  showText?: boolean;
}

/**
 * 支付宝Logo组件
 * 使用支付宝品牌色: #1677FF (蓝色)
 */
export const AlipayLogo: React.FC<AlipayLogoProps> = ({ 
  size = 24, 
  className,
  showText = false 
}) => {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {/* Logo图标 */}
      <div
        className="rounded flex items-center justify-center font-bold text-white"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: '#1677FF',
          fontSize: `${size * 0.6}px`
        }}
      >
        支
      </div>
      
      {/* 文字 */}
      {showText && (
        <span 
          className="font-medium"
          style={{ 
            color: '#1677FF',
            fontSize: `${size * 0.7}px`
          }}
        >
          支付宝
        </span>
      )}
    </div>
  );
};

/**
 * 支付宝品牌横幅组件
 */
interface AlipayBannerProps {
  /** 自定义类名 */
  className?: string;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { logo: 20, text: 14 },
  md: { logo: 28, text: 16 },
  lg: { logo: 36, text: 20 }
};

export const AlipayBanner: React.FC<AlipayBannerProps> = ({ 
  className,
  size = 'md'
}) => {
  const config = sizeConfig[size];
  
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-4 py-2 rounded-lg border",
      "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      "border-blue-200 dark:border-blue-800",
      className
    )}>
      <AlipayLogo size={config.logo} />
      <span 
        className="font-medium text-blue-700 dark:text-blue-300"
        style={{ fontSize: `${config.text}px` }}
      >
        支付宝扫码支付
      </span>
    </div>
  );
};


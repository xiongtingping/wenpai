/**
 * 倒计时组件
 * 用于显示限时优惠倒计时
 */

import React, { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CountdownTimerProps {
  /** 倒计时结束时间（秒） */
  initialSeconds: number;
  /** 倒计时结束回调 */
  onComplete?: () => void;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 显示模式 */
  variant?: 'default' | 'urgent' | 'compact';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds,
  onComplete,
  showIcon = true,
  className = '',
  variant = 'default'
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onComplete]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0')
    };
  };

  const { minutes, seconds: secs } = formatTime(seconds);
  const isUrgent = seconds <= 300; // 最后5分钟

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        {showIcon && <Clock className="h-3 w-3" />}
        <span className="text-sm font-mono">
          {minutes}:{secs}
        </span>
      </div>
    );
  }

  if (variant === 'urgent') {
    return (
      <Badge 
        className={`
          animate-pulse bg-gradient-to-r from-red-500 to-orange-500 
          text-background border-0 px-3 py-1 ${className}
        `}
      >
        <Zap className="h-3 w-3 mr-1" />
        <span className="font-mono font-bold">
          {minutes}:{secs}
        </span>
      </Badge>
    );
  }

  return (
    <div className={`
      flex items-center gap-2 px-4 py-2 rounded-lg
      ${isUrgent 
        ? 'bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 animate-pulse' 
        : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
      }
      ${className}
    `}>
      {showIcon && (
        <div className={`
          p-1 rounded-full
          ${isUrgent ? 'bg-red-100' : 'bg-blue-100'}
        `}>
          {isUrgent ? (
            <Zap className="h-4 w-4 text-destructive" />
          ) : (
            <Clock className="h-4 w-4 text-primary" />
          )}
        </div>
      )}
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`
            text-lg font-mono font-bold
            ${isUrgent ? 'text-red-700' : 'text-blue-700'}
          `}>
            {minutes}:{secs}
          </span>
          <span className={`
            text-xs
            ${isUrgent ? 'text-destructive' : 'text-primary'}
          `}>
            剩余
          </span>
        </div>
        <span className={`
          text-xs
          ${isUrgent ? 'text-destructive' : 'text-primary'}
        `}>
          {isUrgent ? '限时优惠即将结束！' : '限时优惠进行中'}
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;

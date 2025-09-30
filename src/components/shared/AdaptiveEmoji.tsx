/**
 * 自适应Emoji组件
 * 根据使用场景和平台自动调整emoji显示尺寸和样式
 */

import React from 'react';
import type {
  UnifiedEmojiItem,
  EmojiUsageContext,
  PlatformType
} from '@/types/emoji';

interface AdaptiveEmojiProps {
  emoji: UnifiedEmojiItem | string;
  context: EmojiUsageContext;
  platform?: PlatformType;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
  'aria-label'?: string;
}

/**
 * 自适应Emoji组件
 * 自动根据使用场景和平台调整尺寸
 */
const AdaptiveEmoji: React.FC<AdaptiveEmojiProps> = ({
  emoji,
  context,
  platform,
  className = '',
  style = {},
  onClick,
  title,
  'aria-label': ariaLabel,
  ...props
}) => {
  const [adaptiveStyle, setAdaptiveStyle] = React.useState<React.CSSProperties>({});

  // 获取emoji字符
  const emojiChar = typeof emoji === 'string' ? emoji : emoji.emoji;
  const emojiName = typeof emoji === 'string' ? emoji : emoji.name;

  // 异步生成自适应样式
  React.useEffect(() => {
    const loadEmojiStyle = async () => {
      try {
        const { generateEmojiStyle } = await import('@/services/unifiedEmojiSystem');
        const style = generateEmojiStyle(context, platform, {} as any);
        setAdaptiveStyle(style);
      } catch (error) {
        console.error('加载emoji样式失败:', error);
        // 设置默认样式
        setAdaptiveStyle({
          fontSize: '1rem',
          lineHeight: '1.5'
        });
      }
    };
    
    loadEmojiStyle();
  }, [context, platform]);

  // 合并样式
  const finalStyle: React.CSSProperties = {
    ...adaptiveStyle,
    cursor: onClick ? 'pointer' : 'default',
    userSelect: 'none',
    transition: 'transform 0.2s ease',
    ...style
  };

  // 添加hover效果
  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (onClick) {
      e.currentTarget.style.transform = 'scale(1.1)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (onClick) {
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  return (
    <span
      className={`adaptive-emoji ${className}`}
      style={finalStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={title || emojiName}
      aria-label={ariaLabel || emojiName}
      role={onClick ? 'button' : 'img'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      {...props}
    >
      {emojiChar}
    </span>
  );
};

/**
 * Emoji头像组件
 * 专门用于头像场景的emoji显示
 */
export const EmojiAvatar: React.FC<Omit<AdaptiveEmojiProps, 'context'> & {
  size?: 'small' | 'medium' | 'large';
}> = ({ size = 'medium', ...props }) => {
  const sizeMap: Record<string, EmojiUsageContext> = {
    small: 'status',
    medium: 'avatar',
    large: 'card'
  };

  return <AdaptiveEmoji {...props} context={sizeMap[size]} />;
};

/**
 * Emoji按钮组件
 * 专门用于按钮场景的emoji显示
 */
export const EmojiButton: React.FC<Omit<AdaptiveEmojiProps, 'context'> & {
  variant?: 'default' | 'ghost' | 'outline';
}> = ({ variant = 'default', className = '', ...props }) => {
  const variantClasses = {
    default: 'bg-accent hover:bg-muted',
    ghost: 'hover:bg-accent',
    outline: 'border border-border hover:bg-accent'
  };

  return (
    <AdaptiveEmoji
      {...props}
      context="button"
      className={`${variantClasses[variant]} ${className}`}
    />
  );
};

/**
 * Emoji装饰组件
 * 专门用于装饰场景的emoji显示
 */
export const EmojiDecoration: React.FC<Omit<AdaptiveEmojiProps, 'context'>> = (props) => {
  return <AdaptiveEmoji {...props} context="decoration" />;
};

/**
 * Emoji图标组件
 * 专门用于图标场景的emoji显示
 */
export const EmojiIcon: React.FC<Omit<AdaptiveEmojiProps, 'context'>> = (props) => {
  return <AdaptiveEmoji {...props} context="icon" />;
};

/**
 * Emoji徽章组件
 * 专门用于徽章场景的emoji显示
 */
export const EmojiBadge: React.FC<Omit<AdaptiveEmojiProps, 'context'> & {
  count?: number;
  children?: React.ReactNode;
}> = ({ count, children, ...props }) => {
  return (
    <div className="relative inline-flex">
      <AdaptiveEmoji {...props} context="badge" />
      {count !== undefined && count > 0 && (
        <span className="absolute -top-1 -right-1 bg-destructive text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
      {children}
    </div>
  );
};

/**
 * Emoji反应组件
 * 专门用于反应场景的emoji显示
 */
export const EmojiReaction: React.FC<Omit<AdaptiveEmojiProps, 'context'> & {
  count?: number;
  active?: boolean;
}> = ({ count, active = false, className = '', ...props }) => {
  const activeClass = active ? 'bg-accent border-primary' : 'bg-accent border-border';

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${activeClass} ${className}`}>
      <AdaptiveEmoji {...props} context="reaction" />
      {count !== undefined && count > 0 && (
        <span className="text-xs font-medium">{count}</span>
      )}
    </div>
  );
};

/**
 * Emoji状态指示器组件
 * 专门用于状态指示场景的emoji显示
 */
export const EmojiStatus: React.FC<Omit<AdaptiveEmojiProps, 'context'> & {
  status: 'online' | 'offline' | 'busy' | 'away';
}> = ({ status, ...props }) => {
  const statusEmojis = {
    online: '🟢',
    offline: '⚫',
    busy: '🔴',
    away: '🟡'
  };

  return (
    <AdaptiveEmoji
      {...props}
      emoji={statusEmojis[status]}
      context="status"
    />
  );
};

/**
 * 使用统一emoji系统的Hook
 */
export function useUnifiedEmoji() {
  const platform = detectPlatform();

  return {
    platform,
    generateStyle: (context: EmojiUsageContext, customStyles?: React.CSSProperties) =>
      generateEmojiStyle(context, platform, customStyles),
    AdaptiveEmoji,
    EmojiAvatar,
    EmojiButton,
    EmojiDecoration,
    EmojiIcon,
    EmojiBadge,
    EmojiReaction,
    EmojiStatus
  };
}

export default AdaptiveEmoji;

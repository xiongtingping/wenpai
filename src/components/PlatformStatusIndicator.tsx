/**
 * 平台状态提示组件
 * 嵌入到平台卡片内部，提供清晰的状态反馈
 */

import React, { useState, useEffect } from 'react';
import { Clock, Zap, CheckCircle, AlertCircle, Brain, Sparkles } from 'lucide-react';

interface PlatformStatusIndicatorProps {
  platformId: string;
  status: 'generating' | 'success' | 'error' | 'idle';
  message?: string;
  estimatedTime?: string;
  progress?: number;
  isLongContent?: boolean;
}

// 平台配置
const platformConfig = {
  xiaohongshu: { 
    name: '小红书', 
    icon: '📱', 
    color: 'red',
    generateMessage: '正在生成小红书种草内容...',
    longContentMessage: '正在创作小红书深度种草文案，内容丰富有趣...'
  },
  weibo: { 
    name: '微博', 
    icon: '🐦', 
    color: 'orange',
    generateMessage: '正在生成微博热门内容...',
    longContentMessage: '正在创作微博长文，确保内容有趣有料...'
  },
  zhihu: { 
    name: '知乎', 
    icon: '🎓', 
    color: 'blue',
    generateMessage: '正在生成知乎专业回答...',
    longContentMessage: '正在撰写知乎深度回答，确保内容有见解、有价值...'
  },
  wechat: { 
    name: '微信公众号', 
    icon: '💬', 
    color: 'green',
    generateMessage: '正在生成公众号文章...',
    longContentMessage: '正在创作专业的公众号文章，内容更丰富，生成时间较长...'
  },
  douyin: { 
    name: '抖音', 
    icon: '🎵', 
    color: 'purple',
    generateMessage: '正在生成抖音短视频文案...',
    longContentMessage: '正在创作抖音爆款文案，确保内容有趣有梗...'
  },
  bilibili: { 
    name: 'B站', 
    icon: '📺', 
    color: 'pink',
    generateMessage: '正在生成B站视频文案...',
    longContentMessage: '正在创作B站优质内容，确保专业有趣...'
  }
};

export const PlatformStatusIndicator: React.FC<PlatformStatusIndicatorProps> = ({
  platformId,
  status,
  message,
  estimatedTime = '2-3分钟',
  progress = 0,
  isLongContent = false
}) => {
  const [dots, setDots] = useState('');
  const [pulseActive, setPulseActive] = useState(false);

  const platform = platformConfig[platformId as keyof typeof platformConfig];
  const colorClasses = {
    red: 'from-red-50 to-red-100 border-border text-destructive',
    orange: 'from-orange-50 to-orange-100 border-orange-200 text-foreground',
    blue: 'from-blue-50 to-blue-100 border-border text-primary',
    green: 'from-green-50 to-green-100 border-border text-green-700',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-primary',
    pink: 'from-pink-50 to-pink-100 border-pink-200 text-pink-700'
  };

  useEffect(() => {
    if (status === 'generating') {
      // 动态点点点动画
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);

      // 脉冲动画
      const pulseInterval = setInterval(() => {
        setPulseActive(prev => !prev);
      }, 1500);

      return () => {
        clearInterval(interval);
        clearInterval(pulseInterval);
      };
    }
  }, [status]);

  if (status === 'idle') return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'generating':
        return <Brain className={`w-5 h-5 transition-all duration-500 ${pulseActive ? 'scale-110' : 'scale-100'}`} />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-foreground" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const getStatusMessage = () => {
    if (message) return message;
    
    switch (status) {
      case 'generating':
        return isLongContent ? platform?.longContentMessage : platform?.generateMessage;
      case 'success':
        return '内容生成完成';
      case 'error':
        return '生成失败，请重试';
      default:
        return '';
    }
  };

  const getBgClasses = () => {
    if (status === 'success') return 'from-green-50 to-green-100 border-border';
    if (status === 'error') return 'from-red-50 to-red-100 border-border';
    return colorClasses[platform?.color as keyof typeof colorClasses] || colorClasses.blue;
  };

  return (
    <div className={`relative bg-gradient-to-r ${getBgClasses()} border rounded-lg p-3 mb-3 transition-all duration-300`}>
      {/* 水平布局的状态信息 */}
      <div className="flex items-center justify-between gap-4">
        {/* 左侧：平台信息和状态 */}
        <div className="flex items-center gap-3 flex-1">
          {/* 平台图标和名称 */}
          <div className="flex items-center gap-2">
            <span className="text-base">{platform?.icon}</span>
            <span className="font-medium text-sm">{platform?.name}</span>
          </div>

          {/* 状态图标 */}
          <div className="flex items-center">
            {getStatusIcon()}
          </div>

          {/* 状态消息 */}
          <div className="flex-1">
            <span className="text-sm font-medium">
              {getStatusMessage()}{status === 'generating' ? dots : ''}
            </span>
          </div>
        </div>

        {/* 右侧：时间和进度信息 */}
        <div className="flex items-center gap-4">
          {/* 长内容生成的时间信息 */}
          {status === 'generating' && isLongContent && (
            <div className="flex items-center gap-1 text-xs opacity-75 whitespace-nowrap">
              <Clock className="w-3 h-3" />
              <span>{estimatedTime}</span>
            </div>
          )}

          {/* 生成中的动态效果 */}
          {status === 'generating' && (
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-1 bg-current rounded-full animate-bounce opacity-60"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 进度条（仅在生成时显示，水平布局） */}
      {status === 'generating' && (
        <div className="mt-2">
          <div className="w-full h-1 bg-card/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-current rounded-full transition-all duration-1000 ease-out"
              style={{
                width: progress > 0 ? `${progress}%` : '30%',
                animation: progress === 0 ? 'indeterminate 2s ease-in-out infinite' : 'none'
              }}
            />
          </div>
        </div>
      )}

      {/* 成功状态的庆祝效果 */}
      {status === 'success' && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-accent0 rounded-full animate-ping"></div>
        </div>
      )}

      {/* CSS动画 */}
      <style>{`
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

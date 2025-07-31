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
    red: 'from-red-50 to-red-100 border-red-200 text-red-700',
    orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-700',
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
    green: 'from-green-50 to-green-100 border-green-200 text-green-700',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
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
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
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
    if (status === 'success') return 'from-green-50 to-green-100 border-green-200';
    if (status === 'error') return 'from-red-50 to-red-100 border-red-200';
    return colorClasses[platform?.color as keyof typeof colorClasses] || colorClasses.blue;
  };

  return (
    <div className={`relative bg-gradient-to-r ${getBgClasses()} border rounded-xl p-4 mb-4 transition-all duration-300`}>
      {/* 顶部状态栏 */}
      <div className="flex items-center gap-3 mb-3">
        {/* 平台图标 */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{platform?.icon}</span>
          <span className="font-medium text-sm">{platform?.name}</span>
        </div>
        
        {/* 状态图标 */}
        <div className="ml-auto">
          {getStatusIcon()}
        </div>
      </div>

      {/* 状态消息 */}
      <div className="space-y-2">
        <p className="text-sm font-medium">
          {getStatusMessage()}{status === 'generating' ? dots : ''}
        </p>

        {/* 长内容生成的额外信息 */}
        {status === 'generating' && isLongContent && (
          <div className="flex items-center gap-2 text-xs opacity-75">
            <Clock className="w-3 h-3" />
            <span>预计时间：{estimatedTime}</span>
          </div>
        )}

        {/* 进度条 */}
        {status === 'generating' && (
          <div className="space-y-1">
            <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-current rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: progress > 0 ? `${progress}%` : '30%',
                  animation: progress === 0 ? 'indeterminate 2s ease-in-out infinite' : 'none'
                }}
              />
            </div>
            {progress > 0 && (
              <div className="text-xs opacity-75 text-right">
                {progress}%
              </div>
            )}
          </div>
        )}

        {/* 生成中的动态效果 */}
        {status === 'generating' && (
          <div className="flex items-center gap-1 mt-2">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span className="text-xs opacity-75">AI正在思考中</span>
            <div className="flex gap-1 ml-2">
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

      {/* 成功状态的庆祝效果 */}
      {status === 'success' && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
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

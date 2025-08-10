/**
 * AI内容生成过渡动画组件
 * 现代化设计，拟物科技感，适配知识类内容生成场景
 */

import React, { useState, useEffect } from 'react';
import { Zap, Brain, Sparkles, Target, CheckCircle } from 'lucide-react';

interface AIContentGenerationAnimationProps {
  platforms?: string[];
  message?: string;
  showProgress?: boolean;
}

// 平台配置
const platformConfig = {
  xiaohongshu: { name: '小红书', icon: '📱', color: 'bg-destructive/10 text-destructive' },
  weibo: { name: '微博', icon: '🐦', color: 'bg-accent text-foreground' },
  zhihu: { name: '知乎', icon: '🎓', color: 'bg-accent text-primary' },
  wechat: { name: '微信', icon: '💬', color: 'bg-accent text-foreground' },
  douyin: { name: '抖音', icon: '🎵', color: 'bg-accent text-primary' },
  bilibili: { name: 'B站', icon: '📺', color: 'bg-accent text-primary' },
  twitter: { name: 'Twitter', icon: '🐦', color: 'bg-accent text-foreground' },
  video: { name: '视频', icon: '🎬', color: 'bg-accent text-primary' }
};

export const AIContentGenerationAnimation: React.FC<AIContentGenerationAnimationProps> = ({
  platforms = ['xiaohongshu', 'weibo', 'zhihu'],
  message = "AI正在为多个平台生成专属内容...",
  showProgress = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activePlatforms, setActivePlatforms] = useState<Set<string>>(new Set());
  const [brainPulse, setBrainPulse] = useState(false);

  // 动态文案 - 专注于整体流程，避免与平台状态重复
  const dynamicMessages = [
    "AI内容引擎启动中...",
    "正在分析内容特征...",
    "多平台适配算法运行中...",
    "内容优化处理中...",
    "即将完成内容生成..."
  ];

  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    // 大脑脉冲动画
    const brainInterval = setInterval(() => {
      setBrainPulse(prev => !prev);
    }, 1500);

    // 动态消息切换
    const messageInterval = setInterval(() => {
      setCurrentMessage(dynamicMessages[Math.floor(Math.random() * dynamicMessages.length)]);
    }, 3000);

    // 平台逐个激活动画
    const platformInterval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % (platforms.length + 1);
        if (nextStep < platforms.length) {
          setActivePlatforms(prev => new Set([...prev, platforms[nextStep]]));
        } else {
          // 重置动画
          setActivePlatforms(new Set());
        }
        return nextStep;
      });
    }, 800);

    return () => {
      clearInterval(brainInterval);
      clearInterval(messageInterval);
      clearInterval(platformInterval);
    };
  }, [platforms]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* 主背景卡片 */}
      <div className="bg-accent rounded-2xl border border-border shadow-lg overflow-hidden">
        {/* 顶部装饰条 */}
        <div className="h-1 bg-primary"></div>
        
        <div className="p-8">
          {/* 核心AI大脑动画区域 */}
          <div className="flex flex-col items-center mb-6">
            {/* AI大脑/机器人核心 */}
            <div className="relative mb-4">
              <div className={`w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-all duration-500 ${brainPulse ? 'scale-110 shadow-xl' : 'scale-100'}`}>
                <Brain className={`w-10 h-10 text-primary-foreground transition-all duration-500 ${brainPulse ? 'scale-110' : 'scale-100'}`} />
              </div>
              
              {/* 环绕的能量粒子 */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-primary rounded-full opacity-60"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${i * 60}deg) translateY(-40px) translateX(-4px)`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  >
                    <div className="w-full h-full bg-primary rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* 雷达扫描效果 */}
              <div className="absolute inset-0 rounded-full border-2 border-primary opacity-30 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border border-border opacity-20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>

            {/* 动态文案 - 简化以避免重复 */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-foreground animate-pulse" />
                AI内容引擎
                <Sparkles className="w-5 h-5 text-foreground animate-pulse" />
              </h3>
              <p className="text-sm text-muted-foreground transition-all duration-500 min-h-[20px]">
                {currentMessage}
              </p>
            </div>

            {/* 进度波浪动画 */}
            <div className="w-32 h-1 bg-muted rounded-full overflow-hidden mb-4">
              <div className="h-full bg-primary rounded-full animate-pulse"
                   style={{ 
                     width: '60%',
                     animation: 'wave 2s ease-in-out infinite'
                   }}>
              </div>
            </div>
          </div>

          {/* 平台图标进度展示 */}
          {showProgress && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">目标平台</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                {platforms.map((platformId, index) => {
                  const platform = platformConfig[platformId as keyof typeof platformConfig];
                  const isActive = activePlatforms.has(platformId);
                  const isCompleted = currentStep > index;
                  
                  return (
                    <div
                      key={platformId}
                      className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-500 ${
                        isActive 
                          ? 'bg-accent border-primary shadow-md scale-105' 
                          : isCompleted
                          ? 'bg-accent border-border'
                          : 'bg-accent border-border'
                      }`}
                    >
                      <span className="text-lg">{platform?.icon}</span>
                      <span className={`text-xs font-medium transition-colors ${
                        isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {platform?.name}
                      </span>
                      
                      {/* 完成状态图标 */}
                      {isCompleted && (
                        <CheckCircle className="w-3 h-3 text-foreground animate-bounce" />
                      )}
                      
                      {/* 活跃状态动画 */}
                      {isActive && (
                        <div className="absolute -top-1 -right-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 底部友好提示 */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/60 rounded-full border border-primary">
              <Zap className="w-4 h-4 text-foreground animate-pulse" />
              <span className="text-xs text-muted-foreground">
                AI正在为您量身定制优质内容
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS动画定义 */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

/**
 * 内容生成等待动画组件
 * 显示可爱的小动物移动动画
 */

import React, { useState, useEffect } from 'react';

interface LoadingAnimationProps {
  isVisible: boolean;
  message?: string;
}

const animals = [
  { emoji: '🐱', name: '小猫', speed: 3 },
  { emoji: '🐶', name: '小狗', speed: 2.5 },
  { emoji: '🐰', name: '小兔', speed: 4 },
  { emoji: '🐼', name: '熊猫', speed: 2 },
  { emoji: '🐨', name: '考拉', speed: 1.5 },
  { emoji: '🦊', name: '狐狸', speed: 3.5 },
  { emoji: '🐸', name: '青蛙', speed: 2.8 },
  { emoji: '🐧', name: '企鹅', speed: 2.2 }
];

const loadingMessages = [
  '正在召唤AI创作灵感...',
  '小动物们正在帮你写内容...',
  'AI正在认真思考中...',
  '内容创作进行中，请稍候...',
  '正在为你量身定制内容...',
  'AI创作引擎全力运转中...',
  '马上就好，请耐心等待...',
  '正在生成精彩内容...'
];

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  isVisible, 
  message 
}) => {
  const [currentAnimal, setCurrentAnimal] = useState(animals[0]);
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    // 随机选择动物和消息
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    
    setCurrentAnimal(randomAnimal);
    setCurrentMessage(message || randomMessage);
    setAnimationKey(prev => prev + 1);

    // 定期更换动物和消息
    const interval = setInterval(() => {
      const newAnimal = animals[Math.floor(Math.random() * animals.length)];
      const newMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      
      setCurrentAnimal(newAnimal);
      setCurrentMessage(message || newMessage);
      setAnimationKey(prev => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible, message]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-8 max-w-md w-full mx-4 text-center">
        {/* 动画容器 */}
        <div className="relative h-20 mb-6 overflow-hidden bg-accent rounded-lg">
          {/* 背景装饰 */}
          <div className="absolute inset-0">
            <div className="absolute top-2 left-4 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <div className="absolute top-6 right-8 w-1 h-1 bg-primary rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-3 left-12 w-1.5 h-1.5 bg-accent rounded-full animate-pulse delay-700"></div>
            <div className="absolute bottom-2 right-4 w-2 h-2 bg-primary rounded-full animate-pulse delay-500"></div>
          </div>

          {/* 移动的小动物 */}
          <div
            key={animationKey}
            className="absolute top-1/2 transform -translate-y-1/2 text-4xl"
            style={{
              animation: `moveAnimal ${6 / currentAnimal.speed}s linear infinite`
            }}
          >
            {currentAnimal.emoji}
          </div>

          {/* 足迹效果 */}
          <div className="absolute bottom-2 left-0 w-full">
            <div className="flex justify-between px-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-muted-foreground rounded-full opacity-30"
                  style={{
                    animationDelay: `${i * 0.5}s`,
                    animation: 'fadeInOut 4s infinite'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* 加载消息 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">
            {currentAnimal.name}正在努力创作中...
          </h3>
          <p className="text-muted-foreground text-sm">
            {currentMessage}
          </p>
        </div>

        {/* 进度指示器 */}
        <div className="mt-6">
          <div className="flex justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>

        {/* 提示文字 */}
        <div className="mt-4 text-xs text-muted-foreground">
          AI正在为您生成高质量内容，请稍候片刻
        </div>
      </div>

      <style>{`
        @keyframes moveAnimal {
          0% {
            left: -60px;
            transform: translateY(-50%) scaleX(1);
          }
          50% {
            transform: translateY(-50%) scaleX(1);
          }
          100% {
            left: calc(100% + 20px);
            transform: translateY(-50%) scaleX(1);
          }
        }

        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
};

// 简化版本的加载动画，用于内联显示
export const InlineLoadingAnimation: React.FC<{ message?: string }> = ({ message }) => {
  const [currentAnimal, setCurrentAnimal] = useState(animals[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
      setCurrentAnimal(randomAnimal);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center max-w-md mx-auto">
        {/* 小动物动画 - 调整更大 */}
        <div className="relative h-20 w-48 mx-auto mb-6 overflow-hidden bg-accent rounded-xl shadow-sm">
          <div
            className="absolute top-1/2 transform -translate-y-1/2 text-4xl"
            style={{
              animation: `moveAnimal ${4 / currentAnimal.speed}s linear infinite`
            }}
          >
            {currentAnimal.emoji}
          </div>
        </div>

        {/* 消息 - 调整样式和位置 */}
        <div className="bg-card rounded-lg shadow-sm border p-4 mb-4">
          <p className="text-base text-foreground font-medium">
            {message || `${currentAnimal.name}正在创作中...`}
          </p>
        </div>

        {/* 进度点 */}
        <div className="flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes moveAnimal {
          0% {
            left: -40px;
          }
          100% {
            left: calc(100% + 20px);
          }
        }
      `}</style>
    </div>
  );
};

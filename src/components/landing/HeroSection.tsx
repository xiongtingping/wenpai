/**
 * 英雄区域组件（极简重构版）
 * 只保留品牌、主标题、副标题、主按钮，提升呼吸感
 */
import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-background via-background/95 to-background/90 py-32 sm:py-48">
      {/* 柔和渐变背景装饰 */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <div className="absolute top-1/2 left-1/2 w-[480px] h-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-200/30 to-purple-200/20 blur-3xl"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-3xl mx-auto px-4">
        {/* 品牌LOGO+名 */}
        <div className="flex items-center justify-center mb-6">
          <span className="text-7xl mr-3">🎯</span>
          <h1 className="text-6xl sm:text-7xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            文派
          </h1>
        </div>
        {/* 主标题 */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-snug">
          让内容创作更 <span className="text-blue-600">智能</span>、更 <span className="text-pink-600">高效</span>
        </h2>
        {/* 副标题 */}
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          AI驱动的智能内容适配、创意生成和多平台分发工具
        </p>
        {/* 主操作按钮 */}
        <a href="/adapt">
          <button
            className="px-10 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold shadow-lg hover:scale-105 transition-all"
          >
            开始创作
          </button>
        </a>
      </div>
    </section>
  );
};
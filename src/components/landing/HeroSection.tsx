/**
 * 英雄区域组件（品牌感美化版）
 * 现代渐变、品牌行、主副标题分层、圆角阴影、按钮优化
 */
import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] via-[#f0f4ff] to-[#f8f9fa] overflow-hidden">
      {/* 背景渐变圆形装饰 */}
      <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-blue-200/40 to-pink-200/20 blur-3xl z-0" />
      <div className="absolute bottom-0 right-0 w-[320px] h-[320px] rounded-full bg-gradient-to-tr from-pink-100/40 to-blue-100/10 blur-2xl z-0" />
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-16 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col items-center text-center">
        {/* 品牌行 */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-5xl md:text-6xl">🎯</span>
          <span className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent tracking-tight">文派</span>
        </div>
        {/* 主标题 */}
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
          让内容创作更 <span className="text-blue-600">智能</span>、更 <span className="text-pink-500">高效</span>
        </h1>
        {/* 副标题 */}
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl mx-auto">
          AI驱动的智能内容适配、创意生成与多平台分发工具
        </p>
        {/* 主操作按钮 */}
        <a href="/adapt">
          <button
            className="px-10 py-4 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 text-white text-xl font-semibold shadow-xl hover:scale-105 transition-all"
          >
            开始创作
          </button>
        </a>
      </div>
    </section>
  );
};
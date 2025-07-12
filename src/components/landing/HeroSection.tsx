/**
 * 首页主视觉区块（极简大标题风格）
 * 参考用户最新设计，纯白背景，大号主标题，圆润按钮，紧凑留白
 */
import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="bg-white pt-24 pb-20 text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold leading-tight mb-4">
          让内容创作更 <span className="text-blue-600 font-extrabold">智能</span>、更 <span className="text-pink-500 font-extrabold">高效</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8">AI驱动的智能内容适配、创意生成与多平台分发工具</p>
        <a href="/adapt">
          <button className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-lg rounded-full shadow-xl transition transform hover:scale-105 hover:shadow-2xl">
            开始创作
          </button>
        </a>
      </div>
    </section>
  );
};
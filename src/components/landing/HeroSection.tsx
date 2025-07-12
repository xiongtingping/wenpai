/**
 * 首页主视觉区块（极简现代风格）
 * 参考用户最新设计，简洁渐变背景，主副标题、按钮居中
 */
import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-white to-slate-50 py-20">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          让内容创作更 <span className="text-blue-600">智能</span>、更 <span className="text-pink-500">高效</span>
        </h1>
        <p className="text-lg text-gray-600 mb-6">AI驱动的智能内容适配、创意生成与多平台分发工具</p>
        <a href="/adapt">
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:opacity-90 transition">
            开始创作
          </button>
        </a>
      </div>
    </section>
  );
};
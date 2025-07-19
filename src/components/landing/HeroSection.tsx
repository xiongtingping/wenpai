/**
 * Hero区域组件
 * 简化按钮点击逻辑
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';

/**
 * Hero区域组件
 * @returns React组件
 */
const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useUnifiedAuth();

  /**
   * 处理按钮点击事件
   */
  const handleButtonClick = () => {
    console.log('=== Hero按钮点击事件开始 ===');
    console.log('Hero开始创作按钮被点击');
    console.log('当前认证状态:', isAuthenticated);
    console.log('login函数类型:', typeof login);
    console.log('navigate函数类型:', typeof navigate);

    if (isAuthenticated) {
      console.log('用户已登录，直接跳转到创作页面');
      navigate('/creative');
    } else {
      console.log('用户未登录，直接跳转到Authing登录页面');
      // 直接调用登录方法，不进行复杂的网络检查
      login('/creative');
    }

    console.log('=== Hero按钮点击事件完成 ===');
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          {/* 品牌标识 - 优化设计 */}
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 rounded-full mb-8 shadow-xl border-4 border-white/20 hover:scale-105 transition-all duration-300 hover:shadow-2xl group">
              <span className="text-4xl font-bold text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-300">文</span>
            </div>
          </div>
          
          {/* 主标题 - 优化设计 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              文派AI
            </span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-700 mt-3">
              智能创作平台
            </span>
          </h1>
          
          {/* 核心价值主张 */}
          <div className="max-w-4xl mx-auto mb-8">
            <p className="text-xl sm:text-2xl text-gray-800 font-semibold mb-3">
              🚀 让AI为您的品牌创作独特内容
            </p>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              智能分析 · 多平台适配 · 一键生成 · 提升营销效果
            </p>
          </div>
          
          {/* 主要行动按钮 */}
          <div className="mb-16">
            <Button
              onClick={handleButtonClick}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-xl font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              开始创作
            </Button>
          </div>
          
          {/* 核心优势 - 重新设计 */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 快速生成 */}
              <div className="group relative">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">⚡ 快速生成</h3>
                      <p className="text-sm text-blue-600 font-medium">AI秒级响应</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    智能分析需求，<span className="font-semibold text-blue-600">3秒内</span>生成高质量内容，大幅提升创作效率
                  </p>
                </div>
              </div>
              
              {/* 品牌一致 */}
              <div className="group relative">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">🎯 品牌一致</h3>
                      <p className="text-sm text-green-600 font-medium">调性统一</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    智能学习品牌风格，确保<span className="font-semibold text-green-600">内容调性统一</span>，提升品牌识别度
                  </p>
                </div>
              </div>
              
              {/* 成本节省 */}
              <div className="group relative">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">💰 成本节省</h3>
                      <p className="text-sm text-purple-600 font-medium">降本增效</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    自动化内容创作流程，<span className="font-semibold text-purple-600">节省80%</span>人工成本，提升ROI
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
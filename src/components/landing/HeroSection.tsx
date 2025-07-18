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
        <div className="text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            文派
            <span className="text-blue-600">AI创作平台</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl">
            让AI为您的品牌创作独特内容，提升营销效果，节省创作时间
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-start items-center">
            <Button
              onClick={handleButtonClick}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg transition-colors"
            >
              开始创作
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-left">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">快速生成</h3>
              <p className="text-gray-600">AI秒级生成高质量内容</p>
            </div>
            
            <div className="text-left">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">品牌一致</h3>
              <p className="text-gray-600">保持品牌调性统一</p>
            </div>
            
            <div className="text-left">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">成本节省</h3>
              <p className="text-gray-600">大幅降低创作成本</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
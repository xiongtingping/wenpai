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

    try {
      if (isAuthenticated) {
        console.log('用户已登录，直接跳转到AI内容适配器页面');
        navigate('/new-adapt');
      } else {
        console.log('用户未登录，调用登录函数');
        if (typeof login === 'function') {
          login('/new-adapt');
        } else {
          console.error('❌ login函数不可用:', login);
          // 备用方案：直接跳转到登录页面
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('❌ 按钮点击处理出错:', error);
      // 备用方案：直接跳转到登录页面
      navigate('/login');
    }

    console.log('=== Hero按钮点击事件完成 ===');
  };

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 particle-background" style={{ minHeight: 'auto' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          {/* 主标题 - 移除大logo后的优化布局 */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-4 leading-tight">
              <div className="flex items-center justify-center gap-4">
                {/* 小熊猫图标 - 使用清晰的SVG文件 */}
                <img
                  src="/logo-panda.svg"
                  alt="文派Logo"
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                />
                <span className="text-primary">
                  文派 AI 智能创作平台
                </span>
              </div>
            </h1>

            {/* 核心价值主张 - 优化排版结构 */}
            <div className="max-w-4xl mx-auto text-center">
              {/* 第一行：核心价值主张 */}
              <div className="mb-6">
                <p className="text-xl sm:text-2xl text-primary font-bold leading-relaxed">
                  <strong className="text-primary">
                    让 AI 为您的品牌创作独特内容
                  </strong>
                </p>
              </div>

              {/* 第二行：四个要点 - 修复对齐问题 */}
              <div className="text-lg sm:text-xl text-secondary font-medium">
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 sm:gap-x-8 lg:gap-x-12">
                  <div className="flex items-center gap-2">
                    <span className="text-accent text-2xl leading-none">·</span>
                    <span className="whitespace-nowrap">智能分析</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent text-2xl leading-none">·</span>
                    <span className="whitespace-nowrap">多平台适配</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent text-2xl leading-none">·</span>
                    <span className="whitespace-nowrap">一键生成</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent text-2xl leading-none">·</span>
                    <span className="whitespace-nowrap">提升营销效果</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 主要行动按钮 - 增强视觉效果 */}
          <div className="mb-16">
            <div className="relative group inline-block">
              <Button
                onClick={handleButtonClick}
                variant="gradient"
                size="lg"
                className="relative inline-flex items-center justify-center px-14 py-6 text-xl font-bold rounded-xl overflow-hidden group/button min-h-[4rem]"
              >
                <span className="relative z-10 hero-button-content gap-3">
                  <svg className="w-7 h-7 group-hover/button:rotate-12 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="hero-button-text font-bold">AI 一键创作</span>
                  <svg className="w-6 h-6 group-hover/button:translate-x-2 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                {/* 动态背景效果 */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/button:opacity-100 transition-opacity duration-300"></div>
                {/* 闪烁效果 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover/button:translate-x-full transition-transform duration-700"></div>
              </Button>


            </div>
          </div>
          
          {/* 核心优势 - 重新设计 */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 快速生成 */}
              <div className="group relative">
                <div className="bg-card p-6 rounded-xl border border-border transition-smooth shadow-e0 hover:shadow-e1">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-smooth shadow-e0">
                      <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary">⚡ 快速生成</h3>
                      <p className="text-sm text-secondary font-medium">AI秒级响应</p>
                    </div>
                  </div>
                  <p className="text-secondary leading-relaxed">
                    智能分析需求，<span className="font-semibold text-primary">3秒内</span>生成高质量内容，大幅提升创作效率
                  </p>
                </div>
              </div>
              
              {/* 品牌一致 */}
              <div className="group relative">
                <div className="bg-card p-6 rounded-2xl border border-border transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary">🎯 品牌一致</h3>
                      <p className="text-sm text-secondary font-medium">调性统一</p>
                    </div>
                  </div>
                  <p className="text-secondary leading-relaxed">
                    智能学习品牌风格，确保<span className="font-semibold text-primary">内容调性统一</span>，提升品牌识别度
                  </p>
                </div>
              </div>
              
              {/* 成本节省 */}
              <div className="group relative">
                <div className="bg-card p-6 rounded-2xl border border-border transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary">💰 成本节省</h3>
                      <p className="text-sm text-secondary font-medium">降本增效</p>
                    </div>
                  </div>
                  <p className="text-secondary leading-relaxed">
                    自动化内容创作流程，<span className="font-semibold text-primary">节省80%</span>人工成本，提升ROI
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
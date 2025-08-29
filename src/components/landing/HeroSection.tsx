/**
 * Hero区域组件
 * 简化按钮点击逻辑
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
// 🔧 [DIRECT_AUTH_FIX_v2025.08.15] 使用DirectAuth替代UnifiedAuth
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeAwareLogo } from '@/components/ui/ThemeAwareLogo';

/**
 * Hero区域组件
 * @returns React组件
 */
const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  /**
   * 处理按钮点击事件
   */
  const handleButtonClick = async () => {
    try {
      if (isAuthenticated) {
        navigate('/new-adapt');
      } else if (typeof login === 'function') {
        localStorage.setItem('login_redirect_to', '/new-adapt');
        await login();
      } else {
        navigate('/login');
      }
    } catch {
      navigate('/login');
    }
  };

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8" style={{ minHeight: 'auto' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          {/* 主标题 - 移除大logo后的优化布局 */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              <span className="rainbow-logo-text">
                AI驱动的新媒体内容多平台适配
              </span>
            </h1>

            {/* 核心价值主张 - 优化排版结构 */}
            <div className="max-w-4xl mx-auto text-center">
              {/* 第一行：核心价值主张 */}
              <div className="mb-10">
                <p className="text-xl sm:text-2xl font-bold leading-relaxed theme-hero-subtitle">
                  <strong className="theme-hero-subtitle">
                    一键为不同平台量身打造风格化内容
                  </strong>
                </p>
              </div>

              {/* 第二行：四个要点 - 修复对齐问题 */}
              <div className="text-lg sm:text-xl theme-hero-points-text font-medium mb-12">
                <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 sm:gap-x-12 lg:gap-x-16">
                  <div className="flex items-center gap-2">
                    <span className="theme-hero-points-dot text-2xl leading-none">·</span>
                    <span className="whitespace-nowrap">AI赋能</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="theme-hero-points-dot text-2xl leading-none">·</span>
                    <span className="whitespace-nowrap">多平台适配</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="theme-hero-points-dot text-2xl leading-none">·</span>
                    <span className="whitespace-nowrap">节省时间</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="theme-hero-points-dot text-2xl leading-none">·</span>
                    <span className="whitespace-nowrap">专注创意</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 主要行动按钮 - 增强视觉效果 */}
          <div className="mb-20">
            <div className="relative group inline-block">
              <Button
                onClick={handleButtonClick}
                size="lg"
                className="relative inline-flex items-center justify-center px-14 py-6 text-xl font-bold rounded-xl overflow-hidden group/button min-h-[4rem] theme-hero-button text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
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
                <div className="enhanced-card p-6 rounded-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-all duration-300 shadow-e1">
                      <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">⚡ 快速生成</h3>
                      <p className="text-sm text-muted-foreground font-medium">AI秒级响应</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    智能分析需求，<span className="font-semibold text-foreground">3秒内</span>生成高质量内容，大幅提升创作效率
                  </p>
                </div>
              </div>
              
              {/* 品牌一致 */}
              <div className="group relative">
                <div className="enhanced-card p-6 rounded-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">🎯 品牌一致</h3>
                      <p className="text-sm text-muted-foreground font-medium">调性统一</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    智能学习品牌风格，确保<span className="font-semibold text-foreground">内容调性统一</span>，提升品牌识别度
                  </p>
                </div>
              </div>
              
              {/* 成本节省 */}
              <div className="group relative">
                <div className="enhanced-card p-6 rounded-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">💰 成本节省</h3>
                      <p className="text-sm text-muted-foreground font-medium">降本增效</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    自动化内容创作流程，<span className="font-semibold text-foreground">节省80%</span>人工成本，提升ROI
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
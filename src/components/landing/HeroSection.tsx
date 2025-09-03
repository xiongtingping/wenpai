/**
 * Hero区域组件
 * 简化按钮点击逻辑
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  /**
   * 处理按钮点击事件
   */
  const handleButtonClick = async () => {
    try {
      if (isAuthenticated) {
        navigate('/new-adapt');
        // 页面加载后滚动到内容生成区
        setTimeout(() => {
          const contentArea = document.getElementById('content-generation-area');
          if (contentArea) {
            contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            // 如果内容生成区不存在，滚动到页面中部区域
            window.scrollTo({ top: window.innerHeight * 0.3, behavior: 'smooth' });
          }
        }, 500);
      } else if (typeof login === 'function') {
        localStorage.setItem('login_redirect_to', '/new-adapt#content-generation');
        await login();
      } else {
        navigate('/login');
      }
    } catch {
      navigate('/login');
    }
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-var(--header-height,64px))] flex flex-col justify-center pt-20 sm:pt-24 lg:pt-28 pb-12">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center w-full">
          {/* 主标题 - 移除大logo后的优化布局 */}
          <div className="mb-10 mt-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              <span className="rainbow-logo-text">
                {t('home.heroTitle')}
              </span>
            </h1>

            {/* 核心价值主张 - 优化排版结构 */}
            <div className="max-w-4xl mx-auto text-center">
              {/* 第一行：核心价值主张 */}
              <div className="mb-10">
                <p className="text-xl sm:text-2xl font-bold leading-relaxed theme-hero-subtitle">
                  <strong className="theme-hero-subtitle">
                    {t('home.heroSubtitle')}
                  </strong>
                </p>
              </div>

              {/* 第二行：四个要点 - 修复对齐问题 */}
              <div className="text-lg sm:text-xl theme-hero-points-text font-medium mb-12">
                <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 sm:gap-x-12 lg:gap-x-16">
                  <div className="flex items-center gap-2">
                    <span className="theme-hero-points-dot text-2xl leading-none">·</span>
                    <span className="whitespace-nowrap">{t('home.highlights.aiPowered')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="theme-hero-points-dot text-2xl leading-none">·</span>
                    <span className="whitespace-nowrap">{t('home.highlights.multiPlatform')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="theme-hero-points-dot text-2xl leading-none">·</span>
                    <span className="whitespace-nowrap">{t('home.highlights.timeSaving')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="theme-hero-points-dot text-2xl leading-none">·</span>
                    <span className="whitespace-nowrap">{t('home.highlights.focusCreative')}</span>
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
                  <span className="hero-button-text font-bold">{t('home.getStarted')}</span>
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
          <div className="max-w-5xl mx-auto mt-14 sm:mt-16 lg:mt-20">
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
                      <h3 className="text-lg font-bold text-foreground" dangerouslySetInnerHTML={{__html: t('home.advantages.fastGeneration.title')}}></h3>
                      <p className="text-sm text-muted-foreground font-medium">{t('home.advantages.fastGeneration.subtitle')}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    <span dangerouslySetInnerHTML={{__html: t('home.advantages.fastGeneration.description')}}></span>
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
                      <h3 className="text-lg font-bold text-foreground" dangerouslySetInnerHTML={{__html: t('home.advantages.brandConsistency.title')}}></h3>
                      <p className="text-sm text-muted-foreground font-medium">{t('home.advantages.brandConsistency.subtitle')}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    <span dangerouslySetInnerHTML={{__html: t('home.advantages.brandConsistency.description')}}></span>
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
                      <h3 className="text-lg font-bold text-foreground" dangerouslySetInnerHTML={{__html: t('home.advantages.costSaving.title')}}></h3>
                      <p className="text-sm text-muted-foreground font-medium">{t('home.advantages.costSaving.subtitle')}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    <span dangerouslySetInnerHTML={{__html: t('home.advantages.costSaving.description')}}></span>
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
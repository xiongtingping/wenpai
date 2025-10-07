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
import { Network, Share2, Sparkles } from 'lucide-react';

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
        navigate('/content-adapter');
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
        localStorage.setItem('login_redirect_to', '/adapt#content-generation');
        await login();
      } else {
        navigate('/login');
      }
    } catch {
      navigate('/login');
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-var(--header-height,var(--spacing-16)))] flex flex-col justify-center pt-20 sm:pt-24 lg:pt-28 pb-12">
      <div className="ds-container-wide">
        <div className="ds-text-centered w-full">
          {/* 主标题 - 应用设计系统 */}
          <div className="mb-10 mt-0">
            <h1 className="ds-title-main mb-8 leading-tight">
              <span className="rainbow-logo-text">
                {t('home.heroTitle')}
              </span>
            </h1>

            {/* 核心价值主张 - 优化排版结构 */}
            <div className="ds-container-narrow ds-text-centered">
              {/* 第一行：核心价值主张 */}
              <div className="mb-10">
                <p className="ds-text-body-large leading-relaxed theme-hero-subtitle">
                  <strong className="theme-hero-subtitle">
                    {t('home.heroSubtitle')}
                  </strong>
                </p>
              </div>


            </div>
          </div>
          
          {/* 主要行动按钮 - 增强视觉效果 */}
          <div className="mb-20 flex justify-center w-full">
            <div className="relative group">
              <Button
                onClick={handleButtonClick}
                size="lg"
                className="relative overflow-hidden group/button"
              >
                <span className="relative z-10 flex items-center justify-center gap-3 w-full">
                  <svg className="w-7 h-7 group-hover/button:rotate-12 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-bold text-center">{t('home.getStarted')}</span>
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
          <div className="ds-container-wide mt-14 sm:mt-16 lg:mt-20">
            <div className="ds-grid-3">
              {/* 快速生成 */}
              <div className="group relative">
                <div className="enhanced-card ds-card ds-card-padding ds-transition-standard ds-hover-scale text-center">
                  <div className="ds-icon-decorative bg-primary text-primary-foreground mx-auto mb-4 ds-icon-centered group-hover:scale-110 ds-transition-standard">
                    {/* 全球AI模型聚合 */}
                    <Network className="w-4 h-4" />
                  </div>
                  <div className="mb-3">
                    <h3 className="ds-title-card ds-text-primary mb-1" dangerouslySetInnerHTML={{__html: t('home.advantages.fastGeneration.title')}}></h3>
                    <p className="ds-text-helper ds-text-secondary font-medium">{t('home.advantages.fastGeneration.subtitle')}</p>
                  </div>
                </div>
              </div>

              {/* 品牌一致 */}
              <div className="group relative">
                <div className="enhanced-card ds-card ds-card-padding ds-transition-standard ds-hover-scale text-center">
                  <div className="ds-icon-decorative bg-primary text-primary-foreground mx-auto mb-4 ds-icon-centered group-hover:scale-110 ds-transition-standard">
                    {/* 一键适配多平台 */}
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div className="mb-3">
                    <h3 className="ds-title-card ds-text-primary mb-1" dangerouslySetInnerHTML={{__html: t('home.advantages.brandConsistency.title')}}></h3>
                    <p className="ds-text-helper ds-text-secondary font-medium">{t('home.advantages.brandConsistency.subtitle')}</p>
                  </div>
                </div>
              </div>

              {/* 成本节省 */}
              <div className="group relative">
                <div className="enhanced-card ds-card ds-card-padding ds-transition-standard ds-hover-scale text-center">
                  <div className="ds-icon-decorative bg-primary text-primary-foreground mx-auto mb-4 ds-icon-centered group-hover:scale-110 ds-transition-standard">
                    {/* 把时间留给创意，把重复交给AI */}
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="mb-3">
                    <h3 className="ds-title-card ds-text-primary mb-1" dangerouslySetInnerHTML={{__html: t('home.advantages.costSaving.title')}}></h3>
                    <p className="ds-text-helper ds-text-secondary font-medium">{t('home.advantages.costSaving.subtitle')}</p>
                  </div>
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
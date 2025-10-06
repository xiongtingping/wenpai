// import { Header } from "@/components/landing/Header" // 临时注释 - Header现在在App.tsx中全局渲染
import HeroSection from "@/components/landing/HeroSection";
import { WavyBackground } from "@/components/ui/wavy-background";
import { TrustSection } from "@/components/landing/TrustSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { CTASection } from "@/components/landing/CTASection"
import { Footer } from "@/components/landing/Footer"
// 已迁移至独立页面：BrowserExtensionPage
// import { ExtensionPromoBanner, ExtensionGuideSection } from "@/components/landing/ExtensionPromoBanner"
import { useScrollAnimation } from "@/components/landing/ScrollAnimation"
import PageTracker from "@/components/analytics/PageTracker"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useTranslation } from 'react-i18next'

function HomePage() {
  // Initialize scroll animation
  useScrollAnimation()
  const { t } = useTranslation()

  const location = useLocation()

  // 处理从其他页面返回时的滚动到Footer功能
  useEffect(() => {
    if (location.state?.scrollToFooter) {
      // 等待页面完全加载后滚动到底部
      const scrollToFooter = () => {
        const maxHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        );
        window.scrollTo({
          top: maxHeight,
          behavior: 'smooth'
        });
      };

      // 多次尝试滚动，确保页面完全渲染
      setTimeout(scrollToFooter, 100);
      setTimeout(scrollToFooter, 300);
      setTimeout(scrollToFooter, 600);
      setTimeout(scrollToFooter, 1000);

      // 清除状态，避免重复滚动
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location])

  return (
    <div className="homepage-container min-h-screen relative">
      {/* 页面访问记录 */}
      <PageTracker
        title={t('pages.titles.首页')}
        description={t('pages.descriptions.首页')}
        metadata={{
          layout: 'landing',
          hasNavigation: false,
          pageType: 'home'
        }}
      />

      {/* Header - 独立于背景之外，确保固定定位 */}
      {/* <Header /> */} {/* 临时注释 - Header现在在App.tsx中全局渲染 */}
      {/* 动态占位，避免被头部遮挡，同时让头部悬浮于任何滚动位置均可见 */}
      <div aria-hidden className="header-spacer"></div>

      {/* 全页面背景效果 */}
      <WavyBackground
        className="w-full"
        containerClassName="min-h-screen flex flex-col"
        waveOpacity={0.15}
        speed="slow"
        blur={20}
      >
        <div className="relative z-10 flex-1 min-h-screen flex flex-col">

          <main className="flex-1 w-full">
            {/* Hero Section - 由组件内部控制首屏高度与间距（已考虑Header高度） */}
            <div className="relative hero-section flex items-center justify-center ds-container py-0">
              <div className="text-center w-full">
                <HeroSection />
              </div>
            </div>

            {/* Trust Section */}
            <div className="ds-section-spacing-small ds-bg-section-primary">
              <TrustSection />
            </div>

            {/* 扩展推广横幅已迁移至独立页面 /browser-extension */}

            {/* How It Works */}
            <div className="ds-section-spacing">
              <HowItWorks />
            </div>

            {/* Features Section */}
            <div className="ds-section-spacing ds-bg-section-secondary">
              <FeaturesSection />
            </div>

            {/* 扩展使用指南已迁移至独立页面 /browser-extension */}

            {/* Pricing Section */}
            <div className="ds-section-spacing ds-bg-section-primary">
              <PricingSection />
            </div>

            {/* CTA Section */}
            <div className="ds-section-spacing-large">
              <CTASection />
            </div>
          </main>

          <Footer />
        </div>
      </WavyBackground>
    </div>
  )
}

export default HomePage

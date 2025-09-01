import { Header } from "@/components/landing/Header"
import HeroSection from "@/components/landing/HeroSection";
import { WavyBackground } from "@/components/ui/wavy-background";
import { TrustSection } from "@/components/landing/TrustSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { CTASection } from "@/components/landing/CTASection"
import { Footer } from "@/components/landing/Footer"
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
    <div className="min-h-screen relative">
      {/* 页面访问记录 */}
      <PageTracker
        title={t('home.title')}
        description={t('home.heroSubtitle')}
        metadata={{
          layout: 'landing',
          hasNavigation: false,
          pageType: 'home'
        }}
      />

      {/* Header - 独立于背景之外，确保固定定位 */}
      <Header />
      {/* 动态占位，避免被头部遮挡，同时让头部悬浮于任何滚动位置均可见 */}
      <div aria-hidden className="h-[var(--header-height,64px)]"></div>

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
            <div className="relative min-h-[calc(100vh-var(--header-height,64px))] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-0">
              <div className="max-w-7xl mx-auto text-center w-full">
                <HeroSection />
              </div>
            </div>

            {/* Trust Section */}
            <div className="py-4 sm:py-6 lg:py-8 bg-background/60 backdrop-blur-sm mt-6 sm:mt-8 lg:mt-10">
              <TrustSection />
            </div>

            {/* How It Works */}
            <div className="py-8 sm:py-10 lg:py-12">
              <HowItWorks />
            </div>

            {/* Features Section */}
            <div className="py-6 sm:py-8 lg:py-10 bg-card/30 backdrop-blur-sm">
              <FeaturesSection />
            </div>

            {/* Testimonials Section */}
            <div className="py-6 sm:py-8 lg:py-10">
              <TestimonialsSection />
            </div>

            {/* Pricing Section */}
            <div className="py-4 sm:py-6 lg:py-8 bg-background/60 backdrop-blur-sm">
              <PricingSection />
            </div>

            {/* CTA Section */}
            <div className="py-8 sm:py-12 lg:py-16">
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

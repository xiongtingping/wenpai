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

function HomePage() {
  // Initialize scroll animation
  useScrollAnimation()

  return (
    <div className="min-h-screen relative">
      {/* 页面访问记录 */}
      <PageTracker
        title="文派 - AI驱动的创意内容平台"
        description="专业的AI内容创作工具，助力品牌营销和内容创作"
        metadata={{
          layout: 'landing',
          hasNavigation: false,
          pageType: 'home'
        }}
      />

      {/* Header - 独立于背景之外，确保固定定位 */}
      <Header />

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
            {/* Hero Section - 真正的全屏显示，考虑Header高度 */}
            <div className="relative h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
              <div className="max-w-7xl mx-auto text-center w-full">
                <HeroSection />
              </div>
            </div>

            {/* Trust Section */}
            <div className="py-6 sm:py-8 lg:py-10 bg-background/60 backdrop-blur-sm">
              <TrustSection />
            </div>

            {/* How It Works */}
            <div className="py-12 sm:py-16 lg:py-20">
              <HowItWorks />
            </div>

            {/* Features Section */}
            <div className="py-12 sm:py-16 lg:py-20 bg-card/30 backdrop-blur-sm">
              <FeaturesSection />
            </div>

            {/* Testimonials Section */}
            <div className="py-12 sm:py-16 lg:py-20">
              <TestimonialsSection />
            </div>

            {/* Pricing Section */}
            <div className="py-12 sm:py-16 lg:py-20 bg-background/60 backdrop-blur-sm">
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

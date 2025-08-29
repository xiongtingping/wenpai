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

      {/* 全页面背景效果 */}
      <WavyBackground 
        className="w-full"
        containerClassName="min-h-screen flex flex-col"
        waveOpacity={0.15}
        speed="slow"
        blur={20}
      >
        <div className="relative z-10 flex-1 min-h-screen flex flex-col">
          <Header />

          <main className="flex-1 w-full">
            {/* Hero Section */}
            <div className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto text-center space-y-6">
                <HeroSection />
              </div>
            </div>

            {/* Trust Section */}
            <div className="py-8 bg-background/60 backdrop-blur-sm">
              <TrustSection />
            </div>

            {/* How It Works */}
            <div className="py-12">
              <HowItWorks />
            </div>

            {/* Features Section */}
            <div className="py-12 bg-card/30 backdrop-blur-sm">
              <FeaturesSection />
            </div>

            {/* Testimonials Section */}
            <div className="py-12">
              <TestimonialsSection />
            </div>

            {/* Pricing Section */}
            <div className="py-12 bg-background/60 backdrop-blur-sm">
              <PricingSection />
            </div>

            {/* CTA Section */}
            <div className="py-12">
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

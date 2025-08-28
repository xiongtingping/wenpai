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
    <div className="min-h-screen flex flex-col bg-background" style={{ minHeight: '100vh', height: 'auto' }}>
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

      <Header />

      <main className="flex-1 w-full relative z-10">
        {/* Hero Section with background */}
        <WavyBackground className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8" containerHeight="72vh">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <HeroSection />
          </div>
        </WavyBackground>

        {/* Trust Section */}
        <div className="py-8">
          <TrustSection />
        </div>

        {/* How It Works */}
        <div className="py-12">
          <HowItWorks />
        </div>

        {/* Features Section */}
        <div className="py-12">
          <FeaturesSection />
        </div>

        {/* Testimonials Section */}
        <div className="py-12">
          <TestimonialsSection />
        </div>

        {/* Pricing Section */}
        <div className="py-12">
          <PricingSection />
        </div>

        {/* CTA Section */}
        <div className="py-12">
          <CTASection />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default HomePage

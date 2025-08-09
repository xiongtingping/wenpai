import { Header } from "@/components/landing/Header"
import HeroSection from "@/components/landing/HeroSection"
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
    <div className="min-h-screen flex flex-col bg-gradient-primary">
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

      <main className="flex-1 w-full">
        {/* Hero Section - 渐变背景 */}
        <div className="bg-gradient-primary">
          <HeroSection />
        </div>

        {/* Trust Section - 白色背景 */}
        <div className="bg-white py-16">
          <TrustSection />
        </div>

        {/* How It Works - 浅色渐变背景 */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 py-20">
          <HowItWorks />
        </div>

        {/* Features Section - 白色背景 */}
        <div className="bg-white py-20">
          <FeaturesSection />
        </div>

        {/* Testimonials Section - 浅色渐变背景 */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 py-20">
          <TestimonialsSection />
        </div>

        {/* Pricing Section - 白色背景 */}
        <div className="bg-white py-20">
          <PricingSection />
        </div>

        {/* CTA Section - 渐变背景 */}
        <div className="bg-gradient-primary py-20">
          <CTASection />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default HomePage

import { Header } from "@/components/landing/Header"
import { HeroSection } from "@/components/landing/HeroSection"
import { TrustSection } from "@/components/landing/TrustSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { CTASection } from "@/components/landing/CTASection"
import { Footer } from "@/components/landing/Footer"
import { useScrollAnimation } from "@/components/landing/ScrollAnimation"

function HomePage() {
  // Initialize scroll animation
  useScrollAnimation()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 w-full">
        {/* Hero Section - 白色背景 */}
        <div className="bg-white">
          <HeroSection />
        </div>
        
        {/* Trust Section - 浅灰背景 */}
        <div className="bg-gray-50 py-16">
          <TrustSection />
        </div>
        
        {/* How It Works - 白色背景 */}
        <div className="bg-white py-20">
          <HowItWorks />
        </div>
        
        {/* Features Section - 浅灰背景 */}
        <div className="bg-gray-50 py-20">
          <FeaturesSection />
        </div>
        
        {/* Testimonials Section - 白色背景 */}
        <div className="bg-white py-20">
          <TestimonialsSection />
        </div>
        
        {/* Pricing Section - 浅灰背景 */}
        <div className="bg-gray-50 py-20">
          <PricingSection />
        </div>
        
        {/* CTA Section - 白色背景 */}
        <div className="bg-white py-20">
          <CTASection />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default HomePage
import { HeroSection } from "@/components/landing/HeroSection"
import { ChallengesSection } from "@/components/landing/ChallengesSection"
import { MetricsSection } from "@/components/landing/MetricsSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { CTASection } from "@/components/landing/CTASection"
import { Header } from "@/components/landing/Header"

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <ChallengesSection />
      <MetricsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  )
}

export default Landing
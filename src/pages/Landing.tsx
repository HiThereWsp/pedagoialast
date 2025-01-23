import { HeroSection } from "@/components/landing/HeroSection"
import { ChallengesSection } from "@/components/landing/ChallengesSection"
import { MetricsSection } from "@/components/landing/MetricsSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { Header } from "@/components/landing/Header"
import { SEO } from "@/components/SEO"

const Landing = () => {
  return (
    <div className="min-h-screen">
      <SEO 
        title="PedagoIA - Assistant pédagogique intelligent" 
        description="Votre assistant pédagogique qui vous aide à adapter vos cours, effectuer vos tâches administratives et préparer vos cours plus efficacement."
      />
      <Header />
      <HeroSection />
      <ChallengesSection />
      <MetricsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
    </div>
  )
}

export default Landing
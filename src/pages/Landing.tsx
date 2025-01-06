import { HeroSection } from "@/components/landing/HeroSection"
import { CTASection } from "@/components/landing/CTASection"
import { ChallengesSection } from "@/components/landing/ChallengesSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold">Pedagoia</div>
            <Button 
              variant="default"
              onClick={() => navigate('/login')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </nav>
      <div className="pt-16">
        <HeroSection />
        <CTASection />
        <ChallengesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FAQSection />
        <PricingSection />
      </div>
    </div>
  )
}
import { HeroSection } from "@/components/landing/HeroSection"
import { Header } from "@/components/landing/Header"
import { Footer } from "@/components/landing/Footer"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { SEO } from "@/components/SEO"

export default function Landing() {
  return (
    <>
      <SEO />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <FAQSection />
        </main>
        <Footer />
      </div>
    </>
  )
}
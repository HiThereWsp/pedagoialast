import { Zap } from "lucide-react"
import { ToolsCarousel } from "@/components/home/ToolsCarousel"
import { ShortcutsSection } from "@/components/home/ShortcutsSection"

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Hero Section with Value Proposition */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FEF7CD] to-[#FFDEE2] text-gray-700 mb-4 sm:mb-6">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Votre assistant pédagogique IA</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="block text-gray-900">Bienvenue dans votre espace PedagoIA</span>
          </h1>
        </div>

        {/* Tools Carousel */}
        <div className="mb-8 sm:mb-12">
          <ToolsCarousel />
        </div>

        {/* Shortcuts Section */}
        <ShortcutsSection />
      </div>
    </div>
  )
}

export default Home
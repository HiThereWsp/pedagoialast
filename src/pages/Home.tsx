import { Zap } from "lucide-react"
import { ToolsCarousel } from "@/components/home/ToolsCarousel"
import { ShortcutsSection } from "@/components/home/ShortcutsSection"
import { WelcomeBanner } from "@/components/WelcomeBanner"
import { QuickActions } from "@/components/QuickActions"

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        <WelcomeBanner />
        <QuickActions 
          onActionClick={async (action) => {
            console.log("Action clicked:", action)
          }}
          visible={true}
          onPromptSelect={(prompt) => {
            console.log("Prompt selected:", prompt)
          }}
        />
        <ToolsCarousel />
        <ShortcutsSection />
      </div>
    </div>
  )
}

export default Home
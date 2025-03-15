
import { Sparkles } from "lucide-react"

export const WelcomeBanner = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <img 
          src="/lovable-uploads/efb9f5d8-aaf9-42ea-853a-4ca24bf0469d.png" 
          alt="PedagoIA Logo" 
          className="h-10 sm:h-12"
        />
        <Sparkles className="h-6 w-6 text-indigo-500" />
      </div>
      <p className="text-xl font-medium text-gray-800">
        Comment puis-je vous aider aujourd'hui ?
      </p>
    </div>
  )
}

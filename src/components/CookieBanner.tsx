
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Cookie } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const hasAcceptedCookies = localStorage.getItem("cookiesAccepted")
    if (!hasAcceptedCookies) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookiesAccepted", "true")
    setIsVisible(false)
    toast({
      title: "Préférences enregistrées",
      description: "Merci d'avoir accepté nos cookies !",
    })
  }

  const handleRefuse = () => {
    localStorage.setItem("cookiesAccepted", "false")
    setIsVisible(false)
    toast({
      title: "Préférences enregistrées",
      description: "Vos préférences ont été sauvegardées.",
    })
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-lg border-t border-gray-200 shadow-lg p-4 md:p-6">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/5 p-3 rounded-full">
                <Cookie className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Nous utilisons des cookies pour améliorer votre expérience.{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    En savoir plus
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefuse}
                className="whitespace-nowrap"
              >
                Refuser
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="whitespace-nowrap"
              >
                Accepter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

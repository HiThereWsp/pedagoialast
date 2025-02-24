
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Cookie } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"
import { initGA } from "@/integrations/google-analytics/client"

interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
}

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    analytics: false,
    marketing: false
  })
  const { toast } = useToast()

  useEffect(() => {
    const savedPreferences = localStorage.getItem("cookiePreferences")
    if (!savedPreferences) {
      setIsVisible(true)
    } else {
      const parsedPreferences = JSON.parse(savedPreferences)
      setPreferences(parsedPreferences)
      // Initialiser GA si consentement analytics
      if (parsedPreferences.analytics) {
        initGA(true)
      }
    }
  }, [])

  const savePreferences = (analytics: boolean, marketing: boolean) => {
    const newPreferences = { analytics, marketing }
    localStorage.setItem("cookiePreferences", JSON.stringify(newPreferences))
    setPreferences(newPreferences)
    setIsVisible(false)

    // Initialiser GA si consentement analytics
    if (analytics) {
      initGA(true)
    }

    toast({
      title: "Préférences enregistrées",
      description: "Vos préférences de cookies ont été sauvegardées.",
    })
  }

  const handleAcceptAll = () => {
    savePreferences(true, true)
  }

  const handleAcceptEssential = () => {
    savePreferences(false, false)
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
                  Ce site utilise des cookies pour améliorer votre expérience. Pour en savoir plus sur l'utilisation des cookies, veuillez consulter notre{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    politique de confidentialité
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptEssential}
                className="whitespace-nowrap"
              >
                Cookies essentiels uniquement
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="whitespace-nowrap"
              >
                Accepter tout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

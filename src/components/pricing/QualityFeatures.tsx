import { MessageSquareText, Crown, Star } from "lucide-react"

interface QualityFeatureProps {
  icon: React.ReactNode
  title: string
  description: string
}

const QualityFeature = ({ icon, title, description }: QualityFeatureProps) => (
  <div className="text-center p-6 rounded-lg bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 shadow-lg">
    <div className="flex justify-center">{icon}</div>
    <h5 className="font-medium mb-2 text-foreground">{title}</h5>
    <p className="text-sm text-muted-foreground">
      {description}
    </p>
  </div>
)

export const QualityFeatures = () => {
  const features = [
    {
      icon: <MessageSquareText className="w-8 h-8 mb-4 text-primary" />,
      title: "Support réactif",
      description: "Une équipe dédiée à votre réussite"
    },
    {
      icon: <Crown className="w-8 h-8 mb-4 text-primary" />,
      title: "Satisfaction garantie",
      description: "30 jours pour essayer sans risque"
    },
    {
      icon: <Star className="w-8 h-8 mb-4 text-primary" />,
      title: "Mises à jour régulières",
      description: "De nouvelles fonctionnalités chaque mois"
    }
  ]

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {features.map((feature, index) => (
        <QualityFeature key={index} {...feature} />
      ))}
    </div>
  )
}
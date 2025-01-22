import { BackButton } from "@/components/settings/BackButton"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { SEO } from "@/components/SEO"

const DiscoverPage = () => {
  return (
    <>
      <SEO 
        title="Découvrir | PedagoIA - Explorez nos fonctionnalités"
        description="Découvrez toutes les fonctionnalités de PedagoIA : ressources pédagogiques, communauté d'enseignants et tutoriels."
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Découvrir</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Ressources pédagogiques</h2>
              <p className="text-gray-600 mb-4">
                Explorez notre collection de ressources pour enrichir vos cours.
              </p>
              <Button asChild>
                <Link to="/resources">Explorer</Link>
              </Button>
            </Card>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Communauté</h2>
              <p className="text-gray-600 mb-4">
                Échangez avec d'autres enseignants et partagez vos expériences.
              </p>
              <Button asChild>
                <Link to="/community">Rejoindre</Link>
              </Button>
            </Card>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Tutoriels</h2>
              <p className="text-gray-600 mb-4">
                Apprenez à utiliser toutes les fonctionnalités de Lov.
              </p>
              <Button asChild>
                <Link to="/tutorials">Commencer</Link>
              </Button>
            </Card>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Nouveautés</h2>
              <p className="text-gray-600 mb-4">
                Découvrez les dernières mises à jour et fonctionnalités.
              </p>
              <Button asChild>
                <Link to="/updates">Voir plus</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default DiscoverPage

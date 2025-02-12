
import { SEO } from "@/components/SEO"
import { Card } from "@/components/ui/card"
import { useSavedContent } from "@/hooks/useSavedContent"
import { Loader2 } from "lucide-react"

export default function SavedContentPage() {
  const { savedContent, isLoading, error } = useSavedContent()

  return (
    <>
      <SEO 
        title="Historique de mon contenu | PedagoIA"
        description="Consultez l'historique de vos contenus générés sur PedagoIA - exercices, séquences et documents administratifs."
      />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Historique de mon contenu</h1>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="p-6 text-center text-red-500">
            Une erreur est survenue lors du chargement de vos contenus.
          </Card>
        ) : savedContent?.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            Vous n'avez pas encore de contenus sauvegardés.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedContent?.map((content) => (
              <Card 
                key={content.id}
                className="p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <h3 className="font-semibold mb-2">{content.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {content.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(content.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {content.type}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

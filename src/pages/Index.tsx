import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-emerald-800 mb-4">
            Assistant IA Pédagogique
          </h1>
          <p className="text-lg text-emerald-600">
            Votre compagnon d'apprentissage intelligent
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-emerald-700">Poser une Question</CardTitle>
              <CardDescription>
                Obtenez des réponses claires et précises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Posez vos questions et recevez une aide personnalisée
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-emerald-700">Exercices Pratiques</CardTitle>
              <CardDescription>
                Pratiquez pour mieux apprendre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Accédez à des exercices adaptés à votre niveau
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-emerald-700">Ressources</CardTitle>
              <CardDescription>
                Explorez notre bibliothèque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Découvrez des ressources pédagogiques enrichissantes
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Pour commencer, cliquez sur une des cartes ci-dessus ou posez directement votre question.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
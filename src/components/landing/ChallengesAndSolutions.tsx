import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { XCircle, CheckCircle, Clock, UserPlus, Brain, FileText, Sparkles } from 'lucide-react';

export const ChallengesAndSolutions = () => {
  const challenges = [
    {
      icon: <Clock className="w-6 h-6 text-red-500" />,
      text: "Beaucoup d'heures passées à préparer les cours à la maison"
    },
    {
      icon: <UserPlus className="w-6 h-6 text-red-500" />,
      text: "Difficulté à adapter les ressources à chaque élève"
    },
    {
      icon: <Brain className="w-6 h-6 text-red-500" />,
      text: "Temps limité pour l'interaction individuelle"
    },
    {
      icon: <FileText className="w-6 h-6 text-red-500" />,
      text: "Stress lié à la gestion administrative"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-red-500" />,
      text: "Manque d'outils adaptés à l'ère numérique"
    }
  ];

  const solutions = [
    {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      text: "Génération automatique de séquences pédagogiques adaptées"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      text: "Différenciation intelligente pour chaque niveau d'élève"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      text: "Création rapide d'exercices et d'évaluations personnalisés"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      text: "Automatisation des tâches administratives répétitives",
      comingSoon: true
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      text: "Outils numériques intuitifs et connectés"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Passez-vous trop de temps à préparer vos cours et à corriger vos élèves ?
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <XCircle className="w-6 h-6 text-red-500" />
            Les défis quotidiens des enseignants
          </h2>
          <div className="space-y-4">
            {challenges.map((challenge, index) => (
              <div key={index} className="flex items-start gap-3">
                {challenge.icon}
                <p className="text-gray-700">{challenge.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white">
          <h2 className="text-xl font-semibold mb-4">
            Pédagoia, une solution sur-mesure
          </h2>
          <p className="text-gray-600 mb-4">
            En tant qu'experts en IA, nous étudions les méthodes de travail des
            enseignants afin d'identifier les leviers de productivité dans leurs
            tâches quotidiennes.
          </p>
          <div className="space-y-4">
            {solutions.map((solution, index) => (
              <div key={index} className="flex items-start gap-3">
                {solution.icon}
                <div className="flex items-center gap-2 flex-1">
                  <p className="text-gray-700">{solution.text}</p>
                  {solution.comingSoon && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-600 text-xs whitespace-nowrap">
                      à venir
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
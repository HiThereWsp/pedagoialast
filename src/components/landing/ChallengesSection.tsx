import { AlarmClock, BookOpen, ChartBar, CheckSquare, Clock, User, UserCheck } from "lucide-react"

export const ChallengesSection = () => {
  const challenges = [
    {
      icon: <AlarmClock className="w-12 h-12 text-primary mb-4" />,
      title: "41h de travail par semaine",
      description: "Une charge horaire conséquente qui impacte le quotidien"
    },
    {
      icon: <ChartBar className="w-12 h-12 text-primary mb-4" />,
      title: "21h de travail à domicile",
      description: "Un temps considérable consacré au travail hors classe"
    },
    {
      icon: <User className="w-12 h-12 text-primary mb-4" />,
      title: "Stress et surcharge administrative",
      description: "Une pression constante qui affecte le bien-être"
    }
  ]

  const solutions = [
    {
      icon: <BookOpen className="w-12 h-12 text-coral-400 mb-4" />,
      title: "Séquences pédagogiques adaptées",
      description: "Génération automatique de contenus personnalisés"
    },
    {
      icon: <UserCheck className="w-12 h-12 text-coral-400 mb-4" />,
      title: "Différenciation intelligente",
      description: "Adaptation automatique au niveau de chaque élève"
    },
    {
      icon: <CheckSquare className="w-12 h-12 text-coral-400 mb-4" />,
      title: "Automatisation administrative",
      description: "Réduction des tâches répétitives"
    },
    {
      icon: <Clock className="w-12 h-12 text-coral-400 mb-4" />,
      title: "Gain de temps significatif",
      description: "Plus de temps pour l'essentiel : vos élèves"
    }
  ]

  return (
    <>
      <section className="py-20 bg-[#F1F0FB]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Les conditions de travail des enseignants sont de plus en plus exigeantes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {challenges.map((challenge, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-200 text-center flex flex-col items-center"
              >
                <div className="flex justify-center">
                  {challenge.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{challenge.title}</h3>
                <p className="text-muted-foreground">{challenge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Pédagoia, une solution sur-mesure pour alléger votre charge de travail
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {solutions.map((solution, index) => (
              <div 
                key={index}
                className="p-8 rounded-xl text-center hover:scale-105 transition-all duration-200 flex flex-col items-center"
              >
                <div className="flex justify-center">
                  {solution.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{solution.title}</h3>
                <p className="text-muted-foreground">{solution.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Wand2, Users, BookOpen } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const metrics = [
  { 
    metric: "10h+", 
    description: "de temps libéré chaque semaine pour l'essentiel", 
    icon: Clock,
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent"
  },
  { 
    metric: "30+", 
    description: "tâches quotidiennes automatisées", 
    icon: Wand2,
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent"
  },
  { 
    metric: "100%", 
    description: "adaptable au niveau de vos élèves", 
    icon: Users,
    gradient: "from-green-500/10 via-green-500/5 to-transparent"
  },
  { 
    metric: "∞", 
    description: "nouvelles ressources mensuelles", 
    icon: BookOpen,
    gradient: "from-pink-500/10 via-pink-500/5 to-transparent"
  }
];

export function MetricsSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-secondary/5 to-white" />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Concentrez-vous sur l'essentiel : vos élèves
          </h2>
          <p className="text-lg sm:text-xl mb-8 sm:mb-12 text-muted-foreground">
            L'IA s'occupe du reste, vous gardez le contrôle
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {metrics.map((item, index) => (
              <Card 
                key={index} 
                className={`p-4 sm:p-6 bg-gradient-to-br ${item.gradient} backdrop-blur-sm border-none shadow-premium hover:shadow-premium-lg transition-all duration-300 transform hover:scale-105 group`}
              >
                <div className="flex flex-col items-center">
                  <div className="p-2 sm:p-3 bg-white rounded-xl shadow-sm mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    {item.metric}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 sm:mt-12">
            <Link to="/pricing">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 animate-shimmer -z-10" />
                Je rejoins la liste d'attente
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

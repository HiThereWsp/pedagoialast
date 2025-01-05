import React from 'react';
import { Clock, Wand2, Users, BookOpen } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const metrics = [
  { 
    metric: "10h+", 
    description: "de temps libéré chaque semaine pour l'essentiel", 
    icon: Clock,
    gradient: "from-blue-500/10 to-blue-500/5"
  },
  { 
    metric: "30+", 
    description: "tâches quotidiennes automatisées", 
    icon: Wand2,
    gradient: "from-purple-500/10 to-purple-500/5"
  },
  { 
    metric: "100%", 
    description: "adaptable au niveau de vos élèves", 
    icon: Users,
    gradient: "from-green-500/10 to-green-500/5"
  },
  { 
    metric: "∞", 
    description: "nouvelles ressources mensuelles", 
    icon: BookOpen,
    gradient: "from-pink-500/10 to-pink-500/5"
  }
];

export function MetricsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Concentrez-vous sur l'essentiel : vos élèves
          </h2>
          <p className="text-xl mb-12 text-muted-foreground">
            L'IA s'occupe du reste, vous gardez le contrôle
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((item, index) => (
              <Card 
                key={index} 
                className={`p-6 bg-gradient-to-br ${item.gradient} backdrop-blur-sm border-none shadow-premium hover:shadow-premium-lg transition-all duration-300 transform hover:scale-105`}
              >
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-white rounded-xl shadow-sm mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2 text-foreground">{item.metric}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mt-12">
            <Button 
              size="lg"
              className="bg-primary text-white hover:bg-primary/90 transition-all duration-200 text-lg px-8 py-6 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105"
            >
              J'essaye l'outil
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

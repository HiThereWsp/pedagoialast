import React, { useState, useEffect } from "react";
import { ArrowRight, Wand2, FileText, BookOpen, ImageIcon, LayoutGrid, MessageCircleQuestion, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MainContent() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div
          className={cn(
            "text-center mb-12 opacity-0 transform translate-y-4 transition-all duration-700 ease-out",
            isLoaded && "opacity-100 translate-y-0"
          )}
        >
          <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
            Que souhaitez-vous faire aujourd'hui ?
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mt-4 rounded-full" />
        </div>

        {/* Première ligne avec 2 cartes plus grandes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <FeaturedToolCard
            index={0}
            isLoaded={isLoaded}
            title="Générateur de séquences"
            description="Créez des séquences pédagogiques complètes avec objectifs, activités et évaluations. Adaptez vos séquences selon le niveau et les compétences visées."
            icon={<Wand2 size={24} className="text-white" />}
            imagePath="/images/generateur-de-sequences.png"
            gradient="from-indigo-500/80 to-blue-600/80"
          />
          <FeaturedToolCard
            index={1}
            isLoaded={isLoaded}
            title="Générateur d'exercices"
            description="Générez des exercices adaptés à vos besoins pédagogiques. Personnalisez le niveau de difficulté, le format et les compétences travaillées."
            icon={<FileText size={24} className="text-white" />}
            imagePath="/images/generateur-exercices.png"
            gradient="from-rose-500/80 to-pink-600/80"
          />
        </div>

        {/* Deuxième ligne avec 3 cartes plus petites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ToolCard
            index={2}
            isLoaded={isLoaded}
            title="Assistant administratif"
            description="Aide pour les tâches administratives et la gestion de classe. Simplifiez votre organisation quotidienne."
            icon={<BookOpen size={24} className="text-white" />}
            imagePath="/images/assistant-administratif.png"
            gradient="from-orange-500/80 to-red-600/80"
          />
          <ToolCard
            index={3}
            isLoaded={isLoaded}
            title="Générateur d'images"
            description="Créez des images pour vos supports pédagogiques. Illustrations, schémas et visuels adaptés à vos besoins."
            icon={<ImageIcon size={24} className="text-white" />}
            imagePath="/images/generateur-images.png"
            gradient="from-emerald-500/80 to-teal-600/80"
          />
          <ToolCard
            index={4}
            isLoaded={isLoaded}
            title="Plan de classe"
            description="Organisez votre salle de classe de manière optimale. Créez des plans adaptés à vos activités pédagogiques."
            icon={<LayoutGrid size={24} className="text-white" />}
            imagePath="/images/plan-de-classe.png"
            isNew
            gradient="from-amber-500/80 to-yellow-600/80"
          />
        </div>

        {/* Troisième ligne avec la carte de demande de fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ToolCard
            index={5}
            isLoaded={isLoaded}
            title="Demander des fonctionnalités"
            description="Suggérez de nouvelles fonctionnalités pour PedagoIA. Partagez vos idées pour améliorer la plateforme."
            icon={<MessageCircleQuestion size={24} className="text-white" />}
            imagePath="/images/demander-fonctionnalites.png"
            buttonText="Suggérer"
            gradient="from-blue-400/80 to-cyan-500/80"
          />
        </div>
      </div>
    </div>
  );
}

type CardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  imagePath: string;
  isNew?: boolean;
  buttonText?: string;
  gradient: string;
  index: number;
  isLoaded: boolean;
};

function FeaturedToolCard({ title, description, icon, imagePath, isNew, gradient, index, isLoaded }: CardProps) {
  return (
    <Card
      className={cn(
        "bg-white border-0 overflow-hidden transition-all duration-700 ease-out opacity-0 translate-y-4 shadow-lg hover:shadow-xl group rounded-xl h-full transform",
        isLoaded && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="h-64 relative">
        <img src={imagePath} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} mix-blend-multiply`} />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <h3 className="text-2xl font-bold mb-2 group-hover:translate-y-0 translate-y-2 transition-transform duration-300">{title}</h3>
          <div className="w-12 h-0.5 bg-white/70 mb-3 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          <p className="text-sm text-white/90 line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{description}</p>
        </div>
        {isNew && (
          <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-blue-800 shadow-md">Nouveau</div>
        )}
      </div>
      <CardContent className="p-6 flex justify-center">
        <Button variant="default" size="icon" className="rounded-full w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md group-hover:shadow-lg transition-all duration-300">
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ToolCard({ title, description, icon, imagePath, isNew, buttonText, gradient, index, isLoaded }: CardProps) {
  return (
    <Card
      className={cn(
        "bg-white border-0 overflow-hidden transition-all duration-700 ease-out opacity-0 translate-y-4 shadow-md hover:shadow-lg group rounded-xl h-full",
        isLoaded && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="h-44 relative">
        <img src={imagePath} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} mix-blend-multiply`} />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex justify-between items-start">
            <div className="relative z-10 text-white opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all bg-white/20 backdrop-blur-sm p-3 rounded-full">{icon}</div>
            {isNew && (
              <div className="bg-white/90 px-2 py-0.5 rounded-full text-xs font-semibold text-blue-800 shadow-sm flex items-center gap-1">
                <Sparkles size={12} /><span>Nouveau</span>
              </div>
            )}
          </div>
          <div className="text-white">
            <h3 className="text-xl font-bold group-hover:translate-y-0 translate-y-1 transition-transform duration-300">{title}</h3>
            <p className="text-sm text-white/90 mt-2 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{description}</p>
          </div>
        </div>
      </div>
      <CardContent className="p-5 flex justify-center">
        {buttonText ? (
          <Button variant="outline" className="w-full border border-gray-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 group-hover:bg-blue-50 transition-all duration-300">
            <span className="mr-auto">{buttonText}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : (
          <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border border-gray-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-gray-200 transition-all duration-300">
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 

import { Shield, Clock, RefreshCw } from "lucide-react";

export const FeatureHighlights = () => {
  return (
    <div className="max-w-4xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="mx-auto w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-5">
          <Shield className="w-7 h-7 text-blue-500" />
        </div>
        <h3 className="font-bold text-lg mb-3">Essai gratuit de 3 jours</h3>
        <p className="text-sm text-muted-foreground">Testez toutes les fonctionnalités sans engagement</p>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="mx-auto w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-5">
          <Clock className="w-7 h-7 text-green-500" />
        </div>
        <h3 className="font-bold text-lg mb-3">Économisez du temps</h3>
        <p className="text-sm text-muted-foreground">Plus de 14h par semaine grâce à nos outils IA</p>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="mx-auto w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-5">
          <RefreshCw className="w-7 h-7 text-indigo-500" />
        </div>
        <h3 className="font-bold text-lg mb-3">Mises à jour régulières</h3>
        <p className="text-sm text-muted-foreground">Bénéficiez des dernières innovations pédagogiques en IA</p>
      </div>
    </div>
  );
};
